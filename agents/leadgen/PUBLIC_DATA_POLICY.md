# Public Data Policy — Colvin Content OS

Defines what counts as "public data" for lead generation purposes.

---

## Public Data Definition

Data is public if ALL of the following are true:
1. Accessible without authentication
2. Not behind a paywall
3. Published by the data subject voluntarily (business listing, license database, public profile)
4. Not restricted by robots.txt or site ToS
5. Not involving personal data of minors

---

## Approved Public Data Sources by Category

### Government and Official Records
- Indiana Professional Licensing Agency (plumber licenses): ✓ PUBLIC
- Indiana Secretary of State business registry: ✓ PUBLIC
- Indiana Economic Development Corporation (IEDC) grant recipients: ✓ PUBLIC
- SBA SBIR/STTR award database: ✓ PUBLIC
- Marion County property records: ✓ PUBLIC (for backflow/commercial property context)
- Indiana Housing Finance Authority program pages: ✓ PUBLIC

### Business Directories
- Google Maps business listings: ✓ PUBLIC (research only — no bulk export)
- BBB (Better Business Bureau): ✓ PUBLIC
- Indianapolis Chamber member directory: ✓ CHECK ToS BEFORE USE
- SCORE Indiana: ✓ PUBLIC resource listings
- Local business association directories: ✓ CHECK ToS

### LinkedIn
- Public professional profiles: RESTRICTED
  - Manual research only (1-2 profiles per session)
  - No automated scraping
  - No bulk LinkedIn data extraction
  - No third-party LinkedIn scraping tools

### Social Media
- Facebook public business pages: ✓ PUBLIC (manual research, not bulk)
- YouTube public channel data: ✓ PUBLIC
- Twitter/X public accounts: ✓ PUBLIC (manual research)
- Instagram public accounts: ✓ PUBLIC (manual research)

### CSV Imports
- CSV files Alfred manually provides: ✓ APPROVED
  - Must confirm source is public/permissioned data
  - Must not contain purchased list data
  - Alfred must explicitly confirm consent basis

---

## Not Public Data

| Data Type | Status | Reason |
|-----------|--------|--------|
| LinkedIn connections lists | NOT PUBLIC | Private to account holder |
| Email addresses from scraping (unless listed on public business page) | REQUIRES VERIFICATION | May be private |
| Personal home addresses | NOT PUBLIC | Private residence |
| Any data from gated databases | NOT PUBLIC | Requires auth |
| Purchased contact lists | PROHIBITED | Cannot verify consent |
| Data about minors | PROHIBITED | Privacy + legal |

---

## When to Ask Alfred

Before using a new data source for the first time:
1. Document the source in this policy
2. Flag it to Alfred for explicit approval
3. Only proceed after Alfred confirms in writing (Telegram or dashboard)

This one-time approval process applies to any source not already on the approved list above.

---

## Public Data Handling

Even when data is public:
- Use only for the stated business purpose (lead gen for Alfred's lanes)
- Do not resell, share, or transfer to third parties without Alfred's approval
- Respect data minimization: collect only fields that serve a specific purpose
- Honor any opt-out requests even for publicly-sourced leads
