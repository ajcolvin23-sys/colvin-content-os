# Human Review Gateway — Colvin Content OS

The Human Review Gateway is the universal approval checkpoint. Nothing leaves the system without Alfred's sign-off.

---

## What Goes Into the Review Queue

| Item Type | Auto-queued? | Schema |
|-----------|-------------|--------|
| All outreach drafts | Yes — always | outreach.schema.json |
| All social media posts | Yes — always | content.schema.json |
| All email drafts | Yes — always | content.schema.json |
| All Remotion video blueprints | Yes — always | remotion_video.schema.json |
| All funnel/landing page copy | Yes — always | review_ticket.schema.json |
| System configuration changes | Yes — always | review_ticket.schema.json |
| Data export requests | Yes — always | review_ticket.schema.json |
| Compliance-flagged content | Yes + escalated | review_ticket.schema.json |
| New lead export to external tool | Yes — always | review_ticket.schema.json |

**No exceptions. Nothing is auto-sent, auto-published, or auto-rendered.**

---

## Queue Prioritization

Items are ordered in the review queue by:
1. `priority_score` (10 = urgent, 0 = low)
2. Compliance flags — any `severity: block` items float to top
3. `created_at` (older items rise if not reviewed)

Priority auto-assignment:
- Outreach with high fit_score lead (8+): priority 8
- Outreach with compliance flag: priority 9
- Video with `claims_check.risk_level: high`: priority 10
- First Keys Indy content (HUD risk): priority 9
- Girls Got Game content: priority 9
- Regular social posts: priority 5
- Content calendar items: priority 3

---

## Review Interface

**Current:** Content OS dashboard at `/dashboard/review` (Next.js route)
**Fallback:** Telegram bot review command (send ticket summary to Alfred's chat)

Each ticket shows:
1. Type and lane
2. Subject line
3. Full draft
4. Compliance flags (if any)
5. Context / research summary
6. Lead info (for outreach)
7. Approve / Reject / Request Revision buttons

---

## Alfred's Decision Options

| Decision | Action | System Response |
|----------|--------|----------------|
| Approve | Click approve | Status → `approved`, queued for execution |
| Reject | Click reject + optional feedback | Status → `rejected`, logged, not retried |
| Request Revision | Enter notes | Status → `revision_requested`, agent regenerates once |
| Escalate | Mark for deeper review | Status → `escalated`, Telegram alert |

---

## After Approval

- **Outreach approved:** Status set to `approved`. Alfred manually sends or triggers send (never auto-send).
- **Content approved:** Status set to `approved`. Scheduled or manually published.
- **Video blueprint approved:** Render pipeline triggered. Output goes through `REMOTION_RENDER_QA_AGENT`.
- **System change approved:** Applied by Hermes with audit log.

---

## Queue Overflow Handling

If review queue exceeds 50 items:
- Alert Alfred via Telegram: "Review queue has 50+ items. Please clear before new items are added."
- Pause new outreach draft generation
- Continue lead research and content drafting (does not require immediate review)
- Create P3 incident: `REVIEW_QUEUE_OVERFLOW`

---

## Timeout and Escalation

- Items not reviewed within 48 hours: status → `expired`, Alfred notified
- P1 incidents requiring review: 30-minute escalation via Telegram
- Compliance block items: never expire until manually resolved

---

## Katrina Escalation

"Katrina" in this system refers to Alfred (the user's Mac username is katrinacolvin but the user is Alfred Colvin). When `katrina_required: true`, it means Alfred must personally review — no delegation, no auto-approve.

This flag is set for:
- All First Keys Indy content (HUD risk)
- All Girls Got Game content (youth safety)
- Any compliance flag with `severity: block`
- Any outreach to a high-profile target (score 9+)
- Any system configuration change
