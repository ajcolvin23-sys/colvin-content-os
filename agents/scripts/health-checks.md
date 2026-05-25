# Health Check Scripts — Colvin Content OS

Documentation for health check scripts. Maps to `npm run health-check`.

---

## npm Command

```bash
npm run health-check
```

Defined in `package.json`:
```json
{
  "scripts": {
    "health-check": "tsx scripts/health-check.ts"
  }
}
```

---

## Script Location

`scripts/health-check.ts`

---

## What the Script Checks

1. **Supabase connection** — SELECT from workflow_runs
2. **OpenAI API** — GET /v1/models
3. **Telegram bot** — getMe endpoint
4. **Firecrawl** — scrape example.com
5. **Environment variables** — verify all required vars are set (names only, not values)
6. **gabriel-config.json** — loads without error
7. **Schema files** — all 7 schema JSONs parse without error

---

## Expected Output

```
Colvin Content OS — Health Check
================================

[✓] Supabase connection (44ms)
[✓] OpenAI API (312ms)
[✓] Telegram bot (@ColvinContentBot)
[✓] Firecrawl (1.2s)
[✗] Remotion MCP — FAILED: Connection refused
    REMOTION_MCP_URL: Not set or service not running

[✓] Environment variables (12/13 set)
    Missing: REMOTION_MCP_URL

[✓] gabriel-config.json
[✓] Schema files (7/7 valid)

================================
Status: DEGRADED (1 failure)
Action required: Set REMOTION_MCP_URL or start Remotion MCP
```

---

## Exit Codes

- `0` — All checks passed
- `1` — One or more checks failed
- `2` — Critical failure (Supabase or OpenAI unreachable)

---

## When to Run

- After any code deployment
- After adding new environment variables
- When debugging a workflow failure
- Before running the first Gabriel daily run on a new machine

---

## Integration Status

PLANNED — Script to be written in Phase 2 setup.
