-- ai_usage_logs — tracks every Claude/OpenAI call for cost guardrails + observability
-- Created 2026-05-28 as part of Claude-Opus-as-reasoning-core migration
create table if not exists ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,                  -- 'anthropic' | 'openai'
  model text not null,                     -- 'claude-opus-4-5', 'gpt-4o-mini', etc.
  task_type text not null,                 -- 'content_generation', 'lead_scoring', etc.
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric(10, 6) not null default 0,
  latency_ms integer not null default 0,
  lane text,                               -- 'colvin_enterprises', 'first_keys_indy', etc.
  agent_name text,                         -- 'gabriel' | 'solomon' | 'genius' | 'hermes-planner'
  success boolean not null default true,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists ai_usage_logs_created_at_idx on ai_usage_logs (created_at desc);
create index if not exists ai_usage_logs_provider_idx on ai_usage_logs (provider);
create index if not exists ai_usage_logs_task_type_idx on ai_usage_logs (task_type);
create index if not exists ai_usage_logs_lane_idx on ai_usage_logs (lane);

-- RLS: only service role can write/read (no end-user access)
alter table ai_usage_logs enable row level security;

-- Service role bypasses RLS automatically; no policy needed for the runner.
-- If we ever expose this to the dashboard, add an "owner can read" policy.
