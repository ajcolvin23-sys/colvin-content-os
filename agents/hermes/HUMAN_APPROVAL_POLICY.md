# Human Approval Policy — Colvin Content OS

**Principle:** Alfred Colvin approves every external action. No automation sends, publishes, or renders without explicit approval.

---

## What Always Requires Approval

| Action | Approval Required | Escalation Level |
|--------|-----------------|-----------------|
| Send any outreach message | Alfred — always | — |
| Publish any social media post | Alfred — always | — |
| Send any email | Alfred — always | — |
| Trigger any Remotion render | Alfred — always | — |
| Publish any funnel or landing page | Alfred — always | — |
| Apply any system configuration change | Alfred — always | — |
| Export any lead data to external tool | Alfred — always | — |
| Send any bulk message | Alfred — always | Escalated to review |

---

## Approval Queue Management

**Location:** Supabase `review_tickets` table + Content OS dashboard at `/dashboard/review`

**Item ordering:**
1. `severity: block` compliance flags — top of queue
2. Priority score descending
3. `created_at` ascending (older items first within same priority)

**Queue depth alerts:**
- > 20 items: Telegram alert to Alfred
- > 50 items: Pause new draft generation, P2 incident
- > 100 items: P1 incident, immediate escalation

---

## Approval Timeouts

| Item Type | Soft Timeout | Hard Timeout | Action on Expiry |
|-----------|-------------|-------------|-----------------|
| Standard content | 24 hours | 48 hours | Status → expired, Telegram alert |
| Outreach drafts | 24 hours | 72 hours | Status → expired, lead not contacted |
| P1 incident requiring approval | 15 minutes | 30 minutes | Escalate, send second alert |
| Compliance-blocked item | No timeout | No timeout | Must be manually resolved |
| Video blueprint | 48 hours | 7 days | Status → expired, re-queue if needed |

---

## Escalation Rules

**Level 1 — Standard Review:**
- Item in review queue
- Telegram summary sent to Alfred
- Alfred approves/rejects via dashboard

**Level 2 — Priority Alert:**
- Any item with `severity: block` compliance flag
- Telegram message marked URGENT
- Includes specific compliance issue summary

**Level 3 — Immediate Interrupt:**
- P1 incident requiring human decision
- Security issue detected
- Repeated approval timeout (3+ times)
- Telegram message + formatted action request

---

## Approval Decision Processing

**On Approve:**
1. Set `status: approved` in review_tickets
2. Set related record status to `approved`
3. Log decision with timestamp
4. If outreach: move to outreach queue (Alfred sends manually)
5. If video: trigger Remotion render pipeline
6. If content: move to publishing queue (Alfred publishes)
7. Notify Alfred via Telegram: "Item ready: {subject}"

**On Reject:**
1. Set `status: rejected`
2. Log feedback
3. Archive related draft
4. Do not retry unless Alfred explicitly re-queues

**On Request Revision:**
1. Set `status: revision_requested`
2. Agent regenerates ONCE with Alfred's feedback as additional context
3. New draft goes back to review queue
4. If second draft also rejected: archive, do not try again

---

## Katrina Review Required Flag

When `katrina_required: true` in review_ticket:
- Alfred must personally review — no delegating to another process
- Auto-approve logic is disabled for this item
- Extra Telegram notification sent when this item is queued

Applied to:
- All First Keys Indy content (HUD/RESPA exposure)
- All Girls Got Game content (youth safety)
- All items with `severity: block` compliance flag
- Outreach to leads with score 9+
- Any system-level configuration change

---

## Approval Queue Dashboard Fields

Each item in the review queue displays:
1. Type badge (Outreach / Content / Video / Funnel / System)
2. Lane badge with color
3. Subject line
4. Priority score (color-coded: red >8, yellow 5-8, green <5)
5. Compliance flags (if any)
6. Context paragraph
7. Full draft text
8. Lead research summary (for outreach items)
9. Approve / Reject / Request Revision buttons
10. `created_at` timestamp + time-since

---

## Bulk Approval

Alfred can approve multiple items of the same type at once IF:
- All items have `severity: info` compliance flags only (no warnings or blocks)
- All items are for the same lane
- Alfred reviews at least the first 3 items manually before bulk-approving

Bulk approval must be initiated by Alfred — agents never bulk-approve.
