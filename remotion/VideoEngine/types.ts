/**
 * VideoEngine Types
 *
 * Gabriel generates a VideoScript JSON file.
 * Remotion renders it using prebuilt scene components.
 * No React code regenerated per video.
 */

// ── Brand IDs ─────────────────────────────────────────────────────────────────
export type BrandId =
  | 'colvin_enterprises'
  | 'first_keys_indy'
  | 'indiana_backflow'
  | 'music_theory_secrets'
  | 'piano_app'
  | 'funding_ready_indiana'
  | 'girls_got_game'
  | 'glory_engine';

// ── Platform ──────────────────────────────────────────────────────────────────
export type Platform =
  | 'tiktok'
  | 'youtube_shorts'
  | 'instagram_reels'
  | 'facebook_reels'
  | 'linkedin_video'
  | 'slideshow'
  | 'promo';

// ── Video Format ──────────────────────────────────────────────────────────────
export type VideoFormat = '9:16' | '1:1' | '16:9';

// ── Scene Types ───────────────────────────────────────────────────────────────
// Each type maps to a prebuilt scene component in /scenes/
export type SceneType =
  | 'hook'          // Attention-grabbing opener — big bold statement
  | 'problem'       // Pain point / problem statement
  | 'solution'      // The answer / offer reveal
  | 'proof'         // Credibility — result, testimonial, stat
  | 'step'          // Step-by-step instruction
  | 'slide'         // Generic slide — title + body text
  | 'cta'           // Call to action end card
  | 'logo_intro'    // Brand logo opener
  | 'lower_third'   // Name/title overlay on another scene
  | 'countdown';    // Countdown timer overlay

// ── Caption Entry ─────────────────────────────────────────────────────────────
export interface CaptionEntry {
  text: string;
  startFrame: number;   // frame number when caption appears
  endFrame: number;     // frame number when caption disappears
}

// ── Asset Reference ───────────────────────────────────────────────────────────
export interface AssetRef {
  type: 'image' | 'icon' | 'background' | 'lottie';
  description: string;  // Gabriel describes what image is needed
  url?: string;         // Optional: resolved URL if asset exists
  fallback_color?: string; // Background color if asset not found
}

// ── Scene Definition ──────────────────────────────────────────────────────────
export interface SceneDefinition {
  id: string;                     // Unique within this video
  type: SceneType;
  duration_seconds: number;       // Scene length in seconds (converted to frames by engine)
  headline?: string;              // Primary text (large)
  body?: string;                  // Secondary text (smaller)
  emphasis?: string;              // Highlighted word/phrase (accent color)
  caption_text?: string;          // Subtitle/caption shown at bottom
  stat?: string;                  // For proof scenes: the big number/stat
  stat_label?: string;            // Label below the stat
  cta_text?: string;              // For CTA scenes: button/end card text
  cta_url?: string;               // URL to show in CTA
  motion?: 'fade' | 'slide_up' | 'slide_left' | 'zoom_in' | 'none';
  transition?: 'fade' | 'wipe' | 'cut' | 'none';
  background_override?: string;   // Override brand background color for this scene
  assets?: AssetRef[];            // Images/icons needed for this scene
  voiceover?: string;             // Voiceover text for this scene
}

// ── Claims Check ──────────────────────────────────────────────────────────────
export interface ClaimsCheck {
  risk_level: 'low' | 'medium' | 'high';
  issues: string[];               // List of compliance issues found
  reviewed: boolean;
}

// ── The Main Video Script ─────────────────────────────────────────────────────
// Gabriel generates this JSON. Remotion renders it.
export interface VideoScript {
  // Metadata
  video_id: string;               // Unique ID: e.g. "colvin-ai-explainer-001"
  created_at: string;             // ISO timestamp
  campaign?: string;              // Campaign this belongs to

  // Brand + Platform
  brand: BrandId;
  platform: Platform;
  format: VideoFormat;

  // Content
  title: string;                  // Internal title for this video
  audience: string;               // Who this is for
  goal: string;                   // What this video should make them do
  hook: string;                   // The first 3 seconds — must stop the scroll

  // Scenes
  scenes: SceneDefinition[];

  // Audio
  voiceover_script?: string;      // Full voiceover script (all scenes combined)
  music_direction?: string;       // Music mood/style description
  captions?: CaptionEntry[];      // Pre-generated caption timing (optional)

  // Output
  thumbnail_concept?: string;     // Description of thumbnail image
  render_format: VideoFormat;     // Render output format

  // Compliance
  claims_check: ClaimsCheck;
  approval_required: boolean;     // Always true unless explicitly set false

  // Status
  render_status: 'draft' | 'approved' | 'rendering' | 'rendered' | 'failed';
  approved_by?: string;
  approved_at?: string;
}

// ── Brand Config ──────────────────────────────────────────────────────────────
// Each brand config provides visual identity to the SceneRenderer
export interface BrandConfig {
  id: BrandId;
  name: string;
  primary_color: string;          // Hex — main brand color
  secondary_color: string;        // Hex — accent color
  background_color: string;       // Hex — default background
  text_color: string;             // Hex — primary text
  accent_color: string;           // Hex — highlights/emphasis
  font_headline: string;          // Font family for headlines
  font_body: string;              // Font family for body text
  logo_url?: string;              // Optional logo image URL
  tagline?: string;               // Brand tagline
  compliance_notes: string[];     // Rules enforced for this brand's content
}

// ── Template Definition ───────────────────────────────────────────────────────
// Templates are prebuilt scene sequences Gabriel can reference
export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  platforms: Platform[];
  format: VideoFormat;
  duration_seconds: number;
  scene_sequence: Array<{
    type: SceneType;
    duration_seconds: number;
    required_fields: string[];
  }>;
}

// ── Render Result ─────────────────────────────────────────────────────────────
export interface RenderResult {
  video_id: string;
  output_path: string;
  duration_seconds: number;
  frame_count: number;
  render_time_ms: number;
  status: 'success' | 'failed';
  error?: string;
}
