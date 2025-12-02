---
last_updated: 2025-12-02
source_path: docs/specs/Services.md
---
# Services & Integrations Specification (Draft)

## AIS (PSD2 Bank Feeds)
- Provider: Tink/TrueLayer/PL aggregator; OAuth connect per BankAccount
- Sync: daily scheduled job via queue; webhooks for updates
- Import: normalize transactions (date, amount, currency, description, reference, raw)
- Error handling: retry with backoff; alert on consent expiry

## Reconciliation Engine
- Auto‑match strategy: exact amount + near‑date + reference string (invoice no.)
- Heuristics: amount tolerance, name similarity, split payments, multiple invoices
- Confidence scoring; thresholds for auto vs suggested matches
- Writes: create ReconciliationMatch and apply payments/journals where needed

## OCR
- Extract header fields (supplier, date, total, invoice number) from PDFs/images
- Pipeline: upload -> queue -> OCR -> persist extracted_fields -> notify UI
- Providers: Tesseract (local) / AWS Textract (managed); pluggable interface

## KSeF (Polish e‑invoicing)
- Certificate: `KSEF_CERT_B64` env; decode at runtime; never logged
- API: submit invoices, retrieve statuses, handle rejections; audit trail
- Batch worker for heavy submissions; throttling

## Tax & Currency
- Tax templates per country; map to tax accounts; line‑level application
- FX rates from trusted source (e.g., ECB/NBP); daily cache; audit source

## Scheduling & Queues
- Queue: RabbitMQ (or Kafka) for AIS sync, OCR, KSeF submissions, reminders
- Schedules: cron for nightly AIS sync, FX updates, recurring generation

## Observability
- Metrics: match rate, OCR success, KSeF success, job latencies
- Logs shipped to OpenSearch; dashboards in Grafana
