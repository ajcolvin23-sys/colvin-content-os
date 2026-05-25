# Paper Design System — Examples

## Example 1: Hero Section Component Decision

**Task:** Design the hero section for First Keys Indy

**Design options considered:**
1. Full-bleed photo + headline overlay (high visual impact, but may slow load)
2. Split layout — headline left, image right (clear hierarchy, fast load)
3. Centered text only with strong headline (fastest load, mobile-friendly, less visual)

**Selection:** Option 2 (split layout)
**Reason:** Marion County homebuyer audience is mobile-first. Split layout works well on mobile (stacks cleanly). Strong visual of a Marion County home on the right builds local trust. Load performance acceptable.

**Design decision logged:** Split hero layout approved for First Keys Indy. Component reusable for similar community-service landing pages.

---

## Example 2: Component Reuse

**New task:** Design the hero for FundingReady Indiana

**Previous decision:** First Keys Indy uses split hero layout with local photo + headline.

**Decision:** Reuse split hero component. Swap photo (business owner vs. homebuyer) and headline. Keep layout, font, and spacing system consistent.

**Benefit:** Design system consistency builds brand recognition across Alfred's community-service properties.

---

## Example 3: Mobile Check

**Content element:** Programs page on First Keys Indy — 6 program cards

**Desktop check:** 3×2 grid → clean, scannable ✅
**Mobile check:** 3×2 grid collapses to 1×6 on mobile → each card takes full screen height → good ✅
**Accessibility check:** Cards have sufficient color contrast, alt text on icons, readable at 16px base ✅

**Status:** Approved for production.
