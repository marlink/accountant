---
last_updated: 2025-12-02
source_path: docs/PRD.md
---
# Cloud Accounting SaaS for Polish SMEs — PRD

## 1. Market Overview & Positioning
- Target: Polish SMEs (JDG, spółka z o.o.), domestic and EU trade.
- Problem: Fragmented workflows across faktury (KSeF), koszty (OCR), bank reconciliation (PSD2), VAT/JPK/ZUS compliance; manual errors and deadline risk.
- Positioning: “KSeF‑first, bank‑connected, automation‑driven accounting” + optional „Osobisty Księgowy” (telefon/e‑mail), 24/7 dostęp, mobile, współpracownicy.
- Competitors: inFakt, wFirma, iFirma, Fakturownia, Comarch Optima.
- Differentiation:
  - Deep KSeF integration (statusy: „Wysłano”, „Przyjęto”, „Odrzucono”, `Id KSeF`).
  - PSD2 bank feeds with automatyczne oznaczanie faktur jako „Opłacone”.
  - OCR kosztów z auto‑kategoryzacją do planu kont.
  - Compliance guardrails for VAT/JPK/ZUS in all flows.

## 2. User Personas
- Owner (CEO, spółka z o.o.)
  - Goals: fast invoicing, visibility of taxes, delegation to accountant.
  - Pain: KSeF complexity, JPK mistakes, reconciliation time.
  - UI strings: „Wystaw fakturę”, „Połącz konto bankowe”, „Podatki do zapłaty”.
- Office Manager (Back‑office)
  - Goals: upload costs, track payments, chase debtors.
  - UI strings: „Dodaj koszt”, „Saldo i historia transakcji”, „Windykacja”.
- External Accountant (Księgowa/Księgowy)
  - Goals: correct postings, timely VAT/JPK/ZUS/CIT submissions.
  - UI strings: „Księguj dokumenty”, „Eksport JPK_V7”, „Wyślij DRA”.
- CFO/Controller (10–50 ppl)
  - Goals: RZiS, Bilans, cash flow, approvals.
  - UI strings: „Statystyki finansowe”, „Raporty RZiS”, „Obieg akceptacji”.
- Contractor/Freelancer (JDG)
  - Goals: simple invoicing, tax estimates, ZUS payments.
  - UI strings: „Szybka faktura”, „Opłać ZUS”, „Szacunkowy podatek”.

## 3. Functional Requirements (by Module)

### Invoicing (Faktury, KSeF)
- Create VAT invoice: stawki 23%, 8%, 5%, 0%, zw; NIP validation; numeracja.
- MPP flag („Mechanizm podzielonej płatności”) with PDF note.
- KSeF: sign/send, track statuses; store `Id KSeF`.
- Corrections („Faktura korygująca”), advance („Faktura zaliczkowa”).
- Multi‑currency; automatyczne rozliczanie różnic kursowych.
- Email delivery with PDF („Wyślij bezpośrednio z aplikacji”).

### Costs/Expenses (Koszty)
- Upload via web/mobile („Zrób zdjęcie”).
- OCR extraction: NIP, kwota, VAT, data, pozycje; manual edits.
- Auto categorization to chart of accounts; approvals („Obieg akceptacji”).

### Bank & Reconciliation (Bankowość)
- PSD2 AIS connect („Połącz konto bankowe”).
- Auto mark invoices/costs as paid; partial payments.
- Tax/ZUS remittances: „Opłać ZUS”, „Zapłać VAT”.
- Collections („Zleć windykację”) for overdue.

### Accounting Core (Księgowość)
- VAT registers (Sprzedaż/Zakup), JPK_V7 generation/validation/export.
- Spółka z o.o.: RZiS, Bilans, ewidencja rozrachunków; JDG: KPiR.
- Period close/locks; adjustments „Dowód księgowy”.

### Declarations & Taxes (US/ZUS)
- VAT‑7/VAT‑UE; ZUS DRA generation/submission; payments.
- Calendar: „Przypomnienia o zbliżających się płatnościach”.

### Collaboration & Roles
- Invite „Współpracownik”; RBAC; assign „Osobisty Księgowy”.
- Comments/tasks on documents.

### Documents & Storage (Wirtualny sejf)
- Store, tag, search, retention; export bundles for audits.

### Notifications
- Email/in‑app for taxes due, unpaid invoices, KSeF errors.

### API & Integrations
- REST/GraphQL; webhooks for payment status.

### Billing & Subscription
- Plans: Faktury, Księgowość, Spółki; upgrade/downgrade; dunning.

## 4. Non‑Functional Requirements
- Performance: P95 invoice save <2s; JPK export <10s for 10k docs.
- Reliability: KSeF retry/idempotency; bank sync daily; queues with backoff.
- Security: TLS, encryption at rest, secrets vault, audit trails; GDPR.
- Availability: 99.9% uptime; HA for DB/cache; backups/DR.
- Scalability: multi‑tenant Postgres, stateless services, S3 for storage.

## 5. Compliance Checklist (Polish Law)
- VAT (Ustawa o VAT): stawki 23%/8%/5%/0%/zw; MPP; prawidłowe dane faktury.
- JPK: JPK_V7M/K zgodnie ze schemą MF; walidacja; archiwizacja/audyt.
- KSeF: FA schema compliance; podpis/certyfikat; `Id KSeF`; statusy/obsługa błędów.
- ZUS: DRA, wyliczenia (emerytalna, rentowa, chorobowa, wypadkowa, zdrowotna, FP/FGŚP); terminy; tytuły płatności.
- Ustawa o rachunkowości: polityka rachunkowości, plan kont, RZiS, Bilans, zamknięcia okresów.

## 6. Technical Constraints & Assumptions
- Assumptions: AIS provider available; qualified certificate for KSeF; MF schema stability with versioning.
- Constraints: Data residency in EU; strong audit requirements; limited lean team → phased features.

## 7. Success Metrics & KPIs
- Activation: 60% issue first invoice in 7 days.
- KSeF acceptance: >99.5% first attempt; <0.2% error repeat.
- Automation: 80% bank auto‑match; 70% OCR auto‑code.
- Compliance timeliness: 90% VAT/JPK <2 days post month‑end.
- Reliability: 99.9% uptime; P95 invoice save <2s; JPK export <10s.
- Retention: 85% at 12 months; NPS 45+; CSAT 90%+.

## 8. High‑Level System Architecture (Summary)
- Frontend: Next.js (TypeScript); Backend: NestJS (Node.js); DB: PostgreSQL; Cache: Redis; Storage: S3; Queue: RabbitMQ/Kafka; Observability: Prometheus/Grafana + OpenSearch.
- Data flow: Faktury → KSeF send/status; Koszty → OCR → księgowania; Bank AIS → transakcje → match; VAT/JPK → generacja/wysyłka; ZUS DRA → płatności.

## 9. 12‑Month Roadmap & MVP
- MVP (Months 1–3): Invoicing + KSeF, Costs+OCR header, Bank AIS+matching, VAT/JPK, Notifications.
- Q2 (4–6): Corrections/advance, KPiR, ZUS DRA, roles/permissions.
- Q3 (7–9): RZiS/Bilans, enhanced OCR, collections, API/webhooks.
- Q4 (10–12): Analytics, amortization, HA/DR/SOC2‑aligned, „Osobisty Księgowy”.

## 10. Team & Roles (Lean)
- PM, 2× Backend, 1× Frontend, 1× DevOps, 1× QA, Part‑time Accountant.

## 11. User Stories (Prioritized, with Acceptance Criteria)
1. Invoicing: „Wystaw fakturę” with VAT, NIP, numeracja → PDF/email.
   - Accept: validations pass; PDF rendered; email sent.
2. KSeF Send: „Wyślij do KSeF” shows status and stores `Id KSeF`.
   - Accept: status „Przyjęto”/„Odrzucono” with actionable Polish message.
3. NIP Validation blocks invalid („Nieprawidłowy NIP”).
4. MPP flag prints note; appears in JPK.
5. „Faktura korygująca” links original; VAT delta correct.
6. „Faktura zaliczkowa” supports final invoice references.
7. „Dodaj koszt” stores file; OCR fills headers; edits allowed.
8. OCR accuracy >95% headers; audit of edits.
9. „Połącz konto bankowe” OAuth; transactions appear <24h.
10. Auto match invoices → „Opłacone”; partials handled.
11. Generate „Ewidencja VAT Sprzedaży/Zakupu”; totals reconcile.
12. Export JPK_V7M/K with schema validation.
13. „Zamknij miesiąc” locks; adjustments via „Dowód księgowy”.
14. Generate & send „Deklaracja DRA”; payment instruction.
15. „Zapłać VAT” creates transfer with correct tytuł.
16. Notifications for due taxes/unpaid invoices; configurable.
17. Invite „Współpracownik”; RBAC enforced; audit permission changes.
18. Assign „Osobisty Księgowy”; accountant access.
19. „Historia zmian” shows who/when/what.
20. Auto „Różnice kursowe” postings.
21. „Zleć windykację” for overdue; email sequence.
22. Tag to „Projekt”; project reporting.
23. Generate „Rachunek Zysków i Strat”.
24. Generate „Bilans”; validations; lock after approval.
25. Maintain „KPiR” for JDG.
26. Search „Wirtualny sejf” by NIP/kwota/data; <1s for <50k docs.
27. API keys; rate limit; test query returns data.
28. Webhooks for payment changes; HMAC signatures.
29. Performance P95 <2s invoice save in staging perf.
30. Polish error messages for KSeF/JPK map to UI.
31. Multi‑currency invoice in EUR; FX/LVAT base in PLN.
32. Approvals for „Koszt”; only approved post to ledger.
33. Export monthly audit ZIP (PDFs, JPK, ledger) with checksum.
34. GDPR consents for AIS/data; revocation disables flows.
35. Plan upgrade to „Spółki”; proration; permissions.
36. Support tickets; SLA response; logs interactions.

---
Approval gate: Begin development only after PRD approval and tech stack configuration are confirmed.
