/**
 * musicTheoryAds.ts
 *
 * Data-driven ad objects for Music Theory Secrets.
 * Each variant teaches a micro-lesson inside the ad itself — the hook IS the lesson.
 */

export type MusicSceneType =
  | 'hook'
  | 'pain'
  | 'pattern-reveal'
  | 'keyboard-highlight'
  | 'number-system'
  | 'transformation'
  | 'cta';

export type MusicAdVariant =
  | 'chord-pattern'
  | 'frustration-first'
  | 'number-system-reveal'
  | 'fast-cta';

export interface ChordCard {
  chord:       string;   // 'C', 'G', 'Am', 'F'
  name?:       string;   // 'C major', 'G major', etc.
  numeral:     string;   // '1', '5', '6', '4'
  description: string;   // 'Home', 'Lift', 'Emotion', 'Resolution'
}

export interface KeyHighlight {
  note:     string;  // 'C', 'D', 'E', etc.
  octave?:  number;
  numeral?: string;
  active?:  boolean;
}

export interface MusicScene {
  id:           string;
  type:         MusicSceneType;
  frames:       number;
  headline?:    string;
  subheadline?: string;
  lines?:       string[];
  chords?:      ChordCard[];
  keys?:        KeyHighlight[];
  badge?:       string;
  cta?:         string;
  button?:      string;
  footer?:      string;
}

export interface MusicTheoryAdData {
  id:      string;
  name:    string;
  variant: MusicAdVariant;
  scenes:  MusicScene[];
}

// ── The 4 chords that power thousands of songs ───────────────────────────────
export const PROGRESSION_CHORDS: ChordCard[] = [
  { chord: 'C',  name: 'C Major', numeral: '1', description: 'Home'       },
  { chord: 'G',  name: 'G Major', numeral: '5', description: 'Lift'       },
  { chord: 'Am', name: 'A Minor', numeral: '6', description: 'Emotion'    },
  { chord: 'F',  name: 'F Major', numeral: '4', description: 'Resolution' },
];

// Piano keys to highlight for C major 1–5–6–4
export const PROGRESSION_KEYS: KeyHighlight[] = [
  { note: 'C', octave: 4, numeral: '1', active: true  },
  { note: 'G', octave: 4, numeral: '5', active: true  },
  { note: 'A', octave: 4, numeral: '6', active: true  },
  { note: 'F', octave: 4, numeral: '4', active: true  },
];

// ── VARIANT 1: Chord Pattern (teach-first, curiosity hook) ───────────────────
export const chordPatternAd: MusicTheoryAdData = {
  id:      'music-chord-pattern',
  name:    'Music Theory Secrets — Chord Pattern',
  variant: 'chord-pattern',
  scenes: [
    {
      id:           'hook',
      type:         'hook',
      frames:       90,
      headline:     '4 chords.',
      subheadline:  'Thousands of songs.',
    },
    {
      id:      'pattern-reveal',
      type:    'pattern-reveal',
      frames:  150,
      headline: 'This progression is everywhere:',
      chords:  PROGRESSION_CHORDS,
      badge:   '1 → 5 → 6 → 4',
    },
    {
      id:    'keyboard-highlight',
      type:  'keyboard-highlight',
      frames: 150,
      headline: 'On the piano: C → G → Am → F',
      keys:  PROGRESSION_KEYS,
    },
    {
      id:     'number-system',
      type:   'number-system',
      frames: 120,
      headline: "Once you learn the numbers — it works in every key.",
      lines:  [
        'In G: G → D → Em → C',
        'In D: D → A → Bm → G',
        'Same pattern. Every key.',
      ],
    },
    {
      id:           'transformation',
      type:         'transformation',
      frames:       120,
      headline:     'You already have the ear for it.',
      subheadline:  "Now learn the theory behind it.",
    },
    {
      id:      'cta',
      type:    'cta',
      frames:  90,
      headline: 'Learn to play by ear — free lessons inside.',
      button:  'Watch Free Lesson',
      footer:  'musictheorysecrets.com',
    },
  ],
};

// ── VARIANT 2: Frustration First ─────────────────────────────────────────────
export const frustrationFirstAd: MusicTheoryAdData = {
  id:      'music-frustration-first',
  name:    'Music Theory Secrets — Frustration First',
  variant: 'frustration-first',
  scenes: [
    {
      id:           'hook',
      type:         'hook',
      frames:       90,
      headline:     'Stuck playing the same few songs?',
      subheadline:  "You're not bad at music. You're missing one concept.",
    },
    {
      id:     'pain',
      type:   'pain',
      frames: 120,
      lines:  [
        'You can play songs.',
        "But you can't create freely.",
        'Theory unlocks that.',
      ],
    },
    {
      id:      'pattern-reveal',
      type:    'pattern-reveal',
      frames:  150,
      headline: "Here's the concept that changes everything:",
      chords:  PROGRESSION_CHORDS,
      badge:   'The Number System',
    },
    {
      id:           'transformation',
      type:         'transformation',
      frames:       150,
      headline:     'Players who know this write songs, not just covers.',
      subheadline:  "And they do it in any key.",
    },
    {
      id:      'cta',
      type:    'cta',
      frames:  90,
      headline: 'Start your free theory training.',
      button:  'Start Free Today',
      footer:  'musictheorysecrets.com',
    },
  ],
};

// ── VARIANT 3: Number System Reveal (theory-nerd hook) ───────────────────────
export const numberSystemAd: MusicTheoryAdData = {
  id:      'music-number-system',
  name:    'Music Theory Secrets — Number System',
  variant: 'number-system-reveal',
  scenes: [
    {
      id:           'hook',
      type:         'hook',
      frames:       90,
      headline:     'The Nashville Number System.',
      subheadline:  "How pros communicate music in seconds.",
    },
    {
      id:     'number-system',
      type:   'number-system',
      frames: 150,
      headline: 'Call any chord by its number in the key.',
      lines:  [
        '1 = the root chord (home)',
        '5 = movement (energy)',
        '6 = the emotion chord',
        '4 = resolution (feels complete)',
      ],
      badge: 'Nashville Number System',
    },
    {
      id:      'pattern-reveal',
      type:    'pattern-reveal',
      frames:  150,
      headline: 'The 1–5–6–4 in every key:',
      chords:  PROGRESSION_CHORDS,
    },
    {
      id:    'keyboard-highlight',
      type:  'keyboard-highlight',
      frames: 120,
      headline: 'Hear it. Play it. Use it.',
      keys:  PROGRESSION_KEYS,
    },
    {
      id:      'cta',
      type:    'cta',
      frames:  90,
      headline: 'Master the number system — free.',
      button:  'Watch Free Lesson',
      footer:  'musictheorysecrets.com',
    },
  ],
};

// ── VARIANT 4: Fast CTA (15s retargeting) ────────────────────────────────────
export const musicFastCtaAd: MusicTheoryAdData = {
  id:      'music-fast-cta',
  name:    'Music Theory Secrets — Fast CTA (15s)',
  variant: 'fast-cta',
  scenes: [
    {
      id:           'hook',
      type:         'hook',
      frames:       75,
      headline:     "If you know 4 chords —",
      subheadline:  "you know more than you think.",
    },
    {
      id:      'pattern-reveal',
      type:    'pattern-reveal',
      frames:  120,
      headline: '1 → 5 → 6 → 4',
      chords:  PROGRESSION_CHORDS,
    },
    {
      id:      'cta',
      type:    'cta',
      frames:  90,
      headline: 'Free lessons. No instrument required.',
      button:  'Start Free Today',
      footer:  'musictheorysecrets.com',
    },
  ],
};

export const allMusicAds: MusicTheoryAdData[] = [
  chordPatternAd,
  frustrationFirstAd,
  numberSystemAd,
  musicFastCtaAd,
];

export const defaultMusicAd = chordPatternAd;
