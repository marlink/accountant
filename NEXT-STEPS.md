# ✅ Supabase Configuration - Next Steps

## What's Done

✅ `.env.local` file created with:
- `NEXT_PUBLIC_SUPABASE_URL` 
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## ⚠️ Still Needed

You need to add these two variables to `apps/web/.env.local`:

1. **SUPABASE_SERVICE_ROLE_KEY** - Get from Supabase Dashboard
2. **DATABASE_URL** - Get from Supabase Dashboard

### How to Get Them

1. Go to: https://supabase.com/dashboard/project/ltxtdeiefjefpluaucgz/settings/api
2. Copy the **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`
3. Go to: https://supabase.com/dashboard/project/ltxtdeiefjefpluaucgz/settings/database
4. Copy the **Connection string** → `DATABASE_URL` (replace `[YOUR-PASSWORD]` with your actual password)

### Add to .env.local

Open `apps/web/.env.local` and add:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your service role key)
DATABASE_URL=postgresql://postgres:your-password@db.ltxtdeiefjefpluaucgz.supabase.co:5432/postgres
```

## 🔄 Restart Dev Server

**Important:** After updating `.env.local`, you MUST restart the dev server:

1. Stop the current server (press `Ctrl+C` in the terminal running `npm run dev`)
2. Restart it:
   ```bash
   cd apps/web
   npm run dev
   ```

## ✅ Verify It Works

After restarting, test the health endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-12-02T..."
}
```

## 📋 Apply Database Migrations

Before the health check will fully work, you need to apply migrations:

1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file from `supabase/migrations/` in order:
   - 0001_init.sql
   - 0002_rls.sql
   - 0003_ksef_retry.sql
   - 0004_alerts.sql
   - 0005_views_dashboard.sql
   - 0006_invoice_items_parties.sql
   - 0007_idempotency.sql
   - 0008_cost_categories.sql
   - 0009_invitations.sql
   - 0010_storage.sql

Or use Supabase CLI:
```bash
npm install -g supabase
supabase link --project-ref ltxtdeiefjefpluaucgz
supabase db push
```

## Current Status

- ✅ Dev server running
- ✅ `.env.local` created with URL and anon key
- ⚠️ Need service role key
- ⚠️ Need database URL
- ⚠️ Need to restart server after adding credentials
- ⚠️ Need to apply database migrations

