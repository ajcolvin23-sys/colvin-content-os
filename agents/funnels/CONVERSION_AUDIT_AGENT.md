# Conversion Audit Agent — Colvin Content OS

Audit existing funnels. Identify conversion bottlenecks. Generate improvement recommendations.

---

## Audit Scope

The Conversion Audit Agent reviews:
- Landing page copy effectiveness
- Form completion rates and drop-off points
- Email sequence open and click rates
- CTA clarity and placement
- Lead magnet value-to-ask ratio
- Thank-you page experience

---

## Audit Process

```
1. Identify funnel to audit (lane + URL or sequence)
2. Use Playwright MCP to visit landing page
3. Capture: headline, CTA placement, form length, trust signals present
4. Compare against LANDING_PAGE_COPY_AGENT.md standards
5. Run through conversion checklist below
6. Generate recommendations report
7. Submit to review queue for Alfred's decision
```

---

## Conversion Checklist (Landing Pages)

- [ ] Headline communicates clear value proposition
- [ ] Headline answers "Is this for me?" within 5 seconds
- [ ] Primary CTA is above the fold
- [ ] CTA button text is action-oriented (not just "Submit")
- [ ] Benefits section focuses on transformation, not features
- [ ] Social proof is present (testimonial, credential, or result)
- [ ] Objections are addressed explicitly
- [ ] Form length is appropriate (max 5-7 fields)
- [ ] Privacy statement present
- [ ] Mobile responsive layout
- [ ] Page load speed is acceptable (< 3 seconds)
- [ ] Thank-you page exists (not just a blank confirmation)

---

## Email Sequence Audit

- [ ] Subject line open rate > 20% (benchmark for cold; warm should be > 30%)
- [ ] Each email has one clear CTA
- [ ] Email body is concise (check word count vs PLATFORM_STYLE_GUIDE.md)
- [ ] Educational emails precede offer emails
- [ ] Unsubscribe rate < 2% (higher = content isn't matching audience)
- [ ] Follow-up timing is appropriate (not too fast, not too slow)

---

## Improvement Recommendation Format

```markdown
## Conversion Audit: [Lane] [Funnel Name]

**Date:** [YYYY-MM-DD]
**Overall Score:** [0-10]

### Issues Found
1. [Issue] — [Location in funnel] — [Estimated impact: High/Medium/Low]
2. [Issue] — ...

### Recommendations
1. [Specific change] — Expected improvement: [hypothesis]
2. [Specific change] — ...

### Priority Order
1. [Highest impact, easiest fix]
2. ...
```

---

## Audit Schedule

- First Keys Indy funnel: Monthly audit (compliance risk requires regular check)
- Music Theory Secrets: Quarterly audit
- Colvin Enterprises: After each major campaign
- All others: On-demand when Alfred requests

---

## Integration Status

PLANNED — Phase 4. Requires: Playwright MCP for page analysis, Supabase data for sequence metrics.
