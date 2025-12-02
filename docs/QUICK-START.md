---
last_updated: 2025-12-02
source_path: docs/QUICK-START.md
---
# Quick Start Guide

Get your Accountant app up and running in 5 minutes.

## Prerequisites

- Node.js 20.x or later
- npm or pnpm
- Supabase account (free tier works)

## Step 1: Install Dependencies

```bash
cd apps/web
npm install
```

✅ **Done!** Dependencies are now installed.

## Step 2: Set Up Supabase

### Option A: Supabase Cloud (Recommended)

1. **Create a Supabase project:**
   - Go to https://supabase.com
   - Click "New Project"
   - Fill in project details
   - Wait for project to be created (~2 minutes)

2. **Get your credentials:**
   - Go to Project Settings → API
   - Copy:
     - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
     - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - service_role key → `SUPABASE_SERVICE_ROLE_KEY`
   - Go to Project Settings → Database
   - Copy Connection String → `DATABASE_URL`

3. **Apply migrations:**
   ```bash
   # Install Supabase CLI (if not already installed)
   npm install -g supabase
   
   # Link your project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Apply migrations
   supabase db push
   ```
   
   Or manually:
   - Go to Supabase Dashboard → SQL Editor
   - Copy and run each file from `supabase/migrations/` in order (0001, 0002, etc.)

### Option B: Local Supabase (Advanced)

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase
supabase start

# Apply migrations
supabase db reset
```

Use the connection details from `supabase status` output.

## Step 3: Configure Environment Variables

1. **Create `.env.local` file:**
   ```bash
   cd apps/web
   cp .env.example .env.local
   ```

2. **Fill in your values:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
   ```

3. **Optional (for full features):**
   ```env
   # KSeF (for e-invoicing)
   KSEF_CERT_PEM_B64=...
   KSEF_KEY_PEM_B64=...
   KSEF_API_URL=https://ksef-api.example.com
   
   # Error tracking
   SENTRY_DSN=your-sentry-dsn
   ```

## Step 4: Start Development Server

```bash
cd apps/web
npm run dev
```

Open http://localhost:3000

## Step 5: Verify Setup

Run the verification script:

```bash
chmod +x scripts/verify-setup.sh
./scripts/verify-setup.sh
```

Or manually test:

```bash
# Health check
curl http://localhost:3000/api/health

# Should return:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

## Next Steps

### For Development

- Read [Environment Setup Guide](ENVIRONMENT.md)
- Check [API Documentation](Technical.md#api-specifications)
- Review [Architecture Overview](Architecture-Overview.md)

### For Deployment

- Read [Deployment Guide](DEPLOYMENT.md)
- Set up Vercel project
- Configure GitHub Actions
- Deploy to production

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
cd apps/web
npm install
```

### "Missing Supabase environment variables"
- Check `.env.local` exists
- Verify all required variables are set
- Restart development server

### "Database connection failed"
- Verify Supabase project is active
- Check `DATABASE_URL` is correct
- Ensure IP allowlist allows your IP (if configured)

### "Migrations failed"
- Run migrations in order (0001, 0002, etc.)
- Check for existing tables (may need to drop first)
- Review error messages in Supabase SQL editor

## Need Help?

- Check [Deployment Readiness Summary](DEPLOYMENT-READINESS-SUMMARY.md)
- Review [Environment Setup Guide](ENVIRONMENT.md)
- Consult [Deployment Guide](DEPLOYMENT.md)

