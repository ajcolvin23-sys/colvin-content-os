# Human Approval Queue — Colvin Content OS

Every agent output that could affect the outside world — sending messages, publishing content, rendering video, or modifying system config — must pass through Alfred's approval queue before execution.

---

## Prime Directive

**Nothing auto-sends. Nothing auto-publishes. Nothing auto-renders.**

The approval queue is the bridge between the system's outputs and the real world.

---

## What Enters the Queue

| Item Type | Agent That Creates It | Alfred Action Required |
|-----------|----------------------|----------------------|
| Outreach email draft | Email Copy Agent | Review + approve → Alfred sends manually |
| LinkedIn connection request draft | Outreach Agent | Review + approve → Alfred sends manually |
| Social media post draft | Social Media Agent | Review + approve → Alfred publishes manually |
| Video concept brief | Gabriel Remotion Studio | Review + approve concept → triggers blueprint workflow |
| Remotion video blueprint | Remotion Video Agent | Review + approve → triggers render |
| Funnel landing page copy | Landing Page Copy Agent | Review + approve → deploy manually |
| Email nurture sequence | Nurture Sequence Agent | Review + approve → activate in email platform manually |
| System Improvement Proposal (SIP) | Weekly Optimization Workflow | Review + approve → Hermes applies config change |
| Lead export request | CRM Hygiene Agent | Alfred confirms before any CSV export |
| Incident recovery action | Incident Recovery Workflow | Alfred confirms recovery path |

---

## Review Ticket Schema

Every item in the queue is a `review_ticket` record in Supabase. See `schemas/review_ticket.schema.json`.

Key fields:
- `ticket_id` — UUID
- `type` — outreach | content | remotion_video | funnel | email_sequence | system_change | lead_export | render_approval
- `lane` — which business lane this belongs to
- `priority_score` — 0-10, higher = review first
- `status` — pending | approved | rejected | revision_requested | expired
- `auto_approve_eligible` — always false (nothing auto-approves)
- `alfred_decision` — populated after Alfred acts
- `compliance_flags` — any compliance issues flagged by Compliance Check Agent

---

## Review Dashboard

**Location:** `/app/review` (Phase 1 build target)

Alfred reviews the queue here. Each ticket shows:
- Item type and lane
- Priority score
- Content summary (lead research, outreach angle, post draft, video concept)
- Compliance flags (if any)
- Approve / Reject / Request Revision buttons

Telegram notification sent when new items enter the queue.

---

## Priority Scoring

Queue is sorted by `priority_score` descending. Alfred reviews highest priority first.

| Score | Description | Examples |
|-------|-------------|---------|
| 9-10 | Urgent — compliance flag or high-value lead | Outreach to hot lead, content with compliance concern |
| 7-8 | High — strong lead or strong content | Qualified lead, viral hook post |
| 5-6 | Medium — standard queue item | Average lead, routine social post |
| 3-4 | Low — informational or speculative | Low-score lead, experimental content |
| 1-2 | Minimal — background optimization | SIP with minor config change |

---

## Queue Overflow Rule

If more than 50 items accumulate in the queue with status `pending`:
1. Hermes creates a P2 incident
2. Alert sent to Alfred via Telegram: "Review queue overflow: [N] items pending. Oldest item: [X hours old]."
3. Hermes pauses new draft generation for non-critical lanes until queue is below 30

---

## Timeout and Escalation

| Item Type | Review Window | Timeout Action |
|-----------|--------------|----------------|
| Outreach draft | 24 hours | Contact window begins expiring — alert Alfred |
| Social post (time-sensitive) | 4 hours | Escalate to Telegram alert |
| Social post (evergreen) | 72 hours | No action — stays in queue |
| Remotion blueprint | 48 hours | Alert Alfred — render window may close |
| Funnel copy | 7 days | No action — stays in queue |
| SIP | 7 days | Hermes flags as stale |
| Incident recovery | 2 hours | Escalate to P1 if unacknowledged |

---

## Alfred's Approval Options

| Decision | Meaning | System Action |
|---------|---------|--------------|
| Approve | Send / publish / render as-is | Ticket status → approved. Alfred executes manually OR render fires (if Remotion). |
| Approve with edits | Minor changes needed | Alfred edits inline, then approves. Ticket records final version. |
| Reject | Do not send/publish/render | Ticket status → rejected. Feedback logged for agent learning. |
| Request revision | More research or rewrite needed | Ticket status → revision_requested. Agent receives feedback and regenerates. |
| Escalate | Needs Katrina-level review | Ticket status → escalated. Reserved for compliance-sensitive content. |

---

## Katrina Escalation

"Katrina" is Alfred's governance review layer (Alfred's own review persona for high-stakes content).

Auto-escalate when:
- Any content for First Keys Indy lane (HUD/RESPA sensitivity)
- Any content mentioning grants, nonprofit, or donor solicitation
- Any content for Girls Got Game (youth safety)
- Any system architecture change (SIP type = infrastructure)
- Any outreach that references legal, financial, or medical advice

Katrina verdict: `APPROVED` | `APPROVED WITH REVISIONS` | `NOT APPROVED — RETURN TO SENDER`

---

## Approval via Telegram

For time-sensitive items, Alfred can approve directly from Telegram:
- Bot sends: "[REVIEW] [Type]: [Summary]. Reply APPROVE or REJECT."
- Alfred replies: `APPROVE` or `REJECT [optional feedback]`
- Hermes processes reply and updates ticket status

> Telegram approval is for simple approve/reject only. Items requiring revision go to the dashboard.

---

## Never Auto-Approve

`auto_approve_eligible` is always `false` in production. There is no path through the system that sends, publishes, or renders without Alfred's explicit action.

This is not a setting that can be changed by any agent. It requires Alfred to modify the code directly.

---

## Integration Status

PLANNED — Phase 1. Review dashboard at `/app/review` and Supabase `review_tickets` table.
Current: Drafts are generated but review queue UI not yet built.
