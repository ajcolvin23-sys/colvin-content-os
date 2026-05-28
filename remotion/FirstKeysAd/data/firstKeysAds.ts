/**
 * firstKeysAds.ts
 *
 * Data-driven ad objects for First Keys Indy.
 * Each variant can be rendered independently via FirstKeysAd.tsx.
 * Gabriel generates VideoScript JSON that maps to this structure.
 *
 * Compliance language enforced here — never edit without review.
 */

export type VisualMood = 'stress' | 'pressure' | 'hope' | 'local-trust' | 'success' | 'action';
export type SceneType = 'hook' | 'pain' | 'reveal' | 'solution' | 'trust' | 'proof' | 'transformation' | 'cta';
export type AdVariant = 'pain-first' | 'hope-first' | 'grant-curiosity' | 'local' | 'fast-cta';

export interface FirstKeysScene {
  id: string;
  type: SceneType;
  frames: number;          // at 30fps
  headline?: string;
  subheadline?: string;
  lines?: string[];        // kinetic pain lines
  badge?: string;          // reveal badge label
  cta?: string;            // soft inline CTA text
  button?: string;         // CTA scene button label
  footer?: string;         // CTA scene footer URL
  imageUrl?: string;       // injected by fetch-assets.ts
  visualMood: VisualMood;
}

export interface FirstKeysAdData {
  id: string;
  name: string;
  variant: AdVariant;
  complianceLanguage: {
    use: string[];
    avoid: string[];
  };
  scenes: FirstKeysScene[];
}

const COMPLIANCE = {
  use:   ['may qualify', 'check eligibility', 'options may be available', 'see if you qualify', 'programs may be available'],
  avoid: ['guaranteed', 'everyone qualifies', 'free house', 'instant approval', 'definitely get'],
};

// ── VARIANT 1: Pain-First (best for cold traffic) ─────────────────────────────
export const painFirstAd: FirstKeysAdData = {
  id: 'first-keys-pain-first',
  name: 'First Keys Indy — Pain First',
  variant: 'pain-first',
  complianceLanguage: COMPLIANCE,
  scenes: [
    {
      id: 'hook',
      type: 'hook',
      frames: 90,   // 3s
      headline: 'Marion County renters…',
      subheadline: "Don't give up on buying a home yet.",
      visualMood: 'stress',
    },
    {
      id: 'pain',
      type: 'pain',
      frames: 120,  // 4s
      lines: ['Rent keeps rising.', 'Saving feels impossible.', 'But you may be closer than you think.'],
      visualMood: 'pressure',
    },
    {
      id: 'reveal',
      type: 'reveal',
      frames: 150,  // 5s
      headline: 'You may qualify for help with your down payment.',
      badge: 'Down Payment Assistance',
      cta: 'Check your options',
      visualMood: 'hope',
    },
    {
      id: 'trust',
      type: 'trust',
      frames: 150,  // 5s
      headline: 'First Keys Indy helps Marion County families check eligibility and take the next step.',
      visualMood: 'local-trust',
    },
    {
      id: 'transformation',
      type: 'transformation',
      frames: 150,  // 5s
      headline: 'Imagine getting the keys to your first home.',
      visualMood: 'success',
    },
    {
      id: 'cta',
      type: 'cta',
      frames: 90,   // 3s
      headline: 'Check your eligibility today.',
      button: 'See If You Qualify',
      footer: 'firstkeysindy.org',
      visualMood: 'action',
    },
  ],
};

// ── VARIANT 2: Hope-First (retargeting / warm audiences) ─────────────────────
export const hopeFirstAd: FirstKeysAdData = {
  id: 'first-keys-hope-first',
  name: 'First Keys Indy — Hope First',
  variant: 'hope-first',
  complianceLanguage: COMPLIANCE,
  scenes: [
    {
      id: 'hook',
      type: 'hook',
      frames: 90,
      headline: 'You may be closer to owning a home',
      subheadline: 'than you think.',
      visualMood: 'hope',
    },
    {
      id: 'reveal',
      type: 'reveal',
      frames: 150,
      headline: 'Down payment assistance may be available for Marion County renters.',
      badge: 'Marion County Program',
      cta: 'See what may be available',
      visualMood: 'hope',
    },
    {
      id: 'pain',
      type: 'pain',
      frames: 120,
      lines: ['Many people never check.', "They assume they don't qualify.", 'Most are surprised.'],
      visualMood: 'pressure',
    },
    {
      id: 'trust',
      type: 'trust',
      frames: 120,
      headline: 'First Keys Indy helps you check your options. No pressure. Just clarity.',
      visualMood: 'local-trust',
    },
    {
      id: 'transformation',
      type: 'transformation',
      frames: 120,
      headline: 'Your first home may be one check away.',
      visualMood: 'success',
    },
    {
      id: 'cta',
      type: 'cta',
      frames: 90,
      headline: 'See if you qualify today.',
      button: 'Check My Eligibility',
      footer: 'firstkeysindy.org',
      visualMood: 'action',
    },
  ],
};

// ── VARIANT 3: Grant Curiosity (pattern interrupt hook) ───────────────────────
export const grantCuriosityAd: FirstKeysAdData = {
  id: 'first-keys-grant-curiosity',
  name: 'First Keys Indy — Grant Curiosity',
  variant: 'grant-curiosity',
  complianceLanguage: COMPLIANCE,
  scenes: [
    {
      id: 'hook',
      type: 'hook',
      frames: 90,
      headline: 'Most Marion County renters',
      subheadline: "don't know this program exists.",
      visualMood: 'stress',
    },
    {
      id: 'reveal',
      type: 'reveal',
      frames: 150,
      headline: 'Down payment assistance programs may be available — right now.',
      badge: 'Down Payment Help',
      cta: 'Check your options →',
      visualMood: 'hope',
    },
    {
      id: 'pain',
      type: 'pain',
      frames: 120,
      lines: ["You don't need perfect credit.", 'You may not need 20% down.', 'You just need to check.'],
      visualMood: 'pressure',
    },
    {
      id: 'trust',
      type: 'trust',
      frames: 150,
      headline: "First Keys Indy is a Marion County resource — not a sales pitch. We help you understand what's possible.",
      visualMood: 'local-trust',
    },
    {
      id: 'cta',
      type: 'cta',
      frames: 90,
      headline: 'Takes about 2 minutes to check.',
      button: 'See If You Qualify',
      footer: 'firstkeysindy.org',
      visualMood: 'action',
    },
  ],
};

// ── VARIANT 4: Local Marion County (hyperlocal) ───────────────────────────────
export const localMarionAd: FirstKeysAdData = {
  id: 'first-keys-local-marion',
  name: 'First Keys Indy — Local Marion',
  variant: 'local',
  complianceLanguage: COMPLIANCE,
  scenes: [
    {
      id: 'hook',
      type: 'hook',
      frames: 90,
      headline: 'Renting in Marion County?',
      subheadline: 'Watch this before you give up on buying.',
      visualMood: 'stress',
    },
    {
      id: 'pain',
      type: 'pain',
      frames: 120,
      lines: ['Prices went up.', 'Rates went up.', 'But programs may still exist.'],
      visualMood: 'pressure',
    },
    {
      id: 'reveal',
      type: 'reveal',
      frames: 150,
      headline: 'Homebuyer assistance may be available for Marion County residents.',
      badge: 'Marion County Program',
      cta: 'Check your eligibility',
      visualMood: 'hope',
    },
    {
      id: 'transformation',
      type: 'transformation',
      frames: 150,
      headline: 'Marion County families have taken this step. You can too.',
      visualMood: 'success',
    },
    {
      id: 'cta',
      type: 'cta',
      frames: 90,
      headline: 'Start with a simple eligibility check.',
      button: 'Check My Eligibility',
      footer: 'firstkeysindy.org',
      visualMood: 'action',
    },
  ],
};

// ── VARIANT 5: Fast CTA (15 seconds — retargeting / high-intent) ──────────────
export const fastCtaAd: FirstKeysAdData = {
  id: 'first-keys-fast-cta',
  name: 'First Keys Indy — Fast CTA (15s)',
  variant: 'fast-cta',
  complianceLanguage: COMPLIANCE,
  scenes: [
    {
      id: 'hook',
      type: 'hook',
      frames: 75,   // 2.5s
      headline: "Your down payment may not be the real problem.",
      subheadline: 'Programs may exist. Have you checked?',
      visualMood: 'stress',
    },
    {
      id: 'reveal',
      type: 'reveal',
      frames: 120,  // 4s
      headline: 'Marion County down payment assistance may be available.',
      badge: 'Check Your Eligibility',
      cta: 'No pressure. Just options.',
      visualMood: 'hope',
    },
    {
      id: 'transformation',
      type: 'transformation',
      frames: 120,  // 4s
      headline: 'Many Marion County renters never check. Be different.',
      visualMood: 'success',
    },
    {
      id: 'cta',
      type: 'cta',
      frames: 90,   // 3s
      headline: 'See if you qualify. 2 minutes.',
      button: 'See If You Qualify',
      footer: 'firstkeysindy.org',
      visualMood: 'action',
    },
  ],
};

export const allAds: FirstKeysAdData[] = [
  painFirstAd,
  hopeFirstAd,
  grantCuriosityAd,
  localMarionAd,
  fastCtaAd,
];

export const defaultAd = painFirstAd;
