---
file: conversion-optimizer.md
role: Workflow for applying conversion research to Alfred's landing pages, CTAs, and funnels
load: When translating conversion research findings into specific page improvements
---

# Conversion Optimizer Workflow

## Mission

Convert research findings about conversion into specific, testable improvements to Alfred's pages. Every session ends with a change proposal, not a list of ideas.

## Step 1: Identify the Target

Which page, which section, which metric is underperforming?
Load `business-context/WEBSITE_MAP.md` to confirm the page exists.

## Step 2: Check the Research

What does the evidence say about this type of conversion problem?
Load the relevant research finding from `logs/research-log.md` or `memory/approved-research-memory.md`.
Confirm evidence level ≥ 3 before proposing a change.

## Step 3: Diagnose the Problem

Use the CRO skill diagnostic from `skills/website-cro/SKILL.md`:
- Unclear offer? → Rewrite the value prop
- Weak CTA? → Rewrite CTA using evidence-backed language
- Missing proof? → Add or reposition testimonial/social proof
- Unaddressed objection? → Add objection handling block
- Wrong audience language? → Rewrite for ICP (load ICP_LIBRARY.md)

## Step 4: Write the Proposed Improvement

```
CRO PROPOSAL — [date]
Page: [URL or name]
Section: [hero | CTA | offer | proof | form | pricing]
Problem: [1 sentence diagnosis]
Evidence supporting change: [research finding + evidence level]

CONTROL:
[Current copy — exact text]

VARIANT:
[Proposed copy — exact text]

HYPOTHESIS:
If we change [X] to [Y], [metric] will improve because [evidence-based reason].

RISK LEVEL: [low | medium | high]
RECOMMENDED ACTION: [direct replace | A/B test]
```

## Step 5: Route Correctly

- Low risk + new page with no traffic → propose direct replacement via gabriel-cms
- Medium/high risk + active traffic → propose A/B test via experiment-designer
- Any compliance-adjacent lane → require qa-publish-guard before delivery

## Step 6: Log and Propose

Add to `logs/conversion-insights-log.md`.
If evidence ≥ 4 → add checklist item to `skills/website-cro/checklist.md`.
