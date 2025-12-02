alter table ksef_submissions add column if not exists retry_count int default 0;
alter table ksef_submissions add column if not exists last_error text;
alter table ksef_submissions add column if not exists last_attempt_at timestamp with time zone;
