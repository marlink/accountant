---
last_updated: 2025-12-02
source_path: docs/Stack.md
---
# Development Stack Documentation

## 1. Technology Stack
- Frontend: Next.js (React, TypeScript)
- Backend: NestJS (Node.js, TypeScript) or Next.js API routes for serverless on Vercel
- Database: PostgreSQL (multi‑tenant)
- Cache: Redis
- Storage: S3‑compatible (object storage)
- Queue: RabbitMQ (or Kafka)
- OCR: Service (e.g., Tesseract/AWS Textract) – header fields MVP
- Bank AIS: PSD2 provider (e.g., Tink/TrueLayer/Polish aggregator)
- Mailer: Transactional email (Postmark or AWS SES)
- Payments: Stripe or Adyen (client portal)
- PDF/Print: Headless Chromium rendering for invoices/reports
- Observability: Prometheus/Grafana, OpenSearch (ELK‑like)
- CI/CD: GitHub Actions
- Containerization: Docker; Compose (dev); ECS/K8s (staging/prod)

### Provider Selection
- Primary: Vercel (frontend + serverless functions) + Supabase (Postgres/Auth/Storage)
- Alternative: Cloudflare (Pages + Workers + R2 + D1/Hyperdrive + Queues)
- Enterprise fallback: AWS ECS/K8s for long‑running services needing persistent connections
- Payments: Stripe/Adyen; Email: Postmark/SES

## 2. Version Requirements
| Component           | Version            |
|---------------------|-------------------:|
| Node.js             | 20.x               |
| Next.js             | 14.x               |
| NestJS              | 10.x               |
| TypeScript          | 5.6+               |
| PostgreSQL          | 16.x               |
| Redis               | 7.x                |
| RabbitMQ            | 3.12+              |
| OpenSearch          | 2.x                |
| Docker              | 24+                |
| GitHub Actions      | Latest             |
| Supabase CLI        | 2.x                |
| Vercel CLI          | Latest             |
| Cloudflare Wrangler | 3.x                |

## 3. Development Environment Setup
- Prerequisites:
  - Install Node.js 20, pnpm, Docker Desktop.
  - Ensure Docker resources: 2 CPUs, 4GB RAM minimum.
- Steps:
  - Clone repository and checkout `main`.
  - Create `.env` files: `apps/frontend/.env.local`, `apps/backend/.env`:
    - `DATABASE_URL` (Supabase or local Postgres), `REDIS_URL`, `S3_BUCKET`/`SUPABASE_STORAGE_BUCKET`, `AIS_PROVIDER_KEYS`, `KSEF_CERT_B64`, `EMAIL_PROVIDER_KEYS`, `PAYMENTS_PROVIDER_KEYS`.
    - Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - Start dependencies via Docker Compose (dev): Postgres, Redis, RabbitMQ, OpenSearch.
  - Install packages: `pnpm install`.
  - Run frontend: `pnpm --filter frontend dev`; backend: `pnpm --filter backend start:dev`.
  - Apply DB migrations: `pnpm --filter backend db:migrate`.
  - Optional (Supabase local): `supabase start` to spin Postgres/Storage/Auth locally.
- Test data:
  - Seed script creates sample company, user, invoice, bank account.

## 4. Deployment Architecture

### Option A — Vercel + Supabase (Recommended for MVP)
- Frontend: Next.js deployed to Vercel (preview deployments per PR, production on `main`).
- Backend: Next.js API routes (serverless/edge) or NestJS container for long‑running tasks.
- Data: Supabase Postgres (managed), Auth, Storage buckets.
- Jobs: Vercel Cron + Supabase functions; external worker for heavy KSeF batching if needed.
  - Nightly AIS sync, FX rate updates, recurring generation, dunning reminders.
- Secrets: Vercel env vars + Supabase secrets; KSeF cert stored as base64 (`KSEF_CERT_B64`).
- Observability: Vercel Analytics + app metrics; logs shipped to OpenSearch.

### Option B — Cloudflare Stack (Edge‑first)
- Frontend: Cloudflare Pages.
- Backend: Workers (Node/Edge runtime), Durable Objects for state.
- Data: R2 (storage), D1 or Hyperdrive (Postgres), Queues for jobs.
- Secrets: `wrangler` secrets; KSeF cert loaded on demand from R2 (encrypted).

### Option C — AWS ECS/K8s (Enterprise)
- Containers on ECS/K8s; RDS Postgres; ElastiCache Redis; S3; ALB with HTTPS.
- Blue/green deploys; manual approval gate; feature flags.

## 5. Configuration & Secrets
- Managed via environment variables and secrets manager.
- No secrets stored in repo; local development uses `.env.local`.
- Certificates for KSeF stored encrypted; access audited.
- Vercel/Supabase: cert provided as base64 env var, decoded at runtime; never logged.
- Cloudflare: cert stored encrypted in R2; Workers access via scoped tokens.

## 7. Option A Setup Guide (Vercel + Supabase)
- Create Supabase project; enable Postgres and Storage.
- Create bucket for documents (e.g., `docs`), and set RLS policies per tenant.
- Capture credentials:
  - `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - `DATABASE_URL` (from Supabase connection string).
- Create Vercel project from repo; set environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
  - `DATABASE_URL`, `KSEF_CERT_B64`, `AIS_PROVIDER_KEYS`, `SUPABASE_STORAGE_BUCKET`.
- Configure Vercel Cron to hit `/api/jobs/ksef-batch` at desired schedule.
- Add Supabase migrations to CI: run `supabase db push` or migration scripts on deploy.
- Verify preview deployments per PR; restrict production to `main` merges with required checks.

## 6. Performance Targets
- P95 invoice save <2s; P95 GL query <2s on 10k lines; P95 export <10s.
- Auto‑reconciliation ≥70% MVP; ≥80% post‑MVP.

---
All versions must be pinned in lockfiles and container base images for reproducibility.
