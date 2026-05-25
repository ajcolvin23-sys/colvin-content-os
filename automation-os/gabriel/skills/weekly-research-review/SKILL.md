---
name: weekly-research-review
description: Use this skill every Friday to synthesize the week's daily research findings, study one elite company, one top earner, and one sports brand, identify repeated patterns, and build next week's research agenda.
---

# Purpose

Weekly synthesis that turns 5 days of individual research runs into patterns, promotes high-evidence findings, proposes skill/memory updates, and creates a focused agenda for the following week.

# When To Use

- Every Friday (or when Alfred triggers "Gabriel, run the weekly research review")
- After a high-output week where many findings need synthesis

# When Not To Use

- For running individual research sessions (use the specific research skill)
- For monthly strategy synthesis (use `monthly-strategy-synthesis.md` in automation/)

# Required Inputs

- This week's research-log.md entries
- This week's proposed-skill-updates.md entries

# Minimum Context Needed

- `logs/research-log.md` (this week's entries)
- `research-loop/WEEKLY_RESEARCH_WORKFLOW.md` (step-by-step)

# Workflow

Run `research-loop/WEEKLY_RESEARCH_WORKFLOW.md` step by step.

Steps 1–11 are documented there. This skill ensures:
- All steps complete before delivering the report
- Evidence is scored before anything is promoted
- The report is formatted correctly for Alfred's review

# Decision Rules

- Do not skip the elite company, top earner, or sports brand study even in a busy week
- Do not promote findings to approved memory — only to proposed memory
- The weekly report is for Alfred's review — deliver as a clear summary, not a data dump

# Quality Checklist

- [ ] All daily run logs reviewed
- [ ] Patterns across findings identified
- [ ] Elite company studied
- [ ] Top earner studied
- [ ] Sports/brand system studied
- [ ] Repeated patterns documented with evidence levels
- [ ] Proposed memory updates prepared
- [ ] Proposed skill updates prepared
- [ ] Experiments recommended
- [ ] Next week's agenda built (5 topics)
- [ ] Weekly report produced and saved to research-output/latest-weekly-review.json

# Output Format

Weekly Research Review format — see `research-loop/WEEKLY_RESEARCH_WORKFLOW.md` Step 11.

# Memory Update Rules

Promoted patterns from this review → `memory/proposed-research-memory.md`.
Experiment designs from this review → `logs/experiment-results.md` as proposed.

# Examples

See `examples.md`.
