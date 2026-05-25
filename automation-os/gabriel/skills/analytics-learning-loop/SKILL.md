---
name: analytics-learning-loop
description: Use this skill when Gabriel needs to review performance data, identify what is working and what isn't, update memory with lessons, and recommend the next actions or experiments.
---

# Purpose

Analytics Learning Loop closes the feedback cycle. After content is published, outreach is sent, or experiments run, this skill reviews what happened, extracts lessons, and feeds those lessons back into Gabriel's skills and memory. This is how the system gets smarter over time.

# When To Use

- Weekly performance review of content and campaigns
- After an A/B test concludes — to process the winner
- After a batch of outreach is sent and replies start coming in
- When Gabriel needs to recommend next experiments based on results
- After a daily run — to capture what worked, what didn't

# When Not To Use

- Before any data exists (no traffic, no sends, no posts live)
- When the task is running an experiment (use `humblytics-experiment`)
- When the task is creating new content (use `content-engine`)

# Required Inputs

- Time period being reviewed (last 7 days, last 30 days, specific campaign dates)
- What data is available (Humblytics dashboard, Supabase records, Telegram brief stats, AgentMail reply counts)
- Which lanes or channels to focus on

# Minimum Context Needed

- `logs/experiments.md` (what was tested)
- `logs/decisions.md` (what was changed)
- Most recent Gabriel memory from Supabase

# Workflow

1. **Pull available data** — what numbers does Alfred have access to?
2. **Identify top performers** — what content, pages, or outreach is performing best?
3. **Identify weak performers** — what is underperforming relative to goal?
4. **Find the pattern** — is there a consistent difference between winners and losers?
5. **Extract lessons** — what does this tell us about the ICP, the platform, the angle, or the timing?
6. **Update memory** — save the lessons in the right places
7. **Recommend next 3 actions** — specific and actionable, not vague

# What Gabriel Tracks

| Metric | Source | Meaning |
|---|---|---|
| Leads found per run | Supabase | Lead scout effectiveness |
| Outreach drafts approved | Supabase | How many leads make it past Alfred's filter |
| AgentMail reply rate | Supabase / AgentMail | Outreach message quality |
| Content pieces published | Supabase | Content volume by lane |
| Top 3 actions completed | Gabriel memory | Alfred's follow-through rate |
| Carry-forward age | Gabriel memory | How many items are stuck |

# Decision Rules

- Never declare a trend from less than 7 data points
- If a lane has no data, flag it as "no signal yet" — do not guess
- If a carry-forward item is more than 5 days old, escalate it to Alfred's top 3 actions
- If the same type of outreach is rejected by Alfred 3+ times, flag it as a pattern — the template may need revision
- Winning patterns get documented in the relevant skill's examples.md

# Common Failure Modes

1. **Reviewing data that doesn't exist yet** — don't fabricate performance numbers
2. **Drawing conclusions from too few data points** — wait for 7+ examples
3. **Recommending generic next steps** — every recommendation must be specific to what the data shows
4. **Not updating skill files with lessons** — lessons that stay in reports don't improve the system
5. **Ignoring carry-forward items** — old unresolved items compound into overwhelm

# Recovery Steps

No data available → report what is missing and what would be needed to measure it
Insufficient data points → flag it, give directional read only, recommend longer observation period
Stale carry-forward items → surface them immediately as top priority

# Output Format

```
ANALYTICS REVIEW
Period: [date range]
Lanes reviewed: [list]

TOP PERFORMERS:
[What is working well — specific examples]

WEAK PERFORMERS:
[What is underperforming — specific examples]

PATTERN IDENTIFIED:
[What consistent difference separates winners from losers]

LESSONS:
1. [Specific lesson with evidence]
2. [Specific lesson with evidence]
3. [Specific lesson with evidence]

SKILL UPDATES RECOMMENDED:
[Which skill files should be updated with these lessons]

CARRY-FORWARD REVIEW:
[List any items older than 5 days — escalate to top 3 if needed]

TOP 3 ACTIONS FOR ALFRED:
1. [Specific action — what to do, why, expected outcome]
2. [Specific action — what to do, why, expected outcome]
3. [Specific action — what to do, why, expected outcome]

STATUS: pending_review
```

# Memory Update Rules

- All lessons → `logs/decisions.md`
- Winning content patterns → `skills/content-engine/examples.md`
- Failing outreach patterns → `skills/content-engine/failure-log.md`
- Experiment conclusions → `logs/experiments.md`
- Skill improvement proposals → `sip_backlog` in Supabase

# Examples

See `examples.md` in this skill folder.
