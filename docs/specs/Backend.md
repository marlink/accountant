---
last_updated: 2025-12-02
source_path: docs/specs/Backend.md
---
# Backend Services Specification (Draft)

Tech: NestJS or Next.js API routes (per docs/Stack.md)

## Core Services
- Journal Posting
  - Validate debits == credits; lock on post; prevent edits on posted entries
  - Post from invoices/payments; handle reversals/adjustments
- Tax Engine
  - Apply tax templates per country; compute line/item taxes
  - Post tax to configured tax ledgers
- Currency Service
  - Convert txn->base using FX snapshot; source audit; rounding rules

## Workers
- AIS Sync Worker: fetch bank transactions; persist; emit events
- Reconciliation Worker: auto‑match candidates; write matches; notify UI
- OCR Worker: process attachments; persist extracted fields
- KSeF Worker: submit invoices; poll status; record outcomes
- Dunning Scheduler: generate reminders; send email/webhooks

## Multi‑Tenant & RBAC
- Company guard middleware; company_id required in all requests
- Role checks on routes/services (admin/accountant/viewer/client)

## APIs (examples)
- `/api/journals` CRUD (draft), `/api/journals/:id/post`
- `/api/invoices` CRUD, send, export
- `/api/bank-accounts` connect/list; `/api/bank-transactions` list/import
- `/api/reconciliation` matches/apply/write‑off
- `/api/attachments` upload/list
- `/api/reports/*` GL/TB/P&L/BS/Cash Flow

## Observability
- Structured logs; correlation IDs; metrics for job latencies and errors
