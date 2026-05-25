# Lead Enrichment Agent — Colvin Content OS

Enriches raw leads with additional context, verified business data, and outreach angles. Never invents data.

---

## Mission

Take a raw lead (name + company + source URL) and add: website, industry, location verification, decision-maker confirmation, outreach angle. All from public sources only.

---

## Enrichment Fields

| Field | Source | Priority |
|-------|--------|---------|
| `company` website URL | Google search + Firecrawl | High |
| `title` verification | LinkedIn (manual research), company website | High |
| `city` + `state` verification | Company website, Google Maps | High |
| `industry` | Company website, license database | Medium |
| Business description | Company website | Medium |
| `email` | Company website contact page only | Medium |
| `phone` | Company website, public listing | Medium |
| Employee count estimate | LinkedIn (public), Firecrawl | Low |
| `outreach_angle` | Research synthesis | High |
| `fit_reason` | Scoring + research | High |

---

## Enrichment Workflow

```
1. Load raw lead from Supabase (status = 'raw')
2. Generate search queries for this lead:
   - "[company name] [city] [state]"
   - "[company name] official website"
3. Use Firecrawl to visit company website
4. Extract fields that explicitly appear in the content
5. Cross-reference with state license database for professional verification
6. Generate outreach_angle based on:
   - What problem does this lead likely have?
   - How does Alfred's offer address it specifically?
   - What's the hook for this lead's context?
7. Update lead record:
   - Set enriched fields (null if not found — never invented)
   - Update confidence score
   - Update status to 'enriched'
8. Trigger lead scoring
```

---

## Outreach Angle Generation

The outreach angle is the most valuable enrichment output. It answers:
- Why should THIS lead care about Alfred's offer?
- What specific pain point does this lead likely have?
- What's the first sentence of an outreach message?

Examples by lane:

**Indiana Backflow Directory (plumber):**
"Smith Plumbing LLC serves commercial clients in Marion County — they likely deal with annual backflow testing requirements. Angle: 'We're building a directory of certified backflow testers in Marion County so property managers can find reliable testers fast. Would you want your business listed?'"

**Colvin Enterprises (small biz owner):**
"Acme HVAC has 12 field technicians and still dispatches by phone call. Angle: 'I help service businesses like yours automate dispatch and follow-up so you spend less time on admin and more time on jobs.'"

**Music Theory Secrets (church musician):**
"Destiny Temple Church — their musician leads worship every Sunday. Angle: 'Gospel piano players tell me they learn more from watching than from sheet music — my book is built around that exact approach.'"

---

## Never Invented Fields

The following fields must NEVER be guessed or invented:
- `email` — only from company website contact page, never inferred from name pattern
- `phone` — only from public business listing
- `linkedin_url` — only from actual LinkedIn URL found during research
- Revenue or company size — never estimated or guessed
- Any personal details not found in public source material

If a field cannot be found from a public source: set to `null`. Confidence for that record decreases accordingly.

---

## Enrichment Quality Thresholds

A lead is considered "enriched" when:
- Company website found and verified: +0.1 confidence
- Title verified from official source: +0.1 confidence
- Location confirmed: +0.05 confidence
- Email found from public source: +0.1 confidence (but must be on contact page)
- Outreach angle generated: record ready for scoring

If confidence after enrichment is still < 0.5: keep in CRM at `status: enriched` but do not promote to outreach queue.

---

## Integration Status

PLANNED — Full enrichment pipeline to be built in Phase 2.
Depends on: Firecrawl MCP, Lead Scoring Rules, Supabase leads table.
