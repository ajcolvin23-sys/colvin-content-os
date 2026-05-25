---
name: idea-browser-growth
description: Use this skill when Gabriel needs to research a market, validate an offer idea, score a growth opportunity, or identify an ICP and their pain points before building anything.
---

# Purpose

Idea Browser Growth handles all research and opportunity scoring before Alfred builds or launches anything. It prevents wasted effort on ideas that won't work by forcing market validation first.

# When To Use

- Alfred has a new business idea and wants to know if it's worth pursuing
- A new lane needs an ICP defined before content or outreach starts
- Gabriel needs to research a competitor or market trend
- Evaluating whether to expand an existing offer
- Scoring a content idea before it goes into production

# When Not To Use

- The idea is already validated and the task is to build it (use `gabriel-cms` or `content-engine`)
- The research is about A/B testing a live page (use `humblytics-experiment`)
- The task is SEO analysis of existing pages (use `analytics-learning-loop`)

# Required Inputs

- The idea or opportunity to evaluate
- Which business lane it applies to (or "new lane" if undecided)
- What question Alfred is trying to answer (validate? size? angle? ICP?)

# Minimum Context Needed

- `business-context/BUSINESS_PORTFOLIO.md` (to understand fit with existing lanes)
- Live web research via Firecrawl (never answer from memory alone)

# Workflow

1. **State the idea clearly** — write a 1-sentence description of what is being evaluated
2. **Identify the ICP** — who would pay for this, what do they care about?
3. **Research the market** — use Firecrawl to find real evidence of demand
4. **Identify the pain** — what specific problem does this solve?
5. **Score the opportunity** across 5 dimensions (see scoring rubric)
6. **Identify the best entry angle** — what landing page angle would resonate most?
7. **Give a build/test/skip recommendation**

# Opportunity Scoring Rubric (1–10 each)

| Dimension | What It Measures |
|---|---|
| Demand clarity | Is there clear, searchable evidence people want this? |
| ICP specificity | Is the target customer well-defined? |
| Offer differentiation | Is this meaningfully different from what exists? |
| Geographic fit | Does this work for Indianapolis / Indiana? |
| Alfred's credibility | Can Alfred credibly deliver this? Does he have proof? |

**Score interpretation:**
- 40–50: Strong. Build a landing page and test.
- 30–39: Promising. Define the ICP more and do one more research pass.
- 20–29: Weak signal. Needs a clearer angle before investing.
- Under 20: Skip or revisit in 6 months.

# Decision Rules

- Never recommend building a full product from research alone — recommend a landing page test first
- If Alfred already has an ICP file for this lane, use it and check if research confirms or contradicts it
- Always cite real sources from Firecrawl — never make up market data
- If research is thin (< 3 real sources found) → flag as insufficient and recommend a deeper search

# Common Failure Modes

1. **Answering from training data instead of live research** — always use Firecrawl for market data
2. **Scoring optimistically without real evidence** — demand clarity must be backed by search results
3. **Not connecting to Alfred's existing lanes** — always check if this fits or conflicts with what exists
4. **Recommending a full build before a test** — landing page test first, always
5. **Skipping the pain definition** — if you don't know what problem this solves, you can't score the ICP

# Recovery Steps

Insufficient sources → run additional Firecrawl queries with different search angles before scoring
Optimistic score without evidence → downgrade demand clarity, flag missing proof
Wrong lane fit → recommend whether this belongs in an existing lane or would require a new one

# Output Format

```
OPPORTUNITY RESEARCH
Idea: [one sentence]
Lane: [existing lane or "new"]
Question: [what Alfred wants to know]

ICP PROFILE:
Who: [description]
Pain: [specific problem]
Trigger: [what makes them ready to buy now]

MARKET EVIDENCE:
[3-5 real sources with URLs and brief summaries]

OPPORTUNITY SCORE:
- Demand clarity: [X/10] — [evidence or lack of it]
- ICP specificity: [X/10] — [how well-defined]
- Offer differentiation: [X/10] — [vs. competition]
- Geographic fit: [X/10] — [Indianapolis/Indiana relevance]
- Alfred's credibility: [X/10] — [does he have proof to back this]

TOTAL: [X/50]

BEST ENTRY ANGLE:
[Landing page headline + CTA suggestion]

RECOMMENDATION:
[Build landing page and test | More research needed | Skip]

REASON: [2-3 sentences]
STATUS: pending_review
```

# Memory Update Rules

- All scored opportunities → `logs/decisions.md` (even skipped ones — useful for future reference)
- Validated ICPs → update `business-context/ICP_LIBRARY.md`

# Examples

See `examples.md` in this skill folder.
