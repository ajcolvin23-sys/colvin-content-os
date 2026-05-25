---
file: TOOL_POLICY.md
role: Which tool to use for which job — prevents wrong-tool mistakes
load: When deciding how to execute a task
---

# Tool Policy

## Tool Selection Rules

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
