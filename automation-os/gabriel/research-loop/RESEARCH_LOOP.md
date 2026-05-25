---
file: RESEARCH_LOOP.md
role: Overview of Gabriel's automated research system — how it works, what it produces, and how findings feed back into skills and memory
load: When starting a research task or reviewing how the research system works
---

# Gabriel Research Loop

## Purpose

Gabriel learns like a disciplined business brain: observe → research → extract patterns → judge evidence → propose tests → update memory → improve skills → repeat.

The research loop is NOT model fine-tuning. It is workflow learning through:
- structured research runs
- evidence scoring (1–5)
- pattern extraction
- experiment proposals
- memory proposals
- skill improvement proposals
- weekly and monthly synthesis

## What the Research Loop Produces

Every research run produces ONE of each:
1. **Direct finding** — what was learned
2. **Extracted workflow** — one reusable process
3. **Experiment proposal** — one testable idea
4. **Lead-generation use case** — one actionable lead insight
5. **Skill/checklist update proposal** — if evidence is strong enough
6. **Memory proposal** — for Alfred to approve
7. **Next action** — concrete next step

## Core Principle: One Topic Per Run

Do not research five things at once. Pick one topic. Go deep. Extract one workflow. Propose one test. Log it. Move on.

Multi-topic sessions produce shallow findings and weak evidence. Single-topic sessions produce strong, actionable insights.

## Research Categories

1. **Marketing** — tactics, positioning, storytelling, email, social, outreach, funnel copy
2. **Conversion** — landing page optimization, CTA testing, headline testing, offer framing
3. **Lead Generation** — finding buyers, detecting pain signals, qualifying prospects
4. **Automation Buyer Detection** — reading signals that someone is ready to buy automation
5. **Elite Company Analysis** — learning from Amazon, Shopify, Stripe, etc.
6. **Top Earner Analysis** — studying elite consultants, agencies, creators, operators
7. **Sports Branding** — applying sports/entertainment marketing systems to Alfred's brands
8. **Workflow Extraction** — turning research into a Gabriel-usable process

## Research Cycle Cadence

| Cadence | What Runs | Where |
|---|---|---|
| Daily | One focused research topic | `automation/daily-research-loop.md` |
| Weekly | One elite company + one top earner + one sports brand + pattern synthesis | `automation/weekly-research-review.md` |
| Monthly | Cross-topic pattern synthesis + new skills/workflows | `automation/monthly-strategy-synthesis.md` |

## How Findings Flow Into Gabriel

```
Research Run
    ↓
Research Output (JSON + markdown)
    ↓
Evidence Review (score 1–5)
    ↓
IF score ≥ 3 → Proposed Memory
IF score ≥ 4 → Proposed Skill/Checklist Update
IF score = 5 → Default Behavior (after Alfred approves)
    ↓
Alfred Reviews
    ↓
Approved → Gabriel Memory / Skill / Workflow Updated
Rejected → Logged in rejected-findings.md
```

## Sub-Documents

- `DAILY_RESEARCH_WORKFLOW.md` — step-by-step daily run
- `WEEKLY_RESEARCH_WORKFLOW.md` — weekly synthesis
- `MONTHLY_RESEARCH_WORKFLOW.md` — monthly strategy synthesis
- `RESEARCH_TOPICS.md` — prioritized topic list by category
- `RESEARCH_SOURCES.md` — credible sources by category
- `RESEARCH_OUTPUT_FORMAT.md` — exact output template
- `EVIDENCE_STANDARDS.md` — how to score and classify findings
- `LEAD_SIGNAL_LIBRARY.md` — buying signal scoring model
- `AUTOMATION_BUYER_SIGNALS.md` — automation buyer detection signals
- `TOP_COMPANY_FRAMEWORK.md` — how to study elite companies
- `TOP_EARNER_FRAMEWORK.md` — how to study elite operators
- `SPORTS_BRANDING_FRAMEWORK.md` — how to apply sports branding insights

## Safety Rules

- Never auto-approve research findings.
- Never update official skills without Alfred's approval (unless change is clearly corrective).
- Never treat external research as fact without scoring evidence level.
- Never save raw LLM research outputs to approved memory.
- Always classify: fact | inference | pattern | hypothesis.
