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
export type SceneType =
  | 'hook'           // Pattern interrupt opener — punch-in text, immediate image motion
  | 'pain_stack'     // 2–3 staggered pain points, kinetic rhythm, tension
  | 'desire'         // Hope shift — from pain toward the outcome
  | 'mechanism'      // 3-step solution cards — how the offer works
  | 'transformation' // Before/after emotional payoff — confidence, control, clarity
  | 'problem'        // Generic pain point statement
  | 'solution'       // Offer reveal
  | 'proof'          // Stat / credibility
  | 'step'           // Step-by-step
  | 'slide'          // Generic slide
  | 'cta'            // CTA end card — pulsing button, branded close
  | 'logo_intro'
  | 'lower_third'
  | 'countdown';

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

// ── Step Definition (for mechanism scenes) ───────────────────────────────────
export interface StepDefinition {
  number: string;        // "1", "2", "3" or emoji
  title: string;         // Step name
  description?: string;  // Optional brief description
}

// ── Scene Definition ──────────────────────────────────────────────────────────
export interface SceneDefinition {
  id: string;
  type: SceneType;
  duration_seconds: number;

  // Text content
  headline?: string;
  body?: string;
  emphasis?: string;          // Word/phrase highlighted in accent color
  caption_text?: string;

  // Proof scenes
  stat?: string;
  stat_label?: string;

  // CTA scenes
  cta_text?: string;
  cta_url?: string;

  // Pain stack — list of pain point strings
  pain_points?: string[];

  // Mechanism — list of 3 step cards
  steps?: StepDefinition[];

  // Transformation — before/after state descriptions
  before_state?: string;
  after_state?: string;

  // Image motion direction for ImageOverlayScene
  motion_direction?: 'push_in' | 'pull_back' | 'drift_left' | 'drift_right' | 'pan_up' | 'pan_down';

  // Color grade override (overrides auto mood detection)
  color_grade?: 'cold' | 'warm' | 'neutral' | 'dramatic' | 'none';

  // Overlay darkness: 'light' | 'medium' | 'heavy'
  overlay_intensity?: 'light' | 'medium' | 'heavy';

  // Legacy motion/transition fields
  motion?: 'fade' | 'slide_up' | 'slide_left' | 'zoom_in' | 'none';
  transition?: 'fade' | 'wipe' | 'cut' | 'none';

  background_override?: string;
  assets?: AssetRef[];
  voiceover?: string;
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
  voiceover_url?: string;         // Resolved: path to generated voiceover MP3
  voiceover_voice?: 'onyx' | 'nova' | 'fable' | 'echo' | 'alloy' | 'shimmer'; // TTS voice
  music_direction?: string;       // Music mood/style description
  music_url?: string;             // Resolved: path to background music MP3
  music_volume?: number;          // Background music volume 0–1 (default 0.18)
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
