---
name: sports-branding-analysis
description: Use this skill when Gabriel needs to study sports or entertainment marketing systems — fan engagement, campaign arcs, sponsorship, athlete branding, community building — and translate them into practical Gabriel workflows.
status: Draft / Needs Real-World Validation
---

# Purpose

Translates elite sports and entertainment marketing systems into practical campaign designs, content arcs, community strategies, and event promotion tools for Alfred's businesses.

# When To Use

- Designing a campaign arc for a product launch or event
- Building a community engagement strategy for Girls Got Game or GloryEngine
- Studying how leagues or teams attract and keep fans (applied to Alfred's audience)
- Designing a sponsor pitch or deck for Girls Got Game
- Finding content distribution patterns from leagues or media companies
- Weekly research: one sports/brand system studied per week

# When Not To Use

- When the task is to study a large non-sports corporation (use `elite-company-analysis`)
- When the task is to study a marketing practitioner (use `top-earner-analysis`)
- When the task is to create content directly (use `content-engine`)

# Required Inputs

- Sports/entertainment organization to study
- Specific lens or system to extract (from SPORTS_BRANDING_FRAMEWORK.md)
- Alfred's business lane this applies to (Girls Got Game, GloryEngine, personal brand, other)

# Minimum Context Needed

- `research-loop/SPORTS_BRANDING_FRAMEWORK.md`
- `research-loop/EVIDENCE_STANDARDS.md`

# Workflow

1. Select organization and specific system to study
2. Find credible source (Sports Business Journal, official league docs, Front Office Sports)
3. Apply the SPORTS_BRANDING_FRAMEWORK.md translation table
4. Extract ONE campaign system, community strategy, or event promotion workflow
5. Score evidence
6. Translate specifically to Alfred's context (Girls Got Game, content arc, event, etc.)
7. Produce output using SPORTS_BRANDING_FRAMEWORK.md output template
8. Log in `logs/sports-branding-log.md`

# Decision Rules

- Always use the translation table — never apply sports concepts directly without translating
- "NFL teams do X" is not evidence; specific documented programs with results are evidence
- Girls Got Game applications take priority when relevance is equal
- Women's sports content (WNBA, Girls Got Game) must be positioned with respect and accuracy

# Quality Checklist

- [ ] Organization and specific system selected
- [ ] Credible source used (Sports Business Journal tier or higher)
- [ ] Translation table applied
- [ ] ONE workflow translated (not a summary)
- [ ] Girls Got Game application noted if relevant
- [ ] Evidence scored
- [ ] Alfred's business lane application is specific
- [ ] Logged in sports-branding-log.md

# Common Failure Modes

1. **Inspiration without translation** — "NBA teams build community" is not actionable
2. **Scale mismatch** — the NFL's $10B media rights system does not directly apply; extract the PRINCIPLE
3. **Missing Girls Got Game angle** — sports/women's sports research should always check for GGG application
4. **Weak source** — Twitter commentary about a team's branding is not evidence

# Recovery Steps

If translation is unclear → use SPORTS_BRANDING_FRAMEWORK.md translation table explicitly

# Output Format

Use template from `research-loop/SPORTS_BRANDING_FRAMEWORK.md`.
Log in `logs/sports-branding-log.md`.

# Memory Update Rules

- Strong translations (evidence ≥ 3) → propose to `memory/proposed-research-memory.md`
- Girls Got Game applications → also add to `business-context/BUSINESS_PORTFOLIO.md` proposed update

# Examples

See `examples.md`.
