---
name: workflow-debugging
description: Use this skill when Gabriel needs to diagnose why a workflow, skill, or automation step failed — and produce a specific, actionable fix.
---

# Purpose

Systematically identifies the root cause of a Gabriel workflow failure and produces a specific fix that prevents the same failure from recurring.

# When To Use

- A skill produced an incorrect or low-quality output
- An automation step failed or produced no output
- Alfred corrected Gabriel's work — something went wrong upstream
- A checklist was followed but the output was still wrong

# When Not To Use

- For code debugging (use Claude Code directly)
- For evidence review (use `evidence-review`)
- For skill improvement after diagnosis (use `skill-improvement`)

# Required Inputs

- Description of what failed (what was produced vs. what was expected)
- Which skill, workflow, or step was involved
- Any error messages or logs available

# Workflow

1. State the failure clearly: what was expected vs. what happened
2. Identify where in the workflow the failure occurred (which step)
3. Diagnose the root cause using the classification below
4. Propose the specific fix
5. Route the fix to the right tool:
   - Bad routing → update CONTEXT_ROUTER.md
   - Bad skill rule → use `skill-improvement`
   - Missing context → add to skill's minimum context section
   - Bad checklist → update the checklist
   - Tool failure → log and escalate to Claude Code
6. Log in `logs/failed-runs.md`

# Failure Classification

| Type | Description | Fix |
|---|---|---|
| Bad routing | Wrong skill was loaded for the task | Update CONTEXT_ROUTER.md |
| Missing context | Right skill, but missing a required context file | Update skill's Minimum Context section |
| Bad rule | Skill rule produced wrong output | Use skill-improvement to update the rule |
| Weak checklist | Checklist didn't catch the error | Add the missing check |
| Tool failure | External tool (Firecrawl, Supabase, GPT) returned bad data | Log and add retry rule |
| Evidence skip | Proposals made without evidence scoring | Add evidence-review step to workflow |
| Context bloat | Too much context was loaded, signal was lost | Reduce context load, add progressive disclosure step |
| Compliance miss | Compliance-adjacent content wasn't flagged | Add compliance check to skill workflow |

# Quality Checklist

- [ ] Failure stated clearly (expected vs. actual)
- [ ] Step where failure occurred identified
- [ ] Root cause classified from the table above
- [ ] Specific fix written (not "improve the skill")
- [ ] Fix routed to correct tool
- [ ] Logged in logs/failed-runs.md

# Output Format

```
WORKFLOW DEBUG REPORT
Date: YYYY-MM-DD
Skill/Workflow: [name]
Step where failure occurred: [step number/name]

WHAT HAPPENED:
Expected: [what should have been produced]
Actual: [what was produced]

ROOT CAUSE: [failure type from classification table]

SPECIFIC FIX:
[Exact change to make — file + section + text]

FIX ROUTE: [skill-improvement | update CONTEXT_ROUTER | update checklist | escalate to Claude Code]
STATUS: proposed | applied
```

# Examples

See `examples.md`.
