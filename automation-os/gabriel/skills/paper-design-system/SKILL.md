---
name: paper-design-system
status: DEPRECATED
replaced_by: design-system-workflow
deprecated_date: 2026-05-25
reason: Replaced with tool-agnostic design-system-workflow skill. Paper.design moved to Level 2 (paid/optional). Free alternatives (React/Tailwind spec, Penpot) now cover all use cases.
---

> **DEPRECATED** — Do not load this skill. Use `design-system-workflow` instead.
> This folder is kept for historical reference only.

---

# Purpose

Paper Design System handles all visual and structural decisions for Alfred's landing pages and website sections. It produces layout recommendations, component variants, and reusable design decisions — replacing the Figma-to-developer handoff with direct, buildable design specs.

# When To Use

- Designing a new landing page structure
- Creating component variants (hero, pricing, testimonials, CTA blocks)
- Improving visual hierarchy on an underperforming page
- Selecting which layout pattern converts better for a given ICP
- Building a reusable component for the design system

# When Not To Use

- Writing the copy (use `website-cro` or `content-engine`)
- Setting up an A/B test (use `experiment-platform-workflow`)
- Publishing the content (use `gabriel-cms`)

# Required Inputs

- What the page or section needs to accomplish (goal)
- The ICP for this page
- Any existing design patterns or constraints
- Whether this is a new design or an iteration on an existing one

# Minimum Context Needed

- `business-context/BRAND_GUIDE.md` (voice, tone, length)
- `business-context/ICP_LIBRARY.md` (who is the page for)
- `business-context/WEBSITE_MAP.md` (where does this fit in the site)

# Workflow

1. **Define the page goal** — what action should a visitor take?
2. **Identify the ICP** — what does this visitor care about?
3. **Map the section flow** — what sections need to exist and in what order?
4. **Select layout pattern** — hero > proof > offer > CTA or custom based on goal
5. **Generate 2 layout variants** — propose two approaches, explain the tradeoff
6. **Recommend component choices** — which components serve the goal best
7. **Specify design tokens** — colors, spacing, typography tied to existing system
8. **Output a buildable spec** — enough detail for a developer to implement

# Layout Patterns for Alfred's Businesses

**Lead generation pages (first_keys_indy, colvin_enterprises):**
Hero → Problem statement → Solution → Credibility proof → CTA

**Sales pages (music_theory_secrets, piano_app):**
Hook → Pain → Solution → Feature details → Social proof → Price → CTA

**Directory / SEO pages (indiana_backflow):**
Search bar → Value prop → How it works → Directory listing → CTA

**Community / awareness pages (girls_got_game, glory_engine):**
Emotional hook → Story → Impact → Join/Follow CTA

# Decision Rules

- Mobile-first always — design for small screen before large
- One primary action per page fold
- If two layout variants are proposed, recommend one and explain why
- Approved components go into the design system — reuse before creating new
- Never design around unverified content (placeholder images, fake testimonials)

# Common Failure Modes

1. **Designing desktop-first** — Alfred's audience is mobile-heavy
2. **Too many CTAs in one fold** — one primary action per section
3. **Proposing custom components when a standard one works** — reuse first
4. **No explanation of tradeoffs between variants** — always explain why you prefer one
5. **Designing without knowing the ICP** — layout decisions change significantly by audience

# Recovery Steps

Desktop-first design → redesign with mobile as primary constraint
Too many CTAs → consolidate to one per section, move secondary CTAs lower
Unfamiliar with ICP → load ICP_LIBRARY.md before continuing

# Output Format

```
DESIGN SPEC
Lane: [lane_id]
Page/Section: [location]
Goal: [the one action a visitor should take]
ICP: [who this is for]

SECTION FLOW:
1. [Section name] — [purpose]
2. [Section name] — [purpose]
...

VARIANT A: [layout description + component choices]
VARIANT B: [layout description + component choices]

RECOMMENDED VARIANT: [A or B]
REASON: [1-2 sentences on why]

DESIGN TOKENS:
- Primary color: [from brand system]
- CTA button style: [description]
- Typography: [heading size, body size]
- Spacing: [tight | standard | airy]

MOBILE NOTES: [anything specific to the mobile layout]
REUSED COMPONENTS: [list any components pulled from existing design system]

STATUS: pending_review
```

# Memory Update Rules

- Approved design decisions → `logs/decisions.md`
- Approved reusable components → document them in `examples.md` for future reuse

# Examples

See `examples.md` in this skill folder.
