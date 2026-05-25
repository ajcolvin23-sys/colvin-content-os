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
const BRAVE_SEARCH_API_KEY = process.env.BRAVE_SEARCH_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const KATRINA_TELEGRAM_CHAT_ID = process.env.KATRINA_TELEGRAM_CHAT_ID || '';
const AGENTMAIL_API_KEY = process.env.AGENTMAIL_API_KEY || '';
const AGENTMAIL_INBOX_ID = process.env.AGENTMAIL_INBOX_ID || '';
  // Inbox ID looks like: gabriel-outreach@users.agentmail.to
  // Create it at https://app.agentmail.to → Inboxes → New Inbox

// ── Email sending identity ────────────────────────────────────────────────────
// Set RESEND_FROM_EMAIL after verifying colvinenterprises.com in Resend dashboard.
// Until then falls back to onboarding@resend.dev (functional but lower trust).
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_FROM_NAME  = process.env.RESEND_FROM_NAME  || 'Alfred Colvin';
const RESEND_REPLY_TO   = process.env.RESEND_REPLY_TO   || 'itsinthebible.info@gmail.com';

const TODAY = new Date().toISOString().split('T')[0];
const RUN_TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
const RUN_START = Date.now();
const RUN_ID = `gabriel-${TODAY}-${RUN_START}`;
const SKIPPED_LANES: Array<{ lane: string; reason: string; query?: string }> = [];

// ── Clients ──────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

function toDbScore(score: number | null | undefined): number {
  const value = Number(score ?? 0);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10, Math.round(value)));
}

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

interface SolomonSEOReport {
  lane: string;
  query_used: string;
  serp_results: Array<{ url: string; title: string; description: string }>;
  keyword_patterns: string[];
  content_gaps: string[];
  opportunities: string[];
  evidence_urls: string[];
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

// ── Retry Helper ─────────────────────────────────────────────────────────────
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 2,
  delayMs = 2000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        console.log(`  [retry] ${label}: attempt ${attempt} failed — retrying in ${delayMs}ms`);
        await new Promise(r => setTimeout(r, delayMs));
        delayMs *= 2; // exponential backoff
      }
    }
  }
  throw lastError;
}

// ── AI Usage Logger ───────────────────────────────────────────────────────────
const COST_PER_M_TOKENS: Record<string, { input: number; output: number }> = {
  'gpt-4o':           { input: 5.00,  output: 15.00 },
  'gpt-4o-mini':      { input: 0.15,  output: 0.60  },
  'claude-opus-4-5':  { input: 15.00, output: 75.00 },
  'claude-haiku-3-5': { input: 0.80,  output: 4.00  },
  'gemini-2.0-flash': { input: 0,     output: 0     }, // free tier
};

async function logAIUsage(params: {
  provider: string; model: string; taskType: string; lane?: string;
  inputTokens?: number; outputTokens?: number; durationMs?: number;
  status?: string; errorMessage?: string;
}): Promise<void> {
  try {
    const costs = COST_PER_M_TOKENS[params.model] || { input: 0, output: 0 };
    const estimatedCost =
      ((params.inputTokens || 0) / 1_000_000) * costs.input +
      ((params.outputTokens || 0) / 1_000_000) * costs.output;

    await supabase.from('ai_usage_logs').insert({
      run_id: RUN_ID,
      provider: params.provider,
      model: params.model,
      task_type: params.taskType,
      lane: params.lane || null,
      input_tokens: params.inputTokens || 0,
      output_tokens: params.outputTokens || 0,
      estimated_cost_usd: estimatedCost,
      status: params.status || 'success',
      error_message: params.errorMessage || null,
      duration_ms: params.durationMs || 0,
    });
  } catch {
    // Non-fatal — logging never crashes the run
  }
}

// ── GPT Helper (with logging + retry) ────────────────────────────────────────
async function callGPT(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  opts?: { taskType?: string; lane?: string; maxTokens?: number; temperature?: number }
): Promise<string> {
  const start = Date.now();
  try {
    const response = await withRetry(() => openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: opts?.temperature ?? 0.7,
      max_tokens: opts?.maxTokens ?? 2000,
    }), `callGPT:${opts?.taskType || model}`);

    const content = response.choices[0]?.message?.content ?? '';
    logAIUsage({
      provider: 'openai', model,
      taskType: opts?.taskType || 'general',
      lane: opts?.lane,
      inputTokens: response.usage?.prompt_tokens,
      outputTokens: response.usage?.completion_tokens,
      durationMs: Date.now() - start,
      status: content ? 'success' : 'empty_response',
    }).catch(() => {});
    return content;
  } catch (err) {
    logAIUsage({
      provider: 'openai', model,
      taskType: opts?.taskType || 'general',
      lane: opts?.lane,
      durationMs: Date.now() - start,
      status: 'error',
      errorMessage: String(err).slice(0, 200),
    }).catch(() => {});
    throw err;
  }
}

// ── Claude Helper (Anthropic — claude-haiku-3-5 for fast analysis) ────────────
// Used for: deduplication verification, categorization, score cross-check
// Falls back to gpt-4o-mini if ANTHROPIC_API_KEY not set
async function callClaude(
  prompt: string,
  opts?: { taskType?: string; lane?: string; model?: string }
): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    return callGPT('gpt-4o-mini', 'You are a helpful assistant.', prompt, opts);
  }
  const model = opts?.model || 'claude-haiku-3-5';
  const start = Date.now();
  return new Promise((resolve) => {
    const body = JSON.stringify({
      model,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.content?.[0]?.text ?? '';
          logAIUsage({
            provider: 'anthropic', model,
            taskType: opts?.taskType || 'general', lane: opts?.lane,
            inputTokens: parsed.usage?.input_tokens || 0,
            outputTokens: parsed.usage?.output_tokens || 0,
            durationMs: Date.now() - start,
            status: text ? 'success' : 'empty_response',
          }).catch(() => {});
          resolve(text);
        } catch { resolve(''); }
      });
    });
    req.on('error', () => resolve(''));
    req.setTimeout(20000, () => { req.destroy(); resolve(''); });
    req.write(body);
    req.end();
  });
}

// ── Gemini Helper (free tier — fallback to GPT-4o-mini if no key) ─────────────
async function callGemini(
  prompt: string,
  opts?: { taskType?: string; lane?: string }
): Promise<string> {
  if (!GEMINI_API_KEY) {
    return callGPT('gpt-4o-mini', 'You are a helpful assistant.', prompt, opts);
  }
  const start = Date.now();
  return new Promise((resolve) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1000, temperature: 0.3 },
    });
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          logAIUsage({
            provider: 'gemini', model: 'gemini-2.0-flash',
            taskType: opts?.taskType || 'general', lane: opts?.lane,
            inputTokens: parsed.usageMetadata?.promptTokenCount || 0,
            outputTokens: parsed.usageMetadata?.candidatesTokenCount || 0,
            durationMs: Date.now() - start,
            status: text ? 'success' : 'empty_response',
          }).catch(() => {});
          resolve(text);
        } catch { resolve(''); }
      });
    });
    req.on('error', () => resolve(''));
    req.setTimeout(15000, () => { req.destroy(); resolve(''); });
    req.write(body);
    req.end();
  });
}

// ── Solomon SEO Query Bank ────────────────────────────────────────────────────
// Real search queries per lane — Firecrawl fetches live SERP data
const SOLOMON_SEO_QUERIES: Record<string, string[]> = {
  indiana_backflow: [
    'backflow tester Indianapolis Indiana certified',
    'backflow prevention service Indianapolis property manager',
    'backflow certification testing Indiana county requirements',
  ],
  colvin_enterprises: [
    'AI automation consultant Indianapolis Indiana small business',
    'AI workflow automation Indianapolis consulting firm',
    'business process automation Indianapolis entrepreneur',
  ],
  music_theory_secrets: [
    'gospel piano lessons online course church musician',
    'music theory for worship leaders Indiana church',
    'learn gospel piano chords online course beginners',
  ],
  first_keys_indy: [
    'first time homebuyer assistance Indianapolis Indiana 2024 2025',
    'down payment assistance program Marion County Indiana IHCDA',
    'first time buyer grant Indianapolis low income housing',
  ],
  funding_ready_indiana: [
    'Indiana small business grant program 2024 2025 IEDC',
    'business funding Indianapolis minority owned small business',
    'Indiana SBDC grant loan program Indianapolis entrepreneur',
  ],
  // Paused lanes — queries ready for when they reactivate
  piano_app: [
    'adaptive piano learning app church musician gospel',
    'best piano learning app adults beginners gospel jazz',
    'piano app for worship leaders church musicians review',
  ],
  youtube_music: [
    'gospel piano YouTube channel music theory church musicians',
    'music theory YouTube channel worship leaders Indiana',
    'gospel music education YouTube growth strategy 2025',
  ],
  girls_got_game: [
    'youth sports leadership program Indianapolis girls nonprofit',
    'girls basketball leadership program Indianapolis Indiana',
    'youth development nonprofit Indianapolis Marion County funding',
  ],
  glory_engine: [
    'faith-based media creator economy Christian content 2025',
    'Christian comic book Yahweh faith storytelling creator',
    'faith-based YouTube content monetization strategy 2025',
  ],
};

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

// ── Brave Search fallback ────────────────────────────────────────────────────
// Used when Firecrawl returns 0 results. Free tier = 2,000 queries/month.
async function callBraveSearch(query: string, limit = 5): Promise<FirecrawlSearchResult[]> {
  if (!BRAVE_SEARCH_API_KEY) return [];
  return new Promise((resolve) => {
    const params = new URLSearchParams({ q: query, count: String(limit) });
    const req = https.request({
      hostname: 'api.search.brave.com',
      path: `/res/v1/web/search?${params}`,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': BRAVE_SEARCH_API_KEY,
      },
    }, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        try {
          const raw = Buffer.concat(chunks).toString();
          const parsed = JSON.parse(raw);
          const results = (parsed?.web?.results ?? []).map((r: { url: string; title: string; description: string }) => ({
            url: r.url,
            title: r.title,
            description: r.description,
            markdown: '',
          }));
          resolve(results as FirecrawlSearchResult[]);
        } catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(15000, () => { req.destroy(); resolve([]); });
    req.end();
  });
}

// ── AgentMail Helpers ────────────────────────────────────────────────────────
// Raw HTTPS calls to AgentMail REST API — no extra npm dependency needed

interface AgentMailMessage {
  messageId: string;
  threadId?: string;
  subject?: string;
  from?: { address: string; name?: string };
  extractedText?: string;  // reply content only, no quoted history
  text?: string;           // full body fallback
  html?: string;
  receivedAt?: string;
  labels?: string[];
}

async function fetchAgentMailUnread(inboxId: string): Promise<AgentMailMessage[]> {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.agentmail.to',
      path: `/inboxes/${encodeURIComponent(inboxId)}/messages?labels=unread&limit=20`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          // API may return { messages: [] } or { data: [] } or []
          const messages = parsed.messages ?? parsed.data ?? (Array.isArray(parsed) ? parsed : []);
          resolve(messages as AgentMailMessage[]);
        } catch { resolve([]); }
      });
    });
    req.on('error', () => resolve([]));
    req.setTimeout(10000, () => { req.destroy(); resolve([]); });
    req.end();
  });
}

async function markAgentMailRead(inboxId: string, messageId: string): Promise<void> {
  return new Promise((resolve) => {
    const body = JSON.stringify({ add_labels: ['read'], remove_labels: ['unread'] });
    const req = https.request({
      hostname: 'api.agentmail.to',
      path: `/inboxes/${encodeURIComponent(inboxId)}/messages/${encodeURIComponent(messageId)}`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AGENTMAIL_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve());
    });
    req.on('error', () => resolve()); // non-fatal
    req.write(body);
    req.end();
  });
}

// ── Blocked domains — never use leads from these sources ─────────────────────
const BLOCKED_DOMAINS = [
  'upwork.com', 'freelancer.com', 'peopleperhour.com', 'fiverr.com',
  'toptal.com', 'guru.com', 'bark.com', 'thumbtack.com', 'taskrabbit.com',
  'indeed.com', 'ziprecruiter.com', 'glassdoor.com', 'monster.com',
];

function isBlockedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    return BLOCKED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  } catch { return false; }
}

// ── Lane search query definitions — targets: LinkedIn, Reddit, Facebook, Instagram, TikTok, business sites
// NOTE: Firecrawl /v1/search does NOT support Google-style site: operators.
// All queries use plain natural language so Firecrawl's web search returns real results.
const LANE_SEARCH_QUERIES: Record<string, string[]> = {
  colvin_enterprises: [
    // AI automation buyers — Indianapolis small business owners
    'Indianapolis small business owner looking for AI automation tools to save time',
    // Operations/marketing decision makers
    'Indianapolis CEO operations director marketing director struggling with manual workflows',
    // Agency owners open to automation
    'Indianapolis marketing agency consulting firm founder automating business processes',
    // Reddit community signals
    'reddit Indianapolis entrepreneur small business AI tools workflow automation',
  ],
  indiana_backflow: [
    // Property managers needing backflow compliance
    'Indianapolis property manager backflow testing certification annual requirement',
    // Facility directors and building managers
    'Indiana facility manager building manager backflow prevention inspection compliance',
    // Landlord compliance discussions
    'Indianapolis landlord plumbing compliance backflow preventer required',
    // Property management companies in Indiana
    'Indiana property management company backflow inspection service contact',
  ],
  music_theory_secrets: [
    // Gospel piano learners seeking lessons
    'learn gospel piano chords church musician beginner online lessons',
    // Worship pianists looking for training
    'worship pianist music director gospel chord progressions learn online',
    // Church musicians seeking skill development
    'church musician gospel piano training Indianapolis Indiana worship music',
    // Reddit piano and church music communities
    'reddit piano gospel music church musician looking for lessons worship',
    // Music directors and choir directors
    'Indianapolis music director choir director worship leader gospel piano skills',
  ],
  first_keys_indy: [
    // First-time buyers researching assistance programs
    'Indianapolis first time homebuyer down payment assistance program 2025',
    // Marion County homebuyer programs
    'Marion County Indiana homebuyer grant program how to qualify apply',
    // Reddit Indianapolis real estate discussions
    'reddit Indianapolis first time home buyer FHA loan down payment help',
    // Realtors and housing counselors
    'Indianapolis realtor housing counselor first time homebuyer specialist',
  ],
  funding_ready_indiana: [
    // Indiana nonprofit and small business grant seekers
    'Indiana nonprofit executive director small business grant funding 2025',
    // SBA and SBDC grant discussions
    'Indiana small business SBA grant SBDC funding application help 2025',
    // Indianapolis entrepreneurs seeking capital
    'Indianapolis entrepreneur startup funding seed capital grant Indiana',
    // Indiana CDFIs and chambers serving small businesses
    'Indiana CDFI chamber of commerce small business grant funding contact',
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
      let rawResults = await callFirecrawlSearch(query, config.lead_scout.max_leads_per_lane_per_run);

      // Brave Search fallback if Firecrawl returns nothing
      if (rawResults.length === 0 && BRAVE_SEARCH_API_KEY) {
        console.log(`  ${lane}: Firecrawl empty — trying Brave Search fallback...`);
        rawResults = await callBraveSearch(query, config.lead_scout.max_leads_per_lane_per_run);
        if (rawResults.length > 0) console.log(`  ${lane}: Brave returned ${rawResults.length} results`);
      }

      // Filter out freelance marketplaces and job boards
      const results = rawResults.filter(r => !isBlockedDomain(r.url));
      const blocked = rawResults.length - results.length;
      if (blocked > 0) console.log(`  ${lane}: filtered ${blocked} freelance/job-board result(s)`);

      if (results.length === 0) {
        console.log(`  ${lane}: no results from Firecrawl or Brave — skipping lane`);
        SKIPPED_LANES.push({ lane, reason: 'No results from Firecrawl or Brave Search', query });
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

      let extractedRaw: unknown;
      try {
        extractedRaw = JSON.parse(extractResponse.replace(/```json|```/g, '').trim());
      } catch {
        console.log(`  ${lane}: JSON parse error on lead extraction — skipping lane`);
        SKIPPED_LANES.push({ lane, reason: 'JSON parse error on lead extraction', query });
        continue;
      }
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

      let scoresRaw: unknown;
      try {
        scoresRaw = JSON.parse(scoreResponse.replace(/```json|```/g, '').trim());
      } catch {
        console.log(`  ${lane}: JSON parse error on scoring — using default scores`);
        scoresRaw = [];
      }
      const scoresArray = Array.isArray(scoresRaw) ? scoresRaw : [];

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
    const { data: connectedLeads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('status', 'connected')
      .is('follow_up_sent_at', null)
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
// STEP 3c — AgentMail Reply Monitor
// Checks the Gabriel outreach inbox for prospect replies.
// For each unread reply:
//   1. Matches the sender to a known lead in Supabase
//   2. Drafts a suggested follow-up response (GPT)
//   3. Saves to outreach_replies table (status: pending_review)
//   4. Marks the message as read in AgentMail
// Alfred reviews and approves the suggested reply before anything goes out.
// ═══════════════════════════════════════════════════════════════════════════════
async function step3c_checkOutreachReplies(config: GabrielConfig): Promise<number> {
  console.log('\n[Step 3c] AgentMail — checking for prospect replies...');

  if (!AGENTMAIL_API_KEY || !AGENTMAIL_INBOX_ID) {
    console.log('  AgentMail not configured — skipping. Set AGENTMAIL_API_KEY + AGENTMAIL_INBOX_ID to enable.');
    return 0;
  }

  let repliesProcessed = 0;

  try {
    const messages = await fetchAgentMailUnread(AGENTMAIL_INBOX_ID);

    if (messages.length === 0) {
      console.log('  No new replies in AgentMail inbox.');
      return 0;
    }

    console.log(`  ${messages.length} unread message(s) found — processing...`);

    for (const msg of messages) {
      try {
        // Skip if already processed (idempotency guard)
        const { data: existing } = await supabase
          .from('outreach_replies')
          .select('id')
          .eq('agentmail_message_id', msg.messageId)
          .maybeSingle();

        if (existing) {
          console.log(`  Already processed ${msg.messageId} — skipping`);
          await markAgentMailRead(AGENTMAIL_INBOX_ID, msg.messageId);
          continue;
        }

        const senderEmail = msg.from?.address || '';
        const senderName  = msg.from?.name || 'Unknown';
        const replyBody   = (msg.extractedText || msg.text || '').slice(0, 800);

        // Find matching lead by email
        const { data: matchedLead } = await supabase
          .from('leads')
          .select('id, name, company, title, lane, fit_reason, qualification_score')
          .eq('email', senderEmail)
          .maybeSingle();

        const lane = matchedLead?.lane || 'colvin_enterprises';
        const isKatrinaLane = config.compliance.katrina_gate_lanes.includes(lane);

        // Draft a suggested reply — Alfred always approves before sending
        let suggestedReply = '';
        try {
          const replyDraft = await callGPT(
            config.model_routing.outreach_drafts,
            `You are Alfred Colvin's outreach assistant. Draft a warm, professional reply to this prospect's email.
Alfred's voice: direct, faith-rooted, entrepreneurial. Based in Indianapolis.
Max 150 words. No hollow openers ("Great to hear from you", "Thanks for reaching out").
Lead with a specific, relevant response to what they actually said.
This is a DRAFT — Alfred must review and approve before it goes out.
Return JSON only: { "draft": "..." }`,
            `Prospect: ${senderName} <${senderEmail}>
Subject: ${msg.subject || '(no subject)'}
Their message:
${replyBody}
Lane: ${lane}
Lead context: ${matchedLead ? `${matchedLead.title || 'Contact'} at ${matchedLead.company} — ${matchedLead.fit_reason || ''}` : 'Unknown sender (not in CRM)'}`,
            { taskType: 'outreach_drafts', lane }
          );

          const parsed = JSON.parse(replyDraft.replace(/```json|```/g, '').trim());
          suggestedReply = parsed.draft || '';
          const replySpamFlags = scanForSpamWords(suggestedReply);
          if (replySpamFlags.length > 0) {
            console.log(`  ⚠️  Spam risk in reply draft for ${senderEmail}: ${replySpamFlags.join(', ')}`);
            // Append warning so Alfred sees it in Supabase before approving
            suggestedReply += `\n\n[⚠️ SPAM RISK FLAGS: ${replySpamFlags.join(', ')} — review before sending]`;
          }
        } catch {
          suggestedReply = '[GPT draft failed — write your reply manually]';
        }

        // Save to Supabase
        const { error: insertError } = await supabase.from('outreach_replies').insert({
          agentmail_message_id: msg.messageId,
          agentmail_thread_id:  msg.threadId || null,
          inbox_id:             AGENTMAIL_INBOX_ID,
          from_email:           senderEmail,
          from_name:            senderName || null,
          subject:              msg.subject || null,
          body_text:            replyBody || null,
          lane,
          lead_id:              matchedLead?.id || null,
          suggested_reply:      suggestedReply,
          status:               'pending_review',
          received_at:          msg.receivedAt || new Date().toISOString(),
        });

        if (insertError) {
          console.log(`  Failed to save reply from ${senderEmail}: ${insertError.message}`);
        } else {
          repliesProcessed++;
          console.log(`  Reply from ${senderName} <${senderEmail}> (${lane}) — suggested response drafted${isKatrinaLane ? ' ⚠️ KATRINA REVIEW REQUIRED' : ''}`);
        }

        // Mark as read in AgentMail (always — even if Supabase save failed)
        await markAgentMailRead(AGENTMAIL_INBOX_ID, msg.messageId);

      } catch (err) {
        console.log(`  Failed to process reply ${msg.messageId}: ${String(err).slice(0, 80)}`);
      }
    }

    if (repliesProcessed > 0) {
      console.log(`  ${repliesProcessed} new repl${repliesProcessed === 1 ? 'y' : 'ies'} saved to Supabase outreach_replies — awaiting your approval.`);
    }

  } catch (err) {
    console.log(`  AgentMail reply check failed: ${String(err).slice(0, 80)}`);
  }

  return repliesProcessed;
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
      const draftText = parsed.draft ?? '';

      // Scan for spam trigger words — flag but don't block (Alfred decides)
      const spamFlags = scanForSpamWords(draftText);
      const allFlags = [...(parsed.compliance_flags ?? []), ...spamFlags];

      if (spamFlags.length > 0) {
        console.log(`  ⚠️  Spam risk flags in draft for ${lead.company}: ${spamFlags.join(', ')}`);
      }

      drafts.push({
        lead_name: lead.name ?? '[Contact]',
        lead_company: lead.company,
        lane: lead.lane,
        message_type: 'linkedin_connection',
        draft: draftText,
        priority_score: lead.qualification_score,
        compliance_flags: allFlags,
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

// ── Spam Word Scanner ─────────────────────────────────────────────────────────
// Flags high-risk spam trigger words in outreach drafts BEFORE they go out.
// These words get emails filtered by Gmail, Outlook, and corporate spam guards.
const SPAM_TRIGGER_PATTERNS = [
  /\b(FREE|free!|FREE!)\b/,
  /\b(urgent|URGENT|act now|act immediately)\b/i,
  /\b(click here|click now|click below)\b/i,
  /\b(limited time|limited offer|expires soon|don't miss out)\b/i,
  /\b(guaranteed|100% free|no cost|no obligation)\b/i,
  /\b(make money|earn money|income opportunity|extra cash)\b/i,
  /\b(unsubscribe|opt.?out)\b/i,   // in outreach (not newsletters)
  /\b(dear friend|dear sir|to whom it may concern)\b/i,
  /\b(congratulations you|you have been selected|you are a winner)\b/i,
  /\$\$\$|€€€|£££/,
  /!{3,}/,                          // three or more exclamation marks
  /[A-Z]{8,}/,                      // 8+ consecutive caps (SCREAMING)
];

function scanForSpamWords(draft: string): string[] {
  const flags: string[] = [];
  for (const pattern of SPAM_TRIGGER_PATTERNS) {
    if (pattern.test(draft)) {
      flags.push(`SPAM_RISK: "${pattern.source}"`);
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

  // Generate content for ALL active lanes every run — no day-of-week rotation
  for (const targetLane of config.active_lanes) {
    const isKatrinaLane = config.compliance.katrina_gate_lanes.includes(targetLane);
    console.log(`  Generating content for: ${targetLane}${isKatrinaLane ? ' [katrina_review_required]' : ''}`);

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
      let draft = parsed.draft ?? '';

      // Run evidence scanner — retry once if hallucination detected
      const hallucinationFlags = scanForHallucinations(draft);
      if (hallucinationFlags.length > 0) {
        console.log(`  ⚠️  ${targetLane}: draft blocked by evidence scanner — retrying...`);
        const retry = await callGPT(
          config.model_routing.content_generation,
          systemPrompt + '\nSTRICT RULE: Do not reference any specific client, company result, or case study. Every claim must be generally true or labeled [hypothesis].',
          `Rewrite the LinkedIn post for ${targetLane}. No client stories. No fabricated results.`
        ).catch(() => '{}');
        const retryParsed = JSON.parse(retry.replace(/```json|```/g, '').trim());
        const retryDraft = retryParsed.draft ?? '';
        if (scanForHallucinations(retryDraft).length > 0) {
          console.log(`  ✗ ${targetLane}: evidence scanner failed twice — skipping lane`);
          continue;
        }
        draft = retryDraft;
      }

      drafts.push({
        lane: targetLane, platform: 'linkedin', content_type: 'post',
        draft, character_count: parsed.character_count ?? draft.length,
        review_required: true, status: 'pending_review',
        katrina_review_required: isKatrinaLane,
      } as ContentDraft & { katrina_review_required?: boolean });

      // ── Instagram variant ──────────────────────────────────────────────────
      try {
        const igResponse = await callGPT(
          config.model_routing.content_generation,
          `You are Genius, Alfred Colvin's content agent. Adapt this LinkedIn post for Instagram.
Rules: Under 300 chars main caption + line break + 5 relevant hashtags. Hook must work without context.
No corporate speak. Punchy, visual language. Same lane: ${targetLane}.
Return JSON: { draft: string }`,
          `LinkedIn post to adapt:\n${draft.slice(0, 600)}`,
          { taskType: 'content_generation', lane: targetLane, maxTokens: 400 }
        );
        const igDraft = JSON.parse(igResponse.replace(/```json|```/g, '').trim()).draft ?? '';
        if (igDraft && scanForHallucinations(igDraft).length === 0) {
          drafts.push({
            lane: targetLane, platform: 'instagram', content_type: 'caption',
            draft: igDraft, character_count: igDraft.length,
            review_required: true, status: 'pending_review',
            katrina_review_required: isKatrinaLane,
          } as ContentDraft & { katrina_review_required?: boolean });
        }
      } catch { /* non-fatal */ }

      // ── Facebook variant ───────────────────────────────────────────────────
      try {
        const fbResponse = await callGPT(
          config.model_routing.content_generation,
          `You are Genius, Alfred Colvin's content agent. Adapt this LinkedIn post for Facebook.
Rules: Community-friendly tone, under 500 chars, end with a genuine question to spark comments.
Alfred's audience on Facebook: Indianapolis locals, faith community, first-time entrepreneurs.
Same lane: ${targetLane}.
Return JSON: { draft: string }`,
          `LinkedIn post to adapt:\n${draft.slice(0, 600)}`,
          { taskType: 'content_generation', lane: targetLane, maxTokens: 400 }
        );
        const fbDraft = JSON.parse(fbResponse.replace(/```json|```/g, '').trim()).draft ?? '';
        if (fbDraft && scanForHallucinations(fbDraft).length === 0) {
          drafts.push({
            lane: targetLane, platform: 'facebook', content_type: 'post',
            draft: fbDraft, character_count: fbDraft.length,
            review_required: true, status: 'pending_review',
            katrina_review_required: isKatrinaLane,
          } as ContentDraft & { katrina_review_required?: boolean });
        }
      } catch { /* non-fatal */ }

      console.log(`  ${targetLane}: LinkedIn + Instagram + Facebook generated`);
    } catch (err) {
      console.log(`  ${targetLane}: content gen failed — ${String(err).slice(0, 80)}`);
    }
  }

  console.log(`  Content drafts created: ${drafts.length} (awaiting Alfred's approval)`);
  return drafts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 6 — Solomon SEO Intelligence (real SERP research via Firecrawl)
// ═══════════════════════════════════════════════════════════════════════════════
async function step6_solomonSEO(config: GabrielConfig): Promise<SolomonSEOReport[]> {
  console.log('\n[Step 6] Solomon SEO — live SERP research via Firecrawl...');
  const reports: SolomonSEOReport[] = [];

  // Rotate 2 lanes per day so all 5 get coverage across the week
  const dayOfWeek = new Date().getDay();
  const laneCount = config.active_lanes.length;
  const targetLanes = [
    config.active_lanes[dayOfWeek % laneCount],
    config.active_lanes[(dayOfWeek + 1) % laneCount],
  ].filter((v, i, a) => a.indexOf(v) === i);

  for (const lane of targetLanes) {
    const queries = SOLOMON_SEO_QUERIES[lane];
    if (!queries || queries.length === 0) {
      console.log(`  [Solomon] ${lane}: no queries configured — skipping`);
      continue;
    }

    const query = queries[dayOfWeek % queries.length];
    console.log(`  [Solomon] ${lane}: "${query.slice(0, 60)}..."`);

    try {
      const serpResults = await withRetry(
        () => callFirecrawlSearch(query, 5),
        `Solomon:${lane}`, 2, 3000
      );

      if (serpResults.length === 0) {
        SKIPPED_LANES.push({ lane, reason: 'Solomon: no SERP results', query });
        console.log(`  [Solomon] ${lane}: no results — skipped`);
        continue;
      }

      // Build real SERP context for GPT-4o analysis
      const serpContext = serpResults.map((r, i) =>
        `Result ${i + 1}:\nURL: ${r.url}\nTitle: ${r.title}\nDescription: ${r.description}\nExcerpt: ${(r.markdown || '').slice(0, 400)}`
      ).join('\n\n---\n\n');

      const solomonAnalysis = await callGPT(
        'gpt-4o',
        `You are Solomon, Alfred Colvin's SEO intelligence specialist based in Indianapolis, Indiana.
Analyze real SERP data and give evidence-based recommendations ONLY.
Never invent keywords or data. Only use what you see in the search results provided.
Never guarantee rankings. Say "may improve" not "will improve".`,
        `Lane: ${lane}
Search query: "${query}"
Date: ${TODAY}

REAL SERP RESULTS:
${serpContext}

Return JSON only (no markdown):
{
  "keyword_patterns": ["up to 5 keywords you see ranking in these results"],
  "content_gaps": ["2-3 topics missing from current results Alfred could fill"],
  "opportunities": [
    "Opportunity 1: [specific action for ${lane}] — evidence: [URL from results] — impact: low|medium|high",
    "Opportunity 2: [specific action] — evidence: [URL] — impact: low|medium|high",
    "Opportunity 3: [specific action] — evidence: [URL] — impact: low|medium|high"
  ]
}`,
        { taskType: 'seo_synthesis', lane }
      );

      // Parse Solomon's structured response
      let parsed: { keyword_patterns: string[]; content_gaps: string[]; opportunities: string[] } = {
        keyword_patterns: [], content_gaps: [], opportunities: [],
      };
      try {
        const jsonMatch = solomonAnalysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      } catch {
        // Fallback: extract opportunity lines
        parsed.opportunities = solomonAnalysis
          .split('\n')
          .filter(l => l.toLowerCase().includes('opportunity') || l.match(/^\d\./))
          .slice(0, 3);
      }

      const report: SolomonSEOReport = {
        lane,
        query_used: query,
        serp_results: serpResults.map(r => ({ url: r.url, title: r.title ?? '', description: r.description ?? '' })),
        keyword_patterns: parsed.keyword_patterns.slice(0, 5),
        content_gaps: parsed.content_gaps.slice(0, 3),
        opportunities: parsed.opportunities.slice(0, 3),
        evidence_urls: serpResults.map(r => r.url).slice(0, 3),
      };

      reports.push(report);
      console.log(`  [Solomon] ${lane}: ${report.opportunities.length} opportunities | sources: ${report.evidence_urls.length}`);

    } catch (err) {
      console.log(`  [Solomon] ${lane} failed: ${String(err).slice(0, 80)}`);
    }
  }

  console.log(`  Solomon complete: ${reports.length} SEO reports generated`);
  return reports;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 7 — Genius Marketing Recommendations (informed by Solomon SEO data)
// ═══════════════════════════════════════════════════════════════════════════════
async function step7_geniusMarketing(
  config: GabrielConfig,
  seoReports: SolomonSEOReport[]
): Promise<string[]> {
  console.log('\n[Step 7] Genius Marketing — generating actionable recommendations...');
  const recs: string[] = [];

  try {
    const dayOfWeek = new Date().getDay();
    const focusLane = config.active_lanes[dayOfWeek % config.active_lanes.length];

    // Feed Solomon's real findings into Genius for grounded recommendations
    const seoContext = seoReports.length > 0
      ? `Solomon's SEO findings today:\n${seoReports.map(r =>
          `${r.lane}:\n  Keywords: ${r.keyword_patterns.slice(0, 3).join(', ')}\n  Gaps: ${r.content_gaps[0] || 'none'}\n  Top opportunity: ${r.opportunities[0] || 'none'}`
        ).join('\n\n')}`
      : 'No SEO data available — make recommendations based on lane context only.';

    const response = await callGPT(
      'gpt-4o',
      `You are Genius, Alfred Colvin's marketing and conversion specialist in Indianapolis, Indiana.
You give specific, doable, low-cost marketing actions. Never vague. Never guaranteed results.
Never suggest mass outreach or auto-posting. Alfred approves everything before it goes out.
Keep each recommendation under 2 sentences.`,
      `Focus lane today: ${focusLane}
All active lanes: ${config.active_lanes.join(', ')}
Date: ${TODAY}

${seoContext}

Give exactly 3 marketing actions Alfred can take TODAY for the "${focusLane}" lane.
Each should be completable in under 2 hours with zero budget.

Return JSON array only: ["Action 1: ...", "Action 2: ...", "Action 3: ..."]`,
      { taskType: 'marketing_recs', lane: focusLane, maxTokens: 600, temperature: 0.6 }
    );

    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      const parsed: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
      recs.push(...parsed.slice(0, 3));
    } catch {
      const lines = response.split('\n').filter(l => l.trim() && l.length > 20).slice(0, 3);
      recs.push(...lines);
    }
  } catch (err) {
    console.log(`  Genius marketing failed: ${String(err).slice(0, 80)}`);
  }

  console.log(`  Genius recommendations: ${recs.length}`);
  return recs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 8 — Deduplicate
// ═══════════════════════════════════════════════════════════════════════════════
async function step8_dedup(leads: Lead[]): Promise<Lead[]> {
  console.log(`\n[Step 8] Deduplicating ${leads.length} leads against Supabase CRM...`);

  try {
    // Track recently-contacted leads by two keys: linkedin_url AND company name
    // This catches org/referral_source leads that never have a linkedin_url
    const linkedinUrls = leads.map(l => l.linkedin_url).filter(Boolean) as string[];
    const companyNames  = leads.map(l => l.company).filter(Boolean) as string[];

    const [linkedinResult, companyResult] = await Promise.all([
      linkedinUrls.length > 0
        ? supabase.from('leads').select('linkedin_url, company, last_contacted_at').in('linkedin_url', linkedinUrls)
        : Promise.resolve({ data: [] }),
      companyNames.length > 0
        ? supabase.from('leads').select('linkedin_url, company, last_contacted_at').in('company', companyNames)
        : Promise.resolve({ data: [] }),
    ]);

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30-day window

    const recentLinkedins = new Set<string>(
      (linkedinResult.data ?? [])
        .filter(r => r.last_contacted_at && new Date(r.last_contacted_at).getTime() > cutoff)
        .map(r => r.linkedin_url).filter(Boolean)
    );

    const recentCompanies = new Set<string>(
      (companyResult.data ?? [])
        .filter(r => r.last_contacted_at && new Date(r.last_contacted_at).getTime() > cutoff)
        .map(r => r.company).filter(Boolean)
    );

    const unique = leads.filter(l => {
      // Person with LinkedIn URL: dedup by URL
      if (l.linkedin_url) return !recentLinkedins.has(l.linkedin_url);
      // Org/referral with no URL: dedup by company name
      return !recentCompanies.has(l.company);
    });

    console.log(`  After dedup: ${unique.length} unique leads (removed ${leads.length - unique.length} duplicates — linkedin + company name check)`);
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
    pkg += `SOLOMON SEO OPPORTUNITIES (${seoQueue.length}) — evidence-based, real SERP data\n`;
    pkg += '-'.repeat(40) + '\n';
    seoQueue.forEach((opp, i) => pkg += `${i + 1}. ${opp.slice(0, 150)}\n`);
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
  contentDrafts: ContentDraft[],
  seoReports: SolomonSEOReport[] = [],
  marketingRecs: string[] = []
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
        name: l.name ?? null,
        company: l.company ?? '[Unknown]',
        title: l.title ?? null,
        linkedin_url: l.linkedin_url ?? null,
        lane: l.lane,
        fit_reason: l.fit_reason,
        qualification_score: toDbScore(l.qualification_score),
        source: l.source,
        lead_type: (!l.name && l.company) ? 'organization' : 'person',
        status: 'new',
        created_at: l.found_at ?? new Date().toISOString(),
      }));

    if (leadsToInsert.length > 0) {
      const { error: leadsError } = await supabase.from('leads')
        .upsert(leadsToInsert, {
          onConflict: 'linkedin_url',
          ignoreDuplicates: true,
        });
      if (leadsError) console.log(`  Supabase leads CRM warning: ${leadsError.message}`);
      else console.log(`  Saved ${leadsToInsert.length} leads to Supabase CRM`);
    }
  } catch (err) {
    console.log(`  Supabase leads save skipped: ${String(err).slice(0, 80)}`);
  }

  // Save outreach drafts to Supabase (idempotent — skip if this run already saved)
  try {
    if (outreachDrafts.length > 0) {
      // Guard: don't double-insert on same-day re-runs
      const { data: alreadySaved } = await supabase
        .from('outreach_drafts')
        .select('id')
        .eq('run_id', RUN_ID)
        .limit(1);

      if (alreadySaved && alreadySaved.length > 0) {
        console.log(`  Outreach drafts already saved for run ${RUN_ID} — skipping`);
      } else {
        const { error } = await supabase.from('outreach_drafts').insert(
          outreachDrafts.map(d => ({
            run_id: RUN_ID,
            lead_name: d.lead_name ?? '[Contact]',
            lead_company: d.lead_company,
            lane: d.lane,
            message_type: d.message_type,
            draft: d.draft,
            priority_score: toDbScore(d.priority_score),
            compliance_flags: d.compliance_flags,
            katrina_review_required: d.katrina_review_required,
            status: 'pending_review',
            created_at: new Date().toISOString(),
          }))
        );
        if (error) console.log(`  Supabase outreach save warning: ${error.message}`);
        else console.log(`  Saved ${outreachDrafts.length} outreach drafts to Supabase`);
      }
    }
  } catch (err) {
    console.log(`  Supabase outreach save skipped: ${String(err).slice(0, 80)}`);
  }

  // Save SEO reports to file + Supabase content_queue
  if (seoReports.length > 0) {
    const seoPath = path.join(DATA_PATH, `content/${TODAY}-${RUN_TIMESTAMP}-seo-reports.json`);
    fs.writeFileSync(seoPath, JSON.stringify(seoReports, null, 2));

    try {
      const seoItems = seoReports.map(r => ({
        lane: r.lane,
        content_type: 'seo_report',
        platform: 'internal',
        draft: JSON.stringify({ opportunities: r.opportunities, keyword_patterns: r.keyword_patterns, evidence_urls: r.evidence_urls }),
        status: 'pending_review',
        review_required: true,
        created_at: new Date().toISOString(),
      }));
      const { error: seoError } = await supabase.from('content_queue').insert(seoItems);
      if (seoError) console.log(`  SEO reports Supabase warning: ${seoError.message}`);
      else console.log(`  Saved ${seoReports.length} SEO reports to Supabase`);
    } catch (err) {
      console.log(`  SEO reports save skipped: ${String(err).slice(0, 80)}`);
    }
  }

  // Save marketing recommendations to Supabase as queryable records
  if (marketingRecs.length > 0) {
    try {
      const dayOfWeek = new Date().getDay();
      const focusLane = leads[0]?.lane || 'colvin_enterprises';
      const recItems = marketingRecs.map((rec, i) => ({
        run_id: RUN_ID,
        lane: focusLane,
        rank: i + 1,
        recommendation: rec,
        source: 'genius',
        status: 'pending_review',
        created_at: new Date().toISOString(),
      }));
      const { error: recError } = await supabase.from('marketing_recommendations').insert(recItems);
      if (recError) console.log(`  Marketing recs Supabase warning: ${recError.message}`);
      else console.log(`  Saved ${recItems.length} marketing recommendations to Supabase`);
    } catch (err) {
      console.log(`  Marketing recs save skipped: ${String(err).slice(0, 80)}`);
    }
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
  config: GabrielConfig,
  carryForward: unknown[] = []
): Promise<Array<{ rank: number; action: string; lane: string; why: string; effort: string }>> {
  console.log('\n[Step 14] Identifying top 3 actions...');

  try {
    // Include yesterday's unfinished high-priority items so they don't get buried
    const carryForwardContext = carryForward.length > 0
      ? `\n\nYESTERDAY'S UNFINISHED HIGH-PRIORITY ITEMS (carry-forward — consider including if still relevant):\n${
          carryForward.slice(0, 3).map((c: unknown) => {
            const item = c as Record<string, unknown>;
            return `- ${item.type || 'item'}: ${item.company || ''} (${item.lane || ''}, score: ${item.score || '?'})`;
          }).join('\n')
        }`
      : '';

    const context = [
      outreachDrafts.length > 0 ? `${outreachDrafts.length} outreach drafts ready for review` : '',
      contentDrafts.length > 0 ? `${contentDrafts.length} content pieces ready for review` : '',
      seoOpportunities.length > 0 ? `SEO opportunities: ${seoOpportunities[0]?.slice(0, 80)}` : '',
    ].filter(Boolean).join('. ');

    const response = await callGPT(
      config.model_routing.daily_report,
      'You identify the top 3 highest-ROI actions for Alfred Colvin today. Be specific. Return JSON array of 3 items: { rank, action, lane, why, effort (low|medium|high) }',
      `Available today: ${context}. Active lanes: ${config.active_lanes.join(', ')}.${carryForwardContext}`
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
  top3: Array<{ rank: number; action: string; lane: string }>,
  agentMailReplies = 0,
  outreachDrafts: OutreachDraft[] = []
): Promise<void> {
  console.log('\n[Step 15] Sending Telegram daily brief...');

  const brief = [
    `<b>GABRIEL DAILY BRIEF — ${TODAY}</b>`,
    '',
    `LEADS: ${report.summary.leads_found} found, ${report.summary.leads_queued_for_review} queued for review`,
    `OUTREACH DRAFTS: ${report.summary.outreach_drafts_created} ready for your approval`,
    agentMailReplies > 0 ? `📬 PROSPECT REPLIES: ${agentMailReplies} new repl${agentMailReplies === 1 ? 'y' : 'ies'} — suggested responses ready` : '',
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

  // Separate Katrina notification — ONLY fires when compliance-lane items exist
  const katrinaItems = outreachDrafts.filter(d => d.katrina_review_required);
  if (KATRINA_TELEGRAM_CHAT_ID && katrinaItems.length > 0) {
    const laneBreakdown = [...new Set(katrinaItems.map(d => d.lane))].join(', ');
    const katrinaText = `<b>KATRINA REVIEW NEEDED — ${TODAY}</b>\n\n` +
      `${katrinaItems.length} outreach draft${katrinaItems.length > 1 ? 's' : ''} require compliance review before Alfred can approve.\n\n` +
      `Lanes: ${laneBreakdown}\n\n` +
      `Check Alfred's review queue in Supabase → outreach_drafts (status: pending_review, katrina_review_required: true).`;
    const katinaBody = JSON.stringify({ chat_id: KATRINA_TELEGRAM_CHAT_ID, text: katrinaText, parse_mode: 'HTML' });
    const kReq = https.request({
      hostname: 'api.telegram.org',
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(katinaBody) },
    }, (res) => { res.on('data', () => {}); res.on('end', () => {}); });
    kReq.on('error', () => {});
    kReq.write(katinaBody);
    kReq.end();
    console.log(`  Katrina notification sent (${katrinaItems.length} compliance items — lanes: ${laneBreakdown}).`);
  } else {
    console.log('  Katrina notification: no compliance-lane items today — skipped.');
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

    const { error } = await supabase.from('gabriel_memory').upsert({
      session_date: TODAY,
      run_id: RUN_ID,
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
    }, { onConflict: 'session_date' });

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
  const agentMailReplies = await step3c_checkOutreachReplies(config).catch(e => { errors.push(`Step 3c: ${e}`); return 0; });
  const allOutreachDrafts = await step4_outreachPrep(rawLeads, config).catch(e => { errors.push(`Step 4: ${e}`); return []; });
  const outreachDrafts = [...allOutreachDrafts, ...followUpDrafts];
  const contentDrafts = await step5_contentGen(config).catch(e => { errors.push(`Step 5: ${e}`); return []; });
  // Step 6: Solomon — real SERP research via Firecrawl
  const seoReports = await step6_solomonSEO(config).catch(e => { errors.push(`Step 6: ${e}`); return [] as SolomonSEOReport[]; });
  const seoOpportunities = seoReports.flatMap(r => r.opportunities); // string[] for downstream compat
  // Step 7: Genius — marketing recs informed by Solomon's findings
  const marketingRecs = await step7_geniusMarketing(config, seoReports).catch(e => { errors.push(`Step 7: ${e}`); return []; });

  // Steps 8–10 (processing)
  const uniqueLeads = await step8_dedup(rawLeads).catch(e => { errors.push(`Step 8: ${e}`); return rawLeads; });
  const scoredLeads = await step9_scoreLeads(uniqueLeads).catch(e => { errors.push(`Step 9: ${e}`); return uniqueLeads; });
  const { outreach, content, seo } = step10_categorize(scoredLeads, outreachDrafts, contentDrafts, seoOpportunities);

  // Steps 11–12 (package + save)
  const reviewPackage = step11_buildReviewPackage(outreach, content, seo, marketingRecs);
  fs.writeFileSync(path.join(DATA_PATH, `review-queue/${TODAY}-${RUN_TIMESTAMP}-review-package.txt`), reviewPackage);

  await step12_saveOutputs(scoredLeads, outreachDrafts, contentDrafts, seoReports, marketingRecs).catch(e => errors.push(`Step 12: ${e}`));

  // Steps 13–15 (report + deliver)
  const top3 = await step14_top3Actions(outreach, content, seo, config, memory.carry_forward).catch(e => { errors.push(`Step 14: ${e}`); return []; });
  const report = await step13_generateReport(rawLeads, scoredLeads, outreachDrafts, contentDrafts, seoOpportunities, top3, errors);

  await step15_telegramBrief(report, top3, agentMailReplies, outreachDrafts).catch(e => console.log(`  Telegram failed: ${e}`));

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
        from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
        replyTo: RESEND_REPLY_TO,
        to: ['itsinthebible.info@gmail.com'],
        subject: `Gabriel Brief — ${TODAY} — ${report.summary.leads_found} leads, ${report.summary.outreach_drafts_created} drafts`,
        html: emailHtml,
        // Plain text fallback — required for deliverability (spam filters penalise HTML-only)
        text: [
          `Gabriel Daily Brief — ${TODAY}`,
          '',
          `Leads found:      ${report.summary.leads_found}`,
          `Outreach drafts:  ${report.summary.outreach_drafts_created} awaiting your approval`,
          `Content drafts:   ${report.summary.content_drafts_created} awaiting your review`,
          `Follow-up drafts: ${followUpDrafts.length}`,
          `SEO opportunities: ${report.summary.seo_opportunities_found}`,
          '',
          'TOP 3 ACTIONS TODAY:',
          ...top3.map((a, i) => `${i + 1}. ${a.action} (${a.lane}) — ${a.why}`),
          '',
          errors.length > 0
            ? `⚠️ ${errors.length} error(s) — check GitHub Actions logs`
            : '✓ Clean run',
          '',
          `Run time: ${Math.round(report.run_duration_ms / 1000)}s | Run ID: ${RUN_ID}`,
          '',
          'Gabriel Automation OS — Colvin Enterprises',
        ].join('\n'),
        headers: {
          // Tells spam filters this is a transactional internal email, not bulk marketing
          'X-Entity-Ref-ID': RUN_ID,
        },
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
