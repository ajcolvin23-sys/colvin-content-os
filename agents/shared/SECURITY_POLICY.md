# Security Policy — Colvin Content OS

**Scope:** All agents, all workflows, all environments.

---

## 1. API Key Security

### Storage Rules
- **Local development:** All API keys in `.env.local` only. Never committed to git.
- **CI/CD (Vercel/GitHub Actions):** GitHub Secrets or Vercel Environment Variables only.
- **Never allowed:** Keys in markdown files, JSON configs, logs, console output, Supabase text fields, Telegram messages, review tickets, incident records.

### Keys in Scope
See `/agents/ENVIRONMENT_VARIABLES.md` for the full list.

### Violation Response
If an API key is detected in any agent output, log, or document:
1. Treat as P1 incident immediately
2. Alert Alfred via Telegram
3. Rotate the key within 1 hour
4. Review the code path that allowed the leak

---

## 2. No Gated Data Access

- Never scrape behind authentication walls
- Never use tools that access private LinkedIn profiles at scale
- Never attempt to access competitor systems, databases, or CRMs
- Never bypass paywalls

---

## 3. Defense in Depth

Each agent enforces its own security checks. Do not rely on a single validation layer:

1. **Input validation:** All inputs validated against schemas before processing
2. **Output sanitization:** All outputs scrubbed before logging (see LOGGING_MASKING_RULES.md)
3. **Policy enforcement:** COMPLIANCE_POLICY.md checked before every content/outreach output
4. **Human gate:** Alfred approval required before any external action (send, publish, render)
5. **Audit trail:** All actions logged with run_id and trace_id in Supabase

---

## 4. Unauthorized Action Prevention

The following actions are NEVER automated without explicit Alfred approval:
- Sending any email or message
- Publishing any content to any platform
- Triggering any Remotion render
- Inserting data into external CRM systems
- Initiating any financial transaction

---

## 5. Data Access Controls

- Supabase service role key is used only server-side (Next.js API routes or server components)
- `NEXT_PUBLIC_SUPABASE_URL` is safe for client-side
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in client-side code or `NEXT_PUBLIC_*` vars
- Row-Level Security (RLS) should be enabled on all Supabase tables
- Agents access Supabase via the service role key in server context only

---

## 6. Secret Rotation Schedule

| Secret | Rotation Interval | Who Rotates |
|--------|------------------|-------------|
| OPENAI_API_KEY | Every 90 days or on compromise | Alfred |
| SUPABASE_SERVICE_ROLE_KEY | Every 180 days | Alfred |
| TELEGRAM_BOT_TOKEN | On compromise only | Alfred |
| CRON_SECRET | Every 90 days | Alfred |
| FIRECRAWL_API_KEY | Every 90 days | Alfred |
| All others | On compromise | Alfred |

---

## 7. Scraping Ethics and Legal

- Always check robots.txt before scraping any domain
- Rate limit all scrapers: max 1 request/second to any single domain
- Never scrape at scale without reviewing the site's Terms of Service
- Indiana government databases: check if bulk download is available before scraping
- If a site blocks scraping, stop. Do not circumvent.

---

## 8. Incident Escalation for Security Events

Security events are P1 by default:
- Any API key leak → P1, rotate immediately
- Any unauthorized data access attempt → P1
- Any policy bypass in agent output → P1
- Any compliance violation in published content → P1

---

## 9. Weekly Security Review

`SECURITY_REVIEW_AGENT.md` runs every Monday:
- Scan for exposed secrets in config files
- Check Supabase for RLS policy coverage
- Review agent outputs for policy compliance
- Verify no new env vars added without documentation
- Report to Alfred via Telegram with PASS/FAIL + action items
