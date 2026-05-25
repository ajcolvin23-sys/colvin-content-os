# Skill Improvement — Examples

## Example 1: Good Skill Update

**Trigger:** `content-engine` produced a LinkedIn post with the opener "I hope this finds you well" — a banned opener.

**Root cause:** The checklist for content-engine didn't explicitly list all banned openers; it referenced BRAND_GUIDE.md which was not loaded.

**Proposed change:**
- File: `skills/content-engine/checklist.md`
- Action: Add
- Proposed text: "[ ] Banned openers not present: I hope this finds you well, your insights are vital, It's great to connect, I'd love to pick your brain, leverage, game-changer, revolutionary"

**Risk level:** Low (adding a checklist item)
**Applied directly** (no Alfred review needed for low-risk additions)

---

## Example 2: High-Risk Proposal Correctly Handled

**Trigger:** Research finding suggested removing the "always recommend A/B test for high-traffic pages" rule from website-cro, because a new study showed direct replacement was sometimes faster.

**Assessment:** This would contradict an existing rule. Evidence level was 3 — external, not Alfred's own data.

**Action:** Proposed to Alfred as medium-risk update. Not applied until Alfred reviews.

**Proposed change in `logs/proposed-skill-updates.md`:**
"Skills: website-cro — Rule contradiction proposed. Existing rule: 'always A/B test high-traffic pages.' New finding (Level 3): direct replacement acceptable when improvement is >40% on a tested element. Recommend: update rule to 'default to A/B test on high-traffic pages, with exception when improvement evidence is Level 4+.' Awaiting Alfred review."
