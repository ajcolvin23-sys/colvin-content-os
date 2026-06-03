# Master Agent Map — Colvin Content OS

Complete registry of every agent in the system. Supervised by Hermes (planned).

> **Status reality (2026-06-03):** This was an architecture blueprint; most agents were
> never built as standalone units. The column below now reflects what actually runs.
> **What runs today** is `automation-os/scripts/gabriel:daily` (a 16-step runner) plus
> `scripts/render-daily.ts` (video render). The full agent mesh is being built per
> `agents/AGENT_MESH_BUILD_PLAN.md`.
>
> **Model note:** the original "GPT-4o" column is stale. Models now route through
> `automation-os/config/model-routing.json` (Claude — sonnet-4-6 default).

**Status legend:** REAL = runs in code today · PARTIAL = behavior exists but folded into
a script step, not a standalone agent · PLANNED = spec only, no code.

---

## Agent Registry

| Agent | Folder | Mission | Status | Where it lives today |
|-------|--------|---------|--------|----------------------|
| Hermes Orchestrator | hermes/ | Master orchestrator — routes all tasks, manages run lifecycle | PLANNED | — (gabriel:daily runs top-to-bottom instead) |
| Hermes Supervisor | hermes/ | SRE — health checks, circuit breakers, incidents | PLANNED | — |
| Gabriel Coordinator | gabriel/ | 9-lane daily execution driver | PARTIAL | `gabriel-daily-run.ts` main() loop |
| Gabriel Business Execution Agent | gabriel/ | Per-lane daily cycle | PARTIAL | folded into the step loop |
| Gabriel Campaign Router | gabriel/ | Routes campaigns to creative agents | PLANNED | — |
| Research Agent | research/ | Web research (Firecrawl/Brave) | PARTIAL | Step 3 lead scout queries |
| Lead Finder Agent | leadgen/ | Scrapes approved public sources | REAL | Step 3 |
| Lead Enrichment Agent | leadgen/ | Adds website/title/angle | PARTIAL | Step 3 + Step 4 |
| Lead Scoring Agent | leadgen/ | 1–10 scoring | REAL | Step 9 |
| Lead Deduplication Agent | leadgen/ | Idempotency/dedup vs CRM | REAL | Step 8 |
| Source Verification Agent | leadgen/ | robots.txt / public-data / reachability | PARTIAL | Step 3 gating |
| Vibe Marketing Agent | marketing/ | Trend research + angles | PARTIAL | Step 7 (Genius Marketing) |
| Social Media Agent | marketing/ | Platform-specific posts | REAL | Step 5 |
| Content Calendar Agent | marketing/ | Calendar tracking, gap detection | PLANNED | — |
| Campaign Angle Agent | marketing/ | 2–3 scored angles per lane | PARTIAL | Step 7 |
| Caption and Hashtag Agent | marketing/ | Hashtags + captions | PARTIAL | Step 5 / infographic engine |
| Brand Voice Agent | marketing/ | Tone/voice/specificity check | PARTIAL | Phase 1–4 post-processing in Step 5 |
| Gabriel Remotion Studio | remotion/ | Concept → blueprint coordinator | PARTIAL | `render-daily.ts` pipeline |
| Remotion Video Agent | remotion/ | Assembles video blueprint | PARTIAL | Step 5 videoScript JSON |
| Remotion Template Agent | remotion/ | Selects template | PLANNED | implicit format routing only |
| Remotion Scene Planner | remotion/ | Scenes/durations/motion | PARTIAL | 6-scene structure in Step 5 |
| Remotion Script Writer | remotion/ | Hook/voiceover/text/CTA | PARTIAL | Step 5 |
| Remotion Caption Timing Agent | remotion/ | Word-by-word timing | PLANNED | — |
| Remotion Asset Manifest Agent | remotion/ | Asset list + license check | PARTIAL | `fetch-assets.ts` |
| Remotion Render QA Agent | remotion/ | 25-item QA checklist | PLANNED | — |
| Email Copy Agent | email/ | Outreach drafts + subjects | REAL | Step 4 |
| Outbound Sequence Agent | email/ | Multi-step sequences | PARTIAL | Step 3b follow-up queue |
| Funnel Builder Agent | funnels/ | Landing pages + funnels | PLANNED | — |
| Landing Page Copy Agent | funnels/ | Section-by-section copy | PLANNED | — |
| Lead Magnet Agent | funnels/ | Lead magnets per lane | PLANNED | — |
| Form Question Agent | funnels/ | Intake forms | PLANNED | — |
| Nurture Sequence Agent | funnels/ | 4-week nurture | PLANNED | — |
| Conversion Audit Agent | funnels/ | Funnel conversion audit | PLANNED | — |
| Offer Positioning Agent | funnels/ | UVP / positioning | PLANNED | — |
| Thank You Page Agent | funnels/ | Thank-you copy/logic | PLANNED | — |
| Human Review Gateway | shared/ | Review tickets → Alfred's queue | PARTIAL | Steps 10–11 |
| Compliance Check Agent | shared/ | CAN-SPAM/HUD/claims/youth | PARTIAL | evidence scanner + Katrina gate |
| Schema Validator | shared/ | JSON Schema (AJV) validation | PLANNED | — |
| Admin QA Agent | admin/ | Daily QA + issues | PLANNED | — |
| System Health Check Agent | admin/ | Per-adapter health | PARTIAL | Step 0 preflight |
| Automation Audit Agent | admin/ | Weekly audit | PLANNED | — |
| Security Review Agent | admin/ | Weekly security checklist | PLANNED | — |
| Error Log Review Agent | admin/ | Error-pattern analysis | PLANNED | — |
| Daily Report Agent | admin/ | Daily summary → Telegram/email | REAL | Steps 13 + 15 |
| CRM Hygiene Agent | admin/ | Dedup/archive/contact reset | PLANNED | done manually, not scheduled |
| Backup Restore QA Agent | admin/ | Backup verification | PLANNED | — |

**Tally:** REAL 6 · PARTIAL 14 · PLANNED 21.

---

## Supervision Hierarchy (target)

```
Alfred (human — final authority)
  └── Hermes Orchestrator
        ├── Hermes Supervisor
        ├── Gabriel Coordinator
        │     ├── Gabriel Business Execution Agent
        │     │     ├── Research · Lead Finder · Lead Enrichment · Email Copy · Social Media
        │     ├── Gabriel Campaign Router
        │     │     ├── Gabriel Remotion Studio → [Remotion sub-agents]
        │     │     ├── Vibe Marketing Agent
        │     │     └── Funnel Builder Agent
        │     └── Content Calendar Agent
        ├── Human Review Gateway
        ├── Compliance Check · Schema Validator
        └── Admin Agents (QA, health, audit, report)
```

## Build status

Active plan: `agents/AGENT_MESH_BUILD_PLAN.md` — full agent mesh, Video Studio first,
strangler-fig migration (gabriel:daily stays live until each agent reaches parity).
