# Landing Page Workflow

End-to-end workflow for building and launching new landing pages across Alfred's 9 business lanes. Integrates PAPER design system, CMS publishing, QA, and compliance review.

## When This Is Used

- New campaign pages for any lane
- Lead capture pages for outreach sequences
- Event pages (Girls Got Game, speaking, workshops)
- Offer pages (AI consulting packages, backflow services, homebuyer programs)

## Trigger Commands

- "build a landing page for [lane/offer/campaign]"
- "create a [lead capture | offer | event] page for [lane]"
- "draft a new page for [lane]"

## Step Sequence

```
1. DEFINE THE PAGE
   □ Lane: which of Alfred's 9 businesses?
   □ Goal: primary conversion action (form submit | call booked | email capture | purchase)
   □ Audience: who is this for? (ICP from lead-intelligence skill)
   □ Offer: what are they getting?
   □ Traffic source: where will people come from? (SEO | ad | email | social | referral)

2. COMPLIANCE PRE-FLIGHT
   □ Is this lane compliance-sensitive?
      → first_keys_indy: does this reference IHCDA, DPA, or homebuyer assistance programs?
      → funding_ready_indiana: does this reference grant programs, SBA, or nonprofit funding?
      → girls_got_game: does this reference athletes, endorsements, or youth programs?
   □ If yes to any: STOP. Flag for Katrina review before writing a single word.

3. GATHER INPUTS
   □ Existing brand assets from PAPER design system
   □ Winning copy patterns from approved-research-memory.md (CRO lane)
   □ Proof elements: testimonials, case studies, logos, stats
   □ CTA language: specific action verb + benefit ("Book your free AI audit")

4. STRUCTURE THE PAGE
   Standard structure (adjust per traffic source):
   - Hero: headline + sub + primary CTA
   - Problem/stakes: who is this for + what's at risk
   - Solution: what Alfred offers + differentiator
   - Proof: testimonials, results, or social proof
   - Offer details: what they get + what happens next
   - Secondary CTA + FAQ (if needed)
   - Footer: compliance, contact, legal (especially for regulated lanes)

5. DRAFT CONTENT
   - Load gabriel-cms skill
   - Follow lane tone (not all lanes use same voice)
   - No hallucinated case studies, fabricated testimonials, or invented stats
   - No placeholder proof — if proof doesn't exist, write proof-absent structure

6. DESIGN REVIEW
   - Load paper-design-system skill
   - Check: component selection, mobile layout consideration, CTA prominence
   - Verify: no design elements that break PAPER constraints

7. QA GATE
   - Run qa-publish-guard checklist
   - Score: PASS | REVISE | REJECT
   - If REJECT: do not deliver to Alfred until fixed

8. DELIVER TO ALFRED
   - Deliver page draft with:
     □ Lane context
     □ Goal and primary CTA
     □ Evidence basis for key copy choices
     □ Any compliance notes
     □ Suggested test (if CTA or headline is uncertain)

9. ALFRED REVIEWS AND APPROVES

10. PUBLISH
    - Follow cms-publishing-workflow.md for staging and deploy
    - Save to Supabase: pages, page_sections tables
    - Log content_version

11. POST-LAUNCH
    - Verify live URL
    - Set up Humblytics tracking on primary CTA
    - Log in run-log.md
    - If CTA/headline is not proven: schedule A/B test proposal for 30 days post-launch
```

## Page Quality Standards

| Element | Minimum Standard |
|---------|-----------------|
| Headline | Clear, specific, benefit-led. No clever wordplay without clarity. |
| CTA | One primary action. No competing CTAs on initial view. |
| Proof | Real and verifiable. Zero fabricated case studies or stats. |
| Mobile | Readable and convertible on mobile (CTA above fold on mobile). |
| Load speed | No unnecessary embeds or heavy images that hurt Core Web Vitals. |
| Compliance | Regulated claims reviewed before publish. No exceptions. |

## Compliance Language Quick Reference

| Lane | Forbidden Without Review |
|------|--------------------------|
| first_keys_indy | "up to $X down payment assistance", IHCDA references, DPA amounts |
| funding_ready_indiana | Grant amounts, eligibility claims, SBA program details |
| girls_got_game | Athlete names, endorsement language, youth program claims |
| AI consulting | ROI guarantees, specific revenue outcome claims |
