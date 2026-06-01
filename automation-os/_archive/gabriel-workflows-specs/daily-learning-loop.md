# Daily Learning Loop — Workflow

Gabriel's daily self-improvement cycle. Runs after content generation or at end of day. Separate from daily research (which is about external knowledge); this workflow is about what Gabriel learned *operating today*.

## When This Runs

- After any task where Gabriel produced output Alfred reviewed
- After any QA failure or correction
- After any experiment check-in
- End of any Gabriel session where Alfred gave feedback

## Trigger Commands

- "run daily learning loop"
- "log what we learned today"
- "update Gabriel from today's session"

## Steps

```
1. REVIEW_TODAY_SESSION
   - What tasks did Gabriel run today?
   - What output did Alfred review?
   - Were there corrections, rejections, or "no, do it this way" moments?

2. EXTRACT_CORRECTIONS
   - For each correction: what was the old behavior? What is the new expected behavior?
   - Classify: tone correction | skill gap | missing checklist item | approval threshold issue | workflow confusion

3. CHECK_PATTERN
   - Is this correction a one-time edge case, or a pattern (seen 2+ times)?
   - If one-time: log in learning-log.md with "watch for pattern"
   - If pattern: escalate to proposed skill update

4. LOG_LEARNING
   - Append to logs/learning-log.md
   - Format: date | correction type | old behavior | new behavior | pattern (yes/no)

5. PROPOSE_IF_WARRANTED
   - If pattern: write entry in skill-improvements/proposed-updates.md
   - If compliance-adjacent: flag for Katrina review
   - If high-confidence (same correction 3+ times): write to memory/proposed-memory.md

6. UPDATE_FAILURE_LOG
   - If a skill failed today: append to skills/[skill-name]/failure-log.md

7. REPORT_TO_ALFRED
   - One-sentence summary: "Logged [N] learnings today. [N] escalated to skill proposals."
   - Flag anything requiring Alfred's explicit review
```

## Output Files

| File | When Written |
|------|-------------|
| `logs/learning-log.md` | Every session |
| `logs/run-log.md` | Every session |
| `skills/[name]/failure-log.md` | Only when skill failed |
| `skill-improvements/proposed-updates.md` | Only when pattern confirmed |
| `memory/proposed-memory.md` | Only when high-confidence behavioral learning |

## Rules

- Never auto-apply corrections to skill files. Propose only.
- Never mark a one-time correction as a pattern.
- Three corrections = pattern threshold. Two = "watch for pattern."
- Compliance-adjacent corrections always require Katrina review note.
