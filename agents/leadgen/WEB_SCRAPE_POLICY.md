# Web Scrape Policy — Colvin Content OS

---

## What Can Be Scraped

**Permitted sources:**
- Public government websites (.gov, .in.gov, .in.us)
- Public business directories with no login requirement
- Company official websites (publicly accessible pages)
- Public professional license databases
- Public county and city records
- Google Maps business listings (research only — no bulk export)
- Public event listings and local business announcements

**Requires case-by-case review:**
- News websites (check ToS — some prohibit scraping)
- Industry associations (check member directory terms)
- Yelp, Yellow Pages (check ToS)

**PROHIBITED:**
- LinkedIn at scale (ToS violation)
- Any page behind a login
- Any page that requires a CAPTCHA to access
- Healthcare or financial data portals
- Any site that explicitly states "no scraping" in its ToS

---

## robots.txt Compliance

Every scrape must:
1. Check the domain's `robots.txt` before extracting data
2. If `User-agent: *` has `Disallow: /` for the target path: skip
3. If Firecrawl MCP returns a robots.txt block: log and move to next source
4. Log `provenance.robots_txt_checked: true` on every lead

No exceptions. robots.txt compliance is non-negotiable.

---

## Rate Limiting

| Constraint | Rule |
|-----------|------|
| Per-domain | Max 1 request/second |
| Per-run | Max 50 pages per domain |
| Cooldown | Same URL: not more than once per hour |
| Retry on 429 | Back off 30 seconds, retry once |
| Retry on 503 | Back off 60 seconds, retry once |

---

## Scrape Depth Limits

| Target Type | Max Pages |
|------------|----------|
| State license database | 100 records per run |
| County directory | 50 records per run |
| Company website | 5 pages |
| News aggregator | 20 articles |
| Google Maps (manual research) | No automated bulk |

---

## Privacy Boundaries

Do not scrape:
- Personal social media profiles (non-public)
- Personal home addresses
- Personal phone numbers (unless from official public business listing)
- Any data about individuals under 18
- Medical or healthcare information
- Financial account information

If scraping returns data that falls into these categories: discard it immediately, do not store.

---

## Scrape Documentation

Every scrape is documented in lead provenance:
- `source_url` — exact URL scraped
- `scraped_at` — timestamp
- `robots_txt_checked: true` — compliance confirmed
- `is_public_data: true` — public source confirmed

This documentation is required for compliance audits.

---

## Unauthorized Access

If during a scrape the agent encounters:
- A login page: stop immediately
- A CAPTCHA: stop, log, mark source as `requires_login`
- An IP block: stop, create P3 incident, review rate limiting
- A legal warning on the page: stop, alert Alfred

Do not attempt to bypass any of the above.
