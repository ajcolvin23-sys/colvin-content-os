---
file: promotion-rules.md
role: Exact rules for when a research finding, memory item, or skill update gets promoted — prevents over-promotion and under-use
load: Before promoting any finding to memory, skill, or workflow
---

# Promotion Rules

## Memory Promotion Rules

| Evidence Level | Status | Action |
|---|---|---|
| 1 — Weak idea | `idea` | Log in research-log.md only. Do not add to memory. |
| 2 — Interesting pattern | `proposed` | Add to `memory/proposed-research-memory.md` as test idea. Do NOT act on it. |
| 3 — Credible external evidence | `proposed` | Add to proposed memory with source. Use cautiously. |
| 4 — Repeated elite operator pattern | `proposed` | Add to proposed memory + propose skill/checklist update. |
| 5 — Proven in Alfred's data | `approved` | Promote to approved memory ONLY after Alfred reviews. Make default behavior. |

Memory starts `proposed`. It becomes `approved` only when Alfred explicitly accepts it.
It moves to `archived` when it's more than 90 days old with no approval, or when contradicted.

## Skill Update Promotion Rules

| Trigger | Update Type | Approval Required |
|---|---|---|
| Evidence level 4–5 pattern | Add rule or checklist item | Yes — Alfred reviews |
| 3+ repeated failures of same type | Add failure mode + recovery | Yes — Alfred reviews |
| Clear typo or broken link in skill | Fix | No — low-risk corrective |
| Contradicted assumption in SKILL.md | Archive the assumption | Yes — Alfred reviews |
| New tool or integration available | Add tool guidance | Yes — Alfred reviews |

Never add a rule to a skill from a Level 1–2 finding.

## Workflow Promotion Rules

| State | Condition | Action |
|---|---|---|
| Draft | Workflow is new, never run | Mark `Status: Draft / Needs Real-World Validation` |
| Tested | Workflow has been run 1–3 times | Mark `Status: Testing — report any failures` |
| Stable | Workflow has run 5+ times without correction | Mark `Status: Stable` |
| Automation-ready | Stable workflow with consistent output | Recommend for scheduled cron |

Never automate an unstable workflow.

## Experiment Promotion Rules

| Experiment State | Condition | Action |
|---|---|---|
| Proposed | Evidence ≥ 2, design is clear | Add to `logs/proposed-skill-updates.md` as experiment |
| Active | Alfred approved and test is running | Track in `logs/experiment-results.md` |
| Concluded | Minimum sample or days reached | Declare winner only with sufficient evidence |
| Winner declared | Test produced clear result | Promote winner to `approved-learnings.md` |
| Inconclusive | No statistically clear winner | Archive — do not run same test again |

## Confidence Score Thresholds

The scoring rubric uses a 7-dimension, 1–10 scale (max 70 points).
Final score = raw / 7.

| Score | Action |
|---|---|
| 8.5–10.0 | KEEP — promote, deploy, or approve |
| 7.0–8.4 | REVISE — improve weakest dimension, re-score |
| 5.0–6.9 | REJECT — too weak to act on |
| Below 5.0 | REBUILD — fundamental flaw, start over |
