# Memory and Context Policy — Colvin Content OS

The system uses 4 memory layers. Each has different scope, persistence, and access patterns.

---

## Layer 1: Short-Term Session Memory (Current Run State)

**Purpose:** Track the state of the current workflow execution.
**Persistence:** Lives in Supabase workflow_runs for the duration of the run. Purged after 90 days.
**Contents:**
- `run_id` — root span for this execution
- `current_stage` — last completed stage
- `stage_outputs` — sanitized output snapshots per stage (for replay)
- `retry_count` — per stage
- `blocked_at` — when approval gate was triggered
- `lane` — which lane this run serves

**How agents access it:**
- Query Supabase `workflow_runs` WHERE `run_id = ?` to resume
- Hermes loads run context at the start of each stage

**Eviction:**
- Runs older than 90 days purged by CRM_HYGIENE_AGENT
- Sensitive output snapshots masked before storage (see LOGGING_MASKING_RULES.md)

---

## Layer 2: Long-Term Semantic Memory (Brands, Offers, Audience)

**Purpose:** Persistent knowledge about Alfred's businesses, brand voice, and audiences.
**Persistence:** Stored in `automation-os/config/gabriel-config.json` and supplemented by `/agents/gabriel/GABRIEL_BRAND_MEMORY_POLICY.md`.
**Contents:**
- Brand voice per lane
- Approved messaging and offers per lane
- Target audience profiles per lane
- Past campaign performance learnings
- Approved hashtag sets and CTA phrases
- Product/service details (book title, price, URL, etc.)

**How agents access it:**
- Load from gabriel-config.json at workflow start
- Reference GABRIEL_BRAND_MEMORY_POLICY.md for voice guidelines
- Content agents prepend brand context to every LLM prompt

**Updates:**
- Alfred updates gabriel-config.json via Colvin Content OS dashboard or manual edit
- Significant updates (new offer, new lane activation) create a Telegram notification

---

## Layer 3: Provenance Memory (Source and Confidence Tracking)

**Purpose:** Track where every data point came from. Prevent hallucinated sources from propagating.
**Persistence:** Stored in `provenance` objects within lead, content, and workflow_run records.
**Contents:**
- `source_url` — original URL
- `scraped_at` — when data was collected
- `extractor_version` — which agent/version extracted it
- `confidence` — 0-1 confidence score
- `robots_txt_checked` — scraping compliance flag
- `is_public_data` — public vs private source flag

**How agents use it:**
- Every lead insert must include provenance
- Research Agent assigns confidence tier to every source
- Content with unverified statistical claims must flag `confidence < 0.7`
- Downstream agents inherit and can reduce (never inflate) confidence scores

**Validation:**
- `provenance` is required in lead.schema.json
- Missing provenance = schema validation failure = lead quarantined

---

## Layer 4: Operational Memory (Runs, Retries, Incidents in Supabase)

**Purpose:** Durable audit trail for all system operations.
**Persistence:** Supabase tables — permanent until retention policy purges.
**Tables:**
- `workflow_runs` — all run records per stage
- `incidents` — all incident records
- `review_tickets` — all items sent to Alfred for review
- `leads` — all lead records
- `content` — all generated content
- `outreach` — all outreach drafts

**How agents access it:**
- Via Supabase client with service role key (server-side only)
- Hermes queries these tables to reconstruct run context on resume/replay
- Admin QA Agent queries these tables for weekly audits

**Key operational queries:**
```sql
-- Resume a failed run
SELECT * FROM workflow_runs WHERE run_id = ? ORDER BY created_at;

-- Find all pending review items
SELECT * FROM review_tickets WHERE status = 'pending' ORDER BY priority_score DESC;

-- Check 30-day contact window
SELECT * FROM leads WHERE id = ? AND contact_window_expires_at > now();

-- Missed run detection
SELECT workflow_name, MAX(created_at) as last_run 
FROM workflow_runs 
WHERE status = 'completed' 
GROUP BY workflow_name;
```

---

## Cross-Layer Coherence

- Long-term semantic memory (Layer 2) must be consistent with operational records (Layer 4)
- If a brand element changes in gabriel-config.json, existing approved content is not retroactively changed
- Provenance memory (Layer 3) is immutable — never update source attribution after insertion
- Session memory (Layer 1) is ephemeral — do not use for long-term decisions
