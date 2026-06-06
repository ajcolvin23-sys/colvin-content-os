// ─── Blocked lead sources — SINGLE SOURCE OF TRUTH ──────────────────────────
// Freelance/gig marketplaces and job boards return freelancers looking for work
// and job-seekers — NEVER prospects Alfred wants to reach. Both the live lead
// scout (gabriel:daily step 3) and the mesh leads.finder agent import this, so
// the rule can never drift between the two paths.
//
// Alfred's standing instruction (2026-06-03): stop sourcing leads from
// Upwork / Fiverr / Freelancer / gig + job platforms — permanently.

export const BLOCKED_DOMAINS: string[] = [
  // Freelance / gig marketplaces
  'upwork.com', 'fiverr.com', 'freelancer.com', 'peopleperhour.com', 'toptal.com',
  'guru.com', 'workana.com', 'freeup.net', 'contra.com', 'legiit.com',
  'hubstafftalent.net', '99designs.com', 'designhill.com', 'dribbble.com',
  'behance.net', 'weworkremotely.com', 'remoteok.com', 'problogger.com',
  // Local-services / quote marketplaces (return providers, not buyers)
  'bark.com', 'thumbtack.com', 'taskrabbit.com', 'angi.com', 'homeadvisor.com',
  'clutch.co', 'upcity.com', 'getapp.com',
  // Job boards (return job-seekers, not prospects)
  'indeed.com', 'ziprecruiter.com', 'glassdoor.com', 'monster.com',
  'careerbuilder.com', 'dice.com', 'simplyhired.com', 'flexjobs.com',
  'snagajob.com', 'wellfound.com', 'angel.co', 'lever.co', 'greenhouse.io',
]

// URL-path catch for freelance/job content on domains not in the list above.
const BLOCKED_PATH = /\/(freelanc|gigs?|jobs?|hire-me|find-work|for-hire|portfolio)\b/i

export function isBlockedSource(url: string): boolean {
  try {
    const u = new URL(url)
    const hostname = u.hostname.replace(/^www\./, '')
    if (BLOCKED_DOMAINS.some((d) => hostname === d || hostname.endsWith('.' + d))) return true
    if (BLOCKED_PATH.test(u.pathname)) return true
    return false
  } catch { return false }
}

// Keyword regex for scrubbing freelance/job-platform mentions from any text
// (e.g. the Telegram/email brief) — belt-and-suspenders on top of source filtering.
export const BLOCKED_KEYWORDS = /\b(upwork|fiverr|freelanc\w*|peopleperhour|toptal|guru\.com|workana|contra\.com|99designs|designhill|thumbtack|bark\.com|taskrabbit|angi\b|homeadvisor|clutch\.co|indeed|ziprecruiter|glassdoor|monster\.com|careerbuilder|simplyhired|flexjobs|wellfound|angellist|angel\.co)\b/i

/** Remove any line that mentions a freelance/gig/job platform. Used before sending briefs. */
export function scrubBlockedLines(text: string): string {
  return text.split('\n').filter((line) => !BLOCKED_KEYWORDS.test(line)).join('\n')
}

// Drop-in exclusion text for lead-extraction prompts (both scout paths).
export const FREELANCE_EXCLUSION = `\nABSOLUTE EXCLUSION (permanent): NEVER extract freelancers, contractors advertising their own services, job-seekers, or anyone listed on freelance/gig marketplaces or job boards (Upwork, Fiverr, Freelancer, PeoplePerHour, Toptal, Guru, Thumbtack, Bark, Indeed, ZipRecruiter, etc.). Those are people looking for work — not prospects. If a source is one of these platforms or a "hire me / portfolio / find work" page, skip it entirely.`
