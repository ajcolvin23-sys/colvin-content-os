# GABRIEL AGENT LOOP — FULL SYSTEM AUDIT
**Date:** 2026-05-24  
**Auditor:** 20-Expert Panel (AI Architect, QA Lead, DevOps, Security, Compliance, Revenue, Growth, Data, Product)  
**Method:** Phase 1–5 framework + Red Team simulation  
**Files reviewed:** 50+ files across automation-os/, agents/, remotion/, gabriel_research_loop/, supabase/

---

## 1. EXECUTIVE VERDICT

**VERDICT: NOT DEPLOYMENT READY**

Gabriel has a working skeleton — Firecrawl lead sourcing is live, the daily cron runs, Telegram sends, and the Remotion video engine produces real output. These are genuine wins. But the system has **8 Critical blockers** that make it unreliable as a business operating system:

1. Memory is never written back — Gabriel forgets every run.
2. The database the entire architecture depends on doesn't have the tables it needs.
3. Leads with null names crash Supabase inserts — the CRM never actually fills.
4. Daily data files are overwritten without backup — data loss on any second run.
5. The content draft published today contains a hallucinated case study.
6. The scoring agent grades its own work (100% conflict of interest).
7. The entire Hermes/self-repair architecture is spec-only — zero running code.
8. There is no follow-up mechanism — the lead pipeline is a one-way dead end.

Fix these 8 and Gabriel becomes deployment-ready within one sprint.

---

## 2. TOP 25 HOLES

| # | Hole | Severity | Why It Matters | Exact Fix |
|---|---|---|---|---|
| 1 | **Memory never written back** | Critical | Step 2 reads `gabriel_memory`. Nothing writes back. Tomorrow's run always finds "No previous memory." Carry-forward, pending actions, and run stats are lost. | Add `step16_saveMemory()` that upserts to `gabriel_memory` at end of every run with today's stats, pending actions, and carry_forward items. Call after Step 15. |
| 2 | **Supabase missing 3 tables** | Critical | `workflow_runs`, `review_tickets`, `incidents` referenced by Hermes, SELF_REPAIR_SYSTEM, and OBSERVABILITY_PLAN — none exist. Hermes cannot function. | Create migration `003_hermes_tables.sql` with `workflow_runs`, `review_tickets`, `incidents` tables. See Section 10 for exact schema. |
| 3 | **Null names crash Supabase leads table** | Critical | `leads` table has `name TEXT NOT NULL`. Today's Firecrawl run produced 7 leads with `name: null`. Every insert fails silently. The CRM never fills. | Change `name` column to `name TEXT` (nullable). Add `display_name` computed column. Route null-name leads to `source_type: 'organization'` rather than person. |
| 4 | **Daily files overwritten without backup** | Critical | Running Gabriel twice on the same day (manual + cron) overwrites `YYYY-MM-DD-leads.json`, `YYYY-MM-DD-outreach-drafts.json`, `YYYY-MM-DD-content-drafts.json`. First run's data is gone. | Add timestamp suffix to filenames: `YYYY-MM-DD-HHMM-leads.json`. Keep all versions. Add symlink `latest-leads.json` → newest file. |
| 5 | **Hallucinated case study in live content draft** | Critical | Today's content draft says: "Consider the story of one of our clients who redirected their focus..." — this is a fabricated case study. If Alfred publishes this, it is a false claim presented as Alfred's real client history. | Add Evidence Scanner to QA gate. Any content draft containing "one of our clients", "a client", "case study", "results show", or specific metrics without a source citation gets flagged `QA: FAIL — unverified claim`. Do not pass to review queue. |
| 6 | **Scoring agent grades its own leads** | Critical | GPT-4o-mini generates leads AND assigns their score in the same prompt. It consistently gives its own inventions 8-9/10. No independence. Score is meaningless. | Split into two separate GPT calls: (a) Lead extraction from Firecrawl content, (b) Independent scoring using a rubric that checks: company exists, role is real, fit_reason is specific, source URL is real. Score should drop significantly for leads with `name: null`. |
| 7 | **Hermes architecture is 100% spec, 0% code** | Critical | `/agents/hermes/` contains 10 markdown files describing circuit breakers, stage replay, idempotency, incident creation. None of it runs. The actual system is a monolithic 723-line TypeScript file with no stage tracking, no circuit breakers, no idempotency keys. | Phase this implementation. Start with one real step: add idempotency key check before Supabase inserts. Mark Hermes docs as `SPEC: NOT YET IMPLEMENTED` until code exists. Don't claim architecture that doesn't run. |
| 8 | **No follow-up pipeline** | Critical | Gabriel creates LinkedIn connection requests. When Alfred sends them and connections are accepted, nothing happens. No follow-up message is triggered. No pipeline stage advancement. The CRM is a one-way dead end. | Add `outreach_pipeline_stage` field to leads: `new → connection_sent → connected → follow_up_sent → replied → meeting → closed`. Add Step 3.5: check for leads in `connected` status (Alfred marks these), queue follow-up drafts. |
| 9 | **SEO step is pure hallucination** | High | Step 6 asks GPT-4o to "identify SEO opportunities" with no web research, no keyword data, no rank tracking, no competitor data. Output is plausible-sounding fiction. | Replace with Firecrawl-powered research: scrape competitor pages, Google Search Console data (if connected), or at minimum use Firecrawl to search "[lane keyword] Indianapolis site ranking" and extract real data. Label GPT-only output as `type: hypothesis` not `type: opportunity`. |
| 10 | **Marketing recs step is pure hallucination** | High | Step 7 same problem. GPT invents recommendations without access to Alfred's actual metrics, pipeline, or conversion data. | Short-term: add disclaimer `[hypothesis — not data-driven]` to all Step 7 outputs. Long-term: feed real data: leads found this week vs last week, which lane is growing, which content performed (if tracking exists). |
| 11 | **Content only generated for `active_lanes[0]`** | High | `const targetLane = config.active_lanes[0]` — always `colvin_enterprises`. The other 4 active lanes (indiana_backflow, music_theory_secrets, first_keys_indy, funding_ready_indiana) never receive content drafts. | Replace with lane rotation: use `(dayOfWeek % active_lanes.length)` to rotate target lane. Or run content gen for all active lanes with a shorter format. Log which lane got content each day. |
| 12 | **Leads not saved to Supabase `leads` table** | High | Step 12 saves outreach drafts to Supabase but NOT the leads themselves. The `leads` table stays empty. Dedup in Step 8 always finds 0 duplicates. Every lead looks new every run. | Add `supabase.from('leads').upsert()` call in Step 12 for all scored leads. Use `linkedin_url + lane` as idempotency key. Handle null names. |
| 13 | **Government/nonprofit contacts misclassified as leads** | High | IHCDA, INHP, FHLBank Indianapolis were classified as "leads" with connection request drafts. These are government agencies — they are partnership/referral opportunities, not individual clients to cold-contact. Wrong outreach approach entirely. | Add `lead_type` field: `person | organization | partner | referral_source`. Organizations without a named contact get routed to `partnership_queue`, not `outreach_queue`. Different message type and different approval path. |
| 14 | **No backup before any file modification** | High | When Gabriel runs and rewrites `gabriel-daily-run.ts` (e.g., experiment implementation), there is no backup. Git history is the only recovery — which works in development but fails in production CI where changes may not be committed. | Before modifying any system file: `cp file.ts file_YYYY-MM-DD_HHMM_backup.ts`. Add `backupFile()` utility function to the script. Log backup creation. |
| 15 | **Email platform is "pending" indefinitely** | High | `platforms.json` says `"provider": "pending"`. Email is the highest-ROI channel for B2B outreach. No platform selected. No integration. No timeline. FundingReady Indiana and First Keys Indy especially need email sequences. | Select a platform (Resend is free, integrates with Next.js, has TypeScript SDK). Add email draft queue. Add `email_ready` boolean to lead records. This is blocking revenue. |
| 16 | **No content quality score** | High | Content drafts have no quality score. Alfred sees 1 draft in the review queue but has no signal for how good it is. Weak drafts and strong drafts look identical in the brief. | Add content scoring in Step 5: after generation, run a second GPT call scoring the draft on Hook Strength (1-10), Brand Voice Match (1-10), CTA Clarity (1-10), Factual Safety (1-10). Only drafts scoring 7+ on Factual Safety pass. |
| 17 | **`slice(0, 5)` overrides config `max_leads_per_lane_per_run: 10`** | Medium | Config says max 10 leads per lane. Firecrawl processing only sends 5 results to GPT regardless: `results.slice(0, 5)`. Config value is ignored for the GPT context window. | Change to `results.slice(0, Math.min(results.length, config.lead_scout.max_leads_per_lane_per_run))`. Honor the config. |
| 18 | **Prompt strings are hardcoded, unversioned** | Medium | All GPT prompts are inline string literals in `gabriel-daily-run.ts`. No version tracking. No A/B testing. Changing a prompt leaves no record of what the old prompt was. Can't tell which prompt change caused quality degradation. | Move all prompts to `automation-os/prompts/` as versioned markdown files: `lead-scout-prompt-v1.md`, `outreach-agent-prompt-v1.md`, etc. Load from file. Log which version was used in daily report. |
| 19 | **`found_at` missing from lead records** | Medium | `lead-scout-agent.md` spec requires `found_at: ISO timestamp` on every lead. The actual code doesn't include it. Dedup and staleness logic depend on this field. | Add `found_at: new Date().toISOString()` to each lead in Step 3 before returning. |
| 20 | **Lead spec conflict: max 15 vs config max 10** | Medium | `lead-scout-agent.md` says "Max 15 new leads per lane per run." `gabriel-config.json` says `max_leads_per_lane_per_run: 10`. Which wins? Config wins at runtime, but the spec doc is wrong. | Update `lead-scout-agent.md` to reference config value: "Max `[config.lead_scout.max_leads_per_lane_per_run]` leads per lane — see gabriel-config.json." |
| 21 | **Outreach forbidden openers list is incomplete** | Medium | `outreach-templates.json` has 6 forbidden openers. The GPT system prompt in Step 4 only lists 5 different ones. Neither list is complete. Today's draft said "your insights on down payment assistance are vital" — generic but allowed. | Consolidate to one canonical forbidden openers list in `automation-os/config/forbidden-openers.json`. Load it into every prompt that generates outreach. Add: "are vital", "It's great to connect", "I'd love to pick your brain". |
| 22 | **Report `skipped_steps` always empty** | Medium | When Firecrawl returns 0 results for a lane (funding_ready_indiana today), the lane is silently skipped. `skipped_steps` in the report stays `[]`. Alfred doesn't know. | Add `skippedLanes: string[]` tracking. When a lane is skipped due to 0 results, push to `skippedLanes`. Include in report and Telegram brief: "⚠️ funding_ready_indiana: no leads found." |
| 23 | **No CRM pipeline stage tracking** | Medium | Leads exist in Supabase with `status: 'new'` only. There are no stages: `contacted`, `connected`, `replied`, `meeting_booked`, `closed`, `lost`. Gabriel can't track pipeline velocity or report on it. | Add pipeline stage column and create a `LEAD_PIPELINE_STAGES` config. Add Step 8.5: load leads by stage from Supabase and include pipeline stats in the daily report. |
| 24 | **No silence/watchdog alert** | Medium | If GitHub Actions fails (expired secret, billing lapse, cron bug), no daily brief arrives. Alfred doesn't know Gabriel didn't run. There's no "silence detector." | Add a Vercel cron at 9 AM CST: check if today's `gabriel_memory` record exists in Supabase. If not, send Telegram alert: "⚠️ Gabriel did not run today. Check GitHub Actions." |
| 25 | **Weekly/monthly reports have no execution script** | Low | `gabriel-reporting.md` defines weekly report format. `gabriel-config.json` mentions `weekly_report_day: "friday"`. GitHub Actions cron has `0 14 * * 5` for weekly audit. But no script exists that generates the weekly report. | Create `scripts/gabriel-weekly-report.ts`. Add to `package.json`. Wire to GitHub Actions weekly cron. |

---

## 3. READINESS SCORECARD

| Category | Score | Reason |
|---|---|---|
| Clarity | 6/10 | AGENTS.md and individual agent docs are clear. But spec-vs-implementation gap creates confusion about what actually runs. |
| Reliability | 4/10 | Memory never saves. Files overwrite without backup. Supabase inserts fail on null names. System appears to run but doesn't persist correctly. |
| Automation Readiness | 5/10 | Daily cron runs. Telegram works. Firecrawl integrated. But no retry logic, no circuit breakers, no idempotency, no follow-up pipeline. |
| Business Usefulness | 5/10 | Real leads are now sourced. But content is for 1 of 5 lanes. Email doesn't exist. Follow-up doesn't exist. No pipeline stages. Limited revenue impact. |
| Revenue Proximity | 3/10 | No booking link in outreach. No follow-up triggers. No email. No funnel integration. Leads sit in review queue with no next step. |
| Lead Generation Readiness | 6/10 | Real Firecrawl leads are a genuine improvement. Scoring independence is broken. Null name crash prevents CRM population. |
| Content Engine Readiness | 4/10 | One content piece per day for one lane. No TikTok. No YouTube. No video-to-content pipeline running. Quality scoring absent. |
| Compliance Safety | 6/10 | Katrina gate fires correctly. Forbidden openers partially enforced. Hallucinated case study in content = compliance gap. |
| Data Organization | 4/10 | Files organized by date. But Supabase CRM doesn't fill (null name crash). No pipeline stages. No backup versions. Memory not persisted. |
| Agent Coordination | 3/10 | All "coordination" is sequential function calls in one TypeScript file. No real multi-agent routing. Hermes is a spec doc. |
| Error Handling | 4/10 | Non-fatal error catches exist. But skipped lanes not logged. Failed Supabase inserts silently swallowed. No retry backoff. |
| Security | 6/10 | API keys in `.env.local` not in code. No client-side exposure. But no key rotation policy. GitHub Actions secrets need audit. |
| Scalability | 3/10 | Monolithic script can't scale. No stage isolation. No parallel lane execution. Adding a 10th business lane would require significant refactoring. |
| Deployment Readiness | 3/10 | GitHub Actions cron runs. But 8 critical bugs mean a "successful" run produces incorrect data, missing CRM records, and undetected failures. |

**Overall: 4.6/10 — Not Deployment Ready**

---

## 4. CRITICAL FIXES BEFORE DEPLOYMENT

These 8 must be fixed before Gabriel is trusted as an operating system:

### Fix 1 — Write Memory Back (30 min)
Add to end of `main()` in `gabriel-daily-run.ts`:
```typescript
// Step 16 — Save memory to Supabase
async function step16_saveMemory(
  report: DailyReport,
  outreachDrafts: OutreachDraft[],
  top3: Array<{ rank: number; action: string; lane: string; why: string; effort: string }>,
  errors: string[]
): Promise<void> {
  console.log('\n[Step 16] Saving run memory to Supabase...');
  try {
    const pendingActions = outreachDrafts
      .filter(d => d.status === 'pending_review')
      .map(d => ({ type: 'outreach', company: d.lead_company, lane: d.lane, score: d.priority_score }));

    const carryForward = outreachDrafts
      .filter(d => d.priority_score >= 8 && d.status === 'pending_review')
      .map(d => ({ type: 'outreach_high_priority', company: d.lead_company, lane: d.lane, score: d.priority_score }));

    await supabase.from('gabriel_memory').insert({
      session_date: TODAY,
      leads_found: report.summary.leads_found,
      leads_scored: report.summary.leads_after_dedup,
      leads_queued: report.summary.leads_queued_for_review,
      outreach_drafts_created: report.summary.outreach_drafts_created,
      content_drafts_created: report.summary.content_drafts_created,
      seo_opportunities: report.summary.seo_opportunities_found,
      pending_actions: pendingActions,
      carry_forward: carryForward,
      top_3_actions: top3,
      run_errors: errors.map(e => ({ error: e, timestamp: new Date().toISOString() })),
      run_duration_ms: report.run_duration_ms,
    });
    console.log('  Memory saved to Supabase.');
  } catch (err) {
    console.log(`  Memory save failed: ${String(err).slice(0, 80)}`);
  }
}
```

### Fix 2 — Create Missing Supabase Tables (2 hrs)
See Section 10 for complete SQL. Three tables needed: `workflow_runs`, `review_tickets`, `incidents`.

### Fix 3 — Fix Null Name Supabase Crash (15 min)
In migration 003, change `leads` table:
```sql
ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS lead_type TEXT DEFAULT 'person'; -- person|organization|partner
```
In `gabriel-daily-run.ts` Step 12, skip null-name leads from `leads` table insert or use company name as fallback:
```typescript
const leadName = lead.name ?? `[${lead.company} — contact unknown]`;
```

### Fix 4 — Add Timestamp Suffix to Data Files (20 min)
```typescript
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
const leadsPath = path.join(DATA_PATH, `leads/${TODAY}-${TIMESTAMP}-leads.json`);
const outreachPath = path.join(DATA_PATH, `outreach/${TODAY}-${TIMESTAMP}-outreach-drafts.json`);
// Also maintain `latest-leads.json` symlink
```

### Fix 5 — Evidence Scanner in Content QA (45 min)
```typescript
function scanForUnsupportedClaims(draft: string): string[] {
  const flags: string[] = [];
  const unsupportedPatterns = [
    /one of our clients/i, /a client of mine/i, /case study/i,
    /results show/i, /improved their bottom line/i, /increased revenue by/i,
    /\d+%\s+(increase|improvement|growth|reduction)/i,
    /testimonial/i, /client said/i, /our customers report/i,
  ];
  for (const pattern of unsupportedPatterns) {
    if (pattern.test(draft)) {
      flags.push(`UNVERIFIED_CLAIM: matched pattern "${pattern.source}"`);
    }
  }
  return flags;
}
// Apply before adding to content queue. If flags.length > 0 → status: 'qa_failed', do not pass to review.
```

### Fix 6 — Independent Lead Scoring (1 hr)
Split Step 3 into two separate GPT calls:
- **Call A**: Extract leads from Firecrawl content (no scoring)
- **Call B**: Score each lead independently using rubric: Does the source URL actually exist? Is the company name specific (not generic)? Is the role a real decision-maker title? Is the fit_reason specific to Alfred's offer? Score 1-10.

This breaks the conflict of interest. Expect scores to drop from 8-9/10 to a more honest 4-7/10 for most leads.

### Fix 7 — Leads Saved to Supabase CRM (30 min)
Add to Step 12:
```typescript
// Save leads to Supabase CRM
const leadsToInsert = scoredLeads
  .filter(l => l.qualification_score >= config.lead_scout.min_qualification_score)
  .map(l => ({
    name: l.name ?? null,
    company: l.company,
    title: l.title ?? null,
    linkedin_url: l.linkedin_url ?? null,
    lane: l.lane,
    fit_reason: l.fit_reason,
    qualification_score: l.qualification_score,
    source: l.source,
    lead_type: (!l.name && l.company) ? 'organization' : 'person',
    status: 'new',
    found_at: new Date().toISOString(),
  }));

if (leadsToInsert.length > 0) {
  const { error } = await supabase.from('leads')
    .upsert(leadsToInsert, { onConflict: 'linkedin_url,lane', ignoreDuplicates: true });
  if (error) console.log(`  Leads CRM save warning: ${error.message}`);
  else console.log(`  Saved ${leadsToInsert.length} leads to Supabase CRM`);
}
```

### Fix 8 — Follow-Up Pipeline Foundation (2 hrs)
Add to `gabriel-daily-run.ts`:
```typescript
// Step 3.5 — Check for leads that accepted connection (Alfred marks these manually)
async function step3b_followUpQueue(): Promise<OutreachDraft[]> {
  const { data: connectedLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'connected')
    .is('follow_up_sent_at', null)
    .limit(5);

  if (!connectedLeads || connectedLeads.length === 0) return [];
  // Generate follow-up drafts for connected leads
  // ... same pattern as step4_outreachPrep but with linkedin_followup template
}
```
Add pipeline stage field. Add Telegram reminder to Alfred: "X connections pending follow-up draft."

---

## 5. IMPROVED FOLDER STRUCTURE

```
/colvin-content-os/
├── AGENTS.md                          ← System prompt (CLAUDE.md refs this)
├── CLAUDE.md                          ← @AGENTS.md
├── GABRIEL_SYSTEM_AUDIT.md            ← This file

/automation-os/
├── README.md
├── agents/
│   ├── lead-scout-agent.md
│   ├── outreach-agent.md
│   ├── genius-content-agent.md
│   ├── solomon-seo-agent.md
│   ├── hermes-planner-agent.md
│   └── qa-critic-agent.md
├── config/
│   ├── gabriel-config.json
│   ├── business-lanes.json
│   ├── platforms.json
│   ├── outreach-templates.json
│   ├── review-thresholds.json
│   ├── cron-schedule.json
│   ├── model-routing.json
│   └── forbidden-openers.json         ← NEW: single canonical list
├── data/
│   ├── leads/
│   │   └── YYYY-MM-DD-HHMM-leads.json ← timestamp suffix, no overwrites
│   ├── outreach/
│   ├── content/
│   ├── reports/
│   │   ├── daily/
│   │   └── weekly/
│   ├── review-queue/
│   ├── backups/                        ← NEW: pre-modification backups
│   └── experiments/                   ← NEW: experiment inputs/outputs
├── gabriel/
│   ├── gabriel-agent.md
│   ├── gabriel-campaign-engine.md
│   ├── gabriel-daily-orchestrator.md
│   ├── gabriel-memory.md
│   ├── gabriel-reporting.md
│   └── gabriel-review-rules.md
├── prompts/                            ← NEW: versioned prompt files
│   ├── lead-scout-v1.md
│   ├── outreach-connection-v1.md
│   ├── content-linkedin-v1.md
│   ├── lead-scoring-rubric-v1.md
│   └── PROMPT_CHANGELOG.md
├── scripts/
│   ├── gabriel-daily-run.ts            ← Main orchestrator
│   ├── gabriel-weekly-report.ts        ← NEW: weekly report script
│   ├── gabriel-health-check.ts
│   ├── lead-enrichment.ts              ← NEW: LinkedIn enrichment pass
│   └── evidence-scanner.ts            ← NEW: hallucination detection
└── skills/
    ├── campaign-planning.md
    ├── content-generation.md
    ├── email-sequencing.md
    ├── lead-scoring.md
    ├── memory-save.md
    ├── outreach-drafting.md
    ├── platform-publishing.md
    ├── reporting.md
    ├── review-queue.md
    ├── seo-optimization.md
    └── video-scripting.md

/supabase/migrations/
├── 001_content_os_schema.sql
├── 002_gabriel_automation_os.sql
└── 003_hermes_tables.sql              ← NEW: workflow_runs, review_tickets, incidents

/gabriel_research_loop/
├── master_goal.md
├── scoring_rubric.md
├── experiment_log.md
├── wins.md
├── failures.md                        ← Start populating this
└── next_experiments.md
```

---

## 6. IMPROVED AGENT ROLE MAP

### Gabriel (Central Daily Operator)
**Is:** Orchestrator of the 15-step daily sequence. Coordinates all agents. Surfaces results to Alfred.  
**Is Not:** A content assistant. Not a chatbot. Not creative director.  
**Files:** `automation-os/scripts/gabriel-daily-run.ts` (the ONLY running code today)  
**Improvement needed:** Currently a monolith. Phase 2: break into stage functions callable independently.

### Hermes (SRE Supervisor — SPEC ONLY, NOT YET RUNNING)
**Is:** Intended workflow orchestrator, circuit breaker manager, incident creator, stage replayer.  
**Is Not:** Running. Every Hermes doc is a specification, not code.  
**Status:** PLANNED — Mark all Hermes docs with `STATUS: SPEC (not yet implemented)` header.  
**Build order:** Implement after the 8 critical fixes. Start with `workflow_runs` table writes, then add retry logic, then circuit breakers.

### Lead Scout
**Is:** Firecrawl web search → GPT extraction → qualified lead profiles  
**Gap:** Scoring is not independent. Null-name leads misclassified. No LinkedIn enrichment pass.  
**Fix:** Two-call architecture (extract, then independently score).

### Outreach Agent (DRAFT ONLY)
**Is:** Writes LinkedIn connection requests + follow-ups from lead context  
**Gap:** No follow-up trigger. Forbidden openers list incomplete. No QA pass before queue.  
**Fix:** Add QA scan for forbidden patterns. Add follow-up drafts for `status: 'connected'` leads.

### Genius (Content Agent)
**Is:** LinkedIn post drafting for one lane per day  
**Gap:** Only targets `active_lanes[0]`. No quality score. Hallucination risk in case studies. No TikTok/YouTube.  
**Fix:** Lane rotation. Evidence scanner. Quality score. Platform-specific content types.

### Solomon (SEO Agent)
**Is:** GPT generates SEO "opportunities" with no real data  
**Gap:** Entirely hallucination-based. No keyword research tool access. No competitor data.  
**Fix:** Replace Step 6 with Firecrawl search of real competitor pages. Label outputs as `hypothesis` until verified.

### QA Critic (Always-On Quality Gate)
**Is:** Defined in spec. Should run before every output hits review queue.  
**Gap:** NOT RUNNING. No QA call exists in Step 4 or Step 5. Hallucinated content passes unchecked.  
**Fix:** Add QA scan calls in Steps 4 and 5. Minimum: evidence scanner + forbidden opener scan + character limit check.

### Katrina Gate (Governance)
**Is:** Auto-triggered on first_keys_indy, funding_ready_indiana, girls_got_game lanes and keywords  
**Working:** Yes — `katrina_review_required: true` fires correctly  
**Gap:** The flag is set but there's no separate notification to Katrina. Alfred just sees a ⚠️ in his brief. Katrina isn't in the loop directly.  
**Fix:** Add separate Telegram message to Katrina's chat ID when `katrina_review_required: true`. Add `KATRINA_TELEGRAM_CHAT_ID` to env.

---

## 7. IMPROVED OPERATING LOOP

### Daily Loop (7:00 AM CST — GitHub Actions)

```
PRE-FLIGHT (Steps 0a–0c):
  0a. Health check: OpenAI, Firecrawl, Supabase, Telegram all reachable
  0b. Load config + verify env vars
  0c. Load memory from Supabase (yesterday's pending, carry-forward, errors)

INTELLIGENCE PHASE (Steps 3–7):
  3.  Lead Scout (Firecrawl web search → GPT extraction) [per active lane]
  3b. Follow-up queue check (connected leads awaiting follow-up)
  4.  QA scan all leads (independent scoring, null name handling, org classification)
  5.  Outreach Agent (draft connection requests for score ≥ 7 person leads)
  5b. Follow-up Agent (draft follow-up messages for connected leads)
  6.  Content Agent (rotating lane, evidence scanner, quality score)
  7.  SEO Intelligence (Firecrawl competitor research, NOT GPT hallucination)
  8.  Marketing Recs (data-driven: based on pipeline velocity, not GPT imagination)

PROCESSING PHASE (Steps 9–11):
  9.  Dedup against Supabase CRM (by linkedin_url + lane, 30-day window)
  10. Score leads independently (separate GPT call with rubric)
  11. Categorize: outreach queue / partnership queue / content queue / seo queue

REVIEW PACKAGE PHASE (Steps 12–13):
  12. Evidence scan all content (block hallucinated claims)
  13. Compliance check (Katrina gate, forbidden claims, platform rules)
  14. Build review package (ranked by score, separated by queue type)

SAVE PHASE (Steps 15–16):
  15. Save all outputs (timestamped files, Supabase CRM, outreach_drafts)
  16. Generate daily report (include skipped lanes, errors, pipeline stats)
  17. Save memory to Supabase gabriel_memory (write back)

DELIVERY PHASE (Step 18):
  18. Telegram brief to Alfred (leads, drafts, top 3 actions, ⚠️ flags)
  18b. Separate Telegram to Katrina if any Katrina-gate items exist
```

### Weekly Loop (Friday 8:00 AM CST)
```
1. Aggregate daily reports from the week
2. Calculate pipeline velocity: leads found vs last week
3. Count review queue completions (Alfred's approval rate)
4. Identify best-performing content type (if engagement data available)
5. List top 3 gaps that blocked revenue this week
6. Generate experiment recommendations (from gabriel_research_loop/)
7. Save weekly report to Supabase + data/reports/weekly/
8. Send comprehensive Telegram brief to Alfred
```

### Monthly Loop (1st of month)
```
1. Aggregate weekly reports from the month
2. Score each lane on 7-dimension rubric
3. Identify lowest-scoring lane → next improvement experiment
4. Review prompt versions — flag prompts with >2 weeks without experiment
5. Review Supabase CRM health: total leads, pipeline distribution
6. Produce monthly strategy brief for Alfred
```

---

## 8. IMPROVED SCORING RUBRIC

**7 Dimensions — scored 1–10, final = sum/7**

| Dimension | 1–3 (Failing) | 4–6 (Weak) | 7–8 (Good) | 9–10 (Excellent) |
|---|---|---|---|---|
| **Clarity** | Cannot understand purpose | Clear if you know context | Self-explanatory | Anyone can act on it immediately |
| **Specificity** | Generic / no details | Some specifics | Named people, companies, or data | Hyper-local, named source, specific fact |
| **Conversion Strength** | No CTA or wrong CTA | Weak CTA | Clear CTA with benefit | Specific CTA + urgency + easy next step |
| **Evidence Quality** | Hallucinated / no source | GPT inference | Plausible, labeled as hypothesis | Real source URL, verifiable fact |
| **Brand Fit** | Wrong voice entirely | Mixed signals | Mostly Alfred's voice | Unmistakably Alfred — professional, warm, faith-rooted |
| **Execution Readiness** | Cannot be used | Needs major rework | Minor revisions needed | Copy/send as-is |
| **Risk/Compliance** | Violates compliance rule | Borderline | Clean with minor caution | Fully compliant with no flags |

**Auto-penalties:**
- Contains unverified case study or fake testimonial → Evidence Quality capped at 3
- Violates forbidden opener rule → Execution Readiness capped at 4
- Contains "guarantee", "will qualify", "approved" → Risk/Compliance capped at 2
- Missing CTA in content post → Conversion Strength capped at 4
- Score < 5.0 overall → REJECT (do not pass to review queue)
- Score 5.0–6.9 → REVISE (regenerate once with feedback)
- Score 7.0–8.4 → PASS (add to review queue with score shown)
- Score 8.5+ → PASS + HIGH PRIORITY flag

---

## 9. QUALITY GATES

Every asset must pass ALL 10 gates before reaching Alfred's review queue:

| Gate | Check | Fail Action |
|---|---|---|
| **Purpose Gate** | Asset has stated business purpose, lane, and goal | Regenerate with lane context |
| **Audience Gate** | Asset names or implies correct audience | Add audience context and regenerate |
| **Offer Gate** | Asset has clear CTA or next action | Regenerate — no CTA = automatic fail |
| **Evidence Gate** | All claims are sourced, inferred with label, or hypothetical | Block if unverified case study or fake stat detected |
| **Platform Gate** | Asset fits platform format (char count, hashtag count, content type) | Trim/reformat or flag |
| **Risk Gate** | No compliance violations, forbidden claims, privacy issues | Block — log violation |
| **Opener Gate** | No forbidden opener patterns | Regenerate once |
| **Hallucination Gate** | No invented clients, results, testimonials, or people | Block — log — do not regenerate |
| **Scoring Gate** | Asset score ≥ 7.0 on rubric | REVISE if 5–7. REJECT if < 5. |
| **Logging Gate** | Asset creation is logged with timestamp, version, lane | Block until logged |

**Status labels (mandatory on every asset):**
- `READY_FOR_ALFRED` — Passed all gates, queued
- `NEEDS_KATRINA_REVIEW` — Katrina gate triggered
- `REVISE` — Failed 1-2 gates, regenerating
- `QA_FAILED` — Failed Evidence or Hallucination gate — do not reuse
- `REJECTED` — Score < 5.0 — archived

---

## 10. ERROR HANDLING RULES

Every step in the daily run must handle failures with this protocol:

```typescript
interface StepResult<T> {
  success: boolean;
  data: T | null;
  error?: string;
  skipped_reason?: string;
  duration_ms: number;
  retry_count: number;
}

// Template for every step:
async function runStep<T>(
  stepName: string,
  stepFn: () => Promise<T>,
  fallback: T
): Promise<StepResult<T>> {
  const start = Date.now();
  let retryCount = 0;
  const MAX_RETRIES = 2;

  while (retryCount <= MAX_RETRIES) {
    try {
      const data = await stepFn();
      return { success: true, data, duration_ms: Date.now() - start, retry_count: retryCount };
    } catch (err) {
      retryCount++;
      if (retryCount > MAX_RETRIES) {
        const error = String(err).slice(0, 200);
        console.log(`  [${stepName}] FAILED after ${MAX_RETRIES} retries: ${error}`);
        // Log to errors array for report
        // Send Telegram error alert if P1 step (1, 2, 15, 16)
        return { success: false, data: fallback, error, duration_ms: Date.now() - start, retry_count: retryCount };
      }
      await new Promise(r => setTimeout(r, 1000 * retryCount)); // backoff
    }
  }
  return { success: false, data: fallback, error: 'Unknown', duration_ms: Date.now() - start, retry_count: retryCount };
}
```

**P1 Steps (Gabriel must alert Alfred if these fail):** Step 1 (config), Step 3 (all leads return 0), Step 15 (Supabase save fails), Step 16 (memory save fails), Step 18 (Telegram fails).

**P2 Steps (logged, non-fatal):** Steps 5, 6, 7, 8, 14.

**Failed run recovery:**
1. Write `status: 'failed'` to `gabriel_memory` with error details
2. Telegram alert: "GABRIEL FAILED — Step N — [error]. Review logs."
3. Do NOT mark the run as successful
4. Do NOT retry automatically — require Alfred to trigger manual re-run

---

## 11. BACKUP AND ROLLBACK RULES

### Before Modifying System Files
```typescript
async function backupFile(filePath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const ext = path.extname(filePath);
  const base = filePath.replace(ext, '');
  const backupPath = `${base}_${timestamp}_backup${ext}`;
  fs.copyFileSync(filePath, backupPath);
  console.log(`  Backup created: ${backupPath}`);
  return backupPath;
}
```

### Before Every Experiment
1. Backup the file being modified: `backupFile('path/to/file')` 
2. Log the backup path in `experiment_log.md`
3. If the experiment is REJECTED: `fs.copyFileSync(backupPath, originalPath)` — restore

### Files That Can Never Be Overwritten Without Backup
- `automation-os/scripts/gabriel-daily-run.ts`
- `automation-os/config/gabriel-config.json`
- `automation-os/config/business-lanes.json`
- `AGENTS.md`
- Any Supabase migration file
- Any file in `data/leads/` or `data/outreach/`

### Data Retention Policy
- Daily data files: keep 30 days rolling
- Weekly reports: keep 52 weeks
- Experiment logs: permanent
- Backup files: keep 14 days, then delete

---

## 12. HUMAN REVIEW RULES

### Alfred Review Required (always)
- All LinkedIn connection requests before sending
- All LinkedIn follow-up messages before sending
- All email drafts before sending
- All social media post drafts before publishing
- All video scripts before recording/rendering
- All SEO page copy before publishing to website
- All campaign strategies before activation
- Top 3 actions (Alfred validates, does not auto-execute)

### Katrina Review Required (additional gate)
Triggered automatically when:
- Lane is `first_keys_indy`, `funding_ready_indiana`, or `girls_got_game`
- Keywords: `guarantee`, `grant`, `nonprofit`, `government`, `church`, `donor`, `legal`, `minor`, `youth`, `HUD`, `RESPA`, `approved`, `qualify`
- Content references funding amounts, application deadlines, or eligibility criteria

**Katrina review workflow:**
1. Separate Telegram message to `KATRINA_TELEGRAM_CHAT_ID` (needs env var)
2. Include: asset type, lane, draft preview, compliance flags
3. Status stays `needs_katrina_review` — Alfred cannot approve until Katrina clears it
4. Timeout: 48 hours → escalate to both Alfred and Katrina

### No Review Required
- Internal reports (daily JSON, weekly JSON)
- Lead scores (internal ranking only)
- Dedup results
- Memory saves
- Telegram brief to Alfred (Alfred is the recipient)

---

## 13. LEAD MANAGEMENT RULES

### Lead Types
```
person         — Named individual with role (standard outreach pipeline)
organization   — Company/agency with no named contact (partnership queue)
referral_source — Government agency, nonprofit, industry body (referral pipeline, not outreach)
```

### Lead Pipeline Stages
```
new            → Lead found, not yet reviewed
review_queued  → In Alfred's review queue
approved       → Alfred approved for outreach
connection_sent → Alfred sent LinkedIn request
connected      → Connection accepted (Alfred marks manually)
follow_up_sent → Follow-up message sent
replied        → Lead responded
meeting_booked → Meeting scheduled
closed_won     → Became a client
closed_lost    → Not a fit / declined
archived       → Stale or no longer relevant
```

### Lead Scoring Rubric (Independent Scoring — 2nd GPT call)
Score 1–10 on each:
- **Source Credibility**: Is the source URL a real, specific organization? (not a generic directory listing)
- **Contact Specificity**: Is there a named person with a real role? (null name = max 5)
- **Decision-Maker Fit**: Is the role a decision-maker for Alfred's offer?
- **Geography Match**: Is the company in Indianapolis / Indiana (for local lanes)?
- **Offer Alignment**: How specifically does this company match Alfred's offer for this lane?

Final score = average of 5 dimensions. Threshold for outreach queue: ≥ 6.0.

### Deduplication Rules
- Dedup window: 30 days (configurable)
- Key: `(linkedin_url + lane)` or `(company + title + lane)` if no URL
- Null linkedin_url leads: deduplicate by `company + lane` (same company never appears twice per lane per run)
- After contact: reset dedup window to 60 days for that lead

### Data That Cannot Be Stored
- Full legal names of minors
- Social security numbers or financial account data
- Email addresses scraped without explicit opt-in
- Phone numbers from scraped sources

---

## 14. CONTENT DEPLOYMENT RULES

### LinkedIn (Active — manual publish)
- Character limit: 1300 chars for optimal mobile display (system allows 3000)
- Hashtags: 3-5 max (system allows 5 ✓)
- Forbidden: fake case studies, guaranteed results, unsourced statistics
- Hook: first line must not start with "I", "We", or emoji
- CTA: last line must include one clear action
- Quality score ≥ 7.0 required before review queue

### TikTok (Disabled — OAuth incomplete)
- Status: BLOCKED until OAuth is completed
- Do not generate TikTok scripts that will not be used
- When enabled: 15–60 second video scripts only, vertical format

### YouTube Shorts (Disabled — OAuth incomplete)
- Status: BLOCKED until OAuth is completed
- Use `render:json` to produce video files — upload manually until OAuth complete

### Facebook (Active — manual publish via Meta Business Suite)
- Different brand voice from LinkedIn: warmer, more community-focused
- First Keys Indy Facebook: add disclaimer on every homebuyer post

### Email (BLOCKED — no platform selected)
- Status: BLOCKED until email provider is selected and integrated
- Draft queue exists in Supabase `content_queue` but cannot be sent
- **Recommended immediate action:** Select Resend (free tier, TypeScript SDK, Next.js native)

### SMS (NOT BUILT)
- Do not generate SMS content until TCPA compliance rules are documented and a platform is selected
- Minimum requirements before SMS is built: opt-in mechanism, STOP instruction, carrier compliance

---

## 15. COMPLIANCE AND RISK RULES

### Universal Rules (All Lanes)
- Never invent statistics, percentages, or business results
- Never quote a "client" or "customer" without a real, verifiable source
- Never guarantee outcomes (revenue, leads, rankings, approvals)
- Never use testimonials that weren't given by a real person
- All content claims must be labeled: `[verified]`, `[hypothesis]`, `[assumed]`, or `[source: URL]`

### First Keys Indy — HIGH RISK
- Always: "may qualify" — never "will qualify"
- Always: recommend a HUD-approved lender
- Always: include "This is not financial advice" on public content
- Never: promise specific dollar amounts for DPA
- Never: speak on behalf of IHCDA, INHP, or any government agency
- Katrina review required: 100% of public content

### FundingReady Indiana — HIGH RISK
- Never guarantee grant approval
- Always include: "Grant availability and eligibility vary. Consult a licensed advisor."
- Never speak on behalf of SBA, IEDC, or any government agency
- Katrina review required: 100% of public content

### Girls Got Game — HIGH RISK (INACTIVE — rules for when activated)
- No PII for minors (no names, photos, or identifying details of anyone under 18)
- All outreach to adults only (coaches, administrators, parents)
- Nonprofit tone — never commercial-sounding
- Katrina review required: 100% of ALL content

### Colvin Enterprises — LOW RISK
- No exaggerated ROI claims ("40% time savings on average" requires sourcing if stated as fact)
- "AI employee" is a metaphor — never claim Gabriel is a literal employee
- No guarantees: "most clients see improvement" not "you will see X%"

### Indiana Backflow — LOW RISK
- All tester licensing claims must reference public Indiana state records
- No legal advice ("you're required to test" → "annual testing is typically required — check with your county")

---

## 16. DAILY RUN PROTOCOL (corrected)

```
7:00 AM CST — GitHub Actions triggers gabriel-daily-run.ts

STEP 0: Health Check
  - Ping OpenAI, Firecrawl, Supabase, Telegram
  - If any critical service is down: skip dependent steps, alert Alfred
  - Log health status

STEP 1: Load Config
  - Parse gabriel-config.json
  - Verify all required env vars
  - Fatal if config missing

STEP 2: Load Memory
  - Read yesterday's gabriel_memory from Supabase
  - Extract: pending_actions (show Alfred what's still waiting), carry_forward (high-priority items), run_errors

STEP 3: Lead Scout (per active lane)
  - Firecrawl search with lane-specific query (rotated daily)
  - GPT extracts lead profiles from real scraped content
  - NEVER generate fictional leads
  - Tag source: firecrawl_web:{url}
  - Add found_at timestamp

STEP 3b: Follow-Up Queue
  - Query Supabase: leads with status='connected' and no follow_up_sent
  - Draft follow-up messages for these leads
  - Add to outreach queue with type='linkedin_followup'

STEP 4: Independent Lead Scoring
  - Separate GPT call with scoring rubric
  - Score on 5 dimensions (source credibility, contact specificity, decision-maker fit, geography, offer alignment)
  - Classify lead_type: person | organization | referral_source
  - Filter: score < 6 → archived, score ≥ 6 → active queue

STEP 5: Deduplication
  - Check Supabase leads table by (linkedin_url + lane) or (company + lane)
  - 30-day contact window
  - Log duplicates removed

STEP 6: Outreach Drafts (person leads only, score ≥ 7)
  - LinkedIn connection request (max 300 chars)
  - QA scan: forbidden openers, compliance flags
  - Score ≥ 7: add to outreach_queue
  - Score 5–6: save as draft, don't queue
  - Organizations → partnership_queue (different template)

STEP 7: Content Draft (rotating lane)
  - Generate for today's target lane (rotate by day of week)
  - Evidence scanner: block hallucinated case studies
  - Quality score (hook, voice, CTA, factual safety)
  - Score ≥ 7: review queue
  - Score < 7: regenerate once → if still < 7: archive

STEP 8: SEO Intelligence (Firecrawl-powered, not hallucination)
  - Search competitor pages for target lane
  - Extract real keyword gaps, ranking opportunities
  - Label: [data-sourced] not [hypothesis]

STEP 9: Marketing Recs (data-driven)
  - Based on: pipeline velocity this week, which lane has most pending leads, content engagement (if available)
  - NOT GPT imagination

STEP 10: Compliance Check
  - Run Katrina gate keywords across all outputs
  - Flag and separate Katrina-required items
  - Block any output with severity:critical compliance flag

STEP 11: Categorize + Build Review Package
  - Outreach queue (person leads, score ≥ 7)
  - Partnership queue (organization leads)
  - Content queue (scored content drafts)
  - SEO queue (real opportunities)
  - Rank by priority score within each queue

STEP 12: Save Outputs
  - Write timestamped data files (no overwrite)
  - Save leads to Supabase CRM (upsert with idempotency)
  - Save outreach drafts to Supabase
  - Save content drafts to Supabase

STEP 13: Generate Report
  - Include: pipeline stats, skipped lanes, error log, step durations
  - Calculate: leads per lane, content per lane, queue sizes

STEP 14: Top 3 Actions
  - Data-driven, not GPT-imagined
  - Priority: (1) Katrina-gate items, (2) high-score outreach, (3) high-score content, (4) SEO quick wins

STEP 15: Telegram Brief
  - Condensed summary
  - ⚠️ Flags visible
  - Skipped lanes named
  - Separate message to Katrina if needed

STEP 16: Save Memory
  - Write new gabriel_memory record to Supabase
  - Include: stats, pending_actions, carry_forward, errors

COMPLETION: Log total run time
```

---

## 17. WEEKLY OPTIMIZATION PROTOCOL

*Script to be built: `scripts/gabriel-weekly-report.ts`*

```
Every Friday at 8:00 AM CST:

1. Aggregate all daily reports from Mon–Thu
2. Calculate:
   - Total leads found per lane (vs last week)
   - Review queue completion rate (items Alfred actioned / items created)
   - Content pieces created vs published
   - Pipeline stage distribution (new/contacted/connected/replied/closed)
3. Score each active lane on 7-dimension rubric
4. Identify: weakest lane, strongest lane
5. Pull next experiment from gabriel_research_loop/next_experiments.md
6. Generate weekly brief:
   - Wins this week
   - Gaps this week
   - Recommended focus for next week
   - Next experiment to run
7. Save: data/reports/weekly/YYYY-WW-weekly-report.json
8. Telegram to Alfred: concise weekly brief
```

---

## 18. MONTHLY STRATEGY PROTOCOL

*Manual — Alfred + Gabriel on the 1st of each month*

```
1. Review all 4 weekly reports from the month
2. Score all 9 business lanes:
   - active lanes: full 7-dimension score
   - paused lanes: 2-question check (is timing right to reactivate?)
3. Run one experiment per lane on lowest-scoring dimension
4. Review Supabase CRM:
   - Total leads in pipeline
   - Conversion rate by lane
   - Average days lead-to-reply
5. Budget review: API costs (OpenAI, Firecrawl, Supabase, Telegram, GitHub Actions)
6. Prompt version review: flag prompts not updated in 60+ days
7. Produce: 30-day priority plan per lane
8. Save to: gabriel_research_loop/ + Obsidian vault
```

---

## 19. DEPLOYMENT CHECKLIST

### Infrastructure (must all pass)
- [ ] FIRECRAWL_API_KEY set in .env.local AND GitHub Actions secrets
- [ ] OPENAI_API_KEY set and billing active
- [ ] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set
- [ ] TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID set and verified
- [ ] KATRINA_TELEGRAM_CHAT_ID set (for Katrina gate notifications)
- [ ] GitHub Actions workflow (`gabriel-daily.yml`) runs without error
- [ ] All 3 Supabase migrations applied (001, 002, 003)
- [ ] Verify: `gabriel_memory`, `leads`, `outreach_drafts`, `content_queue`, `workflow_runs`, `review_tickets`, `incidents` tables exist

### Code (must all pass)
- [ ] Memory is written back at end of run (Step 16 exists)
- [ ] Leads are saved to Supabase CRM in Step 12
- [ ] Content draft evidence scanner runs before review queue
- [ ] Lead scoring is independent of lead extraction (two separate GPT calls)
- [ ] Data files use timestamp suffix (no overwrites)
- [ ] `skipped_lanes` logged in report
- [ ] `forbidden-openers.json` loaded into outreach prompts
- [ ] `found_at` field on all lead records

### Business Logic (must all pass)
- [ ] First Keys Indy content: "may qualify" language confirmed
- [ ] Funding Ready content: no grant guarantees confirmed
- [ ] Girls Got Game: no minor PII, adults-only outreach confirmed
- [ ] Colvin Enterprises: no ROI guarantees in outreach
- [ ] Content evidence scanner catches hallucinated case studies
- [ ] Katrina gate fires and sends separate Telegram to Katrina

### Operational (must all pass)
- [ ] Alfred has reviewed the review queue format and can use it
- [ ] Alfred knows how to mark leads as `connected` in Supabase
- [ ] Alfred knows how to approve/reject from Telegram or dashboard
- [ ] Watchdog cron exists: alerts if no morning brief received by 9 AM
- [ ] Backup utility implemented for system file modifications
- [ ] Weekly report script exists and is wired to Friday cron

### "Do Not Deploy" Conditions
- **Block deploy if:** Any content draft with hallucinated case study would reach review queue without evidence flag
- **Block deploy if:** Leads table still has `name NOT NULL` constraint
- **Block deploy if:** Memory is not written back (Gabriel will forget every run)
- **Block deploy if:** Supabase lead inserts fail silently (test: insert a null-name lead and verify it doesn't crash)

---

## 20. RED TEAM SIMULATION — 15 FAILURES

### Failure 1: Missing lead file
**What happens:** Firecrawl API is down. Step 3 catches the error, returns `[]`. Step 4 runs with 0 leads. Step 5 creates 0 content. Report says "0 leads found." Brief says "0 leads." Alfred thinks it was a bad day.
**Weak rule:** Error is caught but labeled generic "Step 3: Error." Not differentiated from "Firecrawl down" vs "0 real leads found."
**New rule:** Log the specific cause. If Firecrawl returned HTTP error → alert in Telegram: "⚠️ Firecrawl API unavailable — no leads sourced. Manual check: api.firecrawl.dev"

### Failure 2: Duplicate leads
**What happens:** Null linkedin_url leads (IHCDA, INHP) bypass dedup every day. Step 8 dedup checks `recentlyContacted.has(l.linkedin_url)` — null url = always `false` = always included. Same organizations found every day, always queued for outreach, never removed.
**Weak rule:** Dedup only checks linkedin_url. Null urls pass through infinitely.
**New rule:** Dedup also checks `company + lane` pair. Organizations without URLs: deduplicate by `company + lane`, 30-day window. Same company never appears twice per lane per run.

### Failure 3: Bad outreach script
**What happens:** Outreach draft says "your insights on down payment assistance are vital" — this is addressed to IHCDA (a government agency), not a person. Alfred sees this in his review queue. If he accidentally approves and sends to a government agency contact, the message is inappropriate and awkward.
**Weak rule:** Outreach agent doesn't distinguish between person leads and organization leads. Same template is used for both.
**New rule:** Organizations without a named contact go to `partnership_queue` with a partner-specific message template: "I saw your work on [program]. I run [First Keys Indy / FundingReady Indiana]. Would love to explore a referral relationship." Different queue, different approval path.

### Failure 4: Hallucinated claim
**What happens:** Today's content draft contains: "Consider the story of one of our clients who redirected their focus from purely financial metrics to a purpose-driven model. By prioritizing ethical sourcing and community engagement, they not only improved their bottom line but also strengthened their brand's reputation." Alfred publishes this. It's a fabricated client story. Alfred has never had a client who "prioritized ethical sourcing." This is a false claim.
**Weak rule:** No evidence scanner exists in the content generation step. QA Critic is defined in spec but not called in Step 5.
**New rule:** Evidence scanner is mandatory before any content draft reaches review queue. Pattern `"one of our clients"` → `QA_FAILED: unverified case study`. Regenerate once without the case study. If regeneration still contains fabricated claims → archive, alert Alfred: "Content draft archived — hallucination detected."

### Failure 5: Weak social post
**What happens:** LinkedIn post opens with "🌟 Are you operating from a place of purpose or simply chasing profits? 🌟" — double emoji, cliché hook, sounds like every generic LinkedIn coach. This is not Alfred's voice. No hook quality check exists.
**Weak rule:** Content is generated and sent to review queue with no quality scoring. Alfred has no signal that this post is weak.
**New rule:** Every content draft receives a hook score (1-10) from a separate GPT call before review queue. Hook score < 6 → regenerate. Show hook score in review package so Alfred can see why something passed or failed.

### Failure 6: Wrong platform format
**What happens:** Content draft is 1275 characters. LinkedIn mobile truncates at roughly 210 characters before "see more." The hook + first 2 sentences must fit in that window. No check for mobile truncation exists. The "see more" breaks at "In today's rapidly evolving business landscape" — which is not a scroll-stopping line.
**Weak rule:** Platform gate only checks total character count, not mobile truncation behavior.
**New rule:** Content agent must generate posts with a strong first 210 characters (the visible preview). Check: does the first 210 chars compel a "see more" click? Add this to the hook quality score.

### Failure 7: Automation did not run
**What happens:** GitHub Actions secret `OPENAI_API_KEY` expires (or billing lapses). The workflow fails immediately at Step 1 config check. No Telegram alert is sent because the Telegram step also fails if OpenAI isn't responding (Steps 1 is fatal). Alfred gets no brief. He assumes Gabriel ran fine.
**Weak rule:** Fatal failure in Step 1 calls `sendTelegram()` which also uses the same broken environment. If the environment is broken, both fail.
**New rule:** Add a Vercel watchdog endpoint: `/api/gabriel-watchdog`. Cron runs at 9 AM CST. Checks Supabase: did `gabriel_memory` get a new record today? If not → send Telegram via a DIFFERENT bot (or the same one using a working API key stored separately). Alert: "GABRIEL DID NOT RUN TODAY."

### Failure 8: Agent overwrote a good file
**What happens:** I ran `npm run gabriel:daily` manually today (for the Firecrawl experiment) AND GitHub Actions runs at 7 AM CST. Both runs on the same day write to `2026-05-24-leads.json`. The second run's data overwrites the first. If the first run had 11 good leads and the second run has 0 (due to Firecrawl being down), Alfred's leads file shows 0 leads. The data is gone.
**Weak rule:** Files named `YYYY-MM-DD-leads.json` with no protection against same-day re-runs.
**New rule:** Files named `YYYY-MM-DD-HHMMSS-leads.json`. Symlink `latest-leads.json` → most recent. Never overwrite existing files.

### Failure 9: Sub-agent ignored instructions
**What happens:** The outreach prompt forbids generic openers. Today's draft for IHCDA says: "As the Homeownership Programs Director at IHCDA, your insights on down payment assistance are vital for empowering first-time homebuyers in Indianapolis. Let's connect..." — the opener is still somewhat generic, and "vital for empowering" is vague praise. The forbidden opener scan doesn't catch this because none of the patterns match exactly.
**Weak rule:** Forbidden opener list is a simple string match. GPT finds workarounds ("vital", "commendable", "inspiring and pivotal").
**New rule:** Add a second QA pass that evaluates opener quality with GPT: "Does this message open with a specific observation or does it use vague praise? Score 1-10 for specificity. Must be ≥ 7 to pass." This catches paraphrased forbidden patterns.

### Failure 10: Content created for wrong business
**What happens:** Today's content is for `colvin_enterprises` (active_lanes[0]). If Alfred reorders the `active_lanes` array in config to prioritize `first_keys_indy`, the next run generates First Keys content — including housing assistance content — without the Katrina gate triggering, because Step 5 doesn't check the Katrina gate for content (it's only checked in Step 4 outreach).
**Weak rule:** Content generation doesn't apply Katrina gate. Only outreach drafts check `katrina_review_required`.
**New rule:** Apply Katrina gate to content drafts as well. If target lane is `first_keys_indy`, `funding_ready_indiana`, or `girls_got_game` → mark `katrina_review_required: true` on content draft.

### Failure 11: Financial claim without support
**What happens:** Colvin Enterprises outreach template says "cut their manual work by about 40% in most cases" (in `outreach-templates.json`). This number appears in the DEFAULT_VIDEO_SCRIPT ("40% Average time saved in the first 30 days"). If this enters an outreach message without sourcing, it is an unsupported financial performance claim. No client has been verified to save 40%.
**Weak rule:** The "40%" stat lives in outreach templates without any source citation or "results vary" qualifier.
**New rule:** Remove the "40%" claim from templates.json and DEFAULT_VIDEO_SCRIPT until it is supported by a real client case study. Replace with: "Many clients report significant time savings — your mileage will vary." Add a `[unverified]` label to all statistics until sourced.

### Failure 12: Grant promise overstates results
**What happens:** FundingReady Indiana Firecrawl search returned 0 results today. But when it does return results, the GPT prompt for outreach says: "Help Indiana small businesses find and apply for grants." If the outreach draft says "I help businesses find grants they qualify for" — this is technically a promise of grant eligibility determination, which may require licensing depending on the state.
**Weak rule:** FundingReady compliance rule says "no guarantee of funding approval" but doesn't address whether grant consulting itself requires a license in Indiana.
**New rule:** Add to FundingReady compliance: "Do not imply Alfred provides licensed grant consulting, funding advisory, or financial planning services. Use: 'I help businesses identify grant opportunities.' Not: 'I help businesses qualify for grants.'"

### Failure 13: SMS compliance language missing
**What happens:** SMS is listed in the system vision but not built. If someone connects an SMS platform and generates messages without TCPA requirements, every SMS could be a legal violation ($500–$1500 per message in TCPA suits).
**Weak rule:** `platforms.json` has no SMS section. No compliance rules exist.
**New rule:** Add to `platforms.json` BEFORE any SMS integration:
```json
"sms": {
  "enabled": false,
  "blocked_until": ["TCPA_compliance_documented", "opt_in_mechanism_built", "STOP_keyword_configured"],
  "required_footer": "Reply STOP to opt out.",
  "no_cold_outreach": true,
  "opt_in_required": true
}
```

### Failure 14: No backup before edit
**What happens:** I rewrote Step 3 of `gabriel-daily-run.ts` today (the Firecrawl upgrade). There was no automatic backup before the modification. If the new code had a critical bug, the only recovery is `git checkout` — which works in development but could lose uncommitted changes if the file was modified mid-session.
**Weak rule:** No backup utility exists. The spec says to backup but there's no code to enforce it.
**New rule:** Any time Gabriel (or Claude Code) modifies a system file, call `backupFile()` first. Add to `main()`: at start of run, backup `gabriel-daily-run.ts` and `gabriel-config.json` to `automation-os/data/backups/`.

### Failure 15: Daily report says success when workflow failed
**What happens:** Today's report shows `skipped_steps: []` and `errors: []`. But `funding_ready_indiana` lane was silently skipped (0 Firecrawl results). The Telegram brief said "Total real leads found: 11" without mentioning that one of five active lanes produced nothing. Alfred thinks all lanes ran. They didn't.
**Weak rule:** `skipped_steps` array is defined but never populated. Skipped lanes are only logged to console, not to the report.
**New rule:** Every skipped lane must appear in the report:
```json
{
  "skipped_lanes": [
    {
      "lane": "funding_ready_indiana",
      "reason": "Firecrawl returned 0 results",
      "query_used": "Indianapolis small business owner grant funding opportunity Indiana",
      "recommendation": "Try alternate query or check Firecrawl status"
    }
  ]
}
```
Include in Telegram brief: "⚠️ funding_ready_indiana: no leads found today."

---

## 21. MISSING SUPABASE TABLES — Migration 003

```sql
-- 003_hermes_tables.sql
-- Run after 002_gabriel_automation_os.sql

-- ── Workflow Runs ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workflow_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL,
  workflow_name TEXT NOT NULL,
  lane TEXT,
  current_stage TEXT,
  status TEXT DEFAULT 'running', -- running|completed|failed|replaying|blocked
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  stage_outputs JSONB DEFAULT '{}',
  error_metadata JSONB DEFAULT '{}',
  retry_count INTEGER DEFAULT 0,
  trace_id UUID
);
CREATE INDEX IF NOT EXISTS workflow_runs_run_id_idx ON workflow_runs(run_id);
CREATE INDEX IF NOT EXISTS workflow_runs_status_idx ON workflow_runs(status);

-- ── Review Tickets ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_type TEXT NOT NULL, -- outreach|content|seo|partnership|video
  asset_id UUID,
  lane TEXT NOT NULL,
  priority_score INTEGER DEFAULT 0,
  subject TEXT,
  draft TEXT,
  context TEXT,
  compliance_flags JSONB DEFAULT '[]',
  katrina_review_required BOOLEAN DEFAULT false,
  katrina_cleared_at TIMESTAMP WITH TIME ZONE,
  alfred_decision TEXT, -- approved|revised|rejected
  alfred_feedback TEXT,
  status TEXT DEFAULT 'pending', -- pending|approved|revised|rejected|archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  timeout_at TIMESTAMP WITH TIME ZONE
);
CREATE INDEX IF NOT EXISTS review_tickets_status_idx ON review_tickets(status);
CREATE INDEX IF NOT EXISTS review_tickets_lane_idx ON review_tickets(lane);

-- ── Incidents ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  severity TEXT NOT NULL, -- P1|P2|P3|P4
  title TEXT NOT NULL,
  description TEXT,
  affected_lane TEXT,
  affected_workflow TEXT,
  status TEXT DEFAULT 'open', -- open|investigating|resolved|closed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT,
  run_id UUID REFERENCES workflow_runs(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS incidents_severity_idx ON incidents(severity);
CREATE INDEX IF NOT EXISTS incidents_status_idx ON incidents(status);

-- RLS
ALTER TABLE workflow_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON workflow_runs FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON review_tickets FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON incidents FOR ALL USING (auth.role() = 'service_role');
```

---

## 22. FINAL DEPLOYMENT-READY GABRIEL MASTER PROMPT

```
# GABRIEL — AUTONOMOUS BUSINESS OPERATING SYSTEM
# Version: 2.0 — Post-Audit Hardened
# Status: DEPLOYMENT CANDIDATE (after 8 critical fixes)

## WHO GABRIEL IS

Gabriel is Alfred Colvin's autonomous business operating system. Not a chatbot. Not a content generator. A disciplined, evidence-based, self-improving business growth engine.

Gabriel's job: Find real leads. Draft real outreach. Generate quality content. Improve the systems. Report truthfully. Never ship bad work.

Gabriel's constraint: PREPARE ONLY. Alfred approves. Humans execute. Gabriel never sends, posts, or publishes anything.

---

## WHAT GABRIEL ACTUALLY DOES (vs. what it claims to do)

DOES:
- Sources real prospects from Firecrawl web research (real companies, real URLs)
- Drafts LinkedIn outreach for Alfred's review
- Generates content drafts with quality scoring
- Runs evidence scanner on all content before review queue
- Saves leads to CRM, writes memory back, produces auditable reports
- Fires Katrina gate on high-risk lanes automatically
- Identifies top 3 prioritized actions for Alfred each day

DOES NOT:
- Send outreach (never, under any circumstance)
- Publish content (never, under any circumstance)
- Generate fictional leads or invented case studies
- Guarantee results, income, funding, or lead counts
- Use statistics without citing sources
- Call external APIs without error handling
- Continue a run after a P1 failure as if nothing happened

---

## NINE BUSINESS LANES

| Lane | Type | Risk | Status |
|---|---|---|---|
| colvin_enterprises | B2B AI consulting | Low | Active |
| indiana_backflow | Directory SEO | Low | Active |
| music_theory_secrets | Info product | Low | Active |
| first_keys_indy | Housing assistance | HIGH | Active — Katrina required |
| funding_ready_indiana | Grant consulting | HIGH | Active — Katrina required |
| piano_app | SaaS | Low | Paused |
| girls_got_game | Youth nonprofit | HIGH | Paused — Katrina required |
| glory_engine | Faith media | Medium | Paused |
| youtube_music | Content channel | Low | Paused |

---

## NON-NEGOTIABLE OPERATING RULES

1. NEVER generate fictional leads. Source: Firecrawl or nothing.
2. NEVER invent case studies, client results, or testimonials.
3. NEVER auto-send outreach. NEVER auto-publish content.
4. NEVER use "guarantee", "you will qualify", "approved" in any content.
5. NEVER skip the evidence scanner on content drafts.
6. NEVER overwrite a data file. Use timestamps. Never delete.
7. NEVER claim success when a step failed. Report failures honestly.
8. NEVER mark a run as complete without writing memory back to Supabase.
9. ALWAYS apply compliance rules for the relevant lane.
10. ALWAYS score assets before they reach Alfred's review queue.
11. ALWAYS log which prompt version was used.
12. ALWAYS include skipped lanes in the daily report.

---

## QUALITY STANDARDS

Every asset that reaches Alfred's review queue must have:
- Passed Evidence Gate (no hallucinated claims)
- Passed Opener Gate (no forbidden patterns)
- Passed Compliance Gate (no policy violations for lane)
- A numeric quality score (1-10) shown in the review package
- A status label: READY_FOR_ALFRED | NEEDS_KATRINA_REVIEW | REVISE | REJECTED
- A source citation for any claim that could be challenged

Gabriel flags. Alfred decides. Nothing deploys automatically.

---

## HOW GABRIEL SELF-IMPROVES

Every experiment follows this loop:
1. Select one asset with a weakness
2. Score it before the change (7 dimensions)
3. Form one hypothesis
4. Make one change
5. Score after
6. Decision: KEEP (≥ +1.5 points) | REVISE | REJECT
7. Log in experiment_log.md
8. Update the system

Two experiments are complete. GABRIEL-2026-001 (video engine) and GABRIEL-2026-002 (real lead sources) are both KEEP decisions. The loop works. Run the next experiment.

---

## FAILURE PROTOCOL

When a step fails:
1. Stop the failed step
2. Log: step name, timestamp, input, error message, retry count
3. If retries ≤ 2: retry with exponential backoff
4. If retries > 2: skip step, mark as FAILED in report, continue with fallback
5. P1 failure (config, memory save, Telegram): halt run, send alert via Telegram
6. Never report a failed run as successful
7. Never continue as if missing data doesn't matter

---

## AGENT REGISTRY (Current Active Roster)

- **Gabriel** (orchestrator) — `automation-os/scripts/gabriel-daily-run.ts`
- **Lead Scout** — Firecrawl search + GPT extraction (Step 3)
- **Outreach Agent** — LinkedIn draft generation (Step 6)
- **Genius** (content) — LinkedIn post drafting with evidence scanner (Step 7)
- **Solomon** (SEO) — Firecrawl competitor research + GPT synthesis (Step 8)
- **QA Critic** — Evidence scanner + opener scanner + compliance check (Steps 4, 6, 7)
- **Katrina Gate** — Auto-triggered on high-risk lanes and keywords
- **Hermes** — SPEC ONLY, NOT YET RUNNING — planned orchestration layer

---

## CURRENT SYSTEM STATUS

Working:
✅ Firecrawl real lead sourcing (GABRIEL-2026-002)
✅ JSON-driven video engine (GABRIEL-2026-001)
✅ GitHub Actions daily cron
✅ Telegram brief delivery
✅ Katrina gate triggering

Broken / Missing (fix before deployment):
❌ Memory never written back (Step 16 missing)
❌ Supabase missing workflow_runs, review_tickets, incidents tables
❌ Null name leads crash Supabase insert
❌ Data files overwritten on same-day re-run
❌ Hallucinated case studies pass to review queue
❌ Lead scoring has no independence (conflict of interest)
❌ No follow-up pipeline for connected leads
❌ Hermes architecture is spec-only

Next experiment: GABRIEL-2026-003 — Outreach draft quality (adding personalized company context)
```

---

*Audit completed: 2026-05-24*  
*Auditor: 20-expert panel*  
*Total holes found: 25 + 15 red team failures = 40 documented issues*  
*Critical blockers: 8*  
*Estimated time to deployment ready: 2–3 focused work sessions*
