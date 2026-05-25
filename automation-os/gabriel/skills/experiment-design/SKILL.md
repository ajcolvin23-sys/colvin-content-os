---
name: experiment-design
description: Use this skill when Gabriel needs to design a structured A/B test or experiment based on a research finding or conversion hypothesis.
---

# Purpose

Converts validated research findings or conversion hypotheses into clean, specific, measurable A/B experiments — with one variable, one metric, and a clear decision rule.

# When To Use

- A research finding at Level 2+ suggests a testable hypothesis
- Alfred asks "let's test this"
- A CRO improvement needs to go through a test instead of direct replacement
- The experiment-platform-workflow skill needs a well-designed brief before launching

# When Not To Use

- When the evidence is Level 1 (not enough to justify a test)
- When the page has no meaningful traffic (no test data = no result)
- When the task is to analyze existing experiment results (use `experiment-learning`)
- When the task is to set up the test technically (use `experiment-platform-workflow`)

# Required Inputs

- The hypothesis (based on evidence)
- The current version (control)
- The proposed change (variant)
- The metric to measure
- The page or context

# Minimum Context Needed

- `learning-group/experiment-designer.md`
- `research-loop/EVIDENCE_STANDARDS.md`

# Workflow

1. Confirm evidence level ≥ 2 (Level 1 = not testable yet, not enough signal)
2. Write hypothesis in "If → Then → Because" format
3. Define control (exact current copy/element)
4. Define variant (exact proposed change — ONE variable only)
5. Choose primary metric
6. Set success threshold and minimum sample/days
7. Assess risk level and route:
   - Low risk, low traffic → direct replacement acceptable
   - Medium/high risk, any traffic → A/B test required
   - Compliance-adjacent → Katrina review before launch
8. Complete experiment design using template from `learning-group/experiment-designer.md`
9. Add to `logs/experiment-results.md` as status: proposed

# Decision Rules

- Never test more than one variable at a time
- Minimum 7 days for any experiment (even small traffic)
- Do not declare a winner before minimum sample AND minimum days are both met
- High-traffic pages: use GrowthBook or PostHog for statistical tracking (or GA4 as fallback — see TOOL_POLICY.md)
- Do not launch without Alfred's explicit approval

# Quality Checklist

- [ ] Evidence level ≥ 2
- [ ] Only ONE variable changed between control and variant
- [ ] Primary metric defined (specific, not "engagement")
- [ ] Success threshold set
- [ ] Minimum sample AND minimum days set
- [ ] Risk level assessed
- [ ] Compliance review checked if applicable
- [ ] Alfred approval required before launch noted
- [ ] Added to logs/experiment-results.md as proposed

# Common Failure Modes

1. **Testing two variables at once** — makes the result uninterpretable
2. **Vague success threshold** — "better" is not a threshold. "10% increase in form fills" is.
3. **Stopping test early because one version is winning early** — early data is noisy
4. **Testing on pages with no traffic** — no traffic = no result

# Output Format

Full experiment design from `learning-group/experiment-designer.md`.
ID format: `EXP-[sequential number]`

# Memory Update Rules

After experiment concludes: move result to `logs/experiment-results.md`, propose memory update if winner is confirmed.

# Examples

See `examples.md`.
