# Email Compliance Policy — Colvin Content OS

CAN-SPAM, GDPR basics, and platform-specific rules for all email outreach.

---

## CAN-SPAM Compliance (US Law)

Every commercial email Alfred sends must:

1. **Identify itself as an ad** — if it's a commercial message, don't disguise it as personal
2. **Include physical address** — Colvin Enterprises physical mailing address (Alfred's business address in Indianapolis)
3. **Include clear unsubscribe mechanism** — in every email
4. **Honor unsubscribes within 10 business days** — system target: same day
5. **Not use deceptive subject lines** — subject must reflect the email content
6. **Not use deceptive FROM address** — must be recognizably Alfred or Colvin Enterprises

**What qualifies as a "transactional" email (not commercial):**
- Replies to incoming inquiries
- Requested information
- Order confirmations (if applicable)
These are exempt from some CAN-SPAM requirements — but Alfred's cold outreach is always commercial.

---

## Required Elements in Every Outbound Email

```
[Email body]

---
Alfred Colvin | Colvin Enterprises
Indianapolis, Indiana

To stop receiving emails from me, reply with "unsubscribe" or "remove me"
and I'll remove you immediately.
```

The Email Copy Agent automatically appends this footer. If it's missing: compliance flag `can_spam_missing_unsubscribe` at `severity: block`.

---

## Opt-In Only Rules

- No purchased email lists under any circumstances
- No harvested email lists (bulk-collected from websites without consent)
- Emails from company websites (contact page): permissible for B2B outreach with appropriate disclosure
- All First Keys Indy email marketing must be to opted-in contacts only (not cold outreach)

---

## GDPR Basics (EU/UK contacts)

If Alfred reaches out to anyone who may be in the EU or UK:
- Document the lawful basis for processing (legitimate interest for B2B, consent for B2C)
- Provide an unsubscribe mechanism (already required by CAN-SPAM anyway)
- On data deletion request: remove from all lists within 30 days

Alfred's primary audience is Indianapolis/Indiana — EU contacts are unlikely but possible for music/faith content internationally.

---

## Platform-Specific Rules

### Gmail (most recipients)
- Gmail spam filter: avoid spam trigger words (see SUBJECT_LINE_TESTING_RULES.md)
- Domain reputation: if using custom domain, set up SPF, DKIM, DMARC records
- Send from a consistent FROM address

### Outlook / Business Email
- Similar spam filters to Gmail
- Professional tone reduces filter triggers

---

## Spam Trigger Words to Avoid in Subject Lines

High-risk words (auto-flag as `spam_trigger_word`):
- FREE, FREE!!!
- URGENT, ACT NOW
- Limited time offer (in subject)
- Guaranteed
- Make money
- No credit check
- Click here
- Special promotion
- 100% free

Use plain, specific subject lines instead:
- "Indiana Backflow Directory — listing for your business?"
- "Quick question about Marion County backflow compliance"
- "Gospel piano book for church musicians"

---

## First Keys Indy Email Compliance

All First Keys Indy emails (including nurture sequences) must:
- Not make promises about specific DPA amounts without citing current program
- Include fair housing compliance language if email discusses specific properties or neighborhoods
- Not use language that could be construed as discriminatory (no references to race, religion, national origin, etc. in relation to housing)
- Include "Availability and terms of assistance programs are subject to change" in any email that references specific program amounts

---

## Compliance Flag Auto-Check

Email Copy Agent runs this check before every email enters the review queue:
- [ ] Unsubscribe mechanism present
- [ ] Physical address included in footer
- [ ] Subject line not deceptive
- [ ] FROM address is Alfred or Colvin Enterprises
- [ ] No spam trigger words in subject (auto-scan)
- [ ] No purchased list source
- [ ] First Keys Indy: HUD compliance language if applicable
