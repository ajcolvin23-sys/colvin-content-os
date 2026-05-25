-- Gabriel Automation OS — AgentMail Reply Tracking
-- Migration: 005_agentmail.sql
-- Purpose: Store inbound prospect replies from the Gabriel outreach inbox
--          so Alfred can review replies + approve suggested follow-up drafts

-- ── Outreach Replies ──────────────────────────────────────────────────────────
-- Every prospect reply that lands in the Gabriel AgentMail inbox
CREATE TABLE IF NOT EXISTS outreach_replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agentmail_message_id TEXT UNIQUE NOT NULL,
    -- unique message ID from AgentMail — prevents double-processing
  agentmail_thread_id TEXT,
    -- thread ID for conversation grouping
  inbox_id TEXT NOT NULL,
    -- the Gabriel outreach inbox that received the reply
  from_email TEXT NOT NULL,
  from_name TEXT,
  subject TEXT,
  body_text TEXT,
    -- extractedText from AgentMail (reply only, no quoted history)
  body_html TEXT,
  lane TEXT,
    -- which business lane this reply maps to (derived from matched lead)
  lead_id UUID,
    -- FK to leads table if the sender matches a known lead
  suggested_reply TEXT,
    -- GPT-drafted follow-up response — Alfred approves before it goes out
  status TEXT DEFAULT 'pending_review',
    -- pending_review | reply_drafted | reply_approved | reply_sent | dismissed
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS outreach_replies_status_idx ON outreach_replies(status);
CREATE INDEX IF NOT EXISTS outreach_replies_lane_idx ON outreach_replies(lane);
CREATE INDEX IF NOT EXISTS outreach_replies_from_email_idx ON outreach_replies(from_email);
CREATE INDEX IF NOT EXISTS outreach_replies_lead_id_idx ON outreach_replies(lead_id);
CREATE INDEX IF NOT EXISTS outreach_replies_received_at_idx ON outreach_replies(received_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE outreach_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access outreach_replies"
  ON outreach_replies FOR ALL USING (auth.role() = 'service_role');
