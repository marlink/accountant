/**
 * Centralized Polish error messages
 */

import { ErrorCode } from './types';

/**
 * Map error codes to user-friendly Polish messages
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Validation errors
  [ErrorCode.VALIDATION_ERROR]: 'Błąd walidacji danych',
  [ErrorCode.INVALID_NIP]: 'Nieprawidłowy numer NIP',
  [ErrorCode.INVALID_AMOUNT]: 'Nieprawidłowa kwota',
  [ErrorCode.INVALID_DATE]: 'Nieprawidłowa data',
  [ErrorCode.MISSING_REQUIRED_FIELD]: 'Wymagane pole nie zostało wypełnione',
  [ErrorCode.INVALID_FORMAT]: 'Nieprawidłowy format danych',

  // API errors
  [ErrorCode.API_ERROR]: 'Błąd połączenia z serwerem',
  [ErrorCode.API_TIMEOUT]: 'Przekroczono limit czasu połączenia',
  [ErrorCode.API_UNAUTHORIZED]: 'Nieautoryzowany dostęp',
  [ErrorCode.API_FORBIDDEN]: 'Brak uprawnień do wykonania tej operacji',
  [ErrorCode.API_NOT_FOUND]: 'Zasób nie został znaleziony',
  [ErrorCode.API_RATE_LIMIT]: 'Zbyt wiele żądań. Spróbuj ponownie później',
  [ErrorCode.API_SERVER_ERROR]: 'Błąd serwera. Spróbuj ponownie później',

  // KSeF errors
  [ErrorCode.KSEF_ERROR]: 'Błąd wysyłki do KSeF',
  [ErrorCode.KSEF_UNAUTHORIZED]: 'Nieautoryzowany dostęp do KSeF',
  [ErrorCode.KSEF_FORBIDDEN]: 'Brak uprawnień do wysyłki e‑Faktury',
  [ErrorCode.KSEF_NOT_FOUND]: 'Endpoint KSeF nie został znaleziony',
  [ErrorCode.KSEF_RATE_LIMIT]: 'Zbyt wiele żądań do KSeF',
  [ErrorCode.KSEF_SCHEMA_INVALID]: 'Nieprawidłowa struktura faktury',
  [ErrorCode.KSEF_SIGNATURE_INVALID]: 'Nieprawidłowy podpis certyfikatu',
  [ErrorCode.KSEF_SERVER_ERROR]: 'Błąd serwera KSeF',

  // Authentication errors
  [ErrorCode.AUTH_ERROR]: 'Błąd autoryzacji',
  [ErrorCode.AUTH_UNAUTHORIZED]: 'Nie jesteś zalogowany',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Sesja wygasła. Zaloguj się ponownie',
  [ErrorCode.AUTH_INVALID_TOKEN]: 'Nieprawidłowy token autoryzacji',

  // Network errors
  [ErrorCode.NETWORK_ERROR]: 'Błąd połączenia sieciowego',
  [ErrorCode.NETWORK_OFFLINE]: 'Brak połączenia z internetem',
  [ErrorCode.NETWORK_TIMEOUT]: 'Przekroczono limit czasu połączenia',

  // Business logic errors
  [ErrorCode.BUSINESS_ERROR]: 'Błąd biznesowy',
  [ErrorCode.DUPLICATE_ENTRY]: 'Rekord już istnieje',
  [ErrorCode.INSUFFICIENT_PERMISSIONS]: 'Niewystarczające uprawnienia',
  [ErrorCode.RESOURCE_NOT_FOUND]: 'Zasób nie został znaleziony',
  [ErrorCode.OPERATION_NOT_ALLOWED]: 'Operacja niedozwolona',

  // Generic errors
  [ErrorCode.UNKNOWN_ERROR]: 'Wystąpił nieoczekiwany błąd',
  [ErrorCode.INTERNAL_ERROR]: 'Błąd wewnętrzny systemu',
};

/**
 * Get user-friendly error message for error code
 */
export function getErrorMessage(code: ErrorCode): string {
  return ERROR_MESSAGES[code] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];
}

/**
 * Context-specific error messages
 */
export const CONTEXT_MESSAGES = {
  validation: {
    nip: 'NIP musi składać się z 10 cyfr',
    amount: 'Kwota musi być liczbą dodatnią',
    date: 'Data musi być w formacie YYYY-MM-DD',
    required: 'To pole jest wymagane',
  },
  ksef: {
    send: 'Nie udało się wysłać faktury do KSeF',
    status: 'Nie udało się pobrać statusu z KSeF',
    retry: 'Spróbuj ponownie wysłać fakturę',
  },
  api: {
    save: 'Nie udało się zapisać danych',
    load: 'Nie udało się załadować danych',
    delete: 'Nie udało się usunąć danych',
  },
  form: {
    submit: 'Nie udało się wysłać formularza',
    validation: 'Formularz zawiera błędy. Sprawdź wszystkie pola',
  },
} as const;

/**
 * Get context-specific error message
 */
export function getContextMessage(
  context: keyof typeof CONTEXT_MESSAGES,
  key: string
): string | undefined {
  const contextMessages = CONTEXT_MESSAGES[context];
  if (!contextMessages) return undefined;
  
  return (contextMessages as Record<string, string>)[key];
}

