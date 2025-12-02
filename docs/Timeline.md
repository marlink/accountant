---
last_updated: 2025-12-02
source_path: docs/Timeline.md
---
# Development Timeline (12 Months)

## 1. Milestones & Sprints

### MVP (Sprints 1–8)
| Sprint | Focus                                      | Key Deliverables                                          | QA/Testing                              |
|-------:|--------------------------------------------|-----------------------------------------------------------|-----------------------------------------|
| 1      | Foundations + Invoicing                    | Auth, RBAC skeleton, „Wystaw fakturę”, PDF/email          | Unit/API; perf P95 invoice <2s          |
| 2      | KSeF Phase 1                               | Send/sign, statuses, idempotency, audit                   | KSeF sandbox acceptance >95%            |
| 3      | Koszty + OCR (headers)                     | Upload, OCR headers, edits, „Wirtualny sejf”              | OCR accuracy sample >95%                |
| 4      | Bank AIS + Reconciliation                  | OAuth connect, import, auto‑match, partials               | 70% auto‑match; unmatched queue tested  |
| 5      | VAT Registers + JPK_V7                     | Ewidencje, JPK generate/validate/export                   | JPK schema validation; totals reconcile |
| 6      | ZUS DRA + Payments                          | DRA calc/send, „Zapłać VAT/ZUS”, consents                 | DRA calc accuracy; payment titles       |
| 7      | Roles/Collab + Corrections                 | Invites/RBAC audit, korekty/zaliczki, period close        | RBAC tests; correction marks in JPK     |
| 8      | Hardening + Launch                         | Perf/HA, error budgets, Polish messages                   | Smoke tests; rollback drills            |

### Q2–Q4 Enhancements (Sprints 9–16)
- Q2 (9–10): KPiR (JDG), approvals for koszty, multi‑currency + FX diffs.
- Q3 (11–13): RZiS/Bilans; enhanced OCR line items; collections/windykacja.
- Q4 (14–16): Analytics/dashboards; amortization; HA/DR; „Osobisty Księgowy”.

## 2. Phase Deliverables
- MVP Exit Criteria:
  - Invoicing + KSeF end‑to‑end; Costs+OCR header; Bank AIS+matching; VAT/JPK; ZUS DRA; RBAC; notifications.
- Q2 Exit:
  - Approvals, KPiR, FX diffs, payment initiation stable.
- Q3 Exit:
  - RZiS/Bilans, OCR line items, windykacja.
- Q4 Exit:
  - Analytics, amortization, HA/DR, księgowy service.

## 3. QA & Testing Phases
- Continuous across sprints; each feature has unit/API/E2E tests.
- Compliance suites: JPK_V7, DRA calculations, VAT registers.
- Performance regressions monitored; synthetic checks for KSeF/AIS.

## 4. Deployment & Monitoring Plan
- Staging deploy on merge to `main`; automated smoke tests.
- Production deploy via manual approval; blue/green; rollback path.
- Monitoring dashboards: jobs (queues), KSeF errors, reconciliation rates, uptime.
- Alerts: SLA breaches (KSeF send latency), queue backlogs, failed submissions.

---
Development begins only after approval of PRD and technical stack readiness.
