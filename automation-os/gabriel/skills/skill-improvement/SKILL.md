---
name: skill-improvement
description: Use this skill when Gabriel needs to propose or apply updates to an existing skill file based on failures, research findings, or Alfred's corrections.
---

# Purpose

Keeps Gabriel's skills accurate and battle-tested by converting failures, corrections, and validated research into specific skill file updates — with proper approval gates.

# When To Use

- A skill produced a bad output (failure logged in failure-log.md)
- Alfred corrected Gabriel's output — identify which skill failed and why
- A research finding at Level 4+ suggests a new rule for an existing skill
- Weekly skill review (skill-librarian role)
- A skill has 2+ failure-log entries of the same type

# When Not To Use

- For updating memory (use `memory-curation`)
- For creating a new skill from scratch (don't — map to an existing skill first)
- For routine research (use `market-research-loop`)

# Required Inputs

- The skill to be updated
- The specific failure or lesson
- The evidence supporting the proposed change

# Minimum Context Needed

- The affected skill's SKILL.md and checklist.md
- The failure-log.md entry or research finding
- `learning-group/promotion-rules.md` (approval thresholds)

# Workflow

1. Read the affected skill's SKILL.md and checklist.md
2. Identify the specific failure mode or gap
3. Check if this failure type appears in the failure-log.md
4. Write the proposed update — specific text to add/change, not vague improvements
5. Assess update risk level:
   - Low risk (typo, broken link, adding an example) → log and apply
   - Medium risk (adding a new rule) → propose to Alfred
   - High risk (removing or contradicting an existing rule) → require Alfred approval
6. If proposing → add to `logs/proposed-skill-updates.md`
7. If approved → update the skill file and log in `logs/skill-change-log.md`
8. Re-run the workflow that failed to verify the fix works

# Decision Rules

- Never apply medium/high-risk updates without Alfred's review
- Always quote the exact text to add/change — not "improve the workflow section"
- If the same failure appears 3+ times → escalate urgency to Alfred
- If a proposed update contradicts an existing rule → flag the conflict explicitly

# Quality Checklist

- [ ] Affected skill file read
- [ ] Specific failure or gap identified
- [ ] Proposed change is exact text (not vague)
- [ ] Risk level assessed
- [ ] Routed correctly (apply directly | propose to Alfred)
- [ ] Logged in skill-change-log.md if applied
- [ ] Workflow re-run to verify if applied

# Common Failure Modes

1. **Vague proposals** — "improve the workflow" is not a skill update. "Add step 4.5: check compliance flag before routing to qa-publish-guard" is.
2. **Applying high-risk changes without approval** — removing an existing rule can break a working workflow
3. **Not re-running after fix** — a proposed fix that wasn't tested is still a hypothesis

# Recovery Steps

If proposed change is too vague → return and write the exact text to add/change

# Output Format

```
SKILL UPDATE PROPOSAL
Skill: [skill-name]
File: [SKILL.md | checklist.md | examples.md | failure-log.md]
Based on: [failure log entry | research finding | Alfred correction]
Evidence level: [1–5 if from research | "failure" if from failure log]

PROPOSED CHANGE:
Section: [section name]
Action: [add | modify | remove | archive]
Current text: [exact current text if modifying/removing]
Proposed text: [exact new text]

Risk level: [low | medium | high]
Status: proposed | approved | applied
```

# Memory Update Rules

When a skill update is successfully applied and verified → log in `logs/skill-change-log.md`.

# Examples

See `examples.md`.
