-- Colvin Content Automation OS — Database Schema
-- Runs on the Gabriel Supabase project (iuzlbtfevzkerehmluqj)

-- ────────────────────────────────────────────────────────────
-- PLATFORM ACCOUNTS
-- ────────────────────────────────────────────────────────────
create table if not exists platform_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null, -- tiktok | youtube | facebook | linkedin | instagram
  account_name text not null,
  account_type text not null default 'personal', -- personal | page | company
  oauth_status text not null default 'disconnected', -- connected | disconnected | expired | error
  access_token_ref text, -- reference key only — store actual token in env/vault
  refresh_token_ref text,
  token_expires_at timestamptz,
  scopes text[] not null default '{}',
  account_id_on_platform text, -- their user/page/channel ID
  auto_publish boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- CONTENT ITEMS — core content calendar record
-- ────────────────────────────────────────────────────────────
create table if not exists content_items (
  id uuid primary key default gen_random_uuid(),
  lane text not null, -- piano | backflow | linkedin | colvin_enterprises
  platform text not null, -- tiktok | youtube | facebook | linkedin | instagram | multi
  content_type text not null, -- video | post | article | carousel | short | reel | outreach
  title text not null,
  hook text,
  body text,
  caption text,
  cta text,
  hashtags text[] not null default '{}',
  visual_direction text,
  asset_requirements text,
  status text not null default 'draft', -- draft | needs_review | approved | scheduled | published | failed | manual_required | archived
  scheduled_at timestamptz,
  published_at timestamptz,
  platform_post_id text,
  platform_account_id uuid references platform_accounts(id),
  error_message text,
  retry_count integer not null default 0,
  generation_model text,
  generation_prompt_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_items_status_idx on content_items(status);
create index if not exists content_items_platform_idx on content_items(platform);
create index if not exists content_items_lane_idx on content_items(lane);
create index if not exists content_items_scheduled_idx on content_items(scheduled_at);

-- ────────────────────────────────────────────────────────────
-- CONTENT ASSETS — files attached to content items
-- ────────────────────────────────────────────────────────────
create table if not exists content_media_assets (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references content_items(id) on delete cascade,
  asset_type text not null, -- image | video | audio | pdf | slide | thumbnail | voiceover
  file_url text,
  storage_path text,
  file_name text,
  file_size_bytes bigint,
  mime_type text,
  source text, -- upload | generated | book_page | app_screenshot | stock
  usage_rights text not null default 'owned',
  lane text,
  tags text[] not null default '{}',
  notes text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists content_media_assets_item_idx on content_media_assets(content_item_id);
create index if not exists content_media_assets_type_idx on content_media_assets(asset_type);

-- ────────────────────────────────────────────────────────────
-- VIDEO PROJECTS — piano slideshow video builder
-- ────────────────────────────────────────────────────────────
create table if not exists video_projects (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid references content_items(id) on delete set null,
  title text not null,
  lane text not null default 'piano',
  platform text not null default 'tiktok', -- tiktok | youtube_shorts
  duration_seconds integer,
  aspect_ratio text not null default '9:16',
  render_status text not null default 'draft', -- draft | script_ready | rendering | rendered | failed
  output_file_url text,
  output_storage_path text,
  voiceover_script text,
  voiceover_audio_url text,
  background_music_url text,
  thumbnail_url text,
  render_settings jsonb not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- VIDEO SLIDES — individual slides in a video project
-- ────────────────────────────────────────────────────────────
create table if not exists video_slides (
  id uuid primary key default gen_random_uuid(),
  video_project_id uuid not null references video_projects(id) on delete cascade,
  slide_order integer not null,
  slide_type text not null default 'text', -- text | image | text_over_image
  text_on_screen text,
  visual_asset_id uuid references content_media_assets(id),
  background_color text,
  voiceover_text text,
  duration_seconds numeric(5,2) not null default 4.0,
  transition text not null default 'fade', -- fade | slide | zoom | cut
  animation text, -- zoom_in | pan_left | pan_right | none
  created_at timestamptz not null default now()
);

create index if not exists video_slides_project_idx on video_slides(video_project_id);
create index if not exists video_slides_order_idx on video_slides(video_project_id, slide_order);

-- ────────────────────────────────────────────────────────────
-- OUTREACH PROSPECTS — LinkedIn + platform outreach tracking
-- ────────────────────────────────────────────────────────────
create table if not exists outreach_prospects (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'linkedin', -- linkedin | email | twitter
  name text not null,
  company text,
  title text,
  profile_url text,
  location text,
  industry text,
  verified_signal text, -- what triggered this outreach
  pain_hypothesis text, -- what problem they likely have
  offer_fit text, -- which Alfred offer matches
  status text not null default 'new', -- new | researched | connection_sent | connected | messaged | responded | call_booked | not_interested | do_not_contact
  last_contacted_at timestamptz,
  next_follow_up_at timestamptz,
  notes text,
  source text, -- manual | platform_scout | lead_swarm | referral
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists outreach_prospects_status_idx on outreach_prospects(status);
create index if not exists outreach_prospects_platform_idx on outreach_prospects(platform);

-- ────────────────────────────────────────────────────────────
-- OUTREACH MESSAGES — drafted messages per prospect
-- ────────────────────────────────────────────────────────────
create table if not exists outreach_messages (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references outreach_prospects(id) on delete cascade,
  message_type text not null, -- connection_request | follow_up_1 | follow_up_2 | value_touch | final
  body text not null,
  status text not null default 'draft', -- draft | approved | sent | replied | bounced
  approved_at timestamptz,
  sent_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────
-- CONTENT SCHEDULE CONFIG — per-platform posting times
-- ────────────────────────────────────────────────────────────
create table if not exists schedule_config (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  lane text,
  post_slot text not null, -- morning | evening
  post_time_utc time not null default '13:00', -- 8am EST = 13:00 UTC
  days_of_week integer[] not null default '{1,2,3,4,5}', -- 0=Sun, 1=Mon...
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Default schedule
insert into schedule_config (platform, lane, post_slot, post_time_utc, days_of_week) values
  ('linkedin',  'colvin_enterprises', 'morning', '13:00', '{1,2,3,4,5}'),
  ('tiktok',    'piano',              'evening', '23:00', '{1,2,3,4,5}'),
  ('facebook',  'backflow',           'morning', '14:00', '{2,4,6}'),
  ('youtube',   'piano',              'evening', '22:00', '{1,3,5}'),
  ('linkedin',  'piano',              'morning', '13:00', '{6}')
on conflict do nothing;

-- ────────────────────────────────────────────────────────────
-- AUDIT LOGS
-- ────────────────────────────────────────────────────────────
create table if not exists content_audit_logs (
  id uuid primary key default gen_random_uuid(),
  action text not null, -- create | update | approve | reject | publish | fail | delete | generate
  entity_type text not null, -- content_item | video_project | outreach_message | asset | account
  entity_id uuid,
  entity_title text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists content_audit_logs_entity_idx on content_audit_logs(entity_type, entity_id);
create index if not exists content_audit_logs_created_idx on content_audit_logs(created_at desc);

-- ────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (run manually via Supabase dashboard or CLI)
-- ────────────────────────────────────────────────────────────
-- insert into storage.buckets (id, name, public) values ('content-assets', 'content-assets', false);
-- insert into storage.buckets (id, name, public) values ('video-renders', 'video-renders', false);
-- insert into storage.buckets (id, name, public) values ('book-pages', 'book-pages', false);
