# Design System Workflow — Examples

## Example 1: First Keys Indy Hero Section (Level 0 — React/Tailwind Spec)

**Lane:** first_keys_indy
**Goal:** Get visitor to download the free homebuyer guide
**Tool:** React/Tailwind spec (no design tool installed)

```
COMPONENT SPEC: Hero Section — First Keys Indy
Goal: Guide download CTA
ICP: Marion County renter, 25-45, first-time buyer, mobile user

SECTION FLOW:
1. Hero — Hook + CTA
2. Trust bar — logos/proof
3. How it works — 3 steps

VARIANT A: Full-bleed hero with headline + subtext + single CTA button
VARIANT B: Split hero — text left, illustration right (mobile: stacked)

RECOMMENDED: Variant A — mobile audience, full-bleed converts better at small screens

COMPONENT SPEC (Variant A):
<section className="bg-white px-4 py-12 md:py-20 text-center">
  <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
    Marion County Homebuyer Help — Free
  </h1>
  <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
    Find out which down payment programs you qualify for.
    No lender required to start.
  </p>
  <a href="/guide" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700">
    Get the Free Buyer Guide
  </a>
</section>

DESIGN TOKENS:
- Primary CTA: bg-blue-600 text-white (or Alfred's brand color)
- Heading: text-3xl md:text-5xl font-bold text-gray-900
- Body: text-lg text-gray-600
- Container: max-w-2xl mx-auto px-4
- Mobile: text-center, full-width CTA button
```

**Lesson:** When no design tool is available, a React/Tailwind spec is a complete, shippable deliverable. A developer or AI can implement it in under 30 minutes.
