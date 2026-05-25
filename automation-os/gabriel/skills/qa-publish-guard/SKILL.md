---
name: qa-publish-guard
description: Use this skill before anything goes live — runs quality, compliance, brand, and safety checks on any content, page, or outreach draft before it reaches Alfred or a platform.
---

# Purpose

QA Publish Guard is Gabriel's always-on safety net. Nothing that touches the public or any prospect should bypass it. It checks quality, compliance, brand consistency, and safety in one pass.

# When To Use

- Before delivering any content draft to Alfred
- Before recommending any page go live
- Before outreach messages are staged for Alfred's approval
- Before any A/B test variant is launched
- Whenever `gabriel-cms`, `content-engine`, or `website-cro` finishes a draft

# When Not To Use

- For internal working notes or analysis (no external audience)
- When Alfred explicitly says "skip QA, I'll review manually"

# Required Inputs

- The draft content to be reviewed
- The target platform or channel (LinkedIn, web page, Facebook, email, etc.)
- The business lane it belongs to
- The intended action (publish / send / test / hold)

# Minimum Context Needed

- `business-context/BRAND_GUIDE.md`
- `core/SAFETY_AND_APPROVALS.md`

# Workflow

1. **Identify target** — what is being reviewed, where is it going, which lane?
2. **Run compliance check** — does this lane require Katrina review?
3. **Run brand check** — does it sound like Alfred?
4. **Run quality check** — is it accurate, specific, and actionable?
5. **Run safety check** — does it make any guarantee, share any credential, or auto-trigger any action?
6. **Run format check** — right length, right platform, no broken elements?
7. **Issue verdict** — PASS | REVISE | FAIL

# QA Standards by Category

## Compliance
- [ ] No guaranteed outcomes ("you will qualify," "you will get funded")
- [ ] Housing/grant content tagged `katrina_review_required`
- [ ] Youth content does not contain PII for minors
- [ ] No legal or financial advice given as fact

## Brand
- [ ] No banned openers (see BRAND_GUIDE.md)
- [ ] Tone matches platform (LinkedIn ≠ TikTok ≠ email)
- [ ] No hype words: "game-changer," "revolutionary," "leverage"
- [ ] CTA is specific and action-oriented

## Quality
- [ ] All factual claims are verifiable (no hallucinated statistics)
- [ ] Offer matches current OFFER_LIBRARY.md
- [ ] Length matches platform guidelines from BRAND_GUIDE.md
- [ ] No placeholder text (no "[INSERT NAME]" or "Lorem ipsum")

## Safety
- [ ] No API keys, credentials, or personal data included
- [ ] No auto-send, auto-publish, or auto-deploy trigger
- [ ] Status tag present: `pending_review` or `katrina_review_required`
- [ ] Alfred approval required before any external action

## Format
- [ ] Mobile-readable (short paragraphs, no walls of text)
- [ ] Correct format for the platform
- [ ] All links verified or flagged as TBD

# Decision Rules

- Any compliance failure → FAIL, tag `katrina_review_required`, do not deliver
- Any hallucinated fact → FAIL, remove the claim or flag as unverified
- Any banned opener → REVISE, rewrite the opening
- Minor tone issue → REVISE with inline suggestion
- All checks pass → PASS

# Common Failure Modes

1. **Skipping compliance check on first_keys_indy** — always check lane first
2. **Missing placeholder text in a draft** — scan for brackets and ellipses before passing
3. **Wrong tone for platform** — LinkedIn post written like a TikTok script
4. **Hallucinated statistic passed through** — always mark unverified stats with [UNVERIFIED]
5. **CTA pointing to wrong booking link** — verify the URL against WEBSITE_MAP.md

# Recovery Steps

FAIL: Return to the originating skill with specific inline notes on what to fix
REVISE: Show the exact line(s) to change and why

# Output Format

```
QA REVIEW
Content: [brief description]
Lane: [lane_id]
Target: [platform / channel]

COMPLIANCE: PASS | FAIL | N/A
BRAND: PASS | REVISE | FAIL
QUALITY: PASS | REVISE | FAIL
SAFETY: PASS | FAIL
FORMAT: PASS | REVISE

VERDICT: PASS | REVISE | FAIL

NOTES:
[Specific inline feedback — line by line if needed]

RECOMMENDED ACTION:
[Deliver to Alfred as-is | Return to [skill] for revision | Flag for Katrina review]
```

# Memory Update Rules

- Log repeated QA failures in `logs/failures.md`
- If the same type of issue appears 3+ times, update SKILL.md in the originating skill

# Examples

See `examples.md` in this skill folder.
