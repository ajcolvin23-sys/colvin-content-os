# Weekly Learning Review — Workflow

Gabriel's Friday synthesis of everything learned this week across daily loops, research sessions, experiments, and corrections. Separate from weekly research review (which is about external knowledge). This is about how Gabriel improved as an operator.

## Trigger

- "run weekly learning review"
- "what did we learn this week"
- Friday end-of-session prompt from Alfred

## Steps

```
1. COLLECT_THIS_WEEK
   - All entries from logs/learning-log.md this week
   - All entries from skills/*/failure-log.md this week
   - All experiment check-ins from logs/experiment-results.md
   - Any Alfred corrections during sessions this week

2. SKILL_HEALTH_CHECK
   For each active skill:
   - Correction count this week
   - Failure count this week
   - QA pass rate (if trackable)
   - Output: skills that need improvement vs. skills performing well

3. PATTERN_IDENTIFICATION
   - Which correction types repeated across multiple sessions?
   - Which skills failed more than once?
   - Which approval threshold was crossed most often?
   - Which QA checklist item was most frequently failed?

4. MEMORY_REVIEW
   - Review memory/proposed-memory.md — any items ready for Alfred's decision?
   - Review memory/proposed-research-memory.md — items ready for promotion?
   - Remind Alfred of items approaching 90-day expiration

5. SKILL_PROPOSALS_REVIEW
   - Review skill-improvements/proposed-updates.md — low-risk items Alfred can approve fast
   - Prioritize: which skill improvement would have the biggest impact next week?

6. EXPERIMENT_STATUS
   - Running experiments: are they on track?
   - Concluded experiments: extract winner, propose memory update
   - Stalled experiments: recommend restart or close

7. PERFORMANCE_SUMMARY
   - Tasks completed successfully this week
   - Tasks that required significant correction
   - Net improvement direction (getting better / flat / worse at specific skills)

8. WRITE_WEEKLY_LEARNING_REPORT
   - Save to logs/learning-log.md (weekly summary entry)
   - Key sections: top corrections, skill health, patterns, Alfred decisions needed

9. NEXT_WEEK_PRIORITIES
   - Which skills to focus on improving
   - Which experiments to run
   - Which research topics pair with skill gaps
```

## Output

- Weekly summary appended to `logs/learning-log.md`
- Skill health ratings in `logs/skill-change-log.md`
- Prioritized improvement list delivered to Alfred

## Rules

- Never auto-apply anything from this review. Propose → Alfred approves.
- Always separate "pattern this week" from "happened once this week."
- If the same skill failed 3+ weeks in a row: escalate to skill rebuild, not just update.
