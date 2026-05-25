# Experiment Platform Workflow — Examples

## Example 1: Low-Traffic Page — Supabase DIY (Level 0)

**Lane:** indiana_backflow
**Page:** Directory homepage CTA
**Traffic:** ~15 visitors/week
**Platform assigned:** Supabase DIY (not enough traffic for statistical tools)

**Situation:** Gabriel proposed testing "Find a Tester" vs "Search Certified Testers" as the primary CTA.
Traffic is too low for GrowthBook or PostHog to reach significance in a reasonable time.

**Decision:** Run as Supabase DIY experiment — direct URL parameter tracking, review after 30 days.

```
CONTROL: "Find a Tester" button
VARIANT: "Search Certified Testers Near You" button
PLATFORM: Supabase DIY
SETUP: Add ?v=ctrl and ?v=test URL params, log to experiments table via API route
RUN DURATION: 30 days minimum (traffic too low for 7-day test)
ALTERNATIVE: If still inconclusive at 30 days → direct replacement acceptable given low traffic
```

**Lesson:** Don't wait for a paid platform to test. Supabase DIY gets the job done at low traffic. Log everything; review at 30 days.

---

## Example 2: Medium-Traffic Page — GA4 (Level 0)

**Lane:** first_keys_indy
**Page:** Homepage hero CTA
**Traffic:** ~80 visitors/week
**Platform assigned:** Google Analytics 4 (free, already tracking page views)

**Hypothesis:** If we change CTA from "Learn More" to "Get the Free Buyer Guide", form fills will increase because specificity reduces hesitation.

```
CONTROL: "Learn More" → /guide
VARIANT: "Get the Free Buyer Guide" → /guide
PLATFORM: Google Analytics 4
SETUP: Add GA4 custom event `cta_click` with variant parameter, create conversion goal for /guide visit
DECISION RULE: 100 visitors per variant or 14 days
```

**Lesson:** GA4's free tier handles clean A/B measurement when variants only change a CTA. No SDK install required if GA4 snippet is already on the page.
