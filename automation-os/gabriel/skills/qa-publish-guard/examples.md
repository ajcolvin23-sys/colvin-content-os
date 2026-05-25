# QA Publish Guard — Examples

## Example 1: PASS

**Content:** LinkedIn post for Colvin Enterprises
"If your team is doing the same task 20 times a week, that's a candidate for automation. Indianapolis small businesses — what process would you automate first if you could? Drop it below."

**Compliance:** N/A (no housing, grant, youth, or funding content)
**Brand:** PASS (warm, local, specific, action-oriented question)
**Quality:** PASS (no hallucinated stats, no placeholder text, specific geography)
**Safety:** PASS (no auto-send trigger, status: pending_review)
**Format:** PASS (LinkedIn length, conversational tone, ends with engagement hook)

**VERDICT: PASS** — Deliver to Alfred for approval to post.

---

## Example 2: FAIL — Hallucinated Case Study

**Content:** Blog post for Colvin Enterprises
"One of our clients — a 25-person logistics company — reduced their follow-up time by 73% using our automation system in just 30 days."

**Quality check:** [FAIL] — This is a fabricated case study. Alfred has not confirmed this client or these numbers. Presenting it as a real client story is a false claim.

**VERDICT: FAIL — DO NOT DELIVER**
**Notes:** Remove the case study or replace with a verified, named case study Alfred approves. If no real case study exists, use a hypothetical framed correctly: "Clients like this often see..." with appropriate caveats.

---

## Example 3: REVISE — Wrong Platform Tone

**Content:** LinkedIn post that reads like a TikTok script:
"POV: You're a small biz owner and you're STILL doing manual follow-up 😭 ngl that's giving 2019"

**Brand check:** REVISE — tone is TikTok-native, not LinkedIn-appropriate. Alfred's LinkedIn audience is professional SMB owners; this register may undermine credibility.

**VERDICT: REVISE** — Rewrite for LinkedIn professional register. Keep the energy, but translate: "Still doing manual client follow-up? Here's what that costs you (and what to do instead)."
