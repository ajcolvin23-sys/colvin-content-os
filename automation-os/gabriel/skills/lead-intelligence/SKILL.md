---
name: lead-intelligence
description: Use this skill when Gabriel needs to find, profile, or score potential leads for any of Alfred's 9 business lanes using public signals, job postings, social media, reviews, or directories.
status: Draft / Needs Real-World Validation
---

# Purpose

Finds real people and companies with real pain, scores them against Alfred's ICP, and produces a ready-to-review lead record with outreach angle and compliance flag.

# When To Use

- Running a lead-gen session for any of Alfred's 9 lanes
- Scoring a prospect Alfred has flagged
- Researching a specific industry or geography for prospects
- Identifying which platform or method has the most qualified leads right now

# When Not To Use

- When the task is to write outreach messages (use `content-engine` with outreach context)
- When the task is to detect a single buying signal (use `automation-buyer-detection`)
- When the task is general market research (use `market-research-loop`)

# Required Inputs

- Target lane (which of Alfred's 9 businesses)
- Target geography (default: Indianapolis / Indiana unless specified)
- ICP profile for the lane (from `business-context/ICP_LIBRARY.md`)
- Desired number of leads (default: 3–5 per session)

# Minimum Context Needed

- `business-context/ICP_LIBRARY.md` (for the specific lane)
- `research-loop/LEAD_SIGNAL_LIBRARY.md` (scoring model)
- `research-loop/AUTOMATION_BUYER_SIGNALS.md` (signal detection)
- `core/SAFETY_AND_APPROVALS.md` (compliance rules)

# Workflow

1. Load ICP for the target lane
2. Select detection method based on ICP (load `learning-group/lead-intelligence-analyst.md`)
3. Search using the appropriate platform (LinkedIn, Google Reviews, Facebook Ad Library, Indeed)
4. For each candidate: run the signal scoring from `LEAD_SIGNAL_LIBRARY.md`
5. Dedup against Supabase `leads` table (by linkedin_url + lane)
6. Score: cold score | warm score | urgent pain score | revenue potential
7. Classify lead type: `person | organization | partner | referral_source`
8. Assign best offer recommendation
9. Flag compliance issues (youth, housing, nonprofit, grant)
10. Produce scored lead records, ready for Supabase insert
11. Log in `logs/lead-intelligence-log.md`

# Decision Rules

- Organizations without named contacts → `partnership_queue`, not `outreach_queue`
- Government agencies → `partnership_queue`, never cold outreach
- Youth organizations → require Katrina review
- Housing/grant context → require Katrina review
- All outreach must be drafted only — Alfred approves before sending
- Do not insert leads with urgent pain score < 20 into the outreach queue

# Quality Checklist

- [ ] ICP was loaded before starting
- [ ] Signal scoring applied to each candidate
- [ ] Lead type classified correctly
- [ ] Dedup check performed
- [ ] Compliance flags assigned
- [ ] No PII scraped beyond what is publicly listed
- [ ] Lead records include source URL
- [ ] Outreach angle note is specific (not "be personal")

# Common Failure Modes

1. **Including government agencies as outreach leads** — they are referral sources, not prospects
2. **Null names crashing Supabase insert** — handle name-unknown leads with display_name derived from company
3. **Not deduplicating** — same lead appearing in every daily run
4. **Weak signal scoring** — assigning high scores without finding specific signals
5. **Missing compliance flags** — housing and youth content has strict rules

# Recovery Steps

If null name encountered → use company name + title as display_name, mark `lead_type: organization`
If dedup check finds existing lead → check their current status before recreating

# Output Format

```
LEAD RECORD
Name: [name or company]
Type: person | organization | partner | referral_source
Company: [company]
Title: [title if known]
LinkedIn: [URL]
Lane: [alfred_lane_id]
Source: [where found + URL]

SIGNALS DETECTED:
[list of signals with scores]

COLD SCORE: [0–100]
WARM SCORE: [0–100]
URGENT PAIN SCORE: [0–100]
REVENUE POTENTIAL: [low | medium | high | very high]

BEST OFFER: [offer name]
OUTREACH ANGLE: [1 sentence — what to open with]
ROUTE: outreach_queue | partnership_queue | nurture_only

COMPLIANCE: [none | katrina_review_required]
STATUS: pending_review
```

# Memory Update Rules

- After 5+ successful lead sessions for a lane → propose ICP refinement to `ICP_LIBRARY.md`
- After a detection method consistently produces bad leads → log in failure-log.md and update checklist

# Skill Improvement Rules

Track which lead sources produce the highest warm scores. Update signal library after 10+ lead sessions.

# Examples

See `examples.md`.
