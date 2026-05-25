-- Migration 008: Add follow_up_sent_at to leads table
-- Fixes "column leads.follow_up_sent_at does not exist" error in gabriel-daily-run step 3b

ALTER TABLE leads ADD COLUMN IF NOT EXISTS follow_up_sent_at timestamptz;

COMMENT ON COLUMN leads.follow_up_sent_at IS 'Timestamp when Gabriel last sent a follow-up message to this connected lead';
