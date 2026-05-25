---
file: evidence-judge.md
role: Workflow for evaluating research findings — score evidence level, classify the finding, decide what to do with it
load: After every research run, before making any proposals
---

# Evidence Judge Workflow

## Mission

Every finding gets scored before it influences anything. No exceptions. No "I think this is probably true."

## Step 1: Verify the Source

Can you cite the exact source?
- If YES → proceed to Step 2
- If NO → downgrade to Level 1. Do not proceed with proposals.

Does the source match the tier in `EVIDENCE_STANDARDS.md`?
- Primary source → possible Level 3–5
- Medium source → possible Level 2–3
- Weak source → Level 1 only

## Step 2: Classify the Finding

Is this a:
- **Fact**: Directly stated in a primary source with no interpretation needed?
- **Inference**: Your logical conclusion drawn from facts, but not a fact itself?
- **Pattern**: Observed across multiple examples — not proven, but notable?
- **Hypothesis**: An untested idea worth testing?

Label it clearly. Do not present an inference as a fact.

## Step 3: Assign Evidence Level

Use the scale from `EVIDENCE_STANDARDS.md`:
- 1 = Untested, single anecdote, social media
- 2 = Plausible, multiple anecdotes, no hard data
- 3 = Credible external evidence (named source, verified claim)
- 4 = Repeated pattern across 3+ elite operators
- 5 = Proven in Alfred's actual business data

Be conservative. When in doubt, score lower.

## Step 4: Check for Disqualifiers

Does the finding include:
- A statistic without an original study? → Add `[UNVERIFIED STAT]`
- A case study with no named company? → Add `[ANONYMOUS — LOW WEIGHT]`
- An LLM-generated assertion presented as evidence? → Disqualify entirely
- A claim that only works at 100× Alfred's scale? → Note the scale gap

## Step 5: Issue the Verdict

| Evidence Level | Verdict | Action |
|---|---|---|
| 1 | Log only | Add to research-log. No proposals. |
| 2 | Test recommendation | Add experiment idea to proposed-skill-updates. |
| 3 | Proceed with caution | Add to proposed-research-memory with source notes. |
| 4 | Promote | Add to proposed-research-memory + propose skill update. |
| 5 | Elevate | Propose as default behavior to Alfred. |

## What NOT to Do

- Do not let enthusiasm override evidence quality.
- Do not promote a finding because it "sounds right."
- Do not skip this step to save time.
- Do not assign Level 5 without Alfred's actual business data.

## Output

Hand to Workflow Extractor if evidence ≥ 3.
Log finding in research-log regardless of score.
Record verdict in the research output artifact.
