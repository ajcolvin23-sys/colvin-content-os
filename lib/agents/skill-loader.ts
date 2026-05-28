// ─── Skill Loader ─────────────────────────────────────────────────────────────
// Loads SKILL.md files and core MD files from automation-os/gabriel/ so the
// cron-driven runner can inject the same guardrails that human Claude sessions
// see via @-imports. Before this loader, the 128 skill MD files were invisible
// to gabriel-daily-run.ts. Now they can be loaded on demand.
//
// Skills are cached per process — subsequent loads are free.
// ─────────────────────────────────────────────────────────────────────────────
import * as fs from 'fs'
import * as path from 'path'

const GABRIEL_ROOT = path.resolve(process.cwd(), 'automation-os/gabriel')
const SKILLS_DIR = path.join(GABRIEL_ROOT, 'skills')
const CORE_DIR = path.join(GABRIEL_ROOT, 'core')
const BUSINESS_CONTEXT_DIR = path.join(GABRIEL_ROOT, 'business-context')

const _cache = new Map<string, string>()

export interface SkillContent {
  name: string
  description: string
  body: string
  checklist?: string
  examples?: string
}

/**
 * Load a SKILL.md file by skill folder name.
 * Returns parsed front-matter + body, optionally + checklist + examples.
 *
 * @example
 *   const skill = await loadSkill('video-growth-architect')
 *   // Inject into system prompt: skill.body
 */
export function loadSkill(skillName: string, opts?: {
  includeChecklist?: boolean
  includeExamples?: boolean
}): SkillContent | null {
  const cacheKey = `skill:${skillName}:${opts?.includeChecklist ?? false}:${opts?.includeExamples ?? false}`
  const cached = _cache.get(cacheKey)
  if (cached) {
    try { return JSON.parse(cached) } catch { /* fall through */ }
  }

  const skillDir = path.join(SKILLS_DIR, skillName)
  const skillFile = path.join(skillDir, 'SKILL.md')

  if (!fs.existsSync(skillFile)) return null

  try {
    const raw = fs.readFileSync(skillFile, 'utf8')
    const { meta, body } = parseFrontMatter(raw)

    const result: SkillContent = {
      name: meta.name || skillName,
      description: meta.description || '',
      body,
    }

    if (opts?.includeChecklist) {
      const checklistPath = path.join(skillDir, 'checklist.md')
      if (fs.existsSync(checklistPath)) {
        result.checklist = fs.readFileSync(checklistPath, 'utf8')
      }
    }

    if (opts?.includeExamples) {
      const examplesPath = path.join(skillDir, 'examples.md')
      if (fs.existsSync(examplesPath)) {
        result.examples = fs.readFileSync(examplesPath, 'utf8')
      }
    }

    _cache.set(cacheKey, JSON.stringify(result))
    return result
  } catch {
    return null
  }
}

/**
 * Load a core MD file (LOCKED_UPGRADES, SAFETY_AND_APPROVALS, etc.)
 * Returns the body text without front-matter.
 */
export function loadCoreFile(filename: string): string | null {
  const cacheKey = `core:${filename}`
  const cached = _cache.get(cacheKey)
  if (cached !== undefined) return cached

  const filePath = path.join(CORE_DIR, filename)
  if (!fs.existsSync(filePath)) {
    _cache.set(cacheKey, '')
    return null
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const { body } = parseFrontMatter(raw)
    _cache.set(cacheKey, body)
    return body
  } catch {
    return null
  }
}

/**
 * Load a business-context file (BUSINESS_PORTFOLIO, ICP_LIBRARY, etc.)
 */
export function loadBusinessContext(filename: string): string | null {
  const cacheKey = `bc:${filename}`
  const cached = _cache.get(cacheKey)
  if (cached !== undefined) return cached

  const filePath = path.join(BUSINESS_CONTEXT_DIR, filename)
  if (!fs.existsSync(filePath)) {
    _cache.set(cacheKey, '')
    return null
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    const { body } = parseFrontMatter(raw)
    _cache.set(cacheKey, body)
    return body
  } catch {
    return null
  }
}

/**
 * Build a standard system prompt prelude that every cron-driven Gabriel call
 * should include. Loads LOCKED_UPGRADES + SAFETY_AND_APPROVALS + optional
 * lane-specific compliance.
 */
export function buildGabrielSystemPrelude(opts?: {
  lane?: string
  includeLockedUpgrades?: boolean
  includeSafety?: boolean
  includeThinkingProtocol?: boolean
}): string {
  const parts: string[] = []

  // Identity
  const boot = loadCoreFile('GABRIEL_BOOT.md')
  if (boot) parts.push(boot.trim())

  // Locked rules (default on)
  if (opts?.includeLockedUpgrades !== false) {
    const locked = loadCoreFile('LOCKED_UPGRADES.md')
    if (locked) parts.push('---\n\n# LOCKED UPGRADES — DO NOT REVERT\n\n' + locked.trim())
  }

  // Safety + approval rules (default on)
  if (opts?.includeSafety !== false) {
    const safety = loadCoreFile('SAFETY_AND_APPROVALS.md')
    if (safety) parts.push('---\n\n# SAFETY & APPROVALS\n\n' + safety.trim())
  }

  // Thinking protocol (optional — adds ~3KB)
  if (opts?.includeThinkingProtocol) {
    const thinking = loadCoreFile('THINKING_PROTOCOL.md')
    if (thinking) parts.push('---\n\n# THINKING PROTOCOL\n\n' + thinking.trim())
  }

  // Lane-specific compliance hook
  if (opts?.lane) {
    const laneCompliance = getLaneComplianceText(opts.lane)
    if (laneCompliance) parts.push('---\n\n# LANE COMPLIANCE\n\n' + laneCompliance)
  }

  return parts.join('\n\n')
}

/**
 * Get the compliance notes for a specific lane. Pulled from gabriel-config.json
 * lane_strategy entries.
 */
function getLaneComplianceText(lane: string): string | null {
  const COMPLIANCE_BY_LANE: Record<string, string> = {
    first_keys_indy: `First Keys Indy COMPLIANCE (always include):
- Never guarantee grant approval
- Never state exact dollar amounts unless verified
- Always include: "Speak with a HUD-approved lender to confirm eligibility."
- Tag every output with: katrina_review_required`,
    indiana_backflow: `Indiana Backflow Directory COMPLIANCE:
- Never make unverified claims about certification requirements or legal mandates
- Mark any regulatory claims as [NEEDS VERIFICATION]
- Educational content only — no legal advice`,
    music_theory_secrets: `Music Theory Secrets COMPLIANCE:
- Never promise skill outcomes in a fixed timeframe without qualification
- Promote only the free 4-chord cheat sheet (no course/membership yet)`,
    funding_ready_indiana: `FundingReady Indiana COMPLIANCE:
- No guarantee of funding outcomes
- Legal disclaimer required on all client-facing materials
- Tag every output with: katrina_review_required`,
    colvin_enterprises: `Colvin Enterprises:
- No hype, no inflated ROI claims
- Reference real outcomes only (time saved, leads captured, etc.)`,
    girls_got_game: `Girls Got Game COMPLIANCE:
- Youth-safe content only
- No PII for minors
- Tag every output with: katrina_review_required`,
  }
  return COMPLIANCE_BY_LANE[lane] ?? null
}

/**
 * Reset the cache. Useful in tests or when MD files change at runtime.
 */
export function resetSkillLoaderCache(): void {
  _cache.clear()
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseFrontMatter(raw: string): { meta: Record<string, string>; body: string } {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!fmMatch) {
    return { meta: {}, body: raw.trim() }
  }
  const meta: Record<string, string> = {}
  for (const line of fmMatch[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx < 0) continue
    const key = line.slice(0, idx).trim()
    const val = line.slice(idx + 1).trim()
    if (key) meta[key] = val
  }
  return { meta, body: fmMatch[2].trim() }
}
