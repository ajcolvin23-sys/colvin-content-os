# Daily Research Loop — Automation Spec

Defines how Gabriel runs the daily research cycle. This is the automation version of `research-loop/DAILY_RESEARCH_WORKFLOW.md`. That file describes the steps. This file describes how those steps are triggered, sequenced, and logged for automation.

## Trigger

- **Manual**: Alfred types "run daily research" or "research [topic]"
- **Scheduled** (when automation-ready): Weekday mornings, before content generation
- **Reactive**: After a failed experiment or QA rejection that signals a knowledge gap

## Inputs Required

| Input | Source | Required |
|-------|--------|----------|
| research_topic | Alfred instruction or RESEARCH_TOPICS.md priority queue | Yes |
| business_focus | Business lane or "all" | Yes |
| time_limit_minutes | Default 20 | No |
| evidence_standard_floor | Default 3 | No |

## Step Sequence

```
1. LOAD_SKILL: market-research-loop
2. SELECT_TOPIC: from RESEARCH_TOPICS.md priority queue (or Alfred's instruction)
3. CONFIRM_TOPIC_COUNT: exactly one topic per run
4. CHECK_REJECTED_FINDINGS: scan rejected-findings.md for prior rejections on this topic
5. EXECUTE_RESEARCH: 20-minute time-boxed session
6. SCORE_EVIDENCE: load evidence-review skill, apply EVIDENCE_STANDARDS.md
7. EXTRACT_WORKFLOW: if finding warrants it, load workflow-extraction skill
8. WRITE_OUTPUT: save to research-output/daily/YYYY-MM-DD-[topic-slug].json
9. ROUTE_PROPOSAL: based on evidence_level and next_action field
   - Level 1–2: log-only → logs/research-log.md
   - Level 3: propose-experiment → logs/experiment-results.md
   - Level 4: propose-memory → memory/proposed-research-memory.md
   - Level 5: propose-skill-update → skill-improvements/proposed-updates.md
10. WRITE_RUN_LOG: append to logs/run-log.md
11. WRITE_RESEARCH_LOG: append to logs/research-log.md
12. UPDATE_EVIDENCE_LOG: append to logs/evidence-review-log.md
```

## Output Files

| File | Description |
|------|-------------|
| `research-output/daily/YYYY-MM-DD-[topic].json` | Full research output in JSON schema |
| `research-output/latest-daily-research.json` | Always-current latest daily result |
| `logs/research-log.md` | Running log of all sessions |
| `logs/run-log.md` | Operational run record |

## Failure Handling

| Failure Type | Action |
|-------------|--------|
| No credible source found | Log as Level 1, note source gap |
| Topic already researched this week | Skip, select next priority topic |
| Rejected finding re-discovered | Log in rejected-findings.md with "retry" note |
| Time limit exceeded | Log partial finding, schedule continuation |

## Automation Status

**Current**: Manual trigger only. Alfred must initiate.
**Target**: Stable skill maturity required before scheduling automation.
**Gate**: Alfred must approve automation trigger after 10 successful manual runs.
