# Analytics Learning Loop — Examples

## Example 1: Weekly Analytics Review

**Data reviewed:** 7-day GA4 data for first-keys-indy.vercel.app

**Findings:**
- Bounce rate on Programs page: 78% (high — visitors aren't reading or clicking)
- Most-clicked element: "Book a Call" CTA in the hero (22% click rate — strong)
- Scroll depth on Programs page: average 34% (visitors aren't reading the full list)

**Interpretation:**
The hero CTA is working well — high click rate. The Programs page has a scroll depth problem — visitors bounce before reading the program details. This suggests the Programs page either has a formatting problem (wall of text) or a relevance problem (wrong information for the visitor's stage).

**Proposed improvement:** Break the Programs page into a card format with one card per program. Test whether 60% scroll depth improves.

**Proposed memory update:** "First Keys Indy bounce from Programs page is a known issue as of 2026-05-25. Cause: scroll depth too low. Proposed fix: card format."

---

## Example 2: Experiment Result Review

**EXP-001 concluded:**
CTA "Get the Free Buyer Guide" outperformed "Submit" by 59% on form fills.

**Learning:** Action-oriented labels with stated benefit outperform action-only labels. Update `website-cro/SKILL.md` CTA table with this confirmed pattern.
