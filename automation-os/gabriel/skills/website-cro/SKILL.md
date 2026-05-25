---
name: website-cro
description: Use this skill when Gabriel needs to improve conversion rates — headlines, CTAs, hero sections, offer framing, pricing presentation, testimonials, lead forms, objection handling, or social proof.
---

# Purpose

Website CRO improves how well Alfred's pages convert visitors into leads, buyers, or bookings. It focuses on copy and messaging changes that make the offer clearer, the CTA more compelling, and the objections handled.

# When To Use

- Headline on a landing page is underperforming
- CTA click rate is low
- Offer section isn't converting visitors
- Need to frame pricing or value more clearly
- Adding testimonials or social proof
- Improving objection handling on a key page
- Preparing variants for A/B testing

# When Not To Use

- Content creation for social media (use `content-engine`)
- Full page creation from scratch (use `gabriel-cms`)
- Visual layout or design decisions (use `paper-design-system`)
- Setting up the A/B test itself (use `humblytics-experiment`)

# Required Inputs

- Current version of the section being improved
- What metric is underperforming (click rate, form fills, time on page, bounce rate)
- ICP for this page (load from `ICP_LIBRARY.md`)
- What the offer is (load from `OFFER_LIBRARY.md`)

# Minimum Context Needed

- `business-context/BRAND_GUIDE.md`
- `business-context/ICP_LIBRARY.md` (for the specific lane)
- `business-context/OFFER_LIBRARY.md` (for the specific lane)

# Workflow

1. **Identify the conversion problem** — what is the visitor failing to do? Why?
2. **Read the current copy** — where does the messaging break down?
3. **Diagnose the root cause:** unclear offer | weak CTA | missing proof | unaddressed objection | wrong audience language
4. **Write the improved version** — address the specific diagnosis
5. **Write a control vs. variant summary** — old version, new version, hypothesis
6. **Recommend action:** direct replace (low risk) | A/B test (high traffic or high stakes)
7. **Pass to `qa-publish-guard`**

# CRO Principles (Alfred's Context)

- **Indianapolis specificity beats generic copy** — naming the city builds trust locally
- **Outcomes over features** — "Save 10 hours a week" beats "AI-powered automation"
- **One primary CTA per section** — never compete CTAs against each other
- **Social proof closest to the CTA** — proof kills the last doubt before the click
- **Short forms convert more** — if the form has more than 3 fields, question each one
- **Mobile is primary** — most of Alfred's audience finds him on a phone

# Common CTA Improvements

| Weak CTA | Stronger Version |
|---|---|
| "Learn More" | "Book Your Free Automation Audit" |
| "Contact Us" | "Book a 30-Minute Call — Free" |
| "Sign Up" | "Get the Free First-Time Buyer Guide" |
| "Download" | "Download the Gospel Piano Chord Chart — Free" |
| "Submit" | "Send My Request" |

# Decision Rules

- If a page has active traffic → always recommend A/B test, never direct replace
- If a page is new with no traffic → direct replacement is fine, no test needed yet
- If the current version is already performing (baseline known) → test before changing
- Never remove a testimonial unless it's factually wrong
- Always keep one version of the old copy before replacing

# Common Failure Modes

1. **Changing a high-performing CTA without testing** — check if metrics exist before assuming underperformance
2. **Writing copy that's too clever** — clarity beats clever in every Alfred business context
3. **Adding too many CTAs** — one primary CTA per section, always
4. **Writing for the wrong ICP** — load ICP_LIBRARY.md before writing
5. **Generic social proof ("many satisfied customers")** — use specific details when available

# Recovery Steps

If copy was written without loading ICP context → regenerate with ICP_LIBRARY.md
If CTA is vague → rewrite using the CTA improvement table above
If improvement is high-risk on live traffic → downgrade to A/B test recommendation

# Output Format

```
CRO IMPROVEMENT
Lane: [lane_id]
Page/Section: [location]
Problem Diagnosed: [unclear offer | weak CTA | missing proof | wrong language | objection unhandled]

CURRENT VERSION:
[paste current copy]

IMPROVED VERSION:
[new copy]

HYPOTHESIS:
[If we change X to Y, we expect Z because...]

RECOMMENDED ACTION:
[Direct replace (low traffic/new page) | A/B test (live page with traffic)]

RISK LEVEL: [low | medium | high]
STATUS: pending_review
```

# Memory Update Rules

- Log winning CRO changes in `logs/decisions.md`
- If an A/B test is involved, hand off to `humblytics-experiment` for test setup
- Update `logs/experiments.md` when any test launches

# Examples

See `examples.md` in this skill folder.
