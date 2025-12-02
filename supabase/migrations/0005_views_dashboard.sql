create or replace view view_job_success_rate as
select job,
  round(avg(accepted::numeric/processed),3) as success_rate,
  round(avg(failed::numeric/processed),3) as failure_rate,
  max(created_at) as last_run
from job_metrics
where processed > 0
group by job;

create or replace view view_ksef_outstanding_queue as
select count(*)::int as outstanding
from ksef_submissions
where status = 'DoWyslania';
