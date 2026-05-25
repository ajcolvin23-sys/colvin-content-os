/**
 * Shared design tokens for ColvinEnterpriseCinematicStory.
 * Edit colors, font, and scene timing here and changes propagate everywhere.
 */

// ─── Brand Colors ──────────────────────────────────────────────────────────────
export const C = {
  bg:       '#080A0F',   // deep near-black
  bgDeep:   '#050507',   // darkest background (Scene 3)
  bgAlt:    '#06080E',   // blue-tinted dark
  bgGreen:  '#060D0A',   // success green-tinted dark
  card:     '#111318',   // charcoal card surface
  gold:     '#D4AF37',   // primary gold
  goldDeep: '#A67C00',   // deep gold glow
  white:    '#FFFFFF',
  gray:     '#B8B8B8',
  blue:     '#2F80ED',   // electric blue accent
  red:      '#6B1E1E',   // problem/tension red
  green:    '#1F8A5B',   // success/result green
};

// ─── Typography ────────────────────────────────────────────────────────────────
export const FONT = '"Inter", "Helvetica Neue", Arial, sans-serif';

// ─── Scene Timing (frames at 30 fps — edit here to change pacing) ──────────────
// Total: 1800 frames = 60 seconds
export const SCENES = {
  vision:   { from: 0,    dur: 210 },   //  0 –  7 s  slow emotional open
  pressure: { from: 210,  dur: 270 },   //  7 – 16 s  tension builds
  truth:    { from: 480,  dur: 240 },   // 16 – 24 s  freeze + pain statement
  system:   { from: 720,  dur: 300 },   // 24 – 34 s  system arrives
  services: { from: 1020, dur: 360 },   // 34 – 46 s  capability reveal
  transform:{ from: 1380, dur: 270 },   // 46 – 55 s  results + momentum
  cta:      { from: 1650, dur: 150 },   // 55 – 60 s  brand final frame
};

// ─── Canvas dimensions ──────────────────────────────────────────────────────────
export const W = 1080;
export const H = 1920;
export const CX = 540;  // center-x
export const CY = 960;  // center-y
