---
last_updated: 2025-12-02
source_path: .trae/documents/Feature Validation And MVP Plan For Accountant App.md
---
## External Features Summary
- Akaunting: bank accounts, multi‑company, reports, client portal, recurring invoices/bills/payments, customer/vendor management, tax rates, multi‑currency, discounts, attachments, categories, bulk actions, dashboards/widgets.
- ERPNext: flexible Chart of Accounts, double‑entry GL, AP/AR, tax templates and compliance, cost centers/dimensions, budgeting, financial statements (GL/TB/BS/P&L/Cash Flow), assets & depreciation, account/bank reconciliation, multi‑company and multi‑currency.
- Open Accounting: double‑entry system, customizable accounts, transactions editor, dashboard, basic reports, REST API.

## Adopt Now (MVP)
- Double‑entry ledger with flexible Chart of Accounts (GL/TB baseline).
- Invoicing (sales/purchase), taxes (templates per country), and multi‑currency.
- Bank accounts + PSD2 AIS fetcher and import (daily sync).
- Reconciliation tooling: auto‑match payments to invoices using refs/amount/date; manual match UI.
- AP/AR essentials: aging reports, due reminders (basic dunning), payment status.
- Attachments (receipts/invoices) with OCR for header fields.
- Multi‑company (tenant isolation, user‑company assignment) aligned with Postgres multi‑tenant.

## Phase 2 (Should‑Haves)
- Client portal (view invoices, pay online, bulk payments).
- Recurring “everything” (invoices/bills/revenues/payments) with schedules.
- Cost centers/dimensions and simple budgeting per dimension.
- Dashboards/widgets and bulk actions; saved views.
- Vendor/customer summaries, discounts on line/items.

## Phase 3 (Nice‑To‑Haves)
- Assets module with depreciation (SL/WDV/DDB) and lifecycle.
- Consolidation reporting for multi‑company; inter‑company transactions.
- Approval workflows for bills/payments; role‑based permissions.

## Data Model Additions
- Accounts (CoA tree), JournalEntries, JournalLines, Companies, Users/Roles (RBAC), Invoices (sales/purchase), Payments, Vendors/Customers, BankAccounts, BankTransactions, ReconciliationMatches, TaxTemplates, CurrencyRates, Attachments, Dimensions/CostCenters, Budgets.

## Services & Integrations
- AIS (PSD2) provider (Tink/TrueLayer/PL aggregator) for bank feeds; scheduled sync via queue.
- KSeF e‑invoicing integration (Poland) using `KSEF_CERT_B64` as per docs/Stack.
- OCR service (Tesseract/Textract) for header fields; async processing via queue.

## Frontend (Next.js)
- Dashboard with KPIs (cash, AR/AP aging, recent activity).
- Invoices (list/detail/create), AP/AR views, payments.
- Bank reconciliation UI (statement vs invoices/payments, auto/manual match).
- Chart of Accounts, Journal, General Ledger.
- Attachments upload and preview.
- Reports: GL/TB/P&L/BS/Cash Flow; export CSV/PDF.

## Backend (NestJS or Next API)
- Journal posting service (validates double‑entry, locks on post).
- Tax engine (templates per country), currency conversion.
- AIS sync worker, OCR worker, dunning scheduler.
- Multi‑tenant guard and per‑company RBAC.

## Security & Compliance
- Strict tenant isolation; company‑scoped queries.
- Roles: admin, accountant, viewer, client‑portal user.
- Secrets via env; never logged; certs encrypted (as per docs/Stack.md).

## Validation Criteria
- P95 invoice save < 2s; P95 GL query < 2s on 10k entries.
- Auto‑reconciliation ≥70% MVP, ≥80% post‑MVP.
- Reports match posted journal entries; TB balances to zero per company/currency.
- Multi‑currency amounts consistent (base + txn currency) and FX rate audit.

## Rationale
- MVP focuses on core accounting (double‑entry, invoicing, bank feeds, reconciliation, essential reports) seen across all three references.
- Phase 2 adds usability and planning (client portal, recurring, dimensions/budgeting) inspired by Akaunting/ERPNext.
- Phase 3 deepens finance (assets, consolidation, approvals) from ERPNext; optional for small teams.

Confirm this plan to proceed with detailed specs and skeletons for data models, services, and UIs.