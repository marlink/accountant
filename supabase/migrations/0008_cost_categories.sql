-- Cost Categories Reference Table (default categories for all companies)
create table if not exists cost_categories (
  id uuid primary key default gen_random_uuid(),
  name_pl text not null,
  code text not null unique,
  description text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Company-Specific Cost Categories (allows customization per company)
create table if not exists company_cost_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name_pl text not null,
  code text not null,
  description text,
  is_active boolean default true,
  is_custom boolean default true,
  created_at timestamp with time zone default now(),
  unique (company_id, code)
);

-- Indexes for performance
create index if not exists idx_cost_categories_active on cost_categories(is_active) where is_active = true;
create index if not exists idx_company_cost_categories_company on company_cost_categories(company_id, is_active) where is_active = true;

-- Enable RLS
alter table cost_categories enable row level security;
alter table company_cost_categories enable row level security;

-- RLS Policies: cost_categories are public (read-only for all authenticated users)
create policy cost_categories_select on cost_categories
  for select using (is_active = true);

-- RLS Policies: company_cost_categories are company-scoped
create policy company_cost_categories_select on company_cost_categories
  for select using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() 
      and p.company_id = company_cost_categories.company_id
    )
  );

create policy company_cost_categories_insert on company_cost_categories
  for insert with check (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() 
      and p.company_id = company_cost_categories.company_id
    )
  );

create policy company_cost_categories_update on company_cost_categories
  for update using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() 
      and p.company_id = company_cost_categories.company_id
    )
  );

create policy company_cost_categories_delete on company_cost_categories
  for delete using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() 
      and p.company_id = company_cost_categories.company_id
    )
  );

-- Note: expenses.category remains as text for flexibility
-- It can store either:
-- 1. A code from cost_categories (e.g., 'OFFICE', 'FUEL')
-- 2. A code from company_cost_categories (company-specific)
-- 3. A free-form text value (for backward compatibility and flexibility)
-- Applications should validate against available categories when possible

-- Seed default cost categories (Polish business expense categories)
insert into cost_categories (name_pl, code, description) values
  ('Koszty biurowe', 'OFFICE', 'Ogólne koszty biurowe i administracyjne'),
  ('Paliwo', 'FUEL', 'Koszty paliwa do pojazdów służbowych'),
  ('Usługi obce', 'EXTERNAL_SERVICES', 'Usługi zlecone na zewnątrz'),
  ('Marketing i reklama', 'MARKETING', 'Koszty marketingu i reklamy'),
  ('Podróże służbowe', 'BUSINESS_TRAVEL', 'Koszty podróży służbowych'),
  ('Szkolenia', 'TRAINING', 'Koszty szkoleń i rozwoju'),
  ('Oprogramowanie i licencje', 'SOFTWARE', 'Oprogramowanie, licencje i subskrypcje'),
  ('Media', 'UTILITIES', 'Prąd, woda, gaz, ogrzewanie'),
  ('Wynagrodzenia', 'SALARIES', 'Wynagrodzenia pracowników'),
  ('Ubezpieczenia', 'INSURANCE', 'Ubezpieczenia firmowe'),
  ('Remonty i konserwacja', 'MAINTENANCE', 'Remonty i konserwacja pomieszczeń/urządzeń'),
  ('Materiały biurowe', 'OFFICE_SUPPLIES', 'Materiały i artykuły biurowe'),
  ('Telekomunikacja', 'TELECOM', 'Telefon, internet, telekomunikacja'),
  ('Catering', 'CATERING', 'Catering i wyżywienie'),
  ('Reklama i promocja', 'ADVERTISING', 'Koszty reklamy i promocji'),
  ('Księgowość i prawo', 'ACCOUNTING_LEGAL', 'Usługi księgowe i prawne'),
  ('Transport i logistyka', 'TRANSPORT', 'Koszty transportu i logistyki'),
  ('Wynajem', 'RENT', 'Wynajem pomieszczeń biurowych'),
  ('Energia', 'ENERGY', 'Koszty energii elektrycznej'),
  ('Internet i hosting', 'HOSTING', 'Hosting, domeny, usługi internetowe')
on conflict (code) do nothing;

