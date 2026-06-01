# Skill: Reporting

## Daily Report — Required Every Run

Saved to: `automation-os/data/reports/YYYY-MM-DD-daily-report.json`
Also saved to: Supabase `gabriel_memory` (condensed)

See `gabriel-reporting.md` for full report schema.

## Key Metrics Tracked

### Lead Pipeline
- Leads found this run vs 7-day average
- Leads by lane (which lanes are producing?)
- Lead score distribution (are we finding quality?)
- Leads contacted this week (total, by lane)

### Outreach Performance
- Drafts created vs approved vs sent (by Alfred)
- Reply rate (when Alfred tracks this manually)
- Campaign step progression

### Content Performance
- Drafts created vs approved vs published
- Platforms covered this week
- Content gaps (which lanes haven't had content in 7+ days?)

### System Health
- Steps completed successfully vs failed
- API errors by type
- Run duration trend (getting slower or faster?)
- Queue depth (is the backlog growing?)

## Weekly Report (Fridays)

Additional sections:
- Win of the week (best outcome, best lead, best content)
- Gap of the week (biggest missed opportunity)
- Pipeline velocity trend (week over week)
- Recommended focus for next week (top 3 priorities)
- SIP proposals (if self-audit found improvements)

## Telegram Brief Format

Under 4096 characters. Plain text + HTML formatting.

```
<b>GABRIEL DAILY BRIEF — YYYY-MM-DD</b>

LEADS: X found, Y queued for review
OUTREACH DRAFTS: X ready for your approval
CONTENT: X pieces ready for your review
SEO: X opportunities

<b>TOP 3 TODAY:</b>
1. [Action] ([lane])
2. [Action] ([lane])
3. [Action] ([lane])

Run time: Xs | [X errors / Clean run]
```

## Error Reporting

Separate Telegram message on any step failure:
```
GABRIEL ERROR — YYYY-MM-DD HH:MM
Step [N]: [step name] failed
Error: [brief message]
Impact: [what was skipped]
```
