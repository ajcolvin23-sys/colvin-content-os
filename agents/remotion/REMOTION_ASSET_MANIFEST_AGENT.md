# Remotion Asset Manifest Agent — Colvin Content OS

List all assets needed for a video. Format as asset manifest JSON. Never assume assets exist — always explicitly list what's required.

---

## Asset Types

| Asset Type | Description | Source Requirements |
|-----------|-------------|-------------------|
| `image` | Static image for scene background or visual | License verified |
| `icon` | SVG or PNG icon | Free or Alfred-owned |
| `font` | Typography font file | License verified |
| `music` | Background audio track | Free license or purchased |
| `b_roll_description` | Description of footage needed (Alfred records or sources) | Description only |
| `color_palette` | Brand color hex values | From brand guidelines |
| `logo` | Alfred's brand logo | Alfred-owned |
| `animation_preset` | Specific Remotion animation | Built into component library |

---

## Asset Manifest Generation

For each scene in the video blueprint, list all required assets:

```json
{
  "manifest": [
    {
      "asset_type": "image",
      "description": "Piano keyboard close-up, hands on keys, warm lighting",
      "scene_number": 2,
      "source": "Unsplash CC0 search: 'piano keyboard hands worship'",
      "license": "cc0",
      "status": "needed",
      "notes": "Prefer images that feel church/gospel, not classical concert hall"
    },
    {
      "asset_type": "font",
      "description": "Display font for hook text",
      "scene_number": 1,
      "source": "Google Fonts: Montserrat Bold",
      "license": "free",
      "status": "available_in_library"
    },
    {
      "asset_type": "music",
      "description": "Gospel-adjacent background track, warm, uplifting, moderate tempo",
      "scene_number": "all",
      "source": "YouTube Audio Library or Pixabay music",
      "license": "free",
      "status": "needed"
    },
    {
      "asset_type": "logo",
      "description": "Music Theory Secrets logo",
      "scene_number": "cta_end_card",
      "source": "Alfred's brand kit",
      "license": "alfred_owned",
      "status": "available"
    }
  ]
}
```

---

## Asset Status Values

| Status | Meaning |
|--------|---------|
| `available` | In Alfred's existing asset library |
| `available_in_library` | Standard library asset (font, color, logo) |
| `needed` | Must be sourced before render can complete |
| `alfred_records` | Alfred needs to record video/audio for this |
| `pending_license_check` | Asset found but license not yet verified |

---

## Copyright and Licensing Rules

See REMOTION_ASSET_POLICY.md for full policy. Summary:
- All images: CC0, Unsplash free, or Alfred-owned. Never stock photos with restrictions.
- All music: YouTube Audio Library, Pixabay, or purchased license. Never copyrighted music.
- All fonts: Google Fonts (free) or purchased license. Never pirated fonts.
- B-roll: Description provided. Alfred records or commissions.

---

## When Assets Are Missing

If `status: needed` assets remain before render:
1. Include the full asset manifest in the review ticket
2. Alfred reviews the manifest alongside the video blueprint
3. Alfred either: provides the assets, approves sourcing from listed free source, or adjusts the scene design
4. Render cannot proceed until all `status: needed` assets are resolved to `status: available`

---

## Asset Library Reference

Alfred's existing asset library (as of initial build):
- Brand logos: Colvin Enterprises, Music Theory Secrets, First Keys Indy (check /public/assets/)
- Brand colors: Defined in gabriel-config.json + GABRIEL_BRAND_MEMORY_POLICY.md
- Standard fonts: Available via Google Fonts CDN
- Photography: To be built up over time

The asset library is tracked in `automation-os/` or `/public/assets/`.
