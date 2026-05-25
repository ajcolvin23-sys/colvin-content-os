---
file: MONTHLY_RESEARCH_WORKFLOW.md
role: Monthly research synthesis — cross-topic pattern analysis, principle promotion, new workflows, and next-month agenda
load: Last Friday of each month, or when Alfred triggers "Gabriel, run the monthly research synthesis"
---

# Monthly Research Workflow

## Runtime: 90–120 minutes

## Step 1: Pull All Weekly Reviews

Load the past 4 weekly review reports from `logs/research-log.md`.
Count: total runs, topics covered, patterns identified, experiments proposed.

## Step 2: Compare Patterns Across Top Companies

List all elite company findings from the past month.
Ask: What principle did Amazon, Shopify, and Nike all validate separately?
Cross-company agreement = Level 4 evidence.

## Step 3: Identify High-Confidence Principles

A principle qualifies as high-confidence when:
- It appears in 3+ elite company or top earner findings
- It has a Level 3+ evidence score from at least one source
- It has not been contradicted by Alfred's own data

List each principle:
```
PRINCIPLE: [statement]
Evidence level: [4–5]
Sources: [3+ sources]
Business application: [Alfred's lanes]
Proposed action: update skill | update checklist | create workflow | run experiment
```

## Step 4: Archive Weak Assumptions

Review `memory/proposed-research-memory.md`.
For any item that:
- Has been proposed for more than 60 days with no approval
- Has been contradicted by newer findings
- Has evidence level 1–2 with no supporting experiments

Move to `memory/archived-research-memory.md` with a note.

## Step 5: Propose New Gabriel Workflows

Based on this month's strongest findings:
- What new workflow could Gabriel run that it doesn't run today?
- What repeated research pattern could become a standard checklist?

For each proposed workflow:
```
PROPOSED WORKFLOW: [name]
Based on: [findings from month]
Evidence level: [1–5]
Draft location: automation-os/gabriel/workflows/[name].md
Status: draft — needs validation
```

## Step 6: Propose New Offer Ideas

Based on research into automation buyers, elite companies, and top earners:
- What does the market want that Alfred isn't offering yet?
- What gap was identified in 3+ research sessions?

```
OFFER IDEA: [name]
Problem it solves: [specific pain]
Target lead: [specific profile]
Evidence: [sources + level]
Revenue potential: [low | medium | high]
Build complexity: [simple | medium | complex]
Recommended next step: validate with Alfred
```

## Step 7: Propose New Lead-Gen Systems

Based on automation buyer detection and lead intelligence research:
- What new lead source or signal system should Gabriel run?
- What database or platform revealed new prospects?

```
LEAD-GEN SYSTEM: [name]
Source: [platform or method]
Signal detected: [specific signal]
Evidence level: [1–5]
Estimated lead volume: [estimate]
Recommended action: propose to Alfred | run test | integrate into daily loop
```

## Step 8: Propose New Content Frameworks

Based on marketing intelligence and sports branding research:
- What content format or arc should Gabriel add to the content engine?

## Step 9: Skill Improvement Recommendations

Review all `logs/proposed-skill-updates.md` entries from the month.
For skills with 2+ proposed updates: recommend a full skill review.

## Step 10: Workflow Automation Recommendations

Identify any research workflow that now runs reliably enough to automate:
- Could this become a scheduled automation task?
- What would the cron schedule be?
- What output would it produce?

## Step 11: Deliver the Monthly Synthesis

```
MONTHLY RESEARCH SYNTHESIS — [month]

TOTAL DAILY RUNS: [count]
WEEKLY REVIEWS COMPLETED: [count]

TOP 3 HIGH-CONFIDENCE PRINCIPLES:
1. [principle + evidence level + sources]
2. [principle + evidence level + sources]
3. [principle + evidence level + sources]

WEAK ASSUMPTIONS ARCHIVED: [count]
NEW WORKFLOWS PROPOSED: [count]
NEW OFFER IDEAS: [count]
NEW LEAD-GEN SYSTEMS: [count]

SKILLS RECOMMENDED FOR IMPROVEMENT:
[list skill names]

WORKFLOWS READY FOR AUTOMATION:
[list workflow names]

NEXT MONTH RESEARCH AGENDA:
Priority 1: [category + specific topic]
Priority 2: [category + specific topic]
Priority 3: [category + specific topic]

HIGHEST IMPACT ACTION FOR ALFRED:
[1 sentence — what would most change the business]
```

Save to `research-output/latest-monthly-synthesis.json`.
Log in `logs/research-log.md`.
