export function polishError(status: number, payload: any): string {
  const code = payload?.code || ''
  if (status === 401) return 'Nieautoryzowany dostęp do KSeF'
  if (status === 403) return 'Brak uprawnień do wysyłki e‑Faktury'
  if (status === 404) return 'Endpoint KSeF nie został znaleziony'
  if (status === 429) return 'Zbyt wiele żądań do KSeF'
  if (status >= 500) return 'Błąd serwera KSeF'
  if (code === 'SCHEMA_INVALID') return 'Nieprawidłowa struktura FA'
  if (code === 'SIGNATURE_INVALID') return 'Nieprawidłowy podpis'
  return 'Błąd wysyłki do KSeF'
}
