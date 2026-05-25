# Email Outreach Workflow — Colvin Content OS

Full workflow from approved leads to personalized email drafts in Alfred's review queue.

---

## Trigger

Triggered by: DAILY_LEAD_WORKFLOW completing with leads in 'in_outreach_queue' status.
Also: Manual trigger by Alfred for specific leads.

---

## Workflow Stages

```
Stage 1: Lead Selection
  Agent: Hermes
  Action: Query leads WHERE status = 'in_outreach_queue' AND contact_window not expired
  Sort by: qualification_score DESC
  Limit: 3-5 per lane per day (prevent queue flooding)
  Output: Lead batch for this run

Stage 2: Research Per Lead
  Agent: Research Agent
  Input: Lead record (name, company, title, source_url, outreach_angle)
  Action: Enrich research context:
    - Visit company website via Firecrawl
    - Pull relevant recent news if available
    - Confirm role and decision-maker status
    - Strengthen or refine outreach_angle
  Output: Research brief per lead

Stage 3: Sequence Determination
  Agent: Outbound Sequence Agent
  Input: Lead + lane
  Action: Determine which sequence applies, which step this is
  Check: Is there an existing sequence for this lead? What step is next?
  Output: Sequence ID + step number

Stage 4: Email Draft Generation
  Agent: Email Copy Agent
  Input: Lead + Research brief + Sequence template + Brand voice (per lane)
  Action: Generate personalized email body + 3 subject line options + preview text
  Output: outreach.schema.json record (status: 'draft')

Stage 5: Compliance Check
  Agent: Compliance check
  Input: Email draft + subject lines
  Actions:
    - CAN-SPAM check (unsubscribe mechanism, physical address)
    - Spam word scan on subject lines
    - First Keys Indy HUD check (if applicable)
    - Anti-hallucination pass on any factual claims
  Output: compliance_flags on draft record

Stage 6: Idempotency Check
  Agent: Lead Deduplication
  Action: Check if outreach draft already exists for this lead + step + date
  If duplicate: skip gracefully, log
  Output: Confirmed-new draft proceeds

Stage 7: Review Queue Submission
  Agent: Human Review Gateway
  Action: Create review_ticket (type: outreach)
  Include: Lead research summary, outreach angle, sequence context
  Output: review_ticket in Supabase (status: pending)

Stage 8: Alfred Notification
  Agent: Hermes → Telegram
  Message: "[X] outreach drafts ready for review. Top lead: [Name, Company, Score]"
  
-- After Alfred Approves: --

Stage 9: Send Decision
  NOTE: Alfred sends the email manually. The system tracks:
    - approval timestamp
    - selected subject line
    - sent_at timestamp (Alfred enters after sending)
    - contact_window_expires_at = now() + 30 days
    - lead.status → 'contacted'
    - sequence state updated to next step

Stage 10: Follow-Up Scheduling
  Agent: Outbound Sequence Agent
  Action: Schedule next sequence step based on advancement rules
    - Step 2: Earliest 3 business days after step 1 sent
    - Step 3: Earliest 5 business days after step 2 sent
  Output: Next step draft queued (after appropriate time elapses)
```

---

## Volume Controls

- Max 3-5 new drafts per lane per day in outreach workflow
- Max 1 draft per lead per day
- Total daily outreach drafts across all lanes: max 15

---

## Integration Status

PLANNED — Phase 4. Depends on: Email Copy Agent, Outbound Sequence Agent, lead records in Supabase.
