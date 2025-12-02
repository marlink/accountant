---
last_updated: 2025-12-02
source_path: docs/features/MVP.md
---
# MVP Features Specification

## Scope
Core accounting and operations to meet performance and reconciliation targets.

## Features
- Double‑entry ledger with Chart of Accounts (tree)
  - Post journal entries; enforce debits == credits
  - Lock entries once posted; audit trail (who/when)
- Invoicing (sales/purchase)
  - Create, send, mark paid/partially paid; due dates
  - Taxes via country templates; line‑level tax and discounts
  - Multi‑currency: store txn currency + base currency, FX rate source
- Bank accounts & PSD2 AIS import
  - Daily sync; manual CSV import fallback
  - Store raw statement lines with source metadata
- Reconciliation tools
  - Auto‑match by amount/date/reference; configurable thresholds
  - Manual match UI; write‑off/split payments; match status history
- AP/AR essentials
  - Aging reports; reminders (email) for overdue invoices
  - Vendor/customer registry and basic profiles
- Attachments & OCR
  - Upload PDFs/images to invoices/bills; extract header fields (supplier, date, total)
- Multi‑company
  - Company‑scoped data, user assignment; simple company switcher

## Non‑Functional
- Performance: P95 invoice save < 2s; GL query < 2 s (10k entries)
- Observability: request/worker logs shipped to OpenSearch; metrics for matches
- Security: per‑company RBAC; secrets via env; no secret logging

## Deliverables
- Data model schema draft (tables/relations)
- Service contracts (AIS, OCR, KSeF e‑invoicing hooks)
- UI wireframes: Dashboard, Invoices, Reconciliation, GL
- Report definitions: GL/TB/P&L/BS/Cash Flow
