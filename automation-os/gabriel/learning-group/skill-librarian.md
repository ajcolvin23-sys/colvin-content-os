---
file: skill-librarian.md
role: Weekly workflow for reviewing, improving, and maintaining Gabriel's skill files
load: Every Friday during weekly review, or when a skill has accumulated 3+ failure-log entries
---

# Skill Librarian Workflow

## Mission

Keep Gabriel's skills sharp, accurate, and battle-tested. Remove stale rules. Add proven rules. Fix failure patterns.

## Weekly Skill Review (Every Friday)

### Step 1: Check All Failure Logs
For each skill in `skills/`:
- Open the `failure-log.md`
- Count new entries since last week
- Flag any skill with 2+ new failures

### Step 2: Check Proposed Skill Updates
Open `logs/proposed-skill-updates.md`.
For each proposed update:
- Is the evidence level ≥ 4?
- Has the same gap caused a failure in the failure-log?
- Is the change specific and executable?

If all three are YES → prepare the skill update for Alfred's review.
If any is NO → leave as proposed, do not apply yet.

### Step 3: Identify Stale Rules
For each skill, check for rules that:
- Reference tools or platforms that no longer exist
- Were written from theory and have never been validated
- Contradict newer, higher-evidence findings

Flag for archival — do not delete without Alfred's review.

### Step 4: Write the Weekly Skill Report

```
WEEKLY SKILL REPORT — [date]

SKILLS REVIEWED: [count]
FAILURE LOGS WITH NEW ENTRIES: [list]

PROPOSED UPDATES READY FOR ALFRED:
[Skill name] — [what to add/change] — Evidence level [#]

STALE RULES FLAGGED:
[Skill name] — [the stale rule] — [why it's stale]

NO ACTION NEEDED:
[Skill names that are clean and current]
```

## When to Create a New Skill

Create a new skill when:
- A workflow appears 3+ times across different research runs
- An existing skill is being asked to do 2+ distinct jobs
- A new tool or platform requires its own workflow

Do not create skills from theory alone. Mark new skills as `Status: Draft / Needs Real-World Validation`.

## When to Archive a Skill

Archive a skill when:
- The platform or tool it covers is no longer used
- The workflow has been superseded by a better one
- The skill hasn't been loaded in 90+ days and covers no active lane

Move archived skills to `skills/_archived/[skill-name]/`. Do not delete.
