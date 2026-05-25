---
name: gabriel-cms
description: Use this skill when Gabriel needs to create, edit, schedule, approve, publish, or version any website content — pages, sections, CTAs, blogs, FAQs, landing pages, or lead magnets.
---

# Purpose

Gabriel's CMS skill manages all website content as structured, versioned drafts that Alfred approves before anything goes live. Nothing publishes automatically.

# When To Use

- Creating a new landing page or section
- Editing an existing headline, CTA, or offer block
- Scheduling a blog post or campaign page
- Creating a lead magnet page
- Updating FAQ content
- Versioning a page before making changes

# When Not To Use

- When the task is about conversion rate (use `website-cro`)
- When the task is about design layout (use `paper-design-system`)
- When the task is about social or email content (use `content-engine`)
- When the task is about reviewing quality before publish (use `qa-publish-guard`)

# Required Inputs

- Which site/lane the content belongs to
- Content type (page, section, blog, CTA, FAQ, lead magnet)
- Current version (if editing — always compare current vs. proposed)
- Alfred's goal for the change (more leads, clearer offer, new campaign)

# Minimum Context Needed

- `business-context/BUSINESS_PORTFOLIO.md` (lane context)
- `business-context/BRAND_GUIDE.md` (voice and tone)
- `business-context/WEBSITE_MAP.md` (which pages exist)
- `business-context/OFFER_LIBRARY.md` (for CTAs and value props)

# Workflow

1. **Identify** — which site, which page, which section, what is the goal?
2. **Retrieve current version** — never edit blind; always compare old vs. new
3. **Draft new version** — follow brand guide and offer library
4. **Write a change summary** — what is changing and why is it expected to improve results?
5. **Assess risk** — is this a high-traffic page? Does it change a CTA or offer? Flag risk level.
6. **Recommend action:** publish now | A/B test it | hold for approval
7. **Tag with status:** `pending_review`
8. **Pass to `qa-publish-guard`** before delivery

# Decision Rules

- If the change touches a primary CTA or hero section → recommend A/B test, not direct publish
- If the change fixes a typo or broken link → low risk, flag for quick approval
- If the content involves grant, housing, youth, or funding topics → tag `katrina_review_required`
- If there is no current version to compare → do not overwrite; create a new draft alongside
- Never delete a page version. Always save the old version before replacing.

# Quality Checklist

Run `qa-publish-guard` after drafting. Before that, check:
- [ ] Does the content match Alfred's brand voice?
- [ ] Is the CTA specific and action-oriented?
- [ ] Does the offer match the current `OFFER_LIBRARY.md`?
- [ ] Are all claims verifiable (no guarantees, no inflated numbers)?
- [ ] Is the reading level appropriate for the ICP?
- [ ] Is the mobile layout considered (short paragraphs, no walls of text)?

# Common Failure Modes

1. **Overwriting a page without saving the current version** — always retrieve and save the old version first
2. **Writing generic copy that doesn't match Alfred's voice** — load BRAND_GUIDE.md
3. **Missing the compliance check on first_keys_indy or funding_ready_indiana** — always check lane before drafting
4. **Proposing a live publish without QA** — always route through `qa-publish-guard`
5. **Changing the CTA without testing** — CTAs should be A/B tested, not swapped blindly

# Recovery Steps

If content was drafted without loading the brand guide → regenerate with BRAND_GUIDE.md loaded
If a CTA was changed without A/B test plan → flag it and recommend a test before publish
If compliance content was not flagged → add `katrina_review_required` tag, do not send to Alfred yet

# Output Format

```
CONTENT DRAFT
Lane: [lane_id]
Page/Section: [specific location]
Change Type: [new | edit | replace]
Risk Level: [low | medium | high]
Compliance: [none | katrina_review_required]

CURRENT VERSION:
[existing content or "none — new page"]

PROPOSED VERSION:
[full draft content]

CHANGE RATIONALE:
[1-3 sentences on why this improves results]

RECOMMENDED ACTION:
[publish | a/b test | hold for approval]

STATUS: pending_review
```

# Memory Update Rules

- After a successful publish: log in `logs/decisions.md` — what changed, what the expected outcome is
- After an A/B test launches: log in `logs/experiments.md`
- If a draft was rejected: log the reason — update this skill if the same mistake could repeat

# Examples

See `examples.md` in this skill folder.
