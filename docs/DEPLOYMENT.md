---
last_updated: 2025-12-02
source_path: docs/DEPLOYMENT.md
---
# Deployment Guide

This guide covers deploying the Accountant SaaS application to production using Vercel + Supabase.

## Prerequisites

- Vercel account with project access
- Supabase project created
- GitHub repository with CI/CD access
- KSeF certificate (qualified certificate for e-invoicing)
- Bank AIS provider credentials (optional for MVP)

## Pre-Deployment Checklist

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Note down your project credentials:
   - Project URL
   - Anon key
   - Service role key
   - Database connection string

3. Apply database migrations:
   ```bash
   # Using Supabase CLI
   supabase db push
   
   # Or manually via Supabase dashboard SQL editor
   # Run all files from supabase/migrations/ in order
   ```

4. Create storage buckets:
   - `documents` - for general document storage
   - `invoices` - for invoice PDFs
   - `expenses` - for expense receipts
   
   These are created automatically by migration `0010_storage.sql`, but verify in Supabase dashboard.

5. Configure Row Level Security (RLS):
   - Verify RLS is enabled on all tables
   - Test that users can only access their company's data

### 2. Environment Variables

Create a `.env.local` file for local development (never commit this):

```bash
# Copy from .env.example and fill in values
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `DATABASE_URL` - PostgreSQL connection string
- `KSEF_CERT_PEM_B64` - Base64 encoded KSeF certificate (PEM format)
- `KSEF_KEY_PEM_B64` - Base64 encoded KSeF private key (PEM format)
- `KSEF_CERT_PASSWORD` - Certificate password (if required)
- `KSEF_API_URL` - KSeF API endpoint URL
- `KSEF_API_SEND_PATH` - KSeF send endpoint path (default: `/invoices`)

Optional variables:
- `AIS_PROVIDER_KEYS` - JSON string with bank AIS provider credentials
- `EMAIL_PROVIDER_KEYS` - JSON string with email provider credentials
- `JOB_FAIL_THRESHOLD` - Job failure threshold (default: 0.2)
- `SENTRY_DSN` - Sentry error tracking DSN
- `SENTRY_ENVIRONMENT` - Environment name (development/staging/production)

### 3. Vercel Setup

1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. Link your project:
   ```bash
   cd apps/web
   vercel link
   ```

3. Set environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.example`
   - Set different values for Production, Preview, and Development environments

4. Configure build settings:
   - Root Directory: `apps/web`
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

5. Configure Vercel Cron:
   - The cron job for KSeF batch processing is configured in `vercel.json`
   - Verify it's active in Vercel dashboard under Cron Jobs
   - Default schedule: every 15 minutes

### 4. GitHub Actions Setup

1. Add GitHub secrets (Settings → Secrets and variables → Actions):
   - `VERCEL_TOKEN` - Vercel API token
   - `VERCEL_ORG_ID` - Vercel organization ID
   - `VERCEL_PROJECT_ID` - Vercel project ID
   - `NEXT_PUBLIC_SUPABASE_URL` - For build-time checks
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For build-time checks

2. Verify workflow file exists: `.github/workflows/ci.yml`

### 5. KSeF Certificate Setup

1. Obtain qualified certificate for KSeF from a trusted CA
2. Convert certificate to PEM format:
   ```bash
   # If you have a .p12 file:
   openssl pkcs12 -in certificate.p12 -out cert.pem -clcerts -nokeys
   openssl pkcs12 -in certificate.p12 -out key.pem -nocerts -nodes
   ```

3. Base64 encode the files:
   ```bash
   base64 -i cert.pem > cert.pem.b64
   base64 -i key.pem > key.pem.b64
   ```

4. Set environment variables:
   - `KSEF_CERT_PEM_B64` - Contents of cert.pem.b64
   - `KSEF_KEY_PEM_B64` - Contents of key.pem.b64
   - `KSEF_CERT_PASSWORD` - Password if certificate is password-protected

## Deployment Steps

### Initial Deployment

1. **Push code to main branch:**
   ```bash
   git push origin main
   ```

2. **Deploy to Vercel:**
   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Verify deployment:**
   - Check Vercel dashboard for deployment status
   - Visit your production URL
   - Test health endpoint: `https://your-app.vercel.app/api/health`

### Continuous Deployment

Once GitHub Actions is configured:
- Every push to `main` automatically deploys to production
- Pull requests create preview deployments
- All deployments run linting and type checking first

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health

# Expected response:
# {"status":"healthy","database":"connected","timestamp":"..."}
```

### 2. Database Connection

1. Log into Supabase dashboard
2. Check that tables exist and have data
3. Verify RLS policies are active

### 3. KSeF Integration

1. Test KSeF batch job:
   ```bash
   curl -X POST https://your-app.vercel.app/api/jobs/ksef-batch
   ```

2. Check job status:
   ```bash
   curl https://your-app.vercel.app/api/jobs/ksef-batch
   ```

3. Verify in Supabase:
   - Check `job_metrics` table for job execution
   - Check `ksef_submissions` table for submission status

### 4. API Endpoints

Test key endpoints:
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice
- `GET /api/expenses` - List expenses
- `GET /api/vat/registers?month=2025-01` - VAT registers

### 5. Error Tracking

If Sentry is configured:
1. Trigger a test error
2. Verify it appears in Sentry dashboard
3. Check error context and stack traces

## Monitoring

### Vercel Analytics

- Enable Vercel Analytics in project settings
- Monitor:
  - Page views and performance
  - API route execution times
  - Error rates

### Supabase Monitoring

- Monitor database performance in Supabase dashboard
- Check connection pool usage
- Review slow queries

### Application Metrics

- Check `job_metrics` table for background job performance
- Monitor `alerts` table for threshold breaches
- Review error logs in Vercel dashboard

## Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Check TypeScript errors: `npm run build` locally
4. Verify dependencies are installed correctly

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check Supabase project is active
3. Verify IP allowlist (if configured)
4. Check connection pool limits

### KSeF Job Failures

1. Check job metrics: `SELECT * FROM job_metrics ORDER BY created_at DESC LIMIT 10;`
2. Review alerts: `SELECT * FROM alerts ORDER BY created_at DESC LIMIT 10;`
3. Verify certificate is valid and not expired
4. Check KSeF API status
5. Review error messages in `ksef_submissions.error_message`

### API Errors

1. Check Vercel function logs
2. Review error responses for details
3. Verify authentication is working
4. Check rate limiting isn't blocking requests

## Rollback Procedure

If deployment fails:

1. **Vercel Rollback:**
   - Go to Vercel dashboard → Deployments
   - Find last successful deployment
   - Click "Promote to Production"

2. **Database Rollback:**
   - If migrations caused issues, create corrective migration
   - Never delete migrations, always add new ones to fix

3. **Environment Variable Rollback:**
   - Revert changes in Vercel dashboard
   - Redeploy to apply changes

## Security Checklist

- [ ] All environment variables are set and secure
- [ ] RLS policies are enabled and tested
- [ ] API routes have authentication middleware
- [ ] Rate limiting is configured
- [ ] Security headers are enabled (configured in `next.config.js`)
- [ ] KSeF certificate is stored securely (base64 env var, never logged)
- [ ] Database backups are enabled in Supabase
- [ ] Error tracking doesn't log sensitive data

## Performance Optimization

- Enable Vercel Edge Caching for static assets
- Configure CDN for Supabase Storage
- Monitor API route execution times
- Optimize database queries (add indexes if needed)
- Use Supabase connection pooling

## Support

For issues or questions:
1. Check application logs in Vercel dashboard
2. Review Supabase logs
3. Check GitHub Issues
4. Contact development team

