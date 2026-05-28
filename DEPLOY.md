# Deploy Keira to production

This guide sets up **PostgreSQL**, **Redis**, the **API**, the **web app**, and **HTTPS** (via Caddy) on a single server using Docker.

## What you need

| Item | Notes |
|------|--------|
| **VPS** | 2 GB+ RAM (Hetzner, DigitalOcean, Linode, etc.) |
| **Domain** | e.g. `keira.com` |
| **DNS** | `A` record → server IP for `@` and `api` |
| **Docker** | [Install Docker](https://docs.docker.com/engine/install/) on the server |
| **Google OAuth** | Web client with production redirect URI |

## 1. Provision secrets (on your machine or server)

From the repo root:

```bash
# Optional: set your domain before generating
DOMAIN=keira.com npm run provision
```

This creates `.env.production` with:

- PostgreSQL user `keira`, random password, database `keira`
- `JWT_SECRET` and `AUTH_SECRET`
- URLs derived from `DOMAIN`

**Edit `.env.production` before deploying:**

- `DOMAIN`, `ACME_EMAIL`
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- Optional: Cloudflare R2 keys and `STORAGE_DRIVER=r2`

## 2. Google OAuth (production)

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth Web client
2. **Authorized JavaScript origins:** `https://yourdomain.com`
3. **Authorized redirect URIs:** `https://yourdomain.com/auth/callback/google`
4. Copy Client ID and Secret into `.env.production`

## 3. DNS

Point both hostnames to your server’s public IP:

| Host | Type | Value |
|------|------|--------|
| `@` or `www` | A | `YOUR_SERVER_IP` |
| `api` | A | `YOUR_SERVER_IP` |

If you use `www`, add `www.yourdomain.com` to Caddy or redirect in DNS.

## 4. Deploy on the server

```bash
git clone <your-repo> keira
cd keira
cp .env.production /path/on/server/.env.production   # or run provision on server

npm run docker:prod:up
```

First run builds images and starts:

- **postgres** — database (persistent volume)
- **redis** — cache / rate limits
- **api** — Fastify + TUS on port 3001 (internal)
- **web** — SvelteKit on port 3000 (internal)
- **caddy** — HTTPS on 80/443, proxies to web + API

Check logs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production logs -f
```

Health check: `https://api.yourdomain.com/health` → `{"ok":true}`

## 5. Firewall

Open only:

- `22` (SSH)
- `80`, `443` (HTTP/HTTPS)

Do **not** expose Postgres (5432) or Redis (6379) publicly.

## Architecture

```
Internet
    │
    ▼
 Caddy :443
    ├── yourdomain.com      → web:3000   (SvelteKit + Google auth)
    └── api.yourdomain.com  → api:3001   (uploads, transfers, downloads)
              │
              ├── postgres:5432
              ├── redis:6379
              └── volume: uploads (local) or R2 (recommended at scale)
```

## Storage at scale

Default production uses **local disk** (`STORAGE_DRIVER=local`) in a Docker volume.

For production traffic, use **Cloudflare R2**:

1. Create R2 bucket + API token
2. Set `R2_*` variables in `.env.production`
3. Set `STORAGE_DRIVER=r2`
4. Redeploy: `npm run docker:prod:up`

## Useful commands

```bash
# Start / rebuild
npm run docker:prod:up

# Stop
npm run docker:prod:down

# Run DB migrations only (if schema changed)
docker compose -f docker-compose.prod.yml --env-file .env.production exec api node dist/db/migrate.js

# Postgres shell
docker compose -f docker-compose.prod.yml --env-file .env.production exec postgres \
  psql -U keira -d keira
```

## Alternative: split hosting

| Service | Suggestion |
|---------|------------|
| Web | Vercel / Netlify (set env vars, build `apps/web`) |
| API | Railway / Fly.io / Render |
| DB | Neon, Supabase, or Railway Postgres |

Set `PUBLIC_API_URL`, `API_PUBLIC_URL`, `WEB_PUBLIC_URL`, and `CORS_ORIGINS` to match your URLs. Use `DATABASE_DRIVER=postgres` and a hosted `DATABASE_URL`.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Google login fails | Check `AUTH_URL`, redirect URI, and `AUTH_TRUST_HOST=true` |
| Upload CORS error | `CORS_ORIGINS` must include exact web URL (https, no trailing slash) |
| Certificate error | DNS must point to server before Caddy can issue Let's Encrypt |
| API can’t reach DB | Wait for postgres healthcheck; check `DATABASE_URL` password |
