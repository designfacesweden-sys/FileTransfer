import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { pool } from '../db/index.js';
import { notifySupportTeam } from '../services/support-notify.js';

const supportSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(254),
  category: z.enum(['general', 'billing', 'technical', 'enterprise']),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(5000)
});

export async function supportRoutes(app: FastifyInstance) {
  app.post(
    '/api/support',
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: '15 minutes'
        }
      }
    },
    async (request, reply) => {
      const parsed = supportSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: 'Ogiltig begäran', details: parsed.error.flatten() });
      }

      const { name, email, category, subject, message } = parsed.data;

      const result = await pool.query<{ id: string; created_at: Date }>(
        `INSERT INTO support_requests (name, email, category, subject, message)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, created_at`,
        [name, email, category, subject, message]
      );

      const row = result.rows[0];

      try {
        await notifySupportTeam({
          id: row.id,
          name,
          email,
          category,
          subject,
          message,
          createdAt: row.created_at.toISOString()
        });
      } catch (err) {
        request.log.error({ err }, 'Support notification failed');
      }

      return reply.status(201).send({
        id: row.id,
        message: 'Din supportförfrågan är mottagen. Vi återkommer så snart vi kan.'
      });
    }
  );
}
