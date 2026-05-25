# Dashboard Plan — Colvin Content OS

Plan for the monitoring dashboard. Supabase-backed + Next.js at `/dashboard`.

---

## Dashboard Sections

### Section 1: System Health
**Route:** `/dashboard/health`
**Data source:** Supabase `system_health` table (last 30 days)
**Displays:**
- Provider status tiles: Supabase ✓ | OpenAI ✓ | Telegram ✓ | Firecrawl ✓ | Remotion ✓
- Circuit breaker states
- Last health check timestamp
- 24-hour uptime percentage per provider
- Open incidents list (P1 in red, P2 in yellow, P3 in gray)

### Section 2: Pipeline Metrics
**Route:** `/dashboard/pipeline`
**Data source:** Supabase `workflow_runs`
**Displays:**
- Today's runs: Started / Completed / Failed / Blocked
- 7-day trend chart: completion rate
- Stage success rate per workflow
- Average stage latency heatmap
- Queue depth over time

### Section 3: Agent Performance
**Route:** `/dashboard/agents`
**Data source:** Supabase `workflow_runs` grouped by agent
**Displays:**
- Agent health matrix (green/yellow/red)
- Per-agent: runs today, error rate, avg latency
- Schema validation rate per agent
- Compliance flag rate per agent

### Section 4: Review Queue
**Route:** `/dashboard/review` — THIS IS THE MOST IMPORTANT PAGE
**Data source:** Supabase `review_tickets`
**Displays:**
- All pending review tickets (sorted by priority_score)
- Each ticket shows: type, lane, subject, priority score, compliance flags, draft
- Approve / Reject / Request Revision buttons per ticket
- Bulk review for same-type, same-lane items
- Filters: by lane, by type, by compliance status
- Review time stats: avg time to review, overdue items (> 48h)

### Section 5: Remotion Render Status
**Route:** `/dashboard/renders`
**Data source:** Supabase `remotion_videos` table
**Displays:**
- All blueprints: draft / approved / rendering / rendered / failed
- Render queue depth
- Average render time
- QA pass rate
- Link to rendered video (when complete)
- Blueprint JSON viewer

### Section 6: Lead Pipeline Health
**Route:** `/dashboard/leads`
**Data source:** Supabase `leads`
**Displays:**
- Leads by status per lane (funnel chart)
- New leads today by lane
- Lead score distribution chart
- Outreach queue depth
- Conversion funnel: found → scored → queue → approved → contacted → converted
- Recent high-score leads (quick view)

---

## Tech Stack

- **Framework:** Next.js 16 (already in stack)
- **Data:** Supabase direct queries from Next.js server components
- **Authentication:** Simple password or magic link for Alfred only (not public)
- **Charts:** Recharts or Chart.js (lightweight)
- **Styling:** Tailwind CSS (existing)
- **Real-time:** Supabase realtime subscriptions for review queue updates

---

## Dashboard Priority

Phase 5 build order:
1. `/dashboard/review` — highest immediate value (Alfred needs this to approve items)
2. `/dashboard/health` — second (system visibility)
3. `/dashboard/leads` — third (lead pipeline visibility)
4. `/dashboard/renders` — fourth (video pipeline)
5. `/dashboard/pipeline` and `/dashboard/agents` — Phase 5 completion

---

## Integration Status

PLANNED — Phase 5. Next.js app exists (colvin-content-os). Dashboard routes to be built.
