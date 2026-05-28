-- Migration 010: Add render_metadata to content_items
-- Purpose: Store Remotion/orchestrator run metadata (agents used, plan, execution time)
-- Safe to apply: additive only, nullable column with no FK constraints

ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS render_metadata JSONB DEFAULT NULL;

COMMENT ON COLUMN content_items.render_metadata IS
  'Stores Remotion composition data, orchestrator run metadata, or any structured generation context. Nullable. Written by server-side automation only.';
