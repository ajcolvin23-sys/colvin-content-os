# Remotion Template Agent — Colvin Content OS

Manages the template library. Selects the right template for each video use case. Customizes templates with Alfred's branding per lane.

---

## Template Selection Process

```
1. Receive: {lane, platform, goal, duration_target, content_type}
2. Query template library (REMOTION_TEMPLATE_LIBRARY.md)
3. Score templates:
   - Platform match (required)
   - Goal match (awareness vs education vs conversion)
   - Duration fit (within 20% of template duration)
   - Lane brand fit
4. Select highest-scoring template
5. Load template structure
6. Apply lane-specific brand overrides:
   - Colors
   - Typography
   - Logo
   - CTA text
7. Return customized template structure to Remotion Video Agent
```

---

## Template Categories

| Category | Templates | Best For |
|---------|----------|---------|
| Short Hook | hook_reveal_30, hook_teaching_45 | TikTok, Reels first-time viewers |
| Educational | step_by_step_60, tutorial_90 | Music Theory Secrets, Colvin demos |
| Promo / Offer | offer_reveal_30, offer_proof_45 | Book sales, consulting CTA |
| Story / Testimony | transformation_60 | First Keys Indy success stories |
| Local/Community | local_awareness_30 | Indiana Backflow, First Keys Indy |
| Slideshow | slideshow_music_45, slideshow_facts_30 | Music lessons, FundingReady facts |
| Announcement | announcement_15, announcement_30 | Event, grant deadline, new content |
| Faith/Community | faith_story_60 | GloryEngine, church content |

---

## Brand Customization by Lane

When applying brand to a template, override:

```json
{
  "brand_overrides": {
    "primary_color": "#1a237e",
    "secondary_color": "#ffd700",
    "font_primary": "Inter",
    "font_display": "Playfair Display",
    "logo_url": "/assets/logos/colvin-enterprises.svg",
    "cta_text": "Book a free AI audit",
    "cta_url": "https://colvinenterprises.com/audit"
  }
}
```

Full brand color and font specs are defined in GABRIEL_BRAND_MEMORY_POLICY.md and applied automatically by lane.

---

## Template Versioning

Templates are versioned:
- `hook_reveal_30_v1` — original
- `hook_reveal_30_v2` — updated based on performance

When Alfred provides feedback that a template structure doesn't work well, a new version is created. Old versions are archived but not deleted (for replay compatibility).

---

## New Template Creation

When no existing template matches a brief:
1. Remotion Template Agent generates a new template structure
2. Saves to REMOTION_TEMPLATE_LIBRARY.md as "custom_{campaign_name}"
3. Marks as `status: untested`
4. After Alfred approves and video performs well: promotes to library

---

## Integration Status

PLANNED — Phase 3. Depends on: REMOTION_TEMPLATE_LIBRARY.md, Remotion Video Agent.
