# Indiana Backflow Lead Playbook — Colvin Content OS

**Lane:** indiana_backflow_directory
**Goal:** Find licensed backflow testers and commercial property contacts to populate and promote the Indiana Backflow Directory (92 Indiana counties)

---

## Target ICP: Backflow Testers (Supply Side)

These people PROVIDE backflow testing services — we want them listed in the directory.

| Target | Description | Score Weight |
|--------|-------------|-------------|
| Licensed Indiana plumbers | Hold Indiana plumbing license, can test backflow | Highest |
| Certified backflow testers | Hold ABPA or state backflow certification | Highest |
| Plumbing company owners | Own a plumbing business in Indiana | High |
| Irrigation/landscape companies | Often certified for residential backflow | Medium |
| HVAC companies with plumbing arm | Sometimes offer backflow services | Medium |

## Target ICP: Property Owners/Managers (Demand Side)

These people NEED backflow testing — they're looking for testers.

| Target | Description | Score Weight |
|--------|-------------|-------------|
| Commercial property managers | Manage multi-tenant or commercial buildings | Highest |
| Facilities directors | Corporate, school, hospital facilities | Highest |
| Property management companies | Manage portfolios of commercial buildings | High |
| Church facilities managers | Churches often have commercial-grade systems | High |
| School district facilities | K-12 schools have backflow requirements | High |
| Restaurant owners | Health code backflow requirements | High |
| Apartment complex managers | Multi-family with commercial water systems | Medium |

---

## Approved Sources

### For Backflow Testers
1. **Indiana Professional Licensing Agency (PLA)** — Plumber license search
   - URL: https://www.pla.in.gov/
   - Public: Yes
   - robots.txt: Verify before each scrape
   - Fields available: name, license number, company, city, state, license status

2. **Indiana APBA** (American Plumbing, Boilermakers Association) — Indiana chapter
   - Check for public member directory

3. **Google Maps** — Search "backflow testing [county name] Indiana"
   - Manual research only — no bulk export
   - Cross-reference with PLA for license verification

### For Property Managers / Commercial Properties
1. **Indianapolis Business Journal** — commercial real estate coverage
   - Large property managers and facilities contacts
   - Manual research

2. **BOMA Indiana** (Building Owners and Managers Association)
   - Check for public member directory

3. **Indiana Commercial Real Estate directories** — check ToS before use

4. **Google Maps** — "property management companies Indianapolis"
   - Manual research for company names → enrich via website

---

## Extraction Fields Priority

| Field | Priority | Source |
|-------|---------|--------|
| name | Required | PLA database, website |
| company | Required | PLA database, website |
| city | Required | PLA database |
| state | Required | Always "Indiana" |
| title | High | Website, LinkedIn |
| phone | High | Company website |
| email | Medium | Company website contact page |
| license_number | For testers | PLA database |
| counties_served | High | Website or Google Maps coverage |

---

## Outreach Angle Templates

### For Plumbers/Testers (Listing Opportunity)
"We're building the go-to directory for Indiana backflow testers — one place property managers search when they need a certified tester in their county. Would you want [Company Name] listed in the [County] section? Free to list."

### For Property Managers (Find a Tester)
"If you manage commercial properties in [County], you've probably had to scramble to find a certified backflow tester before an inspection. Indiana Backflow Directory has certified testers organized by county. Thought it might be useful to your team."

---

## Do NOT Target

- Purely residential plumbers who don't work commercial
- Out-of-state companies
- Contacts with `do_not_contact` status
- Anyone who has already engaged the directory

---

## Compliance Notes

- No guaranteed claims about tester certification quality (directory lists, not endorses)
- Include disclaimer in directory listings: "Listings are for informational purposes. Verify credentials with Indiana PLA."
- Property manager outreach: standard B2B commercial email — CAN-SPAM applies

---

## Lead Volume Targets

- Backflow testers: 5-10 new qualified testers per week (across all 92 counties)
- Property managers: 5 new qualified contacts per week
- Run daily lead finder, scoring gates at 6+ for outreach
