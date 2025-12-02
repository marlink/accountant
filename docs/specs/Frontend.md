---
last_updated: 2025-12-02
source_path: docs/specs/Frontend.md
---
# Frontend Pages Specification (Draft)

Tech: Next.js (React, TypeScript)

## Pages
- Dashboard
  - Widgets: Cash, AR/AP aging, recent invoices/payments, match rate, bank sync status
  - Filters by company and date range
- Invoices
  - List with status filters; bulk actions; saved views
  - Create/edit: lines, taxes, discounts, attachments
  - Detail: timeline (status changes, payments), send, export PDF
- AP/AR
  - Aging views for customers/vendors; reminders; statement export
- Bank Reconciliation
  - Statement view (left) vs invoices/payments (right)
  - Auto‑match badges and confidence; manual match, split, write‑off
  - Audit log of matches
- Chart of Accounts & Journal/GL
  - CoA tree view; account detail with balance and recent transactions
  - GL report with filters (account, date, dimension, currency); export CSV/PDF
- Attachments
  - Upload/preview; OCR status and extracted fields
- Settings
  - Company switcher; tax templates; currency rates; AIS connections

## Components
- Data tables with virtualized rows
- Widgets cards with real‑time metrics
- Forms with validation; file upload; multi‑currency helpers

## Navigation & State
- Company‑scoped routes; global company selector
- Cache frequently used lists; optimistic UI for matches and payments
