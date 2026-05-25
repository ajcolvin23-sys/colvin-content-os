# Output Schemas — Colvin Content OS

Master reference for all validated output schemas. Every agent boundary must produce output that validates against the appropriate schema before the next stage can consume it.

---

## Schema Registry

| Schema File | Validates | Used By |
|------------|----------|---------|
| `/agents/schemas/lead.schema.json` | Lead records | Lead Finder, Enrichment, Dedup, CRM |
| `/agents/schemas/content.schema.json` | All content drafts | Marketing agents, Social Agent, Email Agent |
| `/agents/schemas/remotion_video.schema.json` | Remotion video blueprints | Gabriel Remotion Studio, Render Pipeline |
| `/agents/schemas/outreach.schema.json` | Outreach message drafts | Email Copy Agent, Outbound Sequence Agent |
| `/agents/schemas/workflow_run.schema.json` | Pipeline stage records | All agents, Hermes, Observability |
| `/agents/schemas/review_ticket.schema.json` | Human review queue items | Human Review Gateway, Admin QA Agent |
| `/agents/schemas/incident.schema.json` | Incident records | Hermes, Incident Response |

---

## Validation Requirements

1. **Before Supabase insert:** Validate against schema using JSON Schema Draft-07 validator (e.g., `ajv`)
2. **On schema failure:** Quarantine record, log `SCHEMA_VALIDATION_FAILURE`, regenerate once
3. **On repeated schema failure:** Create P3 incident, halt that stage, log for analysis
4. **Strict mode:** `additionalProperties: false` — no unknown fields allowed

---

## Schema Validation Pattern

```typescript
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import leadSchema from '../agents/schemas/lead.schema.json';

const ajv = new Ajv({ strict: true });
addFormats(ajv);
const validateLead = ajv.compile(leadSchema);

function validateAndInsertLead(lead: unknown) {
  const valid = validateLead(lead);
  if (!valid) {
    throw new SchemaValidationError('lead', validateLead.errors);
  }
  // proceed with insert
}
```

---

## Schema Versioning

- Schemas are versioned via the `$id` field URI
- Breaking changes to a schema require:
  1. New schema version file (e.g., `lead.schema.v2.json`)
  2. Migration script for existing Supabase data
  3. Alfred approval before deploying new schema version
- Additive changes (new optional fields) are non-breaking and can be deployed directly

---

## Schema Check Command

```bash
node -e "
  ['lead','content','remotion_video','outreach','workflow_run','review_ticket','incident']
  .forEach(s => {
    require('./agents/schemas/' + s + '.schema.json');
    console.log('✓ ' + s + '.schema.json');
  })
"
```

See `/agents/scripts/schema-check.md` for full verification procedure.
