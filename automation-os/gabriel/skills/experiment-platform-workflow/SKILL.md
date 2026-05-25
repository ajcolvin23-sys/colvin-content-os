---
name: experiment-platform-workflow
description: Use this skill when Gabriel needs to design, launch, monitor, or evaluate an A/B test — automatically selecting the best available free or paid platform based on what Alfred has installed.
---

# Purpose

Experiment Platform Workflow manages the full A/B testing lifecycle — hypothesis, test setup, monitoring, winner decision, and memory update. It is platform-agnostic: it uses whatever is available, defaulting to free tools and only routing to paid tools when explicitly set up.

# Tool Selection (check TOOL_POLICY.md current status first)

| Platform Available | Use It For |
|---|---|
| **Supabase DIY (always available)** | Track variant/control manually — log visitors and conversions in Supabase `experiments` table |
| **Google Analytics 4** | Event-based tracking, URL-parameter A/B tests, conversion goals |
| **Microsoft Clarity** | Scroll depth, click maps, session recording — useful for qualitative test evidence |
| **GrowthBook Free** | Statistical A/B testing with significance calculation (install SDK first) |
| **PostHog Free** | Full funnel experiments, feature flags, up to 1M events/month (install SDK first) |
| **Humblytics** (paid, optional) | Only if Alfred has an active subscription |

**Default when nothing is installed:** Supabase DIY experiment — Gabriel tracks variant/control in the `experiments` table and measures the difference manually after the run period.

# When To Use

- A CRO improvement is ready to test on a live page
- Alfred wants to test two versions of a headline, CTA, or offer section
- An existing test needs a winner declared
- Reviewing past experiment results to inform future decisions

# When Not To Use

- The page has no traffic yet (tests need visitors to produce valid data)
- The change is a typo fix or broken link (no test needed — direct fix)
- When you're still writing the copy (use `website-cro` first)

# Required Inputs

- Control version (current live version, exact copy)
- Variant version (proposed new version, exact copy)
- Success metric (what counts as a conversion for this test)
- Minimum sample size target or minimum run duration
- Which page and section is being tested

# Minimum Context Needed

- `business-context/OFFER_LIBRARY.md` (for the lane being tested)
- `logs/experiments.md` (so we don't repeat a test already run)
- `core/TOOL_POLICY.md` (to check which platform is currently available)

# Workflow

1. **Check TOOL_POLICY.md** — what experiment platform is currently available?
2. **Define hypothesis** — "If we change X to Y, [metric] will improve because [reason]"
3. **Document control** — exact current version, current conversion rate if known
4. **Document variant** — exact proposed version
5. **Set success metric** — clicks, form fills, bookings, scrolls, time on page
6. **Set decision rule** — minimum 100 visitors per variant, or minimum 7 days
7. **Assign platform** based on what's available (see routing table above)
8. **Produce setup instructions** specific to the assigned platform
9. **Log the experiment** in `logs/experiments.md`
10. **Monitor and declare winner** — only with sufficient data
11. **Update memory** — log winner, losing variant, lesson

# Platform-Specific Setup Instructions

## Supabase DIY (Level 0 — default)
- Create two URL variants: `/landing?v=control` and `/landing?v=test`
- Log visits manually or via a lightweight Next.js API route that writes to Supabase `experiments` table
- After minimum days/visitors: count conversions per variant in Supabase, calculate difference
- No statistical significance tool needed for a clear winner (>15% difference)

## Google Analytics 4 (Level 0)
- Create a GA4 custom event: `experiment_view` with parameter `variant: "control" | "test"`
- Create a GA4 conversion event for the success metric
- Use GA4 Explore → Funnel Exploration to compare conversion rates by variant

## GrowthBook (Level 1 — requires SDK install)
- Create experiment in GrowthBook dashboard
- Implement feature flag in Next.js using GrowthBook SDK
- GrowthBook handles traffic splitting and significance calculation automatically

## PostHog (Level 1 — requires SDK install)
- Create experiment in PostHog dashboard (Experiments tab)
- Use PostHog's built-in A/B testing with feature flags
- PostHog calculates significance and shows results in real time

# Decision Rules

- Never declare a winner before minimum sample size or time
- If result is inconclusive (< 10% difference) → run longer or try a bolder variant
- If variant wins → update in `gabriel-cms`, log in `logs/decisions.md`
- If control wins → log why variant lost in `failure-log.md`
- Never run more than 2 variants on a single page at once
- **Never recommend upgrading to a paid platform unless the free platform has specifically failed** to provide adequate measurement

# Common Failure Modes

1. **Declaring a winner too early** — always wait for minimum sample
2. **Testing two variables at once** — only ONE variable changes per test
3. **Not logging the test** — if it's not in `logs/experiments.md`, it didn't happen
4. **Forgetting to end the test** — old running tests contaminate future data
5. **Running a test on a page with <20 visitors/week** — wait for traffic or skip the test, do a direct swap instead

# Recovery Steps

Early declaration → wait for minimum sample before committing winner
Multi-variable test → cancel and redesign as single-variable
No platform available → default to Supabase DIY, explain setup to Alfred

# Output Format

```
A/B EXPERIMENT
Lane: [lane_id]
Page/Section: [location]
Platform: [Supabase DIY | GA4 | GrowthBook | PostHog | Humblytics]

HYPOTHESIS:
If we change [X] to [Y], [metric] will improve because [reason].

CONTROL: [exact current version]
Current conversion rate: [X% or "unknown"]

VARIANT: [exact proposed version]

SUCCESS METRIC: [clicks | form fills | bookings | scroll depth]
DECISION RULE: 100 visitors per variant OR 7 days — whichever comes first
WIN THRESHOLD: 10%+ improvement

SETUP INSTRUCTIONS:
[Platform-specific steps to actually run the test]

STATUS: pending_review
```

# Memory Update Rules

- All new experiments → `logs/experiments.md`
- All conclusions → `logs/experiments.md` + `logs/decisions.md`
- Losing variants → `failure-log.md` in this skill

# Examples

See `examples.md` in this skill folder.
