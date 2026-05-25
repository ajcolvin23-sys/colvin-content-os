# Remotion Asset Policy — Colvin Content OS

Rules for all assets used in Remotion videos. Copyright compliance is non-negotiable.

---

## Image Assets

### Allowed Sources
| Source | License | Notes |
|--------|---------|-------|
| Unsplash | Free (Unsplash license) | Attribution encouraged, not required |
| Pexels | Free (Pexels license) | Attribution encouraged |
| Pixabay (photos) | CC0 | No attribution required |
| Alfred's own photos | Alfred-owned | Best option — authentic |
| Commissioned photos | Purchased | Document license |
| AI-generated images | Platform-specific | Check platform ToS (e.g., Midjourney commercial terms) |

### Not Allowed
- Google image search downloads
- Pinterest images
- Getty Images without paid license
- News article photos
- Any image where source/license is unknown

### First Keys Indy Images
- No images of homes that suggest specific neighborhoods (fair housing risk)
- If using people in images: must be stock or Alfred-owned, not specific identifiable individuals
- No photos from specific Indianapolis neighborhoods that could imply steering

---

## Music and Audio

### Allowed Sources
| Source | License | Notes |
|--------|---------|-------|
| YouTube Audio Library | Free with YouTube attribution conditions | Most reliable free source |
| Pixabay Music | CC0 | No attribution required |
| Bensound.com | Free tier with attribution | Check per-track terms |
| Purchased license (Epidemic Sound, Artlist, etc.) | Commercial license | Document the license |
| Alfred-composed/owned | Alfred-owned | Best option |
| Silence | — | Always allowed |

### Not Allowed
- Copyrighted music (any major label, gospel artist, church hymn recordings)
- Music from streaming services
- YouTube videos' background music
- Music where license is "unclear"

### Gospel Music Note
Recorded gospel music (e.g., a famous gospel artist's track) is copyrighted. Alfred's videos about gospel piano theory should NOT use copyrighted gospel recordings as background. Use instrumental tracks instead.

---

## Fonts

### Allowed Sources
| Source | Notes |
|--------|-------|
| Google Fonts | All free for commercial use |
| Adobe Fonts (if licensed) | Check Adobe plan terms |
| Purchased fonts (e.g., MyFonts) | Document license |
| System fonts | Always available |

### Preferred Fonts by Lane

| Lane | Display Font | Body Font |
|------|-------------|----------|
| colvin_enterprises | Playfair Display or Montserrat Bold | Inter |
| music_theory_secrets | Montserrat ExtraBold | Open Sans |
| first_keys_indy | Nunito | Nunito |
| funding_ready_indiana | Merriweather | Lato |
| all_others | Montserrat | Inter |

---

## Logo Assets

- Alfred's brand logos must be stored in `/public/assets/logos/` in the repo
- Logos must be SVG format for resolution independence
- No third-party logos in videos without explicit written permission from the brand

---

## Video/B-Roll Footage

Remotion Studio generates blueprints that specify what B-roll is needed (via `b_roll_description` in asset manifest). The actual footage is sourced separately.

Options:
1. Alfred records it himself (preferred — authentic)
2. Stock footage: Pexels Videos (free), Pixabay Videos (CC0), Coverr (free)
3. Not allowed: Downloaded clips from YouTube, TikTok, or Instagram

---

## Asset Attribution Documentation

For every non-Alfred asset in a video:
1. Document in the asset manifest: `source`, `license`
2. Store attribution record in Supabase or Alfred's asset library
3. Attribution in video: not required for CC0, but good practice for Unsplash/Pexels

---

## Asset Review

Remotion Asset Manifest Agent is responsible for flagging any asset with:
- `license: null` or unknown
- Source that looks potentially restricted
- Missing attribution for sources that require it

These are surfaced in the review ticket so Alfred can approve or source alternatives.
