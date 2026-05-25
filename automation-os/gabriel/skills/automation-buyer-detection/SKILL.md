---
name: automation-buyer-detection
description: Use this skill when Gabriel needs to identify buying signals in a prospect, company posting, online review, or social media post that indicate readiness to purchase automation services.
status: Draft / Needs Real-World Validation
---

# Purpose

Reads specific public signals to determine whether a business is actively experiencing automation pain and is likely to buy. Produces a scored detection report with offer recommendation and outreach angle.

# When To Use

- Reviewing a prospect's LinkedIn profile, website, or posts for buying signals
- Scanning job postings for automation pain indicators
- Analyzing Google Reviews for operational pain patterns
- Alfred asks "is this company a good fit for my automation offers?"
- During lead-intelligence sessions to qualify a candidate

# When Not To Use

- When the task is to find new leads (use `lead-intelligence`)
- When the task is to write outreach (use `content-engine`)
- When the task is to research automation market trends (use `market-research-loop`)

# Required Inputs

- Prospect name or company name
- At least one public signal source (website, LinkedIn, Indeed posting, Google reviews)
- Target lane for Alfred's offer

# Minimum Context Needed

- `research-loop/AUTOMATION_BUYER_SIGNALS.md` (signal library + scoring)
- `research-loop/LEAD_SIGNAL_LIBRARY.md` (offer recommendations)

# Workflow

1. Load AUTOMATION_BUYER_SIGNALS.md
2. Identify what public sources are available for this prospect
3. Scan each source for signals from the signal table
4. Score each detected signal
5. Total the scores
6. Classify: Hot (35+) | Warm (20–34) | Cold (10–19) | Monitor (<10)
7. Identify the dominant signal mix → select best offer
8. Write outreach angle based on top signal
9. Flag compliance issues
10. Produce detection report

# Signal Scanning Protocol

**LinkedIn profile / posts:**
- Recent posts mentioning: overwhelmed, need help, hiring, manual work, spreadsheets, needing AI, needing more leads
- Job title suggests operational responsibility
- Company size 5–100 employees (sweet spot for Alfred's offers)

**Website:**
- No online booking → 8 points
- Contact form only (no automation) → 7 points
- Last blog post 2+ years ago → outdated site signal → 7 points
- No chat widget → 5 points

**Google Reviews (read the negative reviews):**
- "I called and no one answered" or "hard to reach" → 8 points
- "Slow response" → 8 points
- "Never followed up" → 9 points

**Indeed/LinkedIn Job Postings:**
- Hiring "Administrative Assistant," "Receptionist," "VA" → 9 points
- Job description mentions: "data entry," "follow up with clients," "manage spreadsheets" → 8 points
- "Manage scheduling" + small company → 9 points

**Facebook / Social:**
- Posts asking for tool recommendations → 7 points
- Posts about being swamped → 9 points
- Posts asking "does anyone know a good VA?" → 9 points

# Decision Rules

- Total score ≥ 35 → hot lead — recommend outreach this week
- Total score 20–34 → warm lead — add to standard queue
- Total score < 10 → monitor only — no outreach
- Government or nonprofit → route to partnership queue
- Youth/housing/grant context → require Katrina review before outreach

# Quality Checklist

- [ ] All available public sources checked
- [ ] Each signal scored from AUTOMATION_BUYER_SIGNALS.md (not estimated)
- [ ] Dominant signal mix identified
- [ ] Best offer selected based on signal mix
- [ ] Outreach angle is specific to dominant signal (not generic)
- [ ] Compliance flags checked

# Common Failure Modes

1. **Assigning high scores without finding specific signals** — score only signals you actually found
2. **Missing the review scan** — Google Reviews often have the strongest pain signals
3. **Using job posting age as a signal** — an old posting may already be filled; check for freshness
4. **Recommending outreach for government agencies** — always route to partnership queue

# Recovery Steps

If no signals found → classify as Monitor Only; do not force a lead where none exists
If signals are ambiguous → default to lower score tier

# Output Format

```
AUTOMATION BUYER DETECTION REPORT
Prospect: [name or company]
Sources Scanned: [list]
Date: YYYY-MM-DD
Lane: [Alfred's lane]

SIGNALS DETECTED:
[signal name] — [score] — [source where found]
[signal name] — [score] — [source where found]

TOTAL SCORE: [sum]
CLASSIFICATION: hot | warm | cold | monitor

DOMINANT SIGNAL: [top 1–2 signals]
BEST OFFER: [offer name]
OUTREACH ANGLE: [1 sentence — specific to the dominant pain]

COMPLIANCE: [none | katrina_review_required | partnership_queue]
STATUS: pending_review
```

# Memory Update Rules

After 10+ detection sessions: note which signal combinations most reliably predict high-score leads for each lane. Propose update to AUTOMATION_BUYER_SIGNALS.md.

# Skill Improvement Rules

Log failures. Track false positives (high score but Alfred rejects the lead). Adjust signal weights after 20+ sessions.

# Examples

See `examples.md`.
