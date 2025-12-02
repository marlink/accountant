create table if not exists alerts (
  id bigint generated always as identity primary key,
  job text not null,
  ratio numeric not null,
  processed int not null,
  failed int not null,
  message text not null,
  created_at timestamp with time zone default now()
);

alter table alerts enable row level security;
create policy alerts_read on alerts for select using (true);
