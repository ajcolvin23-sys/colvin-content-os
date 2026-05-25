/**
 * Gabriel Email Sender — Resend Integration
 *
 * Handles all outbound email for Gabriel. Drafts only — every email
 * requires Alfred's review before sending.
 *
 * Setup:
 *   1. Create account at resend.com (free — 3,000 emails/month)
 *   2. Add API key to .env.local: RESEND_API_KEY=re_...
 *   3. Verify your sending domain in Resend dashboard (or use onboarding@resend.dev for testing)
 */

import * as fs from 'fs';
import * as path from 'path';

// Load .env.local if running standalone
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

// ── Types ────────────────────────────────────────────────────────────────────

export interface EmailDraft {
  to: string;
  subject: string;
  html: string;
  text: string;
  lane: string;
  lead_name: string | null;
  lead_company: string;
  priority_score: number;
  compliance_flags: string[];
  katrina_review_required: boolean;
  status: 'pending_review';
}

export interface SendResult {
  success: boolean;
  id?: string;
  error?: string;
}

// ── Lane from addresses ───────────────────────────────────────────────────────
// IMPORTANT: Domain must be verified in Resend dashboard.
// Until domain is verified, use: onboarding@resend.dev (Resend test sender)
const LANE_FROM_ADDRESSES: Record<string, string> = {
  colvin_enterprises: 'Alfred Colvin <alfred@colvinenterprises.com>',
  indiana_backflow: 'Indiana Backflow Directory <hello@indiana-backflow-directory.com>',
  music_theory_secrets: 'Alfred Colvin <alfred@musictheorysecrets.com>',
  first_keys_indy: 'First Keys Indy <hello@first-keys-indy.com>',
  funding_ready_indiana: 'FundingReady Indiana <hello@fundingreadyindiana.com>',
};

const DEFAULT_FROM = 'Alfred Colvin <onboarding@resend.dev>'; // Resend test address until domain verified

// ── CAN-SPAM required footer ──────────────────────────────────────────────────
const CAN_SPAM_FOOTER = `
<p style="font-size:11px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:16px;">
  You received this email because Alfred Colvin reached out to you professionally.<br>
  <a href="mailto:alfred@colvinenterprises.com?subject=Unsubscribe">Click here to unsubscribe</a> and you will not be contacted again.<br>
  Colvin Enterprises · Indianapolis, Indiana
</p>
`;

// ── Send a single email (Alfred must approve the draft first) ─────────────────
export async function sendEmail(draft: EmailDraft): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY not set in .env.local' };
  }

  const from = LANE_FROM_ADDRESSES[draft.lane] ?? DEFAULT_FROM;
  const htmlWithFooter = draft.html + CAN_SPAM_FOOTER;

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from,
      to: [draft.to],
      subject: draft.subject,
      html: htmlWithFooter,
      text: draft.text + '\n\nTo unsubscribe, reply with "unsubscribe" in the subject.',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ── Build HTML email from plain text draft ────────────────────────────────────
export function buildEmailHtml(
  bodyText: string,
  recipientName: string | null,
  lane: string
): string {
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hello,';
  const paragraphs = bodyText
    .split('\n')
    .filter(l => l.trim())
    .map(p => `<p style="margin:0 0 16px;line-height:1.6;">${p}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff;">
  <p style="margin:0 0 16px;line-height:1.6;">${greeting}</p>
  ${paragraphs}
  <p style="margin:0 0 16px;line-height:1.6;">— Alfred</p>
</body>
</html>`;
}
