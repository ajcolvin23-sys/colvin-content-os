-- Gabriel Automation OS — Gap Fixes
-- Migration: 006_gap_fixes.sql
-- Purpose: Fix all gaps identified in the 19-phase audit

-- ── Add run_id to outreach_drafts (idempotency on re-runs) ───────────────────
ALTER TABLE outreach_drafts ADD COLUMN IF NOT EXISTS run_id TEXT;
CREATE INDEX IF NOT EXISTS outreach_drafts_run_id_idx ON outreach_drafts(run_id);

-- ── Fix gabriel_memory: add run_id + unique constraint on session_date ────────
-- Prevents duplicate daily records on re-runs
ALTER TABLE gabriel_memory ADD COLUMN IF NOT EXISTS run_id TEXT;
ALTER TABLE gabriel_memory DROP CONSTRAINT IF EXISTS gabriel_memory_session_date_key;
ALTER TABLE gabriel_memory ADD CONSTRAINT gabriel_memory_session_date_key UNIQUE (session_date);

-- ── Marketing Recommendations ─────────────────────────────────────────────────
-- Stores Genius marketing recommendations as queryable records
CREATE TABLE IF NOT EXISTS marketing_recommendations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT,
  lane TEXT NOT NULL,
  rank INTEGER DEFAULT 1,
  recommendation TEXT NOT NULL,
  source TEXT DEFAULT 'genius',
    -- genius | solomon | alfred_input
  status TEXT DEFAULT 'pending_review',
    -- pending_review | approved | implemented | dismissed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS marketing_recs_lane_idx ON marketing_recommendations(lane);
CREATE INDEX IF NOT EXISTS marketing_recs_status_idx ON marketing_recommendations(status);
CREATE INDEX IF NOT EXISTS marketing_recs_run_id_idx ON marketing_recommendations(run_id);
CREATE INDEX IF NOT EXISTS marketing_recs_created_at_idx ON marketing_recommendations(created_at DESC);

-- ── SIP Backlog (Self-Improvement Proposals) ──────────────────────────────────
-- Persists self-audit proposals so they don't evaporate between runs
CREATE TABLE IF NOT EXISTS sip_backlog (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sip_id TEXT UNIQUE NOT NULL,
    -- e.g. SIP-001, SIP-002
  area TEXT NOT NULL,
    -- prompt_quality | routing | context_hygiene | etc.
  description TEXT NOT NULL,
  audit_score INTEGER,
  target_score INTEGER,
  status TEXT DEFAULT 'open',
    -- open | in_progress | implemented | wont_fix | closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS sip_backlog_status_idx ON sip_backlog(status);
CREATE INDEX IF NOT EXISTS sip_backlog_area_idx ON sip_backlog(area);
CREATE INDEX IF NOT EXISTS sip_backlog_created_at_idx ON sip_backlog(created_at DESC);

-- ── Add email column to leads for AgentMail reply matching ───────────────────
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);

-- ── RLS policies ──────────────────────────────────────────────────────────────
ALTER TABLE marketing_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sip_backlog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access marketing_recommendations"
  ON marketing_recommendations FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access sip_backlog"
  ON sip_backlog FOR ALL USING (auth.role() = 'service_role');
