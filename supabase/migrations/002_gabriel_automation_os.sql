-- Gabriel Automation OS — Supabase Schema
-- Migration: 002_gabriel_automation_os.sql
-- Run: psql $DATABASE_URL -f supabase/migrations/002_gabriel_automation_os.sql

-- ── Gabriel Memory ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gabriel_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE NOT NULL,
  leads_found INTEGER DEFAULT 0,
  leads_scored INTEGER DEFAULT 0,
  leads_queued INTEGER DEFAULT 0,
  outreach_drafts_created INTEGER DEFAULT 0,
  content_drafts_created INTEGER DEFAULT 0,
  seo_opportunities INTEGER DEFAULT 0,
  completed_actions JSONB DEFAULT '[]',
  pending_actions JSONB DEFAULT '[]',
  carry_forward JSONB DEFAULT '[]',
  top_3_actions JSONB DEFAULT '[]',
  run_errors JSONB DEFAULT '[]',
  run_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Leads ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  title TEXT,
  linkedin_url TEXT,
  email TEXT,
  lane TEXT NOT NULL,
  fit_reason TEXT,
  qualification_score INTEGER DEFAULT 0,
  source TEXT,
  status TEXT DEFAULT 'new',  -- new|contacted|replied|converted|archived
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_linkedin_url_idx ON leads(linkedin_url);
CREATE INDEX IF NOT EXISTS leads_lane_idx ON leads(lane);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);

-- ── Outreach Drafts (NEVER auto-send) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS outreach_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  lead_name TEXT,
  lead_company TEXT,
  lane TEXT NOT NULL,
  message_type TEXT NOT NULL,  -- linkedin_connection|linkedin_followup|email
  draft TEXT NOT NULL,
  priority_score INTEGER DEFAULT 0,
  compliance_flags JSONB DEFAULT '[]',
  katrina_review_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending_review',  -- pending_review|approved|revised|rejected|sent|archived
  alfred_feedback TEXT,
  revision_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS outreach_drafts_status_idx ON outreach_drafts(status);
CREATE INDEX IF NOT EXISTS outreach_drafts_lane_idx ON outreach_drafts(lane);
CREATE INDEX IF NOT EXISTS outreach_drafts_priority_idx ON outreach_drafts(priority_score DESC);

-- ── Content Queue (NEVER auto-publish) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lane TEXT NOT NULL,
  platform TEXT NOT NULL,  -- linkedin|instagram|facebook|tiktok|youtube|email
  content_type TEXT NOT NULL,  -- post|caption|script|email_subject|email_body|reel
  draft TEXT NOT NULL,
  character_count INTEGER DEFAULT 0,
  review_required BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending_review',  -- pending_review|approved|revised|rejected|published|archived
  alfred_feedback TEXT,
  revision_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS content_queue_status_idx ON content_queue(status);
CREATE INDEX IF NOT EXISTS content_queue_lane_idx ON content_queue(lane);
CREATE INDEX IF NOT EXISTS content_queue_platform_idx ON content_queue(platform);

-- ── Campaigns ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  campaign_type TEXT NOT NULL,
  lane TEXT NOT NULL,
  current_step INTEGER DEFAULT 1,
  total_steps INTEGER DEFAULT 3,
  status TEXT DEFAULT 'active',  -- active|paused|completed|unsubscribed
  last_touch_at TIMESTAMP WITH TIME ZONE,
  next_touch_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Enable RLS on all tables
ALTER TABLE gabriel_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Service role can do anything (used by Gabriel scripts)
CREATE POLICY "Service role full access" ON gabriel_memory FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON leads FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON outreach_drafts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON content_queue FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON campaigns FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── Comments ──────────────────────────────────────────────────────────────────
COMMENT ON TABLE gabriel_memory IS 'Daily run stats and state for Gabriel automation. One row per daily run.';
COMMENT ON TABLE leads IS 'All prospects found by Lead Scout. Never deleted — only archived.';
COMMENT ON TABLE outreach_drafts IS 'Outreach drafts created by Outreach Agent. NEVER auto-sent. Alfred approves all sends.';
COMMENT ON TABLE content_queue IS 'Content drafts for review. NEVER auto-published. Alfred approves all posts.';
COMMENT ON TABLE campaigns IS 'Multi-touch outreach campaign tracking per lead.';
