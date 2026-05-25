# Changelog

Track every structural change to Gabriel's architecture, skill files, or config.

---

## 2026-05-25 — Skills Architecture v1.0

**What changed:**
- Created progressive disclosure skill architecture
- Built 8 core skills: gabriel-cms, qa-publish-guard, website-cro, humblytics-experiment, paper-design-system, idea-browser-growth, content-engine, analytics-learning-loop
- Each skill has: SKILL.md, checklist.md, failure-log.md
- Created 5 core boot files: GABRIEL_BOOT.md, CONTEXT_ROUTER.md, MEMORY_PROTOCOL.md, TOOL_POLICY.md, SAFETY_AND_APPROVALS.md
- Created 5 business context files: BUSINESS_PORTFOLIO.md, BRAND_GUIDE.md, ICP_LIBRARY.md, OFFER_LIBRARY.md, WEBSITE_MAP.md
- Created workflow files: daily-growth-loop.md, weekly-skill-improvement-loop.md
- Updated CLAUDE.md to point to GABRIEL_BOOT.md only (removed 220-line AGENTS.md from always-on context)

**Why:**
Monolithic instruction file caused token waste, context pollution, and weaker task focus.
Progressive disclosure means Gabriel loads only what each task needs.

**Audit findings:**
- AGENTS.md: 220 lines loaded every session → moved detailed instructions to skills
- gabriel-agent.md, gabriel-daily-orchestrator.md, etc.: 512 lines of detailed workflows → preserved in scripts and referenced from skill files
- Old skills/ folder: 11 flat skill files with no failure logs, checklists, or progressive disclosure → superseded by new skill architecture

**Status:** Active
