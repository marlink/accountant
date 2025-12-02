---
last_updated: 2025-12-02
source_path: docs/specs/Reporting.md
---
# Reporting Specification (Draft)

## Core Reports
- General Ledger (GL)
  - Filters: account(s), date range, dimension(s), currency, company
  - Drill‑down from account to journal lines
- Trial Balance (TB)
  - Period‑end balances per account; debits/credits; zero‑sum check
- Balance Sheet (BS)
  - Assets/Liabilities/Equity; mapped from CoA types; end of period
- Profit & Loss (P&L)
  - Income/Expenses; period totals; compare vs previous period
- Cash Flow
  - Direct method from cash accounts OR indirect from journals

## Operational Reports
- AR Aging, AP Aging (bucketed 0‑30/31‑60/61‑90/90+)
- Customer/Vendor statements
- Match rate and reconciliation status

## Dimensions & Budgeting
- Profitability per dimension (Phase 2); Budget vs Actual (variance)

## Multi‑Currency
- Report in base or presentation currency; FX at report date

## Export
- CSV/PDF; signed export URLs; pagination for large sets

## Validation
- TB balances to zero per company/currency
- BS = TB mapped balances; P&L ties to income/expense accounts
