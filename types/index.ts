// Colvin Content Automation OS — Core Types

export type Platform = 'tiktok' | 'youtube' | 'facebook' | 'linkedin' | 'instagram' | 'multi'
export type ContentLane = 'piano' | 'backflow' | 'linkedin' | 'colvin_enterprises'
export type ContentType = 'video' | 'post' | 'article' | 'carousel' | 'short' | 'reel' | 'outreach' | 'slideshow'
export type ContentStatus =
  | 'draft'
  | 'needs_review'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'failed'
  | 'manual_required'
  | 'archived'

export type RenderStatus = 'draft' | 'script_ready' | 'rendering' | 'rendered' | 'failed'
export type OAuthStatus = 'connected' | 'disconnected' | 'expired' | 'error'
export type OutreachStatus =
  | 'new'
  | 'researched'
  | 'connection_sent'
  | 'connected'
  | 'messaged'
  | 'responded'
  | 'call_booked'
  | 'not_interested'
  | 'do_not_contact'

export interface PlatformAccount {
  id: string
  platform: Platform
  account_name: string
  account_type: 'personal' | 'page' | 'company'
  oauth_status: OAuthStatus
  access_token_ref?: string
  token_expires_at?: string
  scopes: string[]
  account_id_on_platform?: string
  auto_publish: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface ContentItem {
  id: string
  lane: ContentLane
  platform: Platform
  content_type: ContentType
  title: string
  hook?: string
  body?: string
  caption?: string
  cta?: string
  hashtags: string[]
  visual_direction?: string
  asset_requirements?: string
  status: ContentStatus
  scheduled_at?: string
  published_at?: string
  platform_post_id?: string
  platform_account_id?: string
  error_message?: string
  retry_count: number
  generation_model?: string
  created_at: string
  updated_at: string
}

export interface ContentMediaAsset {
  id: string
  content_item_id?: string
  asset_type: 'image' | 'video' | 'audio' | 'pdf' | 'slide' | 'thumbnail' | 'voiceover'
  file_url?: string
  storage_path?: string
  file_name?: string
  file_size_bytes?: number
  mime_type?: string
  source: 'upload' | 'generated' | 'book_page' | 'app_screenshot' | 'stock'
  usage_rights: string
  lane?: ContentLane
  tags: string[]
  notes?: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface VideoProject {
  id: string
  content_item_id?: string
  title: string
  lane: ContentLane
  platform: 'tiktok' | 'youtube'
  duration_seconds?: number
  aspect_ratio: string
  render_status: RenderStatus
  output_file_url?: string
  voiceover_script?: string
  voiceover_audio_url?: string
  background_music_url?: string
  thumbnail_url?: string
  render_settings?: Record<string, unknown>
  notes?: string
  created_at: string
  updated_at: string
}

export interface VideoSlide {
  id: string
  video_project_id: string
  slide_order: number
  slide_type: 'text' | 'image' | 'text_over_image'
  text_on_screen?: string
  visual_asset_id?: string
  background_color?: string
  voiceover_text?: string
  duration_seconds: number
  transition: 'fade' | 'slide' | 'zoom' | 'cut'
  animation?: string
  created_at: string
}

export interface OutreachProspect {
  id: string
  platform: string
  name: string
  company?: string
  title?: string
  profile_url?: string
  location?: string
  industry?: string
  verified_signal?: string
  pain_hypothesis?: string
  offer_fit?: string
  status: OutreachStatus
  last_contacted_at?: string
  next_follow_up_at?: string
  notes?: string
  source?: string
  created_at: string
  updated_at: string
}

export interface OutreachMessage {
  id: string
  prospect_id: string
  message_type: 'connection_request' | 'follow_up_1' | 'follow_up_2' | 'value_touch' | 'final'
  body: string
  status: 'draft' | 'approved' | 'sent' | 'replied' | 'bounced'
  approved_at?: string
  sent_at?: string
  notes?: string
  created_at: string
}

export interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id?: string
  entity_title?: string
  metadata: Record<string, unknown>
  created_at: string
}

// Conversion optimizer types
export interface ConversionVariant {
  hook_type: 'story' | 'pain' | 'curiosity'
  hook_type_label: string
  hook: string
  body: string
  caption: string
  cta: string
  hashtags: string[]
  visual_direction: string
  scores: {
    hook_strength: number      // 0-40: stops scroll, grabs attention
    body_clarity: number       // 0-30: delivers clear value
    cta_power: number          // 0-20: drives the desired action
    platform_fit: number       // 0-10: native to platform format
    total: number              // 0-100
  }
  score_reasoning: string
}

export interface ConversionOptimizedResult {
  variants: ConversionVariant[]
  winner_index: number
  winner_reasoning: string
}

// Generation request types
export interface GenerateContentRequest {
  lane: ContentLane
  platform: Platform
  content_type: ContentType
  topic: string
  additional_context?: string
  target_audience?: string
  cta?: string
  tone?: 'professional' | 'casual' | 'educational' | 'inspirational'
}

export interface GenerateVideoScriptRequest {
  topic: string
  platform: 'tiktok' | 'youtube'
  lesson_objective: string
  cta: string
  book_page_description?: string
  slide_count?: number
}

export interface GeneratedVideoScript {
  title: string
  hook: string
  slides: Array<{
    order: number
    text_on_screen: string
    voiceover_text: string
    visual_direction: string
    duration_seconds: number
    transition: string
  }>
  full_voiceover: string
  caption: string
  hashtags: string[]
  thumbnail_text: string
  cta: string
}
