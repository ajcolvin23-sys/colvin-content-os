# Data Ethics Policy — Colvin Content OS

---

## Core Principles

1. **Collect only what is needed.** If a field is not used for a specific purpose, don't collect it.
2. **Use data only for its stated purpose.** Lead data collected for lane A is not repurposed for lane B without review.
3. **Respect privacy expectations.** Even if data is technically public, consider whether people would expect it to be used this way.
4. **Never harm.** No data use that could harm individuals, especially minors or vulnerable populations.

---

## PII Rules for Minors

**Girls Got Game lane — absolute rules:**
- No collection of any personal data from individuals under 18
- No photos, names, ages, schools, or locations of minors stored in any system
- No direct outreach to anyone under 18
- Event or program information for parents only
- Content about the program is fine; data about participants is not

---

## Prohibited Data Practices

| Practice | Status | Reason |
|----------|--------|--------|
| Purchasing lead lists | PROHIBITED | Unverifiable consent, likely CAN-SPAM violation |
| Scraping private LinkedIn profiles at scale | PROHIBITED | LinkedIn ToS, privacy violation |
| Scraping behind authentication | PROHIBITED | Unauthorized access |
| Storing EU resident PII without lawful basis | PROHIBITED | GDPR |
| Using contact data for a different lane than it was collected for | REQUIRES REVIEW | Purpose limitation |
| Retaining leads marked do_not_contact | PROHIBITED | Respect opt-outs |
| Sharing lead data with third parties | REQUIRES ALFRED APPROVAL | Data stewardship |

---

## Data Retention

| Data Type | Retention Period | Archive/Delete Action |
|-----------|-----------------|----------------------|
| Active leads | Until `do_not_contact` or 2 years inactive | Archive after 2 years |
| Contacted leads (no reply) | 90 days after last contact | Archive |
| Converted leads | Indefinite (CRM record) | — |
| `do_not_contact` records | Keep the record, purge PII | Retain opt-out flag, remove contact details |
| Workflow run logs | 90 days | Auto-purge |
| Incident records | 1 year | Archive to cold storage |
| Content drafts (unpublished) | 60 days | Auto-purge |

---

## Handling Data Deletion Requests

If a contact requests data deletion:
1. Create a P2 review ticket immediately
2. Route to Alfred within 24 hours
3. If Alfred confirms: run `CRM_HYGIENE_AGENT` delete routine for that record
4. Confirm deletion via Telegram notification to Alfred
5. Log in workflow_runs as `data_deletion_completed`

---

## Source Transparency

Every lead record must document:
- `provenance.source_url` — where the data came from
- `provenance.is_public_data` — whether the source is publicly available
- `provenance.robots_txt_checked` — whether scraping was permitted

An agent must not insert a lead record without complete provenance.

---

## AI-Generated Data Ethics

- Agents must never invent contact details (emails, phone numbers, names)
- Agents must never fabricate company information
- All AI-generated content must be labeled as AI-drafted in the review ticket context
- Statistical claims in content must cite a real source — never hallucinated figures

---

*Maintained by: Hermes + Security Review Agent. Reviewed quarterly.*
