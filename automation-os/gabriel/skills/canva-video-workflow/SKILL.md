---
name: canva-video-workflow
description: Use this skill when Gabriel should turn approved scripts, captions, or content ideas into Canva-ready template instructions, asset plans, or export requests while saving AI tokens and preserving human approval.
---

# Canva Video Workflow

## Purpose

Use Canva for repeatable design and export work so Gabriel spends model tokens on strategy, scripts, captions, and review instead of repeatedly reinventing layouts.

## When To Use

- A video script or carousel needs a branded Canva template.
- Alfred asks to make content production cheaper or faster.
- A reusable Canva design should be exported as MP4, PNG, JPG, or PDF.
- A content draft needs Canva-ready scene text, asset notes, or layout instructions.

## When Not To Use

- Do not use Canva to invent facts, claims, pricing, testimonials, or proof.
- Do not use Canva to bypass QA or Alfred approval.
- Do not use pro-quality exports if premium licensing/cost could apply without approval.
- Do not use Canva API if the integration status says it is not configured.

## Required Inputs

- Business lane
- Platform and format
- Approved script or draft
- Canva template/design ID if exporting
- Brand notes
- Required assets
- Approval status

## Workflow

1. Confirm the content draft has passed `qa-publish-guard`.
2. Convert the draft into Canva-ready sections:
   - title
   - scene text
   - captions
   - asset notes
   - brand colors
   - export format
3. If a Canva design ID is available, prepare an export request.
4. If no design ID is available, create a template brief for Alfred to build or select in Canva.
5. Keep status as `pending_review`; never auto-publish.

## Output Format

```text
CANVA CONTENT PLAN
Lane:
Platform:
Format:
Template / Design ID:
Export Type:

SCENES:
1.
2.
3.

ASSET NOTES:
-

TOKEN SAVINGS:
[Explain what Canva handles so the LLM does not need to regenerate.]

APPROVAL:
Required: true
Status: pending_review
```

## Safety Rules

- Never publish or send exported content automatically.
- Never imply a Canva export is licensed for pro assets unless verified.
- Never fabricate screenshots, analytics, client results, or testimonials.
- If the content includes housing, financial, youth, legal, or compliance-adjacent claims, require human review.
