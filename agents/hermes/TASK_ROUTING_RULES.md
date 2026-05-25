# Task Routing Rules — Colvin Content OS

Decision matrix for routing every task type to the right agent. Hermes consults this on every incoming request.

---

## Routing by Task Type

| Task Type | Primary Agent | Secondary / Support | Notes |
|-----------|--------------|---------------------|-------|
| Find new leads | Lead Finder Agent | Research Agent (for niche research) | Route to lane-specific playbook |
| Enrich a lead | Lead Enrichment Agent | Firecrawl MCP | Never invent data |
| Score a lead | Lead Scoring (rule-based) | — | See LEAD_SCORING_RULES.md |
| Deduplicate leads | Lead Deduplication | Supabase query | Idempotency check first |
| Write outreach message | Email Copy Agent | Research Agent | Always to review queue |
| Write email sequence | Outbound Sequence Agent | Email Copy Agent | CAN-SPAM check required |
| Generate social post | Social Media Agent | Vibe Marketing Agent | Platform-specific rules |
| Generate video concept | Gabriel Campaign Router → Remotion | Vibe Marketing Agent | Remotion is primary |
| Generate video blueprint | Gabriel Remotion Studio | Remotion Video Agent | Validate schema before queue |
| Render video | Remotion Render Pipeline | Remotion Render QA | After Alfred approval only |
| Build funnel | Funnel Builder Agent | Landing Page Copy Agent | First Keys Indy needs HUD check |
| Write landing page | Landing Page Copy Agent | Compliance Policy check | — |
| Create lead magnet | Lead Magnet Agent | — | See per-lane templates |
| Research a topic | Research Agent | Firecrawl MCP | Must cite sources |
| Audit system health | System Health Check Agent | — | Every 30 min |
| Generate daily report | Daily Report Agent | All workflow data | 9 PM ET daily |
| Handle incident | Hermes + Incident Response | Alfred via Telegram | See INCIDENT_RESPONSE_POLICY.md |
| Clean CRM | CRM Hygiene Agent | Lead Deduplication | Run at 4 AM daily |
| Weekly audit | Automation Audit Agent | Security Review Agent | Monday |
| Optimize workflows | Weekly Optimization | Hermes self-audit | Friday |
| Create content calendar | Content Calendar Agent | Social Media Agent | Per-lane |

---

## Routing by Lane

| Lane | Lead Playbook | Primary Content Agent | Compliance Check |
|------|--------------|-----------------------|-----------------|
| colvin_enterprises | COLVIN_ENTERPRISES_LEAD_PLAYBOOK.md | Social Media + LinkedIn focus | FTC disclosure |
| indiana_backflow_directory | INDIANA_BACKFLOW_LEAD_PLAYBOOK.md | Local SEO + Google presence | Standard |
| music_theory_secrets | PIANO_BOOK_APP_LEAD_PLAYBOOK.md | YouTube + Facebook + Remotion video | FTC (testimonials) |
| piano_app | PIANO_BOOK_APP_LEAD_PLAYBOOK.md | Paused | — |
| youtube_music_education | PIANO_BOOK_APP_LEAD_PLAYBOOK.md | YouTube optimization | Standard |
| first_keys_indy | None (inbound only) | Social + Email | HUD/RESPA — all content |
| funding_ready_indiana | Research Agent (grant databases) | Email + LinkedIn | Financial claims check |
| girls_got_game | None (community outreach) | Social (parents audience) | Youth safety — all content |
| glory_engine_yahweh_comics | Research Agent (faith media) | Social + Remotion | Faith-aligned check |

---

## Overlap Resolution Rules

When multiple agents could handle a task:
1. **Remotion always wins for video.** If any video is needed, Gabriel Remotion Studio is the primary agent — not any other content agent.
2. **Lead Enrichment before Scoring.** Scoring happens only after enrichment is complete.
3. **Compliance before Review Queue.** No ticket enters the review queue without compliance check.
4. **Research before Outreach.** Email Copy Agent requires research context before drafting.
5. **Dedup before Enrichment.** Check for duplicates before spending enrichment compute.

---

## Task Priority Hierarchy

1. P1 incident response (immediate)
2. Compliance-blocked items (same session)
3. Alfred-requested tasks (manual triggers)
4. Scheduled daily workflows (by cron order)
5. Background optimization workflows (low priority)

---

## Routing Decision Log

Every routing decision is logged in workflow_runs as a `source` field:
- `'cron'` — scheduled run
- `'manual_alfred'` — Alfred triggered
- `'incident_recovery'` — routing from incident
- `'replay'` — replaying from failed stage
- `'hermes_auto'` — Hermes auto-routed based on system state
