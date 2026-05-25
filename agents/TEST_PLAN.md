# Master Test Plan — Colvin Content OS

Complete testing strategy for all agents, schemas, and workflows.

---

## Test Categories

| Category | Files | What It Tests | When to Run |
|----------|-------|--------------|-------------|
| Unit | tests/UNIT_TEST_PLAN.md | Schema validation, lead scoring, dedup logic, compliance detection | Every PR |
| Integration | tests/INTEGRATION_TEST_PLAN.md | Live API connections, Supabase read/write, Telegram delivery | Before deployment |
| E2E | tests/E2E_TEST_PLAN.md | Full workflow runs (mock mode) | Weekly + before major deploys |
| Synthetic | tests/SYNTHETIC_TEST_PLAN.md | Production health pings every 30 minutes | Always-on in production |
| Adapter Smoke | tests/ADAPTER_SMOKE_TEST_PLAN.md | Quick adapter connectivity checks | After key rotation, after setup |
| Remotion Render | tests/REMOTION_RENDER_TEST_PLAN.md | Blueprint schema, component spec, render trigger, QA checklist | Before any render |

---

## Test Files by Priority

### Priority 1 — Run Before Every Deploy

| Test File | Key Assertions |
|-----------|---------------|
| `tests/unit/schema-validation.test.ts` | All 7 schemas validate correct examples, reject invalid |
| `tests/unit/lead-scoring.test.ts` | Scoring formula produces expected results for edge cases |
| `tests/unit/dedup-logic.test.ts` | Idempotency key generation, contact window enforcement |
| `tests/unit/character-limits.test.ts` | All platform limits enforced in Social Media Agent |
| `tests/unit/compliance-keywords.test.ts` | Spam words, HUD language, guarantee language detection |
| `tests/unit/idempotency-key.test.ts` | Key format matches pattern `^[a-z_]+_[a-z]+_[a-z0-9_]+_[0-9]{4}-[0-9]{2}-[0-9]{2}$` |

### Priority 2 — Run Weekly

| Test File | Key Assertions |
|-----------|---------------|
| `tests/unit/remotion-scene-durations.test.ts` | Scene durations sum to total video duration |
| `tests/unit/review-ticket-routing.test.ts` | Ticket type routes to correct priority bucket |
| `tests/unit/brand-voice-lane-rules.test.ts` | Per-lane voice rules applied correctly |

### Priority 3 — Run Before Major Deploys

| Test File | Key Assertions |
|-----------|---------------|
| `tests/integration/supabase-write-read.test.ts` | Full round-trip: write lead, read back, dedup check |
| `tests/integration/openai-connection.test.ts` | Models endpoint responds, GPT-4o and GPT-4o-mini available |
| `tests/integration/telegram-delivery.test.ts` | Test message reaches Alfred's Telegram |
| `tests/integration/firecrawl-scrape.test.ts` | example.com scrape returns markdown |
| `tests/integration/gabriel-config-load.test.ts` | gabriel-config.json loads without error |
| `tests/integration/review-queue-create.test.ts` | review_ticket inserts to Supabase correctly |

---

## Schema Test Matrix

Every schema must have tests for:
- Valid example passes validation
- Missing required field fails
- Invalid enum value fails
- `additionalProperties` violation fails
- Pattern mismatch (idempotency_key, ISO dates) fails

| Schema | Valid Example Location |
|--------|----------------------|
| lead.schema.json | tests/fixtures/valid-lead.json |
| content.schema.json | tests/fixtures/valid-content.json |
| remotion_video.schema.json | tests/fixtures/valid-remotion-video.json |
| outreach.schema.json | tests/fixtures/valid-outreach.json |
| workflow_run.schema.json | tests/fixtures/valid-workflow-run.json |
| review_ticket.schema.json | tests/fixtures/valid-review-ticket.json |
| incident.schema.json | tests/fixtures/valid-incident.json |

---

## E2E Test Scenarios

| Scenario | Mock Strategy | Pass Condition |
|----------|--------------|----------------|
| Full Gabriel daily run | Mock Firecrawl (static HTML), mock OpenAI (fixture responses) | run_id created, stages 1-15 complete, review tickets created |
| Full Remotion blueprint | Mock Firecrawl, mock OpenAI | Valid blueprint JSON passes schema validation |
| Full lead flow | Mock Firecrawl, mock OpenAI | Lead created → enriched → scored → in outreach queue |

---

## Synthetic Test Schedule (Production)

| Test | Frequency | Alert Threshold |
|------|-----------|-----------------|
| Supabase ping | Every 30 min | 2 consecutive failures = P2 |
| OpenAI models endpoint | Every 30 min | 2 consecutive failures = P2 |
| Telegram getMe | Every 30 min | 2 consecutive failures = P2 |
| gabriel-config.json loadable | Every 30 min | 1 failure = P2 |
| Review queue depth | Every 30 min | > 50 tickets = P2 |
| Last Gabriel daily run | Every 30 min | > 25 hours ago = P2 |

---

## Running Tests

```bash
# All unit tests
npm run test:unit

# All integration tests (requires live credentials)
npm run test:integration

# E2E tests (mock mode)
npm run test:e2e

# Adapter smoke tests
npm run test:adapters

# Remotion-specific tests
npm run test:remotion

# Full test suite
npm test

# Schema check only
npm run test:schemas
```

---

## Test Environment Variables

Tests that hit live APIs require:
```
OPENAI_API_KEY
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
TELEGRAM_BOT_TOKEN
FIRECRAWL_API_KEY
REMOTION_MCP_URL
```

Use `.env.test` for test-specific overrides. Never commit `.env.test`.

---

## CI Integration

On every pull request:
1. Run `npm run test:unit` — must pass
2. Run `npm run test:schemas` — must pass
3. On merge to main: run `npm run test:integration`

---

## Integration Status

PLANNED — Test files to be created in Phase 1. Unit tests for schemas should be first.
See individual test plan files in tests/ for detailed specs.
