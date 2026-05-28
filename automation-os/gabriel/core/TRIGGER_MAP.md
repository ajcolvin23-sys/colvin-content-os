---
file: TRIGGER_MAP.md
role: Quick-reference trigger conditions for skill loading
load: During Phase 2 self-audit — not upfront
---

# GABRIEL TRIGGER MAP

This is a quick-reference scan list. After free-thinking, check your output against these.
Load the skill ONLY when the trigger fires. Do not pre-load.

---

## COMPLIANCE TRIGGERS (fire → load lane SKILL.md compliance section)

| What you wrote | Trigger condition | Fix |
|---|---|---|
| "You'll save $X" / "earn $X more" | Specific dollar amount as guarantee | Replace with "may save", "can help reduce" |
| "Guaranteed leads / results / ROI" | Any "guaranteed" outcome | Replace with "identify opportunities", "find what can be improved" |
| "X% of businesses..." | Unverified statistic | Remove or label "[industry estimate]" |
| "Client A went from X to Y" | Specific client result presented as typical | Label "[example scenario]" or remove |
| "You will..." (absolute) | Absolute future promise | Replace with "you may", "many businesses find..." |
| Housing down payment amount | Specific dollar housing claim | Must include "subject to eligibility" qualifier |
| Interest rate / loan terms | Financial product claim | Katrina review required — flag immediately |

---

## BRAND VOICE TRIGGERS (fire → load lane SKILL.md brand voice section)

| What you wrote | Trigger condition | Fix |
|---|---|---|
| Buzzword stacking | "leverage synergies", "holistic paradigm", "scalable solutions" | Replace with direct plain English |
| Missing Indy context | Local lane content with no Indianapolis reference | Add one specific local grounding detail |
| Corporate detachment | Third-person distance, no personal voice | Rewrite in Alfred's first-person direct voice |
| Generic opener | "In today's competitive landscape..." | Cut it. Start with the hook. |
| Missing faith/community grounding | Faith-rooted lane content with no warmth | Add one human, community-grounded line |

---

## VIDEO STRUCTURE TRIGGERS (fire → load video-growth-architect SKILL.md)

| What you wrote | Trigger condition | Fix |
|---|---|---|
| No hook scene | Scene 1 is not a hook | Add hook scene at 0:00-0:03 |
| Buried CTA | CTA appears before 70% of video | Move CTA to last 20% |
| Over-length | TikTok > 60s, Reel > 30s, Short > 60s | Cut scenes to fit format |
| Weak hook | Hook doesn't create curiosity gap or pattern interrupt | Rewrite using hook library |
| Missing knowledge gap | Hook states a fact instead of creating a question | Reframe as question or contradiction |

---

## LANE VIDEO TRIGGERS (fire → load brand video SKILL.md)

| Condition | Load |
|---|---|
| Writing video for Colvin Enterprises | `skills/colvin-enterprises-video/SKILL.md` |
| Writing video for First Keys Indy | `skills/first-keys-indy-video/SKILL.md` |
| Writing video for Music Theory Secrets | `skills/music-theory-secrets-video/SKILL.md` |
| Wrong composition_id in scene JSON | Brand video SKILL.md → Remotion Configuration section |
| Wrong scene type for brand | Brand video SKILL.md → Scene types section |

---

## ALWAYS-ON TRIGGERS (these never need scanning — fire automatically)

| Condition | Action |
|---|---|
| Lane = first_keys_indy | Set status = needs_review. Add compliance_notice. Load Katrina gate. |
| Lane = funding_ready_indiana | Set status = needs_review. Add compliance_notice. Load Katrina gate. |
| Lane = girls_got_game | Set status = needs_review. Add compliance_notice. Load Katrina gate. |
| Generating video | Always check for unresolved image assets before render |
| Saving to DB | Always verify insert succeeded — never return 200 on failure |

---

## HOW TO USE THIS FILE

```
1. Generate output freely (Phase 1)
2. Open this file
3. Scan your output against each trigger condition
4. For each that fires: load the linked skill → fix only the flagged section
5. For none that fire: output passes — no skill loading needed
6. Always apply the ALWAYS-ON triggers regardless of what you found
```

**Speed rule:** Most well-generated outputs will trigger 0-1 items. 
If you're triggering 5+ items, the free-thinking phase produced poor quality — start over rather than applying patches.
