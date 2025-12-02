alter table ksef_submissions add column if not exists idempotency_key text;
alter table ksef_submissions add column if not exists error_code text;
create index if not exists idx_ksef_idempotency on ksef_submissions(idempotency_key);
