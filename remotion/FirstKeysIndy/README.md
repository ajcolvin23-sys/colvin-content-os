# First Keys Indy — Remotion Storytelling Slideshow

## Campaign
First Keys Indy | Marion County First-Time Homebuyer Campaign
Agent: Tanya Day | Elite Realty & Development

## Video Specs
- Format: Vertical 1080×1920 (TikTok/Reels) + Square 1080×1080 (Feed)
- Duration: 33 seconds
- FPS: 30
- Total frames: 990

## Slide Sequence
| # | Content | Duration |
|---|---|---|
| 1 | "They told us no." | 3.5s |
| 2 | "Redlining wasn't an accident." | 4s |
| 3 | Black families locked out for decades | 4s |
| 4 | "The programs exist." (the turn) | 3.5s |
| 5 | Up to $20,000 in assistance | 4s |
| 6 | First-gen buyers up to $25,000 | 4s |
| 7 | First Keys Indy — free | 3.5s |
| 8 | IndyHomebuyerAssistance.com | 3.5s |
| 9 | 317-995-4719 / Contact card | 3s |

## Render Commands

```bash
# Preview in browser
cd /Users/katrinacolvin/colvin-content-os
npx remotion studio remotion/FirstKeysIndy/Root.tsx

# Render vertical (TikTok/Reels)
npx remotion render remotion/FirstKeysIndy/Root.tsx FirstKeysIndy-Vertical out/FirstKeysIndy-vertical.mp4

# Render square (Feed)
npx remotion render remotion/FirstKeysIndy/Root.tsx FirstKeysIndy-Square out/FirstKeysIndy-square.mp4
```

## Add Music (Optional)
Add a royalty-free track under the slides. Recommended energy:
- Slow, intentional gospel piano or strings for slides 1–3 (history)
- Lift in energy at slide 4 (the turn)
- Confident, warm outro for slides 7–9

Use Remotion's `<Audio>` component with a local MP3 file.

## Font Note
The composition uses Inter (system fallback). For production, install and import:
```bash
npm install @fontsource/inter
```
Then add to the top of FirstKeysIndy.tsx:
```tsx
import '@fontsource/inter/900.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/400.css';
```
