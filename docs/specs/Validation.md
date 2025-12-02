---
last_updated: 2025-12-02
source_path: docs/specs/Validation.md
---
# Validation Criteria (Draft)

## Performance
- P95 invoice save < 2 s
- P95 GL query < 2 s on 10k journal lines
- Reconciliation auto‑match latency < 1 s per 100 candidates

## Accuracy
- Auto‑reconciliation ≥70% MVP; ≥80% Phase 2
- Trial Balance zero‑sum per company/currency
- FX conversions consistent with daily snapshot and source audit
- Tax postings align with templates; variance < 0.1%

## Security
- All requests scoped by company; cross‑company access blocked
- Secrets/certs never logged; attachments served via signed URLs

## Reliability
- AIS sync retries with backoff; alert on consent expiry
- OCR pipeline success ≥95% on supported formats (PDF/JPEG/PNG)
- KSeF submission success tracked; retries with throttling

## Reporting
- GL/TB/BS/P&L/Cash Flow reconcile to posted journals
- AR/AP aging matches invoice/payment statuses

## Observability
- Metrics exported: match rate, job latencies, error counts
- Logs correlated with request/worker IDs; searchable in OpenSearch
