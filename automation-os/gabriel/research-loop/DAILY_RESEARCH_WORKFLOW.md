---
file: DAILY_RESEARCH_WORKFLOW.md
role: Step-by-step daily research run — one topic, one workflow, one experiment, one log entry
load: When starting a daily research session
---

# Daily Research Workflow

## Runtime: 20–45 minutes (or one focused Claude Code session)

## Step 1: Pick the Topic

Load `RESEARCH_TOPICS.md`.
Select one topic based on:
- Alfred's current business priority (check `gabriel-config.json` active lanes)
- Rotation schedule (don't repeat a category two days in a row)
- Any open carry-forward research items from yesterday's memory

Record the chosen topic and category before starting.

## Step 2: Select the Skill

Based on topic category, load the relevant skill:

| Category | Skill |
|---|---|
| Marketing | `skills/marketing-intelligence` |
| Conversion | `skills/conversion-research` |
| Lead generation | `skills/lead-intelligence` |
| Automation buyers | `skills/automation-buyer-detection` |
| Elite company | `skills/elite-company-analysis` |
| Top earner | `skills/top-earner-analysis` |
| Sports branding | `skills/sports-branding-analysis` |
| Workflow extraction | `skills/workflow-extraction` |
| General research | `skills/market-research-loop` |

Load ONLY the selected skill. Do not load all skills.

## Step 3: Research

Using the loaded skill's workflow:
1. Identify 1–3 credible sources (from `RESEARCH_SOURCES.md`)
2. Extract the most relevant finding for Alfred's context
3. Apply the 7-lens analysis from the relevant framework document

Time-box research to 20 minutes. Stop researching. Start extracting.

## Step 4: Score the Evidence

Load `EVIDENCE_STANDARDS.md`.
Score:
- Evidence level (1–5)
- Source quality tier
- Classification (fact | inference | pattern | hypothesis)

If evidence level is 1 → log and stop. No proposals today.
If evidence level is 2 → log + experiment recommendation only.
If evidence level is 3+ → proceed to full output.

## Step 5: Extract the Workflow

Write ONE executable workflow from the finding.
Format: numbered steps, specific enough to run tomorrow.
Not "be more specific in outreach." Yes "open with the person's specific job pain, not their company name."

## Step 6: Produce the Output

Fill out the complete Research Output Format from `RESEARCH_OUTPUT_FORMAT.md`.
Save to:
- `logs/research-log.md` (append entry)
- `research-output/latest-daily-research.json` (overwrite)

## Step 7: Route the Proposals

Based on evidence level:

- Evidence ≥ 3 → add entry to `memory/proposed-research-memory.md`
- Evidence ≥ 4 → add entry to `logs/proposed-skill-updates.md`
- Evidence = 5 (only after real business data) → propose as default behavior in `logs/approved-learnings.md` pending Alfred approval

## Step 8: Produce the Daily Summary

```
DAILY RESEARCH SUMMARY — [date]
Topic: [topic]
Category: [category]
Business Focus: [lane]

ONE INSIGHT:
[1 sentence — the key finding]

ONE WORKFLOW:
[3-step version of the extracted process]

ONE EXPERIMENT IDEA:
[Hypothesis + control + variant + metric]

ONE LEAD-GEN IDEA:
[Specific prospect type + outreach angle]

ONE SKILL/CHECKLIST UPDATE PROPOSAL:
[Skill name + what to add + evidence level]

ONE MEMORY PROPOSAL:
[What to save + why + evidence level]

ONE NEXT ACTION:
[Who does what by when]
```

## Step 9: Log the Run

Add to `logs/research-log.md`:
- Date, topic, evidence level, output summary, proposals made

## Step 10: Update Memory

Append to `memory/proposed-research-memory.md` only if evidence ≥ 3.
Never write to `memory/approved-research-memory.md` without Alfred's review.
