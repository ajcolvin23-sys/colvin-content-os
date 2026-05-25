# Compliance Policy — Colvin Content OS

**Scope:** All agents. All lanes. Non-negotiable.

---

## 1. First Keys Indy — HUD / RESPA Compliance

**Lane:** `first_keys_indy`
**Risk level:** HIGH. Federal law applies.

### Rules
- Never promise specific DPA grant amounts without citing the current HUD-approved program
- Never imply guaranteed approval for Down Payment Assistance
- Always include fair lending disclosure on any landing page or email
- No steering language (e.g., do not say "best neighborhood for buyers like you")
- All financial figures must match current Marion County / Indiana Housing Finance Authority programs
- If program amounts have changed, flag content as STALE — do not publish until verified
- Any claim_check on remotion_video.schema.json for this lane must include `first_keys_indy_hud_check: true`

### Compliance Flag Trigger Words (auto-flag)
- "guaranteed" + "approval" or "funds"
- Specific dollar amounts without source citation
- Race, ethnicity, religion, national origin, gender references near housing content
- "No credit check required" (must verify against actual program terms)

---

## 2. Email — CAN-SPAM Compliance

**Applies to:** All outbound email across all lanes.

### Rules
- Every email must have a clear unsubscribe mechanism
- Physical mailing address required (use Colvin Enterprises address)
- Subject lines must not be deceptive
- FROM address must clearly identify Alfred Colvin or the business
- No purchased email lists under any circumstances
- Unsubscribe requests must be honored within 10 business days (same-day preferred)
- No pre-checked opt-in boxes

### Auto-flag in outreach.schema.json
- `can_spam_missing_unsubscribe` — block severity
- Spam trigger words: "FREE!!!", all caps subject, excessive exclamation marks

---

## 3. GDPR Basics

**Applies to:** Any contact who might be in the EU/UK.

### Rules
- Do not store EU-resident personal data without explicit consent basis
- If a contact requests data deletion, route to Alfred immediately as P2 incident
- Do not transfer EU data to third-party services without documenting lawful basis
- Keep data minimization in mind: only store what is needed for the stated purpose

---

## 4. Youth Safety — Girls Got Game

**Lane:** `girls_got_game`
**Risk level:** HIGH. Content involves minors.

### Rules
- NO personal data collected from anyone under 18
- NO outreach to anyone under 18 directly
- All content must be appropriate for youth audiences (G-rated or PG at strictest)
- No third-party tracking on any Girls Got Game web pages without parental consent framework
- No photos of minors without verified parental consent documentation
- Agents must run youth_safety compliance check on ALL content for this lane
- Any `severity: block` compliance flag on this lane must alert Alfred via Telegram immediately

---

## 5. FTC Disclosures

**Applies to:** Music Theory Secrets, Piano App, Colvin Enterprises

### Rules
- Any testimonial or result claim must include "individual results vary" or equivalent
- Affiliate links must be disclosed (#ad, #sponsored, or similar)
- Income claims require FTC-compliant substantiation
- "Book sales" results cannot be stated without verifiable data

---

## 6. Faith-Based Content — GloryEngine / Yahweh Comics

**Lane:** `glory_engine_yahweh_comics`

### Rules
- Content must be faith-aligned. Verify against Alfred's stated Christian faith values.
- No content that contradicts or mocks biblical teaching
- Political content must not represent Alfred's faith organization
- Youth-safe standards apply if content reaches children

---

## 7. LinkedIn Outreach

- No mass connection requests (> 20/day is LinkedIn's risk threshold)
- No automated LinkedIn messaging without explicit confirmation it uses approved LinkedIn APIs
- Scraping LinkedIn at scale is prohibited. Manual research + Claude is the approved method.

---

## 8. Compliance Flag Severity Levels

| Severity | Meaning | Action |
|----------|---------|--------|
| `info` | Awareness only | Log, continue |
| `warning` | Needs review | Add to review ticket, hold |
| `block` | Cannot proceed | Stop workflow, alert Alfred |

---

## 9. Compliance Review Cadence

- **Weekly:** Security Review Agent runs compliance scan on all active campaigns
- **On every output:** compliance_flags array populated before any review ticket is created
- **On deploy:** Synthetic tests verify compliance keyword detection is functional

---

*Last updated: 2025. Maintained by: Hermes + Admin QA Agent.*
