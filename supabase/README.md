# Supabase database setup (Keira)

The API expects these PostgreSQL tables:

| Table | Purpose |
|-------|---------|
| `transfers` | Share links, expiry, optional password, emails |
| `files` | Uploaded file metadata (TUS id, R2/local `storage_key`) |
| `users` | Email/password accounts (Auth.js + API) |
| `support_requests` | Support form submissions |

Row Level Security is enabled with **no public policies** so the browser publishable key cannot read app data. The Fastify API connects with the **postgres** database user (bypasses RLS).

## Option A — SQL Editor (no CLI)

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL** → **New query**.
2. Paste the contents of `supabase/migrations/20260519120000_keira_schema.sql`.
3. Click **Run**.

You should see four tables under **Table Editor**.

## Option B — npm script (recommended)

1. In Supabase: **Project Settings** → **Database** → **Connection string** → **URI** (not the pooler URL for first run is fine).
2. Replace `[YOUR-PASSWORD]` with your database password.
3. In `apps/api/.env`:

```env
DATABASE_DRIVER=postgres
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Or run once without editing `.env`:

```bash
SUPABASE_DB_URL="postgresql://postgres:YOUR_PASSWORD@db.shycgxrjmilpzeynlvuf.supabase.co:5432/postgres" npm run db:supabase
```

4. Restart the API: `npm run dev:api`

## Option C — Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref shycgxrjmilpzeynlvuf
npx supabase db push
```

## Optional quickstart table

The `countries` demo table is **not** required for Keira. You can delete `/supabase-demo` on the web app when done testing the Supabase client.

## Verify

```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('transfers', 'files', 'users', 'support_requests');
```
