# End-to-End Test Plan — Colvin Content OS

End-to-end tests covering complete workflows from trigger to output. Use mock data to avoid real API costs.

---

## E2E Test 1: Full Gabriel Daily Run (Mock Data)

**File:** `tests/e2e/gabriel-daily-run.test.ts`
**What it tests:** The full 15-step Gabriel daily run with mocked external calls

**Setup:**
- Mock Firecrawl responses (pre-scraped fixture data)
- Mock OpenAI responses (fixture completions)
- Use test Supabase project or in-memory mock
- Real Supabase for idempotency checks (or mock)

**Flow:**
1. Trigger daily run workflow with `source: 'e2e_test'`
2. Verify each stage completes in order
3. Verify leads are created in Supabase (or mock)
4. Verify content drafts are created
5. Verify review tickets are created
6. Verify Telegram notification is triggered (mocked)
7. Verify run_id is consistent across all workflow_run records
8. Verify no duplicate inserts (idempotency)

**Expected outcome:** 15/15 stages complete, review tickets created, no errors.

---

## E2E Test 2: Full Remotion Video Generation (to JSON Blueprint)

**File:** `tests/e2e/remotion-blueprint.test.ts`
**What it tests:** Concept to schema-valid JSON blueprint

**Flow:**
1. Provide campaign brief: `{lane: 'music_theory_secrets', platform: 'tiktok', goal: 'education'}`
2. Generate script (mocked OpenAI)
3. Plan scenes
4. Generate captions
5. Build asset manifest
6. Assemble full blueprint
7. Validate against `remotion_video.schema.json`
8. Verify all required fields present
9. Verify `approval_required: true`
10. Verify `render_status: 'draft'`
11. Verify `claims_check` is populated

**Expected outcome:** Schema-valid blueprint with all 14+ required fields.

---

## E2E Test 3: Full Lead Flow (Find → Score → Queue → Approve → Mark Sent)

**File:** `tests/e2e/lead-flow.test.ts`
**What it tests:** Complete lead lifecycle

**Flow:**
1. Lead Finder returns 1 test lead (mocked Firecrawl response)
2. Enrich lead (mocked OpenAI enrichment)
3. Score lead (real scoring formula)
4. Verify score in expected range for ICP
5. Dedup check (not in database → passes)
6. Insert to Supabase (test table or mock)
7. Generate outreach draft (mocked OpenAI)
8. Compliance check runs (real logic)
9. Review ticket created
10. Simulate Alfred approval (update ticket status)
11. Update lead.status → 'contacted'
12. Set contact_window_expires_at
13. Verify 30-day window prevents re-contact

**Expected outcome:** Lead flows through all stages, idempotency enforced, contact window set.

---

## E2E Test Environment Setup

```bash
# Install test dependencies
npm install -D vitest @vitest/coverage-v8

# Create test env file
cp .env.local .env.test
# Edit .env.test: point to test Supabase project or use mocks

# Run E2E tests
npm run test:e2e
```

---

## Mock Strategy

| External Service | Mock Approach |
|-----------------|--------------|
| OpenAI | Pre-recorded fixture responses (JSON files) |
| Firecrawl | Pre-scraped fixture HTML/JSON |
| Supabase | Test schema prefix (e.g., `test_leads`) or in-memory |
| Telegram | Mock send function that logs to console |
| Remotion MCP | Mock render trigger that returns test job ID |

---

## Integration Status

PLANNED — Phase 5.
