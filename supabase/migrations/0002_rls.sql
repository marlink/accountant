create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  created_at timestamp with time zone default now()
);

alter table companies enable row level security;
alter table invoices enable row level security;
alter table expenses enable row level security;
alter table ksef_submissions enable row level security;

create policy companies_tenant_select on companies
  for select using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.company_id = companies.id));

create policy invoices_tenant_select on invoices
  for select using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.company_id = invoices.company_id));

create policy expenses_tenant_select on expenses
  for select using (exists (select 1 from profiles p where p.user_id = auth.uid() and p.company_id = expenses.company_id));

create policy ksef_submissions_tenant_select on ksef_submissions
  for select using (exists (
    select 1 from invoices i join profiles p on p.company_id = i.company_id
    where i.id = ksef_submissions.invoice_id and p.user_id = auth.uid()
  ));

create table if not exists job_metrics (
  id bigint generated always as identity primary key,
  job text not null,
  processed int not null,
  accepted int not null,
  failed int not null,
  created_at timestamp with time zone default now()
);

alter table job_metrics enable row level security;
create policy job_metrics_read_own on job_metrics for select using (true);
