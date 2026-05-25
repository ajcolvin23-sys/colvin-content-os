-- Migration 008: Fix leads table null name constraint
-- Track C critical bug: name TEXT NOT NULL rejects null values
-- but gabriel-daily-run.ts sends name: l.name ?? null for leads
-- without a confirmed name.
--
-- This is the ONLY remaining critical bug from GABRIEL_SYSTEM_AUDIT.md.
-- All other 7 bugs were already fixed in the TypeScript code.

ALTER TABLE leads ALTER COLUMN name DROP NOT NULL;

-- Also add a comment so future devs know why this is nullable
COMMENT ON COLUMN leads.name IS 'Contact name — nullable because scraped leads may not have a confirmed name at extraction time. Code sends null when name is unknown.';
