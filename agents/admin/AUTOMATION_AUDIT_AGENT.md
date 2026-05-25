# Automation Audit Agent — Colvin Content OS

Weekly audit of all automation workflows. Did everything run? Did it produce quality output? Report with counts and error details.

---

## Audit Schedule

Every Sunday at 2 AM ET via Vercel Cron: `0 2 * * 0`

---

## Audit Report Sections

### 1. Gabriel Daily Runs (Last 7 Days)

For each day, check workflow_runs:
- Did Gabriel daily run complete?
- How many stages completed vs failed?
- Were leads generated? Content created?
- Were review tickets created?
- Were any runs missed?

Output:
```
Mon: ✓ Completed (15/15 stages, 8 leads, 6 drafts)
Tue: ✓ Completed (14/15 stages, 1 failure: firecrawl_timeout)
Wed: ✗ Missed (not detected until 9 AM — see incident INC-2025-001)
Thu: ✓ Completed (15/15 stages)
Fri: ✓ Completed (15/15 stages, 12 leads, 9 drafts)
Sat: ✓ Completed (15/15 stages)
Sun: RUNNING
```

### 2. Lead Pipeline Summary

```
Leads found this week: 47
  - indiana_backflow_directory: 18
  - colvin_enterprises: 12
  - music_theory_secrets: 17

Leads scored 7+: 23
Leads in outreach queue: 15
Outreach drafts created: 15
Outreach drafts approved: 8
Outreach sent: 8

Dedup skips: 12 (20% skip rate — normal)
Schema validation failures: 2 (recovered)
```

### 3. Content Pipeline Summary

```
Social posts created: 31
Posts approved: 18
Posts published: 12 (Alfred published)

Video blueprints created: 4
Video blueprints approved: 2
Videos rendered: 1
Videos in QA: 1
```

### 4. System Health Summary

```
Uptime: 98.5% (Remotion MCP was down for 45 min on Thursday)
Incidents this week:
  - P2: Missed Wednesday run (resolved, replayed)
  - P3: Firecrawl timeout Tuesday (auto-recovered, 1 retry)
  - P3: Schema validation failure Thursday (auto-recovered, regenerated)
```

### 5. API Usage Summary

```
OpenAI: 847,000 tokens used (well within limits)
Firecrawl: 234 pages scraped
Supabase: 12,400 queries
Telegram: 47 messages sent
```

### 6. Review Queue Summary

```
Total tickets created: 46
Approved: 26
Rejected: 3
Revision requested: 2
Pending (> 48h): 2 — ACTION REQUIRED
Expired: 1
```

### 7. Errors Requiring Attention

List of any unresolved issues, with specific recommendations.

---

## Report Delivery

Weekly audit report delivered to Alfred via Telegram on Sunday morning with summary, and stored in Supabase.

---

## Integration Status

PLANNED — Phase 5.
