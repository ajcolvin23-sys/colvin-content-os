---
file: LEAD_SIGNAL_LIBRARY.md
role: Full lead scoring model with signals, scores, and offer recommendations for all of Alfred's business lanes
load: When scoring leads, qualifying prospects, or running lead-intelligence tasks
---

# Lead Signal Library

## Scoring Model

Each signal scored 1–10. Sum active signals. Apply weights by category.
Output: cold score | warm score | urgent pain score | revenue potential | ease of outreach | best offer.

---

## Signal Categories

### Operational Pain Signals (weight: 1.5×)

| Signal | Score | Detection Method |
|---|---|---|
| Publicly mentions being overwhelmed | 10 | Social media, reviews |
| Hiring admin/VA/receptionist | 9 | Job boards |
| Missed call reviews present | 9 | Google/Yelp reviews |
| No booking system | 8 | Website audit |
| Manual-only intake (no form automation) | 8 | Website form test |
| Slow email/call response (reviews mention it) | 8 | Review scan |
| High ticket volume, no helpdesk | 7 | Review patterns |
| Multiple locations, no central system | 7 | Google Business |

### Technology Gap Signals (weight: 1.2×)

| Signal | Score | Detection Method |
|---|---|---|
| No CRM visible | 8 | Website + sign-up test |
| No email marketing / no list | 7 | Website, sign-up |
| Spreadsheet references in job postings | 8 | Job boards |
| Outdated website (2+ years old) | 7 | Site footer, blog |
| No analytics or tracking visible | 6 | Site audit |
| No online booking | 8 | Website |
| No chatbot or live chat | 5 | Website |
| No video content | 5 | YouTube, social |

### Marketing Spend Signals (weight: 1.3×)

| Signal | Score | Detection Method |
|---|---|---|
| Active Facebook/Google ads | 9 | Facebook Ad Library, Google |
| Ads running to weak landing page | 10 | Ad + site audit |
| Spending on ads with no email capture | 9 | Landing page audit |
| Running ads with no follow-up automation | 8 | Test sign-up flow |
| High ad frequency with no retargeting | 7 | Ad library observation |

### Growth Signals (weight: 1.0×)

| Signal | Score | Detection Method |
|---|---|---|
| Growing team (hiring multiple roles) | 7 | LinkedIn, Indeed |
| New location or expansion | 8 | Website, social |
| Increased review volume | 6 | Google trends |
| Launching new product/service | 7 | Social announcement |
| Asking for referrals publicly | 6 | Social media |

### Intent Signals (weight: 2.0×)

| Signal | Score | Detection Method |
|---|---|---|
| Directly mentions needing AI | 10 | Social media, post |
| Directly mentions needing automation | 10 | Social media, job post |
| Asks "how do I get more leads?" | 9 | Social media |
| Asks "what CRM should I use?" | 9 | Social media, groups |
| Posts about wanting to save time | 8 | Social media |
| Follows AI/automation accounts | 5 | LinkedIn follows |

---

## Scoring Output

After scoring signals, produce this output for each lead:

```
LEAD SCORE REPORT
Name/Company: [name]
Lane: [which Alfred business this fits]

COLD LEAD SCORE: [0–100]
WARM LEAD SCORE: [0–100]
URGENT PAIN SCORE: [0–100]
REVENUE POTENTIAL: [low | medium | high | very high]
EASE OF OUTREACH: [cold | warm | referral-required]

TOP 3 SIGNALS DETECTED:
1. [signal + score]
2. [signal + score]
3. [signal + score]

BEST OFFER RECOMMENDATION:
Primary: [offer name]
Backup: [offer name]

OUTREACH NOTE:
[One sentence on the angle to use based on dominant pain]

COMPLIANCE FLAGS: [none | katrina_review_required]
```

---

## Offer Library Quick Reference

| Offer | Best Fit |
|---|---|
| Missed-call automation | Service businesses with phone-only intake |
| AI receptionist | High-call-volume businesses |
| Booking automation | Appointment-based services |
| CRM follow-up | Lead-gen businesses with no nurture |
| SMS/email nurture | Businesses with an existing list but no sequences |
| Quote request automation | Contractors, agencies, services requiring custom quotes |
| Lead capture funnel | Businesses running ads with no conversion system |
| Content repurposing system | Coaches, consultants, creators with existing content |
| Review request automation | High-volume service businesses |
| Customer support chatbot | E-commerce, SaaS, high-FAQ businesses |
| Internal reporting dashboard | Growing teams with no data visibility |
| AI research assistant | Consultants, advisors, knowledge workers |
| Website CMS agent | Businesses with static sites needing frequent content |
| Grant readiness agent | Nonprofits, churches, small businesses |
| Church communication agent | Churches and faith-based organizations |
| Local business marketing agent | Main Street businesses with no marketing system |
| Flyer and campaign generation agent | Event-heavy organizations |

---

## Lane-to-Lead Mapping

| Alfred's Lane | Best Lead Profile |
|---|---|
| Colvin Enterprises (AI consulting) | SMB owner, 5–50 employees, service/professional, hiring admin |
| Indiana Backflow Directory | Backflow testers needing online visibility, certification tracking |
| First Keys Indy | Marion County residents, first-time buyers, income-qualified |
| FundingReady Indiana | Small business owners, nonprofits, churches needing grant access |
| Music Theory Secrets / Piano App | Gospel musicians, piano teachers, worship leaders, music students |
| Girls Got Game | Youth sports organizations, coaches, donors |
| GloryEngine / Yahweh Comics | Faith-based creators, churches, media ministries |
