-- Hermes Command CRM Migration
-- Run this in the Supabase SQL Editor

-- ── Hubs ──────────────────────────────────────────────────────────────────────
create table if not exists hubs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  slug text not null unique,
  description text,
  category text,
  status text default 'Idea',
  priority text default 'Medium',
  revenue_potential text,
  color text,
  icon text,
  next_action text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists hubs_status_idx on hubs(status);
create index if not exists hubs_priority_idx on hubs(priority);

-- ── Projects ──────────────────────────────────────────────────────────────────
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  hub_id uuid references hubs(id) on delete cascade,
  title text not null,
  description text,
  status text default 'Backlog',
  priority text default 'Medium',
  owner text,
  due_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists projects_hub_id_idx on projects(hub_id);
create index if not exists projects_status_idx on projects(status);

-- ── CRM Tasks ─────────────────────────────────────────────────────────────────
create table if not exists crm_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  hub_id uuid references hubs(id) on delete cascade,
  project_id uuid references projects(id) on delete set null,
  title text not null,
  description text,
  status text default 'To Do',
  priority text default 'Medium',
  due_date date,
  assigned_to text,
  next_action text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists crm_tasks_hub_id_idx on crm_tasks(hub_id);
create index if not exists crm_tasks_status_idx on crm_tasks(status);
create index if not exists crm_tasks_priority_idx on crm_tasks(priority);
create index if not exists crm_tasks_due_date_idx on crm_tasks(due_date);

-- ── Campaigns ─────────────────────────────────────────────────────────────────
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  hub_id uuid references hubs(id) on delete cascade,
  name text not null,
  goal text,
  audience text,
  offer text,
  start_date date,
  end_date date,
  status text default 'Planning',
  metrics jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists campaigns_hub_id_idx on campaigns(hub_id);
create index if not exists campaigns_status_idx on campaigns(status);

-- ── Research Notes ────────────────────────────────────────────────────────────
create table if not exists research_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  hub_id uuid references hubs(id) on delete cascade,
  title text not null,
  source text,
  summary text,
  evidence_quality text default 'Needs Verification',
  tags text[],
  action_items text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists research_notes_hub_id_idx on research_notes(hub_id);
create index if not exists research_notes_evidence_quality_idx on research_notes(evidence_quality);

-- ── Prompts ───────────────────────────────────────────────────────────────────
create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  hub_id uuid references hubs(id) on delete cascade,
  title text not null,
  category text,
  prompt_text text,
  model_target text,
  use_case text,
  status text default 'Active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists prompts_hub_id_idx on prompts(hub_id);
create index if not exists prompts_category_idx on prompts(category);
create index if not exists prompts_status_idx on prompts(status);

-- ── CRM Automations ───────────────────────────────────────────────────────────
create table if not exists crm_automations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  hub_id uuid references hubs(id) on delete cascade,
  name text not null,
  trigger_type text,
  workflow_description text,
  tools_required text[],
  status text default 'Draft',
  last_run_at timestamptz,
  error_log text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists crm_automations_hub_id_idx on crm_automations(hub_id);
create index if not exists crm_automations_status_idx on crm_automations(status);

-- ── Revenue Opportunities ─────────────────────────────────────────────────────
create table if not exists revenue_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  hub_id uuid references hubs(id) on delete cascade,
  lead_id uuid,
  title text not null,
  amount numeric default 0,
  stage text default 'New',
  probability integer default 0,
  close_date date,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists revenue_opportunities_hub_id_idx on revenue_opportunities(hub_id);
create index if not exists revenue_opportunities_stage_idx on revenue_opportunities(stage);

-- ── Hermes Agent Logs ─────────────────────────────────────────────────────────
create table if not exists hermes_agent_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  hub_id uuid references hubs(id) on delete set null,
  agent_name text,
  action_taken text,
  result text,
  error text,
  confidence_level text,
  human_review_required boolean default false,
  created_at timestamptz default now()
);

create index if not exists hermes_agent_logs_hub_id_idx on hermes_agent_logs(hub_id);
create index if not exists hermes_agent_logs_created_at_idx on hermes_agent_logs(created_at desc);

-- ── Hermes Approvals ──────────────────────────────────────────────────────────
create table if not exists hermes_approvals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  hub_id uuid references hubs(id) on delete set null,
  item_type text,
  item_id uuid,
  title text,
  description text,
  proposed_action text,
  risk_level text default 'Medium',
  status text default 'Pending',
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists hermes_approvals_hub_id_idx on hermes_approvals(hub_id);
create index if not exists hermes_approvals_status_idx on hermes_approvals(status);

-- ── Row Level Security ────────────────────────────────────────────────────────
alter table hubs enable row level security;
alter table projects enable row level security;
alter table crm_tasks enable row level security;
alter table campaigns enable row level security;
alter table research_notes enable row level security;
alter table prompts enable row level security;
alter table crm_automations enable row level security;
alter table revenue_opportunities enable row level security;
alter table hermes_agent_logs enable row level security;
alter table hermes_approvals enable row level security;

-- Owner policies (service role bypasses RLS, so these apply to anon/authenticated)
create policy if not exists "hubs_owner" on hubs for all using (auth.uid() = user_id or user_id is null);
create policy if not exists "projects_owner" on projects for all using (auth.uid() = user_id or user_id is null);
create policy if not exists "crm_tasks_owner" on crm_tasks for all using (auth.uid() = user_id or user_id is null);
create policy if not exists "campaigns_owner" on campaigns for all using (auth.uid() = user_id or user_id is null);
create policy if not exists "research_notes_owner" on research_notes for all using (auth.uid() = user_id or user_id is null);
create policy if not exists "prompts_owner" on prompts for all using (auth.uid() = user_id or user_id is null);
create policy if not exists "crm_automations_owner" on crm_automations for all using (auth.uid() = user_id or user_id is null);
create policy if not exists "revenue_opportunities_owner" on revenue_opportunities for all using (auth.uid() = user_id or user_id is null);
create policy if not exists "hermes_agent_logs_owner" on hermes_agent_logs for all using (auth.uid() = user_id or user_id is null);
create policy if not exists "hermes_approvals_owner" on hermes_approvals for all using (auth.uid() = user_id or user_id is null);
