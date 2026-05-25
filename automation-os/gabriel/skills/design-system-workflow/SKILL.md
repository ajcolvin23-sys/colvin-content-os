---
name: design-system-workflow
description: Use this skill when Gabriel needs to design or improve a landing page layout, create a component variation, define page structure, or produce buildable design specs — using whichever free or paid design tool is available.
---

# Purpose

Design System Workflow handles all visual and structural decisions for Alfred's landing pages and website sections. It produces layout recommendations, component variants, and buildable design specs — tool-agnostic, always choosing the best available free option first.

# Tool Selection (load TOOL_POLICY.md to check current status)

Gabriel always uses the highest available tool tier:

| Tool Available | Use It For |
|---|---|
| **React/Tailwind spec (always available)** | Gabriel writes buildable component specs directly — no visual tool needed |
| **Penpot Free** (penpot.app) | Open-source visual design — layouts, components, style tokens |
| **Figma Free** | 3-project visual design — if Alfred already uses Figma |
| **Paper.design** (paid, optional) | Only if Alfred has an active subscription |

**Default when no tool is set up:** Gabriel generates a React/Tailwind component spec directly. This is a buildable deliverable — a developer or AI can implement it immediately from the spec alone.

# When To Use

- Designing a new landing page structure
- Creating component variants (hero, pricing, testimonials, CTA blocks)
- Improving visual hierarchy on an underperforming page
- Selecting which layout pattern converts better for a given ICP
- Building a reusable component for the design system
- Generating a buildable spec for a component Alfred wants coded

# When Not To Use

- Writing the copy (use `website-cro` or `content-engine`)
- Setting up an A/B test (use `experiment-platform-workflow`)
- Publishing the content (use `gabriel-cms`)

# Required Inputs

- What the page or section needs to accomplish (goal)
- The ICP for this page
- Any existing design patterns or constraints
- Whether this is a new design or an iteration on an existing one
- Which design tool Alfred has available (or "none" — Gabriel will generate a spec)

# Minimum Context Needed

- `business-context/BRAND_GUIDE.md` (voice, tone, length)
- `business-context/ICP_LIBRARY.md` (who is the page for)
- `business-context/WEBSITE_MAP.md` (where does this fit in the site)

# Workflow

1. **Define the page goal** — what action should a visitor take?
2. **Identify the ICP** — what does this visitor care about?
3. **Map the section flow** — what sections need to exist and in what order?
4. **Select layout pattern** from the pattern library below
5. **Generate 2 layout variants** — propose two approaches, explain the tradeoff
6. **Select tool tier** — check TOOL_POLICY.md current status, use highest available
7. **Produce the deliverable:**
   - If no design tool → write React/Tailwind component spec (code-ready)
   - If Penpot/Figma → produce frame/component description for Alfred to build
   - If Paper.design → produce canvas instructions
8. **Specify design tokens** — colors, spacing, typography from brand system
9. **Pass to `qa-publish-guard`**

# Layout Patterns

**Lead generation (first_keys_indy, colvin_enterprises):**
Hero → Problem statement → Solution → Credibility proof → CTA

**Sales pages (music_theory_secrets, piano_app):**
Hook → Pain → Solution → Feature details → Social proof → Price → CTA

**Directory / SEO pages (indiana_backflow):**
Search bar → Value prop → How it works → Directory listing → CTA

**Community / awareness (girls_got_game, glory_engine):**
Emotional hook → Story → Impact → Join/Follow CTA

# React/Tailwind Spec Format (Level 0 output)

When no design tool is available, Gabriel produces a spec like this:

```
COMPONENT SPEC: [component name]
Lane: [lane_id]
Goal: [visitor action]

SECTION STRUCTURE:
<section className="[tailwind classes]">
  <h1 className="[tailwind classes]">[headline placeholder]</h1>
  <p className="[tailwind classes]">[subheadline placeholder]</p>
  <button className="[tailwind classes]">[CTA placeholder]</button>
</section>

DESIGN TOKENS:
- Primary: [hex or Tailwind color]
- CTA button: [bg-color, text-color, padding, rounded]
- Heading: [font-size, font-weight, color]
- Body: [font-size, line-height, color]
- Max-width: [container width]
- Mobile: [key mobile adjustments]

VARIANT A: [layout description]
VARIANT B: [layout description]
RECOMMENDED: [A or B] because [reason]
```

# Decision Rules

- Mobile-first always — design for small screen before large
- One primary action per page fold
- If two layout variants are proposed, recommend one and explain why
- Approved components go into examples.md — reuse before creating new
- Never design around unverified content (placeholder images, fake testimonials)
- Never recommend upgrading to a paid tool unless the free workflow has actually failed

# Common Failure Modes

1. **Designing desktop-first** — Alfred's audience is mobile-heavy
2. **Too many CTAs in one fold** — one primary action per section
3. **Proposing paid tool when free spec works fine** — default is always React/Tailwind spec
4. **Designing without knowing the ICP** — load ICP_LIBRARY.md before any design work
5. **No variant comparison** — always propose two approaches with tradeoff reasoning

# Recovery Steps

No tool available → generate React/Tailwind spec (this is a complete deliverable, not a placeholder)
Desktop-first design → redesign with mobile as primary constraint
Unknown ICP → load ICP_LIBRARY.md before continuing

# Output Format

```
DESIGN SPEC
Lane: [lane_id]
Page/Section: [location]
Goal: [the one action a visitor should take]
ICP: [who this is for]
Tool Used: [React/Tailwind spec | Penpot | Figma | Paper.design]

SECTION FLOW:
1. [Section] — [purpose]
2. [Section] — [purpose]

VARIANT A: [layout + component choices]
VARIANT B: [layout + component choices]

RECOMMENDED: [A or B]
REASON: [1-2 sentences]

[Component spec or design instructions depending on tool]

DESIGN TOKENS: [colors, typography, spacing]
MOBILE NOTES: [small-screen priorities]
REUSED COMPONENTS: [any components pulled from examples.md]

STATUS: pending_review
```

# Memory Update Rules

- Approved design decisions → `logs/decisions.md`
- Approved reusable components → `examples.md` in this skill for future reuse

# Examples

See `examples.md` in this skill folder.
