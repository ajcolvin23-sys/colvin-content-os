# Monthly Strategy Synthesis — Automation Spec

Automation spec for Gabriel's monthly research synthesis. The process steps are in `research-loop/MONTHLY_RESEARCH_WORKFLOW.md`. This file governs triggers, inputs, and outputs.

## Trigger

- **Timing**: Last Friday of each month, after the weekly review
- **Manual trigger**: "run monthly synthesis" or "monthly strategy review"
- **Prerequisite**: At least 3 weekly reviews completed this month

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| month | YYYY-MM | Yes |
| weekly_review_files | research-output/weekly/ (this month's) | Yes |
| approved_memory | memory/approved-research-memory.md | Yes |
| proposed_memory | memory/proposed-research-memory.md | Yes |
| experiment_log | logs/experiment-results.md | Yes |
| skill_change_log | logs/skill-change-log.md | Yes |

## Step Sequence

```
1. LOAD_SKILL: weekly-research-review (monthly mode)
2. COLLECT_WEEKLY_OUTPUTS: all weekly reviews from this month
3. CROSS_COMPANY_COMPARISON: patterns across elite company studies this month
4. DISTILL_HIGH_CONFIDENCE_PRINCIPLES: evidence level 4–5 patterns that appeared 3+ times
5. ARCHIVE_WEAK_ASSUMPTIONS: identify approved memory with confidence <5.0, move to archived
6. GENERATE_WORKFLOWS: extract 1–3 new workflows from this month's strongest findings
7. IDENTIFY_OFFER_IDEAS: patterns that suggest new product/offer opportunities for Alfred
8. BUILD_LEAD_GEN_SYSTEMS: signal patterns that improve lead scoring accuracy
9. DEVELOP_CONTENT_FRAMEWORKS: recurring messaging patterns → content frameworks
10. RECOMMEND_SKILL_IMPROVEMENTS: skills with 3+ corrections this month
11. RECOMMEND_AUTOMATION: workflows stable enough to move toward automation
12. WRITE_MONTHLY_SYNTHESIS: save to research-output/monthly/YYYY-MM-synthesis.md
13. WRITE_LATEST: overwrite research-output/latest-monthly-synthesis.json
14. WRITE_RUN_LOG: append to logs/run-log.md
```

## Monthly Report Sections

1. Research volume this month (sessions, topics, average evidence level)
2. Highest-confidence principles (evidence 5, appeared 3+ times)
3. Cross-company patterns (what elite companies share)
4. Emerging trends (AI/automation space)
5. Offer ideas (1–3 specific, with evidence)
6. Lead-gen system improvements
7. Content frameworks with staying power
8. Skills recommended for improvement
9. Workflows recommended for automation
10. Next month's research priority queue

## Output Files

| File | Description |
|------|-------------|
| `research-output/monthly/YYYY-MM-synthesis.md` | Full monthly report |
| `research-output/latest-monthly-synthesis.json` | Always-current monthly output |
| `memory/proposed-research-memory.md` | Updated with new proposals |
| `logs/approved-learnings.md` | High-confidence principles ready for Alfred |

## Automation Status

**Current**: Manual trigger only.
**Gate**: Alfred reviews monthly synthesis before any memory promotions are applied.
**Never auto-apply**: Monthly synthesis generates proposals, not decisions.
