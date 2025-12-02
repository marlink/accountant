# Supabase Configuration Status

## Current Status

### ✅ Dev Server Running
- Server is running on http://localhost:3000
- Main page loads successfully
- API routes are accessible

### ❌ Supabase Configuration Missing
The application requires Supabase environment variables to function properly.

## Error Detected

When accessing API endpoints (like `/api/health`), you'll see:
```
Error: Missing Supabase environment variables: 
NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required
```

## Required Configuration

### Step 1: Create `.env.local` File

```bash
cd apps/web
cp .env.example .env.local
```

### Step 2: Get Supabase Credentials

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select or create a project**
3. **Get your credentials**:
   - Go to **Project Settings** → **API**
   - Copy:
     - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
     - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`
   - Go to **Project Settings** → **Database**
   - Copy **Connection String** → `DATABASE_URL`

### Step 3: Fill in `.env.local`

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Apply Database Migrations

**Option A: Using Supabase CLI**
```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

**Option B: Manual (via Supabase Dashboard)**
1. Go to **SQL Editor** in Supabase Dashboard
2. Run each migration file from `supabase/migrations/` in order:
   - `0001_init.sql`
   - `0002_rls.sql`
   - `0003_ksef_retry.sql`
   - `0004_alerts.sql`
   - `0005_views_dashboard.sql`
   - `0006_invoice_items_parties.sql`
   - `0007_idempotency.sql`
   - `0008_cost_categories.sql`
   - `0009_invitations.sql`
   - `0010_storage.sql`

### Step 5: Restart Dev Server

After creating `.env.local`, restart the dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd apps/web
npm run dev
```

### Step 6: Verify Configuration

Test the health endpoint:
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

## Supabase Client Configuration

The Supabase client is configured in:
- `apps/web/lib/supabase/client.ts` - Browser and server clients
- `apps/web/lib/supabase/middleware.ts` - Authentication middleware
- `apps/web/lib/supabase/server.ts` - Server component utilities

### Required Environment Variables

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) | Project Settings → API |
| `DATABASE_URL` | PostgreSQL connection string | Project Settings → Database |

### Optional Environment Variables

- `KSEF_CERT_PEM_B64` - KSeF certificate (for e-invoicing)
- `KSEF_KEY_PEM_B64` - KSeF private key
- `KSEF_API_URL` - KSeF API endpoint
- `AIS_PROVIDER_KEYS` - Bank AIS provider credentials
- `SENTRY_DSN` - Error tracking (optional)

## Troubleshooting

### "Missing Supabase environment variables"
- ✅ Check `.env.local` exists in `apps/web/`
- ✅ Verify all required variables are set
- ✅ Restart dev server after creating/updating `.env.local`

### "Database connection failed"
- ✅ Verify `DATABASE_URL` is correct
- ✅ Check Supabase project is active
- ✅ Ensure IP allowlist allows your IP (if configured)

### "Table does not exist"
- ✅ Apply database migrations
- ✅ Check migrations ran successfully in Supabase SQL Editor
- ✅ Verify RLS policies are enabled

## Next Steps

Once Supabase is configured:
1. ✅ Test health endpoint: `curl http://localhost:3000/api/health`
2. ✅ Test invoice creation: `POST /api/invoices`
3. ✅ Test expense creation: `POST /api/expenses`
4. ✅ Verify authentication works
5. ✅ Check database queries return data

## Quick Check Script

Run the configuration checker:
```bash
chmod +x scripts/check-supabase-config.sh
./scripts/check-supabase-config.sh
```

