---
name: market-research-loop
description: Use this skill when Gabriel needs to run a focused research session on any topic — marketing, lead generation, automation buyers, elite companies, top earners, sports branding, or workflow extraction.
status: Draft / Needs Real-World Validation
---

# Purpose

Runs a single-topic, time-boxed research session that produces ONE finding, ONE extracted workflow, and ONE proposal. Prevents research from becoming a shallow summary dump.

# When To Use

- Alfred asks "research X" or "find out how Y works"
- A research topic from `RESEARCH_TOPICS.md` is selected for today's daily loop
- A specific business question needs an evidence-based answer before Gabriel drafts content or proposes a test

# When Not To Use

- When the topic is specifically an elite company → use `elite-company-analysis`
- When the topic is specifically a top earner → use `top-earner-analysis`
- When the topic is specifically sports branding → use `sports-branding-analysis`
- When the task is to APPLY research that already exists → use the relevant application skill

# Required Inputs

- Research topic (specific — not "marketing in general")
- Business lane this applies to
- Time box (default: 20 minutes of research, then extract)

# Minimum Context Needed

- `research-loop/RESEARCH_TOPICS.md` — to confirm topic selection
- `research-loop/EVIDENCE_STANDARDS.md` — to score the finding
- `research-loop/RESEARCH_OUTPUT_FORMAT.md` — to format the output

# Workflow

1. Confirm topic and business lane
2. Select 1–3 sources from `RESEARCH_SOURCES.md` (High tier first)
3. Research for 20 minutes maximum. Stop at the time limit.
4. Extract ONE specific finding with a citable source
5. Run through `learning-group/evidence-judge.md` — score evidence level
6. If evidence < 3 → log and stop. No proposals.
7. If evidence ≥ 3 → extract workflow via `learning-group/workflow-extractor.md`
8. Produce Research Output (from `RESEARCH_OUTPUT_FORMAT.md`)
9. Log in `logs/research-log.md`
10. Route proposals per `learning-group/promotion-rules.md`

# Decision Rules

- One topic per session. Never combine.
- Stop researching at 20 minutes regardless of confidence.
- Do not present inference as fact.
- Do not build proposals on Level 1–2 evidence.
- If the source cannot be cited, downgrade to Level 1.

# Quality Checklist

- [ ] Topic was specific (not vague)
- [ ] Research used sources from RESEARCH_SOURCES.md High tier
- [ ] Evidence was scored before any proposal
- [ ] Finding is one clear sentence
- [ ] Source is cited specifically
- [ ] Classification is correct (fact | inference | pattern | hypothesis)
- [ ] Output matches RESEARCH_OUTPUT_FORMAT.md template
- [ ] Log entry added to research-log.md

# Common Failure Modes

1. **Research without time limit** — sessions become unfocused and produce weak findings
2. **Presenting inference as fact** — must label all inferences clearly
3. **Skipping evidence scoring** — proposals built on weak evidence mislead Gabriel
4. **Researching with LLM only, no source** — LLM assertions are not evidence
5. **Producing 5 findings instead of 1** — dilutes quality, buries the strongest insight

# Recovery Steps

If session produced vague findings → restart with a narrower topic question
If evidence level came back as 1–2 → log it and stop; propose experiment instead
If source cannot be verified → downgrade evidence level; add [UNVERIFIED] tag

# Output Format

See `research-loop/RESEARCH_OUTPUT_FORMAT.md` for exact template.

# Memory Update Rules

- Evidence ≥ 3 → add to `memory/proposed-research-memory.md`
- Evidence < 3 → log only
- Never promote without Alfred's review

# Skill Improvement Rules

When this skill fails: document in `failure-log.md`, identify root cause, propose fix.
Minimum 3 validated runs before promoting status from Draft to Testing.

# Examples

See `examples.md` in this skill folder.
