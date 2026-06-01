# Weekly Skill Improvement Loop

Run this every Friday (or have Alfred trigger it manually): "Gabriel, run the weekly skill review."

## Purpose

Gabriel reviews the past 7 days of runs, failures, corrections, and outputs — then proposes specific improvements to the relevant skill files. This is how the system gets smarter week over week.

## Workflow

### Step 1: Pull the Week's Data
- Review the last 7 daily run memory records from Supabase
- Review all entries in `logs/failures.md` from this week
- Review any `failure-log.md` entries updated this week
- Review AgentMail reply stats (how many replies, how many qualified)
- Note any corrections Alfred made to Gabriel's drafts

### Step 2: Identify Failure Patterns
For each failure or correction, ask:
- Which skill produced this output?
- What was the specific failure mode?
- Is this the first time or a repeat?
- What rule, warning, or checklist item would prevent this next time?

### Step 3: Propose Skill Updates
For each identified pattern, write a specific update:
- Add a rule to SKILL.md
- Add a checklist item to checklist.md
- Add a failure entry to failure-log.md
- Update examples.md if a good/bad example would help

### Step 4: Review Carry-Forward Age
- Flag any carry-forward items older than 7 days
- Escalate them as top priority items for Alfred

### Step 5: Propose SIPs (Self-Improvement Proposals)
SIPs go into Supabase `sip_backlog` table:
- `sip_id`: SIP-001, SIP-002, etc.
- `area`: which skill or system component
- `description`: what should change and why
- `status`: open

### Step 6: Deliver the Weekly Report

```
WEEKLY SKILL REVIEW — [date range]

RUNS COMPLETED: [count]
LEADS FOUND: [count]
OUTREACH DRAFTED: [count]
CONTENT DRAFTED: [count]
REPLIES RECEIVED: [count]

FAILURES THIS WEEK:
[List specific failures with skill attribution]

SKILL UPDATES PROPOSED:
[List which files to update and what to add]

SIPs GENERATED:
[List new SIP proposals]

CARRY-FORWARD ESCALATIONS:
[Items older than 7 days that need Alfred's attention]

NEXT WEEK FOCUS:
[1-2 things that would most improve Gabriel's performance]
```

## This Is How Skills Become Battle-Tested

A skill created from theory is a theory.
A skill updated from real failures is a weapon.
Run this loop every week. Update the files. Watch the failure rate drop.
