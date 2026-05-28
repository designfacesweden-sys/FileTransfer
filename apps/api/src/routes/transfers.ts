import type { FastifyInstance } from 'fastify';
import {
  PLANS,
  isExpiryAllowedForPlan,
  type CreateTransferRequest,
  type CreateTransferResponse
} from '@filetransfer/shared';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import { config } from '../config.js';
import { pool } from '../db/index.js';
import {
  notifyTransferRecipient,
  notifyTransferSenderCopy
} from '../services/transfer-notify.js';

const createSchema = z.object({
  title: z.string().max(200).optional(),
  message: z.string().max(2000).optional(),
  recipientEmail: z.string().email().optional(),
  senderEmail: z.string().email().optional(),
  expiryDays: z.number().int().min(1).max(7).optional(),
  expirySeconds: z.number().int().min(86400).max(7 * 86400).optional(),
  password: z.string().min(4).max(128).optional(),
  plan: z.enum(['free', 'standard', 'enterprise']).default('free')
});

export async function transferRoutes(app: FastifyInstance) {
  app.post<{ Body: CreateTransferRequest }>('/api/transfers', async (request, reply) => {
    const parsed = createSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Ogiltig begäran', details: parsed.error.flatten() });
    }

    const { title, message, recipientEmail, senderEmail, expiryDays, expirySeconds, password, plan } =
      parsed.data;
    const planConfig = PLANS[plan];

    if (password && !planConfig.passwordProtection) {
      return reply.status(403).send({ error: 'Lösenordsskydd kräver Standard eller Enterprise' });
    }

    const resolvedExpirySeconds = expirySeconds ?? (expiryDays ?? planConfig.defaultExpiryDays) * 86400;

    if (!isExpiryAllowedForPlan(plan, resolvedExpirySeconds)) {
      return reply.status(403).send({
        error:
          plan === 'free'
            ? 'Gratisplanen tillåter lagring i 1 eller 2 dagar. Uppgradera för 5 eller 7 dagar.'
            : 'Din plan tillåter lagring i 5 eller 7 dagar.'
      });
    }

    const token = nanoid(12);
    const expiresAt = new Date(Date.now() + resolvedExpirySeconds * 1000);
    const passwordHash = password ? await bcrypt.hash(password, 12) : null;

    let result;
    try {
      result = await pool.query<{ id: string }>(
        `INSERT INTO transfers (token, title, message, plan, password_hash, recipient_email, sender_email, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [token, title ?? null, message ?? null, plan, passwordHash, recipientEmail ?? null, senderEmail ?? null, expiresAt]
      );
    } catch (err) {
      request.log.error(err);
      return reply.status(503).send({
        error: 'Databasen är inte tillgänglig. Kontrollera API-loggar och Supabase.'
      });
    }

    const transferId = result.rows[0].id;
    const response: CreateTransferResponse = {
      transferId,
      token,
      uploadUrl: `${config.apiPublicUrl}/api/uploads`,
      expiresAt: expiresAt.toISOString(),
      maxBytes: planConfig.maxBytes
    };

    return reply.status(201).send(response);
  });

  app.get<{ Params: { token: string } }>('/api/transfers/:token', async (request, reply) => {
    const { token } = request.params;
    const password = (request.query as { password?: string }).password;

    const transfer = await pool.query(
      `SELECT id, token, title, message, password_hash, expires_at, download_count
       FROM transfers WHERE token = $1`,
      [token]
    );

    if (transfer.rowCount === 0) {
      return reply.status(404).send({ error: 'Överföringen hittades inte' });
    }

    const row = transfer.rows[0];

    if (new Date(row.expires_at) < new Date()) {
      return reply.status(410).send({ error: 'Överföringen har gått ut' });
    }

    if (row.password_hash) {
      if (!password) {
        return reply.status(401).send({ error: 'Lösenord krävs', requiresPassword: true });
      }
      const valid = await bcrypt.compare(password, row.password_hash);
      if (!valid) {
        return reply.status(403).send({ error: 'Fel lösenord' });
      }
    }

    const files = await pool.query(
      `SELECT id, name, size, mime_type FROM files WHERE transfer_id = $1 ORDER BY created_at`,
      [row.id]
    );

    return {
      token: row.token,
      title: row.title,
      message: row.message,
      expiresAt: row.expires_at,
      downloadCount: row.download_count,
      requiresPassword: Boolean(row.password_hash),
      files: files.rows.map((f) => ({
        id: f.id,
        name: f.name,
        size: Number(f.size),
        mimeType: f.mime_type
      }))
    };
  });

  app.post<{ Params: { token: string } }>(
    '/api/transfers/:token/notify',
    {
      config: {
        rateLimit: {
          max: 10,
          timeWindow: '15 minutes'
        }
      }
    },
    async (request, reply) => {
      const { token } = request.params;

      if (!config.resendApiKey) {
        return reply.status(503).send({
          error: 'E-post är inte konfigurerat. Lägg till RESEND_API_KEY i apps/api/.env.'
        });
      }

      const transfer = await pool.query<{
        token: string;
        title: string | null;
        message: string | null;
        recipient_email: string | null;
        sender_email: string | null;
        expires_at: Date;
        password_hash: string | null;
      }>(
        `SELECT token, title, message, recipient_email, sender_email, expires_at, password_hash
         FROM transfers WHERE token = $1`,
        [token]
      );

      if (transfer.rowCount === 0) {
        return reply.status(404).send({ error: 'Överföringen hittades inte' });
      }

      const row = transfer.rows[0];

      if (!row.recipient_email) {
        return reply.status(400).send({ error: 'Den här överföringen har ingen mottagar-e-post' });
      }

      if (new Date(row.expires_at) < new Date()) {
        return reply.status(410).send({ error: 'Överföringen har gått ut' });
      }

      const files = await pool.query<{ name: string; size: string }>(
        `SELECT name, size FROM files WHERE transfer_id = (
           SELECT id FROM transfers WHERE token = $1
         ) ORDER BY created_at`,
        [token]
      );

      if (files.rowCount === 0) {
        return reply.status(400).send({ error: 'Ladda upp filer innan du skickar e-post' });
      }

      const payload = {
        token: row.token,
        recipientEmail: row.recipient_email,
        senderEmail: row.sender_email,
        downloadUrl: `${config.webPublicUrl}/d/${row.token}`,
        expiresAt: row.expires_at.toISOString(),
        files: files.rows.map((f) => ({ name: f.name, size: Number(f.size) })),
        title: row.title,
        message: row.message,
        passwordProtected: Boolean(row.password_hash)
      };

      try {
        const { sentTo, intendedTo } = await notifyTransferRecipient(payload);
        await notifyTransferSenderCopy(payload).catch((err) => {
          request.log.warn({ err }, 'Sender copy email failed');
        });

        return {
          sent: true,
          to: sentTo,
          intendedTo: intendedTo ?? undefined
        };
      } catch (err) {
        request.log.error({ err }, 'Transfer email failed');
        const message =
          err instanceof Error
            ? err.message
            : 'Kunde inte skicka e-post. Kontrollera RESEND_API_KEY och verifierad avsändardomän i Resend.';
        return reply.status(502).send({ error: message });
      }
    }
  );
}
