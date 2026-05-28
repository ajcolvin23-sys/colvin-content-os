/**
 * colvinEnterpriseAds.ts
 *
 * Data-driven ad objects for Colvin Enterprises.
 * Each variant targets a different pain point for Indianapolis SMBs.
 * Compliance: no guaranteed results language.
 */

export type ColvinSceneType =
  | 'hook'
  | 'task-leak'
  | 'lost-revenue'
  | 'automation-pipeline'
  | 'audit-offer'
  | 'cta';

export type ColvinAdVariant =
  | 'task-chaos'
  | 'revenue-leak'
  | 'automation-reveal'
  | 'ai-staff'
  | 'fast-cta';

export interface ColvinTask {
  label: string;
  category: 'crm' | 'email' | 'follow-up' | 'reporting' | 'scheduling' | 'admin';
}

export interface ColvinPipelineNode {
  label:   string;
  icon:    string;
  active?: boolean;
}

export interface ColvinScene {
  id:           string;
  type:         ColvinSceneType;
  frames:       number;           // at 30fps
  headline?:    string;
  subheadline?: string;
  tasks?:       ColvinTask[];     // task-leak scene
  nodes?:       ColvinPipelineNode[]; // automation-pipeline scene
  statLines?:   string[];         // lost-revenue scene stats
  badge?:       string;
  cta?:         string;
  button?:      string;
  footer?:      string;
}

export interface ColvinEnterpriseAdData {
  id:      string;
  name:    string;
  variant: ColvinAdVariant;
  scenes:  ColvinScene[];
}

const SHARED_TASKS: ColvinTask[] = [
  { label: 'Send follow-up email',     category: 'email' },
  { label: 'Update CRM notes',         category: 'crm' },
  { label: 'Schedule next call',       category: 'scheduling' },
  { label: 'Write weekly report',      category: 'reporting' },
  { label: 'Chase unpaid invoice',     category: 'admin' },
  { label: 'Re-engage cold lead',      category: 'follow-up' },
];

const PIPELINE_NODES: ColvinPipelineNode[] = [
  { label: 'New Lead',       icon: '📥' },
  { label: 'Auto-Qualify',   icon: '🤖', active: true },
  { label: 'CRM Update',     icon: '📊', active: true },
  { label: 'Nurture Seq.',   icon: '📧', active: true },
  { label: 'Book Meeting',   icon: '📅', active: true },
  { label: 'Close',          icon: '✅' },
];

// ── VARIANT 1: Task Chaos (cold traffic) ─────────────────────────────────────
export const taskChaosAd: ColvinEnterpriseAdData = {
  id:      'colvin-task-chaos',
  name:    'Colvin Enterprises — Task Chaos',
  variant: 'task-chaos',
  scenes: [
    {
      id:           'hook',
      type:         'hook',
      frames:       90,  // 3s
      headline:     'Your business runs on you.',
      subheadline:  "That's the problem.",
    },
    {
      id:     'task-leak',
      type:   'task-leak',
      frames: 150,  // 5s
      headline: 'Every week, tasks fall through the cracks.',
      tasks:  SHARED_TASKS,
    },
    {
      id:         'lost-revenue',
      type:       'lost-revenue',
      frames:     120,  // 4s
      headline:   'Manual work is quietly killing growth.',
      statLines:  [
        '6–8 hrs/week lost to manual follow-ups',
        '23% of leads never get a second touch',
        'Every missed task = missed revenue',
      ],
    },
    {
      id:       'automation-pipeline',
      type:     'automation-pipeline',
      frames:   150,  // 5s
      headline: 'What if your systems ran themselves?',
      badge:    'AI Automation',
      nodes:    PIPELINE_NODES,
    },
    {
      id:       'audit-offer',
      type:     'audit-offer',
      frames:   120,  // 4s
      headline: 'Free Workflow Audit',
      subheadline: 'We map your biggest time leaks — no pitch, no pressure.',
      badge:    'No Cost. No Obligation.',
    },
    {
      id:      'cta',
      type:    'cta',
      frames:  90,   // 3s
      headline: 'Claim your free workflow audit.',
      button:  'Book My Free Audit',
      footer:  'colvinenterprises.com',
    },
  ],
};

// ── VARIANT 2: Revenue Leak (pain-forward) ───────────────────────────────────
export const revenueLeakAd: ColvinEnterpriseAdData = {
  id:      'colvin-revenue-leak',
  name:    'Colvin Enterprises — Revenue Leak',
  variant: 'revenue-leak',
  scenes: [
    {
      id:           'hook',
      type:         'hook',
      frames:       90,
      headline:     'You have a revenue leak.',
      subheadline:  "And it's not what you think.",
    },
    {
      id:         'lost-revenue',
      type:       'lost-revenue',
      frames:     150,
      headline:   "It's not your offer. It's your follow-up.",
      statLines:  [
        '80% of sales need 5+ follow-ups',
        'Most businesses stop after 1–2',
        'Automation closes that gap',
      ],
    },
    {
      id:     'task-leak',
      type:   'task-leak',
      frames: 120,
      headline: 'These tasks are slipping every week:',
      tasks:  SHARED_TASKS,
    },
    {
      id:       'automation-pipeline',
      type:     'automation-pipeline',
      frames:   150,
      headline: 'Automated systems work while you sleep.',
      badge:    'Colvin AI Systems',
      nodes:    PIPELINE_NODES,
    },
    {
      id:       'audit-offer',
      type:     'audit-offer',
      frames:   120,
      headline: 'We find your top 3 leaks.',
      subheadline: 'Free Workflow Audit — takes 30 minutes.',
      badge:    'Free for Indy SMBs',
    },
    {
      id:      'cta',
      type:    'cta',
      frames:  90,
      headline: 'Find your revenue leaks — free.',
      button:  'Get My Free Audit',
      footer:  'colvinenterprises.com',
    },
  ],
};

// ── VARIANT 3: Automation Reveal (curiosity hook) ────────────────────────────
export const automationRevealAd: ColvinEnterpriseAdData = {
  id:      'colvin-automation-reveal',
  name:    'Colvin Enterprises — Automation Reveal',
  variant: 'automation-reveal',
  scenes: [
    {
      id:           'hook',
      type:         'hook',
      frames:       90,
      headline:     'Indianapolis businesses are automating.',
      subheadline:  "Your competitors may already be ahead.",
    },
    {
      id:       'automation-pipeline',
      type:     'automation-pipeline',
      frames:   150,
      headline: "Here's what an automated business looks like.",
      badge:    'AI Systems',
      nodes:    PIPELINE_NODES,
    },
    {
      id:     'task-leak',
      type:   'task-leak',
      frames: 120,
      headline: 'vs. what most owners are doing manually:',
      tasks:  SHARED_TASKS,
    },
    {
      id:         'lost-revenue',
      type:       'lost-revenue',
      frames:     120,
      headline:   'The gap compounds every month.',
      statLines:  [
        'Automated businesses scale faster',
        'Manual operators hit a ceiling',
        'The fix is simpler than you think',
      ],
    },
    {
      id:       'audit-offer',
      type:     'audit-offer',
      frames:   120,
      headline: 'Start with a free audit.',
      subheadline: 'See exactly what to automate first.',
      badge:    'No Cost. Real Results.',
    },
    {
      id:      'cta',
      type:    'cta',
      frames:  90,
      headline: 'See what to automate in your business.',
      button:  'Book Free Audit',
      footer:  'colvinenterprises.com',
    },
  ],
};

// ── VARIANT 4: Fast CTA (15s retargeting) ────────────────────────────────────
export const fastCtaAd: ColvinEnterpriseAdData = {
  id:      'colvin-fast-cta',
  name:    'Colvin Enterprises — Fast CTA (15s)',
  variant: 'fast-cta',
  scenes: [
    {
      id:           'hook',
      type:         'hook',
      frames:       75,
      headline:     'Still doing it manually?',
      subheadline:  "There's a better way.",
    },
    {
      id:       'automation-pipeline',
      type:     'automation-pipeline',
      frames:   120,
      headline: 'Colvin Enterprises builds AI systems for Indy SMBs.',
      badge:    'AI Automation',
      nodes:    PIPELINE_NODES,
    },
    {
      id:       'audit-offer',
      type:     'audit-offer',
      frames:   120,
      headline: 'Free audit. Real results.',
      subheadline: 'We show you the leaks. You decide what to fix.',
      badge:    'Free for 30 Days',
    },
    {
      id:      'cta',
      type:    'cta',
      frames:  90,
      headline: 'Book your free workflow audit.',
      button:  'Book Free Audit',
      footer:  'colvinenterprises.com',
    },
  ],
};

export const allColvinAds: ColvinEnterpriseAdData[] = [
  taskChaosAd,
  revenueLeakAd,
  automationRevealAd,
  fastCtaAd,
];

export const defaultColvinAd = taskChaosAd;
