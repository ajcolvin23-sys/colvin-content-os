-- Migration 007: CMS Tables for Gabriel Website Operating Brain
-- Created: 2026-05-25
-- Purpose: Full CMS layer for Alfred's 9 business lane websites.
--          Adds sites, pages, sections, publish queue, version history,
--          rollback events, agent tasks, approvals, experiments, and
--          research findings tables.
-- Approval required: Alfred must review before running in production.
-- Track C change — do not run without explicit Alfred approval.

-- ============================================================
-- SITES
-- One row per website Alfred operates.
-- ============================================================
CREATE TABLE IF NOT EXISTS sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lane_id text NOT NULL,
  site_name text NOT NULL,
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'staging', 'archived')),
  framework text DEFAULT 'nextjs',
  compliance_lane boolean NOT NULL DEFAULT false,
  katrina_review_required boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE sites IS 'Alfred''s 9 business lane websites. compliance_lane=true triggers Katrina review gate.';

-- ============================================================
-- PAGES
-- One row per distinct URL/route.
-- ============================================================
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  page_type text NOT NULL CHECK (page_type IN ('landing', 'blog', 'home', 'about', 'contact', 'event', 'offer', 'legal', 'other')),
  goal text,
  traffic_source text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'staged', 'live', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(site_id, slug)
);

COMMENT ON TABLE pages IS 'Each URL/route across all sites. page_type and goal inform Gabriel''s content strategy.';

-- ============================================================
-- PAGE_SECTIONS
-- Granular CMS: each hero, CTA, testimonial block, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS page_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  section_type text NOT NULL CHECK (section_type IN ('hero', 'cta', 'proof', 'offer', 'faq', 'footer', 'problem', 'solution', 'feature', 'other')),
  position integer NOT NULL DEFAULT 0,
  headline text,
  subheadline text,
  body_copy text,
  cta_text text,
  cta_url text,
  proof_element text,
  design_component text,
  mobile_variant text,
  active_experiment_id uuid,
  content_version_id uuid,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'staged', 'live', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE page_sections IS 'Granular CMS. Each row is one section of a page. active_experiment_id links to experiments table when a test is running.';

-- ============================================================
-- PUBLISH_QUEUE
-- Staged content waiting for Alfred approval + deploy.
-- ============================================================
CREATE TABLE IF NOT EXISTS publish_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  page_id uuid REFERENCES pages(id),
  section_id uuid REFERENCES page_sections(id),
  content_type text NOT NULL,
  content_payload jsonb NOT NULL,
  drafted_by text NOT NULL DEFAULT 'gabriel',
  qa_status text NOT NULL DEFAULT 'pending' CHECK (qa_status IN ('pending', 'pass', 'revise', 'reject')),
  qa_notes text,
  approval_status text NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_by text,
  approved_at timestamptz,
  published_at timestamptz,
  status text NOT NULL DEFAULT 'staged' CHECK (status IN ('staged', 'approved', 'published', 'rejected', 'rolled_back')),
  compliance_review_required boolean NOT NULL DEFAULT false,
  compliance_reviewed_by text,
  compliance_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE publish_queue IS 'All content staged for Alfred approval. Nothing publishes without approval_status = approved.';

-- ============================================================
-- CONTENT_VERSIONS
-- Immutable version history of every published section.
-- ============================================================
CREATE TABLE IF NOT EXISTS content_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES page_sections(id),
  version_number integer NOT NULL,
  content_snapshot jsonb NOT NULL,
  published_by text NOT NULL DEFAULT 'gabriel',
  published_at timestamptz NOT NULL DEFAULT now(),
  is_current boolean NOT NULL DEFAULT false,
  superseded_at timestamptz,
  notes text
);

COMMENT ON TABLE content_versions IS 'Immutable snapshot of every deployed section version. Enables rollback.';

CREATE UNIQUE INDEX IF NOT EXISTS content_versions_section_current
  ON content_versions(section_id) WHERE is_current = true;

-- ============================================================
-- ROLLBACK_EVENTS
-- Audit log of every rollback performed.
-- ============================================================
CREATE TABLE IF NOT EXISTS rollback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES page_sections(id),
  rolled_back_from_version_id uuid NOT NULL REFERENCES content_versions(id),
  rolled_back_to_version_id uuid NOT NULL REFERENCES content_versions(id),
  reason text NOT NULL,
  initiated_by text NOT NULL DEFAULT 'alfred',
  initiated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE rollback_events IS 'Audit trail for every rollback. Required for compliance lane rollbacks.';

-- ============================================================
-- AGENT_TASKS
-- Tasks Gabriel logs for traceability and audit.
-- ============================================================
CREATE TABLE IF NOT EXISTS agent_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id text NOT NULL,
  task_type text NOT NULL,
  skill_used text,
  lane_id text,
  site_id uuid REFERENCES sites(id),
  input_summary text,
  output_summary text,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('running', 'completed', 'failed', 'blocked')),
  failure_type text,
  failure_notes text,
  duration_seconds integer,
  model_used text,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE agent_tasks IS 'Every Gabriel task run. Used for audit, learning loop, and failure classification.';

-- ============================================================
-- APPROVALS
-- Formal approval records for content, experiments, and memory.
-- ============================================================
CREATE TABLE IF NOT EXISTS approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  approval_type text NOT NULL CHECK (approval_type IN ('content', 'experiment', 'memory', 'skill-update', 'automation', 'compliance')),
  reference_id uuid,
  reference_table text,
  description text NOT NULL,
  proposed_by text NOT NULL DEFAULT 'gabriel',
  proposed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by text,
  reviewed_at timestamptz,
  decision text CHECK (decision IN ('approved', 'rejected', 'deferred')),
  decision_notes text,
  katrina_review_required boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deferred', 'expired'))
);

COMMENT ON TABLE approvals IS 'Formal approval records. Covers content, experiments, memory promotions, skill updates, and compliance reviews.';

-- ============================================================
-- EXPERIMENTS
-- A/B test tracking linked to Humblytics.
-- ============================================================
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES sites(id),
  page_id uuid REFERENCES pages(id),
  section_id uuid REFERENCES page_sections(id),
  experiment_name text NOT NULL,
  hypothesis text NOT NULL,
  variable_tested text NOT NULL,
  control_description text NOT NULL,
  variant_description text NOT NULL,
  primary_metric text NOT NULL,
  success_threshold text NOT NULL,
  traffic_split integer NOT NULL DEFAULT 50 CHECK (traffic_split BETWEEN 10 AND 90),
  humblytics_experiment_id text,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'running', 'monitoring', 'concluded', 'abandoned', 'archived')),
  evidence_level integer CHECK (evidence_level BETWEEN 1 AND 5),
  approved_by text,
  start_date date,
  end_date date,
  time_limit_days integer NOT NULL DEFAULT 14,
  result text,
  winner text CHECK (winner IN ('control', 'variant', 'no_winner', null)),
  lift_observed numeric,
  confidence_level numeric,
  learning_extracted text,
  proposed_memory_update boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE experiments IS 'A/B test registry. One variable per experiment (enforced by process, not DB constraint). Winner results route to research memory.';

-- ============================================================
-- RESEARCH_FINDINGS
-- Structured research findings from Gabriel's research loop.
-- ============================================================
CREATE TABLE IF NOT EXISTS research_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL,
  session_id text,
  research_topic text NOT NULL,
  topic_category text NOT NULL,
  business_focus text NOT NULL DEFAULT 'all',
  direct_finding text NOT NULL,
  evidence_level integer NOT NULL CHECK (evidence_level BETWEEN 1 AND 5),
  source_quality text NOT NULL CHECK (source_quality IN ('primary', 'high', 'medium', 'low', 'weak')),
  source_url text,
  source_notes text,
  classification text NOT NULL CHECK (classification IN ('fact', 'inference', 'pattern', 'hypothesis')),
  extracted_workflow text,
  gabriel_application text,
  skill_to_update text,
  experiment_to_run text,
  lead_generation_use_case text,
  automation_offer_use_case text,
  confidence_score numeric CHECK (confidence_score BETWEEN 0 AND 1),
  risk_or_limitation text,
  next_action text,
  proposed_memory_update boolean NOT NULL DEFAULT false,
  proposed_skill_update boolean NOT NULL DEFAULT false,
  proposed_experiment boolean NOT NULL DEFAULT false,
  compliance_flagged boolean NOT NULL DEFAULT false,
  katrina_review_required boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'reviewed', 'approved', 'rejected', 'archived')),
  alfred_reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE research_findings IS 'Every structured research finding from Gabriel''s research loop. Evidence level determines routing — level 5 auto-proposes to memory after Alfred review.';

-- ============================================================
-- ROW LEVEL SECURITY
-- Enable RLS on all new tables.
-- ============================================================
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rollback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_findings ENABLE ROW LEVEL SECURITY;

-- Service role policies (Gabriel operates via service role)
CREATE POLICY "Service role full access - sites"
  ON sites FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access - pages"
  ON pages FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access - page_sections"
  ON page_sections FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access - publish_queue"
  ON publish_queue FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access - content_versions"
  ON content_versions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access - rollback_events"
  ON rollback_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access - agent_tasks"
  ON agent_tasks FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access - approvals"
  ON approvals FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access - experiments"
  ON experiments FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access - research_findings"
  ON research_findings FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================
-- INDEXES
-- Performance indexes for common Gabriel query patterns.
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_pages_site_status ON pages(site_id, status);
CREATE INDEX IF NOT EXISTS idx_sections_page_status ON page_sections(page_id, status);
CREATE INDEX IF NOT EXISTS idx_publish_queue_status ON publish_queue(status, approval_status);
CREATE INDEX IF NOT EXISTS idx_experiments_site_status ON experiments(site_id, status);
CREATE INDEX IF NOT EXISTS idx_research_findings_date ON research_findings(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_research_findings_evidence ON research_findings(evidence_level DESC, status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_run ON agent_tasks(run_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status, approval_type);
