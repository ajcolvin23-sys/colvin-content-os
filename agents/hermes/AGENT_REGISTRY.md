# Agent Registry — Colvin Content OS

Complete registry of all agents in the system.

---

## Registry Table

| Agent | Folder | Mission | Inputs | Outputs | Status | Model |
|-------|--------|---------|--------|---------|--------|-------|
| Hermes Orchestrator | /agents/hermes/ | Route, monitor, repair all workflows | Triggers, events, health signals | Run records, incidents, alerts | IMPLEMENTED (partial) | gpt-4o |
| Gabriel Coordinator | /agents/gabriel/ | Business execution coordinator | Campaign briefs, daily context | Routed tasks to sub-agents | IMPLEMENTED (automation-os/) | gpt-4o |
| Gabriel Business Execution | /agents/gabriel/ | Run daily growth cycle across 9 lanes | Lane configs, calendar | Content + lead + video tasks | IMPLEMENTED (automation-os/) | gpt-4o |
| Gabriel Campaign Router | /agents/gabriel/ | Route content to right specialist | Campaign request | Task assignments | PLANNED | gpt-4o |
| Gabriel Brand Memory | /agents/gabriel/ | Enforce brand voice per lane | Content draft | Brand-checked draft | PLANNED | gpt-4o |
| Research Agent | /agents/research/ | Deep research with source verification | Research query | Structured research report | PLANNED | gpt-4o |
| Source Verification | /agents/research/ | Verify sources and tier them | Source URL | Tier + confidence score | PLANNED | gpt-4o |
| Lead Finder Agent | /agents/leadgen/ | Firecrawl-based lead extraction | Niche playbook + target URL | lead.schema.json records | PLANNED | gpt-4o + Firecrawl MCP |
| Lead Enrichment Agent | /agents/leadgen/ | Enrich lead records | Raw lead | Enriched lead | PLANNED | gpt-4o |
| Lead Scoring | /agents/leadgen/ | Score leads 0-10 | Lead record | qualification_score | PLANNED | Rule-based |
| Lead Deduplication | /agents/leadgen/ | Prevent duplicate leads | Lead + Supabase | Dedup decision | PLANNED | Rule-based |
| Vibe Marketing Agent | /agents/marketing/ | Research trends + create campaign angles | Lane + trend data | Campaign angles + post drafts | PLANNED | gpt-4o |
| Social Media Agent | /agents/marketing/ | Platform-specific post generation | Campaign angle | content.schema.json records | PLANNED | gpt-4o |
| Content Calendar Agent | /agents/marketing/ | Build and manage content calendars | Lane + platform | Calendar plan | PLANNED | gpt-4o |
| Campaign Angle Agent | /agents/marketing/ | Generate campaign angles | Lane + trend research | Angle options | PLANNED | gpt-4o |
| Caption and Hashtag Agent | /agents/marketing/ | Generate captions and hashtags | Content draft + platform | Caption + hashtag set | PLANNED | gpt-4o |
| Brand Voice Agent | /agents/marketing/ | Enforce Alfred's brand voice | Draft content | Brand-checked draft | PLANNED | gpt-4o |
| Gabriel Remotion Studio | /agents/remotion/ | Master video creation engine | Campaign brief | remotion_video.schema.json blueprint | PLANNED | gpt-4o + Remotion MCP |
| Remotion Video Agent | /agents/remotion/ | Generate full video JSON blueprint | Video brief | Validated blueprint | PLANNED | gpt-4o |
| Remotion Template Agent | /agents/remotion/ | Select and customize templates | Use case + lane | Template selection | PLANNED | Rule-based + gpt-4o |
| Remotion Scene Planner | /agents/remotion/ | Break concept into scenes | Video concept | Scene plan array | PLANNED | gpt-4o |
| Remotion Script Writer | /agents/remotion/ | Write voiceover + on-screen text | Scene plan | Script per scene | PLANNED | gpt-4o |
| Remotion Caption Timing | /agents/remotion/ | Generate caption timing data | Script | Timed caption JSON | PLANNED | gpt-4o |
| Remotion Asset Manifest | /agents/remotion/ | List all assets needed | Scene plan | Asset manifest JSON | PLANNED | gpt-4o |
| Remotion Render QA | /agents/remotion/ | QA rendered video | Render output | PASS/FAIL QA report | PLANNED | gpt-4o-vision or rule-based |
| Email Copy Agent | /agents/email/ | Generate personalized email sequences | Lead + lane context | outreach.schema.json + content.schema.json | PLANNED | gpt-4o |
| Outbound Sequence Agent | /agents/email/ | Multi-touch sequence management | Approved leads | Sequence drafts | PLANNED | gpt-4o |
| Funnel Builder Agent | /agents/funnels/ | Build conversion funnels | Offer + lane | Landing page + sequence copy | PLANNED | gpt-4o |
| Landing Page Copy Agent | /agents/funnels/ | Write landing page copy | Offer brief | Page copy sections | PLANNED | gpt-4o |
| Lead Magnet Agent | /agents/funnels/ | Create lead magnets per lane | Lane + audience | Lead magnet content | PLANNED | gpt-4o |
| Funnel Form Question Agent | /agents/funnels/ | Create qualifying quiz questions | Offer + audience | Question set | PLANNED | gpt-4o |
| Conversion Audit Agent | /agents/funnels/ | Audit existing funnels | Funnel URL/copy | Improvement recommendations | PLANNED | gpt-4o + Playwright MCP |
| Admin QA Agent | /agents/admin/ | Audit all automations | System state | Issue list + health report | PLANNED | gpt-4o |
| System Health Check Agent | /agents/admin/ | Check all provider health every 30 min | Provider configs | Health status JSON | PLANNED | Rule-based |
| Automation Audit Agent | /agents/admin/ | Weekly automation audit | workflow_runs | Audit report | PLANNED | gpt-4o |
| Security Review Agent | /agents/admin/ | Weekly security scan | Codebase + configs | Security report | PLANNED | gpt-4o |
| Error Log Review Agent | /agents/admin/ | Daily error log analysis | workflow_runs errors | Pattern report | PLANNED | gpt-4o |
| Daily Report Agent | /agents/admin/ | Generate daily system report | All workflow data | Daily briefing | PLANNED | gpt-4o |
| CRM Hygiene Agent | /agents/admin/ | Clean and deduplicate CRM | Supabase leads table | Cleaned records | PLANNED | Rule-based |
| Backup Restore QA Agent | /agents/admin/ | Verify Supabase backups | Backup metadata | Backup status report | PLANNED | Rule-based |

---

## Status Definitions

| Status | Meaning |
|--------|---------|
| IMPLEMENTED | Working code in automation-os/ or active in production |
| PLANNED | Specification exists, code not yet written |
| REQUIRES SETUP | Spec exists but needs OAuth, API key, or external config |
| BLOCKED | Cannot implement until dependency is resolved |

---

## Model Routing Notes

- **gpt-4o:** Default for all content generation, reasoning, research
- **gpt-4o-mini:** Used for low-complexity tasks (scoring, dedup checks, formatting)
- **Gemini Flash:** Fallback when OpenAI circuit breaker is open
- **Rule-based:** Deterministic logic only — no LLM needed (scoring formulas, dedup checks)
- **Remotion MCP:** Required for all video renders

Model selection is determined at the agent level. Hermes does not select models.
