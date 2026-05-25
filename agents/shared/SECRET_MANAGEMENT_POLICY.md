# Secret Management Policy — Colvin Content OS

See also: API_KEY_POLICY.md for key-specific storage rules.

---

## Secret Storage Architecture

```
Local Development
  └── .env.local (gitignored)
      ├── All required keys
      └── All optional keys

Production (Vercel)
  └── Vercel Environment Variables
      ├── Production environment
      ├── Preview environment (optional)
      └── Set via: vercel env add KEY_NAME production

CI/CD (GitHub Actions)
  └── GitHub Repository Secrets
      ├── Settings > Secrets and variables > Actions
      └── Referenced as: ${{ secrets.KEY_NAME }}
```

---

## Access Control

Only Alfred has access to:
- Vercel project settings
- GitHub repository secrets
- .env.local file on local machine
- Provider API dashboards (OpenAI, Supabase, Telegram, etc.)

No agent, no automation, no external service has write access to secrets.

---

## Rotation Schedule

| Secret | Rotation | Trigger |
|--------|---------|---------|
| OPENAI_API_KEY | 90 days | Calendar reminder + on compromise |
| SUPABASE_SERVICE_ROLE_KEY | 180 days | Calendar reminder + on compromise |
| CRON_SECRET | 90 days | Calendar reminder |
| FIRECRAWL_API_KEY | 90 days | Calendar reminder |
| TELEGRAM_BOT_TOKEN | Compromise only | On compromise |
| GOOGLE_API_KEY (Gemini) | 90 days | Calendar reminder |
| REMOTION_MCP_URL | On change | When Remotion MCP URL changes |

---

## Rotation Procedure

1. Generate new key in provider dashboard
2. Update `.env.local` locally
3. Update Vercel environment variable (redeploy if needed)
4. Update GitHub Actions secret if used in CI
5. Verify system health after rotation (run synthetic tests)
6. Delete old key from provider dashboard
7. Log rotation in Alfred's ops notes

---

## Emergency Revocation

If a key is compromised:
1. Revoke in provider dashboard IMMEDIATELY (target: < 15 minutes)
2. Generate new key
3. Update all environments
4. Create P1 incident in Supabase
5. Check audit logs for unauthorized usage
6. Determine how the key was exposed — fix the root cause

---

## .env.local Template

See `/agents/ENVIRONMENT_VARIABLES.md` for the complete list of variables. A `.env.local.example` file in the repo root lists all required keys with empty values for reference.

Never commit `.env.local`. Never commit `.env`. The `.gitignore` must include both.
