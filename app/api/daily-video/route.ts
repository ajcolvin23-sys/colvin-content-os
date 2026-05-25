// Daily Video Generation — First Keys Indy
// Called by Vercel cron at 5am EST (10:00 UTC) every day
// Researches viral homebuyer topic → generates slide content → saves to Supabase
// Render script then pulls this and produces the MP4

import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase/admin'

let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

// ── Brand constants ──────────────────────────────────────────────────────────
const BRAND = `
First Keys Indy — Tanya Day, Broker/Owner, Elite Realty & Development
Phone: 317-995-4719
Website: FirstKeysIndy.org

Brand rules:
- Speaks to Black Indianapolis families who've been locked out of homeownership
- Tone: Direct, truth-telling, hopeful, community-rooted
- Never minimize the real barriers (redlining, generational poverty, systemic exclusion)
- Always give real information about verified programs
- CTA always drives to FirstKeysIndy.org or 317-995-4719
- Short sentences. Mobile-first. No fluff.
`

const COMPLIANCE = `
COMPLIANCE RULES — MUST FOLLOW:
- Never state exact dollar amounts as guaranteed — always say "up to $X" or "may qualify for"
- Mark any program-specific claims as subject to eligibility
- Never make legal claims or promises about loan approval
- If mentioning programs: Indiana Housing (IHCDA), First Generation Down Payment, Marion County programs
- Always include: "Eligibility depends on your situation. Talk to a qualified lender."
`

// ── Color palette ────────────────────────────────────────────────────────────
const COLORS = {
  BLACK: '#0A0A0A',
  GOLD: '#C9A84C',
  WHITE: '#F5F0EB',
  DEEP_RED: '#8B1A1A',
  DARK_GREEN: '#0D1A0D',
  DARK_NAVY: '#0A0A1A',
  DARK_BROWN: '#1A0A0A',
}

type SlideAlign = 'left' | 'center'

interface GeneratedSlide {
  eyebrow?: string
  headline: string
  sub?: string
  bg: string
  accentColor: string
  align: SlideAlign
  durationSeconds: number
}

interface GeneratedContent {
  topic: string
  angle: string
  slides: GeneratedSlide[]
  caption: string
  hashtags: string[]
  tiktokSound: string
}

// ── Generate viral content via GPT-4o ───────────────────────────────────────
async function generateDailyContent(dateStr: string): Promise<GeneratedContent> {
  const openai = getOpenAI()

  const today = new Date(dateStr)
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' })
  const month = today.toLocaleDateString('en-US', { month: 'long' })

  const prompt = `
You are Gabriel — a viral content strategist for First Keys Indy, a Black-owned real estate education brand in Indianapolis.

Today is ${dayOfWeek}, ${month} ${today.getDate()}.

${BRAND}

${COMPLIANCE}

Your task: Generate a viral-optimized TikTok/Instagram Reel storytelling slideshow about a homebuyer topic.

VIRAL TOPIC SELECTION RULES:
- Choose a topic that addresses a real fear, myth, or barrier that stops Black families from buying homes
- Topics that perform well: "they don't tell you this," hidden fees, credit myths, program secrets, real stories, systemic barriers explained simply
- Seasonal relevance: ${month} topics (spring market, tax refund season if Jan-Apr, back-to-school planning if Aug-Sep, year-end goals if Oct-Dec)
- Avoid topics you've likely covered in the last 7 days — rotate through: credit, down payment, programs, history, myths, steps, mindset, costs, timing

SLIDE STRUCTURE (8-10 slides):
1. Hook slide: Provocative statement that stops the scroll (3.5s)
2. Problem/history slide: Why this is real and who it affects (4s)
3. Detail slide: The specific barrier or truth (4s)
4. Turn slide: "But here's what changed" (3.5s)
5. Solution/program slide: What's actually available (4s)
6. Specific resource slide: Verified program or step (4s)
7. Action slide: What to do right now (3.5s)
8. Brand CTA slide: First Keys Indy / FirstKeysIndy.org (3.5s)
9. Contact slide: 317-995-4719 (3s)

Respond ONLY with valid JSON in this exact format:
{
  "topic": "Short topic name (5-10 words)",
  "angle": "The viral angle — what makes this stop the scroll",
  "slides": [
    {
      "eyebrow": "optional label in caps (e.g. THE TRUTH, VERIFIED PROGRAM) — null if none",
      "headline": "Big, punchy text. Use \\n for line breaks. Max 6 words per line.",
      "sub": "Supporting context. 1-2 sentences. Or null.",
      "bg": "hex color from: #0A0A0A #0F0F0F #0D1A0D #0A0A1A #1A0A0A",
      "accentColor": "hex color from: #C9A84C #F5F0EB #8B1A1A",
      "align": "left or center",
      "durationSeconds": 3.5
    }
  ],
  "caption": "TikTok/Instagram caption — hook first, then context, then CTA. 150-200 chars max.",
  "hashtags": ["firstkeysindy", "indianapolishomebuyer", "blackhomeownership", "indyhomes", "homebuyer2025"],
  "tiktokSound": "Suggest a trending sound style: e.g. 'ambient lo-fi beat', 'emotional piano', 'hip hop instrumental', 'gospel piano background'"
}
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.85,
  })

  const raw = response.choices[0].message.content || '{}'
  return JSON.parse(raw) as GeneratedContent
}

// ── Convert generated content to Remotion slide format ──────────────────────
function buildSlides(content: GeneratedContent) {
  const FPS = 30
  let currentFrame = 0
  const slides = []

  for (const s of content.slides) {
    const durationInFrames = Math.round(s.durationSeconds * FPS)
    slides.push({
      from: currentFrame,
      durationInFrames,
      bg: s.bg,
      eyebrow: s.eyebrow || undefined,
      headline: s.headline,
      sub: s.sub || undefined,
      accentColor: s.accentColor,
      align: s.align as SlideAlign,
    })
    currentFrame += durationInFrames
  }

  return { slides, totalFrames: currentFrame }
}

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const dateStr = new Date().toISOString().split('T')[0] // YYYY-MM-DD

  try {
    // Check if we already generated for today
    const { data: existing } = await supabase
      .from('video_projects')
      .select('id')
      .eq('lane', 'first_keys_indy')
      .gte('created_at', `${dateStr}T00:00:00Z`)
      .single()

    if (existing) {
      return NextResponse.json({
        message: 'Already generated for today',
        project_id: existing.id,
        date: dateStr
      })
    }

    // Generate content
    const content = await generateDailyContent(dateStr)
    const { slides, totalFrames } = buildSlides(content)

    // Save to Supabase
    const { data: project, error } = await supabase
      .from('video_projects')
      .insert({
        title: `[First Keys Indy Daily] ${content.topic} — ${dateStr}`,
        lane: 'first_keys_indy',
        platform: 'tiktok',
        aspect_ratio: '9:16',
        render_status: 'content_ready',
        voiceover_script: content.caption,
        render_settings: {
          slides,
          totalFrames,
          topic: content.topic,
          angle: content.angle,
          caption: content.caption,
          hashtags: content.hashtags,
          tiktokSound: content.tiktokSound,
          date: dateStr,
        },
      })
      .select()
      .single()

    if (error) {
      console.error('[daily-video] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Insert slide records
    const slideRows = slides.map((s, i) => ({
      video_project_id: project.id,
      slide_order: i + 1,
      text_on_screen: s.headline,
      voiceover_text: s.sub || s.headline,
      duration_seconds: s.durationInFrames / 30,
      transition: 'fade',
      slide_type: 'text',
    }))

    await supabase.from('video_slides').insert(slideRows)

    console.log(`[daily-video] Generated project ${project.id}: ${content.topic}`)

    return NextResponse.json({
      success: true,
      project_id: project.id,
      topic: content.topic,
      angle: content.angle,
      slide_count: slides.length,
      total_seconds: totalFrames / 30,
      date: dateStr,
    })
  } catch (err) {
    console.error('[daily-video] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// GET — fetch today's generated content (used by render script)
export async function GET(req: NextRequest) {
  const supabase = createAdminClient()
  const dateStr = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('video_projects')
    .select('*')
    .eq('lane', 'first_keys_indy')
    .gte('created_at', `${dateStr}T00:00:00Z`)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'No content generated for today yet' }, { status: 404 })
  }

  return NextResponse.json(data)
}
