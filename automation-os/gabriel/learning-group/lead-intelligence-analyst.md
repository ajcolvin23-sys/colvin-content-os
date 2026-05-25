---
file: lead-intelligence-analyst.md
role: Workflow for finding, scoring, and routing leads based on automation buyer signals and Alfred's ICP profiles
load: When running lead-intelligence or automation-buyer-detection tasks
---

# Lead Intelligence Analyst Workflow

## Mission

Find real people and companies with real automation pain, score them accurately, and hand them off ready for Alfred's review.

## Step 1: Select the Lane and ICP

Load `LEAD_SIGNAL_LIBRARY.md`.
Select the business lane and ICP profile to target today.
Do not research all 9 lanes at once.

## Step 2: Identify Sources

Based on the ICP, select the right detection method:
- LinkedIn Job Postings → admin/VA/receptionist hiring signals
- Google Reviews → missed call, slow response signals
- Facebook Ad Library → active spend with weak landing page
- Facebook Groups → local business owner pain posts
- Indeed/ZipRecruiter → overwhelm + manual work signals
- Website audit → no booking, outdated, no CRM evidence

## Step 3: Score Each Lead

For each candidate, complete the Lead Score from `LEAD_SIGNAL_LIBRARY.md`:

```
Lead: [Name or Company]
Source: [where found]
Signals detected: [list]
Cold score: [0–100]
Warm score: [0–100]
Urgent pain score: [0–100]
Revenue potential: [low | medium | high | very high]
Best offer: [offer name]
Outreach angle: [1 sentence]
Compliance flag: [none | katrina_review_required]
```

## Step 4: Deduplicate

Check lead name + company + LinkedIn URL against `leads` table in Supabase.
Do not create outreach for a lead already in the system unless status is `archived` or `not_interested`.

## Step 5: Route by Score

| Score | Route |
|---|---|
| Urgent pain ≥ 70 | Hot queue — surface in next Alfred review |
| Warm ≥ 50 | Standard review queue |
| Cold ≥ 30 | Nurture — add to content list |
| Below 30 | Monitor only — do not draft outreach |

## Step 6: Flag Compliance Issues

Leads involving:
- Government agencies → route to `partnership_queue`, not `outreach_queue`
- Youth organizations → require Katrina review
- Nonprofit/church grant context → require Katrina review
- First-time homebuyers → require Katrina review

## Step 7: Output

For each qualified lead, produce:
- Scored lead record (for Supabase insert)
- Outreach angle note (for Outreach Agent)
- Compliance flag

Add to daily research log under `lead-intelligence-log.md`.
