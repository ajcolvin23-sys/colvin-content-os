# Synthetic Tests — Colvin Content OS

Smoke tests that run after each deploy and every 30 minutes in production.

---

## When Synthetic Tests Run

1. **After every Vercel deploy** (deploy hook)
2. **Every 30 minutes** (part of SYSTEM_HEALTH_CHECK_AGENT)
3. **Before any critical workflow** (Hermes pre-flight check)
4. **Manually** (`npm run test:synthetic`)

---

## Test Suite

### Test 1: Supabase Connectivity
```typescript
test('Supabase is reachable and responds within 2 seconds', async () => {
  const start = Date.now();
  const { data, error } = await supabase.from('workflow_runs').select('id').limit(1);
  const duration = Date.now() - start;
  expect(error).toBeNull();
  expect(duration).toBeLessThan(2000);
});
```

### Test 2: OpenAI API Ping
```typescript
test('OpenAI API is reachable', async () => {
  const response = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }
  });
  expect(response.status).toBe(200);
});
```

### Test 3: Telegram Bot Ping
```typescript
test('Telegram bot is active', async () => {
  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`
  );
  const json = await response.json();
  expect(json.ok).toBe(true);
});
```

### Test 4: gabriel-config.json Loads
```typescript
test('gabriel-config.json is valid and loads', async () => {
  const config = await import('../automation-os/config/gabriel-config.json');
  expect(config).toBeDefined();
  expect(config.lanes).toBeDefined();
  expect(Array.isArray(config.lanes) || typeof config.lanes === 'object').toBe(true);
});
```

### Test 5: All Schema Files Are Valid JSON
```typescript
const schemas = [
  'lead', 'content', 'remotion_video', 'outreach', 
  'workflow_run', 'review_ticket', 'incident'
];

schemas.forEach(schema => {
  test(`${schema}.schema.json is valid JSON`, () => {
    expect(() => require(`../agents/schemas/${schema}.schema.json`)).not.toThrow();
  });
});
```

### Test 6: Lead Scoring Formula Returns Expected Output
```typescript
test('Lead scoring formula returns score in range 0-10', () => {
  const mockLead = {
    lane: 'colvin_enterprises',
    city: 'Indianapolis',
    state: 'Indiana',
    title: 'Owner',
    email: 'test@example.com'
  };
  const score = calculateLeadScore(mockLead);
  expect(score).toBeGreaterThanOrEqual(0);
  expect(score).toBeLessThanOrEqual(10);
});
```

### Test 7: Idempotency Key Format Validation
```typescript
test('Idempotency key generator returns valid format', () => {
  const key = buildIdempotencyKey('indiana_backflow_directory', 'lead', 'test_company', '2025-01-15');
  expect(key).toMatch(/^[a-z_]+_lead_[a-z0-9_]+_[0-9]{4}-[0-9]{2}-[0-9]{2}$/);
});
```

---

## Synthetic Test Results

Results stored in Supabase `system_health` table:
```json
{
  "check_type": "synthetic_test",
  "timestamp": "ISO 8601",
  "tests_passed": 7,
  "tests_failed": 0,
  "test_results": [
    { "test": "supabase_connectivity", "status": "pass", "latency_ms": 45 },
    { "test": "openai_ping", "status": "pass", "latency_ms": 312 }
  ]
}
```

If any test fails: P2 incident created + Telegram alert.

---

## Running Locally

```bash
npm run test:synthetic
# or
npx jest --testPathPattern=synthetic
```

---

## Integration Status

PLANNED — Phase 5. Jest or Vitest testing setup required.
