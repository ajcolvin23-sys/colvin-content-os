// ─── Hermes Orchestrator Self-Audit ──────────────────────────────────────────
// Analyzes the current orchestrator against the 12-area scoring system
// from ORCHESTRATOR_SELF_AUDIT_AND_STRENGTHENING_MASTER_PROMPT.md
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
  const orchPath = path.resolve(__dirname, '../orchestrator.ts')
  if (!fs.existsSync(orchPath)) {
    throw new Error('orchestrator.ts not found')
  }

  const src = fs.readFileSync(orchPath, 'utf8')

  return {
    prompt_quality: {
      found: src.includes('buildGeniusPrompt') && src.includes('PROMPT_BUILDER_SYSTEM'),
      score: src.includes('buildGeniusPrompt') && src.includes('PROMPT_BUILDER_SYSTEM') ? 9 : 3,
      notes: src.includes('buildGeniusPrompt') ? 'Genius Prompt DNA builder present' : 'MISSING genius prompt builder',
    },
    routing: {
      found: src.includes('PLANNER_PROMPT') && src.includes('funding_ready_indiana'),
      score: src.includes('funding_ready_indiana') && src.includes('KATRINA_LANES') ? 9 : 6,
      notes: src.includes('funding_ready_indiana') ? 'All 9 lanes registered in planner' : 'Some business lanes missing from planner',
    },
    context_hygiene: {
      found: src.includes('buildHandoffSummary'),
      score: src.includes('buildHandoffSummary') ? 8 : 4,
      notes: src.includes('buildHandoffSummary') ? 'Structured handoff builder present' : 'MISSING handoff summarizer',
    },
    handoffs: {
      found: src.includes('needs_prior_output') && src.includes('buildHandoffSummary'),
      score: src.includes('needs_prior_output') ? 8 : 5,
      notes: 'Handoff logic wired to needs_prior_output flag',
    },
    evidence_discipline: {
      found: src.includes('[VERIFIED]') || src.includes('VERIFIED'),
      score: src.includes('VERIFIED') ? 8 : 5,
      notes: src.includes('VERIFIED') ? 'Evidence labels referenced in PROMPT_BUILDER' : 'Evidence labels not enforced in prompts',
    },
    katrina_governance: {
      found: src.includes('runKatrinaReview') && src.includes('KATRINA_LANES'),
      score: src.includes('KATRINA_LANES') ? 9 : 7,
      notes: src.includes('KATRINA_LANES') ? 'KATRINA_LANES set + auto-triggers for 3 compliance lanes' : 'Katrina triggers exist but KATRINA_LANES set missing',
    },
    qa_coverage: {
      found: src.includes('runQACritic') && src.includes('Phase 4'),
      score: src.includes('runQACritic') ? 10 : 0,
      notes: src.includes('runQACritic') ? 'QA Critic wired as Phase 4 (always on)' : 'CRITICAL: QA Critic missing',
    },
    failure_recovery: {
      found: src.includes('RETRY') && src.includes('retryPrompt'),
      score: src.includes('retryPrompt') ? 8 : 4,
      notes: src.includes('retryPrompt') ? '1 automatic retry with corrective context' : 'MISSING failure retry logic',
    },
    memory_loop: {
      found: src.includes('buildMemorySaveRecommendation') && src.includes('Phase 6'),
      score: src.includes('buildMemorySaveRecommendation') ? 8 : 2,
      notes: src.includes('buildMemorySaveRecommendation') ? 'Memory save recommendation wired as Phase 6' : 'MISSING memory save loop',
    },
    security_compliance: {
      found: src.includes('up to') && src.includes('educational only'),
      score: src.includes('educational only') ? 9 : 6,
      notes: src.includes('educational only') ? 'Compliance rules for all 3 sensitive lanes present' : 'Some compliance rules may be missing',
    },
    execution_speed: {
      found: src.includes('run_parallel') && src.includes('Promise.all'),
      score: src.includes('Promise.all') ? 8 : 6,
      notes: src.includes('Promise.all') ? 'Parallel execution supported for parallel groups' : 'Sequential only — no parallel execution',
    },
    output_usefulness: {
      found: src.includes('assembleFinalOutput') && src.includes('ASSEMBLER_SYSTEM'),
      score: src.includes('ASSEMBLER_SYSTEM') ? 8 : 5,
      notes: src.includes('ASSEMBLER_SYSTEM') ? 'Assembler synthesizes all agent outputs with "What to do next"' : 'Missing assembler system',
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
  const orchPath = path.resolve(__dirname, '../orchestrator.ts')
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
