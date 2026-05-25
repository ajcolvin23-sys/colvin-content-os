# Research Loop Runner — Automation Spec

The master orchestration spec. When Alfred says "run the research loop," this file defines what Gabriel does, in what order, and how it hands off between daily, weekly, and monthly cycles.

## What Is The Research Loop

The research loop is Gabriel's self-improvement engine:

```
Observe → Research → Extract Patterns → Judge Evidence →
Propose Tests → Update Memory → Improve Skills → Repeat
```

The runner coordinates three automation specs:
1. `daily-research-loop.md` — single-topic daily session
2. `weekly-research-review.md` — weekly synthesis
3. `monthly-strategy-synthesis.md` — monthly strategy distillation

## Trigger Commands

| Alfred Says | What Runs |
|-------------|-----------|
| "run daily research [topic]" | daily-research-loop |
| "run daily research" | daily-research-loop (auto-selects topic from queue) |
| "run weekly review" | weekly-research-review |
| "run monthly synthesis" | monthly-strategy-synthesis |
| "run the research loop" | daily-research-loop (selects highest-priority topic) |
| "research [topic]" | daily-research-loop on that specific topic |

## Research Priority Queue

Gabriel selects topics in this order when Alfred doesn't specify:

1. Topics flagged `priority: high` in `research-loop/RESEARCH_TOPICS.md`
2. Topics that have open experiment proposals (need follow-up research)
3. Topics not researched in 14+ days
4. Topics tied to active campaigns or upcoming deadlines
5. Random selection from medium-priority queue

## One-Topic Discipline

**Hard rule**: Every research run covers exactly one topic.

If Alfred requests multiple topics in one session, Gabriel:
1. Acknowledges all topics
2. Researches the highest-priority one completely
3. Logs the remaining topics to the queue
4. Reports which topics were deferred

## Evidence Routing Summary

| Evidence Level | Auto-Action | Requires Alfred |
|---------------|-------------|-----------------|
| 1 — Weak/untested | Log in research-log.md | No |
| 2 — Interesting pattern | Log in research-log.md, note for next session | No |
| 3 — Credible external evidence | Propose experiment | Alfred approves experiment design |
| 4 — Repeated elite operator pattern | Propose to memory | Alfred approves memory promotion |
| 5 — Proven in Alfred's own data | Propose to memory + skill update | Alfred approves both |

## Loop Health Checks

Gabriel self-monitors these indicators:

| Indicator | Threshold | Action |
|-----------|-----------|--------|
| Days since last daily research | >5 days | Flag in run log |
| Proposed memory items unreviewed | >10 items | Remind Alfred |
| Rejected findings re-proposed | Any | Block and notify Alfred |
| Experiment backlog | >5 unstarted | Prioritize experiment design over new research |
| Skills with 3+ unaddressed failures | Any | Trigger skill-improvement session |

## Current Automation Status

| Component | Status | Gate to Advance |
|-----------|--------|-----------------|
| Daily research loop | Manual trigger | 10 successful runs |
| Weekly review | Manual trigger | Alfred never to automate (requires review) |
| Monthly synthesis | Manual trigger | Alfred never to automate (requires review) |
| Topic auto-selection | Draft | 10 successful manual selections |
| Evidence routing | Active | No gate — built in |

## Run Logging

Every loop run appends to `logs/run-log.md` with:
- Date and time
- Topic researched
- Evidence level achieved
- Next action taken
- Files written
- Any failures
