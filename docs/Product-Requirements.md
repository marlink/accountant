---
last_updated: 2025-12-02
source_path: docs/Product-Requirements.md
---
# Product Requirements Document (PRD)

## Overview
An open accounting app for SMEs with multi‑company support, bank feeds, invoicing, reconciliation, and essential reporting. Grows to dimensions/budgeting, client portal, recurring operations, and advanced finance (assets, consolidation, approvals).

## Goals
- Accurate double‑entry accounting with flexible Chart of Accounts
- Reduce manual work via bank feeds and auto‑reconciliation
- Provide real‑time financial insights (GL/TB/BS/P&L/Cash Flow)
- Support multi‑company, multi‑currency operations securely

## Users & Roles
- Admin: manages company, users, settings
- Accountant: operates journals, invoices, payments, reconciliation, reports
- Viewer: read‑only access to operational data and reports
- Client: portal to view/pay invoices

## MVP Scope
- Double‑entry ledger and Chart of Accounts
- Invoices (sales/purchase), taxes via templates, discounts
- Multi‑currency amounts with FX snapshots
- Bank accounts + PSD2 AIS import; CSV fallback
- Reconciliation tooling (auto + manual), write‑off/split
- AP/AR aging, reminders; customer/vendor registry
- Attachments with OCR for header fields
- Multi‑company tenant isolation and company switcher
- Reports: GL/TB/P&L/BS/Cash Flow

## Phase 2
- Client portal and online payments (Stripe/Adyen)
- Recurring invoices/bills/revenues/payments
- Cost centers/dimensions; budgeting and variance
- Dashboards/widgets; bulk actions; saved views

## Phase 3
- Assets and depreciation with lifecycle journals
- Consolidation and inter‑company transactions
- Approval workflows; fine‑grained permissions

## Core Workflows
- Create invoice → post journal → payment → reconciliation
- Import bank transactions → auto‑match → manual resolve → audit
- Upload bill/invoice attachment → OCR → prefill → post
- Run reports → export CSV/PDF → share

## Non‑Functional Requirements
- Performance: P95 invoice save < 2 s; GL < 2 s on 10k lines
- Security: strict tenant isolation; signed URLs for attachments; secrets never logged
- Reliability: AIS retries; OCR pipeline success ≥95% supported formats
- Observability: metrics (match rate, latencies, errors); logs to OpenSearch

## Acceptance Criteria
- Trial Balance zero‑sum per company/currency
- Auto‑match rate ≥70% MVP; ≥80% post‑MVP
- Reports reconcile to posted journals
- FX conversions consistent with snapshot and source audit

## Integrations
- AIS bank feeds (Tink/TrueLayer/PL aggregator)
- OCR (Tesseract/AWS Textract)
- Payments (Stripe/Adyen) for client portal
- KSeF (Polish e‑invoicing) certificate‑based submission

## Deliverables
- Data model and API specs (journals, invoices, bank, reconciliation)
- Frontend pages (Dashboard, Invoices, AP/AR, Reconciliation, CoA/GL, Reports, Settings)
- Workers (AIS sync, reconciliation, OCR, KSeF, dunning)
- Validation and observability setup
