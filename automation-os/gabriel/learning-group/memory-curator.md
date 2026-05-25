---
file: memory-curator.md
role: Weekly workflow for reviewing, curating, and maintaining Gabriel's memory files
load: Every Friday during weekly review, or when memory files grow stale
---

# Memory Curator Workflow

## Mission

Keep Gabriel's memory clean, current, and useful. An outdated memory is worse than no memory — it teaches Gabriel the wrong thing.

## Weekly Memory Review

### Step 1: Review proposed-research-memory.md

For each proposed memory item:
- How old is it? (Older than 60 days with no approval → archive)
- Is the evidence still valid? (If contradicted by newer research → archive)
- Has Alfred been asked to review this? (If not → flag for this week's report)

### Step 2: Review approved-research-memory.md

For each approved memory item:
- Is it still accurate? (Check against current business context)
- Has anything contradicted it? (New research or Alfred's corrections)
- Is it still being used? (If no skill references it → flag for review)

### Step 3: Review archived-research-memory.md

Quarterly only:
- Are any archived items worth restoring? (New evidence may have emerged)
- Are any items so outdated they can be permanently removed?

### Step 4: Write the Weekly Memory Report

```
WEEKLY MEMORY REPORT — [date]

PROPOSED ITEMS REVIEWED: [count]
PROPOSED ITEMS READY FOR ALFRED REVIEW: [count]
PROPOSED ITEMS ARCHIVED (expired): [count]

APPROVED ITEMS REVIEWED: [count]
APPROVED ITEMS FLAGGED FOR UPDATE: [count]

MEMORY HEALTH: [CLEAN | NEEDS ATTENTION | REQUIRES ALFRED REVIEW]
```

## Memory Item Format

Every memory item must include:

```
## [Memory Item Title]

**Statement:** [the specific thing Gabriel should know or do]
**Evidence:** [what supports this]
**Source:** [where it came from]
**Business:** [which of Alfred's lanes this applies to]
**Confidence:** [1–5]
**Date added:** YYYY-MM-DD
**Applies to:** [skill name | all skills | specific lane]
**Review date:** YYYY-MM-DD (90 days from added)
**Status:** proposed | approved | archived
```

## What Gabriel Never Saves to Memory

- Raw LLM research outputs without evidence scoring
- PII (names, emails, phone numbers)
- API keys or credentials
- Duplicate entries
- Speculative ideas at Level 1 confidence
- Logs or run summaries (those go in logs/, not memory/)
- Temporary task context from a current session
