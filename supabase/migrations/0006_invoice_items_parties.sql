alter table invoices add column if not exists seller_nip text;
alter table invoices add column if not exists seller_name text;
alter table invoices add column if not exists seller_address text;
alter table invoices add column if not exists buyer_nip text;
alter table invoices add column if not exists buyer_name text;
alter table invoices add column if not exists buyer_address text;

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  name text not null,
  qty numeric not null,
  unit_price numeric not null,
  vat_rate numeric not null,
  gtu_code text,
  created_at timestamp with time zone default now()
);

create index if not exists idx_invoice_items_invoice on invoice_items(invoice_id);
