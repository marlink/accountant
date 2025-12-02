-- Storage buckets and RLS policies for file uploads

-- Create storage bucket for documents
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Create storage bucket for invoices
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', false)
on conflict (id) do nothing;

-- Create storage bucket for expenses
insert into storage.buckets (id, name, public)
values ('expenses', 'expenses', false)
on conflict (id) do nothing;

-- RLS policies for documents bucket
create policy "Users can upload documents for their company"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' and
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and (storage.foldername(name))[1] = p.company_id::text
    )
  );

create policy "Users can view documents for their company"
  on storage.objects for select
  using (
    bucket_id = 'documents' and
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and (storage.foldername(name))[1] = p.company_id::text
    )
  );

create policy "Users can delete documents for their company"
  on storage.objects for delete
  using (
    bucket_id = 'documents' and
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and (storage.foldername(name))[1] = p.company_id::text
    )
  );

-- RLS policies for invoices bucket
create policy "Users can upload invoices for their company"
  on storage.objects for insert
  with check (
    bucket_id = 'invoices' and
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and (storage.foldername(name))[1] = p.company_id::text
    )
  );

create policy "Users can view invoices for their company"
  on storage.objects for select
  using (
    bucket_id = 'invoices' and
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and (storage.foldername(name))[1] = p.company_id::text
    )
  );

-- RLS policies for expenses bucket
create policy "Users can upload expenses for their company"
  on storage.objects for insert
  with check (
    bucket_id = 'expenses' and
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and (storage.foldername(name))[1] = p.company_id::text
    )
  );

create policy "Users can view expenses for their company"
  on storage.objects for select
  using (
    bucket_id = 'expenses' and
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and (storage.foldername(name))[1] = p.company_id::text
    )
  );

create policy "Users can delete expenses for their company"
  on storage.objects for delete
  using (
    bucket_id = 'expenses' and
    exists (
      select 1 from profiles p
      where p.user_id = auth.uid()
      and (storage.foldername(name))[1] = p.company_id::text
    )
  );

