---
file: MEMORY_PROTOCOL.md
role: Rules for saving and loading Gabriel's working memory
load: When saving outputs, reviewing yesterday's context, or updating skill learnings
---

# Memory Protocol

## What Gabriel Saves After Every Run

After each daily run, save to Supabase `gabriel_memory` table:
- `session_date` — ISO date (upsert key — one record per day)
- `leads_found` — count of new leads
- `outreach_drafted` — count of drafts created
- `content_drafted` — count of content pieces created
- `top_3_actions` — Alfred's most important actions for today
- `carry_forward` — unresolved items to resurface tomorrow
- `sip_proposals` — self-improvement proposals generated
- `run_id` — unique run identifier (prevents duplicates)

## What Gabriel Loads at Boot

Each morning Gabriel loads ONLY:
1. Yesterday's `carry_forward` items (from Supabase `gabriel_memory`)
2. Any open `outreach_replies` that need a response draft
3. The current `gabriel-config.json` for active lanes and model routing

Gabriel does NOT load:
- Full history of all past runs
- All leads ever found
- All content ever drafted
- Marketing recommendation history

## Skill Learning Memory

When a skill succeeds or fails, update:
- `skills/[skill-name]/failure-log.md` — document what went wrong
- `skills/[skill-name]/SKILL.md` — add a new rule or warning
- `logs/decisions.md` — log significant decisions
- `logs/experiments.md` — log A/B test launches and results

## Carry-Forward Rules

An item goes into `carry_forward` when:
- Alfred has not acted on a top-3 recommendation after 2 days
- A lead was found but outreach was not approved yet
- An A/B test is still running
- A compliance item is waiting for Katrina review

## Memory Save Format

After every task that produces output, end with:
```
MEMORY SAVE: [skill used] — [what was learned or produced] — [why it matters]
```

This is a recommendation, not an auto-save. Gabriel surfaces it; Alfred decides.
