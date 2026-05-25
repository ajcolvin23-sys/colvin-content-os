---
name: workflow-extraction
description: Use this skill when Gabriel needs to convert a research finding into a numbered, executable workflow that can be saved to Gabriel's workflow library and run in future sessions.
status: Draft / Needs Real-World Validation
---

# Purpose

Converts validated research findings into reusable, numbered workflow documents that Gabriel can load and execute in any future session. The output is a workflow file, not a summary.

# When To Use

- After any research session produces a Level 3+ finding with a process to extract
- When Alfred says "turn that into a workflow"
- When a repeated task pattern has been identified that should be standardized
- After a successful run that should be repeatable

# When Not To Use

- Before evidence scoring (always score first — use `evidence-review` or `market-research-loop`)
- When the finding is Level 1–2 (log only — don't extract a workflow from weak evidence)
- When the task is to run an existing workflow (just load the workflow file)

# Required Inputs

- The validated finding (Level 3+ evidence)
- The business lane it applies to
- The trigger condition — when does this workflow activate?

# Minimum Context Needed

- The research output artifact (from `RESEARCH_OUTPUT_FORMAT.md`)
- `learning-group/workflow-extractor.md` (extraction protocol)

# Workflow

1. Confirm evidence level is ≥ 3 (decline extraction if lower)
2. Name the workflow (short-kebab-case, specific)
3. Define the trigger — exact condition that activates this workflow
4. Write numbered steps — each step is ONE action, specific enough to execute
5. Add decision rules — what to do in edge cases
6. Map to existing skill or propose as new workflow file
7. Assign maturity status: `Draft / Needs Real-World Validation`
8. Save to the appropriate location:
   - Belongs in a skill → add to `skills/[skill-name]/SKILL.md` under workflow section
   - Standalone → save to `automation-os/gabriel/workflows/[workflow-name].md`
9. Add to `logs/workflow-extraction-log.md`
10. Propose for Alfred's review if it changes an existing skill

# Decision Rules

- All new workflows start at `Draft / Needs Real-World Validation`
- Do not mark `Stable` until run 5+ times without correction
- If workflow belongs inside an existing skill → do not create a new file; update the skill
- If workflow creates a new loop (runs daily/weekly) → add to `automation/` folder

# Quality Checklist

- [ ] Evidence level confirmed ≥ 3 before extraction
- [ ] Workflow name is specific (not "lead gen workflow")
- [ ] Trigger condition is precise
- [ ] Each step is ONE action (not "research and write")
- [ ] Decision rules cover main edge cases
- [ ] Maturity status is `Draft`
- [ ] Saved to correct location
- [ ] Logged in workflow-extraction-log.md

# Common Failure Modes

1. **Extracting from Level 1–2 evidence** — produces unproven workflows that mislead Gabriel
2. **Vague steps** — "personalize the message" is not a step. "Check prospect's last 3 posts for pain language" is.
3. **Missing trigger condition** — if Gabriel doesn't know when to run it, it won't be run
4. **Creating a new file when the workflow belongs in an existing skill** — causes fragmentation

# Recovery Steps

If steps are vague → rewrite using the test: "If someone read this step, could they execute it without asking a question?"
If trigger is unclear → ask Alfred to clarify the exact condition

# Output Format

```
EXTRACTED WORKFLOW
Name: [short-kebab-name]
Based on: [research finding + evidence level]
Trigger: [exact activation condition]
Status: Draft / Needs Real-World Validation
Location: [skills/[skill-name]/SKILL.md | workflows/[name].md | automation/[name].md]

WORKFLOW:
1. [action]
2. [action]
3. [action]

DECISION RULES:
- If [edge case] → [action]

NEXT ACTION: [route to Alfred for review | save and test]
```

# Memory Update Rules

After workflow runs 5× without correction → propose updating status to `Stable`.
After `Stable` status + consistent value → propose adding to daily or weekly automation.

# Examples

See `examples.md`.
