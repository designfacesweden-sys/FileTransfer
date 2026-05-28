import { createReadStream, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { pool } from '../db/index.js';
import { getDownloadUrl } from '../storage/index.js';

export async function downloadRoutes(app: FastifyInstance) {
  app.get<{ Params: { fileId: string }; Querystring: { password?: string } }>(
    '/api/downloads/:fileId',
    async (request, reply) => {
      const { fileId } = request.params;
      const { password } = request.query;

      const result = await pool.query(
        `SELECT f.id, f.name, f.storage_key, t.expires_at, t.password_hash, t.id AS transfer_id
         FROM files f
         JOIN transfers t ON t.id = f.transfer_id
         WHERE f.id = $1`,
        [fileId]
      );

      if (result.rowCount === 0) {
        return reply.status(404).send({ error: 'Filen hittades inte' });
      }

      const file = result.rows[0];

      if (new Date(file.expires_at) < new Date()) {
        return reply.status(410).send({ error: 'Överföringen har gått ut' });
      }

      if (file.password_hash) {
        if (!password) {
          return reply.status(401).send({ error: 'Lösenord krävs' });
        }
        const valid = await bcrypt.compare(password, file.password_hash);
        if (!valid) {
          return reply.status(403).send({ error: 'Fel lösenord' });
        }
      }

      await pool.query(`UPDATE transfers SET download_count = download_count + 1 WHERE id = $1`, [
        file.transfer_id
      ]);

      const url = await getDownloadUrl(file.storage_key, file.name);
      return reply.redirect(url);
    }
  );

  app.get<{ Params: { storageKey: string }; Querystring: { name?: string } }>(
    '/api/files/:storageKey/download',
    async (request, reply) => {
      if (config.storageDriver !== 'local') {
        return reply.status(404).send({ error: 'Hittades inte' });
      }

      const path = join(config.localStoragePath, request.params.storageKey);
      if (!existsSync(path)) {
        return reply.status(404).send({ error: 'Filen hittades inte' });
      }

      const filename = request.query.name ?? request.params.storageKey;
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      return reply.send(createReadStream(path));
    }
  );
}
