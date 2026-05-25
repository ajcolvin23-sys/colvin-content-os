# Automation Buyer Detection — Examples

## Example 1: Hot Lead Detection

**Prospect:** Johnson Plumbing & Heating (Indianapolis)
**Sources:** Google Reviews, Website, Indeed

**Signals Found:**
- Google Reviews: 2 reviews mention "called and no one answered" → 8 pts
- Google Reviews: 1 review says "slow to follow up on quote" → 8 pts
- Website: No online booking (phone only) → 8 pts
- Website: No chat widget → 5 pts
- Indeed: Posted "Administrative Assistant" listing, mentions "manage client callbacks" → 9 pts

**Total: 38 pts → HOT LEAD**

**Dominant Signal:** Missed calls + no follow-up automation
**Best Offer:** Missed-call automation + AI receptionist
**Outreach Angle:** "I saw your Google reviews mention missed calls — I help Indianapolis contractors recover those calls automatically."

---

## Example 2: Government Agency Misclassification (What Not to Do)

**What happened:** Gabriel detected 4 automation pain signals on IHCDA's website and added them to the outreach queue.

**Why it failed:** IHCDA is a government housing agency — they are a referral partner for First Keys Indy, not a cold outreach target. High signal score does not override lead type classification.

**Rule added:** Classify lead_type BEFORE scoring signals. Government agencies are always partnership_queue regardless of signal score.

---

## Example 3: Monitoring Correctly

**Prospect:** Small Indianapolis marketing agency, 2 employees
**Signals:** Active social posts, no booking system (5 pts), no email list visible (6 pts)
**Total: 11 pts → COLD LEAD — Monitor Only**

**Action:** Added to nurture list (content only). No outreach drafted. Gabriel set a reminder to check in 30 days for updated signals.
