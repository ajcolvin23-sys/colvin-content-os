# Integration Test Plan — Colvin Content OS

Integration tests that verify real system connections and cross-component behavior.

---

## Important Notes

- Integration tests require real API credentials (use `.env.test` or `.env.local`)
- Do NOT run against production database — use a test Supabase project or test schema
- Rate-limit conscious: do not run these in tight loops
- Mark with `@integration` tag so they can be excluded from CI if needed

---

## Test 1: Supabase Read/Write

**File:** `tests/integration/supabase.test.ts`
**What it tests:**
- Connect to Supabase project `iuzlbtfevzkerehmluqj`
- INSERT a test lead record
- SELECT it back and verify fields match
- UPDATE the lead status
- DELETE the test record
- Verify RLS doesn't block service role key

```typescript
test('Can insert and retrieve a lead record', async () => {
  const testLead = { ...validLeadFixture, idempotency_key: 'test_' + Date.now() };
  const { data: inserted } = await supabase.from('leads').insert(testLead).select().single();
  expect(inserted.id).toBeDefined();
  expect(inserted.lane).toBe(testLead.lane);
  // Cleanup
  await supabase.from('leads').delete().eq('id', inserted.id);
});
```

---

## Test 2: OpenAI API Call

**File:** `tests/integration/openai.test.ts`
**What it tests:**
- Basic completion call succeeds
- Response is a non-empty string
- Model specified in call matches expected

```typescript
test('OpenAI returns a non-empty completion', async () => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Reply with: "test ok"' }],
    max_tokens: 10
  });
  expect(response.choices[0].message.content).toContain('test ok');
});
```

---

## Test 3: Telegram Send (to test chat)

**File:** `tests/integration/telegram.test.ts`
**What it tests:**
- Bot can send a message to configured chat
- Message appears in expected format

```typescript
test('Telegram bot can send a message', async () => {
  const response = await sendTelegram('Integration test: ping ' + Date.now());
  expect(response.ok).toBe(true);
});
```

**Note:** Use a test Telegram chat that's separate from Alfred's main chat.

---

## Test 4: Firecrawl Scrape (Test URL)

**File:** `tests/integration/firecrawl.test.ts`
**What it tests:**
- Firecrawl MCP can scrape `https://example.com` (reliable test URL)
- Returns content with expected elements
- robots.txt compliance (example.com allows scraping)

---

## Test 5: gabriel-config.json Load

**File:** `tests/integration/gabriel-config.test.ts`
**What it tests:**
- File loads without JSON parse error
- Required fields present: lanes, activeWorkflows, brandVoice
- No active lane references missing brandVoice entry

---

## Test 6: Review Queue Insert/Read

**File:** `tests/integration/review-queue.test.ts`
**What it tests:**
- Insert a test review_ticket
- Query pending tickets
- Verify sorting by priority_score
- Update ticket status to 'approved'
- Cleanup test record

---

## Running Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run specific integration test
npx vitest run tests/integration/supabase.test.ts

# Skip integration tests (CI without credentials)
npx vitest run --exclude tests/integration/
```

---

## Integration Status

PLANNED — Phase 5. Test infrastructure (Vitest/Jest) setup required.
