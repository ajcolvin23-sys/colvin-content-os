# Implementation Plan — Colvin Content OS

5-phase build plan for the full agent architecture. Each phase builds on the previous.

---

## Phase 0 — Foundation (Current State)

**Status: PARTIALLY COMPLETE**

What exists today in `automation-os/`:
- Gabriel agent (partial) — daily 15-step orchestration loop
- Lead generation foundation — basic prospect finding
- Content generation for some lanes — posts being generated
- Supabase connected — project iuzlbtfevzkerehmluqj
- Telegram bot configured — daily brief delivery
- OpenAI connected — GPT-4o + GPT-4o-mini in use
- Firecrawl MCP active — web research working
- Playwright MCP active — browser automation available
- Remotion MCP active — render server accessible
- Gemini MCP active — second-opinion model available

What Phase 0 does NOT have yet:
- Durable workflow state (run_id + trace_id tracking in Supabase)
- Schema validation on all outputs
- Review queue in Supabase with Alfred approval flow
- Deduplication against persistent CRM
- Circuit breakers + self-repair
- Full observability dashboard

---

## Phase 1 — Data Layer + Observability Foundation

**Goal:** All outputs are tracked, validated, and surfaced to Alfred in one place.

**Supabase tables to create:**
- `workflow_runs` — all pipeline stage records (workflow_run.schema.json)
- `review_tickets` — Alfred's approval queue (review_ticket.schema.json)
- `leads` — lead CRM (lead.schema.json)
- `content` — all content drafts (content.schema.json)
- `outreach` — email/LinkedIn drafts (outreach.schema.json)
- `remotion_videos` — video blueprints (remotion_video.schema.json)
- `incidents` — system incidents (incident.schema.json)

**Files to build:**
- `/lib/supabase/schema.sql` — full table definitions
- `/lib/supabase/client.ts` — Supabase client wrapper
- `/lib/validation/ajv-validator.ts` — AJV schema validation wrapper
- `/lib/tracing/trace.ts` — run_id + trace_id generation and propagation
- `/lib/review-queue/create-ticket.ts` — Human Review Gateway implementation

**Review queue dashboard (basic):**
- `/app/review/page.tsx` — Alfred sees all pending tickets
- `/app/review/[id]/page.tsx` — Alfred approves/rejects individual items
- Telegram notification: link to dashboard on new items

**Agents to activate in Phase 1:**
- Schema Validator (deterministic — AJV)
- Lead Deduplication Agent (deterministic — SQL)
- Human Review Gateway (deterministic — creates tickets)
- System Health Check Agent (deterministic — curl pings)

**Deliverable:** Alfred can see all agent outputs in one dashboard and approve/reject each item.

---

## Phase 2 — Lead Pipeline

**Goal:** Full daily lead generation running end-to-end with Alfred approval gate.

**Workflows to implement:**
- `DAILY_LEAD_WORKFLOW.md` — all 14 stages
- `EMAIL_OUTREACH_WORKFLOW.md` — all 10 stages

**Agents to build in Phase 2:**
- Research Agent (Firecrawl MCP wrapper with source verification)
- Lead Finder Agent (per-lane playbooks: indiana_backflow, colvin_enterprises, music_theory_secrets)
- Lead Enrichment Agent
- Lead Scoring Agent (rule-based, 4-dimension formula)
- Source Verification Agent (robots.txt check)
- Email Copy Agent (personalized drafts + 3 subject line options)
- Outbound Sequence Agent (3-step sequences per lane)
- Compliance Check Agent (CAN-SPAM, anti-hallucination pass)

**CRM to activate:**
- Lead dedup against `leads` table
- Contact window tracking (30-day rule)
- `do_not_contact` list enforcement

**Volume targets:**
- indiana_backflow: 5-10 leads/day, 3 outreach drafts
- colvin_enterprises: 3-6 leads/day, 3 outreach drafts
- music_theory_secrets: 5-10 leads/day, 3 outreach drafts

**Deliverable:** Alfred receives Telegram alert with "X outreach drafts ready" each morning. He reviews in dashboard, approves, and sends manually.

---

## Phase 3 — Remotion Content Pipeline

**Goal:** Full video blueprint generation running end-to-end with Alfred approval gate before render.

**Workflows to implement:**
- `DAILY_REMOTION_CONTENT_WORKFLOW.md` — all 14 stages

**Agents to build in Phase 3:**
- Gabriel Remotion Studio (master coordinator)
- Remotion Template Agent
- Remotion Script Writer
- Remotion Scene Planner
- Remotion Caption Timing Agent
- Remotion Asset Manifest Agent
- Remotion Video Agent (blueprint assembler)
- Remotion Render QA Agent

**MCP integrations:**
- Remotion MCP render trigger
- Remotion MCP status polling
- Render output storage in Supabase

**Blueprint approval flow:**
- Blueprint lands in review queue
- Alfred reviews blueprint summary in dashboard
- Alfred approves → render trigger fires
- Render completes → Alfred notified via Telegram with video URL

**Deliverable:** Alfred receives "Video ready: [campaign] | [platform] | [duration]s" via Telegram after approval + render.

---

## Phase 4 — Marketing Content + Email Funnels

**Goal:** Full content calendar running across all 9 lanes with daily social drafts and funnel email sequences.

**Workflows to implement:**
- `DAILY_MARKETING_WORKFLOW.md` — all 12 stages
- `FUNNEL_CREATION_WORKFLOW.md` — all 12 stages

**Agents to build in Phase 4:**
- Vibe Marketing Agent (research-first content strategy)
- Social Media Agent (all 5 platforms)
- Content Calendar Agent (gap detection + rotation)
- Campaign Angle Agent
- Caption and Hashtag Agent
- Brand Voice Agent
- Funnel Builder Agent
- Landing Page Copy Agent
- Lead Magnet Agent
- Form Question Agent
- Nurture Sequence Agent
- Offer Positioning Agent
- Thank You Page Agent
- Conversion Audit Agent

**Content calendar in Supabase:**
- Tracks all approved + scheduled posts
- Platform slots per lane (see DAILY_MARKETING_WORKFLOW.md table)
- Never auto-publishes — all to review queue first

**Deliverable:** Alfred receives "Marketing content ready: X posts, Y video concepts" each morning.

---

## Phase 5 — Observability, Self-Repair, and Admin Intelligence

**Goal:** Full observability dashboard, automated self-repair for known failure modes, and weekly intelligence reports.

**Workflows to implement:**
- `ADMIN_QA_WORKFLOW.md`
- `WEEKLY_OPTIMIZATION_WORKFLOW.md`
- `INCIDENT_RECOVERY_WORKFLOW.md`
- `STAGE_REPLAY_WORKFLOW.md`

**Agents to build in Phase 5:**
- Admin QA Agent
- Automation Audit Agent
- Security Review Agent
- Error Log Review Agent
- Daily Report Agent
- CRM Hygiene Agent
- Backup Restore QA Agent
- Hermes Supervisor (circuit breakers, incident creation)

**Observability dashboard (full):**
- `/app/dashboard/health` — adapter health at a glance
- `/app/dashboard/pipeline` — today's workflow run status
- `/app/dashboard/review` — Alfred's approval queue (PRIMARY)
- `/app/dashboard/renders` — Remotion render status
- `/app/dashboard/leads` — CRM summary

**Self-repair to implement:**
- Retry with backoff (transient errors)
- Circuit breakers per adapter
- DLQ for failed stage outputs
- Stage replay for recoverable failures
- Incident auto-creation for P1/P2

**Deliverable:** System monitors itself. Alfred sees a clean dashboard. Hermes fixes transient errors without waking Alfred. P1/P2 incidents escalate via Telegram.

---

## Build Priority Order

1. Supabase schema + tables (Phase 1 — unblocks everything else)
2. Review queue dashboard (Phase 1 — Alfred needs this to approve outputs)
3. Lead pipeline (Phase 2 — revenue-generating)
4. Remotion pipeline (Phase 3 — content at scale)
5. Marketing + funnels (Phase 4 — top-of-funnel growth)
6. Observability + self-repair (Phase 5 — reliability)

---

## Dependencies

| Phase | Depends On |
|-------|-----------|
| Phase 1 | Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) |
| Phase 2 | Phase 1 (Supabase tables), Firecrawl API key, OpenAI API key |
| Phase 3 | Phase 1 (Supabase tables), Remotion MCP running, `REMOTION_MCP_URL` |
| Phase 4 | Phase 1 (Supabase tables), Phase 2 (campaign angle from lead intel) |
| Phase 5 | All previous phases |

---

## Current Blockers

| Blocker | Affects | Resolution |
|---------|---------|-----------|
| Supabase tables not yet created | Phases 1-5 | Run schema.sql migration |
| Remotion MCP URL not confirmed | Phase 3 | Set `REMOTION_MCP_URL` in `.env.local` |
| No review queue UI | Phase 1 | Build `/app/review/` route |
| Lead playbooks (3 of 9 written) | Phase 2 | Write remaining 6 lane playbooks |

---

## Integration Status

Phase 0: PARTIALLY COMPLETE
Phases 1-5: PLANNED
