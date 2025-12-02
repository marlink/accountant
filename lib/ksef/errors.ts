import { ErrorCode, AppError, createError, ErrorMetadata } from '../errors/types';
import { handleKsefError } from '../errors/handler';

/**
 * Enhanced KSeF error code mappings
 */
export const KSEF_ERROR_CODES = {
  SCHEMA_INVALID: 'SCHEMA_INVALID',
  SIGNATURE_INVALID: 'SIGNATURE_INVALID',
  CERTIFICATE_EXPIRED: 'CERTIFICATE_EXPIRED',
  CERTIFICATE_INVALID: 'CERTIFICATE_INVALID',
  INVOICE_DUPLICATE: 'INVOICE_DUPLICATE',
  INVOICE_NOT_FOUND: 'INVOICE_NOT_FOUND',
  TAX_ID_INVALID: 'TAX_ID_INVALID',
  DATE_INVALID: 'DATE_INVALID',
  AMOUNT_INVALID: 'AMOUNT_INVALID',
  VAT_RATE_INVALID: 'VAT_RATE_INVALID',
  PAYMENT_DEADLINE_INVALID: 'PAYMENT_DEADLINE_INVALID',
  CURRENCY_INVALID: 'CURRENCY_INVALID',
} as const;

/**
 * Get Polish error message for KSeF status and code
 * @deprecated Use handleKsefError instead for full error handling
 */
export function polishError(status: number, payload: any): string {
  const code = payload?.code || '';
  
  // HTTP status-based messages
  if (status === 401) return 'Nieautoryzowany dostęp do KSeF';
  if (status === 403) return 'Brak uprawnień do wysyłki e‑Faktury';
  if (status === 404) return 'Endpoint KSeF nie został znaleziony';
  if (status === 429) return 'Zbyt wiele żądań do KSeF';
  if (status >= 500) return 'Błąd serwera KSeF';
  
  // KSeF-specific error codes
  if (code === KSEF_ERROR_CODES.SCHEMA_INVALID) {
    return 'Nieprawidłowa struktura FA. Sprawdź zgodność ze schematem KSeF';
  }
  if (code === KSEF_ERROR_CODES.SIGNATURE_INVALID) {
    return 'Nieprawidłowy podpis. Sprawdź certyfikat kwalifikowany';
  }
  if (code === KSEF_ERROR_CODES.CERTIFICATE_EXPIRED) {
    return 'Certyfikat kwalifikowany wygasł. Odnów certyfikat';
  }
  if (code === KSEF_ERROR_CODES.CERTIFICATE_INVALID) {
    return 'Certyfikat kwalifikowany jest nieprawidłowy';
  }
  if (code === KSEF_ERROR_CODES.INVOICE_DUPLICATE) {
    return 'Faktura o tym numerze już istnieje w KSeF';
  }
  if (code === KSEF_ERROR_CODES.INVOICE_NOT_FOUND) {
    return 'Faktura nie została znaleziona w KSeF';
  }
  if (code === KSEF_ERROR_CODES.TAX_ID_INVALID) {
    return 'Nieprawidłowy NIP. Sprawdź poprawność numeru';
  }
  if (code === KSEF_ERROR_CODES.DATE_INVALID) {
    return 'Nieprawidłowa data faktury';
  }
  if (code === KSEF_ERROR_CODES.AMOUNT_INVALID) {
    return 'Nieprawidłowa kwota faktury';
  }
  if (code === KSEF_ERROR_CODES.VAT_RATE_INVALID) {
    return 'Nieprawidłowa stawka VAT. Użyj 23%, 8%, 5%, 0% lub zw';
  }
  if (code === KSEF_ERROR_CODES.PAYMENT_DEADLINE_INVALID) {
    return 'Nieprawidłowy termin płatności';
  }
  if (code === KSEF_ERROR_CODES.CURRENCY_INVALID) {
    return 'Nieprawidłowa waluta. Użyj kodu ISO 4217 (np. PLN, EUR)';
  }
  
  // Fallback for unknown codes
  if (code) {
    return `Błąd KSeF: ${code}`;
  }
  
  return 'Błąd wysyłki do KSeF';
}

/**
 * Get recovery suggestion for KSeF error code
 */
export function getKsefRecoverySuggestion(code: string): string | undefined {
  switch (code) {
    case KSEF_ERROR_CODES.SCHEMA_INVALID:
      return 'Sprawdź strukturę faktury zgodnie z aktualnym schematem KSeF. Zweryfikuj wszystkie wymagane pola i ich formaty.';
    case KSEF_ERROR_CODES.SIGNATURE_INVALID:
      return 'Sprawdź poprawność certyfikatu kwalifikowanego. Upewnij się, że certyfikat jest ważny i ma odpowiednie uprawnienia.';
    case KSEF_ERROR_CODES.CERTIFICATE_EXPIRED:
      return 'Odnów certyfikat kwalifikowany w ustawieniach systemu. Po odnowieniu spróbuj ponownie wysłać fakturę.';
    case KSEF_ERROR_CODES.CERTIFICATE_INVALID:
      return 'Sprawdź konfigurację certyfikatu. Upewnij się, że certyfikat jest poprawnie załadowany i ma odpowiednie uprawnienia.';
    case KSEF_ERROR_CODES.INVOICE_DUPLICATE:
      return 'Faktura o tym numerze już istnieje. Sprawdź numerację faktur lub użyj innego numeru.';
    case KSEF_ERROR_CODES.TAX_ID_INVALID:
      return 'Sprawdź poprawność numeru NIP. Upewnij się, że zawiera 10 cyfr i jest poprawnie sformatowany.';
    case KSEF_ERROR_CODES.VAT_RATE_INVALID:
      return 'Sprawdź stawki VAT. Dozwolone stawki to: 23%, 8%, 5%, 0% lub zw (zwolnienie).';
    case KSEF_ERROR_CODES.DATE_INVALID:
      return 'Sprawdź datę wystawienia faktury. Data nie może być z przyszłości ani starsza niż 3 miesiące.';
    case KSEF_ERROR_CODES.AMOUNT_INVALID:
      return 'Sprawdź kwoty na fakturze. Upewnij się, że sumy są poprawne i zgodne z pozycjami.';
    default:
      return undefined;
  }
}

/**
 * Check if KSeF error is retryable
 */
export function isKsefErrorRetryable(status: number, code?: string): boolean {
  // Server errors and rate limits are retryable
  if (status >= 500 || status === 429) {
    return true;
  }
  
  // Some specific error codes might be retryable after user action
  if (code === KSEF_ERROR_CODES.CERTIFICATE_EXPIRED) {
    return false; // Requires certificate renewal first
  }
  
  // Client errors (4xx) are generally not retryable without fixing the issue
  return false;
}

/**
 * Enhanced KSeF error handler that returns AppError
 * This is the recommended way to handle KSeF errors
 */
export function createKsefError(
  status: number,
  payload?: { code?: string; message?: string; details?: string }
): AppError {
  return handleKsefError(status, payload);
}
