# Keira — Privacy-first file transfer

A modern Scandinavian-style file transfer platform (WeTransfer / Sprend competitor) with resumable uploads, expiring links, and EU privacy positioning.

## Architecture

```
apps/web          SvelteKit + Tailwind + tus-js-client
apps/api          Fastify + TUS + PostgreSQL + R2/local storage
packages/shared   Plan limits, shared TypeScript types
```

| Layer | Technology |
|-------|------------|
| Uploads | [TUS protocol](https://tus.io) — resumable, chunked |
| Storage | Local filesystem (dev) or Cloudflare R2 (prod) |
| Database | PostgreSQL |
| Cache / rate limits | Redis (docker-compose; rate limit in API) |

## MVP features (Phase 1)

- [x] Create transfer + share token
- [x] Resumable TUS uploads (retry, resume)
- [x] Public download page `/d/:token`
- [x] Signed / proxied downloads with expiry
- [x] Free plan limits (2 GB, 7-day expiry)
- [ ] Email notifications (recipient/sender)
- [ ] Stripe billing + Pro plan enforcement
- [ ] Expired transfer cleanup job

## Quick start

### 1. Infrastructure

```bash
docker compose up -d
```

### 2. Environment

```bash
cp .env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### 3. Install & migrate

```bash
npm install
npm run db:migrate
```

### 4. Run

```bash
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev:web
```

- Web: http://localhost:5173
- API: http://localhost:3001

### Production deploy

See **[DEPLOY.md](./DEPLOY.md)** for Docker-based publishing (Postgres, Redis, API, web, HTTPS).

Quick start:

```bash
DOMAIN=yourdomain.com npm run provision   # creates .env.production
# Edit .env.production (Google OAuth, email)
npm run docker:prod:up                      # requires Docker on server
```

### Google sign-in (web)

1. Create an OAuth 2.0 **Web client** in [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Add authorized redirect URI: `http://localhost:5173/auth/callback/google`
3. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` in `apps/web/.env` (see `apps/web/.env.example`).
4. Set `AUTH_SECRET` to a random 32+ character string (`openssl rand -hex 32`).

## Production checklist

1. Set `STORAGE_DRIVER=r2` and Cloudflare R2 credentials
2. Deploy API (Fly.io, Railway, or Docker)
3. Deploy web to Vercel with `PUBLIC_API_URL`
4. Configure Google OAuth redirect for production URL; add Stripe, email (Resend/Postmark)
5. Cron: delete expired transfers + storage objects
6. Malware scanning (ClamAV or cloud API) before download

## Roadmap

| Phase | Focus |
|-------|--------|
| **1 — MVP** | Upload, links, downloads, expiry |
| **2 — Reliability** | Queues, analytics, upload monitoring |
| **3 — B2B** | Teams, branding, invoices, admin |

## Brand positioning

Compete on **UX + trust**, not storage volume:

- EU / Swedish hosting narrative
- GDPR-first, ad-free experience
- Media professionals, agencies, municipalities
- Apple-like simplicity + branded download pages

Working name: **Keira**.

## Cost notes

- Storage (R2): cheap
- **Bandwidth** is the main scaling cost — enforce quotas and expiry
- Early stage: ~$10–50/mo at low traffic with R2 + small VPS
