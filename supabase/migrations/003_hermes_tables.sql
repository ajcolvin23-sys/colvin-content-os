-- Gabriel Automation OS — Hermes Infrastructure Tables
-- Migration: 003_hermes_tables.sql
-- Run after: 002_gabriel_automation_os.sql
-- Purpose: Creates workflow_runs, review_tickets, and incidents tables
--          required by the Hermes orchestration and self-repair system.

-- ── Fix: leads.name — allow null names (organizations have no named contact) ──
ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type TEXT DEFAULT 'person';
  -- Values: person | organization | referral_source
ALTER TABLE leads ADD COLUMN IF NOT EXISTS found_at TIMESTAMP WITH TIME ZONE;

-- Add unique constraint on linkedin_url for upsert support (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_linkedin_url_unique'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_linkedin_url_unique UNIQUE (linkedin_url);
  END IF;
END$$;

-- ── Workflow Runs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL,
  workflow_name TEXT NOT NULL,
  lane TEXT,
  current_stage TEXT,
  status TEXT DEFAULT 'running',
    -- running | completed | failed | replaying | blocked
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  stage_outputs JSONB DEFAULT '{}',
  error_metadata JSONB DEFAULT '{}',
  retry_count INTEGER DEFAULT 0,
  trace_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workflow_runs_run_id_idx ON workflow_runs(run_id);
CREATE INDEX IF NOT EXISTS workflow_runs_status_idx ON workflow_runs(status);
CREATE INDEX IF NOT EXISTS workflow_runs_lane_idx ON workflow_runs(lane);
CREATE INDEX IF NOT EXISTS workflow_runs_started_at_idx ON workflow_runs(started_at DESC);

-- ── Review Tickets ────────────────────────────────────────────────────────────
-- Central human approval queue for all agent outputs
CREATE TABLE IF NOT EXISTS review_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL,
    -- outreach | content | seo | partnership | video | grant | email
  asset_id UUID,
  lane TEXT NOT NULL,
  priority_score INTEGER DEFAULT 0,
  subject TEXT,
  draft TEXT,
  context TEXT,
  compliance_flags JSONB DEFAULT '[]',
  katrina_review_required BOOLEAN DEFAULT false,
  katrina_cleared_at TIMESTAMP WITH TIME ZONE,
  katrina_cleared_by TEXT,
  alfred_decision TEXT,
    -- approved | revised | rejected
  alfred_feedback TEXT,
  status TEXT DEFAULT 'pending',
    -- pending | needs_katrina | approved | revised | rejected | archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  timeout_at TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS
    (created_at + INTERVAL '48 hours') STORED
);

CREATE INDEX IF NOT EXISTS review_tickets_status_idx ON review_tickets(status);
CREATE INDEX IF NOT EXISTS review_tickets_lane_idx ON review_tickets(lane);
CREATE INDEX IF NOT EXISTS review_tickets_priority_idx ON review_tickets(priority_score DESC);
CREATE INDEX IF NOT EXISTS review_tickets_katrina_idx ON review_tickets(katrina_review_required);
CREATE INDEX IF NOT EXISTS review_tickets_timeout_idx ON review_tickets(timeout_at);

-- ── Incidents ─────────────────────────────────────────────────────────────────
-- P1/P2/P3/P4 incident tracking for system failures
CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  severity TEXT NOT NULL,
    -- P1 (critical/data loss) | P2 (degraded) | P3 (minor) | P4 (cosmetic)
  title TEXT NOT NULL,
  description TEXT,
  affected_lane TEXT,
  affected_workflow TEXT,
  affected_step TEXT,
  status TEXT DEFAULT 'open',
    -- open | investigating | mitigated | resolved | closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT,
  run_id UUID,
  error_payload JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS incidents_severity_idx ON incidents(severity);
CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents(status);
CREATE INDEX IF NOT EXISTS incidents_created_at_idx ON incidents(created_at DESC);

-- ── RLS Policies ──────────────────────────────────────────────────────────────
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access workflow_runs"
  ON workflow_runs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access review_tickets"
  ON review_tickets FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access incidents"
  ON incidents FOR ALL
  USING (auth.role() = 'service_role');
