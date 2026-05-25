# Master Agent Map — Colvin Content OS

Complete registry of every agent in the system. Supervised by Hermes.

---

## Agent Registry

| Agent | Folder | Mission | Supervised By | Calls | Called By | Model | Status |
|-------|--------|---------|--------------|-------|-----------|-------|--------|
| Hermes Orchestrator | hermes/ | Master orchestrator — routes all tasks, manages run lifecycle | Self | All agents | Gabriel, Cron | GPT-4o | PLANNED |
| Hermes Supervisor | hermes/ | SRE — health checks, circuit breakers, incident creation | Hermes Orchestrator | System Health Check | Cron (every 5min) | GPT-4o-mini | PLANNED |
| Gabriel Coordinator | gabriel/ | 9-lane business coordinator — daily execution driver | Hermes | All lane agents | Daily cron, Alfred | GPT-4o | IMPLEMENTED (partial) |
| Gabriel Business Execution Agent | gabriel/ | Per-lane execution — runs daily cycle for each lane | Gabriel Coordinator | Research, Lead Finder, Email Copy, Social Media, Remotion | Gabriel Coordinator | GPT-4o | PLANNED |
| Gabriel Campaign Router | gabriel/ | Routes campaign requests to correct creative agents | Gabriel Coordinator | Remotion Video Agent, Social Media Agent, Email Copy Agent | Gabriel Coordinator | GPT-4o-mini | PLANNED |
| Research Agent | research/ | Web research via Firecrawl MCP | Hermes | Firecrawl MCP | Lead Finder, Vibe Marketing, Lead Enrichment | GPT-4o | PLANNED |
| Lead Finder Agent | leadgen/ | Scrapes approved public sources for new leads | Gabriel Business Execution | Research Agent, Firecrawl MCP | Daily Lead Workflow | GPT-4o | PLANNED |
| Lead Enrichment Agent | leadgen/ | Enriches raw leads with website, title, outreach angle | Gabriel Business Execution | Research Agent, Firecrawl MCP | Daily Lead Workflow | GPT-4o | PLANNED |
| Lead Scoring Agent | leadgen/ | Rule-based 4-dimension scoring formula | Gabriel Business Execution | None (rule-based) | Daily Lead Workflow | Deterministic | PLANNED |
| Lead Deduplication Agent | leadgen/ | Checks idempotency keys, email, company+name against CRM | Gabriel Business Execution | Supabase | Daily Lead Workflow | Deterministic | PLANNED |
| Source Verification Agent | leadgen/ | Verifies robots.txt, public data status, URL reachability | Lead Finder | Firecrawl MCP | Lead Finder Agent | Deterministic | PLANNED |
| Vibe Marketing Agent | marketing/ | Trend research + campaign angle generation | Gabriel Coordinator | Research Agent | Daily Marketing Workflow | GPT-4o | IMPLEMENTED (partial) |
| Social Media Agent | marketing/ | Platform-specific post generation | Gabriel Coordinator | None | Daily Marketing Workflow | GPT-4o | IMPLEMENTED (partial) |
| Content Calendar Agent | marketing/ | Calendar tracking, gap detection | Gabriel Coordinator | Supabase | Daily Marketing Workflow | GPT-4o-mini | PLANNED |
| Campaign Angle Agent | marketing/ | Generates 2-3 scored campaign angles per lane | Gabriel Coordinator | Research Agent | Daily Marketing Workflow | GPT-4o | PLANNED |
| Caption and Hashtag Agent | marketing/ | Platform-appropriate hashtags + optimized captions | Gabriel Coordinator | None | Daily Marketing Workflow | GPT-4o-mini | PLANNED |
| Brand Voice Agent | marketing/ | Verifies tone, voice, specificity per lane | Gabriel Coordinator | None | All content workflows | GPT-4o-mini | PLANNED |
| Gabriel Remotion Studio | remotion/ | Master Remotion coordinator — concept to blueprint | Gabriel Coordinator | All Remotion sub-agents | Daily Remotion Workflow | GPT-4o | PLANNED |
| Remotion Video Agent | remotion/ | Assembles full remotion_video.schema.json blueprints | Gabriel Remotion Studio | Remotion Scene Planner, Script Writer | Remotion Workflow | GPT-4o | PLANNED |
| Remotion Template Agent | remotion/ | Selects best-fit template from library | Gabriel Remotion Studio | None | Remotion Workflow | GPT-4o-mini | PLANNED |
| Remotion Scene Planner | remotion/ | Assigns scenes, durations, components, motion | Remotion Video Agent | None | Remotion Workflow | GPT-4o | PLANNED |
| Remotion Script Writer | remotion/ | Hook + voiceover + on-screen text + CTA | Remotion Video Agent | None | Remotion Workflow | GPT-4o | PLANNED |
| Remotion Caption Timing Agent | remotion/ | Word-by-word timing for captions | Remotion Video Agent | None | Remotion Workflow | GPT-4o-mini | PLANNED |
| Remotion Asset Manifest Agent | remotion/ | Lists all required assets with license verification | Remotion Video Agent | None | Remotion Workflow | GPT-4o-mini | PLANNED |
| Remotion Render QA Agent | remotion/ | 25-item QA checklist pre and post render | Gabriel Remotion Studio | Remotion MCP | Remotion Workflow | GPT-4o-mini | PLANNED |
| Email Copy Agent | email/ | Personalized outreach drafts + subject line options | Gabriel Business Execution | None | Daily Lead Workflow, Email Outreach Workflow | GPT-4o | PLANNED |
| Outbound Sequence Agent | email/ | Manages multi-step email sequences per lead | Gabriel Business Execution | Supabase | Email Outreach Workflow | GPT-4o-mini | PLANNED |
| Funnel Builder Agent | funnels/ | Builds and maintains landing pages + funnels | Gabriel Coordinator | Landing Page Copy, Lead Magnet | Funnel Creation Workflow | GPT-4o | PLANNED |
| Landing Page Copy Agent | funnels/ | Section-by-section landing page copy | Funnel Builder | None | Funnel Creation Workflow | GPT-4o | PLANNED |
| Lead Magnet Agent | funnels/ | Creates lead magnets per lane | Funnel Builder | None | Funnel Creation Workflow | GPT-4o | PLANNED |
| Form Question Agent | funnels/ | Designs intake forms per lane | Funnel Builder | None | Funnel Creation Workflow | GPT-4o-mini | PLANNED |
| Nurture Sequence Agent | funnels/ | 4-week email nurture sequences | Gabriel Business Execution | None | Funnel Creation Workflow | GPT-4o | PLANNED |
| Conversion Audit Agent | funnels/ | Audits funnel conversion rates | Gabriel Coordinator | Supabase | Weekly Optimization Workflow | GPT-4o-mini | PLANNED |
| Offer Positioning Agent | funnels/ | UVP and competitive positioning per lane | Gabriel Coordinator | Research Agent | Funnel Creation Workflow | GPT-4o | PLANNED |
| Thank You Page Agent | funnels/ | Thank-you page copy + logic per lane | Funnel Builder | None | Funnel Creation Workflow | GPT-4o-mini | PLANNED |
| Human Review Gateway | shared/ | Creates review_tickets, routes to Alfred's queue | Hermes | Supabase, Telegram | All workflows (final stage) | Deterministic | PLANNED |
| Compliance Check Agent | shared/ | CAN-SPAM, HUD/RESPA, claims, youth safety | Hermes | None | All content + email workflows | GPT-4o-mini | PLANNED |
| Schema Validator | shared/ | Validates all records against JSON Schema Draft-07 | Hermes | None | All workflows | Deterministic (AJV) | PLANNED |
| Admin QA Agent | admin/ | Daily QA checklist + issue creation | Hermes | Supabase | Admin QA Workflow | GPT-4o-mini | PLANNED |
| System Health Check Agent | admin/ | 30-minute health checks per adapter | Hermes Supervisor | All MCPs, Supabase, Telegram | Cron (every 30min) | Deterministic | PLANNED |
| Automation Audit Agent | admin/ | Weekly system audit report | Hermes | Supabase | Weekly cron | GPT-4o-mini | PLANNED |
| Security Review Agent | admin/ | Monday security checklist | Hermes | Supabase | Weekly cron | GPT-4o-mini | PLANNED |
| Error Log Review Agent | admin/ | Daily error pattern analysis | Hermes | Supabase | Daily 8PM cron | GPT-4o-mini | PLANNED |
| Daily Report Agent | admin/ | 9PM daily summary to Alfred via Telegram | Hermes | Supabase, Telegram | Daily 9PM cron | GPT-4o-mini | PLANNED |
| CRM Hygiene Agent | admin/ | Dedup, stale archiving, contact window reset | Hermes | Supabase | Daily 4AM cron | Deterministic | PLANNED |
| Backup Restore QA Agent | admin/ | Daily backup verification for Supabase | Hermes | Supabase | Daily 5AM cron | Deterministic | PLANNED |

---

## Model Routing Summary

| Model | Used For |
|-------|---------|
| GPT-4o | Complex reasoning, content generation, research synthesis, blueprint assembly |
| GPT-4o-mini | Routing, scoring, validation, dedup, quick checks, admin tasks |
| Gemini (via MCP) | Second-opinion checks, cross-model verification |
| Deterministic (code) | Math, sorting, dedup logic, schema validation — never LLMs for these |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| IMPLEMENTED | Agent exists in automation-os/ and runs today |
| PLANNED | Specified here; code not yet written |
| REQUIRES SETUP | Needs env var, OAuth, or external config before it can run |
| BLOCKED | Dependency not yet available |

---

## Supervision Hierarchy

```
Alfred (human — final authority)
  └── Hermes Orchestrator (master orchestrator)
        ├── Hermes Supervisor (SRE / health monitoring)
        ├── Gabriel Coordinator (9-lane business execution)
        │     ├── Gabriel Business Execution Agent (per-lane)
        │     │     ├── Research Agent
        │     │     ├── Lead Finder Agent
        │     │     ├── Lead Enrichment Agent
        │     │     ├── Email Copy Agent
        │     │     └── Social Media Agent
        │     ├── Gabriel Campaign Router
        │     │     ├── Gabriel Remotion Studio
        │     │     │     └── [All Remotion sub-agents]
        │     │     ├── Vibe Marketing Agent
        │     │     └── Funnel Builder Agent
        │     └── Content Calendar Agent
        ├── Human Review Gateway (approval gate — all workflows)
        ├── Compliance Check Agent (all content + email workflows)
        ├── Schema Validator (all workflows)
        └── Admin Agents (QA, health, audit, report)
```

---

## Integration Status

PLANNED — Full agent mesh in Phase 2-5. See IMPLEMENTATION_PLAN.md for phases.
