-- Durable media URL for generated content (infographics, video thumbnails, etc.)
-- Populated by gabriel:daily after uploading the asset to the public content-media
-- Storage bucket, so the approvals page can display + the user can download it.
alter table public.content_items add column if not exists media_url text;
