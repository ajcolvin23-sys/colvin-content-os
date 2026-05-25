---
name: weekly-reflection
description: Use this skill for the Friday overall system review — wins, failures, skill updates, memory changes, and next week's top priorities across all of Gabriel's operations (not just research).
---

# Purpose

Weekly system-wide review that covers all of Gabriel's operations — not just research but also CMS work, outreach, content, CRO, and daily automation. Produces a concise report with the week's wins, failures, improvements applied, and next week's top 3 priorities.

# When To Use

- Every Friday, after the weekly-research-review completes
- When Alfred asks for a system health check
- Before a business planning session

# When Not To Use

- For research synthesis (run `weekly-research-review` first, then this)
- For individual task debugging (use `workflow-debugging`)

# Required Inputs

- This week's logs: research-log, failed-runs, skill-change-log, decisions, experiments
- This week's daily run summaries from Supabase `gabriel_memory`

# Minimum Context Needed

- `logs/failures.md` (this week's entries)
- `logs/decisions.md` (this week's decisions)
- `logs/skill-change-log.md` (changes applied this week)
- `logs/experiment-results.md` (active and concluded experiments)

# Workflow

1. Pull this week's data from all logs
2. Count: runs completed, leads found, drafts created, experiments running
3. List wins: what worked well this week?
4. List failures: what went wrong? (use `workflow-debugging` classification)
5. List skill improvements applied this week
6. List memory updates proposed or approved
7. Identify the top failure pattern of the week
8. Propose the single most impactful improvement for next week
9. Build next week's top 3 priorities
10. Deliver the weekly reflection report

# Output Format

```
WEEKLY REFLECTION — [date range]

RUNS COMPLETED: [count]
LEADS FOUND: [count]
OUTREACH DRAFTED: [count]
CONTENT DRAFTED: [count]
EXPERIMENTS ACTIVE: [count]
EXPERIMENTS CONCLUDED: [count]

WINS:
1. [specific win]
2. [specific win]

FAILURES:
1. [failure + root cause]
2. [failure + root cause]

SKILL CHANGES APPLIED: [count + list]
MEMORY UPDATES PROPOSED: [count]
MEMORY UPDATES APPROVED: [count]

TOP FAILURE PATTERN THIS WEEK:
[What kept going wrong + root cause]

MOST IMPACTFUL IMPROVEMENT FOR NEXT WEEK:
[1 specific change]

NEXT WEEK TOP 3 PRIORITIES:
1. [priority + why]
2. [priority + why]
3. [priority + why]
```

# Quality Checklist

- [ ] All weekly logs reviewed
- [ ] Wins are specific (not "things went well")
- [ ] Failures are classified (not "it didn't work")
- [ ] Skill changes documented
- [ ] One most impactful improvement identified
- [ ] Next week's top 3 priorities set

# Memory Update Rules

Recurring failure patterns → propose skill update via `skill-improvement`.
Recurring wins → log in `logs/decisions.md` as confirmed best practice.

# Examples

See `examples.md`.
