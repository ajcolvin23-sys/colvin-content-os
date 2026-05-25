---
name: memory-curation
description: Use this skill when Gabriel needs to review, promote, archive, or correct any of its memory files — proposed-research-memory, approved-research-memory, or archived-research-memory.
---

# Purpose

Keeps Gabriel's memory files clean, accurate, and useful. Stale or incorrect memory is worse than no memory — it teaches Gabriel the wrong thing.

# When To Use

- Weekly memory review (memory-curator role)
- When a proposed memory item has been waiting 60+ days without approval
- When approved memory is contradicted by new research or Alfred's corrections
- When memory files are growing cluttered or duplicated

# When Not To Use

- For adding new research findings (use `market-research-loop` + `evidence-review`)
- For updating skills (use `skill-improvement`)
- For updating logs (logs are append-only — not curated)

# Required Inputs

- The memory file to review
- The review date range (e.g., "items added in the last 30 days")

# Minimum Context Needed

- `memory/proposed-research-memory.md`
- `memory/approved-research-memory.md`
- `learning-group/memory-curator.md` (review workflow)
- `learning-group/promotion-rules.md` (promotion thresholds)

# Workflow

1. Read `proposed-research-memory.md`
2. For each item: check age, evidence level, and Alfred's review status
3. Items older than 60 days with no approval → move to `archived-research-memory.md`
4. Items contradicted by newer research → flag for removal
5. Read `approved-research-memory.md`
6. Check each item: is it still accurate? Has anything contradicted it?
7. Flagged items → propose update or archive to Alfred
8. Write weekly memory report (from `learning-group/memory-curator.md`)
9. Log in `logs/memory-change-log.md`

# Decision Rules

- Never move an item to `approved-research-memory.md` without Alfred's explicit review
- Never delete an approved item — move to archived with a reason note
- When in doubt about whether an item is still valid → flag for Alfred's review, don't self-approve
- Duplicate items → keep the one with higher evidence level, archive the other

# Quality Checklist

- [ ] All proposed items reviewed for age and approval status
- [ ] Items older than 60 days actioned (archived or flagged)
- [ ] Approved memory reviewed for accuracy
- [ ] Contradictions flagged
- [ ] Duplicates removed
- [ ] Memory report written
- [ ] Logged in logs/memory-change-log.md

# Memory Item Format

Every item must have:
```
**Statement:** [specific claim or principle]
**Evidence:** [what supports it]
**Source:** [citation]
**Business:** [Alfred's lane]
**Confidence:** [1–5]
**Date added:** YYYY-MM-DD
**Review date:** YYYY-MM-DD (90 days from added)
**Status:** proposed | approved | archived
```

# Common Failure Modes

1. **Promoting items to approved without Alfred's review** — not allowed
2. **Deleting instead of archiving** — archive everything; never delete (memory may be useful later)
3. **Ignoring outdated items** — memory that isn't reviewed becomes a liability

# Recovery Steps

If memory files are very cluttered → run a full curation pass (all items) before resuming normal weekly checks

# Output Format

Weekly Memory Report format — see `learning-group/memory-curator.md`.

# Examples

See `examples.md`.
