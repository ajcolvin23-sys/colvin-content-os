# Lead Intelligence — Examples

## Example 1: Good Lead Record

**Session:** Colvin Enterprises — Indianapolis SMB owners
**Source:** Indeed job posting for "Administrative Assistant" at a 12-person landscaping company

**Lead Record:**
- Name: Smith's Outdoor Services (organization)
- Type: organization
- Lane: colvin_enterprises
- Signals: hiring admin (9), no booking system visible on website (8), 80+ Google reviews with two "hard to reach" comments (7)
- Cold Score: 62 | Warm Score: 71 | Urgent Pain Score: 78
- Best Offer: Missed-call automation + booking automation
- Outreach Angle: "Saw you're hiring help with client scheduling — I automate that for landscaping companies in Indianapolis so you never miss a call."
- Route: outreach_queue
- Compliance: none

---

## Example 2: Correct Government Agency Handling

**Candidate:** IHCDA (Indiana Housing and Community Development Authority)
**Detected signals:** housing assistance, grant programs

**Correct classification:** `referral_source` → route to `partnership_queue`
**Reason:** Government agency. Cold outreach is inappropriate. Partnership or referral relationship is the right approach for First Keys Indy.

---

## Example 3: Null Name Handling

**Situation:** Firecrawl returned a lead with `name: null` from a LinkedIn company page
**Action:** Used `display_name = "Indy Tech Solutions (Company)"`, `lead_type = organization`
**Result:** Saved to Supabase without crash. Routed to partnership_queue pending name verification.
