-- Hermes agent mesh — observability tables.
-- Every agent invocation logs one row here (best-effort from the runner).
-- review_tickets backs the Human Review Gateway (pending approvals).

create table if not exists public.agent_runs (
  id          bigint generated always as identity primary key,
  run_id      uuid not null,
  agent       text not null,
  lane        text,
  status      text not null,            -- 'ok' | 'error' | 'circuit_open'
  attempts    integer not null default 1,
  latency_ms  integer not null default 0,
  cost_usd    numeric,
  parent      text,
  error       text,
  created_at  timestamptz not null default now()
);

create index if not exists agent_runs_run_id_idx  on public.agent_runs (run_id);
create index if not exists agent_runs_agent_idx    on public.agent_runs (agent);
create index if not exists agent_runs_created_idx  on public.agent_runs (created_at desc);

create table if not exists public.review_tickets (
  id                       uuid primary key,
  lane                     text not null,
  kind                     text not null,            -- 'infographic' | 'video' | 'outreach' | ...
  title                    text not null,
  summary                  text,
  payload                  jsonb,
  status                   text not null default 'pending_review',
  run_id                   uuid,
  katrina_review_required  boolean not null default false,
  created_at               timestamptz not null default now()
);

create index if not exists review_tickets_status_idx on public.review_tickets (status, created_at desc);
create index if not exists review_tickets_lane_idx   on public.review_tickets (lane);
