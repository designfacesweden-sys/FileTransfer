import type { FastifyReply, FastifyRequest } from 'fastify';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { verifyDatabaseConnection } from './db/index.js';
import { authRoutes } from './routes/auth.js';
import { downloadRoutes } from './routes/downloads.js';
import { supportRoutes } from './routes/support.js';
import { transferRoutes } from './routes/transfers.js';
import { tusServer } from './tus/index.js';

const app = Fastify({ logger: true, bodyLimit: 52 * 1024 * 1024 * 1024 });

app.addContentTypeParser('application/offset+octet-stream', (_req, _payload, done) => {
  done(null);
});

const corsOrigins =
	config.corsOrigins.length > 0
		? config.corsOrigins
		: [config.webPublicUrl, 'http://localhost:5173', 'http://localhost:5174'];

const tusCorsHeaders = [
	'Authorization',
	'Content-Type',
	'Upload-Length',
	'Upload-Offset',
	'Tus-Resumable',
	'Upload-Metadata',
	'X-Requested-With'
];

function applyTusCors(req: FastifyRequest, reply: FastifyReply) {
	const origin = req.headers.origin;
	if (typeof origin === 'string' && corsOrigins.includes(origin)) {
		reply.raw.setHeader('Access-Control-Allow-Origin', origin);
		reply.raw.setHeader('Access-Control-Allow-Credentials', 'true');
	}
	reply.raw.setHeader(
		'Access-Control-Allow-Methods',
		'GET, HEAD, POST, PATCH, DELETE, OPTIONS'
	);
	reply.raw.setHeader('Access-Control-Allow-Headers', tusCorsHeaders.join(', '));
	reply.raw.setHeader(
		'Access-Control-Expose-Headers',
		'Location, Upload-Offset, Upload-Length, Tus-Resumable'
	);
}

function handleTus(req: FastifyRequest, reply: FastifyReply) {
	applyTusCors(req, reply);
	if (req.method === 'OPTIONS') {
		void reply.status(204).send();
		return;
	}
	reply.hijack();
	tusServer.handle(req.raw, reply.raw);
}

await app.register(cors, {
	origin: corsOrigins,
	credentials: true,
	methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: tusCorsHeaders,
	exposedHeaders: ['Location', 'Upload-Offset', 'Upload-Length', 'Tus-Resumable']
});

await app.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
});

await transferRoutes(app);
await downloadRoutes(app);
await supportRoutes(app);
await authRoutes(app);

app.get('/health', async () => ({ ok: true }));

app.all('/api/uploads', handleTus);
app.all('/api/uploads/*', handleTus);

try {
  await verifyDatabaseConnection();
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error('[db] Cannot connect to PostgreSQL:', message);
  if (message.includes('ENOTFOUND') && config.databaseUrl.includes('supabase')) {
    console.error(
      '[db] Fix: set SUPABASE_REGION in apps/api/.env (Project Settings → General), ' +
        'or use the Session pooler URI from Supabase → Database → Connection string.'
    );
  }
  process.exit(1);
}

app.listen({ port: config.port, host: '0.0.0.0' }).then(() => {
  console.log(`API listening on ${config.apiPublicUrl}`);
  console.log(`Storage driver: ${config.storageDriver}`);
  console.log(`Database driver: ${config.databaseDriver}`);
});
