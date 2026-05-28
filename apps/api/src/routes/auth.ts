import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { PlanId } from '@filetransfer/shared';
import { pool } from '../db/index.js';

const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).optional()
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128)
});

const updateProfileSchema = z.object({
  name: z.string().min(1).max(120)
});

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  plan: string;
}

const PLAN_IDS: PlanId[] = ['free', 'standard', 'enterprise'];

function normalizePlan(plan: string): PlanId {
  return PLAN_IDS.includes(plan as PlanId) ? (plan as PlanId) : 'free';
}

function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    plan: normalizePlan(row.plan)
  };
}

export async function authRoutes(app: FastifyInstance) {
  const authRateLimit = {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '15 minutes'
      }
    }
  };

  app.post('/api/auth/register', authRateLimit, async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Ogiltiga uppgifter', details: parsed.error.flatten() });
    }

    const { email, password, name } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      const result = await pool.query<UserRow>(
        `INSERT INTO users (email, password_hash, name)
         VALUES ($1, $2, $3)
         RETURNING id, email, name, plan`,
        [normalizedEmail, passwordHash, name?.trim() ?? null]
      );

      return reply.status(201).send(toPublicUser(result.rows[0]));
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && err.code === '23505') {
        return reply.status(409).send({ error: 'E-postadressen används redan' });
      }
      throw err;
    }
  });

  app.post('/api/auth/login', authRateLimit, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Ogiltiga uppgifter' });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    const result = await pool.query<UserRow & { password_hash: string }>(
      `SELECT id, email, name, plan, password_hash FROM users WHERE email = $1`,
      [normalizedEmail]
    );

    const row = result.rows[0];
    if (!row) {
      return reply.status(401).send({ error: 'Ogiltig e-post eller lösenord' });
    }

    const valid = await bcrypt.compare(password, row.password_hash);
    if (!valid) {
      return reply.status(401).send({ error: 'Ogiltig e-post eller lösenord' });
    }

    return toPublicUser(row);
  });

  app.get<{ Params: { userId: string } }>('/api/auth/me/:userId', async (request, reply) => {
    const { userId } = request.params;

    const result = await pool.query<UserRow>(
      `SELECT id, email, name, plan FROM users WHERE id = $1`,
      [userId]
    );

    const row = result.rows[0];
    if (!row) {
      return reply.status(404).send({ error: 'Användaren hittades inte' });
    }

    return toPublicUser(row);
  });

  app.patch<{ Params: { userId: string } }>('/api/auth/profile/:userId', async (request, reply) => {
    const parsed = updateProfileSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Ogiltiga uppgifter', details: parsed.error.flatten() });
    }

    const { userId } = request.params;
    const name = parsed.data.name.trim();

    const result = await pool.query<UserRow>(
      `UPDATE users SET name = $1 WHERE id = $2 RETURNING id, email, name, plan`,
      [name, userId]
    );

    const row = result.rows[0];
    if (!row) {
      return reply.status(404).send({ error: 'Användaren hittades inte' });
    }

    return toPublicUser(row);
  });
}
