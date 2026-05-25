---
name: experiment-learning
description: Use this skill when reviewing concluded experiment results to extract lessons, declare winners correctly, and update memory or skills based on confirmed outcomes.
---

# Purpose

Reviews concluded experiments, applies the correct winner declaration rules, extracts the lesson, and routes the learning to memory or skills. Prevents premature winner declarations and ensures learnings are captured.

# When To Use

- An experiment has reached its minimum sample AND minimum days
- Alfred asks "what did we learn from the test?"
- Weekly review finds concluded experiments in the log

# When Not To Use

- For designing new experiments (use `experiment-design`)
- For setting up tests technically (use `experiment-platform-workflow`)
- For reviewing running (not yet concluded) experiments

# Required Inputs

- The experiment record from `logs/experiment-results.md`
- The actual performance data from GA4, Clarity, GrowthBook, PostHog, or Supabase DIY

# Minimum Context Needed

- `logs/experiment-results.md` (the experiment record)
- `learning-group/experiment-designer.md` (winner declaration rules)

# Workflow

1. Load the experiment record
2. Confirm: minimum sample met AND minimum days met
3. Review the data: primary metric result
4. Check: is the improvement ≥ the success threshold?
5. Declare winner:
   - Primary metric improved ≥ threshold AND consistent across period → declare winner
   - Improvement exists but < threshold → inconclusive (do not replace control)
   - No meaningful difference → control wins by default (maintain status quo)
6. Extract the lesson (WHY did the winner win?)
7. Route the learning:
   - Winner confirmed → add to `logs/approved-learnings.md`
   - Winner confirmed → propose skill/checklist update via `skill-improvement`
   - Winner confirmed → propose to `memory/proposed-research-memory.md`
8. Archive the losing variant (never delete)
9. Update experiment record with conclusion

# Decision Rules

- BOTH minimum sample AND minimum days must be met before declaring a winner
- Never declare a winner from early data
- Inconclusive = control wins. Do not replace a working element with an untested one.
- The WHY is as important as the winner — record both

# Quality Checklist

- [ ] Minimum sample met
- [ ] Minimum days met
- [ ] Primary metric compared to success threshold
- [ ] Winner declared correctly (or inconclusive)
- [ ] Lesson (WHY) extracted
- [ ] Learning routed to approved-learnings.md if winner confirmed
- [ ] Skill/memory update proposed if winner confirmed
- [ ] Losing variant archived
- [ ] Experiment record updated in logs/experiment-results.md

# Output Format

```
EXPERIMENT LEARNING
ID: EXP-[###]
Concluded: YYYY-MM-DD
Lane: [Alfred's lane]

WINNER: [control | variant | inconclusive]
PRIMARY METRIC RESULT: [what happened]
Success threshold met: [yes | no]

LESSON:
[WHY did the winner win? Specific mechanism.]

NEXT ACTIONS:
1. [Add to approved-learnings.md | Archive as inconclusive]
2. [Propose skill update to [skill-name] | No update needed]
3. [Propose memory update | No update needed]
```

# Examples

See `examples.md`.
