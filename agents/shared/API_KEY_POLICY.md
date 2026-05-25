# API Key Policy — Colvin Content OS

---

## Storage Rules by Environment

| Environment | Storage Location | Notes |
|-------------|-----------------|-------|
| Local dev | `.env.local` | Not committed to git. Listed in `.gitignore`. |
| Vercel (prod) | Vercel Environment Variables dashboard | Set via `vercel env add` or Vercel UI |
| GitHub Actions | GitHub repository Secrets | Under Settings > Secrets and variables |
| Supabase Edge Functions | Supabase Vault or Edge Function secrets | Never in function code |

---

## Prohibited Storage Locations (Hard Block)

Never store API keys in:
- Any `.md` markdown file
- Any `.json` config file tracked in git
- Any `NEXT_PUBLIC_*` environment variable (client-exposed)
- Any Supabase table field (text, jsonb, etc.)
- Any Telegram message or bot payload
- Any log file or console output
- Any review ticket or incident record
- Any agent output or content draft

---

## How Agents Access Keys

1. Agents running in Next.js API routes: access via `process.env.KEY_NAME`
2. Agents running in scripts: access via `process.env` loaded from `.env.local`
3. Agents must validate key presence at startup. If key is missing, throw error — do not silently fail.

```typescript
// Correct pattern
const openAIKey = process.env.OPENAI_API_KEY;
if (!openAIKey) {
  throw new Error('OPENAI_API_KEY is not set. Add to .env.local or Vercel env vars.');
}
```

---

## Key Naming Conventions

- All uppercase with underscores
- Prefix with service name: `OPENAI_`, `SUPABASE_`, `TELEGRAM_`, `FIRECRAWL_`
- Public-safe vars only: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_APP_URL`
- Never `NEXT_PUBLIC_` for any secret

---

## Emergency Key Revocation

If a key is suspected or confirmed compromised:
1. **Immediately** log into the provider dashboard and revoke the key
2. Generate a new key
3. Update `.env.local` locally
4. Update Vercel environment variable
5. Redeploy if Vercel cached the old key
6. Create P1 incident in Supabase incidents table
7. Alert Alfred via Telegram

Time target: revocation within 15 minutes of detection.

---

## Key Inventory

See `/agents/ENVIRONMENT_VARIABLES.md` for complete list of all required and optional keys.

---

## Audit

Monthly: Hermes / Security Review Agent checks that no keys appear in:
- Last 30 git commits (grep for key patterns)
- Supabase logs (scan for key format strings)
- Any new markdown files added to the repo
