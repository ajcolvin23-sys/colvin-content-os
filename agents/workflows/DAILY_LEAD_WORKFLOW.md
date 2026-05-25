# Daily Lead Workflow — Colvin Content OS

Full daily lead generation pipeline. Every stage logged to Supabase with run_id and trace_id.

---

## Trigger

Daily cron: 7 AM ET (`0 7 * * *`)
Also: Manually triggered by Alfred or Hermes on-demand

---

## Workflow Stages

```
Stage 1: Pre-flight
  Agent: Hermes
  Action: Generate run_id, verify health checks passed, load gabriel-config.json
  Output: run_id + active lane list
  On fail: Abort workflow, alert Alfred

Stage 2: Niche Research (per active lane)
  Agent: Research Agent via Firecrawl MCP
  Action: Research target niche for each lane — what's happening this week?
  Output: Research brief per lane (sources, context, timing signals)
  Runs in: Parallel per lane

Stage 3: Lead Finding (per active lane)
  Agent: Lead Finder Agent
  Input: Lane playbook + research brief
  Action: Scrape approved public sources for new leads
  Output: Raw lead records (lead.schema.json)
  Runs in: Sequential per source within each lane

Stage 4: Source Verification
  Agent: Source Verification Policy check (within Lead Finder)
  Action: Verify robots.txt, public data status, URL reachability
  Output: provenance object populated for each lead

Stage 5: Schema Validation
  Agent: Schema validator
  Action: Validate each lead against lead.schema.json
  Output: Valid records proceed; invalid records quarantined + logged

Stage 6: Deduplication
  Agent: Lead Deduplication
  Action: Check idempotency keys, email, company+name against existing CRM
  Output: New leads (proceed) vs duplicates (skip gracefully)

Stage 7: Lead Enrichment
  Agent: Lead Enrichment Agent
  Action: Enrich new leads with website, title verification, outreach angle
  Output: Enriched lead records (status: 'enriched')

Stage 8: Lead Scoring
  Agent: Lead Scoring (rule-based)
  Input: Enriched lead
  Action: Apply 4-dimension scoring formula
  Output: qualification_score + fit_reason per lead

Stage 9: Lead Categorization
  Action: Route leads by score
  - Score 7+: status → 'in_outreach_queue'
  - Score 5-6: status → 'scored' (monitor)
  - Score <5: status → 'archived'

Stage 10: Outreach Draft Generation
  Agent: Email Copy Agent
  Input: All leads in 'in_outreach_queue' (up to 5 per lane per day)
  Action: Generate personalized outreach draft + 3 subject line options
  Output: outreach.schema.json records (status: 'draft')

Stage 11: Compliance Check
  Agent: Compliance check
  Action: Run compliance check on all outreach drafts
  Output: compliance_flags per draft

Stage 12: Review Queue Submission
  Agent: Human Review Gateway
  Action: Create review_ticket for each outreach draft
  Output: review_tickets in Supabase (status: 'pending')

Stage 13: Alfred Notification
  Agent: Hermes → Telegram
  Action: Send Telegram summary to Alfred
  Message: "Lead run complete: X new leads found, Y in outreach queue, Z drafts ready for review"

Stage 14: Logging
  Agent: Hermes
  Action: Write workflow completion record to workflow_runs
  Output: Final workflow_run record (status: 'completed')
```

---

## Error Handling

Each stage uses the error taxonomy from ERROR_HANDLING_POLICY.md.
Failed stages do not abort the entire workflow — parallel lanes continue.
If a critical stage (dedup, schema validation) fails: log and skip that lead batch. Do not insert bad data.

---

## Daily Volume Targets

| Lane | Target Leads/Day | Max Outreach Drafts |
|------|-----------------|---------------------|
| indiana_backflow_directory | 5-10 | 3 |
| colvin_enterprises | 3-6 | 3 |
| music_theory_secrets | 5-10 | 3 |
| funding_ready_indiana | 3-5 | 2 |
| first_keys_indy | 0 (inbound only) | 0 |
| glory_engine | 2-5 | 2 |

---

## Integration Status

IMPLEMENTED (partial): automation-os/ has lead generation foundation
PLANNED: Full staged pipeline with durable state, schema validation, dedup
