# Source Verification Policy — Colvin Content OS

Every source used in research, content, or lead enrichment must be verified and assigned a tier.

---

## Source Tier System

### Tier 1 — Primary Sources (High Trust, confidence 0.85-1.0)
Direct, authoritative sources. Data comes from the original publisher.

**Examples:**
- Government websites (.gov): Indiana Housing Finance Authority, SBA.gov, Indiana.gov
- Official program pages: HUD-approved DPA program pages
- State license databases: Indiana Professional Licensing Agency (plumbers)
- Company official websites (for company facts)
- LinkedIn official profile (for title, company, location — manual research)
- Published books, academic papers, official documentation

**Treatment:** High confidence. Can be cited directly. Still verify current date/version.

### Tier 2 — Secondary Sources (Medium Trust, confidence 0.6-0.84)
Credible reporting, directories, and aggregators with editorial standards.

**Examples:**
- Major news outlets (IBJ, Indianapolis Star, NPR)
- Industry trade publications
- Established business directories (Google Maps listing, BBB)
- Official industry associations
- Well-maintained Wikipedia articles (for general context only, not specific stats)

**Treatment:** Medium confidence. Cross-reference with Tier 1 when possible. Flag if only source for a claim.

### Tier 3 — Tertiary Sources (Low Trust, confidence 0.3-0.59)
Secondary aggregators, blog posts, unverified directories.

**Examples:**
- Generic blog posts (including AI-generated content)
- Social media posts (even from official accounts — may be outdated)
- Third-party directories without verification process
- Forum posts (Reddit, Facebook groups)
- Personal testimonials

**Treatment:** Low confidence. Cannot be the sole basis for a factual claim. Must be flagged as `confidence: low` in output. Cross-reference required.

### Tier 0 — Unverifiable / Prohibited Sources
Do not use. Do not cite.

**Examples:**
- AI-generated summaries without original sources
- Anonymous posts
- Sites with no authorship or date
- Any source the Research Agent cannot access to verify (broken link, paywalled)

---

## Verification Steps

For every claimed fact:
1. **Identify the original source** — where did this fact first appear?
2. **Check the date** — is this still current? (Government program details change)
3. **Check corroboration** — does a second Tier 1 or Tier 2 source confirm it?
4. **Check for contradictions** — does any source say the opposite?
5. **Assign confidence tier**

---

## Unverifiable Claims Protocol

When a claim cannot be verified:
1. Mark it as `unverified` in the research report
2. Include in the "Assumptions" section, not "Verified Facts"
3. Add compliance flag: `unverified_claim` with `severity: warning`
4. Never publish content based solely on unverifiable claims
5. If the claim is about a regulated area (First Keys Indy DPA, FundingReady grants): escalate to `severity: block`

---

## Source Attribution Format

In all research outputs and content:
```
[Fact or claim]
Source: [Source name]
URL: [URL]
Date accessed: [YYYY-MM-DD]
Tier: [1/2/3]
Confidence: [0.0-1.0]
```

---

## Source Staleness

| Source Type | Max Age Before Re-verification |
|------------|-------------------------------|
| Government program details | 90 days |
| Grant/funding information | 30 days |
| Business contact information | 60 days |
| Statistical claims | 1 year |
| General educational content | 2 years |

If a source is older than its staleness threshold: flag as potentially stale, re-verify before using in compliance-sensitive content.
