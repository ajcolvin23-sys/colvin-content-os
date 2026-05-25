# Lead Finder Agent — Colvin Content OS

Firecrawl-based lead extraction. Finds structured lead data from public sources. Validates against lead.schema.json before inserting into Supabase.

---

## Mission

Find qualified leads for Alfred's business lanes from public, legally-accessible sources. Never cross privacy or legal boundaries. Never invent data. Output clean, validated, deduped lead records.

---

## Input

```json
{
  "lane": "indiana_backflow_directory",
  "playbook": "INDIANA_BACKFLOW_LEAD_PLAYBOOK.md",
  "target_sources": ["https://www.pla.in.gov/...", "..."],
  "target_count": 20,
  "run_id": "uuid"
}
```

---

## Extraction Workflow

```
1. Load lane playbook (source list, target ICP, extraction fields)
2. For each target source:
   a. Check robots.txt (via Firecrawl robots check)
   b. If blocked: skip this source, log, move to next
   c. If allowed: scrape with Firecrawl MCP
   d. Extract structured fields using LLM extraction
3. Validate each extracted lead against lead.schema.json
4. Run dedup check (Lead Deduplication Agent)
5. For new leads: set status = 'raw', write to Supabase
6. Return summary: {found: N, new: N, dupes: N, validation_failures: N}
```

---

## Extraction Prompt Pattern

```
Extract lead information from the following web content.
Return ONLY data that explicitly appears in the content.
Do not infer or guess any fields not present.
If a field is not found, return null.

Required fields: name, company, title, city, state, source_url
Optional fields: phone, email, linkedin_url

Content:
[scraped content]
```

---

## Robots.txt Compliance

- Firecrawl MCP respects robots.txt by default
- Lead Finder Agent additionally verifies before any scrape
- If robots.txt disallows scraping: skip the domain, log as `robots_blocked`
- Never attempt to circumvent robots.txt restrictions

---

## Rate Limiting

- Max 1 request/second to any single domain
- Max 50 pages per domain per run
- If Firecrawl returns rate limit: back off 30 seconds, retry once
- Never scrape the same URL twice within 1 hour

---

## Data Quality Requirements

Before inserting any lead:
- `name` must be present (not null)
- `lane` must be a valid enum value
- `provenance.source_url` must be a valid, accessible URL
- `provenance.is_public_data` must be true
- `provenance.robots_txt_checked` must be true
- Schema validation must pass (all required fields present)

---

## What Lead Finder Does NOT Do

- Does not enrich leads (that's Lead Enrichment Agent)
- Does not score leads (that's Lead Scoring)
- Does not generate outreach (that's Email Copy Agent)
- Does not access gated or login-required content
- Does not scrape LinkedIn profiles in bulk
- Does not invent any contact details

---

## Output Format

Each extracted lead as lead.schema.json:
```json
{
  "id": "uuid-v4",
  "name": "Mike Smith",
  "company": "Smith Plumbing LLC",
  "title": "Owner",
  "city": "Indianapolis",
  "state": "Indiana",
  "phone": null,
  "email": null,
  "lane": "indiana_backflow_directory",
  "status": "raw",
  "source": "Indiana Professional Licensing Agency plumber search",
  "provenance": {
    "source_url": "https://www.pla.in.gov/...",
    "scraped_at": "2025-01-15T07:30:00Z",
    "extractor_version": "lead-finder-v1",
    "confidence": 0.92,
    "robots_txt_checked": true,
    "is_public_data": true
  },
  "run_id": "uuid",
  "trace_id": "string",
  "idempotency_key": "indiana_backflow_directory_lead_smith_plumbing_llc_indianapolis_2025-01-15",
  "confidence": 0.92,
  "created_at": "2025-01-15T07:30:00Z"
}
```

---

## Integration Status

- REQUIRES SETUP: Firecrawl MCP + FIRECRAWL_API_KEY
- PLANNED: Full extraction pipeline
- REFERENCE: automation-os/ uses Firecrawl MCP for existing scraping tasks
