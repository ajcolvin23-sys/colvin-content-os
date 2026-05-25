# Daily Remotion Content Workflow — Colvin Content OS

Select approved campaign, generate full video blueprint, validate, queue for approval, then render after approval.

---

## Trigger

Daily cron: 10 AM ET (`0 10 * * *`) — only runs if approved campaign with open video slot exists.
Hermes checks: Is there a campaign with `video_slots > videos_created`? If not, skip today.

---

## Workflow Stages

```
Stage 1: Campaign Selection
  Agent: Gabriel Campaign Router
  Action: Query active campaigns for ones with open video slots
  Logic: Prioritize campaigns with highest priority_score and oldest last video date
  Output: Selected campaign (lane, platform, theme, goal)
  If no campaigns eligible: skip workflow gracefully

Stage 2: Template Selection
  Agent: Remotion Template Agent
  Input: Campaign lane + platform + goal + duration target
  Action: Select best-fit template from REMOTION_TEMPLATE_LIBRARY.md
  Output: Template structure

Stage 3: Script Writing
  Agent: Remotion Script Writer
  Input: Campaign brief + brand guidelines + template
  Action: Generate hook + voiceover script + on-screen text + CTA
  Output: Full script

Stage 4: Scene Planning
  Agent: Remotion Scene Planner
  Input: Script + template
  Action: Assign scenes, durations, components, motion directions
  Output: Scenes array

Stage 5: Caption Timing
  Agent: Remotion Caption Timing Agent
  Input: Voiceover script + scene durations
  Action: Generate word-by-word timing data
  Output: Captions array

Stage 6: Asset Manifest
  Agent: Remotion Asset Manifest Agent
  Input: Scene plan
  Action: List all required assets with license verification
  Output: Asset manifest JSON

Stage 7: Blueprint Assembly
  Agent: Remotion Video Agent
  Input: Script + Scenes + Captions + Asset Manifest
  Action: Assemble full remotion_video.schema.json blueprint
  Output: Complete blueprint JSON

Stage 8: Pre-render QA (Blueprint Review)
  Agent: Schema validator + Claims check
  Action: Validate blueprint against remotion_video.schema.json
  Action: Run through REMOTION_VIDEO_QA_CHECKLIST.md pre-render checklist
  Output: PASS → proceed, FAIL → fix and re-validate

Stage 9: Compliance Check
  Agent: Compliance check
  Input: All text in blueprint
  Action: Claims check, compliance flags
  Output: claims_check populated, compliance_flags on review ticket

Stage 10: Approval Gate (BLOCKS)
  Agent: Human Review Gateway
  Action: Create review_ticket (type: remotion_video)
  Action: Send Telegram alert to Alfred with blueprint summary
  Status: blocked — workflow pauses here

-- After Alfred approves: --

Stage 11: Render Trigger
  Agent: Remotion MCP trigger
  Input: Approved blueprint
  Action: Trigger render job via Remotion MCP
  Output: Render job ID

Stage 12: Render Monitoring
  Agent: Hermes (poll every 30 seconds)
  Action: Monitor render status
  Timeout: Alert at 15 minutes

Stage 13: Post-Render QA
  Agent: Remotion Render QA Agent
  Input: Render output URL + blueprint
  Action: Run REMOTION_VIDEO_QA_CHECKLIST.md post-render checklist
  Output: PASS → deliver, FAIL → alert Alfred

Stage 14: Delivery
  Agent: Hermes
  Action: Store render metadata in Supabase, update blueprint.render_status = 'rendered'
  Action: Send Telegram: "Video ready: [campaign] | [platform] | [duration]s"
  Output: render_output_url in Supabase
```

---

## Parallel Video Generation

Max 1 blueprint per run. This keeps the review queue manageable and maintains quality. Alfred can request additional blueprints via manual trigger.

---

## Integration Status

REQUIRES SETUP: Remotion MCP (REMOTION_MCP_URL env var)
PLANNED: Full render pipeline — Phase 3
