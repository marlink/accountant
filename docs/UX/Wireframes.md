---
last_updated: 2025-12-02
source_path: docs/UX/Wireframes.md
---
# Wireframes

Note: Labels use PRD terms; keep layouts simple for dev handoff.

## Medium‑Fidelity SVGs
- Dashboard: ![Dashboard](wireframes/dashboard.svg)
- Invoicing form: ![Faktura VAT](wireframes/invoicing_form.svg)
- Invoice detail: ![Szczegóły FV](wireframes/invoice_detail.svg)
- Costs/OCR: ![Koszt OCR](wireframes/costs_ocr.svg)
- Bank reconciliation: ![Bank AIS](wireframes/bank_reconciliation.svg)
- VAT/JPK: ![VAT/JPK](wireframes/vat_jpk.svg)
- Roles/Invite: ![Współpracownik](wireframes/roles_invite.svg)
- Notifications: ![Powiadomienia](wireframes/notifications.svg)

## Clickable Prototype
- Dashboard: `docs/UX/prototype/index.html`
- Faktura: `docs/UX/prototype/invoicing.html`
- Szczegóły FV: `docs/UX/prototype/invoice.html`
- Koszt/OCR: `docs/UX/prototype/costs.html`
- Bank/AIS: `docs/UX/prototype/bank.html`
- VAT/JPK: `docs/UX/prototype/vat.html`
- Współpracownik: `docs/UX/prototype/invite.html`
- Powiadomienia: `docs/UX/prototype/notifications.html`

## Auto‑Synced Text Descriptions
- Open `docs/UX/Wireframes.html` to view auto‑generated textual descriptions next to each SVG.
- Descriptions are generated from SVG text labels in reading order, so any tweak to a wireframe is immediately reflected.

## Dashboard
```
----------------------------------------------------------------------------------+
|  Logo         [Spółka XYZ]                               Użytkownik ▾  Ustawienia |
----------------------------------------------------------------------------------+
| [KSeF Statusy]   [Podatki do zapłaty]   [Nieopłacone faktury]   [Bank Sync]      |
|  Przyjęto: 12    VAT: 12 345 PLN        4 (7 dni)              Ostatni: 3h       |
----------------------------------------------------------------------------------+
|  Szybkie akcje: [Wystaw fakturę] [Dodaj koszt] [Połącz konto bankowe]            |
----------------------------------------------------------------------------------+
|  Oś czasu powiadomień (VAT/ZUS/debtors)                                          |
----------------------------------------------------------------------------------+
```

## Invoicing — "Wystaw fakturę"
```
---------------------------------- Faktura VAT -----------------------------------+
| Kontrahent: [NIP ▢▢▢▢▢▢▢▢▢▢]  [Nazwa]  [Adres]   (validate NIP)                    |
| Numeracja:  [FV/2025/000123]   Data: [2025-12-02]  Waluta: [PLN ▾]                |
| MPP: [□]  Mechanizm podzielonej płatności                                        |
|-----------------------------------------------------------------------------------|
| Pozycje:                                                                          |
|  | Nazwa               | Ilość | Cena netto | VAT (23/8/5/0/zw) | Netto | Brutto |
|  | ▢▢▢▢▢               | 1     | 100,00     | 23%               | 100   | 123    |
|  [+ Dodaj pozycję]                                                                |
|-----------------------------------------------------------------------------------|
| [Wyślij do KSeF]   [Zapisz jako PDF]   [Wyślij e‑mailem]   [Anuluj]               |
| Status:  — (po wysyłce pokazuj „Wysłano/Przyjęto/Odrzucono”, `Id KSeF`)           |
-----------------------------------------------------------------------------------+
```

## Invoice Detail
```
------------------------------- FV/2025/000123 -----------------------------------+
| KSeF: [Przyjęto]  Id: KSeF-123-ABC   [Wyślij ponownie] [Faktura korygująca]       |
| Klient, kwoty, PDF podgląd                                                       |
| Płatność: [Opłacone]  (źródło: Bank AIS)  [Zobacz transakcję]                     |
-----------------------------------------------------------------------------------+
```

## Costs Upload / OCR Review — "Dodaj koszt"
```
---------------------------------- Koszt -----------------------------------------+
| [Przeciągnij plik / Zrób zdjęcie]                                                |
| OCR wyniki:                                                                       |
|  NIP: [▢▢▢▢▢▢▢▢▢▢]   Kwota: [123,45]   VAT: [23%]   Data: [2025-12-01]            |
|  Pozycje (opcjonalnie): [ ... ]                                                  |
| Kategoria (plan kont): [▾]   Obieg akceptacji: [Wyślij do akceptacji]            |
| [Zapisz szkic]  [Zaksięguj po akceptacji]                                        |
| Błędy: pokaż przy polach (np. "Nieprawidłowy NIP")                               |
-----------------------------------------------------------------------------------+
```

## Bank Connect & Reconciliation — "Połącz konto bankowe"
```
---------------------------- Bankowość (AIS) -------------------------------------+
| [Połącz konto bankowe] → OAuth → [Sukces / Błąd: spróbuj ponownie]                |
| Transakcje:                                                                       |
|  | Data | Kwota | Kontrahent | Sugestia dopasowania | Status | [Dopasuj]         |
|  | 12-02| 123,00| ABC Sp. z o.o. | FV/2025/000123       | PARTIAL | [►]         |
| Filtry: [Nieopłacone] [Tylko częściowe]                                           |
-----------------------------------------------------------------------------------+
```

## VAT/JPK
```
----------------------------- VAT / JPK_V7 ---------------------------------------+
| Rejestry:  Sprzedaż [sumy]   Zakup [sumy]                                         |
| Walidacja: [Uruchom] → [Sukces / Błąd: „Brak pola …”]                             |
| [Eksport JPK_V7M/K]   [Zamknij miesiąc]   [Historia zmian]                        |
-----------------------------------------------------------------------------------+
```

## Roles / Invite — "Współpracownik"
```
------------------------------- Zaproś współpracownika ----------------------------+
| E‑mail: [ ▢▢▢▢▢ ]  Rola: [Owner ▾] [Accountant ▾] [Office Manager ▾]              |
| [Zaproś]                                                                         |
| Audit: „Historia zmian” (kto/kiedy/co)                                           |
-----------------------------------------------------------------------------------+
```

## Notifications
```
-------------------------------- Powiadomienia -----------------------------------+
| VAT: [□] przypomnienia   ZUS: [□] przypomnienia   Windykacja: [□] sekwencja      |
| Kanały: [E‑mail] [In‑app]                                                        |
| [Zapisz]                                                                         |
-----------------------------------------------------------------------------------+
```
