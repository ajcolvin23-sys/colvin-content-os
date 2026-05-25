---
name: research-loop
description: Use this skill when Gabriel needs to orchestrate a multi-session research program on a complex topic that requires more than one daily run to fully understand — coordinates topic selection, evidence accumulation, and synthesis across multiple sessions.
status: Draft / Needs Real-World Validation
---

# Purpose

Meta-skill that manages a multi-session research program on a complex topic. Tracks what's been researched, identifies gaps, and synthesizes findings across sessions. Used when one daily run isn't enough.

# When To Use

- Alfred asks for a deep-dive on a complex topic (e.g., "fully understand how top AI agencies price their services")
- A topic needs multiple angles studied before proposing a skill update
- Monthly synthesis requires tracking 4 weeks of research on one theme

# When Not To Use

- For a single daily research session (use the specific research skill directly)
- For weekly synthesis (use `weekly-research-review`)

# Required Inputs

- The complex topic to research
- The number of sessions planned (typically 3–7)
- The business lane and goal

# Minimum Context Needed

- `research-loop/RESEARCH_TOPICS.md`
- `research-loop/EVIDENCE_STANDARDS.md`

# Workflow

1. Define the research question clearly
2. Break it into sub-questions (one per planned session)
3. For each session: select the relevant research skill and run it
4. Track findings in a dedicated research-log section
5. After all sessions: synthesize across findings
6. Identify cross-session patterns
7. Score composite evidence (patterns across sessions = higher level)
8. Produce synthesis output with final recommendation

# Decision Rules

- Minimum 3 sessions before declaring a cross-session pattern
- If sessions contradict each other → note the contradiction, don't pick a winner without more evidence
- Composite evidence across sessions can elevate a finding from Level 3 to Level 4

# Output Format

```
RESEARCH PROGRAM: [topic]
Sessions planned: [count]
Sessions completed: [count]
Lane: [Alfred's lane]

SESSION SUMMARY:
[Session 1 — finding — evidence level]
[Session 2 — finding — evidence level]
[Session N — finding — evidence level]

CROSS-SESSION PATTERNS:
[patterns that appeared in 3+ sessions]

COMPOSITE EVIDENCE LEVEL: [1–5]
FINAL RECOMMENDATION: [specific action]
```

# Examples

See `examples.md`.
