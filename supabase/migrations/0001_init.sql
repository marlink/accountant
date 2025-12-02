create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vat_id text not null,
  ksef_token text,
  created_at timestamp with time zone default now()
);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  number text not null,
  issue_date date not null,
  currency text not null,
  total_gross numeric not null,
  total_vat numeric not null,
  mpp boolean default false,
  status text default 'Utworzono',
  created_at timestamp with time zone default now(),
  unique (company_id, number)
);

create table if not exists ksef_submissions (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  ksef_id text,
  status text not null,
  submitted_at timestamp with time zone default now(),
  error_message text,
  unique (invoice_id)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  supplier_nip text,
  total_gross numeric not null,
  total_vat numeric not null,
  issue_date date not null,
  category text,
  approval_status text default 'Oczekuje',
  created_at timestamp with time zone default now()
);

create index if not exists idx_invoices_company_date on invoices(company_id, issue_date);
create index if not exists idx_expenses_company_date on expenses(company_id, issue_date);
