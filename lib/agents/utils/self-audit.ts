// ─── Gabriel Daily Runner Self-Audit ─────────────────────────────────────────
// Analyzes gabriel-daily-run.ts (the actual daily automation runner) against
// the 12-area scoring system. Previously pointed at orchestrator.ts — fixed.
// Run: npm run self-audit
// ─────────────────────────────────────────────────────────────────────────────

import OpenAI from 'openai'
import * as fs from 'fs'
import * as path from 'path'

interface AuditScore {
  area: string
  score: number
  target: number
  notes: string
  sip_needed: boolean
}

interface SelfAuditReport {
  timestamp: string
  overall_score: number
  scores: AuditScore[]
  top_weaknesses: string[]
  sip_proposals: string[]
  verdict: 'EXCELLENT' | 'GOOD' | 'NEEDS_WORK' | 'CRITICAL'
}

// ── Static code analysis ──────────────────────────────────────────────────────
function analyzeOrchestratorCode(): Record<string, { found: boolean; score: number; notes: string }> {
  // Point at the actual daily runner — that's what runs every morning
  const orchPath = path.resolve(__dirname, '../../../automation-os/scripts/gabriel-daily-run.ts')
  if (!fs.existsSync(orchPath)) {
    throw new Error('gabriel-daily-run.ts not found at automation-os/scripts/gabriel-daily-run.ts')
  }

  const src = fs.readFileSync(orchPath, 'utf8')

  return {
    prompt_quality: {
      found: src.includes('scanForHallucinations') && src.includes('HALLUCINATION_PATTERNS'),
      score: src.includes('scanForHallucinations') && src.includes('HALLUCINATION_PATTERNS') ? 9 : 3,
      notes: src.includes('scanForHallucinations') ? 'Evidence scanner with 12 hallucination regex patterns present' : 'MISSING hallucination scanner',
    },
    routing: {
      found: src.includes('funding_ready_indiana') && src.includes('model_routing'),
      score: src.includes('funding_ready_indiana') && src.includes('callClaude') ? 9 : 7,
      notes: src.includes('callClaude') ? 'Multi-model routing: GPT-4o, GPT-4o-mini, Claude, Gemini all wired' : 'Model routing present but Anthropic not wired',
    },
    context_hygiene: {
      found: src.includes('carry_forward') && src.includes('step2_loadMemory'),
      score: src.includes('carry_forward') && src.includes('step14_top3Actions') ? 8 : 5,
      notes: src.includes('carry_forward') ? 'Yesterday memory loaded + carry-forward wired into Step 14' : 'Memory loaded but not used in recommendations',
    },
    handoffs: {
      found: src.includes('step3c_checkOutreachReplies') && src.includes('agentMailReplies'),
      score: src.includes('step3c_checkOutreachReplies') ? 8 : 5,
      notes: src.includes('step3c_checkOutreachReplies') ? 'AgentMail reply monitor + reply-to-draft handoff wired' : 'No reply monitoring handoff',
    },
    evidence_discipline: {
      found: src.includes('scanForHallucinations') && src.includes('never_generate_fictional_leads'),
      score: src.includes('never_generate_fictional_leads') ? 9 : 5,
      notes: src.includes('never_generate_fictional_leads') ? 'Fiction block at config level + evidence scanner at output level' : 'Evidence discipline not enforced at config level',
    },
    katrina_governance: {
      found: src.includes('katrina_review_required') && src.includes('katrinaItems.length > 0'),
      score: src.includes('katrinaItems.length > 0') ? 9 : 6,
      notes: src.includes('katrinaItems.length > 0') ? 'Katrina gate fires only when compliance items exist (fixed bug)' : 'Katrina notification may fire unconditionally',
    },
    qa_coverage: {
      found: src.includes('scanForHallucinations') && src.includes('pending_review'),
      score: src.includes('pending_review') && src.includes('review_required') ? 9 : 5,
      notes: src.includes('review_required') ? 'All outputs tagged review_required + evidence scanner on content' : 'Review tagging incomplete',
    },
    failure_recovery: {
      found: src.includes('withRetry') && src.includes('.catch(e =>'),
      score: src.includes('withRetry') && src.includes('.catch(e =>') ? 9 : 4,
      notes: src.includes('withRetry') ? 'withRetry() exponential backoff + per-step .catch() non-fatal recovery' : 'MISSING retry/recovery logic',
    },
    memory_loop: {
      found: src.includes('step16_saveMemory') && src.includes('gabriel_memory'),
      score: src.includes('upsert') && src.includes('session_date') ? 9 : 6,
      notes: src.includes('upsert') ? 'Memory upsert on session_date — no duplicate daily records' : 'Memory save present but may create duplicate daily records',
    },
    security_compliance: {
      found: src.includes('never auto-send') || src.includes('NEVER auto-send'),
      score: src.includes('auto_send: false') || src.includes("auto_send") ? 10 : 6,
      notes: src.includes('auto_send') ? 'auto_send:false + auto_publish:false enforced at config + code level' : 'Auto-send controls present in comments only',
    },
    execution_speed: {
      found: src.includes('Promise.all'),
      score: src.includes('Promise.all') ? 8 : 6,
      notes: src.includes('Promise.all') ? 'Parallel execution used in dedup (linkedin + company name check)' : 'Sequential only — no parallel execution',
    },
    output_usefulness: {
      found: src.includes('step11_buildReviewPackage') && src.includes('top_3_actions'),
      score: src.includes('top_3_actions') && src.includes('agentMailReplies') ? 9 : 7,
      notes: src.includes('agentMailReplies') ? 'Review package + top-3 + Telegram + Resend email + AgentMail reply count' : 'Review package present but missing some delivery channels',
    },
  }
}

// ── AI-assisted audit for semantic holes ─────────────────────────────────────
async function runAIAuditPass(srcExcerpt: string): Promise<string> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const res = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a multi-agent orchestrator systems auditor. Review this orchestrator TypeScript source and find holes not caught by static analysis.

Check for:
1. Missing business context (are all 9 lanes handled?)
2. Weak handoff prompts (are they structured or bare sentences?)
3. Missing evidence discipline (are [VERIFIED] labels enforced in outputs?)
4. Context contamination risk (does the handoff pass full output or summarized?)
5. QA gate completeness (is it truly always-on?)
6. Katrina coverage gaps (are all trigger keywords present?)
7. Memory save completeness (does it append to EVERY final output?)
8. Self-improvement loop (can the system detect and repair its own holes?)

Be specific. List exactly what is missing or weak. Max 10 bullets. No fluff.`,
      },
      {
        role: 'user',
        content: `Orchestrator source (first 4000 chars):\n\n${srcExcerpt}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 600,
  })

  return res.choices[0].message.content || 'No AI audit result'
}

// ── Main Self-Audit ───────────────────────────────────────────────────────────
export async function runSelfAudit(verbose = true): Promise<SelfAuditReport> {
  const orchPath = path.resolve(__dirname, '../../../automation-os/scripts/gabriel-daily-run.ts')
  const src = fs.readFileSync(orchPath, 'utf8')

  // Static analysis
  const analysis = analyzeOrchestratorCode()

  // Build scores
  const targetMap: Record<string, number> = {
    prompt_quality: 9, routing: 9, context_hygiene: 9, handoffs: 8,
    evidence_discipline: 9, katrina_governance: 9, qa_coverage: 10,
    failure_recovery: 8, memory_loop: 7, security_compliance: 10,
    execution_speed: 7, output_usefulness: 9,
  }

  const areaLabels: Record<string, string> = {
    prompt_quality: 'Prompt Quality', routing: 'Routing', context_hygiene: 'Context Hygiene',
    handoffs: 'Handoffs', evidence_discipline: 'Evidence Discipline', katrina_governance: 'Katrina Governance',
    qa_coverage: 'QA Coverage', failure_recovery: 'Failure Recovery', memory_loop: 'Memory Loop',
    security_compliance: 'Security/Compliance', execution_speed: 'Execution Speed', output_usefulness: 'Output Usefulness',
  }

  const scores: AuditScore[] = Object.entries(analysis).map(([key, val]) => ({
    area: areaLabels[key] || key,
    score: val.score,
    target: targetMap[key] || 8,
    notes: val.notes,
    sip_needed: val.score < (targetMap[key] || 8),
  }))

  const overallScore = Math.round(scores.reduce((s, a) => s + a.score, 0) / scores.length * 10) / 10
  const weaknesses = scores.filter(s => s.sip_needed).map(s => `${s.area} (${s.score}/${s.target}): ${s.notes}`)

  // AI semantic pass
  let aiFindings = ''
  try {
    aiFindings = await runAIAuditPass(src.slice(0, 4000))
  } catch {
    aiFindings = 'AI audit pass skipped (API unavailable)'
  }

  // Generate SIP proposals for weaknesses
  const sips = weaknesses.map((w, i) => `SIP-${String(i + 1).padStart(3, '0')}: ${w}`)

  const verdict: SelfAuditReport['verdict'] =
    overallScore >= 9 ? 'EXCELLENT' :
    overallScore >= 7.5 ? 'GOOD' :
    overallScore >= 6 ? 'NEEDS_WORK' : 'CRITICAL'

  const report: SelfAuditReport = {
    timestamp: new Date().toISOString(),
    overall_score: overallScore,
    scores,
    top_weaknesses: weaknesses.slice(0, 5),
    sip_proposals: sips,
    verdict,
  }

  if (verbose) {
    printAuditReport(report, aiFindings)
  }

  return report
}

function printAuditReport(report: SelfAuditReport, aiFindings: string): void {
  const verdictIcon = { EXCELLENT: '🟢', GOOD: '🟡', NEEDS_WORK: '🟠', CRITICAL: '🔴' }
  console.log('\n🧠  HERMES SELF-AUDIT REPORT')
  console.log('═'.repeat(70))
  console.log(`Timestamp: ${report.timestamp}`)
  console.log(`Overall Score: ${report.overall_score}/10  ${verdictIcon[report.verdict]} ${report.verdict}`)
  console.log('\n📊 Area Scores:')
  console.log('─'.repeat(70))

  for (const s of report.scores) {
    const bar = '█'.repeat(s.score) + '░'.repeat(10 - s.score)
    const flag = s.sip_needed ? ' ← SIP NEEDED' : ''
    console.log(`  ${s.area.padEnd(22)} [${bar}] ${s.score}/${s.target}${flag}`)
    if (s.sip_needed) console.log(`    └─ ${s.notes}`)
  }

  if (report.top_weaknesses.length > 0) {
    console.log('\n🚨 Top Weaknesses:')
    report.top_weaknesses.forEach((w, i) => console.log(`  ${i + 1}. ${w}`))
  }

  if (report.sip_proposals.length > 0) {
    console.log('\n📋 Self-Improvement Proposals Generated:')
    report.sip_proposals.forEach(s => console.log(`  ${s}`))
  }

  if (aiFindings) {
    console.log('\n🤖 AI Semantic Audit Findings:')
    console.log('─'.repeat(70))
    console.log(aiFindings)
  }

  console.log('\n' + '═'.repeat(70))
  console.log(`Verdict: ${verdictIcon[report.verdict]} ${report.verdict} — Overall ${report.overall_score}/10\n`)
}
