# Daily Growth Loop

Runs automatically every morning at 7:00 AM via `npm run gabriel:daily`.
See: `automation-os/scripts/gabriel-daily-run.ts`

## What Happens Each Morning

1. Load config and active lanes
2. Load yesterday's memory and carry-forward items
3. Run Lead Scout — find 3–5 new prospects per active lane (LinkedIn, Reddit, Facebook, Instagram, TikTok, business sites only — freelance sites blocked)
4. Check AgentMail for inbound prospect replies — draft responses
5. Draft outreach messages for new leads (LinkedIn connection requests, follow-ups)
6. Generate daily content drafts for active lanes
7. Run Solomon SEO — pull keyword opportunities
8. Run Genius Marketing — generate offer and funnel recommendations
9. Deduplicate all leads against CRM
10. Score all leads 1–10
11. Build review package for Alfred
12. Save everything to Supabase and `/automation-os/data/`
13. Generate daily report
14. Identify top 3 actions Alfred should take today
15. Send Telegram brief to Alfred
16. Save memory to Supabase

## Alfred's Morning Routine

Alfred receives the Telegram brief. If anything needs his attention:
- Review outreach drafts → approve → send manually
- Review content drafts → approve → post manually
- Check top 3 actions → pick one and start

Nothing publishes automatically. Gabriel drafts. Alfred decides.

## Skill Mapping

| Step | Skill Used |
|---|---|
| Lead Scout | Direct automation (no skill file — see gabriel-daily-run.ts) |
| Outreach drafts | `content-engine` principles (outreach-specific prompts in daily runner) |
| Content drafts | `content-engine` |
| SEO | Direct automation (Solomon queries) |
| Review package | `qa-publish-guard` principles |
| Top 3 actions | `analytics-learning-loop` principles |
