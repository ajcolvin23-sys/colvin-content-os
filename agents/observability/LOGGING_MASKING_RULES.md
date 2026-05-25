# Logging Masking Rules — Colvin Content OS

What to mask in all logs, database records, and agent outputs. No PII or secrets in logs.

---

## Masking Patterns

### API Keys
- Pattern: `sk-[a-zA-Z0-9]{20,}` (OpenAI), `fc-[a-zA-Z0-9]+` (Firecrawl), any long token string
- Masked as: `***REDACTED_API_KEY***`
- Where applied: All log outputs, all Supabase text fields, all Telegram messages

### Email Addresses
- Pattern: `[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.[a-zA-Z]+`
- Masked as: First char + `***@` + domain: `a***@example.com`
- Where applied: Log files, error messages, stack traces
- **Exception:** Stored properly in `leads.email` field (encrypted at rest via Supabase)

### Phone Numbers
- Pattern: Various phone formats
- Masked as: `***-***-XXXX` (last 4 visible)
- Where applied: Logs, error messages, stack traces

### Full Names in PII Contexts
- Applied when: A name appears in a log message alongside other PII
- Masked as: First name initial + last initial: "M.S."
- **Exception:** Names in content drafts (content records) are stored as-is — masking is for logs/error messages only

### Social Security Numbers
- Pattern: `[0-9]{3}-[0-9]{2}-[0-9]{4}`
- Masked as: `***-**-****`
- Applied everywhere, immediately

### Financial Account Numbers
- Pattern: Card numbers, bank account numbers, routing numbers
- Masked as: Last 4 digits only: `****-****-****-1234`

### Supabase Connection Strings
- Pattern: `postgresql://` URLs
- Masked as: `postgresql://***:***@[host]/[db]`

---

## Where Masking Applies

| Location | Masking Required | Notes |
|----------|-----------------|-------|
| Vercel function logs | Yes | Applied in logging middleware |
| Supabase workflow_runs.error_metadata.stack_trace | Yes | Sanitize before storing |
| Supabase workflow_runs.output_snapshot | Yes | Strip PII fields before snapshot |
| Telegram bot messages | Yes | Never send raw PII via Telegram |
| Review ticket context | Partial | Names/company in context OK, emails/phones masked |
| Incident records | Yes | Stack traces sanitized |
| Daily report (Alfred's briefing) | Partial | Lead names/company OK, contact details masked |

---

## Fields Exempt from Masking (Stored As-Is)

These fields are expected to contain PII — they are stored properly, not masked:
- `leads.email` — stored in leads table, access-controlled
- `leads.phone` — stored in leads table, access-controlled
- `leads.name` — stored in leads table, access-controlled
- `outreach.lead_name` — stored in outreach table

These fields are protected by Supabase Row-Level Security, not by masking.

---

## Auto-Masking Implementation

```typescript
function maskPII(text: string): string {
  return text
    .replace(/sk-[a-zA-Z0-9]{20,}/g, '***REDACTED_API_KEY***')
    .replace(/fc-[a-zA-Z0-9]{20,}/g, '***REDACTED_API_KEY***')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, 
      (match) => match[0] + '***@' + match.split('@')[1])
    .replace(/\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, '***-**-****') // SSN
    .replace(/postgresql:\/\/[^@]+@/g, 'postgresql://***:***@');
}
```

Apply to all text before writing to logs or Supabase error fields.

---

## Masking Audit

Security Review Agent (weekly) checks:
- Sample of recent workflow_runs for unmasked PII patterns
- Sample of recent error_metadata for API key patterns
- Telegram message history for unintended PII exposure
