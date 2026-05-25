---
name: content-engine
description: Use this skill when Gabriel needs to create marketing content — LinkedIn posts, Facebook posts, TikTok scripts, Instagram captions, YouTube scripts, email campaigns, blog posts, or lead magnets.
---

# Purpose

Content Engine produces platform-specific, brand-aligned content for Alfred's 9 business lanes. It outputs production-ready drafts, not generic templates. Every piece goes through QA before delivery.

# When To Use

- Daily content drafts for LinkedIn, Facebook, Instagram, TikTok, YouTube
- Email campaign copy
- Blog post drafts
- Lead magnet content
- Video scripts (short-form and long-form)
- Content calendar planning

# When Not To Use

- Writing landing page or website copy (use `gabriel-cms` or `website-cro`)
- Research before creating content (use `idea-browser-growth` first)
- QA on content already drafted (use `qa-publish-guard`)

# Required Inputs

- Business lane
- Platform (LinkedIn / Facebook / Instagram / TikTok / YouTube / email / blog)
- Topic or theme (or "Gabriel picks based on what's relevant this week")
- Any specific goal (promote an offer, grow followers, nurture leads)
- Relevant recent context (current events, seasonal timing, Alfred's active promotions)

# Minimum Context Needed

- `business-context/BRAND_GUIDE.md` (voice, tone, length by platform)
- `business-context/OFFER_LIBRARY.md` (if post promotes an offer)
- `business-context/ICP_LIBRARY.md` (if writing for a specific audience)

# Workflow

1. **Identify the lane and platform**
2. **Define the goal** — awareness | engagement | lead capture | sales
3. **Select a content angle** from the Content Angle Bank (below)
4. **Write the draft** following platform guidelines from BRAND_GUIDE.md
5. **Check the hook** — first sentence must stop the scroll
6. **Check the CTA** — one clear action, never more
7. **Pass to `qa-publish-guard`**

# Content Angle Bank (rotate daily)

**Education angles:**
- "Here's what most [ICP] don't know about [topic]"
- "The [number] mistakes I see [ICP] make with [topic]"
- "How [outcome] actually works — no jargon"

**Story angles:**
- "Here's what happened when I [did X]"
- "A client came to me with [problem]. Here's how we solved it."
- "I almost [made mistake]. This is what stopped me."

**Proof angles:**
- "[Result] in [timeframe]. Here's exactly what we did."
- "Before vs. after: [specific transformation]"

**Belief angles:**
- "The thing no one tells you about [topic]"
- "Why [common approach] doesn't work — and what does"
- "I used to believe [X]. I was wrong."

**Indianapolis angles (use frequently — it differentiates Alfred):**
- "Indianapolis [ICP], this one's for you"
- "If you're running a business in Indy and you're not doing X..."
- "What I've learned working with Indianapolis [type of business]"

# Platform-Specific Rules

**LinkedIn:** Professional tone. Hook in line 1. Value delivered before CTA. 150–300 words. No hashtag spam.

**Facebook:** Conversational. Can be longer. Community-first. Relevant to the group's audience. No hard sell.

**Instagram:** Short caption. Hook in first line (before "more" cutoff). 1 emoji max per line. CTA: "link in bio" or direct action.

**TikTok:** Script format. Hook in first 3 seconds. Pattern interrupt. Punchy. 30–60 seconds. End with a question or call to action.

**YouTube:** Longer format. Promise in title. Deliver value early. Don't save the good stuff for the end.

**Email:** Subject line under 50 chars. One topic. One CTA. 150–300 words. Plain text preferred.

# Common Failure Modes

1. **Generic hook** — "Are you struggling with...?" is weak. Be specific.
2. **Too many CTAs** — one per post, always
3. **Wrong platform tone** — LinkedIn voice in a TikTok script is a mismatch
4. **No Indianapolis specificity on colvin_enterprises or first_keys_indy** — always ground local content in Indy context
5. **Promotional content for girls_got_game without compliance check** — youth-safe, no PII

# Recovery Steps

Weak hook → rewrite the first line with a specific fact, result, or question
Wrong platform tone → reload BRAND_GUIDE.md and rewrite section
No Indianapolis angle → find one angle that grounds the post locally
Missing CTA → add one specific, low-friction action at the end

# Output Format

```
CONTENT DRAFT
Lane: [lane_id]
Platform: [linkedin | facebook | instagram | tiktok | youtube | email | blog]
Goal: [awareness | engagement | lead capture | sales]
Content Angle: [from bank above]

DRAFT:
[Full content draft in platform format]

HOOK ANALYSIS:
[Is the first line strong enough to stop the scroll? Why?]

CTA: [exact CTA used]

COMPLIANCE: [none | katrina_review_required]
STATUS: pending_review
```

# Memory Update Rules

- High-performing content patterns → `logs/decisions.md`
- Content angle that failed → `failure-log.md`
- If a compliance issue was found → update `failure-log.md` and note which lane triggered it

# Examples

See `examples.md` in this skill folder.
