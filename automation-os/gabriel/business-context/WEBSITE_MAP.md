---
file: WEBSITE_MAP.md
role: Alfred's live websites and key pages — load when working on web content or CRO tasks
load: On demand — only when task involves a specific site
---

# Website Map

## Live Sites

| Business | URL | Status | Platform |
|---|---|---|---|
| Colvin Content OS (main app) | https://colvin-content-os.vercel.app | Live | Vercel / Next.js |
| First Keys Indy | https://first-keys-indy.vercel.app | Live | Vercel / Next.js |
| Indiana Backflow Directory | TBD (in development) | Dev | Next.js / Supabase |

## Key Pages — First Keys Indy

- **Homepage:** Hero, value prop, CTA to book call or download guide
- **Programs:** Marion County down payment assistance programs listed
- **About:** Alfred's story and why he built this resource
- **Contact/Book:** Links to booking calendar

## Key Pages — Colvin Content OS

- This is the automation dashboard, not a marketing site
- API routes at `/api/` power the Gabriel automation pipeline

## CTA Inventory

| Site | Primary CTA | Secondary CTA |
|---|---|---|
| colvin_enterprises | Book free automation audit | Watch intro video |
| first_keys_indy | Get the free buyer guide | Book a call |
| indiana_backflow | Find a certified tester | Get listed (for testers) |
| music_theory_secrets | Get the book | Download free chord chart |
| piano_app | Take the free quiz | — |

## Booking Link

`https://calendar.app.google/igj4Vfwvc1ZUB3Gc9` — used across all lanes for consultations

## CMS Notes

Content updates go through Gabriel's draft → approve → publish workflow.
No hardcoded marketing copy should be changed without version history.
All changes must pass `qa-publish-guard` before going live.
