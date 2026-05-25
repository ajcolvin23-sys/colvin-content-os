---
file: LEARNING_GROUP.md
role: Overview of Gabriel's learning group — who does what, how findings flow, how Gabriel gets smarter over time
load: When running weekly or monthly learning reviews, or when setting up a new improvement cycle
---

# Gabriel Learning Group

## Purpose

The learning group is how Gabriel improves like a disciplined business team.
Not through model updates — through structured observation, honest evidence scoring, and deliberate skill updates.

Each "role" below is a workflow that Gabriel runs, not a separate sub-agent.
Do not activate sub-agents until workflows are proven stable.

## Roles (Workflows, Not Agents)

| Role | File | When Gabriel Runs It |
|---|---|---|
| Research Scout | `research-scout.md` | Daily research sessions |
| Evidence Judge | `evidence-judge.md` | After every research run, before proposals |
| Workflow Extractor | `workflow-extractor.md` | When extracting a process from research |
| Skill Librarian | `skill-librarian.md` | Weekly — reviewing and updating skills |
| Memory Curator | `memory-curator.md` | Weekly — reviewing and curating memory |
| Experiment Designer | `experiment-designer.md` | When designing A/B tests or structured experiments |
| Lead Intelligence Analyst | `lead-intelligence-analyst.md` | When scoring leads or updating the signal library |
| Brand Strategist | `brand-strategist.md` | When applying elite company or sports branding research |
| Conversion Optimizer | `conversion-optimizer.md` | When improving a page or CTA based on research |

## How Learning Flows

```
Daily Research Run (Research Scout)
    ↓
Evidence Scoring (Evidence Judge)
    ↓ if score ≥ 3
Workflow Extraction (Workflow Extractor)
    ↓
Proposed Memory Entry / Proposed Skill Update
    ↓ weekly
Skill Librarian reviews all proposals
Memory Curator reviews all proposals
    ↓
Recommendations delivered to Alfred
    ↓
Alfred approves / rejects
    ↓ approved
Approved Memory / Updated Skill
```

## Quality Standards

A learning group run is successful when:
- [ ] Evidence was scored before any proposal was made
- [ ] Proposals are specific (not vague)
- [ ] Proposals are tied to evidence (not opinion)
- [ ] No finding was promoted past its evidence level
- [ ] Proposals are logged whether approved or rejected
- [ ] Alfred was not burdened with low-confidence items

## What the Learning Group Never Does

- Auto-approve its own proposals
- Promote Level 1–2 findings to memory
- Update official skills without Alfred's review
- Generate proposals from LLM hallucination
- Replace a working system with an untested one

## Cadence

| Cadence | Role | Output |
|---|---|---|
| Daily | Research Scout + Evidence Judge + Workflow Extractor | Research log entry + proposals |
| Weekly | Skill Librarian + Memory Curator + Experiment Designer | Weekly review report + approved changes |
| Monthly | All roles | Monthly synthesis + new workflows + next agenda |
