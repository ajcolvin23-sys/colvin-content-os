# Adapter Smoke Test Plan — Colvin Content OS

Smoke tests for every external adapter. Run before trusting a new deployment.

---

## What Is an Adapter Smoke Test?

A smoke test verifies the basic connection and response from an external service. It doesn't test every feature — just "is this working at all?"

Run: `npm run test:adapters`

---

## Adapter: Firecrawl MCP

```
Test URL: https://example.com
Expected: Returns page content with <title> element
Pass criteria: Content returned within 10 seconds, no error
```

```bash
# Manual test
curl -X POST https://api.firecrawl.dev/v1/scrape \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "formats": ["markdown"]}'
```

---

## Adapter: Playwright MCP

```
Test: Launch browser, navigate to https://example.com, get page title
Expected: Title is "Example Domain"
Pass criteria: Success within 15 seconds
```

```typescript
// Playwright test
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('https://example.com');
const title = await page.title();
assert(title === 'Example Domain');
await browser.close();
```

---

## Adapter: Remotion MCP

```
Test: List available compositions
Expected: Returns array (may be empty if no compositions set up)
Pass criteria: No connection error, valid JSON response
```

```bash
curl $REMOTION_MCP_URL/compositions
# Expect: { compositions: [] } or { compositions: [...] }
```

---

## Adapter: Supabase

```
Test: SELECT 1 FROM workflow_runs LIMIT 1
Expected: No error, fast response
Pass criteria: HTTP 200, latency < 2 seconds
```

```typescript
const { error } = await supabase.from('workflow_runs').select('id').limit(1);
assert(!error, `Supabase error: ${error?.message}`);
```

---

## Adapter: OpenAI

```
Test: GET /v1/models
Expected: HTTP 200, returns array of model objects
Pass criteria: Response < 5 seconds, includes 'gpt-4o' or similar
```

---

## Adapter: Telegram

```
Test: GET /bot{TOKEN}/getMe
Expected: { ok: true, result: { username: ... } }
Pass criteria: HTTP 200, bot is active
```

---

## Adapter: Google API (Gemini MCP)

```
Test: GET https://generativelanguage.googleapis.com/v1/models
Auth: key={GOOGLE_API_KEY}
Expected: HTTP 200, returns model list
Pass criteria: Gemini Flash model is available
```

---

## All Adapters Summary Script

```bash
#!/bin/bash
echo "Running adapter smoke tests..."

# Firecrawl
curl -s -o /dev/null -w "Firecrawl: %{http_code}\n" \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  https://api.firecrawl.dev/v1/scrape \
  -X POST -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","formats":["markdown"]}'

# OpenAI
curl -s -o /dev/null -w "OpenAI: %{http_code}\n" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# Telegram
curl -s -o /dev/null -w "Telegram: %{http_code}\n" \
  https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe

echo "Done."
```

See `/agents/scripts/adapter-smoke.md` for full documentation.

---

## Integration Status

PLANNED — Phase 5.
