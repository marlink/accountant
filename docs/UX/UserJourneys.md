---
last_updated: 2025-12-02
source_path: docs/UX/UserJourneys.md
---
# User Journeys — MVP

Context: Cloud Accounting SaaS for Polish SMEs. Use Polish UI strings where noted.

## Owner (CEO, spółka z o.o.)

### Good path
1. Sign up → see Dashboard with taxes/invoices widgets.
2. Click "Połącz konto bankowe" → OAuth completes → transactions sync <24h.
3. Click "Wystaw fakturę" → fill NIP, pozycje, stawki VAT (23%/8%/5%/0%/zw), numeracja, MPP if needed.
4. Send to KSeF → status "Przyjęto" with `Id KSeF` → email PDF to client.
5. Bank auto-match marks invoice "Opłacone" → VAT estimate visible on Dashboard.

Acceptance hints: NIP validation passes, KSeF shows "Przyjęto", auto-match applied, VAT tile updates.

### Bad path
- NIP invalid → message "Nieprawidłowy NIP" blocks save.
- KSeF returns "Odrzucono" → actionable Polish message suggests fix → user edits and retries.
- Bank OAuth fails → error toast → retry button; manual payment marking available.
- Partial payment → invoice remains partially paid; match assistant suggests remaining amount.

Recovery: show clear error text, preserve form state, provide "Popraw"/"Wyślij ponownie" actions.

## Office Manager (Back‑office)

### Good path
1. Click "Dodaj koszt" → upload photo/PDF.
2. OCR fills headers (NIP, kwota, VAT, data, pozycje) → minor edits.
3. Submit for "Obieg akceptacji" → approved → posts to ledger.

Acceptance hints: OCR accuracy for headers, approval recorded, cost appears in ledger.

### Bad path
- OCR misreads VAT/NIP → highlight field with warning → requires manual correction.
- Duplicate upload detected → show duplicate warning with link to existing doc.
- Approval blocked by role → RBAC message; request approver.

Recovery: allow manual edits, save draft, notify approver, avoid duplicate posting.

## External Accountant (Księgowa/Księgowy)

### Good path
1. Open "Księguj dokumenty" → review VAT registers (Sprzedaż/Zakup).
2. Totals reconcile with ledger → generate JPK_V7M/K.
3. Validation passes → export and archive.

Acceptance hints: registers balanced, JPK validation success, export available.

### Bad path
- JPK schema error → show mapping hint with Polish error text.
- Period not locked → warn before export; offer "Zamknij miesiąc".
- Permission issue on adjustments → RBAC error → request elevated role.

Recovery: fix mappings, lock month, audit adjustments via "Dowód księgowy".

## Contractor/Freelancer (JDG)

### Good path
1. Use "Szybka faktura" → minimal fields → PDF/email.
2. See ZUS estimate on Dashboard → set reminders (VAT/ZUS).

Acceptance hints: correct numeracja, PDF rendered, reminders configured.

### Bad path
- Wrong numeracja sequence → validation blocks save with tip.
- Missing NIP when required → error message.
- Payment overdue → Dashboard shows "Windykacja" prompt; send friendly reminder.

Recovery: fix fields, regenerate PDF, trigger email sequence or windykacja.

## Global UX notes
- Always show clear Polish error messages mapped from KSeF/JPK.
- Preserve user input on errors; provide obvious primary actions.
- Use badges for statuses (KSeF: "Wysłano"/"Przyjęto"/"Odrzucono").
