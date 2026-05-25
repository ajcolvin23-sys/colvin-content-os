---
file: workflow-extractor.md
role: Workflow for converting a research finding into a Gabriel-executable process
load: After evidence-judge confirms a finding is Level 3 or higher
---

# Workflow Extractor

## Mission

Convert the finding into a numbered, executable process that Gabriel can run tomorrow.
Not inspiration. Not a summary. A process.

## The Test

If someone read the extracted workflow and asked "what do I do next?" and couldn't answer from the workflow alone — the extraction failed.

## Step 1: Name the Workflow

Give it a short, specific name:
- Bad: "Email outreach improvement"
- Good: "Pain-first LinkedIn opener for automation buyers"

## Step 2: Define the Trigger

When does Gabriel run this workflow?
- Bad: "When doing outreach"
- Good: "When drafting a LinkedIn connection request for an SMB owner who has posted about being overwhelmed"

## Step 3: Write the Steps

Numbered list. Each step is one action. Specific enough to execute without interpretation.

Bad:
1. Personalize the opening
2. Add value

Good:
1. Check the prospect's last 3 LinkedIn posts for specific pain language
2. Open with their exact pain word ("I saw you mentioned your team is stretched thin...")
3. Name the specific outcome Alfred delivers ("I help Indianapolis service businesses cut manual follow-up time by 80%")
4. One CTA only: ask a yes/no question, not for a meeting

## Step 4: Add Decision Rules

What do you do when the workflow hits an edge case?
- If the prospect has no recent posts → use their job title's most common pain from LEAD_SIGNAL_LIBRARY.md
- If the prospect's industry has compliance requirements → route to qa-publish-guard first

## Step 5: Map to a Gabriel Skill or Checklist

Does this workflow belong inside an existing skill?
- If YES → propose adding it to that skill's SKILL.md or checklist.md
- If NO → propose it as a new workflow file in `automation-os/gabriel/workflows/`

## Step 6: Rate the Workflow's Maturity

- Status: Draft — written from research, never run
- Status: Testing — Gabriel has run it 1–3 times
- Status: Stable — run 5+ times without correction

All new workflows start at Draft.

## Output Format

```
EXTRACTED WORKFLOW
Name: [short-kebab-name]
Based on: [finding + source]
Evidence level: [1–5]
Trigger: [exact condition that activates this workflow]
Status: Draft / Needs Real-World Validation

STEPS:
1. [action]
2. [action]
3. [action]

DECISION RULES:
- If [edge case] → [what to do]

MAPS TO SKILL: [skill name or "new workflow"]
PROPOSED FILE: [path]
NEXT ACTION: [who does what]
```
