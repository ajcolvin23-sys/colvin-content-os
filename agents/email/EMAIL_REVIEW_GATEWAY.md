# Email Review Gateway — Colvin Content OS

Rules for the email review queue. Approval required before any email is sent.

---

## What Enters the Email Review Queue

All email drafts without exception:
- Cold outreach emails (initial contact)
- Follow-up emails in sequences
- Nurture sequence emails
- Announcement emails to any list
- Transactional-style emails that include any promotional element

---

## Review Queue Entry Requirements

Before an email enters the review queue, it must:
1. Pass Email Compliance Policy checks (EMAIL_COMPLIANCE_POLICY.md)
2. Have no `severity: block` compliance flags
3. Have at least 2 subject line variations generated
4. Include preview text suggestion
5. Have lead research context attached (for outreach)
6. Have idempotency key set

If any of these is missing: email does not enter the review queue. Returns to Email Copy Agent for completion.

---

## Review Queue Format for Each Email

Alfred sees in the review queue:

```
TYPE: Cold Outreach Email
LANE: Colvin Enterprises
LEAD: Mike Smith | Smith HVAC | Indianapolis, IN
SCORE: 8/10 (high fit)
STEP: 2 of 3 (first email sent via LinkedIn connection accepted)

SUBJECT LINE OPTIONS:
  A) "AI automation for Smith HVAC?"          [Score: 9/10]
  B) "Question about your dispatch process"    [Score: 8/10]
  C) "How similar HVAC companies save time"    [Score: 7/10]

PREVIEW TEXT: "I work with Indianapolis service businesses..."

BODY:
[Full email text]

COMPLIANCE: ✓ PASS (all checks passed)

RESEARCH CONTEXT:
  Company: Smith HVAC, 15 employees, commercial HVAC in Indianapolis
  Source: Google Maps listing + company website
  Outreach Angle: Manual dispatch + scheduling, no evident automation

APPROVE / REJECT / REQUEST REVISION
```

---

## Escalation Triggers

Email is escalated to top of queue when:
- Lead has `qualification_score >= 9`
- Compliance flag with `severity: warning` or higher
- First Keys Indy email (HUD risk — always top of queue)
- Email contains a financial claim of any kind

---

## Approval Decision Processing

**Alfred Approves:**
- Email status → `approved`
- Alfred's selected subject line saved to outreach record
- Alfred manually sends (via his email client or preferred tool)
- Sends timestamp recorded in outreach record
- `contact_window_expires_at` set to now() + 30 days

**Alfred Rejects:**
- Status → `rejected`
- Lead stays in CRM at current status
- Reason logged for future reference

**Alfred Requests Revision:**
- Agent regenerates once with Alfred's feedback
- New draft goes back to review queue
- Subject lines regenerated fresh

---

## Do Not Auto-Send

The email review gateway exists because:
1. Every email represents Alfred's name and reputation
2. First impressions cannot be taken back
3. Compliance risk is real (especially First Keys Indy)
4. Personalization quality must be verified by a human

There is no auto-send bypass. Ever. Even for "safe" sequences.
