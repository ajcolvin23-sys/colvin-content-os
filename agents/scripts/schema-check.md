# Schema Check — Colvin Content OS

How to validate all JSON schemas. Verify they parse correctly and are structurally valid.

---

## npm Command

```bash
npm run schema:check
```

---

## Quick Manual Check

Verify all schema files parse as valid JSON:

```bash
node -e "
const schemas = ['lead','content','remotion_video','outreach','workflow_run','review_ticket','incident'];
let pass = 0, fail = 0;
schemas.forEach(s => {
  try {
    require('./agents/schemas/' + s + '.schema.json');
    console.log('✓ ' + s + '.schema.json');
    pass++;
  } catch(e) {
    console.error('✗ ' + s + '.schema.json — ' + e.message);
    fail++;
  }
});
console.log('\n' + pass + '/' + schemas.length + ' schemas valid');
process.exit(fail > 0 ? 1 : 0);
"
```

---

## Full Schema Validation (with AJV)

The full check uses AJV to validate that schemas are valid JSON Schema Draft-07:

```typescript
// scripts/schema-check.ts
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import addKeywords from 'ajv-keywords';

const ajv = new Ajv({ strict: true });
addFormats(ajv);
addKeywords(ajv);

const schemas = [
  'lead', 'content', 'remotion_video', 'outreach', 
  'workflow_run', 'review_ticket', 'incident'
];

let allPass = true;

for (const name of schemas) {
  const schema = require(`../agents/schemas/${name}.schema.json`);
  try {
    ajv.compile(schema);
    console.log(`✓ ${name}.schema.json — valid`);
  } catch (e) {
    console.error(`✗ ${name}.schema.json — INVALID: ${e.message}`);
    allPass = false;
  }
}

process.exit(allPass ? 0 : 1);
```

---

## Expected Output

```
Schema Check — Colvin Content OS
==================================
✓ lead.schema.json — valid
✓ content.schema.json — valid
✓ remotion_video.schema.json — valid
✓ outreach.schema.json — valid
✓ workflow_run.schema.json — valid
✓ review_ticket.schema.json — valid
✓ incident.schema.json — valid

7/7 schemas valid
```

---

## When to Run

- After any schema file is edited
- After upgrading AJV or JSON Schema library
- As part of CI pipeline
- Before deploying to production

---

## CI Integration

Add to GitHub Actions or Vercel build:
```yaml
- name: Validate schemas
  run: npm run schema:check
```

---

## Integration Status

PLANNED — Script wrapper in Phase 2. The manual `node -e` command works now.
