# First Keys Indy — Daily Video Automation Setup

Gabriel generates a new homebuyer education video every day. Here's how everything connects.

---

## How It Works

```
5am EST (Mon-Fri) → Cron triggers /api/daily-video
                  → GPT-4o researches viral topic
                  → Generates 8-10 slides with content
                  → Saves to Supabase

30 seconds later → render-daily.ts pulls the content
                 → Renders vertical (1080×1920) + square (1080×1080) MP4
                 → Uploads both to Google Drive
                 → Sends Telegram notification to Alfred with:
                    - Topic & viral angle
                    - Caption (ready to paste)
                    - Hashtags
                    - Sound recommendation
                    - Google Drive download links
```

Alfred drags the MP4 from Google Drive to TikTok/Instagram/Facebook.

---

## File Structure

```
remotion/DailyVideo/
  DailyVideo.tsx      — Dynamic Remotion composition
  Root.tsx            — Registers DailyVideo compositions
  types.ts            — TypeScript types

app/api/daily-video/
  route.ts            — Research + content generation API

scripts/
  render-daily.ts     — Render + upload + notify pipeline
  run-daily-video.sh  — Local shell wrapper (auto-created by setup)
  setup-local-cron.sh — One-time local cron setup

.github/workflows/
  daily-video.yml     — GitHub Actions alternative (needs repo on GitHub)

vercel.json           — Cron: /api/daily-video at 9am UTC daily
```

---

## Local Cron (Already Active)

The local cron is running on Alfred's Mac:
- Mon-Fri: 5:00am EST
- Sat-Sun: 9:00am EST

Logs saved to: `/colvin-content-os/logs/`

**To test manually right now:**
```bash
bash /Users/katrinacolvin/colvin-content-os/scripts/run-daily-video.sh
```

---

## GitHub Actions (Optional — For Cloud Rendering)

To run the render in the cloud (no Mac needed):

1. Push this repo to GitHub:
   ```bash
   git remote add origin https://github.com/YOUR-USERNAME/colvin-content-os.git
   git push -u origin main
   ```

2. Add these secrets in GitHub → Settings → Secrets:
   | Secret | Value |
   |--------|-------|
   | `NEXT_PUBLIC_APP_URL` | Your Vercel URL |
   | `CRON_SECRET` | From .env.local |
   | `NEXT_PUBLIC_SUPABASE_URL` | From .env.local |
   | `SUPABASE_SERVICE_ROLE_KEY` | From .env.local |
   | `TELEGRAM_BOT_TOKEN` | `8894079838:AAGFiT-sRdyFXuBbscTklm7TmsGi6XWjXdc` |
   | `TELEGRAM_CHAT_ID` | `6728929805` |
   | `COMPOSIO_API_KEY` | `ak_hIyzBFpeCSllvEQrqPOt` |
   | `GOOGLE_DRIVE_FOLDER_ID` | See step below |

3. Workflow runs automatically at 5am EST Mon-Fri, 10am EST Sat-Sun.

---

## Google Drive Folder Setup

1. Go to Google Drive
2. Create a new folder: **"First Keys Indy Daily Videos"**
3. Open the folder — copy the ID from the URL: `drive.google.com/drive/folders/THIS_PART`
4. Paste it in `.env.local` as `GOOGLE_DRIVE_FOLDER_ID=...`
5. Also add it as a GitHub Secret if using GitHub Actions

---

## Optimal Posting Times

Based on Indianapolis / Midwest audience:

| Platform | Best Times (EST) |
|----------|-----------------|
| TikTok | 7am, 12pm, 7pm (Tue-Thu strongest) |
| Instagram Reels | 8am, 11am, 5pm |
| Facebook | 9am, 1pm, 6pm |
| All platforms | Tuesday-Thursday beats Mon/Fri/Weekend by ~40% |

The automation generates at 5am so content is ready before any of these windows.

---

## Landing Page Videos

The `#videos` section on FirstKeysIndy.org auto-plays the latest video from:
`/public/daily/latest-vertical.mp4`

**To update after each render:**
Copy the rendered file to the first-keys-indy public folder:
```bash
cp out/daily-vertical-$(date +%Y-%m-%d).mp4 ../first-keys-indy/public/daily/latest-vertical.mp4
```

Or automate this in `scripts/render-daily.ts` (add a file copy step after render).

---

## Compliance Note

Every generated video includes compliance language:
- "Up to $X" framing (never guaranteed amounts)
- "May qualify" language on all program mentions  
- "Eligibility depends on your situation" always on the CTA slide
- Tanya Day's contact info on final slide
