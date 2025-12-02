export type InvoiceItem = { name: string; qty: number; unit_price: number; vat_rate: number; gtu_code?: string }
export type Party = { nip?: string; name?: string; address?: string }
export type InvoiceData = {
  id: string
  number: string
  issue_date: string
  total_gross: number
  total_vat: number
  currency: string
  seller: Party
  buyer: Party
  items: InvoiceItem[]
}

export function buildFaXml(inv: InvoiceData): string {
  const d = inv.issue_date
  const gross = inv.total_gross.toFixed(2)
  const vat = inv.total_vat.toFixed(2)
  const net = (inv.total_gross - inv.total_vat).toFixed(2)
  const itemsXml = inv.items.map(i => {
    const lineNet = (i.qty * i.unit_price).toFixed(2)
    const lineVat = (Number(lineNet) * i.vat_rate / 100).toFixed(2)
    const lineGross = (Number(lineNet) + Number(lineVat)).toFixed(2)
    const gtu = i.gtu_code ? `<GTU>${i.gtu_code}</GTU>` : ''
    return `<Pozycja><Nazwa>${escapeXml(i.name)}</Nazwa><Ilosc>${i.qty}</Ilosc><CenaJednostkowa>${i.unit_price.toFixed(2)}</CenaJednostkowa><StawkaVAT>${i.vat_rate}</StawkaVAT>${gtu}<Netto>${lineNet}</Netto><VAT>${lineVat}</VAT><Brutto>${lineGross}</Brutto></Pozycja>`
  }).join('')
  const sellerXml = `<Sprzedawca><NIP>${inv.seller.nip || ''}</NIP><Nazwa>${escapeXml(inv.seller.name || '')}</Nazwa><Adres>${escapeXml(inv.seller.address || '')}</Adres></Sprzedawca>`
  const buyerXml = `<Nabywca><NIP>${inv.buyer.nip || ''}</NIP><Nazwa>${escapeXml(inv.buyer.name || '')}</Nazwa><Adres>${escapeXml(inv.buyer.address || '')}</Adres></Nabywca>`
  return `<?xml version="1.0" encoding="UTF-8"?>\n<Fa xmlns="http://ksef.mf.gov.pl/fa">\n  <Naglowek>\n    <Numer>${inv.number}</Numer>\n    <DataWystawienia>${d}</DataWystawienia>\n    <Waluta>${inv.currency}</Waluta>\n  </Naglowek>\n  ${sellerXml}\n  ${buyerXml}\n  <Pozycje>${itemsXml}</Pozycje>\n  <Podsumowanie>\n    <Netto>${net}</Netto>\n    <VAT>${vat}</VAT>\n    <Brutto>${gross}</Brutto>\n  </Podsumowanie>\n</Fa>`
}

function escapeXml(v: string): string {
  return v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}
