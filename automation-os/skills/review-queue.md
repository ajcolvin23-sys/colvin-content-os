# Skill: Review Queue Management

## Purpose

The review queue is Alfred's daily inbox of AI-prepared work. Everything Gabriel creates lands here before Alfred acts on it. The queue is prioritized, formatted, and ready to action — not a pile of raw output.

## Queue Types

| Queue | Contents | Source | Priority Sorting |
|---|---|---|---|
| `outreach_queue` | LinkedIn + email drafts | Outreach Agent | Lead score (highest first) |
| `content_queue` | Social posts, scripts, captions | Genius/Gabriel | Newest first |
| `seo_queue` | Keyword opportunities, page fixes | Solomon | Impact score |
| `opportunity_queue` | Marketing + funnel recommendations | Genius/Hermes | ROI estimate |

## Supabase Tables

### `outreach_drafts`
```sql
id UUID, lead_name TEXT, lead_company TEXT, lane TEXT,
message_type TEXT, draft TEXT, priority_score INTEGER,
compliance_flags JSONB, katrina_review_required BOOLEAN,
status TEXT DEFAULT 'pending_review',
alfred_feedback TEXT, created_at TIMESTAMPTZ
```

### `content_queue`
```sql
id UUID, lane TEXT, platform TEXT, content_type TEXT,
draft TEXT, character_count INTEGER,
review_required BOOLEAN DEFAULT true,
status TEXT DEFAULT 'pending_review',
alfred_feedback TEXT, created_at TIMESTAMPTZ
```

## Status Values

| Status | Meaning |
|---|---|
| `pending_review` | Waiting for Alfred to review |
| `approved` | Alfred approved — ready to use |
| `revised` | Alfred requested changes — regenerated |
| `rejected` | Alfred rejected — do not use |
| `archived` | Expired or stale — removed from active queue |
| `sent` | Outreach actually sent by Alfred |
| `published` | Content actually published by Alfred |

## Review Interface

Alfred reviews via:
1. Telegram daily brief (summary only)
2. Content OS dashboard at `/dashboard/review` (full drafts, approve/reject buttons)
3. Supabase table direct (for power users)

## Queue Hygiene Rules

- Run queue cleanup daily (part of Gabriel's Step 12)
- Archive `pending_review` items older than 7 days if score < 6
- Send reminder for `pending_review` items older than 3 days if score >= 7
- Never delete — always archive (maintain history)
- Katrina-flagged items sit in queue until Katrina reviews, then Alfred approves
