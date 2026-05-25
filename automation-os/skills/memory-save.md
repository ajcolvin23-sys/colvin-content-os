# Skill: Memory Save

## When to Save

Save at the end of every Gabriel run, after every significant output, and after any state change.

## What to Save

| Save This | To This Location |
|---|---|
| Daily run stats | Supabase `gabriel_memory` table |
| Lead profiles | Supabase `leads` table + `automation-os/data/leads/` |
| Outreach drafts | Supabase `outreach_drafts` table + `automation-os/data/outreach/` |
| Content drafts | Supabase `content_queue` table + `automation-os/data/content/` |
| Daily report | `automation-os/data/reports/YYYY-MM-DD-daily-report.json` |
| Weekly report | `automation-os/data/reports/YYYY-MM-DD-weekly-report.json` (Fridays only) |
| Significant decisions | Obsidian `Alfred/Gabriel/Decisions/` |
| Campaign state | Supabase `campaigns` table |

## What NOT to Save

- Raw LLM outputs (save the structured result, not the full prompt/response)
- API keys or credentials (never)
- PII for minors (girls_got_game leads should never include minor names/info)
- Duplicate records (always check before inserting)
- Failed drafts that were never revised (mark as archived, not saved again)

## Memory Format

### Supabase `gabriel_memory` insert:
```json
{
  "session_date": "YYYY-MM-DD",
  "leads_found": 12,
  "leads_scored": 9,
  "leads_queued": 4,
  "outreach_drafts_created": 8,
  "content_drafts_created": 2,
  "seo_opportunities": 3,
  "completed_actions": [],
  "pending_actions": ["Review 4 outreach drafts", "Post LinkedIn content"],
  "carry_forward": [],
  "top_3_actions": [
    {"rank": 1, "action": "Review outreach drafts", "lane": "colvin_enterprises"},
    {"rank": 2, "action": "Approve LinkedIn post", "lane": "first_keys_indy"},
    {"rank": 3, "action": "Check SEO opportunity", "lane": "indiana_backflow"}
  ],
  "run_errors": [],
  "run_duration_ms": 42000
}
```

## Obsidian Save Rules

Save to Obsidian only when:
- Weekly report is complete
- Significant new lead or opportunity discovered
- Campaign launched or closed
- Self-improvement proposal (SIP) created

Obsidian folder: `Alfred/Gabriel/`
Sub-folders: `Reports/`, `Decisions/`, `Leads/`, `Campaigns/`
