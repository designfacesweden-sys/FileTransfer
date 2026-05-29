# Deploy: Firebase (web) + Render (API)

Architecture:

```
keira.se          → Firebase Hosting (static SPA, Spark/free)
api.keira.se      → Render Web Service (@filetransfer/api)
Database          → Supabase Postgres (used by API only)
```

No second app host.

**Default deploy uses Firebase Spark (free)** — static files only, **no Blaze billing**.

```bash
# Set production API URL, then deploy
PUBLIC_API_URL=https://YOUR-SERVICE.onrender.com npm run build:firebase -w web
npm run deploy:firebase
```

Or one command: `npm run deploy:firebase` (reads `apps/web/.env.production` if present).

---

## 1. Render — API only

**Service:** Web Service, Node  
**Root directory:** (repo root)  
**Build:** `npm install && npm run build -w @filetransfer/api`  
**Start:** `npm run start -w @filetransfer/api`

**Env vars (Render dashboard):**

| Variable | Example |
|----------|---------|
| `NODE_ENV` | `production` |
| `DATABASE_DRIVER` | `postgres` |
| `DATABASE_URL` | Supabase **Session pooler** URI (`postgresql://postgres.[ref]:[password]@aws-0-eu-north-1.pooler.supabase.com:5432/postgres`) — **not** `https://….supabase.co` |
| `SUPABASE_REGION` | e.g. `eu-north-1` (only if you use direct `db.*.supabase.co` URL instead of pooler) |
| `API_PUBLIC_URL` | `https://api.keira.se` (or `https://your-service.onrender.com`) |
| `WEB_PUBLIC_URL` | `https://keira.se` |
| `CORS_ORIGINS` | `https://keira.se` |
| `JWT_SECRET` | long random secret |
| `STORAGE_DRIVER` | `local` or `r2` |

Point `api.keira.se` (or your Render URL) in DNS to Render.

**Render troubleshooting**

- **502 / `no-deploy`:** Build failed or service never started — open **Logs** on Render.
- **`[db] Cannot connect`:** Wrong `DATABASE_URL`. Use pooler URI from Supabase → Database.
- **Health times out:** API must listen on Render’s `PORT` (fixed in code; redeploy after pull).
- **`/health` returns `db: disconnected`:** Service is up but Postgres env is wrong; fix `DATABASE_URL` and redeploy.

---

## 2. Firebase — frontend only

**Project:** `keira-581e4`  
**Deploy:** `npm run deploy:firebase`

**One-time (Firebase project):**

1. Custom domain: [Hosting → Add `keira.se`](https://console.firebase.google.com/project/keira-581e4/hosting)

**Spark limitations:** no server-side Auth.js on Firebase. Login/session runs in the browser and talks to your Render API. For full SSR auth on Firebase you would need Blaze (`npm run deploy:firebase:ssr`).

**Build env** (Firebase Hosting env vars or `apps/web/.env.production` before deploy):

| Variable | Value |
|----------|--------|
| `PUBLIC_API_URL` | Your Render API URL (e.g. `https://keira-api.onrender.com`) — **not** `keira.se` |
| `PUBLIC_CLIENT_AUTH` | `true` (required for static Firebase) |
| `AUTH_SECRET` | same as used in production auth |
| `AUTH_TRUST_HOST` | `true` |
| `PUBLIC_SUPABASE_URL` | Supabase project URL |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | publishable key only |

Google OAuth redirect URI: `https://keira.se/auth/callback/google`

---

## 3. Connect the two

- Web calls API via `PUBLIC_API_URL` (browser + server).
- API allows web origin in `CORS_ORIGINS`.
- API `WEB_PUBLIC_URL` must match `https://keira.se`.

---

## Local dev

```bash
npm run dev:api    # localhost:3001
npm run dev:web    # localhost:5173
```

`apps/web/.env`: `PUBLIC_API_URL=http://localhost:3001`
