---
name: humblytics-experiment
status: DEPRECATED
replaced_by: experiment-platform-workflow
deprecated_date: 2026-05-25
reason: Replaced with tool-agnostic experiment-platform-workflow skill. Humblytics moved to Level 2 (paid/optional). Free alternatives (Supabase DIY, GA4, GrowthBook, PostHog) now cover all use cases.
---

> **DEPRECATED** — Do not load this skill. Use `experiment-platform-workflow` instead.
> This folder is kept for historical reference only.

---

# Purpose

Humblytics Experiment manages the full A/B testing lifecycle — hypothesis, test setup, monitoring, winner decision, and memory update. It prevents gut-feel changes on live pages by forcing every significant change through a measurable test.

# When To Use

- A CRO improvement is ready to test on a live page with traffic
- Alfred wants to test two versions of a headline, CTA, or offer section
- A landing page experiment needs to be tracked and decided
- An existing test needs a winner declared
- Reviewing past experiment results to inform future decisions

# When Not To Use

- The page has no traffic yet (tests need visitors to be valid)
- The change is a typo fix or broken link (no test needed)
- When you're still writing the copy (use `website-cro` first)

# Required Inputs

- Control version (current live version, exact copy)
- Variant version (proposed new version, exact copy)
- Success metric (what counts as a conversion for this test)
- Minimum sample size target (or minimum run duration in days)
- Which page and section is being tested

# Minimum Context Needed

- `business-context/OFFER_LIBRARY.md` (for the lane being tested)
- `logs/experiments.md` (so we don't repeat a test already run)

# Workflow

1. **Define hypothesis** — "If we change X to Y, [metric] will improve because [reason]"
2. **Document control** — exact current version, current conversion rate if known
3. **Document variant** — exact proposed version
4. **Set success metric** — clicks, form fills, bookings, scrolls, time on page
5. **Set decision rule** — minimum 100 visitors per variant, or minimum 7 days, whichever comes first
6. **Set up in Humblytics** — create the experiment (or flag for Alfred to set up if access not available)
7. **Log the experiment** in `logs/experiments.md`
8. **Monitor** — check at minimum duration; do not declare early
9. **Declare winner** — only with sufficient data; never on gut feeling
10. **Update memory** — log winner, losing variant, and lesson learned

# Decision Rules

- Never declare a winner before minimum sample size or time is reached
- If result is inconclusive (< 10% difference, < 95% confidence) → run longer or try a bolder variant
- If variant wins → update `gabriel-cms` and `logs/decisions.md`, retire losing version
- If control wins → document why the variant lost in `failure-log.md`, inform future CRO work
- Never run more than 2 variants at once on a single page (control + one variant max)

# Common Failure Modes

1. **Declaring a winner too early** — always wait for minimum sample
2. **Testing two things at once** — only change one variable per test
3. **Not logging the test** — if it's not in `logs/experiments.md`, it didn't happen
4. **Forgetting to turn off the test** — old tests left running skew future data
5. **Running a test on a page with almost no traffic** — tests need data; pause and revisit when traffic exists

# Recovery Steps

Early declaration → pause decision, wait for minimum sample
Multi-variable test → cancel, redesign as single-variable test
No log → write the experiment entry now, even retroactively

# Output Format

```
A/B EXPERIMENT
Lane: [lane_id]
Page/Section: [location]
Test Type: [headline | CTA | offer block | hero | form | other]

HYPOTHESIS:
If we change [X] to [Y], [metric] will improve because [reason].

CONTROL:
[exact current version]
Current conversion rate: [X% or "unknown"]

VARIANT:
[exact proposed version]

SUCCESS METRIC: [clicks to CTA | form fills | bookings | scroll depth]

DECISION RULE:
Minimum: 100 visitors per variant OR 7 days running — whichever comes first
Declare winner when: one variant leads by 10%+ with 90%+ confidence

SETUP STATUS: [ready to launch | waiting for Alfred to set up in Humblytics | live since DATE]

STATUS: pending_review
```

# Memory Update Rules

- All new experiments → `logs/experiments.md`
- All experiment conclusions → `logs/experiments.md` + `logs/decisions.md`
- Losing variants → `failure-log.md` in this skill with note on why it likely lost

# Examples

See `examples.md` in this skill folder.
