---
last_updated: 2025-12-02
source_path: docs/UX/UserJourneys.md
---
# User Journeys — MVP

Context: Cloud Accounting SaaS for Polish SMEs. Use Polish UI strings where noted.

**Design System**: Modern 3-color theme (Shandon CSS) with premium UI, touch-optimized interactions, and full accessibility support (WCAG 2.1 AA).

## Owner (CEO, spółka z o.o.)

### Good path
1. Sign up → see Dashboard with taxes/invoices widgets (modern gradient navigation, touch-friendly buttons).
2. Click "Połącz konto bankowe" (btn-primary class) → OAuth completes → transactions sync <24h.
3. Click "Wystaw fakturę" → form with accessible labels, proper ARIA attributes → fill NIP (with real-time validation), pozycje, stawki VAT (23%/8%/5%/0%/zw), numeracja, MPP checkbox.
4. Submit form → client-side validation passes → Send to KSeF → status message shows "Przyjęto" (success class, green border) with `Id KSeF` → email PDF to client.
5. Bank auto-match marks invoice "Opłacone" → VAT estimate visible on Dashboard with smooth animations.

**Accessibility**: Skip link available, keyboard navigation, screen reader announcements, focus indicators.

Acceptance hints: NIP validation passes (no error class), KSeF shows "Przyjęto" (status.success), auto-match applied, VAT tile updates with fade-in animation.

### Bad path
- **NIP invalid** → input gets `error` class (red border, light red background) → `aria-invalid="true"` → error message in `aria-describedby` span → status shows "Odrzucono: Nieprawidłowy NIP" (status.error class, red border-left) → form submission blocked.
- **KSeF returns "Odrzucono"** → actionable Polish message in status.error → form state preserved → user edits field → error clears on valid input → retry button available.
- **Bank OAuth fails** → error toast with status.error → retry button (btn-primary) with focus ring; manual payment marking available via action bar.
- **Partial payment** → invoice remains partially paid; match assistant suggests remaining amount → filter checkboxes in action-bar for "Nieopłacone" / "Tylko częściowe".

Recovery: Clear error text with semantic HTML (role="alert"), form state preserved, accessible "Popraw"/"Wyślij ponownie" actions with proper focus management. Status messages use `aria-live="polite"` for screen readers.

## Office Manager (Back‑office)

### Good path
1. Click "Dodaj koszt" (btn-secondary, green gradient) → form with expanded category dropdown (18+ options including Marketing, Podróże, Szkolenia, etc.).
2. Upload photo/PDF → OCR fills headers (NIP, kwota, VAT, data, pozycje) → fields pre-filled with proper labels and ARIA attributes → minor edits with real-time validation.
3. Submit form → validation passes → "Wyślij do akceptacji" → status.success shows "Wysłano do akceptacji • [Kategoria]" → approved → posts to ledger.

**Accessibility**: Form uses semantic HTML, proper label associations, error states with `aria-invalid` and `aria-describedby`.

Acceptance hints: OCR accuracy for headers, approval recorded, cost appears in ledger, status message confirms with category name.

### Bad path
- **OCR misreads VAT/NIP** → field gets `error` class (red border, light red background) → `aria-invalid="true"` → error message in associated span → requires manual correction with clear visual feedback.
- **Duplicate upload detected** → status.warning shows duplicate warning with link to existing doc → preserves form data for editing.
- **Approval blocked by role** → RBAC message in status.error → request approver button available.

Recovery: Allow manual edits (form state preserved), save draft, notify approver, avoid duplicate posting. All error states use semantic HTML and proper ARIA attributes for screen reader users.

## External Accountant (Księgowa/Księgowy)

### Good path
1. Open "VAT/JPK" (aria-current="page" in nav) → action-bar with three buttons: "Waliduj" (btn-primary), "Eksport JPK" (btn-primary), "Zamknij miesiąc" (btn-secondary).
2. Review VAT registers (Sprzedaż/Zakup) in wireframe view → totals reconcile with ledger.
3. Click "Waliduj" → validation runs → status.success shows success or status.error with specific field errors.
4. Click "Eksport JPK" → status.success shows "Eksport JPK_V7M/K gotowy" → download available.
5. Click "Zamknij miesiąc" → status.success confirms "Miesiąc zamknięty".

**Accessibility**: All buttons have proper ARIA labels, status messages use `aria-live="polite"` for announcements.

Acceptance hints: registers balanced, JPK validation success (status.success), export available, month closure confirmed.

### Bad path
- **JPK schema error** → status.error shows "Błąd: Brak pola K_23 w FV/2025/000118" → actionable Polish error text with specific field reference → user can navigate to invoice detail.
- **Period not locked** → status.warning before export; "Zamknij miesiąc" button (btn-secondary) available in action-bar.
- **Permission issue on adjustments** → RBAC error in status.error → request elevated role via "Współpracownik" invite flow.

Recovery: Fix mappings (error messages link to specific documents), lock month via action button, audit adjustments via "Dowód księgowy". All error states provide clear recovery paths with accessible buttons.

## Contractor/Freelancer (JDG)

### Good path
1. Use "Wystaw fakturę" → minimal form with touch-optimized inputs (44px+ height) → accessible labels and ARIA attributes.
2. Submit → validation passes → PDF/email sent → status.success confirms.
3. See ZUS estimate on Dashboard → navigate to "Powiadomienia" → configure reminders (VAT/ZUS) via form with checkboxes and proper fieldset/legend.

**Accessibility**: Form uses semantic fieldset for notification groups, all checkboxes have aria-labels, status messages announce changes.

Acceptance hints: Correct numeracja, PDF rendered, reminders configured (status.success confirms save).

### Bad path
- **Wrong numeracja sequence** → input gets `error` class → validation blocks save with tip in `aria-describedby` span → status.error shows specific validation message.
- **Missing NIP when required** → `aria-required="true"` → error message in associated span → form submission blocked.
- **Payment overdue** → Dashboard shows "Windykacja" prompt in status.warning → send friendly reminder via notifications form.

Recovery: Fix fields (error states clear on valid input), regenerate PDF, trigger email sequence or windykacja. All error states provide clear guidance with accessible error messages.

## Global UX notes

### Design System
- **3-Color Theme**: Primary (dark slate #0f172a), Secondary (blue #3b82f6), Tertiary (green #10b981)
- **Touch Optimization**: All interactive elements minimum 44px height, proper spacing
- **Premium UI**: Gradient backgrounds, layered shadows, smooth transitions (150-300ms)
- **Responsive**: Mobile-first design with adaptive layouts

### Accessibility (WCAG 2.1 AA)
- **Skip Links**: Available on all pages for keyboard navigation
- **Semantic HTML**: Proper use of `<header>`, `<nav>`, `<main>`, `<form>`, `<fieldset>`
- **ARIA Attributes**: `aria-label`, `aria-current`, `aria-required`, `aria-invalid`, `aria-describedby`, `aria-live`
- **Focus Management**: Visible focus indicators (3px outline with offset), proper tab order
- **Screen Reader Support**: `sr-only` class for hidden labels, `role="status"` for announcements

### Error Handling
- **Visual Feedback**: Error class adds red border, light red background, `aria-invalid="true"`
- **Status Messages**: Use semantic classes (status.success, status.error, status.warning) with colored left borders
- **Form Validation**: Real-time validation with `aria-describedby` linking errors to inputs
- **Polish Error Messages**: Clear, actionable messages mapped from KSeF/JPK

### User Experience
- **Form State Preservation**: User input preserved on errors
- **Clear Primary Actions**: Buttons use btn-primary (blue) or btn-secondary (green) classes
- **Status Indicators**: Color-coded status messages with icons (success=green, error=red, warning=amber)
- **Smooth Animations**: Fade-in effects, hover states, button ripple effects
- **Mobile Optimization**: Responsive grids, full-width buttons on small screens
