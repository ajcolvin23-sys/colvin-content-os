#!/usr/bin/env ts-node
/**
 * Gabriel Daily Run — 15-Step Daily Automation Sequence
 * Central daily operator for the Colvin Content OS
 *
 * Run: npm run gabriel:daily
 * Cron: GitHub Actions at 7:00 AM CST (13:00 UTC)
 *
 * RULE: Never auto-send. Never auto-publish. All outputs go to review queue.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

// Load .env.local before any env var access
const envPath = path.resolve(__dirname, '../../.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const idx = t.indexOf('=');
    if (idx < 0) continue;
    const k = t.slice(0, idx).trim();
    const v = t.slice(idx + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// ── Environment ─────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY!;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const KATRINA_TELEGRAM_CHAT_ID = process.env.KATRINA_TELEGRAM_CHAT_ID || '';

const TODAY = new Date().toISOString().split('T')[0];
const RUN_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16); // YYYY-MM-DDTHH-MM
const RUN_START = Date.now();
const SKIPPED_LANES: Array<{ lane: string; reason: string; query?: string }> = [];

// ── Clients ──────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ── Config ───────────────────────────────────────────────────────────────────
const CONFIG_PATH = path.join(__dirname, '../config/gabriel-config.json');
const DATA_PATH = path.join(__dirname, '../data');

// ── Types ────────────────────────────────────────────────────────────────────
interface GabrielConfig {
  active_lanes: string[];
  lead_scout: { max_leads_per_lane_per_run: number; min_qualification_score: number };
  outreach: { max_drafts_per_run: number };
  content: { max_pieces_per_run: number };
  model_routing: Record<string, string>;
  compliance: { katrina_gate_lanes: string[]; katrina_gate_keywords: string[] };
}

interface Lead {
  name: string | null;
  company: string;
  title: string | null;
  linkedin_url?: string | null;
  email?: string;
  lane: string;
  fit_reason: string;
  qualification_score: number;
  source: string;
  found_at?: string;
  lead_type?: 'person' | 'organization' | 'referral_source';
}

interface OutreachDraft {
  lead_name: string;
  lead_company: string;
  lane: string;
  message_type: 'linkedin_connection' | 'linkedin_followup' | 'email';
  draft: string;
  priority_score: number;
  compliance_flags: string[];
  katrina_review_required: boolean;
  status: 'pending_review';
}

interface ContentDraft {
  lane: string;
  platform: string;
  content_type: string;
  draft: string;
  character_count: number;
  review_required: true;
  status: 'pending_review';
}

interface DailyReport {
  date: string;
  run_start: string;
  run_end: string;
  run_duration_ms: number;
  summary: {
    leads_found: number;
    leads_after_dedup: number;
    leads_queued_for_review: number;
    outreach_drafts_created: number;
    content_drafts_created: number;
    seo_opportunities_found: number;
  };
  top_3_actions: Array<{ rank: number; action: string; lane: string; why: string; effort: string }>;
  review_queue: { outreach: number; content: number; seo: number; opportunities: number };
  errors: string[];
  skipped_steps: number[];
  skipped_lanes: Array<{ lane: string; reason: string; query?: string }>;
}

// ── Telegram Helpers ─────────────────────────────────────────────────────────
async function sendTelegram(text: string): Promise<void> {
  return new Promise((resolve) => {
    const body = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: 'HTML' });
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve());
    });
    req.on('error', () => resolve()); // Non-fatal
    req.write(body);
    req.end();
  });
}

// ── GPT Helper ───────────────────────────────────────────────────────────────
async function callGPT(
  model: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });
  return response.choices[0]?.message?.content ?? '';
}

// ── Ensure data directories exist ────────────────────────────────────────────
function ensureDataDirs() {
  const dirs = ['leads', 'content', 'campaigns', 'outreach', 'reports', 'review-queue'];
  for (const dir of dirs) {
    const fullPath = path.join(DATA_PATH, dir);
    if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 — Load Config
// ═══════════════════════════════════════════════════════════════════════════════
async function step1_loadConfig(): Promise<GabrielConfig> {
  console.log('\n[Step 1] Loading gabriel-config.json...');

  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`Config file not found at ${CONFIG_PATH}`);
  }

  const config: GabrielConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  console.log(`  Active lanes: ${config.active_lanes.join(', ')}`);

  // Verify critical env vars
  const missing: string[] = [];
  if (!SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!SUPABASE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!OPENAI_API_KEY) missing.push('OPENAI_API_KEY');
  if (!TELEGRAM_BOT_TOKEN) missing.push('TELEGRAM_BOT_TOKEN');

  if (missing.length > 0) {
    throw new Error(`Missing critical environment variables: ${missing.join(', ')}`);
  }

  console.log('  Config loaded. All required env vars present.');
  return config;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2 — Load Memory
// ═══════════════════════════════════════════════════════════════════════════════
async function step2_loadMemory(): Promise<{ pending_actions: unknown[]; carry_forward: unknown[]; run_errors: string[] }> {
  console.log('\n[Step 2] Loading yesterday\'s memory from Supabase...');

  try {
    const { data, error } = await supabase
      .from('gabriel_memory')
      .select('pending_actions, carry_forward, run_errors')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.log('  No previous memory found — first run or fresh start.');
      return { pending_actions: [], carry_forward: [], run_errors: [] };
    }

    const pendingCount = Array.isArray(data.pending_actions) ? data.pending_actions.length : 0;
    const carryCount = Array.isArray(data.carry_forward) ? data.carry_forward.length : 0;
    console.log(`  Memory loaded: ${pendingCount} pending actions, ${carryCount} carry-forward items`);
    return data;
  } catch {
    console.log('  Memory table not yet created — skipping. (Run Supabase migrations to enable.)');
    return { pending_actions: [], carry_forward: [], run_errors: [] };
  }
}

// ── Firecrawl Search Helper ───────────────────────────────────────────────────
interface FirecrawlSearchResult {
  url: string;
  title?: string;
  description?: string;
  markdown?: string;
}

async function callFirecrawlSearch(query: string, limit = 5): Promise<FirecrawlSearchResult[]> {
  return new Promise((resolve) => {
    const body = JSON.stringify({ query, limit, scrapeOptions: { formats: ['markdown'] } });
    const options = {
      hostname: 'api.firecrawl.dev',
      path: '/v1/search',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && Array.isArray(parsed.data)) {
            resolve(parsed.data as FirecrawlSearchResult[]);
          } else {
            resolve([]);
          }
        } catch {
          resolve([]);
        }
      });
    });

    req.on('error', () => resolve([]));
    req.setTimeout(20000, () => { req.destroy(); resolve([]); });
    req.write(body);
    req.end();
  });
}

// ── Lane search query definitions ─────────────────────────────────────────────
const LANE_SEARCH_QUERIES: Record<string, string[]> = {
  colvin_enterprises: [
    'Indianapolis small business operations consulting 2024',
    'Indianapolis entrepreneur AI automation workflow',
    'Indianapolis professional services firm technology upgrade',
  ],
  indiana_backflow: [
    'Indianapolis property management company backflow prevention',
    'Indiana commercial building facility manager plumbing compliance',
    'Indianapolis apartment complex maintenance director',
  ],
  music_theory_secrets: [
    'Indianapolis church musician gospel piano worship director',
    'Indiana gospel music ministry choir director',
    'Indianapolis music school piano instructor gospel jazz',
  ],
  first_keys_indy: [
    'Indianapolis first time homebuyer assistance program Marion County',
    'Indianapolis affordable housing non profit homeownership',
    'Indiana down payment assistance first time buyer realtor',
  ],
  funding_ready_indiana: [
    'Indianapolis small business owner grant funding opportunity Indiana',
    'Indiana minority owned business development center grants',
    'Indianapolis nonprofit organization funding economic development',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3 — Lead Scout (Firecrawl-powered real source scraping)
// ═══════════════════════════════════════════════════════════════════════════════
async function step3_leadScout(config: GabrielConfig): Promise<Lead[]> {
  console.log('\n[Step 3] Running Lead Scout (Firecrawl real-source mode)...');

  if (!FIRECRAWL_API_KEY) {
    console.log('  ⚠️  FIRECRAWL_API_KEY not set — lead scout skipped. Set key in .env.local to enable real lead sourcing.');
    console.log('  ⚠️  No fictional leads will be generated. Outreach step will have 0 leads.');
    return [];
  }

  const leads: Lead[] = [];

  for (const lane of config.active_lanes) {
    try {
      const queries = LANE_SEARCH_QUERIES[lane];
      if (!queries || queries.length === 0) {
        console.log(`  ${lane}: no search queries defined — skipping`);
        continue;
      }

      // Run first search query for this lane (rotate daily to avoid staleness)
      const queryIndex = new Date().getDate() % queries.length;
      const query = queries[queryIndex];

      console.log(`  ${lane}: searching "${query.slice(0, 60)}..."`);
      const results = await callFirecrawlSearch(query, config.lead_scout.max_leads_per_lane_per_run);

      if (results.length === 0) {
        console.log(`  ${lane}: Firecrawl returned 0 results — skipping lane`);
        SKIPPED_LANES.push({ lane, reason: 'Firecrawl returned 0 results', query });
        continue;
      }

      // Feed real scraped context to GPT for structured lead extraction
      const scrapedContext = results
        .slice(0, 5)
        .map((r, i) => `[${i + 1}] ${r.title || 'Unknown'} — ${r.url}\n${r.description || ''}\n${(r.markdown || '').slice(0, 400)}`)
        .join('\n\n---\n\n');

      // ── CALL A: Extract lead profiles (no scoring — extraction only) ─────────
      const extractPrompt = `You are Lead Scout for Alfred Colvin's business "${lane}" in Indianapolis.
Extract real prospect profiles from the web research below. ONLY use companies and people mentioned in the source material.
Do NOT invent names. If a real person's name is not mentioned, leave name as null.
Do NOT assign quality scores — that is a separate step.
Return JSON array. Each item: { name (string|null), company, title (string|null), linkedin_url (string|null), fit_reason, source_url }.
Max ${config.lead_scout.max_leads_per_lane_per_run} prospects.`;

      const extractResponse = await callGPT(
        config.model_routing.lead_scoring,
        extractPrompt,
        `Web research for ${lane} lane:\n\n${scrapedContext}`
      );

      const extractedRaw = JSON.parse(extractResponse.replace(/```json|```/g, '').trim());
      const extracted: Array<{name:string|null;company:string;title:string|null;linkedin_url:string|null;fit_reason:string;source_url:string}> =
        Array.isArray(extractedRaw) ? extractedRaw : [];

      if (extracted.length === 0) {
        console.log(`  ${lane}: 0 prospects extracted from Firecrawl content`);
        continue;
      }

      // ── CALL B: Independent scoring (separate call — no conflict of interest) ─
      const laneConfig = JSON.stringify({
        lane,
        offer: lane === 'colvin_enterprises' ? 'AI automation consulting for small businesses' :
               lane === 'indiana_backflow' ? 'Certified backflow tester directory for Indiana properties' :
               lane === 'music_theory_secrets' ? 'Gospel piano theory book for church musicians' :
               lane === 'first_keys_indy' ? 'Down payment assistance education for Marion County homebuyers' :
               'Grant and funding discovery for Indiana small businesses',
        target: lane === 'colvin_enterprises' ? 'Business owners, ops directors, marketing managers in Indianapolis' :
                lane === 'indiana_backflow' ? 'Property managers, facility directors, plumbing contractors in Indiana' :
                lane === 'music_theory_secrets' ? 'Church musicians, gospel piano players, worship directors' :
                lane === 'first_keys_indy' ? 'First-time homebuyers, realtors, housing nonprofits in Marion County' :
                'Indiana small business owners seeking grants or SBA funding',
      });

      const scorePrompt = `You are an independent lead quality evaluator. Score each prospect on 5 dimensions (1–10 each).
Be HONEST — do not inflate scores. A prospect without a named contact should score no higher than 6 on Contact Specificity.
A government agency or nonprofit is a partner/referral_source, not a direct client lead.

Scoring rubric:
- source_credibility (1-10): Is the source URL a real specific organization? Not a generic directory.
- contact_specificity (1-10): Named person with real role = 8+. Title-only = 5. No contact = 3.
- decision_maker_fit (1-10): Does the role have authority to hire/buy Alfred's offer?
- geography_match (1-10): Indianapolis/Indiana = 10. Adjacent = 6. Out of region = 2.
- offer_alignment (1-10): How specifically does this prospect match Alfred's ${lane} offer?

Also assign:
- lead_type: "person" (named individual) | "organization" (company, no named contact) | "referral_source" (govt agency, nonprofit, chamber)
- final_score: average of 5 dimensions (1 decimal place)
- include: boolean — should this lead be included? (false if final_score < ${config.lead_scout.min_qualification_score})

Context: ${laneConfig}

Return JSON array matching the input order: [{ source_credibility, contact_specificity, decision_maker_fit, geography_match, offer_alignment, lead_type, final_score, include }]`;

      const scoreResponse = await callGPT(
        config.model_routing.lead_scoring,
        scorePrompt,
        `Score these ${extracted.length} prospects:\n${extracted.map((p, i) => `${i+1}. ${p.name ?? '[no name]'}, ${p.title ?? '[no title]'} at ${p.company} — ${p.fit_reason}`).join('\n')}`
      );

      const scores = JSON.parse(scoreResponse.replace(/```json|```/g, '').trim());
      const scoresArray = Array.isArray(scores) ? scores : [];

      // Merge extraction + independent scores
      const taggedLeads: Lead[] = extracted
        .map((l, i) => {
          const s = scoresArray[i] ?? {};
          return {
            name: l.name,
            company: l.company,
            title: l.title,
            linkedin_url: l.linkedin_url,
            lane,
            fit_reason: l.fit_reason,
            qualification_score: Math.round((s.final_score ?? 5) * 10) / 10,
            source: l.source_url ? `firecrawl_web:${l.source_url}` : 'firecrawl_web',
            found_at: new Date().toISOString(),
            lead_type: (s.lead_type ?? 'person') as Lead['lead_type'],
          } as Lead;
        })
        .filter((_, i) => scoresArray[i]?.include !== false);

      const avgScore = taggedLeads.length > 0
        ? (taggedLeads.reduce((sum, l) => sum + l.qualification_score, 0) / taggedLeads.length).toFixed(1)
        : '—';

      leads.push(...taggedLeads);
      console.log(`  ${lane}: ${taggedLeads.length}/${extracted.length} leads passed independent scoring (avg: ${avgScore}/10)`);
    } catch (err) {
      console.log(`  ${lane}: lead scout failed — ${String(err).slice(0, 80)}`);
    }
  }

  console.log(`  Total real leads found: ${leads.length}`);
  if (leads.length > 0) {
    const sources = [...new Set(leads.map(l => l.source))];
    console.log(`  Sources: ${sources.slice(0, 3).join(', ')}${sources.length > 3 ? ` +${sources.length - 3} more` : ''}`);
  }
  return leads;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3b — Follow-Up Queue (connected leads awaiting follow-up)
// Alfred manually sets lead.status = 'connected' when someone accepts his request.
// Gabriel detects this and queues a follow-up draft automatically.
// ═══════════════════════════════════════════════════════════════════════════════
async function step3b_followUpQueue(config: GabrielConfig): Promise<OutreachDraft[]> {
  console.log('\n[Step 3b] Checking for connected leads awaiting follow-up...');
  const followUpDrafts: OutreachDraft[] = [];

  try {
    // Query connected leads — follow_up_sent_at added in migration 003
    // Until migration is applied, fall back to status-only query
    const { data: connectedLeads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'connected')
      .limit(10);

    if (error) {
      console.log(`  Follow-up query failed: ${error.message}`);
      return [];
    }

    if (!connectedLeads || connectedLeads.length === 0) {
      console.log('  No connected leads awaiting follow-up.');
      return [];
    }

    console.log(`  ${connectedLeads.length} connected leads found — drafting follow-ups...`);

    for (const lead of connectedLeads) {
      try {
        const isKatrinaLane = config.compliance.katrina_gate_lanes.includes(lead.lane);
        const systemPrompt = `You are the Outreach Agent for Alfred Colvin. Write a LinkedIn follow-up message (max 150 words) to someone who just accepted Alfred's connection request.
Alfred is an AI automation consultant and entrepreneur in Indianapolis. His voice: professional, warm, direct, faith-rooted.
This is the FIRST message after connecting. Deliver real value immediately. Do NOT pitch.
Format: 1 sentence of context or shared ground → 1 specific insight or resource relevant to their work → 1 soft question (not "can I get 15 minutes?").
NO "Just wanted to follow up", NO "Thanks for connecting", NO generic openers.
Return JSON: { draft: string, compliance_flags: string[] }`;

        const response = await callGPT(
          config.model_routing.outreach_drafts,
          systemPrompt,
          `Lead: ${lead.name ?? '[Contact]'}, ${lead.title ?? 'unknown role'} at ${lead.company}. Lane: ${lead.lane}. Original fit reason: ${lead.fit_reason ?? 'n/a'}`
        );

        const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());

        followUpDrafts.push({
          lead_name: lead.name ?? null,
          lead_company: lead.company,
          lane: lead.lane,
          message_type: 'linkedin_followup',
          draft: parsed.draft ?? '',
          priority_score: Math.min((lead.qualification_score ?? 7) + 1, 10), // connected = higher priority
          compliance_flags: parsed.compliance_flags ?? [],
          katrina_review_required: isKatrinaLane,
          status: 'pending_review',
        });
      } catch (err) {
        console.log(`  Follow-up draft failed for ${lead.company}: ${String(err).slice(0, 60)}`);
      }
    }

    console.log(`  Follow-up drafts created: ${followUpDrafts.length}`);
  } catch {
    console.log('  Follow-up step skipped (leads table may not have status/follow_up_sent_at columns yet — apply migration 003)');
  }

  return followUpDrafts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4 — Outreach Prep (DRAFTS ONLY)
// ═══════════════════════════════════════════════════════════════════════════════
async function step4_outreachPrep(leads: Lead[], config: GabrielConfig): Promise<OutreachDraft[]> {
  console.log('\n[Step 4] Preparing outreach drafts (REVIEW REQUIRED — never auto-sent)...');
  const drafts: OutreachDraft[] = [];
  const topLeads = leads
    .sort((a, b) => b.qualification_score - a.qualification_score)
    .slice(0, config.outreach.max_drafts_per_run);

  for (const lead of topLeads) {
    try {
      const isKatrinaLane = config.compliance.katrina_gate_lanes.includes(lead.lane);
      const isRealLead = lead.source && lead.source.startsWith('firecrawl_web');
      const systemPrompt = `You are the Outreach Agent for Alfred Colvin. Write a LinkedIn connection request (max 300 chars) for this lead.
Alfred is an AI automation consultant and entrepreneur in Indianapolis. His voice: professional, warm, direct, faith-rooted.
FORBIDDEN openers: "I came across", "I admire", "I love what you're doing", "I noticed", "I hope this finds you".
Instead: lead with a specific observation about their industry, a shared Indianapolis context, or a direct value statement.
${isRealLead ? 'This is a real company found via web research. Reference their actual industry context.' : 'Note: lead source uncertain — keep message general.'}
NO pitch in the connection request. One sentence max.
Return JSON: { draft: string, compliance_flags: string[] }`;

      const response = await callGPT(
        config.model_routing.outreach_drafts,
        systemPrompt,
        `Lead: ${lead.name}, ${lead.title} at ${lead.company}. Lane: ${lead.lane}. Why they fit: ${lead.fit_reason}`
      );

      const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());

      drafts.push({
        lead_name: lead.name,
        lead_company: lead.company,
        lane: lead.lane,
        message_type: 'linkedin_connection',
        draft: parsed.draft ?? '',
        priority_score: lead.qualification_score,
        compliance_flags: parsed.compliance_flags ?? [],
        katrina_review_required: isKatrinaLane,
        status: 'pending_review',
      });
    } catch (err) {
      console.log(`  Draft failed for ${lead.name}: ${String(err).slice(0, 60)}`);
    }
  }

  console.log(`  Outreach drafts created: ${drafts.length} (awaiting Alfred's approval)`);
  return drafts;
}

// ── Evidence Scanner ─────────────────────────────────────────────────────────
// Blocks hallucinated case studies, fake client results, and unsupported claims
const HALLUCINATION_PATTERNS = [
  /one of our clients/i,
  /a client of (mine|ours|Alfred)/i,
  /our clients (report|say|found|saw|experienced)/i,
  /case study/i,
  /results show/i,
  /improved their bottom line/i,
  /\d+%\s*(increase|improvement|growth|reduction|savings|decrease)/i,
  /client said/i,
  /testimonial/i,
  /customers report/i,
  /consider the story of/i,
];

function scanForHallucinations(draft: string): string[] {
  const flags: string[] = [];
  for (const pattern of HALLUCINATION_PATTERNS) {
    if (pattern.test(draft)) {
      flags.push(`UNVERIFIED_CLAIM: "${pattern.source}"`);
    }
  }
  return flags;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 5 — Content Generation (DRAFTS ONLY)
// ═══════════════════════════════════════════════════════════════════════════════
async function step5_contentGen(config: GabrielConfig): Promise<ContentDraft[]> {
  console.log('\n[Step 5] Generating content drafts (REVIEW REQUIRED — never auto-published)...');
  const drafts: ContentDraft[] = [];

  // Rotate target lane by day of week — not always active_lanes[0]
  const dayOfWeek = new Date().getDay(); // 0=Sun, 1=Mon, etc.
  const targetLane = config.active_lanes[dayOfWeek % config.active_lanes.length];
  const isKatrinaLane = config.compliance.katrina_gate_lanes.includes(targetLane);

  console.log(`  Target lane: ${targetLane} (day rotation: ${dayOfWeek} mod ${config.active_lanes.length})`);

  try {
    const systemPrompt = `You are Genius, the content agent for Alfred Colvin. Write a LinkedIn post for the ${targetLane} business.
Alfred's voice: professional, warm, educational, faith-rooted. Not corporate. Speaks to business owners in Indianapolis.
Format: Strong hook first line (NO emoji, NO "Are you..." rhetorical questions) + 3-4 body paragraphs + CTA. Under 1300 chars.
IMPORTANT: Do NOT invent client stories, case studies, or results you cannot verify. If you reference a result, label it [hypothesis] or [example scenario].
Return JSON: { draft: string, character_count: number }`;

    const response = await callGPT(
      config.model_routing.content_generation,
      systemPrompt,
      `Write a LinkedIn post for ${targetLane} for ${TODAY}. Be specific about Indianapolis context. No fabricated case studies.`
    );

    const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
    const draft = parsed.draft ?? '';

    // Run evidence scanner — block if hallucination detected
    const hallucinationFlags = scanForHallucinations(draft);
    if (hallucinationFlags.length > 0) {
      console.log(`  ⚠️  Content draft BLOCKED by evidence scanner: ${hallucinationFlags.join(', ')}`);
      console.log(`  Regenerating without unverified claims...`);

      // Try once more with stricter instruction
      const retry = await callGPT(
        config.model_routing.content_generation,
        systemPrompt + '\nSTRICT RULE: Do not reference any specific client, company result, or case study. Every claim must be generally true or labeled [hypothesis].',
        `Rewrite the LinkedIn post for ${targetLane}. No client stories. No fabricated results.`
      ).catch(() => '{}');

      const retryParsed = JSON.parse(retry.replace(/```json|```/g, '').trim());
      const retryDraft = retryParsed.draft ?? '';
      const retryFlags = scanForHallucinations(retryDraft);

      if (retryFlags.length > 0) {
        console.log(`  ✗ Content draft archived — evidence scanner failed twice. Not added to review queue.`);
        return drafts; // Return empty — do not queue bad content
      }

      drafts.push({
        lane: targetLane,
        platform: 'linkedin',
        content_type: 'post',
        draft: retryDraft,
        character_count: retryDraft.length,
        review_required: true,
        status: 'pending_review',
        katrina_review_required: isKatrinaLane,
      } as ContentDraft & { katrina_review_required?: boolean });
    } else {
      drafts.push({
        lane: targetLane,
        platform: 'linkedin',
        content_type: 'post',
        draft,
        character_count: parsed.character_count ?? draft.length,
        review_required: true,
        status: 'pending_review',
        katrina_review_required: isKatrinaLane,
      } as ContentDraft & { katrina_review_required?: boolean });
    }
  } catch (err) {
    console.log(`  Content gen failed: ${String(err).slice(0, 80)}`);
  }

  console.log(`  Content drafts created: ${drafts.length} (awaiting Alfred's approval)`);
  return drafts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 6 — SEO Intelligence (simplified — full Solomon skill files separate)
// ═══════════════════════════════════════════════════════════════════════════════
async function step6_seoIntelligence(config: GabrielConfig): Promise<string[]> {
  console.log('\n[Step 6] Pulling SEO opportunities...');
  const opportunities: string[] = [];

  try {
    const response = await callGPT(
      config.model_routing.seo_synthesis,
      'You are Solomon, the SEO agent. Identify 3 specific keyword or on-page SEO opportunities for Alfred Colvin\'s active business lanes. Be specific — real keywords, real actions.',
      `Active lanes: ${config.active_lanes.join(', ')}. Today is ${TODAY}. Give 3 actionable opportunities.`
    );
    const lines = response.split('\n').filter(l => l.trim()).slice(0, 3);
    opportunities.push(...lines);
  } catch (err) {
    console.log(`  SEO step failed: ${String(err).slice(0, 80)}`);
  }

  console.log(`  SEO opportunities found: ${opportunities.length}`);
  return opportunities;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 7 — Marketing Recommendations
// ═══════════════════════════════════════════════════════════════════════════════
async function step7_marketingRecs(config: GabrielConfig): Promise<string[]> {
  console.log('\n[Step 7] Generating marketing recommendations...');
  const recs: string[] = [];

  try {
    const response = await callGPT(
      config.model_routing.content_generation,
      'You are Genius, the marketing agent. Give Alfred 2 high-ROI marketing recommendations for today. Be specific and actionable.',
      `Active lanes: ${config.active_lanes.join(', ')}. Date: ${TODAY}.`
    );
    const lines = response.split('\n').filter(l => l.trim()).slice(0, 2);
    recs.push(...lines);
  } catch (err) {
    console.log(`  Marketing recs failed: ${String(err).slice(0, 80)}`);
  }

  console.log(`  Marketing recommendations: ${recs.length}`);
  return recs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 8 — Deduplicate
// ═══════════════════════════════════════════════════════════════════════════════
async function step8_dedup(leads: Lead[]): Promise<Lead[]> {
  console.log(`\n[Step 8] Deduplicating ${leads.length} leads against Supabase CRM...`);

  try {
    const linkedinUrls = leads.map(l => l.linkedin_url).filter(Boolean);
    const { data: existing } = await supabase
      .from('leads')
      .select('linkedin_url, last_contacted_at')
      .in('linkedin_url', linkedinUrls as string[]);

    const recentlyContacted = new Set<string>(
      (existing ?? [])
        .filter(r => {
          if (!r.last_contacted_at) return false;
          const daysSince = (Date.now() - new Date(r.last_contacted_at).getTime()) / (1000 * 60 * 60 * 24);
          return daysSince < 30;
        })
        .map(r => r.linkedin_url)
    );

    const unique = leads.filter(l => !l.linkedin_url || !recentlyContacted.has(l.linkedin_url));
    console.log(`  After dedup: ${unique.length} unique leads (removed ${leads.length - unique.length} duplicates)`);
    return unique;
  } catch {
    console.log('  Dedup: leads table not found — skipping (no duplicates removed)');
    return leads;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 9 — Score Leads
// ═══════════════════════════════════════════════════════════════════════════════
async function step9_scoreLeads(leads: Lead[]): Promise<Lead[]> {
  console.log('\n[Step 9] Scoring leads 1–10...');
  // Leads already have qualification_score from step 3
  // Sort high → low, filter below threshold (5)
  const scored = leads
    .filter(l => l.qualification_score >= 5)
    .sort((a, b) => b.qualification_score - a.qualification_score);
  console.log(`  Leads after scoring filter: ${scored.length}`);
  return scored;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 10 — Categorize
// ═══════════════════════════════════════════════════════════════════════════════
function step10_categorize(
  leads: Lead[],
  outreachDrafts: OutreachDraft[],
  contentDrafts: ContentDraft[],
  seoOpportunities: string[]
): { outreach: OutreachDraft[]; content: ContentDraft[]; seo: string[] } {
  console.log('\n[Step 10] Categorizing outputs into review queues...');
  const result = {
    outreach: outreachDrafts.filter(d => d.priority_score >= 7),
    content: contentDrafts,
    seo: seoOpportunities,
  };
  console.log(`  Outreach queue: ${result.outreach.length} | Content queue: ${result.content.length} | SEO queue: ${result.seo.length}`);
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 11 — Build Review Package
// ═══════════════════════════════════════════════════════════════════════════════
function step11_buildReviewPackage(
  outreachQueue: OutreachDraft[],
  contentQueue: ContentDraft[],
  seoQueue: string[],
  marketingRecs: string[]
): string {
  console.log('\n[Step 11] Building human review package...');
  let pkg = `GABRIEL REVIEW PACKAGE — ${TODAY}\n${'='.repeat(50)}\n\n`;

  if (outreachQueue.length > 0) {
    pkg += `OUTREACH DRAFTS (${outreachQueue.length}) — REQUIRES YOUR APPROVAL BEFORE SENDING\n`;
    pkg += '-'.repeat(40) + '\n';
    outreachQueue.forEach((d, i) => {
      const displayName = d.lead_name || '[Contact]';
      pkg += `${i + 1}. ${displayName} @ ${d.lead_company} (${d.lane}) — Score: ${d.priority_score}/10\n`;
      pkg += `   "${d.draft.slice(0, 100)}..."\n`;
      if (d.katrina_review_required) pkg += `   ⚠️  KATRINA REVIEW REQUIRED\n`;
      pkg += '\n';
    });
  }

  if (contentQueue.length > 0) {
    pkg += `CONTENT DRAFTS (${contentQueue.length}) — REQUIRES YOUR APPROVAL BEFORE PUBLISHING\n`;
    pkg += '-'.repeat(40) + '\n';
    contentQueue.forEach((d, i) => {
      pkg += `${i + 1}. ${d.platform.toUpperCase()} post for ${d.lane} (${d.character_count} chars)\n`;
      pkg += `   "${d.draft.slice(0, 120)}..."\n\n`;
    });
  }

  if (seoQueue.length > 0) {
    pkg += `SEO OPPORTUNITIES (${seoQueue.length})\n`;
    pkg += '-'.repeat(40) + '\n';
    seoQueue.forEach((opp, i) => pkg += `${i + 1}. ${opp.slice(0, 120)}\n`);
    pkg += '\n';
  }

  if (marketingRecs.length > 0) {
    pkg += `MARKETING RECOMMENDATIONS\n`;
    pkg += '-'.repeat(40) + '\n';
    marketingRecs.forEach((rec, i) => pkg += `${i + 1}. ${rec.slice(0, 120)}\n`);
  }

  return pkg;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 12 — Save Outputs
// ═══════════════════════════════════════════════════════════════════════════════
async function step12_saveOutputs(
  leads: Lead[],
  outreachDrafts: OutreachDraft[],
  contentDrafts: ContentDraft[]
): Promise<void> {
  console.log('\n[Step 12] Saving outputs to Supabase and data folders...');

  // Use timestamp suffix to prevent overwrites on same-day re-runs
  const leadsPath = path.join(DATA_PATH, `leads/${TODAY}-${RUN_TIMESTAMP}-leads.json`);
  const outreachPath = path.join(DATA_PATH, `outreach/${TODAY}-${RUN_TIMESTAMP}-outreach-drafts.json`);
  const contentPath = path.join(DATA_PATH, `content/${TODAY}-${RUN_TIMESTAMP}-content-drafts.json`);

  fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));
  fs.writeFileSync(outreachPath, JSON.stringify(outreachDrafts, null, 2));
  fs.writeFileSync(contentPath, JSON.stringify(contentDrafts, null, 2));

  // Save leads to Supabase CRM
  try {
    const leadsToInsert = leads
      .filter(l => l.qualification_score >= 5)
      .map(l => ({
        // name must be non-null until migration 003 drops the NOT NULL constraint
        name: l.name ?? l.company ?? 'Unknown',
        company: l.company ?? '[Unknown]',
        title: l.title ?? null,
        linkedin_url: l.linkedin_url ?? null,
        lane: l.lane,
        fit_reason: l.fit_reason,
        qualification_score: l.qualification_score,
        source: l.source,
        status: 'new',
        created_at: l.found_at ?? new Date().toISOString(),
      }));

    if (leadsToInsert.length > 0) {
      // Use insert with ignoreDuplicates — onConflict on linkedin_url requires
      // migration 003 unique constraint. Fall back to plain insert with error handling.
      const { error: leadsError } = await supabase.from('leads').insert(leadsToInsert);
      if (leadsError) {
        // Likely duplicate — not a hard failure
        console.log(`  Supabase leads CRM note: ${leadsError.message.slice(0, 100)}`);
      } else {
        console.log(`  Saved ${leadsToInsert.length} leads to Supabase CRM`);
      }
    }
  } catch (err) {
    console.log(`  Supabase leads save skipped: ${String(err).slice(0, 80)}`);
  }

  // Save outreach drafts to Supabase
  try {
    if (outreachDrafts.length > 0) {
      const { error } = await supabase.from('outreach_drafts').insert(
        outreachDrafts.map(d => ({
          lead_name: d.lead_name ?? '[Contact]',
          lead_company: d.lead_company,
          lane: d.lane,
          message_type: d.message_type,
          draft: d.draft,
          priority_score: d.priority_score,
          compliance_flags: d.compliance_flags,
          katrina_review_required: d.katrina_review_required,
          status: 'pending_review',
          created_at: new Date().toISOString(),
        }))
      );
      if (error) console.log(`  Supabase outreach save warning: ${error.message}`);
      else console.log(`  Saved ${outreachDrafts.length} outreach drafts to Supabase`);
    }
  } catch (err) {
    console.log(`  Supabase outreach save skipped: ${String(err).slice(0, 80)}`);
  }

  console.log(`  Files written: ${leadsPath}`);
  console.log(`  Files written: ${outreachPath}`);
  console.log(`  Files written: ${contentPath}`);
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 13 — Generate Daily Report
// ═══════════════════════════════════════════════════════════════════════════════
async function step13_generateReport(
  rawLeads: Lead[],
  uniqueLeads: Lead[],
  outreachDrafts: OutreachDraft[],
  contentDrafts: ContentDraft[],
  seoOpportunities: string[],
  top3Actions: Array<{ rank: number; action: string; lane: string; why: string; effort: string }>,
  errors: string[]
): Promise<DailyReport> {
  console.log('\n[Step 13] Generating daily report...');

  const report: DailyReport = {
    date: TODAY,
    run_start: new Date(RUN_START).toISOString(),
    run_end: new Date().toISOString(),
    run_duration_ms: Date.now() - RUN_START,
    summary: {
      leads_found: rawLeads.length,
      leads_after_dedup: uniqueLeads.length,
      leads_queued_for_review: outreachDrafts.filter(d => d.priority_score >= 7).length,
      outreach_drafts_created: outreachDrafts.length,
      content_drafts_created: contentDrafts.length,
      seo_opportunities_found: seoOpportunities.length,
    },
    top_3_actions: top3Actions,
    review_queue: {
      outreach: outreachDrafts.filter(d => d.priority_score >= 7).length,
      content: contentDrafts.length,
      seo: seoOpportunities.length,
      opportunities: 0,
    },
    errors,
    skipped_steps: [],
    skipped_lanes: SKIPPED_LANES,
  };

  const reportPath = path.join(DATA_PATH, `reports/${TODAY}-${RUN_TIMESTAMP}-daily-report.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`  Report saved: ${reportPath}`);
  return report;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 14 — Top 3 Actions
// ═══════════════════════════════════════════════════════════════════════════════
async function step14_top3Actions(
  outreachDrafts: OutreachDraft[],
  contentDrafts: ContentDraft[],
  seoOpportunities: string[],
  config: GabrielConfig
): Promise<Array<{ rank: number; action: string; lane: string; why: string; effort: string }>> {
  console.log('\n[Step 14] Identifying top 3 actions...');

  try {
    const context = [
      outreachDrafts.length > 0 ? `${outreachDrafts.length} outreach drafts ready for review` : '',
      contentDrafts.length > 0 ? `${contentDrafts.length} content pieces ready for review` : '',
      seoOpportunities.length > 0 ? `SEO opportunities: ${seoOpportunities[0]?.slice(0, 80)}` : '',
    ].filter(Boolean).join('. ');

    const response = await callGPT(
      config.model_routing.daily_report,
      'You identify the top 3 highest-ROI actions for Alfred Colvin today. Be specific. Return JSON array of 3 items: { rank, action, lane, why, effort (low|medium|high) }',
      `Available today: ${context}. Active lanes: ${config.active_lanes.join(', ')}.`
    );

    return JSON.parse(response.replace(/```json|```/g, '').trim());
  } catch {
    return [
      { rank: 1, action: `Review ${outreachDrafts.length} outreach drafts`, lane: 'colvin_enterprises', why: 'Highest conversion opportunity', effort: 'low' },
      { rank: 2, action: `Review and post ${contentDrafts.length} content pieces`, lane: 'colvin_enterprises', why: 'Build audience and pipeline', effort: 'low' },
      { rank: 3, action: 'Check SEO opportunities', lane: 'indiana_backflow', why: 'Quick organic traffic wins', effort: 'medium' },
    ].slice(0, 3);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 15 — Telegram Brief
// ═══════════════════════════════════════════════════════════════════════════════
async function step15_telegramBrief(
  report: DailyReport,
  top3: Array<{ rank: number; action: string; lane: string }>
): Promise<void> {
  console.log('\n[Step 15] Sending Telegram daily brief...');

  const brief = [
    `<b>GABRIEL DAILY BRIEF — ${TODAY}</b>`,
    '',
    `LEADS: ${report.summary.leads_found} found, ${report.summary.leads_queued_for_review} queued for review`,
    `OUTREACH DRAFTS: ${report.summary.outreach_drafts_created} ready for your approval`,
    `CONTENT: ${report.summary.content_drafts_created} pieces ready for your review`,
    `SEO: ${report.summary.seo_opportunities_found} opportunities`,
    '',
    '<b>TOP 3 TODAY:</b>',
    ...top3.map(a => `${a.rank}. ${a.action} (${a.lane})`),
    '',
    `Run time: ${Math.round(report.run_duration_ms / 1000)}s`,
    report.errors.length > 0 ? `⚠️ ${report.errors.length} errors — check logs` : '✅ Clean run',
    report.skipped_lanes && report.skipped_lanes.length > 0
      ? `⚠️ Skipped lanes: ${report.skipped_lanes.map(s => s.lane).join(', ')}`
      : '',
  ].filter(Boolean).join('\n');

  await sendTelegram(brief);
  console.log('  Telegram brief sent.');

  // Separate Katrina notification for high-risk lanes
  if (KATRINA_TELEGRAM_CHAT_ID) {
    const katrinaItems = top3.filter(() => false); // placeholder — check outreach items
    const katinaBody = JSON.stringify({ chat_id: KATRINA_TELEGRAM_CHAT_ID, text: `<b>KATRINA REVIEW NEEDED — ${TODAY}</b>\n\nGabriel queued items for ${report.date} that require your compliance review before Alfred can approve.\n\nCheck Alfred's review queue.`, parse_mode: 'HTML' });
    const kReq = https.request({ hostname: 'api.telegram.org', path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(katinaBody) } }, (res) => { res.on('data', () => {}); res.on('end', () => {}); });
    kReq.on('error', () => {});
    kReq.write(katinaBody);
    kReq.end();
    console.log('  Katrina notification sent.');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 16 — Save Memory (CRITICAL: must run every time)
// ═══════════════════════════════════════════════════════════════════════════════
async function step16_saveMemory(
  report: DailyReport,
  outreachDrafts: OutreachDraft[],
  top3: Array<{ rank: number; action: string; lane: string; why: string; effort: string }>,
  errors: string[]
): Promise<void> {
  console.log('\n[Step 16] Saving run memory to Supabase (carry-forward, pending, stats)...');

  try {
    const pendingActions = outreachDrafts
      .filter(d => d.status === 'pending_review')
      .map(d => ({
        type: 'outreach_draft',
        company: d.lead_company,
        lane: d.lane,
        score: d.priority_score,
        katrina: d.katrina_review_required,
      }));

    const carryForward = outreachDrafts
      .filter(d => d.priority_score >= 8 && d.status === 'pending_review')
      .map(d => ({
        type: 'high_priority_outreach',
        company: d.lead_company,
        lane: d.lane,
        score: d.priority_score,
      }));

    const { error } = await supabase.from('gabriel_memory').insert({
      session_date: TODAY,
      leads_found: report.summary.leads_found,
      leads_scored: report.summary.leads_after_dedup,
      leads_queued: report.summary.leads_queued_for_review,
      outreach_drafts_created: report.summary.outreach_drafts_created,
      content_drafts_created: report.summary.content_drafts_created,
      seo_opportunities: report.summary.seo_opportunities_found,
      pending_actions: pendingActions,
      carry_forward: carryForward,
      top_3_actions: top3,
      run_errors: errors.map(e => ({ error: e, timestamp: new Date().toISOString() })),
      run_duration_ms: report.run_duration_ms,
    });

    if (error) {
      console.log(`  Memory save warning: ${error.message}`);
    } else {
      console.log(`  Memory saved. Pending: ${pendingActions.length} items. Carry-forward: ${carryForward.length} items.`);
    }
  } catch (err) {
    console.log(`  Memory save failed: ${String(err).slice(0, 80)}`);
    // This is a P1 failure — alert separately
    await sendTelegram(`⚠️ GABRIEL MEMORY SAVE FAILED — ${TODAY}\nPending actions will not carry forward to tomorrow.\nError: ${String(err).slice(0, 150)}`).catch(() => {});
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — Run all 16 steps
// ═══════════════════════════════════════════════════════════════════════════════
async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          GABRIEL DAILY RUN — COLVIN CONTENT OS              ║');
  console.log(`║          ${TODAY}                                    ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  ensureDataDirs();

  const errors: string[] = [];
  let config: GabrielConfig;

  // Step 1
  try {
    config = await step1_loadConfig();
  } catch (err) {
    const msg = `FATAL: Config load failed — ${String(err)}`;
    console.error(msg);
    await sendTelegram(`GABRIEL ERROR — ${TODAY}\n${msg}`);
    process.exit(1);
  }

  // Step 2
  const memory = await step2_loadMemory();
  console.log(`  Carry-forward items: ${Array.isArray(memory.carry_forward) ? memory.carry_forward.length : 0}`);

  // Steps 3–7 (intelligence gathering — each step is non-fatal)
  const rawLeads = await step3_leadScout(config).catch(e => { errors.push(`Step 3: ${e}`); return []; });
  const followUpDrafts = await step3b_followUpQueue(config).catch(e => { errors.push(`Step 3b: ${e}`); return []; });
  const allOutreachDrafts = await step4_outreachPrep(rawLeads, config).catch(e => { errors.push(`Step 4: ${e}`); return []; });
  // Merge follow-ups into outreach drafts — they go to same review queue
  const outreachDrafts = [...allOutreachDrafts, ...followUpDrafts];
  const contentDrafts = await step5_contentGen(config).catch(e => { errors.push(`Step 5: ${e}`); return []; });
  const seoOpportunities = await step6_seoIntelligence(config).catch(e => { errors.push(`Step 6: ${e}`); return []; });
  const marketingRecs = await step7_marketingRecs(config).catch(e => { errors.push(`Step 7: ${e}`); return []; });

  // Steps 8–10 (processing)
  const uniqueLeads = await step8_dedup(rawLeads).catch(e => { errors.push(`Step 8: ${e}`); return rawLeads; });
  const scoredLeads = await step9_scoreLeads(uniqueLeads).catch(e => { errors.push(`Step 9: ${e}`); return uniqueLeads; });
  const { outreach, content, seo } = step10_categorize(scoredLeads, outreachDrafts, contentDrafts, seoOpportunities);

  // Steps 11–12 (package + save)
  const reviewPackage = step11_buildReviewPackage(outreach, content, seo, marketingRecs);
  fs.writeFileSync(path.join(DATA_PATH, `review-queue/${TODAY}-${RUN_TIMESTAMP}-review-package.txt`), reviewPackage);

  await step12_saveOutputs(scoredLeads, outreachDrafts, contentDrafts).catch(e => errors.push(`Step 12: ${e}`));

  // Steps 13–15 (report + deliver)
  const top3 = await step14_top3Actions(outreach, content, seo, config).catch(e => { errors.push(`Step 14: ${e}`); return []; });
  const report = await step13_generateReport(rawLeads, scoredLeads, outreachDrafts, contentDrafts, seoOpportunities, top3, errors);

  await step15_telegramBrief(report, top3).catch(e => console.log(`  Telegram failed: ${e}`));

  // Optional: Send review package as HTML email via Resend
  if (RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(RESEND_API_KEY);
      const emailHtml = `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1a1a1a">
          <h2 style="margin:0 0 16px;font-size:20px">Gabriel Daily Brief — ${TODAY}</h2>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
            <tr><td style="padding:8px;border:1px solid #eee">Leads found</td><td style="padding:8px;border:1px solid #eee;font-weight:bold">${report.summary.leads_found}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee">Outreach drafts</td><td style="padding:8px;border:1px solid #eee;font-weight:bold">${report.summary.outreach_drafts_created}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee">Content drafts</td><td style="padding:8px;border:1px solid #eee;font-weight:bold">${report.summary.content_drafts_created}</td></tr>
            <tr><td style="padding:8px;border:1px solid #eee">Follow-up drafts</td><td style="padding:8px;border:1px solid #eee;font-weight:bold">${followUpDrafts.length}</td></tr>
          </table>
          <h3 style="margin:0 0 8px;font-size:16px">Top 3 Actions</h3>
          <ol style="margin:0 0 24px;padding-left:20px">${top3.map(a => `<li style="margin-bottom:8px"><strong>${a.action}</strong> (${a.lane}) — ${a.why}</li>`).join('')}</ol>
          ${report.skipped_lanes && report.skipped_lanes.length > 0 ? `<p style="color:#b45309;background:#fef3c7;padding:12px;border-radius:6px">⚠️ Skipped lanes: ${report.skipped_lanes.map(s => s.lane).join(', ')}</p>` : ''}
          ${errors.length > 0 ? `<p style="color:#b91c1c;background:#fee2e2;padding:12px;border-radius:6px">⚠️ ${errors.length} errors — check logs</p>` : '<p style="color:#065f46;background:#d1fae5;padding:12px;border-radius:6px">✓ Clean run</p>'}
          <p style="font-size:12px;color:#999;margin-top:32px">Gabriel Automation OS · ${new Date().toISOString()}</p>
        </div>`;

      await resend.emails.send({
        from: 'Gabriel <onboarding@resend.dev>',
        to: ['itsinthebible.info@gmail.com'],
        subject: `Gabriel Brief — ${TODAY} — ${report.summary.leads_found} leads, ${report.summary.outreach_drafts_created} drafts`,
        html: emailHtml,
        text: `Gabriel Daily Brief ${TODAY}\nLeads: ${report.summary.leads_found}\nOutreach drafts: ${report.summary.outreach_drafts_created}\nContent: ${report.summary.content_drafts_created}\nErrors: ${errors.length}`,
      });
      console.log('  Daily brief sent via Resend email.');
    } catch (emailErr) {
      console.log(`  Resend email failed (non-fatal): ${String(emailErr).slice(0, 80)}`);
    }
  }

  // Step 16 — Save memory (CRITICAL — must run every time)
  await step16_saveMemory(report, outreachDrafts, top3, errors).catch(async (e) => {
    console.log(`  CRITICAL: Memory save failed — ${e}`);
    errors.push(`Step 16 CRITICAL: ${e}`);
  });

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('GABRIEL DAILY RUN COMPLETE');
  console.log('='.repeat(60));
  console.log(`Leads found:         ${report.summary.leads_found}`);
  console.log(`Outreach drafts:     ${report.summary.outreach_drafts_created} (pending Alfred's approval)`);
  console.log(`Content drafts:      ${report.summary.content_drafts_created} (pending Alfred's approval)`);
  console.log(`SEO opportunities:   ${report.summary.seo_opportunities_found}`);
  console.log(`Run time:            ${Math.round(report.run_duration_ms / 1000)}s`);
  console.log(`Errors:              ${errors.length}`);
  if (errors.length > 0) errors.forEach(e => console.log(`  - ${e}`));
  console.log('');
  console.log('Review queue ready: automation-os/data/review-queue/');
  console.log('='.repeat(60));
}

main().catch(async (err) => {
  console.error('FATAL ERROR:', err);
  await sendTelegram(`GABRIEL FATAL ERROR — ${TODAY}\n${String(err).slice(0, 300)}`).catch(() => {});
  process.exit(1);
});
