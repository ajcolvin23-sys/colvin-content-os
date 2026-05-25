---
name: top-earner-analysis
description: Use this skill when Gabriel needs to study the workflow, offer architecture, client acquisition process, or content system of an elite consultant, creator, agency operator, or service business owner — and extract a reusable process for Alfred.
status: Draft / Needs Real-World Validation
---

# Purpose

Studies elite operators (not companies — people and small teams) to extract their specific workflows, offer structures, client acquisition processes, and content systems for Alfred to adapt.

# When To Use

- Studying a top AI consultant, automation agency operator, or productized service provider
- Researching how a top creator in Alfred's space attracts and monetizes an audience
- Finding pricing and offer structures from high-earning service businesses
- Weekly research: one elite operator studied per week
- Alfred asks "how does [name/type] build their business?"

# When Not To Use

- When studying a large corporation (use `elite-company-analysis`)
- When studying sports/entertainment systems (use `sports-branding-analysis`)
- When the task is to apply findings to a specific Alfred page (use `website-cro` or `gabriel-cms`)

# Required Inputs

- Operator name/type to study
- The specific lens to study (from TOP_EARNER_FRAMEWORK.md 6 lenses)
- Alfred's business lane this applies to most

# Minimum Context Needed

- `research-loop/TOP_EARNER_FRAMEWORK.md`
- `research-loop/EVIDENCE_STANDARDS.md`

# Workflow

1. Select operator and study lens
2. Find documented evidence: their own content, named case studies, podcast transcripts
3. Separate what they claim vs. what is observable
4. Apply the 6-lens analysis — ONE lens per session
5. Extract ONE workflow or system
6. Score evidence
7. Assess applicability at Alfred's current scale
8. Write the specific gap: what Alfred doesn't have yet that this operator does
9. Propose one experiment to test the principle
10. Log in `logs/top-earner-log.md`

# Decision Rules

- Distinguish claimed process (what they say) from observed process (what you can verify)
- If the operator's system requires 10,000 followers and Alfred has 500 → flag scale gap
- Always end with what Alfred can do THIS WEEK vs. what requires months
- Evidence Level 3 is minimum before proposing a Gabriel adaptation

# Quality Checklist

- [ ] Operator and lens selected
- [ ] Evidence is from documented work, not reputation
- [ ] Claimed vs. observed separated
- [ ] Scale gap assessed
- [ ] ONE workflow extracted
- [ ] "Do this week" vs. "build over time" separated
- [ ] Evidence scored
- [ ] Logged in top-earner-log.md

# Common Failure Modes

1. **Studying someone who claims results without evidence** — follower count is not proof of system quality
2. **Extracting inspiration, not process** — "they're very committed" is not a workflow
3. **Missing scale gap** — a system that requires 2 years to build isn't Alfred's next action
4. **Relying on the operator's own summary** — they may misremember or selectively describe their system

# Recovery Steps

If no documented evidence found → note that and recommend Alfred verify with direct research

# Output Format

Use template from `research-loop/TOP_EARNER_FRAMEWORK.md`.
Log in `logs/top-earner-log.md`.

# Memory Update Rules

Cross-operator patterns (same practice from 3+ operators) → elevate to Level 4 evidence.

# Examples

See `examples.md`.
