# Weekly Research Review — Automation Spec

Automation spec for Gabriel's weekly research synthesis. The workflow steps are in `research-loop/WEEKLY_RESEARCH_WORKFLOW.md`. This file governs how that workflow is triggered and what it produces.

## Trigger

- **Timing**: Friday (or end of Alfred's active week)
- **Manual trigger**: "run weekly research review" or "Friday synthesis"
- **Prerequisite**: At least 3 daily research sessions completed this week

## Inputs

| Input | Source | Required |
|-------|--------|----------|
| week_start | YYYY-MM-DD | Yes |
| week_end | YYYY-MM-DD | Yes |
| daily_research_files | research-output/daily/ (this week's) | Yes |
| experiment_log | logs/experiment-results.md | Yes |
| proposed_memory | memory/proposed-research-memory.md | Yes |

## Step Sequence

```
1. LOAD_SKILL: weekly-research-review
2. COLLECT_DAILY_OUTPUTS: all research-output/daily/[this week] files
3. REVIEW_PROPOSED_MEMORY: flag items ready for Alfred's approval
4. REVIEW_PROPOSED_SKILLS: flag skill updates with strong evidence
5. RUN_ELITE_COMPANY_STUDY: one company, one lens (elite-company-analysis skill)
6. RUN_TOP_EARNER_STUDY: one operator, one lens (top-earner-analysis skill)
7. RUN_SPORTS_BRAND_STUDY: if Girls Got Game lane active (sports-branding-analysis skill)
8. IDENTIFY_WEEKLY_PATTERNS: cross-session themes across this week's research
9. PROMOTE_QUALIFIED_MEMORY: move evidence-5 items from proposed → Alfred review queue
10. GENERATE_SKILL_PROPOSALS: based on new patterns
11. DESIGN_EXPERIMENT_RECOMMENDATIONS: one experiment per validated insight
12. WRITE_WEEKLY_REPORT: save to research-output/weekly/YYYY-WW-weekly-review.md
13. WRITE_LATEST: overwrite research-output/latest-weekly-review.json
14. WRITE_RUN_LOG: append to logs/run-log.md
```

## Output Files

| File | Description |
|------|-------------|
| `research-output/weekly/YYYY-WW-weekly-review.md` | Full synthesis report |
| `research-output/latest-weekly-review.json` | Always-current weekly output |
| `logs/approved-learnings.md` | Items flagged for Alfred's approval |

## Weekly Report Sections

1. Research sessions this week (count, topics, average evidence level)
2. Highest-confidence findings (level 4–5 only)
3. Patterns across sessions
4. Elite company insight
5. Top earner insight
6. Sports/brand insight (if applicable)
7. Memory proposals ready for Alfred review
8. Skill update proposals
9. Experiment recommendations
10. Research priority queue for next week

## Automation Status

**Current**: Manual trigger only.
**Target**: Alfred triggers explicitly each Friday.
**Gate**: Never fully automated — Alfred review is required step, not optional.
