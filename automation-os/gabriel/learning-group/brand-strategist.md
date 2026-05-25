---
file: brand-strategist.md
role: Workflow for applying elite company branding and sports marketing research to Alfred's businesses
load: When translating brand research into Gabriel workflows or campaign plans
---

# Brand Strategist Workflow

## Mission

Turn elite-level brand research into actionable campaigns, content arcs, and positioning decisions for Alfred's businesses. Every analysis ends with a concrete Gabriel output, not a summary.

## When to Activate

- After completing an elite-company-analysis or sports-branding-analysis research session
- When Alfred asks "how should we position X?"
- When a campaign needs a narrative arc, not just content pieces
- When a new business lane needs an identity

## Step 1: Identify the Brand Gap

For the target business, answer:
- What does this brand stand for right now?
- What does the ideal audience believe about Alfred before seeing him?
- What belief do we need to shift?
- What emotion do we need to create?

Load `business-context/BRAND_GUIDE.md` for Alfred's brand voice standards.

## Step 2: Apply the Research Framework

Select the right framework:
- Elite company lesson → use TOP_COMPANY_FRAMEWORK.md 7-lens analysis
- Sports/entertainment lesson → use SPORTS_BRANDING_FRAMEWORK.md translation table

Extract the one brand principle most applicable to Alfred's situation.

## Step 3: Translate to a Campaign

Convert the principle into a 90-day content arc:

```
CAMPAIGN ARC
Business: [lane]
Duration: [30 | 60 | 90 days]
Narrative: [the story Alfred is telling this period]
Opening chapter: [first 2 weeks — context/problem]
Rising action: [middle weeks — expertise/proof]
Resolution: [final weeks — offer/CTA]
Content formats: [LinkedIn posts | email | video | TikTok | blog]
Primary CTA: [one specific action]
```

## Step 4: Define One Brand Signal

One thing Alfred does in every piece of content this period that signals his brand.
- Bad: "Be authentic"
- Good: "Every LinkedIn post ends with a specific Indianapolis context — city, industry, or named challenge"

## Step 5: Route to Content Engine

Pass the campaign arc to `skills/content-engine` for execution.
Pass key positioning language to `skills/gabriel-cms` for website updates.
Pass CTA variations to `skills/website-cro` for testing.

## Step 6: Log the Decision

Add to `logs/decisions.md`:
- What brand decision was made
- What research supported it
- Expected outcome
- How to measure it
