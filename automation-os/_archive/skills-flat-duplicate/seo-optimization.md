# Skill: SEO Optimization

## When to Load

Load when: Alfred asks about rankings, traffic, keywords, page performance, competitor research, or local search visibility.

## Solomon Activation Checklist

Before answering any SEO question:
1. Load relevant skill file from `docs/agent-os/skills/seo/`
2. Use Firecrawl MCP for live competitor data (never rely on training knowledge for current rankings)
3. Apply the appropriate output template for the request type

## Priority SEO Lanes

### Indiana Backflow Directory (High Priority)
- Target: "backflow tester [city/county]" for all 92 Indiana counties
- Strategy: Programmatic local pages (one per county + city clusters)
- Schema: LocalBusiness + ProfessionalService
- Key gap: Many county pages thin — need tester profiles + FAQ content

### Colvin Enterprises (Medium Priority)
- Target: "AI automation Indianapolis", "AI consultant Indiana"
- Strategy: Service pages + case studies + blog
- Key gap: Need more location-specific content + reviews

### Music Theory Secrets (Medium Priority)
- Target: "gospel piano lessons", "music theory gospel", "church musician training"
- Strategy: YouTube SEO + website blog cluster + Pinterest
- Key gap: Website needs topical authority cluster

### First Keys Indy (Medium Priority)
- Target: "first time homebuyer Indianapolis", "down payment assistance Marion County"
- Strategy: FAQ content + local landing page optimization
- Key gap: GBP optimization + local citations

## Quick SEO Win Checklist

For any page Alfred wants ranked:
- [ ] Target keyword in H1, first paragraph, URL slug
- [ ] Meta title under 60 chars, meta description under 160 chars
- [ ] LocalBusiness or relevant schema markup
- [ ] One internal link to/from a related page
- [ ] Core Web Vitals passing (LCP < 2.5s)
- [ ] Mobile responsive

## Firecrawl Research Pattern

When researching competitors:
1. Scrape top 3 ranking pages for target keyword
2. Note: word count, H1/H2 structure, schema used, key differentiators
3. Build better version with more specificity + local relevance

Never cite Firecrawl data as "authoritative" — verify before including in final output.
