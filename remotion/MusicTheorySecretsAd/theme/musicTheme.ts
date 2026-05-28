/**
 * musicTheme.ts
 * Deep, rich aesthetic for Music Theory Secrets ads.
 * Feels like a professional recording studio — dark, warm, confident.
 */

export const musicTheme = {
  colors: {
    black:      '#0A0A0F',   // deepest bg
    darkPurple: '#100D1C',   // scene bg
    purple:     '#1E1640',   // card/surface bg
    purpleLight:'#2C2060',   // highlight surface
    gold:       '#F5C842',   // primary accent (music = gold)
    goldDim:    '#C9A030',
    coral:      '#FF6B6B',   // pain / frustration
    cyan:       '#4ECDC4',   // theory reveal
    white:      '#FFFFFF',
    offWhite:   '#E8E0F0',
    gray:       '#5A5070',
    greenNote:  '#52E07C',   // success / "got it" moment
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body:    'Inter, system-ui, sans-serif',
    mono:    '"JetBrains Mono", monospace',
  },
  safe: { top: 120, bottom: 220, left: 36, right: 36 },
} as const;

// Piano key definitions for the visual keyboard
export interface PianoKey {
  note:     string;   // C, D, E, F, G, A, B
  octave:   number;
  isBlack:  boolean;
  label?:   string;   // e.g. "1", "5", "6", "4" for number system
}

// The 1–5–6–4 in C major: C–G–Am–F
export const ONE_FIVE_SIX_FOUR = ['C', 'G', 'Am', 'F'] as const;

export const CHORD_COLORS = {
  'C':  '#F5C842',   // gold — the root, feels like home
  'G':  '#4ECDC4',   // cyan — lift / movement
  'Am': '#FF6B6B',   // coral — emotion / minor pull
  'F':  '#52E07C',   // green — resolution
} as const;
