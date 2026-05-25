# Security Audit — Colvin Content OS

Security checklist and audit log for the Colvin Content OS agent architecture.

---

## Audit Schedule

| Audit Type | Frequency | Agent | Deliverable |
|-----------|-----------|-------|-------------|
| Automated security review | Weekly (Monday 3 AM ET) | Security Review Agent | Security report in Supabase |
| Manual audit (this checklist) | Monthly | Alfred + Claude | Completed checklist + issues logged |
| API key rotation verification | Monthly | Alfred | All keys rotated per schedule |
| Dependency vulnerability scan | Monthly | `npm audit` | Zero high/critical vulnerabilities |

---

## Security Checklist

### 1. API Key Security

- [ ] All API keys stored in `.env.local` (local) — never in code, never in markdown
- [ ] All API keys stored as GitHub Secrets (CI) — never in workflow YAML as plaintext
- [ ] All API keys stored as Vercel Environment Variables (production) — never in NEXT_PUBLIC_*
- [ ] `SUPABASE_SERVICE_ROLE_KEY` confirmed NOT in any NEXT_PUBLIC_* variable
- [ ] No API keys visible in git history (`git log --all -S "sk-"` returns nothing)
- [ ] No API keys in any markdown, documentation, or spec file
- [ ] `.env.local` is in `.gitignore` and confirmed not tracked

### 2. Supabase Security

- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Service role key used only server-side (API routes, server components)
- [ ] Anon key used only for public-facing operations
- [ ] No direct SQL execution from client-side code
- [ ] Supabase project ID: `iuzlbtfevzkerehmluqj` — access list reviewed
- [ ] Database backups enabled and verified (run Backup Restore QA Agent)

### 3. Agent Action Boundaries

- [ ] No agent auto-sends outreach — all drafts to review queue
- [ ] No agent auto-publishes content — all drafts to review queue
- [ ] No agent auto-renders video — blueprint requires Alfred's approval
- [ ] No agent can create or modify DNS records
- [ ] No agent can execute financial transactions
- [ ] Human Review Gateway is the only path from "draft" to "approved"

### 4. Data Collection and Privacy

- [ ] Girls Got Game: NO personal data collected from minors (anyone under 18)
- [ ] Girls Got Game: Contact forms do not collect birth date or school name
- [ ] Lead records only contain publicly available data (see PUBLIC_DATA_POLICY.md)
- [ ] No scraping behind login walls or paywalls
- [ ] No storing or logging of passwords, SSNs, financial account numbers
- [ ] All log masking rules applied (see LOGGING_MASKING_RULES.md)

### 5. Web Scraping Compliance

- [ ] Firecrawl only hits approved sources (see WEB_SCRAPE_POLICY.md)
- [ ] robots.txt checked before every scrape
- [ ] Rate limits respected (1 req/sec for Firecrawl)
- [ ] No scraping of private member areas, gated communities, court records databases

### 6. Content Compliance

- [ ] First Keys Indy content reviewed for HUD/RESPA compliance before review queue submission
- [ ] No guarantee language in any output ("you will get X", "guaranteed approval")
- [ ] CAN-SPAM elements present in all outreach (unsubscribe mechanism, physical address)
- [ ] FTC disclosure required on faith-based content claiming health/financial benefits
- [ ] Youth-safe content rules applied for Girls Got Game

### 7. Dependency Security

- [ ] `npm audit` run — zero high or critical vulnerabilities
- [ ] All dependencies up to date (patch + minor updates applied)
- [ ] No packages with known CVEs in production bundle

### 8. Third-Party MCP Security

- [ ] Firecrawl MCP: only hits URLs explicitly passed to it — no autonomous browsing
- [ ] Playwright MCP: no stored credentials, no form submissions without approval
- [ ] Remotion MCP: render only fires after blueprint is approved
- [ ] Gemini MCP: used for second-opinion checks only — no direct output delivery

### 9. Infrastructure

- [ ] Vercel deployment: environment variables set (not hardcoded)
- [ ] Next.js server-only code confirmed not in client bundle
- [ ] No `NEXT_PUBLIC_*` variables expose secrets
- [ ] CORS configured correctly on API routes

### 10. Incident and Recovery

- [ ] Emergency key revocation procedure documented (see SECRET_MANAGEMENT_POLICY.md)
- [ ] Target: < 15 minutes from breach detection to key revocation
- [ ] P1 incident escalation path confirmed (Telegram → Alfred immediate)
- [ ] All agents have circuit breakers configured for external API calls

---

## Known Security Considerations

### Firecrawl Rate Limiting
The system applies 1 req/sec rate limiting for Firecrawl. If a bug bypasses this, Firecrawl API keys could be suspended. The circuit breaker catches repeated 429s and opens the circuit after 5 consecutive failures.

### Supabase Row Level Security
RLS must be enabled before any production data flows. Without RLS, a compromised anon key could expose all records. All API route code must use the service role key for write operations.

### Girls Got Game — Minor Data Absolute Prohibition
Any code or agent that handles Girls Got Game records must explicitly check `lane === 'girls_got_game'` and enforce the no-minors-PII rule. This is a legal requirement, not a preference.

### First Keys Indy — Fair Lending
The Form Question Agent explicitly does NOT collect income, race, national origin, or religion on intake forms for First Keys Indy. This is a fair lending compliance requirement under ECOA. Any code changes to form logic for this lane must be reviewed.

---

## Audit Log

| Date | Auditor | Findings | Resolved |
|------|---------|---------|---------|
| Initial setup | Alfred + Claude | No API keys in git history verified | N/A — pre-production |

---

## Integration Status

PLANNED — Automated weekly security review via Security Review Agent (Phase 5).
Manual audit checklist: available now for Alfred to run monthly.
