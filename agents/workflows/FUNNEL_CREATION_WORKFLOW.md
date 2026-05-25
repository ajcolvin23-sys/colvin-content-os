# Funnel Creation Workflow — Colvin Content OS

End-to-end funnel creation from offer strategy to launch-ready assets.

---

## Trigger

Manual: Alfred requests a new funnel or funnel update via dashboard.

---

## Workflow Stages

```
Stage 1: Offer Identification
  Agent: Funnel Builder Agent
  Input: Lane + offer type + target audience + platform source
  Action: Define what the funnel is for, what the conversion event is
  Output: Funnel brief

Stage 2: Audience Research
  Agent: Research Agent
  Input: Target audience + lane
  Action: Research audience pain points, objections, and language
  Output: Audience research brief (verified facts, inferences, unknowns)

Stage 3: Funnel Strategy
  Agent: Funnel Builder Agent
  Input: Offer brief + Audience research
  Action: Define:
    - Traffic source (which content drives here?)
    - Lead magnet (what earns the opt-in?)
    - Conversion event (what do we want them to do?)
    - Objections to address
    - Trust signals needed
  Output: Funnel strategy document

Stage 4: Lead Magnet Creation
  Agent: Lead Magnet Agent
  Input: Strategy + lane + audience
  Action: Generate lead magnet content
  Output: Lead magnet content (PDF structure or video brief)

Stage 5: Landing Page Copy
  Agent: Landing Page Copy Agent
  Input: Strategy + audience research + brand voice
  Action: Generate headline, benefits, proof, CTA, objection handling
  Output: Full landing page copy sections

Stage 6: Form Questions
  Agent: Form Question Agent
  Input: Strategy + conversion event
  Action: Generate qualification form questions + routing logic
  Output: Form question set with scoring

Stage 7: Thank-You Page
  Agent: Thank-You Page Agent
  Input: Conversion event + next step
  Action: Generate confirmation copy + bonus offer + next step copy
  Output: Thank-you page copy

Stage 8: Nurture Sequence
  Agent: Nurture Sequence Agent → Email Copy Agent
  Input: Lead magnet + audience + conversion goal
  Action: Generate full nurture email sequence (4-5 emails)
  Output: Email sequence drafts (pending separate review/approval per email)

Stage 9: Supporting Video Brief
  Agent: Gabriel Remotion Studio
  Input: Funnel strategy + lead magnet + CTA
  Action: Generate video brief that drives traffic to this funnel
  Output: Video concept brief (feeds into DAILY_REMOTION_CONTENT_WORKFLOW)

Stage 10: Compliance Review
  Agent: Compliance check
  Action: Full compliance review on all funnel copy
  Special: First Keys Indy — HUD/RESPA full review required
  Output: compliance_flags on all components

Stage 11: Review Queue Submission
  Agent: Human Review Gateway
  Action: Package all funnel components into comprehensive review ticket
  Output: review_ticket (type: funnel) with all components attached

Stage 12: Alfred Approval + Implementation
  Post-approval: Alfred implements funnel in Next.js project
  Email sequences: go through EMAIL_OUTREACH_WORKFLOW individually
```

---

## Funnel Priority Queue

| Lane | Funnel | Priority | Status |
|------|--------|---------|--------|
| first_keys_indy | DPA Eligibility Funnel | HIGH | Site live, needs email platform |
| music_theory_secrets | Book Sales Funnel | HIGH | PLANNED |
| colvin_enterprises | AI Audit Funnel | MEDIUM | PLANNED |
| funding_ready_indiana | Grant Checklist Funnel | MEDIUM | PLANNED |

---

## Integration Status

PLANNED — Phase 4. First Keys Indy funnel is highest priority given live site.
