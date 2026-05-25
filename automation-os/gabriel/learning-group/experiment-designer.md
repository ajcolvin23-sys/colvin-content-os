---
file: experiment-designer.md
role: Workflow for designing structured A/B tests and experiments based on research findings
load: When a research finding has evidence level ≥ 2 and a testable hypothesis
---

# Experiment Designer Workflow

## Mission

Turn research findings into clean, specific, measurable experiments. A bad experiment wastes time and produces no learning. A clean experiment answers one question.

## The One-Variable Rule

Test one variable at a time. Not three. One.
If you change the headline AND the CTA AND the image, you don't know which one worked.

## Experiment Design Template

```
EXPERIMENT DESIGN
ID: EXP-[###]
Date proposed: YYYY-MM-DD
Based on finding: [research-log entry date + topic]
Evidence level of finding: [1–5]

HYPOTHESIS:
If we change [specific element] from [control] to [variant],
we expect [specific metric] to improve by [estimated amount]
because [evidence-backed reason].

CONTROL:
[Exact current version — copy, CTA text, layout, etc.]

VARIANT:
[Exact proposed change — specific enough to implement today]

BUSINESS: [Alfred's lane]
PAGE/SECTION: [exact location]

PRIMARY METRIC: [click rate | form fill rate | time on page | bounce rate | reply rate]
SECONDARY METRICS: [1–2 additional signals to watch]

SUCCESS THRESHOLD: [e.g., "10% improvement in form fills"]
MINIMUM SAMPLE: [e.g., "200 visitors" or "50 outreach messages"]
MINIMUM DAYS: [7 | 14 | 30]

TRAFFIC LEVEL: [low | medium | high]
RISK LEVEL: [low | medium | high]

IF HIGH RISK → recommend experiment-platform-workflow (use best available free platform first — see TOOL_POLICY.md)
IF LOW RISK, LOW TRAFFIC → direct replacement acceptable

SKILL TO UPDATE ON WIN: [skill name]
CHECKLIST TO UPDATE ON WIN: [checklist file]

STATUS: proposed
```

## Decision Rules

- If the page has active traffic → always use A/B test, not direct replacement
- If the change touches primary CTA or hero → high risk, requires Alfred approval before launch
- If the change is a compliance-adjacent lane (first_keys_indy, funding_ready_indiana) → requires Katrina review before launch
- If minimum days are not met → do not declare a winner

## How to Declare a Winner

Do not declare a winner based on:
- Gut feeling
- 3 days of data
- One day where traffic was unusually high or low

Do declare a winner when:
- Minimum sample AND minimum days are both met
- The difference is consistent across the full test period
- The improvement on the primary metric is ≥ the success threshold

On win:
1. Document in `logs/experiment-results.md`
2. Add finding to `approved-learnings.md`
3. Propose skill/checklist update
4. Archive the losing variant (don't delete — compare future hypotheses against it)
