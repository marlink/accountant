-- Invitations table for inviting users by email, phone number, or nickname
create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  identifier text not null, -- email, phone number, or nickname
  identifier_type text not null check (identifier_type in ('email', 'phone', 'nickname')),
  role text not null,
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'cancelled')),
  token text unique, -- invitation token for email/phone links
  expires_at timestamp with time zone,
  accepted_at timestamp with time zone,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_invitations_company on invitations(company_id, status);
create index if not exists idx_invitations_identifier on invitations(identifier, identifier_type, status);
create index if not exists idx_invitations_token on invitations(token) where token is not null;
create index if not exists idx_invitations_invited_by on invitations(invited_by);

-- Enable RLS
alter table invitations enable row level security;

-- RLS Policies: users can see invitations for their company
create policy invitations_select on invitations
  for select using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() 
      and p.company_id = invitations.company_id
    )
  );

-- Only users in the company can create invitations
create policy invitations_insert on invitations
  for insert with check (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() 
      and p.company_id = invitations.company_id
    )
    and invited_by = auth.uid()
  );

-- Only the inviter or company admins can update invitations
create policy invitations_update on invitations
  for update using (
    exists (
      select 1 from profiles p 
      where p.user_id = auth.uid() 
      and p.company_id = invitations.company_id
    )
  );

-- Function to update updated_at timestamp
create or replace function update_invitations_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger invitations_updated_at
  before update on invitations
  for each row
  execute function update_invitations_updated_at();

