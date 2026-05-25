# Unit Test Plan — Colvin Content OS

What unit tests to write, priority order, and expected outcomes.

---

## Priority 1 (Build First)

### 1. Schema Validation
**File:** `tests/unit/schema-validation.test.ts`
**Tests:**
- Valid lead object passes validation
- Lead missing required field `name` fails validation
- Lead with invalid `lane` enum value fails validation
- Lead with `qualification_score > 10` fails validation
- Valid remotion_video blueprint passes validation
- Blueprint with `approval_required: false` fails validation (enum enforces `true`)
- Outreach draft missing `idempotency_key` fails validation
- Incident with invalid severity level fails validation

### 2. Lead Scoring Formula
**File:** `tests/unit/lead-scoring.test.ts`
**Tests:**
- Indianapolis business owner with email → score 7-9 (colvin_enterprises)
- Out-of-state contact → low firmographic score (0-1)
- Lead with no channel (no email, no LinkedIn) → channel match = 0
- Lead with timing signal (recent incorporation) → timing signal = 2
- Paused lane (piano_app) → returns 0 (auto-disqualify)
- Perfect ICP match → score 8-10
- Score is always in range 0-10 (fuzz test with random inputs)

### 3. Lead Deduplication Logic
**File:** `tests/unit/lead-dedup.test.ts`
**Tests:**
- Same email → duplicate detected
- Same LinkedIn URL (normalized) → duplicate detected
- Same company slug + name slug → duplicate detected
- Different email, same company (different person) → not a duplicate
- Contact window not expired → returns "in window" status
- Contact window expired → returns "eligible" status
- `do_not_contact` lead → always blocks

### 4. Outreach Character Limit Enforcement
**File:** `tests/unit/outreach-limits.test.ts`
**Tests:**
- LinkedIn connection message > 300 chars → validation failure
- Email draft > 5000 chars → validation failure
- Subject line > 200 chars → validation failure
- TikTok caption > 2200 chars → validation failure

### 5. Compliance Keyword Detection
**File:** `tests/unit/compliance-detection.test.ts`
**Tests:**
- Email with "guaranteed approval" → HUD flag triggered
- Email with no unsubscribe → `can_spam_missing_unsubscribe` flag
- Subject line with "FREE!!!" → `spam_trigger_word` flag
- Girls Got Game content with minor's name → `youth_safety` flag
- Clean content → empty compliance_flags array

### 6. Idempotency Key Generation
**File:** `tests/unit/idempotency.test.ts`
**Tests:**
- Output matches expected format: `{lane}_lead_{identifier}_{date}`
- All lowercase
- Date in `YYYY-MM-DD` format
- No spaces (underscores only)
- Max 200 characters enforced
- Same inputs always produce same key (deterministic)

---

## Priority 2 (Build in Phase 3-4)

### 7. Remotion Blueprint Assembly
- All required fields present after assembly
- Duration equals sum of scene durations (±2s)
- Format matches platform rules (9:16 for TikTok)
- approval_required is always true

### 8. Email Compliance Defaults
- Footer appended correctly to every email
- Unsubscribe language present
- Physical address present

### 9. Source Tier Assignment
- .gov URL → Tier 1
- IBJ article → Tier 2
- Generic blog → Tier 3
- LinkedIn URL → restricted handling

---

## Test Framework

Recommended: **Vitest** (fast, compatible with Next.js/TypeScript)

```bash
npm install -D vitest
npx vitest run tests/unit/
```

Or: **Jest** with TypeScript support if already configured.
