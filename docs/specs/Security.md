---
last_updated: 2025-12-02
source_path: docs/specs/Security.md
---
# Security & RBAC Specification (Draft)

## Tenancy & Access Control
- All data scoped by `company_id`; no cross‑company queries permitted
- Global company selector sets current scope; enforced server‑side

## Roles
- Admin: full access within company; manage users, settings
- Accountant: journals, invoices, payments, reconciliation, reports
- Viewer: read‑only to operational data and reports
- Client: portal‑only access to own invoices/statements

## Permissions
- Route/method‑level guards per role; dimension‑level scopes (Phase 3)
- Approval workflow constraints for bills/payments/journals (Phase 3)

## Secrets & Certificates
- Env‑managed secrets; never logged
- KSeF certificate provided as base64 `KSEF_CERT_B64`; decode in memory; encrypted at rest if stored temporarily

## Audit & Compliance
- Audit trails on posting, matching, approvals; who/when
- Export logs/events for compliance; localization hooks

## Data Protection
- Attachments stored in S3‑compatible; signed URLs; virus scan optional
- PII minimization in logs; correlation IDs
