# Outbound Sequence Agent — Colvin Content OS

Multi-touch outreach sequences. Sequence state management. Step advancement rules. Unsubscribe handling.

---

## Sequence Structure

Every lane has a defined sequence (see FOLLOW_UP_SEQUENCE_TEMPLATES.md). The Outbound Sequence Agent manages the state of each lead's progression through the sequence.

---

## Step Advancement Rules

**Rule 1: Never advance without Alfred's approval.**
Each step in a sequence must be individually approved before sending. The agent generates the next step in advance, but it sits in the review queue until Alfred approves.

**Rule 2: Time-based advancement.**
After each contact attempt:
- Follow-up 1: Minimum 3 business days after initial email
- Follow-up 2: Minimum 5 business days after follow-up 1
- No contact after follow-up 2 (unless lead responds — then Alfred handles personally)

**Rule 3: Contact window enforcement.**
See LEAD_DEDUPLICATION_RULES.md. 30-day window applies globally.

**Rule 4: No ghost follow-ups.**
Do not generate follow-up emails unless the previous step has a confirmed sent timestamp. "I'm following up on my previous email" requires that a previous email was actually sent.

---

## Sequence State Per Lead

```json
{
  "lead_id": "uuid",
  "sequence_id": "colvin_enterprises_3touch",
  "lane": "colvin_enterprises",
  "steps": [
    {
      "step": 1,
      "type": "linkedin_connection",
      "status": "approved",
      "sent_at": "2025-01-10T09:00:00Z"
    },
    {
      "step": 2,
      "type": "email",
      "status": "draft",
      "earliest_send_date": "2025-01-13",
      "draft_id": "uuid"
    },
    {
      "step": 3,
      "type": "email",
      "status": "pending",
      "earliest_send_date": null
    }
  ],
  "current_step": 2,
  "sequence_status": "active",
  "last_contact_at": "2025-01-10T09:00:00Z"
}
```

---

## Unsubscribe Handling

When a lead says "unsubscribe" or "stop emailing me" or equivalent:
1. **Immediately** set `lead.status = 'do_not_contact'`
2. Set `contact_window_expires_at = never` (permanent)
3. Cancel all pending steps in their sequence
4. Archive all review queue items for this lead
5. Log the unsubscribe event in workflow_runs
6. Notify Alfred via Telegram: "Unsubscribe received from [company name]"
7. Never contact this lead again under any circumstances

---

## Sequence Templates Available

See FOLLOW_UP_SEQUENCE_TEMPLATES.md:
- Colvin Enterprises 3-touch (LinkedIn + 2 emails)
- First Keys Indy 5-touch welcome sequence
- Music Theory Secrets 5-email book launch sequence

---

## Sequence Pausing

A sequence is automatically paused when:
- Lead's `contact_window_expires_at` has not passed
- Review queue for this lead is full (> 2 pending items)
- Lead responds (even if just "not now") — Alfred reviews and decides to continue or stop
- `do_not_contact` status set

A paused sequence resumes only when Alfred manually un-pauses it.

---

## Integration Status

PLANNED — Phase 4. Depends on: Email Copy Agent, Lead records, FOLLOW_UP_SEQUENCE_TEMPLATES.md.
