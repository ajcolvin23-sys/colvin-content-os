---
name: conversion-research
description: Use this skill when Gabriel needs to research how to improve conversion rates using external evidence — A/B test data, CRO case studies, landing page experiments, or headline/CTA research.
status: Draft / Needs Real-World Validation
---

# Purpose

Finds conversion evidence from credible external sources and translates it into specific, testable improvements to Alfred's landing pages, CTAs, forms, and offers.

# When To Use

- Looking for headline formulas backed by actual test data
- Researching what CTA language drives clicks in a specific context
- Finding form optimization research (fields, sequence, labels)
- Studying A/B test case studies from elite companies or CRO practitioners
- Researching social proof placement, pricing presentation, or objection handling patterns

# When Not To Use

- When the task is to APPLY conversion improvements to a specific page (use `website-cro`)
- When the task is to SET UP a test (use `experiment-platform-workflow`)
- When the task is general marketing research (use `marketing-intelligence`)

# Required Inputs

- Specific conversion question (e.g., "What CTA copy outperforms 'Learn More'?")
- The page type (landing page | email | social | form | pricing section)
- The business lane and ICP this applies to

# Minimum Context Needed

- `research-loop/EVIDENCE_STANDARDS.md`
- `research-loop/RESEARCH_SOURCES.md` (CXL, Baymard, MECLABS are top-tier for conversion)

# Workflow

1. Define specific conversion question
2. Select sources: CXL > Baymard > VWO > Unbounce Benchmark > other
3. Find ONE specific test or case study with named results
4. Score evidence — conversion research from CXL/Baymard can reach Level 3–4
5. Extract the winning principle — not just "variant won" but WHY
6. Translate to Alfred's context: does this apply to his ICP and pages?
7. Write the specific improvement recommendation
8. Determine if this is direct replace or A/B test (load `experiment-designer.md`)
9. Log and route

# Decision Rules

- Evidence from a single unnamed test → Level 2, propose experiment only
- Evidence from named platform report (Unbounce Benchmark) → Level 3
- Evidence from CXL or Baymard documented study → Level 3–4
- Evidence from Alfred's own analytics data (GA4, Clarity, PostHog, or Supabase DIY) → Level 5
- Never implement a high-traffic page change without first designing an A/B test

# Quality Checklist

- [ ] Source is CXL, Baymard, or equivalent credible CRO source
- [ ] Test result is specific (not "it improved conversion")
- [ ] The winning principle (the WHY) is extracted, not just the what
- [ ] Applied to Alfred's specific page and ICP
- [ ] Mobile experience considered (Alfred's audience is mobile-first)
- [ ] Risk level assessed before recommending direct replace vs. A/B test

# Common Failure Modes

1. **Citing generic CRO advice without a specific test** — "shorter forms convert better" is not evidence
2. **Missing the WHY** — knowing variant won is useless; knowing why it won teaches Gabriel to generalize
3. **Ignoring mobile** — most of Alfred's traffic is mobile; desktop-optimized findings may not apply
4. **Scale mismatch** — test results from high-traffic e-commerce may not apply to Alfred's traffic levels
5. **Applying B2C findings to B2B pages** — different trust signals, different objections

# Recovery Steps

If finding is vague → return to sources, find the specific test data
If no high-quality source found → downgrade to Level 2, propose experiment instead

# Output Format

See `research-loop/RESEARCH_OUTPUT_FORMAT.md`.
Add conversion-specific section:
```
PAGE TYPE: [landing | email | form | pricing | checkout]
CURRENT CONVERSION METRIC: [click rate | form fill | reply rate]
EVIDENCE SOURCE TIER: [CXL | Baymard | platform benchmark | other]
MOBILE APPLICABILITY: [yes | partial | no]
```

# Memory Update Rules

- Evidence ≥ 3 → propose to `memory/proposed-research-memory.md`
- Evidence ≥ 4 → propose update to `skills/website-cro/checklist.md`

# Skill Improvement Rules

Log all failures. Minimum 3 real runs before status changes to Testing.

# Examples

See `examples.md`.
