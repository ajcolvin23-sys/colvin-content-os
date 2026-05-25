# Gabriel Daily Orchestrator

## Trigger

Runs daily at 7:00 AM CST via:
- GitHub Actions cron: `0 13 * * *` (UTC = 7 AM CST)
- Manual: `npm run gabriel:daily`
- API: `POST /api/gabriel/daily` with `Authorization: Bearer $CRON_SECRET`

## 15-Step Daily Sequence

### Phase 1: Load Context

**Step 1 — Load Config**
- Read `automation-os/config/gabriel-config.json`
- Load active business lanes, review thresholds, model routing rules
- Verify API keys available (OpenAI, Supabase, Telegram)
- Exit early with Telegram alert if any critical key is missing

**Step 2 — Load Memory**
- Query Supabase `gabriel_memory` table for latest row
- Pull yesterday's pending_actions, completed_actions, carry_forward
- Load any content marked `status = 'needs_review'` from previous run
- Build context string (under 2000 tokens)

### Phase 2: Intelligence Gathering

**Step 3 — Lead Scout**
- Run `automation-os/scripts/gabriel-lead-scout.ts`
- Sources: Firecrawl web research, Indianapolis business directories, LinkedIn search queries
- Target: 5–15 new prospects per lane (configurable in gabriel-config.json)
- Output: raw_leads array with name, company, title, source, contact_method, lane

**Step 4 — Outreach Prep**
- Run `automation-os/scripts/gabriel-outreach-prep.ts`
- For each new lead → draft LinkedIn connection request (max 300 chars) + follow-up (max 150 words)
- Personalize using lead's title, company, lane context
- Apply Katrina gate if lead is in `first_keys_indy`, `funding_ready_indiana`, or `girls_got_game`
- Output: outreach_drafts array → NEVER auto-send

**Step 5 — Content Generation**
- Run `automation-os/scripts/gabriel-content-gen.ts`
- Generate 1–3 posts per active lane (configurable)
- Platforms: LinkedIn, Instagram, Facebook, TikTok script, email subject line
- Use Genius skill templates for each content type
- Output: content_drafts array → NEVER auto-publish

**Step 6 — SEO Intelligence**
- Call Solomon agent with today's priority lanes
- Pull top 3 keyword opportunities, any new competitor moves, page optimization flags
- Use Firecrawl for live competitor research if needed
- Output: seo_opportunities array

**Step 7 — Marketing Recommendations**
- Call Genius agent for offer copy, funnel opportunities, email sequence ideas
- Limit to 1–2 recommendations to avoid overwhelm
- Output: marketing_recommendations array

### Phase 3: Processing

**Step 8 — Deduplicate**
- Query Supabase `leads` table for existing records
- Compare new leads by email, LinkedIn URL, company+name
- Remove any lead already contacted in last 30 days
- Log dedup stats

**Step 9 — Score Leads**
- Score each unique lead 1–10:
  - Firmographic fit (does their role/industry match Alfred's offer): 0–4 pts
  - Timing signals (recent hiring, funding, event): 0–3 pts
  - Channel match (LinkedIn available, email found): 0–2 pts
  - Lane urgency (is this lane actively running campaigns): 0–1 pt
- Use GPT-4o-mini for scoring (structured JSON output)

**Step 10 — Categorize**
- Group all outputs into review queues:
  - `outreach_queue`: leads with score >= 7
  - `content_queue`: content drafts ready for review
  - `seo_queue`: SEO opportunities requiring Alfred's decision
  - `opportunity_queue`: high-value marketing recommendations

### Phase 4: Human Review Package

**Step 11 — Build Review Package**
- Sort each queue by priority score (highest first)
- Format for human scanning (name, company, why they're a good fit, draft message)
- Flag any item requiring Katrina governance review
- Flag any item with compliance concerns

**Step 12 — Save Outputs**
- Write to Supabase tables: `leads`, `outreach_drafts`, `content_queue`, `gabriel_memory`
- Write JSON files to `automation-os/data/` subfolders
- Update gabriel_memory with today's session summary

### Phase 5: Report & Deliver

**Step 13 — Daily Report**
- Run `automation-os/scripts/gabriel-report.ts`
- Compile: leads found, drafts created, content produced, SEO flags, top opportunities
- Calculate pipeline velocity (leads this week vs last week)
- Identify any broken steps or API errors from today's run

**Step 14 — Top 3 Actions**
- Use GPT-4o-mini to rank all review items and identify top 3 things Alfred should do today
- Criteria: highest ROI, lowest effort, most time-sensitive
- Format as 3 clear action items with context

**Step 15 — Telegram Brief**
- Send summary message to Alfred's Telegram
- Include: date, counts, top 3 actions, any urgent flags
- Character limit: under 4096 chars
- Do NOT include full drafts — just the brief + "Review queue ready in Content OS"

## Error Handling

- Any step failure → log error + skip step + continue to next step
- If Steps 3–7 all fail → abort run, send Telegram error alert
- Max total runtime: 10 minutes — kill with timeout if exceeded
- Save partial results even on partial failure

## Cron Schedule

Managed via GitHub Actions `.github/workflows/gabriel-daily.yml`
Do NOT run via local cron (causes PATH issues with node).
Do NOT run via Vercel cron simultaneously (triple-trigger problem).
