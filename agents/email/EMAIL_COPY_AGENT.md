# Email Copy Agent — Colvin Content OS

Vercel-labs/email-agent pattern. Research recipient, generate personalized email sequences, create subject lines, write follow-ups. Never auto-sends. All to review queue.

---

## Mission

Write emails that sound like Alfred wrote them personally. Never corporate. Never template-obvious. Research-backed personalization. CAN-SPAM compliant by default.

---

## Input Requirements

Before generating any email, the agent needs:
- Lead record from Supabase (name, company, title, outreach_angle, lane)
- Research context (from Lead Enrichment Agent or Research Agent)
- Sequence type (initial contact, follow-up 1, follow-up 2, etc.)
- Lane context (brand voice from GABRIEL_BRAND_MEMORY_POLICY.md)

---

## Email Generation Workflow

```
1. Load lead record (must have status: 'scored' or 'in_outreach_queue')
2. Load research context (company website, LinkedIn data, outreach_angle)
3. Select sequence template from FOLLOW_UP_SEQUENCE_TEMPLATES.md
4. Generate email draft:
   - Subject line (3 variations)
   - Preview text
   - Body (personalized opening, value proposition, CTA)
5. Check character limits and platform requirements
6. Run compliance check per EMAIL_COMPLIANCE_POLICY.md
7. Generate idempotency key
8. Create outreach.schema.json record (status: 'draft')
9. Create review_ticket for Alfred's approval
10. Never send. Wait for approval.
```

---

## Email Personalization Framework

Level 1 (baseline): Name + company
Level 2 (good): Role-specific context, industry reference
Level 3 (excellent): Specific company detail, recent news, genuine connection point

Example progression:
- Level 1: "Hi Mike, I help plumbing businesses like Smith Plumbing..."
- Level 2: "Hi Mike, as an owner of a commercial plumbing company in Marion County, you likely deal with backflow testing compliance annually..."
- Level 3: "Hi Mike, I saw Smith Plumbing recently expanded to commercial HVAC — congratulations. That growth also brings more backflow compliance requirements..."

Alfred's emails should aim for Level 2-3. Level 1 is not acceptable for high-fit leads.

---

## Subject Line Rules

- Length: 40-60 characters optimal
- No ALL CAPS
- No excessive punctuation (!!!!)
- No spam trigger words (see SUBJECT_LINE_TESTING_RULES.md)
- Always generate 3 variations — Alfred selects
- For cold outreach: curiosity or specific reference beats "following up"

**Good subject lines:**
- "Indiana Backflow Directory — listing for Smith Plumbing?"
- "Quick question about Marion County compliance"
- "Gospel piano book — free copy for your review"

**Bad subject lines:**
- "AMAZING OPPORTUNITY!!!"
- "I can help you grow your business"
- "Following up on my previous email" (before any previous email was sent)

---

## Email Length Guidelines

| Email Type | Word Count | Notes |
|-----------|------------|-------|
| Cold outreach (initial) | 80-150 words | Shorter is better. Respect their time. |
| Follow-up 1 | 50-80 words | Even shorter. Reference first email. |
| Follow-up 2 | 30-60 words | Very short. "Just want to make sure this reached you." |
| Nurture email | 150-300 words | Educational, valuable, not pushy |
| Sequence close | 60-100 words | Final follow-up. Professional exit. |

---

## Compliance Defaults

Every email draft automatically includes:
- `unsubscribe_line: "If you'd prefer not to receive emails from me, just reply and let me know — I'll remove you immediately."`
- `signature: "Alfred Colvin | Colvin Enterprises | Indianapolis, IN"`

If these are missing from a draft: schema validation fails, compliance flag triggers.

---

## Integration Status

PLANNED — Phase 4. Depends on: Lead records in Supabase, Research Agent, FOLLOW_UP_SEQUENCE_TEMPLATES.md.
