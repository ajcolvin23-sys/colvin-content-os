---
name: elite-company-analysis
description: Use this skill when Gabriel needs to study how a top company solves a business problem — and extract a reusable workflow that Alfred can adapt.
status: Draft / Needs Real-World Validation
---

# Purpose

Studies elite companies (Amazon, Shopify, Nike, OpenAI, etc.) to extract proven processes, frameworks, and strategies that Gabriel can adapt for Alfred's businesses at his scale.

# When To Use

- Studying a company's customer acquisition system
- Extracting a brand positioning lesson
- Understanding an operational or AI strategy
- Finding a retention or referral system to adapt
- Weekly research review (one elite company studied per week)

# When Not To Use

- When the task is about a specific person (use `top-earner-analysis`)
- When the task is about sports marketing (use `sports-branding-analysis`)
- When the task is general market research (use `market-research-loop`)

# Required Inputs

- Company name
- The specific lens to study (from TOP_COMPANY_FRAMEWORK.md 7 lenses)
- Alfred's business lane this applies to most

# Minimum Context Needed

- `research-loop/TOP_COMPANY_FRAMEWORK.md` (7-lens study framework)
- `research-loop/EVIDENCE_STANDARDS.md` (evidence scoring)
- `research-loop/RESEARCH_SOURCES.md` (credible company sources)

# Workflow

1. Select company and study lens from TOP_COMPANY_FRAMEWORK.md
2. Identify primary source (annual report, official blog, earnings call, keynote)
3. Find one secondary source (Acquired podcast, Stratechery, HBR) to cross-check
4. Apply the 7-lens framework — focus on ONE lens per session
5. Extract ONE workflow or principle — not a summary of the company
6. Score evidence (primary source = Level 3 minimum)
7. Test scale applicability: does this work at Alfred's scale?
8. Write the Gabriel application — specific to a lane, skill, or workflow
9. Produce output using TOP_COMPANY_FRAMEWORK.md output template
10. Log in `logs/elite-company-log.md`

# Decision Rules

- Use only one lens per session — depth over breadth
- Cite primary sources first (company's own documentation)
- If a practice only works at Amazon's scale → explicitly note the gap
- Do not present "what the company says they do" as fact — cross-check with observable behavior
- Level 3 is the minimum before proposing any Gabriel adaptation

# Quality Checklist

- [ ] Company and specific lens selected before starting
- [ ] Primary source found and cited
- [ ] Secondary cross-reference checked
- [ ] One workflow extracted (not a summary)
- [ ] Scale gap assessed (does this work for Alfred?)
- [ ] Evidence scored (Level 3+ required for proposal)
- [ ] Gabriel application is specific to a lane and skill
- [ ] Logged in elite-company-log.md

# Common Failure Modes

1. **Studying a company broadly** — "Amazon does customer obsession" is not actionable. "Amazon's working backwards press release template" is.
2. **Primary source not used** — citing a Twitter thread about Amazon's culture is Level 1 at best
3. **Scale mismatch ignored** — Amazon's flywheel requires billions in infrastructure; extract the principle, not the mechanism
4. **Inspiration without extraction** — producing "very impressive company" summaries instead of workflows

# Recovery Steps

If finding is too high-level → return to a specific product, campaign, or process from the company
If primary source is unavailable → downgrade evidence level; note the gap

# Output Format

Use template from `research-loop/TOP_COMPANY_FRAMEWORK.md`.
Add to `logs/elite-company-log.md`.

# Memory Update Rules

- Evidence ≥ 3 + clear Gabriel application → propose to `memory/proposed-research-memory.md`
- Cross-company patterns (same principle in 3+ companies) → elevate to Level 4

# Skill Improvement Rules

Log failures. After 10+ company sessions, review which lenses produce the most actionable outputs for Alfred.

# Examples

See `examples.md`.
