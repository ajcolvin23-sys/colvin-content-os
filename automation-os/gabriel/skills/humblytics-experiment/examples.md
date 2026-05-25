# Humblytics Experiment — Examples

## Example 1: Test Setup

**Experiment:** EXP-001 — First Keys Indy Form CTA
**Tool:** Humblytics

**Setup steps:**
1. Create new A/B test in Humblytics dashboard for first-keys-indy.vercel.app
2. Target element: form submit button (CSS selector: `button[type="submit"]`)
3. Control: Text = "Submit"
4. Variant: Text = "Get the Free Buyer Guide"
5. Split: 50/50
6. Primary metric: Form submission event
7. Minimum visitors: 200 | Minimum days: 14
8. Stop rule: Declare winner when both thresholds are met AND improvement ≥15%

---

## Example 2: Monitoring Check-In

After 7 days:
- Control: 68 views, 2 submissions (2.9%)
- Variant: 72 views, 4 submissions (5.6%)

**Assessment:** Variant is leading by 93%, but minimum visitors and days not yet met. Do NOT declare a winner. Continue running.

---

## Example 3: Status — No Traffic

**Situation:** Gabriel proposed an A/B test for the Indiana Backflow Directory pricing page, but the page gets <20 visitors/week.

**Assessment:** Insufficient traffic. At 20 visitors/week, reaching 200 visitors takes 10 weeks. Test is impractical.

**Alternative:** Run a direct replacement with version history saved. Monitor with Humblytics for scroll depth and click events. Revisit when traffic grows.
