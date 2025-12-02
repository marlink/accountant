---
last_updated: 2025-12-02
source_path: docs/Process.md
---
# Development Process

## 1. Version Control Strategy
- Model: Trunk‑based with short‑lived feature branches.
- Branches:
  - `main` (protected): release candidate; auto deploy to staging on merge.
  - `feat/*`, `fix/*`, `chore/*` for work; rebase/merge via PR.
- Releases:
  - Semantic versioning: `MAJOR.MINOR.PATCH`.
  - Tags on `main`; changelog generated from conventional commits.
- Commit conventions:
  - `feat:`, `fix:`, `perf:`, `refactor:`, `test:`, `docs:`, `chore:`.

## 2. CI/CD Pipeline
- Workflows (GitHub Actions):
  - `ci.yml`: lint, typecheck, unit tests, API tests, build.
  - `docker.yml`: build images, push to registry, SBOM.
  - `deploy-staging.yml`: deploy on merge to `main`; apply migrations; run smoke tests.
  - `deploy-prod.yml`: manual approval; blue/green; rollback on health failure.
  - Vercel Integration: preview deployments per PR; production on `main` with required checks.
  - Supabase Migrations: run via `supabase db push` or migration scripts post‑deploy.
  - Cloudflare (optional): `wrangler deploy` with environment scoped secrets.
- Quality gates:
  - Coverage ≥ 80% lines (backend services); critical workflows must pass.
  - SAST/Dependency scan (e.g., CodeQL); no high severity.

## 3. Code Review Process
- PR requirements:
  - Linked issue; clear description; screenshots/logs where relevant.
  - Small PRs (<500 LOC preferred); large changes split.
  - At least 1 approval (2 for security‑sensitive changes).
- Review checklist:
  - Correctness, tests, performance, security, i18n (Polish UI strings).
  - No secrets; logging hygiene; error messages actionable in Polish.
- Automation:
  - PR template; auto‑assign reviewers; status checks required.

## 4. Testing Framework & Coverage
- Unit: Jest (backend), Vitest/Jest (frontend utils).
- API: Supertest for NestJS controllers.
- E2E: Playwright (critical flows: faktura, KSeF send, koszty OCR, bank match, JPK export).
- Contract tests: API schemas via OpenAPI; validation in CI.
- Compliance tests: JPK_V7 XML against MF schema; DRA calculations.
- Coverage thresholds:
  - Backend services: ≥80% lines, ≥75% branches.
  - Frontend critical modules: ≥70% lines.

## 5. Environments & Approvals
- Gates:
  - Development begins only after PRD approval and stack configuration completed.
  - Production deploy requires change approval and post‑deploy monitoring.
- Observability:
  - Error budgets; alerts on KSeF errors, queue backlogs, reconciliation failures.
  - Provider dashboards: Vercel build/runtime errors; Supabase DB health; Workers queue depth.

## 6. Security Practices
- Least‑privilege RBAC; per‑tenant isolation.
- Secrets in manager; cert storage audited; PII minimized in logs.
- Regular dependency updates; vulnerability scanning.

---
This process is mandatory for all contributors; deviations require documented approval.
