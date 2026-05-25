---
name: evidence-review
description: Use this skill when Gabriel needs to evaluate whether a research finding is strong enough to act on, promote to memory, or propose as a skill update.
---

# Purpose

Applies the Gabriel evidence scoring framework to any research finding before it influences memory, skills, or workflows. This is the gatekeeper — nothing gets promoted without passing through this skill.

# When To Use

- After every research run, before making any proposals
- When Alfred asks "can we trust this?"
- When reviewing accumulated research-log entries for weekly promotion
- When a proposed memory item needs a confidence check

# When Not To Use

- For running research (use `market-research-loop` or the specific research skill)
- For updating skills (use `skill-improvement`)
- For updating memory (use `memory-curation`)

# Required Inputs

- The finding (specific claim)
- The source (citation)
- The initial evidence assessment

# Minimum Context Needed

- `research-loop/EVIDENCE_STANDARDS.md`

# Workflow

1. Load EVIDENCE_STANDARDS.md
2. Check: can the source be specifically cited? If not → Level 1 maximum
3. Assign source quality tier (primary | high | medium | low | weak)
4. Classify the finding (fact | inference | pattern | hypothesis)
5. Assign evidence level (1–5)
6. Check for disqualifiers: unverified stats, anonymous case studies, LLM assertions
7. Issue verdict and route per `learning-group/promotion-rules.md`

# Decision Rules

- Level 1 → log only, no proposals
- Level 2 → experiment proposal only
- Level 3 → propose to memory + use cautiously
- Level 4 → propose skill/checklist update
- Level 5 → propose as default behavior (Alfred approval required)
- ANY disqualifier present → downgrade level by one

# Quality Checklist

- [ ] Source specifically cited
- [ ] Source quality tier assigned
- [ ] Classification assigned (fact | inference | pattern | hypothesis)
- [ ] Evidence level scored (1–5)
- [ ] Disqualifiers checked
- [ ] Verdict issued
- [ ] Routed per promotion-rules.md

# Common Failure Modes

1. **Skipping evidence review because "it seems right"** — intuition is not evidence
2. **Assigning Level 5 without Alfred's actual business data** — Level 5 requires Gabriel's own measured results
3. **Approving anonymous case studies** — label them [ANONYMOUS — LOW WEIGHT]
4. **Treating LLM research as evidence** — LLM output is not a source

# Recovery Steps

If source cannot be found → downgrade to Level 1
If finding seems strong but evidence is weak → propose experiment to elevate to Level 4-5

# Output Format

```
EVIDENCE REVIEW
Finding: [1 sentence]
Source: [specific citation]
Source tier: primary | high | medium | low | weak
Classification: fact | inference | pattern | hypothesis
Evidence level: [1–5]
Disqualifiers: [none | list]
VERDICT: log only | experiment proposal | propose to memory | propose skill update | propose default behavior
```

# Memory Update Rules

After 20+ evidence reviews: assess whether the scoring rubric needs recalibration based on outcomes.

# Examples

See `examples.md`.
