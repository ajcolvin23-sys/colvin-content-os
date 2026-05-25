---
file: TOOL_POLICY.md
role: Which tool to use for which job — prevents wrong-tool mistakes
load: When deciding how to execute a task
---

# Tool Policy

## AI / LLM Tool Selection

| Job | Use This Tool | Never Use |
|---|---|---|
| Complex reasoning, content generation, long drafts | GPT-4o | GPT-4o-mini |
| Routing decisions, dedup, scoring, classification | GPT-4o-mini | GPT-4o (too expensive) |
| Deep research requiring citations or multiple passes | Claude (Anthropic) | GPT-4o-mini |
| Cross-check a GPT-4o conclusion | Gemini | nothing |
| Web research, live page scraping, competitor data | Firecrawl | GPT hallucination |
| CRM reads and writes | Supabase | in-memory only |
| Daily brief and alerts | Telegram | email (too slow) |
| Outreach emails after Alfred approval | Resend | Telegram |
| Inbound prospect reply monitoring | AgentMail | manual checking |

## Analytics & Testing Tool Stack (Budget Tiers)

Do not block any workflow because a paid tool is unavailable.
Always use the highest available tier. Default to Level 0 unless a higher tier is set up.

### Level 0 — Always Available (Free, No Setup Required Beyond Snippet)

| Tool | Use For | How to Access |
|---|---|---|
| **Supabase DIY** | A/B experiment tracking (variant/control rows, manual measurement) | Already live — use `experiments` table |
| **Google Analytics 4** | Traffic, conversions, event tracking | Add GA4 snippet to Vercel sites |
| **Google Search Console** | Organic search clicks, impressions, keyword performance | Verify site ownership at search.google.com/search-console |
| **Microsoft Clarity** | Free heatmaps, session recordings, scroll depth | Add Clarity snippet to Vercel sites (clarity.microsoft.com) |
| **React/Tailwind spec** | Design system — Gabriel generates buildable component specs directly | No setup — Gabriel produces code-ready specs |
| **Penpot Free** | Open-source visual design tool (Figma alternative) | penpot.app — free account |

### Level 1 — Free with One-Time SDK Install

| Tool | Use For | Setup Required |
|---|---|---|
| **GrowthBook Free** | A/B testing with statistical significance, feature flags | Install GrowthBook SDK on Vercel site (growthbook.io) |
| **PostHog Free** | Up to 1M events/month — funnels, session replay, cohorts | Install PostHog SDK on Vercel site (posthog.com) |
| **Figma Free** | Visual design — 3 projects free | figma.com free account |

### Level 2 — Paid (Only When Free Stack Is Proven Insufficient)

| Tool | Use For | Upgrade Trigger |
|---|---|---|
| **Paper.design** | Visual landing page design with CMS integration | Only if Penpot/Figma can't handle the design workflow |
| **Humblytics** | Privacy-friendly analytics + A/B testing combined | Only if GA4 + GrowthBook combo is proven insufficient |
| **PostHog Paid** | Advanced analytics beyond 1M events | Only when Alfred's sites exceed 1M events/month |

### Budget Rules

1. **Never block a workflow** because Paper or Humblytics are unavailable
2. **Always offer a free fallback** — Supabase DIY handles experiments when nothing else is set up
3. **Validate before paying** — prove the workflow works on free tools first
4. **Only recommend paid tools** when Gabriel can show they save time, increase conversions, or generate revenue
5. **Do not mention paid tools** in output to Alfred unless he specifically asks about upgrade options

## Current Status (update when tools are installed)

```
google_analytics_4:     [ ] not installed  [ ] installed on colvin-content-os  [ ] installed on first-keys-indy
google_search_console:  [ ] not verified   [ ] verified colvin-content-os       [ ] verified first-keys-indy
microsoft_clarity:      [ ] not installed  [ ] installed on colvin-content-os  [ ] installed on first-keys-indy
growthbook:             [ ] not installed  [ ] installed
posthog:                [ ] not installed  [ ] installed
supabase_experiments:   [x] available (table exists via migration 006)
penpot:                 [ ] not set up
figma:                  [ ] not set up
```

**Default experiment platform until tools are installed:** Supabase DIY

## Hard Rules

- Never call GPT-4o for tasks that GPT-4o-mini handles correctly. Cost matters.
- Never use LLMs for deterministic work: math, dedup, sorting, counting. Use code.
- Never scrape a site more than once per run for the same query. Cache the result.
- Never generate fictional leads, fictional analytics, or fictional results to fill a report.
- Always log LLM calls: model used, token estimate, step name.

## Model Routing Reference

```
outreach_drafts:     gpt-4o
content_generation:  gpt-4o
seo_analysis:        gpt-4o
lead_scoring:        gpt-4o-mini
dedup:               gpt-4o-mini
routing:             gpt-4o-mini
deep_reasoning:      claude-haiku-3-5 (fallback: gpt-4o-mini)
cross_check:         gemini-1.5-flash
```

## Token Budget Awareness

- Gabriel has a 15-minute GitHub Actions budget per daily run
- If a step takes more than 3 API calls, check if it can be simplified
- Content generation should produce 1-3 pieces per lane, not 10
- Lead scout should find 3-5 leads per lane, not 50
