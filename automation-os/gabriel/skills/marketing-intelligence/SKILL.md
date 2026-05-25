---
name: marketing-intelligence
description: Use this skill when Gabriel needs to extract specific marketing tactics, frameworks, or examples from elite operators, top companies, or credible practitioners — to improve Alfred's marketing across any of his 9 business lanes.
status: Draft / Needs Real-World Validation
---

# Purpose

Extracts marketing wisdom from elite sources and converts it into specific, testable improvements to Alfred's marketing system — content, outreach, email, campaigns, offers, and storytelling.

# When To Use

- Researching proven marketing frameworks (direct response, email, LinkedIn, TikTok)
- Studying how elite operators get attention and trust
- Finding new offer positioning or campaign angle ideas
- Looking for content formats that consistently outperform
- Improving Gabriel's content-engine skill with external evidence

# When Not To Use

- When the task is creating content (use `content-engine`)
- When the task is improving a specific page (use `website-cro`)
- When the task is specifically a top earner study (use `top-earner-analysis`)
- When the task is a lead generation study (use `lead-intelligence`)

# Required Inputs

- Marketing topic or question (specific)
- Business lane or offer this applies to
- Whether looking for: tactic | framework | copywriting example | campaign structure

# Minimum Context Needed

- `research-loop/EVIDENCE_STANDARDS.md`
- `research-loop/RESEARCH_SOURCES.md`
- `business-context/BRAND_GUIDE.md` (for applying findings to Alfred's voice)

# Workflow

1. Define the specific marketing question to answer
2. Select sources (prioritize: credible practitioners > marketing publications > social posts)
3. Research for 20 minutes max
4. Extract ONE tactic, framework, or campaign structure
5. Score evidence (load `EVIDENCE_STANDARDS.md`)
6. Map to Alfred's business context: which lane, which offer, which channel
7. Test Alfred's brand fit: does this work in his voice and values?
8. Write the application — specific steps, specific copy direction
9. Determine if this suggests a CMS change, CRO test, or content experiment
10. Log and route per promotion rules

# Decision Rules

- Never apply a marketing tactic without checking BRAND_GUIDE.md first
- If the tactic involves guarantees or income claims → route through qa-publish-guard
- If the tactic involves a compliance-adjacent lane → tag katrina_review_required
- Do not recommend a tactic based on a single social media claim

# Quality Checklist

- [ ] Source is High or Primary tier
- [ ] Evidence level scored before recommendation
- [ ] Alfred's brand voice checked
- [ ] Compliance implications noted
- [ ] Specific application described (not "be more personal")
- [ ] Channel-specific format considered (LinkedIn ≠ TikTok ≠ email)

# Common Failure Modes

1. **Generic marketing advice** — "be more authentic" is not a tactic. Find the specific mechanism.
2. **Applying B2C tactics to B2B context** — Alfred's AI consulting is B2B; consumer persuasion patterns differ
3. **Tactics from scale he doesn't have** — "run Super Bowl ads" is not useful
4. **Wrong channel for the ICP** — verify where Alfred's target ICP actually spends time
5. **Missing brand fit check** — tactic may work in general but clash with Alfred's faith-rooted, warm style

# Recovery Steps

If findings are too generic → narrow the question to a specific campaign or copy element
If brand fit is unclear → load BRAND_GUIDE.md before writing any application

# Output Format

See `research-loop/RESEARCH_OUTPUT_FORMAT.md`.
Add marketing-specific section:
```
CHANNEL: [LinkedIn | TikTok | email | Facebook | in-person | other]
FORMAT: [tactic | framework | copy example | campaign structure]
ALFRED'S VOICE CHECK: [PASS | ADJUST | FAIL — reason]
```

# Memory Update Rules

- Evidence ≥ 3 + brand fit PASS → propose to `memory/proposed-research-memory.md`
- Evidence ≥ 4 → propose update to `skills/content-engine/SKILL.md` or `checklist.md`

# Skill Improvement Rules

Log failures in failure-log.md. Minimum 3 real runs before status changes to Testing.

# Examples

See `examples.md` in this skill folder.
