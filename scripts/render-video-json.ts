#!/usr/bin/env ts-node
/**
 * render-video-json.ts
 *
 * Render a video from a JSON script file using the VideoEngine.
 *
 * Usage:
 *   npm run render:json -- videos/colvin-ai-explainer-001.json
 *   npm run render:json -- videos/colvin-ai-explainer-001.json --format 16:9
 *
 * The JSON file must match /remotion/VideoEngine/video.schema.json
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import type { VideoScript, VideoFormat } from '../remotion/VideoEngine/types';

// ── Load env ─────────────────────────────────────────────────────────────────
const envPath = path.resolve(__dirname, '../.env.local');
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

// ── Parse args ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const jsonArg = args.find(a => a.endsWith('.json'));
const formatFlagIdx = args.indexOf('--format');
const formatArg = args.find(a => a.startsWith('--format='))?.split('=')[1] || (formatFlagIdx >= 0 ? args[formatFlagIdx + 1] : undefined);
const sendTelegram = args.includes('--telegram');

if (!jsonArg) {
  console.error('Usage: npm run render:json -- <path-to-video.json> [--format 9:16|1:1|16:9] [--telegram]');
  process.exit(1);
}

// Resolve path — look in /videos/ first, then as-is
const videoDir = path.resolve(__dirname, '../videos');
let jsonPath = path.resolve(process.cwd(), jsonArg);
if (!fs.existsSync(jsonPath)) {
  jsonPath = path.resolve(videoDir, jsonArg);
}
if (!fs.existsSync(jsonPath)) {
  console.error(`JSON file not found: ${jsonArg}`);
  process.exit(1);
}

// ── Load and validate JSON ────────────────────────────────────────────────────
let videoScript: VideoScript;
try {
  videoScript = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
} catch (err) {
  console.error(`Failed to parse JSON: ${err}`);
  process.exit(1);
}

// Basic validation
const required = ['video_id', 'brand', 'platform', 'format', 'scenes'];
const videoScriptFields = videoScript as unknown as Record<string, unknown>;
for (const field of required) {
  if (!videoScriptFields[field]) {
    console.error(`Missing required field: ${field}`);
    process.exit(1);
  }
}

if (!videoScript.scenes || videoScript.scenes.length === 0) {
  console.error('Video must have at least one scene');
  process.exit(1);
}

// ── Determine format + composition ───────────────────────────────────────────
const format: VideoFormat = (formatArg as VideoFormat) || videoScript.render_format || videoScript.format || '9:16';

const compositionMap: Record<VideoFormat, string> = {
  '9:16': 'VideoEngine-Vertical',
  '1:1': 'VideoEngine-Square',
  '16:9': 'VideoEngine-Wide',
};

const compositionId = compositionMap[format];
const outputFilename = `${videoScript.video_id}-${format.replace(':', 'x')}.mp4`;

// Ensure out/ directory exists
const outDir = path.resolve(__dirname, '../out');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const outputPath = path.join(outDir, outputFilename);

// ── Build the props JSON ──────────────────────────────────────────────────────
const propsJson = JSON.stringify({ videoScript });
const propsPath = path.join(outDir, `${videoScript.video_id}-props.json`);
fs.writeFileSync(propsPath, propsJson);

// ── Print summary ─────────────────────────────────────────────────────────────
console.log('\n╔══════════════════════════════════════════════════════════════╗');
console.log('║              GABRIEL VIDEO ENGINE — RENDER                  ║');
console.log('╚══════════════════════════════════════════════════════════════╝\n');
console.log(`Video ID:    ${videoScript.video_id}`);
console.log(`Brand:       ${videoScript.brand}`);
console.log(`Platform:    ${videoScript.platform}`);
console.log(`Format:      ${format}`);
console.log(`Scenes:      ${videoScript.scenes.length}`);
console.log(`Duration:    ${videoScript.scenes.reduce((s, sc) => s + sc.duration_seconds, 0)}s`);
console.log(`Output:      ${outputPath}`);
console.log(`Composition: ${compositionId}`);
console.log('');

// ── Compliance check ─────────────────────────────────────────────────────────
if (videoScript.claims_check?.risk_level === 'high') {
  console.error('⛔ RENDER BLOCKED — Claims check shows HIGH risk. Fix compliance issues first:');
  videoScript.claims_check.issues.forEach(i => console.error(`   - ${i}`));
  process.exit(1);
}

if (videoScript.approval_required && videoScript.render_status !== 'approved') {
  console.warn('⚠️  Video not yet approved. Rendering anyway for preview (do not publish).');
  console.warn(`   Status: ${videoScript.render_status}`);
  console.warn('   Set render_status to "approved" after Alfred reviews.\n');
}

// ── Fetch AI images (DALL-E 3 → Pexels fallback) BEFORE render ───────────────
// This is a LOCKED step — every render must resolve image assets first.
// Scenes that have assets[].description but no URL get images generated here.
// Never skip this step or videos will render without photos.
const hasUnresolvedAssets = videoScript.scenes.some(
  sc => sc.assets?.some((a: { url?: string; description?: string }) => !a.url && a.description)
);
if (hasUnresolvedAssets) {
  console.log('📸 Fetching AI images for scenes (DALL-E 3 → Pexels fallback)...\n');
  try {
    execSync(`npx ts-node --project remotion/tsconfig.json scripts/fetch-assets.ts ${path.basename(jsonPath)}`, {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    });
    // Reload the JSON with resolved URLs
    videoScript = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    // Rebuild props with resolved assets
    fs.writeFileSync(propsPath, JSON.stringify({ videoScript }));
    console.log('');
  } catch (fetchErr) {
    console.warn('⚠️  fetch-assets failed — rendering with fallback colors. Check OPENAI_API_KEY and PEXELS_API_KEY.\n');
  }
}

// ── Generate audio (voiceover + music) BEFORE render ─────────────────────────
// Generates OpenAI TTS voiceover + fetches Pixabay background music.
// Updates JSON with voiceover_url and music_url fields.
// Only runs if either track is missing.
const needsVoiceover = !videoScript.voiceover_url
const needsMusic     = !videoScript.music_url
if (needsVoiceover || needsMusic) {
  console.log('🔊 Generating audio (voiceover + background music)...\n')
  try {
    execSync(`npx ts-node --project remotion/tsconfig.json scripts/generate-audio.ts ${path.basename(jsonPath)}`, {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
    })
    // Reload JSON with resolved audio URLs
    videoScript = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))
    fs.writeFileSync(propsPath, JSON.stringify({ videoScript }))
    console.log('')
  } catch (audioErr) {
    console.warn('⚠️  generate-audio failed — rendering without audio. Check OPENAI_API_KEY.\n')
  }
}

// ── Execute render ────────────────────────────────────────────────────────────
const renderCmd = [
  'npx remotion render',
  'remotion/index.ts',
  compositionId,
  outputPath,
  `--props='${propsPath}'`,
  '--log=verbose',
].join(' ');

console.log('Rendering...\n');
const startMs = Date.now();

try {
  execSync(renderCmd, {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });

  const durationMs = Date.now() - startMs;
  const fileSizeMb = fs.existsSync(outputPath)
    ? (fs.statSync(outputPath).size / 1024 / 1024).toFixed(1)
    : '?';

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    RENDER COMPLETE                          ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  console.log(`Output:     ${outputPath}`);
  console.log(`File size:  ${fileSizeMb} MB`);
  console.log(`Render time: ${Math.round(durationMs / 1000)}s`);

  // ── Optional Telegram delivery ──────────────────────────────────────────────
  if (sendTelegram) {
    const { execSync: exec2 } = require('child_process');
    const caption = `🎬 ${videoScript.video_id}\n${videoScript.brand} — ${videoScript.platform} (${format})\n${videoScript.title}`;
    const telegramCmd = [
      `curl -s -X POST https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`,
      `-F chat_id="${process.env.TELEGRAM_CHAT_ID}"`,
      `-F caption="${caption}"`,
      `-F document=@"${outputPath}"`,
    ].join(' ');

    try {
      exec2(telegramCmd, { stdio: 'pipe' });
      console.log('\n📱 Sent to Telegram.');
    } catch {
      console.warn('\n⚠️  Telegram delivery failed — check TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID.');
    }
  }

  // Clean up temp props file
  if (fs.existsSync(propsPath)) fs.unlinkSync(propsPath);

} catch (err) {
  console.error('\n❌ Render failed:', err);
  if (fs.existsSync(propsPath)) fs.unlinkSync(propsPath);
  process.exit(1);
}
