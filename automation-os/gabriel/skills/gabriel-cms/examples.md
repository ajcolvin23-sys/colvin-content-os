# Gabriel CMS — Examples

## Example 1: Good CMS Draft (Low Risk)

**Task:** Update the FAQ section on First Keys Indy with new program information.

**Current version:**
"Q: What programs are available? A: Several down payment assistance programs are available in Marion County."

**Proposed version:**
"Q: What programs are available in Marion County? A: Marion County first-time buyers may be eligible for IHCDA's Next Home program, INHP's HomeReady program, and FHLBank Indianapolis grants. Eligibility varies. Contact an approved lender to determine your qualification."

**Change summary:** Added specific program names and required disclaimer.
**Risk level:** Low — FAQ, no primary CTA affected
**Compliance:** katrina_review_required (housing assistance content)
**Recommended action:** Hold for Katrina review, then approve

---

## Example 2: High Risk CTA Change (Handled Correctly)

**Task:** Change the primary CTA on First Keys Indy homepage from "Get the Free Buyer Guide" to "Check Your Eligibility."

**Assessment:**
- This is a primary CTA on the highest-traffic page
- Current CTA performance is unknown
- Risk level: High

**Recommended action:** A/B test via experiment-platform-workflow, not direct replacement.

**Reason:** The current CTA may be performing well. Replacing it blindly risks losing conversion data and potentially reducing form fills. Test first, replace only on confirmed improvement.

---

## Example 3: Version History Requirement

**Incorrect approach:** Gabriel edited the hero headline on colvin_enterprises landing page and saved the new version, deleting the old one.

**Correct approach:**
1. Retrieve current version: "Indianapolis AI Consultant — Automate the Work Your Team Hates"
2. Save current version to `content_versions` table before any change
3. Draft new version
4. Flag as pending_review
5. Only replace after Alfred approves AND version history is confirmed saved
