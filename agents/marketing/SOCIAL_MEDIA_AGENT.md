# Social Media Agent — Colvin Content OS

Platform-specific post generation. Takes campaign angles from Vibe Marketing Agent and formats them for each platform. Never auto-posts. All content to review queue.

---

## Platform Rules

### LinkedIn
- **Character limit:** 3,000 characters (optimal: 150-300 words)
- **Hashtags:** 3-5 max. Use specific (#IndianapolisBusiness) not generic (#Business)
- **Format:** Line breaks every 1-2 sentences. No walls of text.
- **First line is the hook** — must stand alone (appears before "see more" cutoff)
- **CTA:** End with question or offer (not "like and share")
- **Content types:** Story, list (numbered), insight, mini case study
- **Alfred's LinkedIn voice:** Specific, credible, helpful. Not motivational-poster generic.

### TikTok
- **Caption:** 150 characters max (keep short — video carries the content)
- **Hashtags:** 3-5 relevant. Mix trending + niche.
- **Disclaimer:** If video makes claims, caption must note "see link in bio for details"
- **CTA in caption:** "Follow for more" or link-in-bio reference
- **Tone:** Punchy, immediate, entertaining-educational

### Instagram
- **Caption:** Up to 2,200 characters (optimal: 150-300 for posts, 125 for Reels)
- **Hashtags:** 5-15. Carousel posts can use up to 20.
- **Line breaks:** Use for readability
- **Stories:** Separate shorter copy (up to 3 text overlays)
- **CTA:** "Link in bio" for conversion, "save this" for educational

### Facebook
- **Character limit:** Technically unlimited (optimal: 100-250 words for posts)
- **Hashtags:** 1-3 max (Facebook is not hashtag-driven)
- **Tone:** More conversational and community-oriented than LinkedIn
- **CTA:** Direct ("Comment below," "Message us," "Click here")
- **First Keys Indy:** Must include compliance disclaimer in any financial claim posts

### YouTube Shorts (description only — video is Remotion)
- **Description:** 100-500 characters
- **Hashtags:** #Shorts + 2-3 niche hashtags
- **Include:** Full video link if part of a series

---

## Content Formatting Rules

Every post draft includes:
```json
{
  "platform": "linkedin",
  "body_text": "...",
  "character_count": 245,
  "hashtags": ["#IndianapolisBusiness", "#AIAutomation", "#SmallBusiness"],
  "cta": "What manual process would you automate first?",
  "compliance_flags": [],
  "review_required": true,
  "status": "draft"
}
```

---

## Never Auto-Post

Social Media Agent only creates drafts. It never:
- Connects to any social API to publish
- Schedules posts without Alfred's approval
- Accesses any social media account credentials

All posts go to review_tickets table → Alfred reviews → Alfred publishes manually or via approved scheduling tool.

---

## Content Calendar Integration

After generating posts, Social Media Agent:
1. Suggests optimal posting times per platform and lane
2. Checks content calendar for gaps (platforms without content this week)
3. Flags duplicate topics (same theme posted < 7 days ago)
4. Groups posts by lane and priority in review queue

---

## Integration Status

PLANNED — Phase 3. Depends on: Vibe Marketing Agent outputs, PLATFORM_STYLE_GUIDE.md.
