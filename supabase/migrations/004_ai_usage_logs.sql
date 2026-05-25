-- Gabriel Automation OS — AI Usage Logs + Supporting Tables
-- Migration: 004_ai_usage_logs.sql
-- Purpose: Cost visibility, render pipeline, email sequences, notification log

-- ── AI Usage Logs ─────────────────────────────────────────────────────────────
-- Every model call gets logged: provider, model, task, tokens, cost estimate
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT,
  provider TEXT NOT NULL,
    -- openai | anthropic | gemini
  model TEXT NOT NULL,
  task_type TEXT NOT NULL,
    -- content_generation | lead_scoring | outreach_drafts | seo_synthesis |
    -- daily_report | routing_decisions | qa_review | self_audit | marketing_recs
  lane TEXT,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 6) DEFAULT 0,
  status TEXT DEFAULT 'success',
    -- success | error | timeout | empty_response
  error_message TEXT,
  duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_usage_logs_run_id_idx ON ai_usage_logs(run_id);
CREATE INDEX IF NOT EXISTS ai_usage_logs_provider_idx ON ai_usage_logs(provider);
CREATE INDEX IF NOT EXISTS ai_usage_logs_task_type_idx ON ai_usage_logs(task_type);
CREATE INDEX IF NOT EXISTS ai_usage_logs_created_at_idx ON ai_usage_logs(created_at DESC);

-- ── Render Jobs ───────────────────────────────────────────────────────────────
-- Remotion render pipeline queue — Gabriel queues, Alfred approves, renders run
CREATE TABLE IF NOT EXISTS render_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  composition TEXT NOT NULL,
    -- e.g. FirstKeysIndy-Vertical, ColvinEnterpriseStoryPromo
  lane TEXT,
  input_props JSONB DEFAULT '{}',
  output_path TEXT,
  status TEXT DEFAULT 'pending',
    -- pending | approved | rendering | complete | failed | cancelled
  triggered_by TEXT DEFAULT 'gabriel',
  alfred_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error TEXT
);

CREATE INDEX IF NOT EXISTS render_jobs_status_idx ON render_jobs(status);
CREATE INDEX IF NOT EXISTS render_jobs_lane_idx ON render_jobs(lane);
CREATE INDEX IF NOT EXISTS render_jobs_created_at_idx ON render_jobs(created_at DESC);

-- ── Email Sequences ───────────────────────────────────────────────────────────
-- Multi-step email drip tracking — never auto-sends, Alfred approves each step
CREATE TABLE IF NOT EXISTS email_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID,
  lane TEXT NOT NULL,
  sequence_name TEXT,
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER,
  status TEXT DEFAULT 'active',
    -- active | paused | completed | unsubscribed | bounced
  next_send_at TIMESTAMP WITH TIME ZONE,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_sequences_status_idx ON email_sequences(status);
CREATE INDEX IF NOT EXISTS email_sequences_lane_idx ON email_sequences(lane);
CREATE INDEX IF NOT EXISTS email_sequences_next_send_idx ON email_sequences(next_send_at);

-- ── Notifications Log ─────────────────────────────────────────────────────────
-- Audit trail for every Telegram message and email sent by Gabriel
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL,
    -- telegram | email | both
  recipient TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
    -- sent | failed | skipped
  run_id TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_channel_idx ON notifications(channel);
CREATE INDEX IF NOT EXISTS notifications_run_id_idx ON notifications(run_id);
CREATE INDEX IF NOT EXISTS notifications_sent_at_idx ON notifications(sent_at DESC);

-- ── RLS Policies ──────────────────────────────────────────────────────────────
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access ai_usage_logs"
  ON ai_usage_logs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access render_jobs"
  ON render_jobs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access email_sequences"
  ON email_sequences FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access notifications"
  ON notifications FOR ALL USING (auth.role() = 'service_role');
