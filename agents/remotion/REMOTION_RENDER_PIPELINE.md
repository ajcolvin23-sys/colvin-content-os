# Remotion Render Pipeline — Colvin Content OS

How videos move from concept to delivery. Every stage is defined with durable state in Supabase.

---

## Pipeline Stages

```
Stage 1: Concept
  Agent: Gabriel Campaign Router
  Input: Campaign brief from Gabriel Business Execution Agent
  Output: Video concept with lane, platform, goal, duration target
  State: workflow_run.stage = 'video_concept'
  Status saved: completed

Stage 2: Script
  Agent: Remotion Script Writer
  Input: Video concept
  Output: Hook + voiceover script + on-screen text + CTA
  State: workflow_run.stage = 'video_script'
  
Stage 3: Scene Plan
  Agent: Remotion Scene Planner
  Input: Script + template selection
  Output: Scene array with components, durations, transitions
  State: workflow_run.stage = 'scene_plan'
  
Stage 4: Asset Manifest
  Agent: Remotion Asset Manifest Agent
  Input: Scene plan
  Output: Asset manifest JSON (all required assets listed)
  State: workflow_run.stage = 'asset_manifest'
  
Stage 5: Caption Timing
  Agent: Remotion Caption Timing Agent
  Input: Voiceover script + scene durations
  Output: Caption timing array
  State: workflow_run.stage = 'caption_timing'
  
Stage 6: JSON Blueprint Assembly
  Agent: Remotion Video Agent
  Input: Script + Scene Plan + Asset Manifest + Caption Timing
  Output: Full remotion_video.schema.json blueprint
  State: workflow_run.stage = 'blueprint_assembly'
  
Stage 7: Schema Validation
  Agent: Schema validator (automated)
  Input: Blueprint JSON
  Output: PASS (valid) or FAIL (field errors)
  State: workflow_run.stage = 'schema_validation'
  On fail: Quarantine, regenerate, validate again (max 2 attempts)

Stage 8: Claims Check
  Agent: Compliance check (part of Video Agent)
  Input: All text in blueprint (voiceover, on-screen text, captions)
  Output: claims_check object with risk_level and issues array
  State: workflow_run.stage = 'claims_check'
  On high risk: Escalate to Alfred before review queue
  
Stage 9: Approval Gate (BLOCKS HERE)
  Agent: Human Review Gateway
  Input: Full blueprint + claims check + asset manifest
  Output: Alfred's decision (approve/reject/revision)
  State: workflow_run.status = 'blocked'
  Duration: Wait for Alfred's approval (no timeout for render approval)

Stage 10: Render Trigger
  Agent: Remotion MCP trigger
  Input: Approved blueprint
  Output: Render job ID from Remotion MCP
  State: blueprint.render_status = 'rendering'
  
Stage 11: Render Monitoring
  Agent: Hermes (poll loop every 30 seconds)
  Input: Render job ID
  Output: Render complete signal OR failure signal
  Timeout: Alert Alfred if render > 15 minutes

Stage 12: Render QA
  Agent: Remotion Render QA Agent
  Input: Render output URL + original blueprint
  Output: QA report (PASS/FAIL)
  State: workflow_run.stage = 'render_qa'
  On fail: Alert Alfred, decide re-render or accept with flags
  
Stage 13: Delivery
  Agent: Hermes
  Action: Store render metadata in Supabase, notify Alfred via Telegram
  Output: render_output_url stored in blueprint record
  State: blueprint.render_status = 'rendered'
  Telegram message: "Video ready: [campaign name] | [platform] | [duration]s"
  
Stage 14: Storage
  Output: Video file URL stored in Supabase
  Alfred downloads/publishes manually via dashboard
```

---

## Stage State Persistence

Every stage writes to Supabase `workflow_runs`:
- Stage start: `status: running`
- Stage complete: `status: completed` + `output_snapshot`
- Stage fail: `status: failed` + `error_metadata`
- Approval gate: `status: blocked`

This enables replay from any stage. See STAGE_REPLAY_POLICY.md.

---

## Parallel vs Sequential

Sequential (must complete in order): all 14 stages
Parallel opportunities: none — render pipeline is strictly sequential

---

## Idempotency Keys in Render Pipeline

| Stage | Idempotency Key Format |
|-------|----------------------|
| Blueprint creation | `{lane}_video_{campaign_slug}_{date}` |
| Render trigger | `render_{video_id}` |
| QA run | `qa_{video_id}_attempt_{n}` |

---

## Integration Status

- REQUIRES SETUP: Remotion MCP (REMOTION_MCP_URL env var)
- PLANNED: Full render pipeline implementation in Phase 3
- IMPLEMENTED: Remotion package is in the Next.js stack
