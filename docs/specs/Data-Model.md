---
last_updated: 2025-12-02
source_path: docs/specs/Data-Model.md
---
# Data Model Specification (Draft)

## Entities
- Company
  - id, name, country, currency, settings
- User
  - id, name, email, role, company_ids[]
- Account (Chart of Accounts)
  - id, company_id, code, name, type (asset/liability/equity/income/expense), parent_id, currency
- JournalEntry
  - id, company_id, date, memo, posted_by, posted_at, status (draft/posted)
- JournalLine
  - id, journal_entry_id, account_id, debit, credit, currency, fx_rate, dimension_ids[]
- Customer
  - id, company_id, name, tax_id, contacts, address
- Vendor
  - id, company_id, name, tax_id, contacts, address
- Invoice
  - id, company_id, type (sales/purchase), customer_id/vendor_id, date, due_date, status, currency, total_base, total_txn, fx_rate, tax_summary, discount
- InvoiceLine
  - id, invoice_id, account_id/item_id, qty, unit_price, tax_rate_id, discount
- Payment
  - id, company_id, date, amount_txn, amount_base, currency, fx_rate, method, customer_id/vendor_id, applied_to[]
- TaxTemplate
  - id, country, name, rate, account_id, rules
- CurrencyRate
  - id, base_currency, txn_currency, rate, source, date
- Attachment
  - id, company_id, entity_type, entity_id, url, mime, uploaded_by, extracted_fields
- BankAccount
  - id, company_id, provider, iban, name, currency, connected
- BankTransaction
  - id, bank_account_id, date, amount, currency, description, reference, raw, imported_at, reconciled
- ReconciliationMatch
  - id, bank_transaction_id, entity_type (invoice/payment), entity_id, confidence, matched_by, matched_at, status
- Dimension
  - id, company_id, name (e.g., channel), values[]
- Budget
  - id, company_id, dimension_id/value, account_id, period_start/end, amount

## Relationships
- Company 1‑N Users, Accounts, Invoices, Payments, BankAccounts
- JournalEntry 1‑N JournalLines; JournalLines N‑1 Accounts; Lines N‑M Dimensions
- Invoice lines post to Accounts; Payments apply to Invoices
- BankAccount 1‑N BankTransactions; BankTransactions 0‑1 ReconciliationMatch

## Constraints & Indexes
- Enforce double‑entry: sum(debit) == sum(credit) per JournalEntry
- Unique(Account.code, company_id)
- Indexes: JournalLines(account_id, date), BankTransactions(bank_account_id, date), Invoice(company_id, status, due_date)

## Multi‑Currency
- Store txn currency + base currency amounts; fx_rate snapshot; audit source

## Audit
- posted_by/posted_at on journals; status transitions logged
