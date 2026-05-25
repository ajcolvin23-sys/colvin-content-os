---
file: EVIDENCE_STANDARDS.md
role: How to score, classify, and act on research findings
load: During any evidence-review task or after every research run
---

# Evidence Standards

## The Core Rule

Gabriel must not believe everything it researches. Every finding must be scored before it can influence memory, skills, or workflows.

## Evidence Level Scale (1–5)

| Level | Label | Definition | What to Do |
|---|---|---|---|
| 1 | Weak idea | Untested claim, single anecdote, social media take | Save as idea only — do not act |
| 2 | Interesting pattern | Multiple anecdotes, plausible logic, no hard data | Recommend a test — do not treat as fact |
| 3 | Credible external evidence | Credible report, credible interview, case study, earnings call | Use cautiously — label as external evidence |
| 4 | Repeated elite operator pattern | Same principle observed across 3+ elite operators or companies | Propose skill/checklist update |
| 5 | Proven in Alfred's data | Gabriel ran a test, measured it, Alfred confirmed the result | Make default behavior after Alfred approves |

## Source Quality Tiers

| Tier | Source Type | Examples |
|---|---|---|
| Primary | Official company source | Amazon annual report, Apple WWDC keynote, Stripe documentation |
| High | Credible business publication | HBR, WSJ, Bloomberg, Fortune, Fast Company |
| High | Earnings call or shareholder letter | Berkshire annual letter, Shopify earnings call |
| Medium | Credible interview | Podcast transcript with named founder, YouTube interview with citation |
| Medium | Verified case study | Named company, named outcome, named timeframe |
| Medium | Expert analysis | Named practitioner with track record |
| Low | Anecdotal | "Someone told me," "I heard," "I read somewhere" |
| Weak | Social media claim | Twitter/X post, Reddit thread, LinkedIn humblebrag |
| Invalid | LLM-generated assertion | GPT-4 said it is so — NOT evidence |

## Finding Classification

Every finding must be classified as one of:

- **Fact** — directly verifiable from a primary or high-tier source
- **Inference** — a reasonable conclusion drawn from strong evidence, but not a fact itself
- **Pattern** — observed across multiple examples but not a controlled study
- **Hypothesis** — a testable idea worth running as an experiment
- **Test Recommendation** — a specific A/B test or experiment Gabriel should design

Never present a hypothesis as a fact. Never present an inference as a proven result.

## Memory Promotion Rules

| Evidence Level | Action |
|---|---|
| 1 | Log in `logs/research-log.md` only. Do not promote. |
| 2 | Log + add to `logs/proposed-skill-updates.md` as a test idea. |
| 3 | Log + add to `memory/proposed-research-memory.md` with evidence notes. |
| 4 | Log + add to `memory/proposed-research-memory.md` + propose `SKILL.md` or `checklist.md` update. |
| 5 | Log + add to `memory/proposed-research-memory.md` + propose `SKILL.md` update as default behavior. Alfred must approve. |

## Anti-Hallucination Rules

- If you cannot cite a source, do not present the claim as evidence.
- If research was done by an LLM without web access, classify everything at Level 1–2 unless citing a verifiable source.
- If a statistic cannot be traced to an original study or report, label it `[UNVERIFIED STAT]`.
- If a case study has no named company, label it `[ANONYMOUS — LOW WEIGHT]`.
- When in doubt, downgrade the evidence level by one.

## Example Evidence Score

**Finding:** Amazon uses a "working backwards" product development process — start from the press release, not the feature.

**Source:** Amazon's official leadership principles documentation + multiple earnings calls.

**Classification:** Fact (primary source)

**Evidence Level:** 3 (external, not yet tested in Alfred's context)

**Action:** Log in research-log.md. Propose as idea in proposed-skill-updates.md. Run internal test before promoting to Level 5.
