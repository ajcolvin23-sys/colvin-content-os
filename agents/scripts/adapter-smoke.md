# Adapter Smoke Tests — Colvin Content OS

How to smoke test all external adapters. Quick verification that each integration is working.

---

## npm Command

```bash
npm run test:adapters
```

---

## Individual Adapter Tests

### Firecrawl

```bash
# Test Firecrawl API connection
curl -s -X POST https://api.firecrawl.dev/v1/scrape \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "formats": ["markdown"]}' \
  | jq '.success'
# Expected: true
```

### OpenAI

```bash
# Test OpenAI API connection
curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  | jq '.data | length'
# Expected: number > 0
```

### Telegram

```bash
# Test Telegram bot
curl -s "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe" \
  | jq '.ok'
# Expected: true
```

### Supabase

```bash
# Test Supabase connection (requires direct DB access or API)
curl -s \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/workflow_runs?select=id&limit=1" \
  | jq 'type'
# Expected: "array"
```

### Remotion MCP

```bash
# Test Remotion MCP (if running locally)
curl -s "$REMOTION_MCP_URL/compositions" \
  | jq '.compositions | type'
# Expected: "array"
```

### Google Gemini

```bash
# Test Gemini API
curl -s "https://generativelanguage.googleapis.com/v1/models?key=$GOOGLE_API_KEY" \
  | jq '.models | length'
# Expected: number > 0
```

---

## Full Adapter Smoke Script

```bash
#!/bin/bash
# scripts/adapter-smoke.sh

echo "Colvin Content OS — Adapter Smoke Tests"
echo "========================================"

# Track results
PASS=0
FAIL=0

check() {
  local name=$1
  local command=$2
  local expected=$3
  
  result=$(eval "$command" 2>/dev/null)
  if [ "$result" = "$expected" ]; then
    echo "✓ $name"
    PASS=$((PASS+1))
  else
    echo "✗ $name (got: $result, expected: $expected)"
    FAIL=$((FAIL+1))
  fi
}

check "Firecrawl" \
  "curl -s -X POST https://api.firecrawl.dev/v1/scrape -H 'Authorization: Bearer $FIRECRAWL_API_KEY' -H 'Content-Type: application/json' -d '{\"url\":\"https://example.com\",\"formats\":[\"markdown\"]}' | jq -r '.success'" \
  "true"

check "OpenAI" \
  "curl -s -o /dev/null -w '%{http_code}' https://api.openai.com/v1/models -H 'Authorization: Bearer $OPENAI_API_KEY'" \
  "200"

check "Telegram" \
  "curl -s 'https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe' | jq -r '.ok'" \
  "true"

echo "========================================"
echo "$PASS passed, $FAIL failed"
exit $FAIL
```

---

## When to Run

- After initial environment setup
- After rotating API keys
- When debugging integration failures
- As part of SYSTEM_HEALTH_CHECK_AGENT

---

## Integration Status

PLANNED — Script to be created in Phase 2.
