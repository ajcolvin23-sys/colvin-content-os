# Gabriel Video Guide — How to Create New Videos

## The New System

**Old way:** Write React/TypeScript code for every video. 5,000+ tokens. Hours of dev time.

**New way:** Write a small JSON file. ~400 tokens. 10-15 minutes. Remotion renders it.

---

## Step 1 — Create a JSON file

Copy an example from one of these folders:
- `videos/colvin_enterprises/` — B2B AI consulting content
- `videos/first_keys_indy/` — DPA/homebuyer content (compliance-sensitive)
- `videos/music_theory_secrets/` — Piano/music education content
- `videos/indiana_backflow/` — Backflow testing content

Rename it: `{brand}-{topic}-{number}.json`

Example: `colvin-lead-gen-tips-002.json`

---

## Step 2 — Fill in the JSON

Required fields:
```json
{
  "video_id": "colvin-my-topic-002",
  "brand": "colvin_enterprises",
  "platform": "tiktok",
  "format": "9:16",
  "render_format": "9:16",
  "title": "Internal title",
  "audience": "Who this is for",
  "goal": "What you want them to do after watching",
  "hook": "First 3 seconds — under 100 chars — must stop the scroll",
  "scenes": [...]
}
```

---

## Step 3 — Write your scenes

Each scene maps to a prebuilt template:

| `type` | Component | Use For |
|---|---|---|
| `hook` | HookScene | Opening — big bold statement |
| `problem` | ProblemScene | Pain point agitation |
| `solution` | SolutionScene | Your offer / answer |
| `proof` | ProofScene | Stat, result, or testimonial |
| `step` | SlideScene | Step-by-step instruction |
| `slide` | SlideScene | Any other content slide |
| `cta` | CTAScene | Call to action end card |

**Scene fields:**
```json
{
  "id": "unique-id",
  "type": "hook",
  "duration_seconds": 4,
  "headline": "Main text (max 80 chars)",
  "body": "Secondary text (max 200 chars)",
  "emphasis": "word to highlight in accent color",
  "caption_text": "Subtitle at bottom (max 150 chars)",
  "stat": "40%",
  "stat_label": "Description of the stat",
  "cta_text": "Button text (max 60 chars)",
  "cta_url": "https://...",
  "motion": "fade | slide_up | slide_left | zoom_in | none"
}
```

---

## Step 4 — Compliance check

Fill in `claims_check`:
```json
{
  "claims_check": {
    "risk_level": "low",
    "issues": [],
    "reviewed": false
  }
}
```

**Risk rules:**
- `low` — No guarantees, no financial promises, factual claims only
- `medium` — Statistics that need sourcing, before/after claims
- `high` — Guaranteed results, unsupported bold claims → RENDER BLOCKED

**First Keys Indy compliance (required):**
- NEVER say "you will qualify" → always "you may qualify"
- NEVER promise specific dollar amounts
- ALWAYS include HUD lender recommendation
- ALWAYS add: `"approval_required": true`

---

## Step 5 — Render the video

```bash
# Render vertical (TikTok/Reels)
npm run render:json -- videos/colvin_enterprises/colvin-my-topic-002.json

# Render wide (YouTube/LinkedIn)
npm run render:json -- videos/colvin_enterprises/colvin-my-topic-002.json --format 16:9

# Render + send to Alfred's Telegram
npm run render:json -- videos/colvin_enterprises/colvin-my-topic-002.json --telegram
```

Output file: `out/{video_id}-9x16.mp4`

---

## Step 6 — Preview in Remotion Studio

```bash
npm run remotion
```

Open `http://localhost:3000` → Select `VideoEngine-Vertical` → Edit props with your JSON.

---

## Available Brands

| Brand ID | Use For | Compliance Level |
|---|---|---|
| `colvin_enterprises` | AI consulting content | Low |
| `first_keys_indy` | DPA/homebuyer content | HIGH — Katrina required |
| `indiana_backflow` | Backflow testing content | Low |
| `music_theory_secrets` | Piano/music education | Low |
| `piano_app` | Piano app content | Low |
| `funding_ready_indiana` | Grant/funding content | HIGH — Katrina required |
| `girls_got_game` | Youth sports content | HIGH — Katrina required |
| `glory_engine` | Faith/comics content | Medium |

---

## Token Cost Comparison

| Method | Tokens | Time |
|---|---|---|
| Old: Write React code per video | 3,000–8,000 | 2–4 hours |
| New: Write JSON per video | 200–500 | 10–15 minutes |
| **Savings** | **~80%** | **~80%** |

---

## Gabriel's Prompt to Generate a Video JSON

When Alfred says "make a video about X for Y platform":

Gabriel should output a complete JSON file following this guide, then save it to `/videos/{brand}/`.

Example prompt:
```
"Create a 30-second TikTok video for First Keys Indy explaining what down payment assistance is.
 Target audience: Indianapolis first-time homebuyers. Goal: visit website."
```

Gabriel's output: complete JSON file ready to render.
Alfred reviews. Alfred approves. Alfred runs `npm run render:json`.
