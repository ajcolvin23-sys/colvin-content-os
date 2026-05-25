# Gabriel Memory — Rolling Context File

## Purpose

This file documents Gabriel's memory schema. Actual memory is stored in Supabase `gabriel_memory` table. This file is the source of truth for what fields are tracked and how they're used.

## Memory Schema

```sql
CREATE TABLE gabriel_memory (
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
```

## Field Definitions

**leads_found** — Total new prospects identified in this run (before dedup)
**leads_scored** — Leads that passed dedup and received a quality score
**leads_queued** — Leads with score >= 7 added to outreach_queue
**outreach_drafts_created** — Draft messages created (NOT sent)
**content_drafts_created** — Content pieces drafted (NOT published)
**completed_actions** — Array of actions Alfred took from yesterday's review queue
**pending_actions** — Review items still waiting for Alfred's approval
**carry_forward** — High-priority items to re-surface tomorrow if not actioned
**top_3_actions** — The 3 recommended actions from this run
**run_errors** — Any step failures, API errors, or skipped steps

## Carry-Forward Rule

Any item in `pending_actions` that is:
- Score >= 8
- Not actioned after 2 days
→ Move to `carry_forward` and re-surface in tomorrow's brief with urgency flag

Any item in `pending_actions` that is:
- Score < 6
- Not actioned after 5 days
→ Archive to Supabase, remove from active queue

## Context Budget

When loading memory into Gabriel's daily run:
- Load only last 1 session (yesterday)
- Compress to under 2000 tokens
- Include: pending_actions, carry_forward, run_errors
- Exclude: full content drafts, raw lead data, LLM outputs
