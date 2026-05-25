# Skill: Lead Scoring

## Scoring Formula

Total score: 1–10 (sum of 4 dimensions)

### Dimension 1: Firmographic Fit (0–4 points)
Does this person's role and company match Alfred's ideal client?

| Score | Criteria |
|---|---|
| 4 | Decision maker (owner, founder, C-suite) at a company that clearly needs Alfred's offer |
| 3 | Influencer or senior manager — can advocate internally |
| 2 | Relevant department head — right area, not the final decision maker |
| 1 | Mid-level employee — could refer, but not the buyer |
| 0 | No clear connection to Alfred's offer |

### Dimension 2: Timing Signals (0–3 points)
Are there signals this person needs help NOW?

| Score | Criteria |
|---|---|
| 3 | Recent funding, hiring surge, new role, or public pain point |
| 2 | Company growth signals (hiring, new location, expansion) |
| 1 | Active on LinkedIn, posts about relevant challenges |
| 0 | No timing signals found |

### Dimension 3: Channel Match (0–2 points)
Can we actually reach this person?

| Score | Criteria |
|---|---|
| 2 | LinkedIn URL + email both available |
| 1 | LinkedIn URL only OR email only |
| 0 | No reliable contact method found |

### Dimension 4: Lane Urgency (0–1 point)
Is this lane actively running campaigns?

| Score | Criteria |
|---|---|
| 1 | Lane is in `active_lanes` in gabriel-config.json |
| 0 | Lane is paused |

## Routing by Score

| Score | Action |
|---|---|
| 9–10 | Top priority — add to outreach queue immediately, surface in top 3 today |
| 7–8 | High value — add to outreach queue |
| 5–6 | Medium value — save to leads table, review when queue has space |
| 3–4 | Low value — archive with reason, do not queue |
| 1–2 | Not qualified — do not save to outreach queue |

## Scoring Notes

- Score with GPT-4o-mini (deterministic scoring, not creative)
- Always justify the score in `fit_reason` field
- Never inflate scores — Alfred's time is the constraint
- Re-score leads that have been in queue for 14+ days (circumstances change)
