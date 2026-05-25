// AI content generation — routes by lane and type
import OpenAI from 'openai'
import type {
  GenerateContentRequest,
  GenerateVideoScriptRequest,
  GeneratedVideoScript,
  ConversionOptimizedResult,
  ConversionVariant,
} from '@/types'

// Lazily instantiated so build-time page collection doesn't fail without env vars
let _openai: OpenAI | null = null
function getOpenAI(): OpenAI {
  if (!_openai) _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _openai
}

// ── Prompt templates ──────────────────────────────────────────────────────────

const ALFRED_VOICE = `Alfred Colvin's voice rules:
- Direct, faith-rooted, entrepreneurial
- Confident but not arrogant
- Practical — always tied to a real outcome
- Short sentences on mobile
- No fluff, no corporate speak
- Platform-native tone`

const PIANO_CONTEXT = `Alfred's music education brand:
- Piano/music theory book and app
- Gospel piano, number system, church musicians
- Target: beginners, adult learners, church pianists, producers
- Core message: "Stop guessing at the piano. Learn the system behind the music."
- CTA options: follow for more, get the book, try the app, save for practice`

const BACKFLOW_CONTEXT = `Alfred's Indiana Backflow Directory:
- Directory of certified backflow testers in Indiana
- Target: property owners, facility managers, churches, restaurants, schools
- SAFETY RULE: Never make unverified claims about certification requirements, legal mandates, or pricing
- Mark any regulatory claims as [NEEDS VERIFICATION]
- Keep content educational and locally relevant`

const COLVIN_CONTEXT = `Alfred's Colvin Enterprises brand:
- AI automation, websites, CRM, funnels for small businesses
- Core message: "We replace manual work with AI-powered systems"
- Target: local businesses, churches, coaches, consultants, nonprofits
- No hype, focus on real outcomes: time saved, leads captured, revenue earned`

function getLaneContext(lane: string): string {
  switch (lane) {
    case 'piano': return PIANO_CONTEXT
    case 'backflow': return BACKFLOW_CONTEXT
    case 'colvin_enterprises': return COLVIN_CONTEXT
    default: return COLVIN_CONTEXT
  }
}

// ── Generate social content ───────────────────────────────────────────────────

export async function generateContent(req: GenerateContentRequest): Promise<{
  hook: string
  body: string
  caption: string
  cta: string
  hashtags: string[]
  visual_direction: string
}> {
  const platformInstructions: Record<string, string> = {
    tiktok: 'Short-form video script. Hook in first 2 seconds. Max 60 seconds spoken. Punchy, pattern-interrupt opener.',
    youtube: 'YouTube Shorts script. Hook first 5 seconds. Clear educational value. End with strong CTA.',
    facebook: 'Facebook post. Conversational. Can be 2-4 paragraphs. Community-friendly. CTA to comment or click.',
    linkedin: 'LinkedIn post. Professional but human. Story-driven. Problem → insight → action. End with question or CTA.',
    instagram: 'Instagram caption. Hook line first. Emojis OK. 3-5 hashtags at end. CTA in middle of caption.',
    multi: 'Multi-platform content. Write a core version that can be adapted.',
  }

  const prompt = `${ALFRED_VOICE}

${getLaneContext(req.lane)}

TASK: Create a ${req.content_type} for ${req.platform.toUpperCase()}.
Topic: ${req.topic}
${req.target_audience ? `Target audience: ${req.target_audience}` : ''}
${req.cta ? `CTA: ${req.cta}` : ''}
${req.additional_context ? `Additional context: ${req.additional_context}` : ''}
${req.tone ? `Tone: ${req.tone}` : ''}

Platform rules: ${platformInstructions[req.platform] || platformInstructions.multi}

Return JSON:
{
  "hook": "opening line/hook",
  "body": "main content",
  "caption": "platform caption with formatting",
  "cta": "call to action",
  "hashtags": ["tag1", "tag2"],
  "visual_direction": "what visual/image/B-roll to use"
}`

  const res = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.6,
    response_format: { type: 'json_object' },
  })

  const parsed = JSON.parse(res.choices[0].message.content || '{}')
  return {
    hook: parsed.hook || '',
    body: parsed.body || '',
    caption: parsed.caption || '',
    cta: parsed.cta || '',
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    visual_direction: parsed.visual_direction || '',
  }
}

// ── Conversion-optimized content (3 variants, auto-pick winner) ───────────────

const CONVERSION_RULES: Record<string, string> = {
  tiktok:    'Hook stops scroll in 0-2 seconds. Pattern interrupt or bold claim. Punchy body. Follow/save CTA.',
  youtube:   'Hook creates curiosity gap in 0-5 seconds. Educational value. Subscribe + like CTA.',
  facebook:  'Story or community angle. Emotional resonance. Question CTA drives comments. Can be 2-3 paragraphs.',
  linkedin:  'Contrarian insight or specific result. Professional credibility. Save/comment CTA. Numbers convert better than adjectives.',
  instagram: 'Visual hook first line. Transformation or lifestyle angle. Save CTA. 3-5 hashtags.',
  multi:     'Versatile hook that works across platforms. Clear value exchange. Action-oriented CTA.',
}

const HOOK_TYPE_CONTEXT = {
  story: {
    label: 'Story / Transformation',
    instruction: 'Open with a real or relatable scenario — a student, a client, a moment of struggle followed by breakthrough. Makes the audience see themselves in it.',
  },
  pain: {
    label: 'Pain / Problem',
    instruction: 'Open by naming the specific frustration, mistake, or gap the audience faces right now. Creates instant recognition. Most effective for cold audiences.',
  },
  curiosity: {
    label: 'Curiosity / Paradox',
    instruction: 'Open with a surprising question, counterintuitive statement, or "what if" that challenges a common assumption. Drives clicks and watch time.',
  },
}

export async function generateConversionOptimized(
  req: GenerateContentRequest
): Promise<ConversionOptimizedResult> {
  const platformRules = CONVERSION_RULES[req.platform] || CONVERSION_RULES.multi
  const laneContext = getLaneContext(req.lane)

  const prompt = `${ALFRED_VOICE}

${laneContext}

TASK: Generate 3 conversion-optimized content variants for ${req.platform.toUpperCase()}.
Topic: ${req.topic}
${req.target_audience ? `Target audience: ${req.target_audience}` : ''}
${req.cta ? `Desired CTA: ${req.cta}` : ''}
${req.additional_context ? `Context: ${req.additional_context}` : ''}
${req.tone ? `Tone: ${req.tone}` : ''}

Platform conversion rules: ${platformRules}

Generate EXACTLY 3 variants, one per hook type:

1. STORY hook — ${HOOK_TYPE_CONTEXT.story.instruction}
2. PAIN hook — ${HOOK_TYPE_CONTEXT.pain.instruction}
3. CURIOSITY hook — ${HOOK_TYPE_CONTEXT.curiosity.instruction}

After writing each variant, score it honestly on conversion potential:
- hook_strength: 0-40 (does it stop the scroll and demand attention?)
- body_clarity: 0-30 (does it deliver the value promise clearly and fast?)
- cta_power: 0-20 (does the CTA match what a ready buyer/viewer would do next?)
- platform_fit: 0-10 (is the format, length, and tone native to ${req.platform}?)

Be ruthlessly honest. A generic hook should score 15-20, not 35. Real conversion scores for strong content are 70-85. Scores above 90 should be rare.

Return JSON:
{
  "variants": [
    {
      "hook_type": "story",
      "hook": "opening line only",
      "body": "main content",
      "caption": "full platform caption with formatting",
      "cta": "specific call to action",
      "hashtags": ["tag1", "tag2", "tag3"],
      "visual_direction": "what visual/B-roll/image works best",
      "scores": {
        "hook_strength": 0,
        "body_clarity": 0,
        "cta_power": 0,
        "platform_fit": 0,
        "total": 0
      },
      "score_reasoning": "1-2 sentences explaining the score — what's strong and what's the weak point"
    },
    { "hook_type": "pain", ... },
    { "hook_type": "curiosity", ... }
  ],
  "winner_index": 0,
  "winner_reasoning": "Why this variant will convert best for this topic, platform, and audience. Reference the specific hook mechanism and CTA alignment."
}`

  const res = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 2400,
    temperature: 0.65,
    response_format: { type: 'json_object' },
  })

  const parsed = JSON.parse(res.choices[0].message.content || '{}')

  // Normalize and validate variants
  const variants: ConversionVariant[] = (parsed.variants || []).map((v: Record<string, unknown>) => {
    const hookType = v.hook_type as 'story' | 'pain' | 'curiosity'
    const scores = (v.scores as Record<string, number>) || {}
    const total = (scores.hook_strength || 0) + (scores.body_clarity || 0) + (scores.cta_power || 0) + (scores.platform_fit || 0)
    return {
      hook_type: hookType,
      hook_type_label: HOOK_TYPE_CONTEXT[hookType]?.label || hookType,
      hook: String(v.hook || ''),
      body: String(v.body || ''),
      caption: String(v.caption || ''),
      cta: String(v.cta || ''),
      hashtags: Array.isArray(v.hashtags) ? v.hashtags as string[] : [],
      visual_direction: String(v.visual_direction || ''),
      scores: {
        hook_strength: scores.hook_strength || 0,
        body_clarity: scores.body_clarity || 0,
        cta_power: scores.cta_power || 0,
        platform_fit: scores.platform_fit || 0,
        total: scores.total || total,
      },
      score_reasoning: String(v.score_reasoning || ''),
    }
  })

  // Fallback: pick winner by highest total score if model didn't specify
  const winnerIndex = typeof parsed.winner_index === 'number'
    ? Math.min(parsed.winner_index, variants.length - 1)
    : variants.reduce((best, v, i) => v.scores.total > variants[best].scores.total ? i : best, 0)

  return {
    variants,
    winner_index: winnerIndex,
    winner_reasoning: String(parsed.winner_reasoning || ''),
  }
}

// ── Generate piano slideshow video script ────────────────────────────────────

export async function generateVideoScript(
  req: GenerateVideoScriptRequest
): Promise<GeneratedVideoScript> {
  const slideCount = req.slide_count || 7

  const prompt = `${ALFRED_VOICE}
${PIANO_CONTEXT}

TASK: Write a ${req.platform === 'tiktok' ? 'TikTok' : 'YouTube Shorts'} piano lesson slideshow video script.

Topic: ${req.topic}
Lesson objective: ${req.lesson_objective}
CTA: ${req.cta}
${req.book_page_description ? `Book page/app screenshot content: ${req.book_page_description}` : ''}
Slides needed: ${slideCount}

Video structure template:
1. Hook slide — stop-the-scroll line
2. Problem/question slide — the mistake or gap
3. Teaching slide — book page or app screenshot
4. Explanation slide — the concept explained
5. Example slide — concrete chord or pattern example
6. Practice/action slide — what to do right now
7. CTA slide — follow, book, app

Rules:
- Each slide text: 3-8 words max (must be readable in 3-4 seconds)
- Voiceover: conversational, warm, matches Alfred's voice
- Total runtime: 20-45 seconds
- Beginner-friendly language only
- One clear idea only
- No music theory jargon without explanation

Return JSON:
{
  "title": "video title for YouTube",
  "hook": "the hook line",
  "slides": [
    {
      "order": 1,
      "text_on_screen": "short on-screen text",
      "voiceover_text": "what Alfred says",
      "visual_direction": "what is shown on screen",
      "duration_seconds": 4,
      "transition": "fade"
    }
  ],
  "full_voiceover": "complete voiceover script",
  "caption": "platform caption",
  "hashtags": ["piano", "musictheory"],
  "thumbnail_text": "thumbnail text",
  "cta": "call to action"
}`

  const res = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 1500,
    temperature: 0.5,
    response_format: { type: 'json_object' },
  })

  const parsed = JSON.parse(res.choices[0].message.content || '{}')
  return {
    title: parsed.title || req.topic,
    hook: parsed.hook || '',
    slides: Array.isArray(parsed.slides) ? parsed.slides : [],
    full_voiceover: parsed.full_voiceover || '',
    caption: parsed.caption || '',
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
    thumbnail_text: parsed.thumbnail_text || '',
    cta: parsed.cta || req.cta,
  }
}

// ── Generate LinkedIn outreach draft ─────────────────────────────────────────

export async function generateOutreachDraft(prospect: {
  name: string
  company?: string
  title?: string
  verified_signal?: string
  pain_hypothesis?: string
  offer_fit?: string
}): Promise<{ connection_request: string; follow_up: string; risk_notes: string }> {
  const prompt = `${ALFRED_VOICE}
${COLVIN_CONTEXT}

TASK: Write a LinkedIn connection request and follow-up for Alfred Colvin.

Prospect:
Name: ${prospect.name}
Company: ${prospect.company || 'Unknown'}
Title: ${prospect.title || 'Business Owner'}
Signal: ${prospect.verified_signal || 'None provided'}
Pain hypothesis: ${prospect.pain_hypothesis || 'Manual workflows'}
Best offer fit: ${prospect.offer_fit || 'AI automation audit'}

RULES — strictly enforced:
- Connection request: max 300 characters, no pitch, no links, reference verified signal only
- Follow-up: max 150 words, offer value, ONE low-pressure question, no call ask unless they show interest
- No fake compliments ("I love your work", "I've been following you")
- No generic openers ("Hope this finds you well")
- No claims Alfred cannot verify
- Draft only — never implies it will be sent automatically

Return JSON:
{
  "connection_request": "the note",
  "follow_up": "first follow-up message",
  "risk_notes": "anything to verify before sending"
}`

  const res = await getOpenAI().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.4,
    response_format: { type: 'json_object' },
  })

  const parsed = JSON.parse(res.choices[0].message.content || '{}')
  return {
    connection_request: parsed.connection_request || '',
    follow_up: parsed.follow_up || '',
    risk_notes: parsed.risk_notes || '',
  }
}
