# Thank-You Page Agent — Colvin Content OS

Create thank-you page content for every opt-in and conversion event. Confirm the action, set the next expectation, include a bonus or upsell.

---

## Thank-You Page Structure

Every thank-you page must:
1. **Confirm the action** — "You're in! Your [resource] is on its way."
2. **Manage delivery expectation** — "Check your inbox in the next 2-3 minutes"
3. **Set next expectation** — What happens next in the sequence?
4. **Bonus or upsell** — One additional offer (low-friction)
5. **Social sharing** (optional) — "Know someone who'd benefit? Share this page."

---

## Thank-You Pages by Lane

### Colvin Enterprises (After AI Audit Booking)
```
Headline: "You're booked! Here's what to expect."
Body: Your 20-minute AI audit call is confirmed. Before we talk, review the checklist [link].
Bonus: "While you wait: [Link to relevant LinkedIn post or resource]"
Next step: "We'll send a calendar confirmation to [email]. Add it to your calendar now."
```

### First Keys Indy (After Lead Magnet Download)
```
Headline: "Your Marion County Homebuyer Guide is on its way!"
Body: Check your inbox for the download link. While you wait — here's what to do next.
Next steps:
  1. Download your guide when you get the email
  2. Review the eligibility checklist on page 2
  3. Schedule a free consultation to see if you qualify
Bonus CTA: "Schedule your free consultation" (booking link)
HUD disclaimer: "Program availability subject to change. Verify eligibility at consultation."
```

### Music Theory Secrets (After Free Lesson Download)
```
Headline: "Your free gospel piano lesson is on its way!"
Body: Check your inbox for the download. I'll also be sending you a few bonus chord lessons over the next week.
Bonus: "While you wait — check out this free video on [specific chord]" [YouTube link]
Upsell: "Ready for the full method? Music Theory Secrets is [price]. [Buy now]"
```

### FundingReady Indiana (After Grant Checklist Download)
```
Headline: "Your Indiana Grant Checklist is in your inbox!"
Body: Check the inbox you provided for the download. I'll be sending additional tips on maximizing your grant applications.
Next step: "Have questions about a specific grant? Schedule a free 15-minute strategy call."
```

---

## Thank-You Page Compliance

### First Keys Indy
Every thank-you page must include:
- "Down payment assistance programs are subject to eligibility requirements and availability. Information provided is for general reference only."
- Equal Housing Opportunity logo and statement
- No specific dollar amounts unless from current IHCDA source with date

### FundingReady Indiana
- Grant amounts are subject to change — include "verify current availability" language
- No income guarantees from grants

---

## Delivery Mechanics

Thank-You pages are Next.js pages in the Colvin Content OS (or First Keys Indy) Next.js project.
- Route: `/thank-you/[lane]-[offer-slug]`
- Example: `/thank-you/first-keys-guide`

Integration status: PLANNED — First Keys Indy site (first-keys-indy.vercel.app) needs this + email platform integration.
