# Subject Line Testing Rules — Colvin Content OS

Generate, score, and select the best subject lines for Alfred's outreach and email sequences.

---

## Subject Line Generation

For every email, generate 3 subject line variations:
- **Variation A:** Curiosity/question approach
- **Variation B:** Specific/direct approach
- **Variation C:** Referential/personal approach

Alfred selects which variation to use when approving the email.

---

## A/B Test Framework

For email sequences with multiple recipients (e.g., nurture list, book launch):
1. Assign Variation A to first 50% of sends
2. Assign Variation B to second 50%
3. Track: open rate per variation (manually, or via email tool analytics)
4. After 50+ sends per variation: document winner in GABRIEL_BRAND_MEMORY_POLICY.md as learning
5. Use winning approach as Variation A in next batch

---

## Subject Line Scoring

Score each subject line before presenting to Alfred:

| Dimension | Score |
|-----------|-------|
| Clarity: does it clearly communicate what the email is about? | 0-3 |
| Curiosity: does it create a reason to open? | 0-3 |
| Personalization: does it reference the recipient specifically? | 0-2 |
| Spam risk: no trigger words, reasonable length | 0-2 |

Score 8-10: Green — present to Alfred
Score 5-7: Yellow — present but note weakness
Score < 5: Red — regenerate

---

## Character Limits

| Email Client | Optimal | Max Displayed |
|-------------|---------|--------------|
| Gmail (desktop) | 60 chars | ~70 chars |
| Gmail (mobile) | 40 chars | ~50 chars |
| Outlook (desktop) | 60 chars | ~73 chars |
| iPhone Mail | 40 chars | ~50 chars |

**Target: 40-55 characters.** This works across all clients.

---

## Preview Text

Always generate preview text alongside subject line:
- Length: 90-100 characters
- Should complement the subject, not repeat it
- The first line of the email body becomes preview text if no preview text specified — so write the first sentence accordingly

---

## Spam Word List

The Email Copy Agent scans every subject line for these high-risk terms:

**High risk (always flag):**
FREE!, FREE!!!, URGENT, LIMITED TIME, ACT NOW, CLICK HERE, GUARANTEED, NO CREDIT CHECK, MAKE MONEY, EARN EXTRA, WINNER, CONGRATULATIONS

**Medium risk (flag if combined with others):**
Free, Special, Save, Offer, Deal, Discount, Today only, Last chance, Reminder

**Context-dependent (check for misleading use):**
Important (only if genuinely urgent), Re: (only if actual reply), Fw: (only if actual forward)

---

## Subject Line Examples by Lane

### Colvin Enterprises
- "15 hours back per week — AI automation for [Company]?"
- "Quick question about [Company Name]'s scheduling process"
- "How Mike at [similar company] cut dispatch time in half"

### Indiana Backflow Directory
- "Indiana Backflow Directory — free listing for [Company]?"
- "Question about backflow testing in [County] County"
- "Found your business in the PLA database — wanted to connect"

### Music Theory Secrets
- "Gospel piano book — copy for you?"
- "The chord your music teacher didn't teach you"
- "For church musicians: Music Theory Secrets"

### First Keys Indy (nurture/opt-in only)
- "Your Marion County homebuyer guide is ready"
- "3 things most first-time buyers don't know about DPA"
- "Update: Marion County DPA availability"

### FundingReady Indiana
- "Indiana grant update: [Grant Name] accepting applications"
- "Your free Indiana grant checklist"
- "3 Indiana grants most small businesses miss"
