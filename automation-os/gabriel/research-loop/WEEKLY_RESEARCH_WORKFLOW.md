---
file: WEEKLY_RESEARCH_WORKFLOW.md
role: Weekly research synthesis — deeper study of one elite company, one top earner, one sports brand, and pattern review of the week's daily runs
load: Every Friday, or when Alfred triggers "Gabriel, run the weekly research review"
---

# Weekly Research Workflow

## Runtime: 60–90 minutes (or one focused Claude Code session)

## Step 1: Review the Week's Daily Runs

Pull all entries from `logs/research-log.md` from this week.
Answer:
- How many runs completed?
- Which categories were covered?
- What patterns appear across multiple findings?
- What was the highest-evidence finding of the week?

## Step 2: Study One Elite Company (Deep)

Select company from `TOP_COMPANY_FRAMEWORK.md` priority list.
Run the 7-lens analysis.
Produce the Elite Company Analysis output.
Time-box to 25 minutes.

## Step 3: Study One Elite Operator

Select a top earner from `TOP_EARNER_FRAMEWORK.md` priority list.
Run the 6-lens analysis.
Produce the Top Earner Analysis output.
Time-box to 20 minutes.

## Step 4: Study One Sports/Brand System

Select from `SPORTS_BRANDING_FRAMEWORK.md` priority subjects.
Apply the translation table.
Time-box to 15 minutes.

## Step 5: Study One Automation/AI Trend

Select from Category 7 in `RESEARCH_TOPICS.md`.
Focus on: what SMBs are actually buying, what is getting traction, what Alfred can offer.
Time-box to 10 minutes.

## Step 6: Identify Repeated Patterns

Review all findings from Steps 1–5.
Ask: What principle appeared in more than one source?
Repeated patterns = higher evidence (potentially Level 4).

Document each pattern in this format:
```
PATTERN IDENTIFIED:
[Statement of the pattern]
Appeared in: [source 1], [source 2], [source 3]
Evidence level: [1–5]
Business application: [Alfred's lane]
```

## Step 7: Promote Patterns to Proposed Memory

For any pattern with evidence level ≥ 3:
Add to `memory/proposed-research-memory.md` with:
- The pattern statement
- Evidence behind it
- Source summary
- Confidence score
- Business application

## Step 8: Propose Skill Updates

For any skill that should be updated based on this week's research:
Add to `logs/proposed-skill-updates.md`:
- Skill name
- Specific line or section to add/change
- Evidence supporting the update
- Risk level of the update

## Step 9: Recommend Next Week's Experiments

Based on this week's research, propose 2–3 experiments for next week:
- Hypothesis
- Control vs. variant
- Primary metric
- Time requirement

## Step 10: Build Next Week's Research Agenda

Select 5 topics for next week from `RESEARCH_TOPICS.md`.
Ensure category rotation.
Flag any carry-forward items from this week.

## Step 11: Deliver the Weekly Report

```
WEEKLY RESEARCH REVIEW — [date range]

RUNS COMPLETED: [count]
CATEGORIES COVERED: [list]

TOP FINDING OF THE WEEK:
[1 sentence]

ELITE COMPANY STUDIED: [company]
KEY WORKFLOW EXTRACTED: [1 sentence]

TOP EARNER STUDIED: [name/type]
KEY PROCESS EXTRACTED: [1 sentence]

SPORTS/BRAND STUDIED: [name]
KEY TRANSLATION: [1 sentence]

REPEATED PATTERNS IDENTIFIED: [count]
[List each pattern with evidence level]

PROPOSED MEMORY UPDATES: [count]
PROPOSED SKILL UPDATES: [count]
EXPERIMENTS RECOMMENDED: [count]

NEXT WEEK RESEARCH AGENDA:
1. [topic + category]
2. [topic + category]
3. [topic + category]
4. [topic + category]
5. [topic + category]

HIGHEST PRIORITY NEXT ACTION:
[1 sentence — what Alfred or Gabriel should do first]
```

Save report to `research-output/latest-weekly-review.json`.
Log in `logs/research-log.md`.
