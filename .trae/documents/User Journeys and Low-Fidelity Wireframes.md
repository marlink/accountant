---
last_updated: 2025-12-02
source_path: .trae/documents/User Journeys and Low-Fidelity Wireframes.md
---
## Scope

* Cover MVP modules: Invoicing + KSeF, Costs + OCR (headers), Bank AIS + matching, VAT/JPK, Notifications, Roles/Invite.

* Focus on primary personas: Owner (CEO), Office Manager, External Accountant, Contractor.

## Deliverables

* Good and bad user journey stories for each persona across MVP flows.

* Low-fidelity wireframes (ASCII sketches) for main screens.

* Output as two docs ready for dev handoff.

## Assumptions

* Use PRD UI strings (Polish labels) where relevant.

* Keep stories concise with clear acceptance hints and failure recovery.

## User Journeys To Write

* Owner (CEO):

  * Good: Sign up → "Połącz konto bankowe" → "Wystaw fakturę" → KSeF "Przyjęto" → auto match "Opłacone" → VAT estimate visible.

  * Bad: Invalid NIP → KSeF "Odrzucono" with Polish message → bank OAuth fails → partial payment not matched.

* Office Manager:

  * Good: "Dodaj koszt" → OCR fills headers → approval → posts to ledger.

  * Bad: OCR misreads VAT/NIP → needs manual fix → approval blocked → duplicate upload warning.

* External Accountant:

  * Good: "Księguj dokumenty" → VAT registers reconcile → Export JPK\_V7 passes validation.

  * Bad: JPK schema error → mapping hint shows → month not locked → permission issue.

* Contractor (JDG):

  * Good: "Szybka faktura" → ZUS estimate → reminders configured.

  * Bad: Wrong numeracja → missing NIP → payment overdue → windykacja needed.

## Main Screens To Wireframe

* Dashboard: taxes due, KSeF statuses, unpaid invoices, bank sync alert.

* Invoicing: issue invoice form (stawki VAT, NIP, numeracja, MPP), preview/PDF/email.

* Invoice Detail: KSeF status badge, `Id KSeF`, actions (send/correct).

* Costs Upload/OCR Review: file drop, OCR fields (NIP, kwota, VAT, data), approval.

* Bank Connect & Reconciliation: OAuth connect, transactions table, match suggestions.

* VAT/JPK: registers summary (Sprzedaż/Zakup), export/validate.

* Roles/Invite: invite modal, RBAC roles, audit trail snippet.

* Notifications: due taxes/unpaid invoices toggles.

## Wireframe Style

* ASCII boxes, simple labels, minimal layout; one screen per block.

* Keep inputs, primary actions, error states visible.

## Output Files (to be created after approval)

* `docs/UX/UserJourneys.md`: persona-based good/bad stories.

* `docs/UX/Wireframes.md`: ASCII wireframes per screen.

## Approach

* Write journeys in "As a \[persona], I..." format + "Bad path" with error messages and recovery steps.

* Draft wireframes with visible actions/fields reflecting PRD terms.

* Keep content developer-friendly: short, testable acceptance statements.

## Success Criteria

* Journeys clearly map to MVP features and edge cases.

* Wireframes cover all main screens and show primary actions/alerts.

* Documents

