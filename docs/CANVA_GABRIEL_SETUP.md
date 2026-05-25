# Canva + Gabriel Setup

## Current Status

Canva Developer is open, but Canva requires Multi-Factor Authentication before it will allow this account to create a Connect API integration.

Gabriel is now code-ready for Canva, but the live API cannot be activated until Canva gives you:

- Client ID
- Client Secret
- Redirect URI configured in Canva
- Refresh token after OAuth authorization
- Optional default design ID for exports

## Why This Helps

Canva should handle repeatable brand design and exports. Gabriel should handle:

- hooks
- scripts
- captions
- scene outlines
- QA notes
- approval summaries

This saves AI tokens because Gabriel does not need to regenerate visual layout instructions from scratch every time.

## Environment Variables

```env
CANVA_ENABLED=true
CANVA_CLIENT_ID=
CANVA_CLIENT_SECRET=
CANVA_REDIRECT_URI=https://YOUR_DOMAIN.com/api/canva/oauth/callback
CANVA_REFRESH_TOKEN=
CANVA_DEFAULT_DESIGN_ID=
```

For local testing:

```env
CANVA_REDIRECT_URI=http://localhost:3000/api/canva/oauth/callback
```

## Canva Developer Steps

1. Enable MFA in Canva account settings.
2. Return to Canva Developers.
3. Create a Connect API integration.
4. Add the redirect URL from `CANVA_REDIRECT_URI`.
5. Select the minimum scopes needed:
   - `design:meta:read`
   - `design:content:read`
   - `asset:read`
6. Generate/save the client secret.
7. Add the credentials to Vercel environment variables.

## Gabriel Rules

- Canva exports stay `pending_review`.
- Gabriel must not auto-publish Canva assets.
- Do not use pro exports unless Alfred approves premium licensing/cost.
- Do not use Canva to create fake proof, fake screenshots, fake analytics, or fake testimonials.
- Any housing, finance, legal, youth, or compliance-adjacent content still needs QA review.

## Health Check

After env vars are set, check:

```text
/api/canva/status
```

The response should show:

- `enabled: true`
- `hasClientId: true`
- `hasClientSecret: true`
- `readyForOAuth: true`

## OAuth Helper

When credentials are configured, this helper can generate an authorization URL:

```text
/api/canva/auth-url
```

Important: the returned `code_verifier` must be stored server-side before production use. This endpoint is a setup helper, not a public production OAuth flow.
