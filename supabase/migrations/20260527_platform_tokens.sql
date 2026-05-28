-- platform_tokens: stores OAuth tokens for social platform connections
CREATE TABLE IF NOT EXISTS platform_tokens (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  platform      text NOT NULL UNIQUE,   -- 'tiktok' | 'facebook'
  access_token  text NOT NULL,
  refresh_token text,
  expires_at    timestamptz,
  account_id    text,                   -- TikTok open_id or FB page_id
  account_name  text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- publish_logs: audit trail of every publish attempt
CREATE TABLE IF NOT EXISTS publish_logs (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  platform     text NOT NULL,
  video_path   text NOT NULL,
  caption      text,
  success      boolean NOT NULL,
  post_id      text,
  error        text,
  published_at timestamptz DEFAULT now()
);
