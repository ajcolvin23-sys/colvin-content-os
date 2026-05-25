# Gabriel Automation OS

Gabriel is the central daily operator for Alfred Colvin's business growth system. This folder contains everything Gabriel needs to run Alfred's day — finding leads, drafting outreach, generating content, scoring opportunities, and surfacing the top 3 actions for Alfred to take.

## Prime Directive

**Gabriel prepares. Alfred approves. Humans execute.**

Gabriel never sends messages, posts content, or contacts anyone automatically. All outputs land in the review queue. Alfred reviews and approves. Alfred (or a designated human) takes the action.

## Quick Start

```bash
# Run Gabriel's full 15-step daily sequence
npm run gabriel:daily

# Check all APIs, MCPs, and system health
npm run health-check

# Score the orchestrator and identify improvement areas
npm run self-audit
```

## Folder Structure

```
automation-os/
├── README.md                     # This file
│
├── gabriel/                      # Gabriel's core identity and rules
│   ├── gabriel-agent.md          # Who Gabriel is + what Gabriel does
│   ├── gabriel-daily-orchestrator.md  # 15-step daily sequence
│   ├── gabriel-memory.md         # Memory schema and rules
│   ├── gabriel-review-rules.md   # What requires human approval (everything)
│   ├── gabriel-campaign-engine.md # Multi-touch campaign management
│   └── gabriel-reporting.md      # Daily/weekly report formats
│
├── agents/                       # Agent definitions
│   ├── solomon-seo-agent.md      # SEO + market intelligence
│   ├── genius-content-agent.md   # Marketing, copy, content
│   ├── hermes-planner-agent.md   # Router + multi-agent coordinator
│   ├── lead-scout-agent.md       # Prospect research
│   ├── outreach-agent.md         # Draft-only outreach (never sends)
│   └── qa-critic-agent.md        # Always-on quality gate
│
├── skills/                       # Reusable skill instruction files
│   ├── content-generation.md     # Genius Prompt DNA framework
│   ├── lead-scoring.md           # 1–10 lead scoring formula
│   ├── outreach-drafting.md      # Message templates + rules
│   ├── seo-optimization.md       # Solomon SEO framework
│   ├── video-scripting.md        # Video script templates
│   ├── email-sequencing.md       # Email sequence templates
│   ├── campaign-planning.md      # Campaign design + scoring
│   ├── review-queue.md           # Queue management rules
│   ├── memory-save.md            # What/where to save
│   ├── reporting.md              # Report formats
│   └── platform-publishing.md   # Publishing rules by platform
│
├── config/                       # Configuration files
│   ├── gabriel-config.json       # Master config — lanes, thresholds, models
│   ├── platforms.json            # Platform status + capabilities
│   ├── business-lanes.json       # All 9 business lanes with compliance rules
│   ├── outreach-templates.json   # Message templates + forbidden phrases
│   ├── review-thresholds.json    # Scoring thresholds for all queue types
│   ├── cron-schedule.json        # All cron job definitions + status
│   └── model-routing.json        # Which GPT model for which task
│
├── scripts/                      # Executable TypeScript scripts
│   └── gabriel-daily-run.ts      # Main 15-step orchestration script
│
└── data/                         # Runtime data (gitignored except structure)
    ├── leads/                    # Lead JSON files by date
    ├── content/                  # Content draft JSON files by date
    ├── campaigns/                # Campaign state files
    ├── outreach/                 # Outreach draft JSON files by date
    ├── reports/                  # Daily + weekly report JSON files
    └── review-queue/             # Human review packages by date
```

## The 9 Business Lanes

| # | Lane | Status | Primary Goal |
|---|---|---|---|
| 1 | Colvin Enterprises | Active | AI consulting clients |
| 2 | Indiana Backflow Directory | Active | SEO + directory traffic |
| 3 | Music Theory Secrets | Active | Book sales + email list |
| 4 | Piano App | Paused | App launch prep |
| 5 | YouTube / Music Education | Paused | Audience building |
| 6 | First Keys Indy | Active | Homebuyer leads + DPA awareness |
| 7 | FundingReady Indiana | Active | Grant discovery leads |
| 8 | Girls Got Game | Paused | Program launch prep |
| 9 | GloryEngine / Yahweh Comics | Paused | Audience building |

Lanes marked **Paused** are in `paused_lanes` in `gabriel-config.json`. Gabriel skips them in daily runs.

## Automation Schedule

| Job | When | How |
|---|---|---|
| Gabriel Daily Run | 7:00 AM CST daily | GitHub Actions |
| First Keys Daily Video | 5:00 AM EST weekdays, 10:00 AM EST weekends | GitHub Actions |
| Gabriel → Obsidian Sync | Every 30 minutes | Local cron (Mac) |
| Morning Brief | 7:00 AM daily | Local cron (Mac) |
| Task Inbox | Every 2 hours, 8am–8pm | Local cron (Mac) |

## Supabase Tables Required

Run these migrations if tables don't exist:

```sql
-- Gabriel memory
CREATE TABLE gabriel_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_date DATE NOT NULL,
  leads_found INTEGER DEFAULT 0,
  leads_scored INTEGER DEFAULT 0,
  leads_queued INTEGER DEFAULT 0,
  outreach_drafts_created INTEGER DEFAULT 0,
  content_drafts_created INTEGER DEFAULT 0,
  seo_opportunities INTEGER DEFAULT 0,
  completed_actions JSONB DEFAULT '[]',
  pending_actions JSONB DEFAULT '[]',
  carry_forward JSONB DEFAULT '[]',
  top_3_actions JSONB DEFAULT '[]',
  run_errors JSONB DEFAULT '[]',
  run_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outreach drafts (NEVER auto-send)
CREATE TABLE outreach_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_name TEXT,
  lead_company TEXT,
  lane TEXT,
  message_type TEXT,
  draft TEXT,
  priority_score INTEGER DEFAULT 0,
  compliance_flags JSONB DEFAULT '[]',
  katrina_review_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending_review',
  alfred_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content queue (NEVER auto-publish)
CREATE TABLE content_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lane TEXT,
  platform TEXT,
  content_type TEXT,
  draft TEXT,
  character_count INTEGER DEFAULT 0,
  review_required BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'pending_review',
  alfred_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## GitHub Secrets Required

Add these to your GitHub repository Settings → Secrets → Actions:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `FIRECRAWL_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`

## Support

Issues with Gabriel? Run `npm run health-check` first — it checks all APIs, MCPs, and config files.

Then check `automation-os/data/reports/` for the latest daily report with any error details.
