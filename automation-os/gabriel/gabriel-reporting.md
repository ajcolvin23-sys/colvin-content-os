# Gabriel Reporting

## Daily Report Format

Saved to: `automation-os/data/reports/YYYY-MM-DD-daily-report.json`
Sent via: Telegram (condensed version)

### Daily Report Structure

```json
{
  "date": "YYYY-MM-DD",
  "run_start": "ISO timestamp",
  "run_end": "ISO timestamp",
  "run_duration_ms": 0,
  "summary": {
    "leads_found": 0,
    "leads_after_dedup": 0,
    "leads_queued_for_review": 0,
    "outreach_drafts_created": 0,
    "content_drafts_created": 0,
    "seo_opportunities_found": 0
  },
  "pipeline": {
    "total_active_leads": 0,
    "leads_in_outreach": 0,
    "leads_converted_this_week": 0,
    "pipeline_velocity": "up|flat|down"
  },
  "top_3_actions": [
    {
      "rank": 1,
      "action": "description",
      "lane": "business_lane",
      "why": "reason this is top priority",
      "effort": "low|medium|high"
    }
  ],
  "review_queue": {
    "outreach": 0,
    "content": 0,
    "seo": 0,
    "opportunities": 0
  },
  "errors": [],
  "skipped_steps": []
}
```

## Weekly Report (Every Friday)

Saved to: `automation-os/data/reports/YYYY-MM-DD-weekly-report.json`

Includes:
- Total leads this week vs last week
- Best-performing content (by engagement if tracked)
- Campaign performance by lane
- SEO movement (if tracked)
- Top 3 wins
- Top 3 gaps / missed opportunities
- Recommended focus for next week

## Telegram Brief Format

```
GABRIEL DAILY BRIEF — [Date]

LEADS: [count found] found, [count queued] queued for review
OUTREACH DRAFTS: [count] ready for your approval
CONTENT: [count] pieces ready for your review

TOP 3 TODAY:
1. [Action] ([lane])
2. [Action] ([lane])
3. [Action] ([lane])

[urgent flag if any Katrina items pending]

Review queue ready in Content OS.
```

## Error Reporting

If any step fails, Gabriel sends a separate Telegram error alert:

```
GABRIEL ERROR — [Date] [Time]
Step [N] failed: [step name]
Error: [brief description]
Impact: [what was skipped]
Auto-recovery: [yes/no — what happened]
```

## Report Storage

- Daily JSON: `automation-os/data/reports/`
- Weekly JSON: `automation-os/data/reports/`
- Supabase: `gabriel_memory` table (condensed daily stats)
- Obsidian: `Alfred/Gabriel/Reports/` (weekly reports only, for Alfred's review)
