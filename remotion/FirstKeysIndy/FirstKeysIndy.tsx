import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import React from 'react';

// ─── Brand Colors ──────────────────────────────────────────────────────────────
const BLACK = '#0A0A0A';
const GOLD = '#C9A84C';
const WHITE = '#F5F0EB';
const DEEP_RED = '#8B1A1A';

// ─── Frame math ────────────────────────────────────────────────────────────────
// Total: 33 seconds × 30fps = 990 frames
// 9 slides, varying durations

const SLIDES: Array<{
  from: number;
  durationInFrames: number;
  bg: string;
  eyebrow?: string;
  headline: string;
  sub?: string;
  accentColor: string;
  align?: 'left' | 'center';
}> = [
  {
    from: 0,
    durationInFrames: 105,    // 3.5s — hook
    bg: BLACK,
    headline: 'They told us\nno.',
    sub: 'Not once. For generations.',
    accentColor: DEEP_RED,
    align: 'center',
  },
  {
    from: 105,
    durationInFrames: 120,    // 4s — history
    bg: '#0F0F0F',
    eyebrow: 'THE HISTORY',
    headline: 'Redlining wasn\'t\nan accident.',
    sub: 'It was federal policy. And it was aimed at us.',
    accentColor: GOLD,
    align: 'left',
  },
  {
    from: 225,
    durationInFrames: 120,    // 4s — what was taken
    bg: BLACK,
    eyebrow: 'WHAT IT COST',
    headline: 'Black families\nin Indianapolis\nwere locked out\nfor decades.',
    sub: 'Locked out of equity. Inheritance. Stability.',
    accentColor: WHITE,
    align: 'left',
  },
  {
    from: 345,
    durationInFrames: 105,    // 3.5s — the turn
    bg: '#0D1A0D',
    eyebrow: 'BUT TODAY',
    headline: 'The programs\nexist.',
    sub: 'Right now. In Marion County.',
    accentColor: GOLD,
    align: 'center',
  },
  {
    from: 450,
    durationInFrames: 120,    // 4s — $20k
    bg: BLACK,
    eyebrow: '✅ VERIFIED — INDIANA PROGRAM',
    headline: 'Up to $20,000\nin down payment\nassistance.',
    sub: 'May be available for eligible first-time buyers through participating Indiana lenders.',
    accentColor: GOLD,
    align: 'left',
  },
  {
    from: 570,
    durationInFrames: 120,    // 4s — $25k first gen
    bg: '#0A0A0A',
    eyebrow: '✅ VERIFIED — FIRST-GENERATION PROGRAM',
    headline: 'First-generation\nbuyers may qualify\nfor up to $25,000.',
    sub: 'If your parents never owned a home — this may be for you.',
    accentColor: GOLD,
    align: 'left',
  },
  {
    from: 690,
    durationInFrames: 105,    // 3.5s — First Keys Indy
    bg: '#0A0A0A',
    eyebrow: 'FIRST KEYS INDY',
    headline: 'Free.\nFor you.\nRight now.',
    sub: 'Homebuyer education and readiness — no cost, no pressure.',
    accentColor: GOLD,
    align: 'center',
  },
  {
    from: 795,
    durationInFrames: 105,    // 3.5s — website CTA
    bg: BLACK,
    eyebrow: 'GET YOUR FREE CHECKLIST',
    headline: 'FirstKeysIndy.org',
    sub: 'Eligibility depends on your situation.',
    accentColor: GOLD,
    align: 'center',
  },
  {
    from: 900,
    durationInFrames: 90,     // 3s — contact card
    bg: '#0A0A0A',
    eyebrow: 'CALL OR TEXT TODAY',
    headline: '317-995-4719',
    sub: 'Tanya Day | Broker/Owner | Elite Realty & Development',
    accentColor: GOLD,
    align: 'center',
  },
];

// ─── Slide Component ────────────────────────────────────────────────────────────
const Slide: React.FC<{
  bg: string;
  eyebrow?: string;
  headline: string;
  sub?: string;
  accentColor: string;
  align?: 'left' | 'center';
  localFrame: number;
  durationInFrames: number;
}> = ({ bg, eyebrow, headline, sub, accentColor, align = 'left', localFrame, durationInFrames }) => {
  const { fps } = useVideoConfig();

  // Entrance spring
  const entryProgress = spring({
    fps,
    frame: localFrame,
    config: { damping: 18, stiffness: 120, mass: 0.6 },
  });

  // Exit fade
  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 18, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Eyebrow delayed entrance
  const eyebrowProgress = spring({
    fps,
    frame: Math.max(0, localFrame - 6),
    config: { damping: 20, stiffness: 100, mass: 0.5 },
  });

  // Sub-text delayed entrance
  const subProgress = spring({
    fps,
    frame: Math.max(0, localFrame - 16),
    config: { damping: 22, stiffness: 90, mass: 0.7 },
  });

  // Accent line width
  const lineWidth = interpolate(entryProgress, [0, 1], [0, 80]);

  const textAlign = align === 'center' ? 'center' : 'left';
  const padding = align === 'center' ? '0 60px' : '0 64px';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        opacity: exitOpacity,
        padding,
      }}
    >
      {/* Accent line */}
      <div
        style={{
          width: lineWidth,
          height: 4,
          backgroundColor: accentColor,
          marginBottom: eyebrow ? 24 : 32,
          borderRadius: 2,
        }}
      />

      {/* Eyebrow */}
      {eyebrow && (
        <div
          style={{
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: accentColor,
            textTransform: 'uppercase',
            marginBottom: 20,
            opacity: eyebrowProgress,
            transform: `translateY(${interpolate(eyebrowProgress, [0, 1], [12, 0])}px)`,
            textAlign,
          }}
        >
          {eyebrow}
        </div>
      )}

      {/* Headline */}
      <div
        style={{
          fontFamily: '"Inter", "Helvetica Neue", sans-serif',
          fontSize: headline.length > 30 ? 72 : 90,
          fontWeight: 900,
          lineHeight: 1.05,
          color: WHITE,
          whiteSpace: 'pre-line',
          marginBottom: sub ? 36 : 0,
          opacity: entryProgress,
          transform: `translateY(${interpolate(entryProgress, [0, 1], [28, 0])}px)`,
          textAlign,
        }}
      >
        {headline}
      </div>

      {/* Sub text */}
      {sub && (
        <div
          style={{
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            fontSize: 34,
            fontWeight: 400,
            lineHeight: 1.5,
            color: 'rgba(245, 240, 235, 0.72)',
            opacity: subProgress,
            transform: `translateY(${interpolate(subProgress, [0, 1], [10, 0])}px)`,
            textAlign,
            maxWidth: 900,
          }}
        >
          {sub}
        </div>
      )}

      {/* Bottom brand mark */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          left: align === 'center' ? '50%' : 64,
          transform: align === 'center' ? 'translateX(-50%)' : 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          opacity: interpolate(subProgress, [0, 1], [0, 0.5]),
        }}
      >
        <div style={{ width: 32, height: 2, backgroundColor: GOLD }} />
        <span
          style={{
            fontFamily: '"Inter", sans-serif',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: GOLD,
            textTransform: 'uppercase',
          }}
        >
          First Keys Indy
        </span>
        <div style={{ width: 32, height: 2, backgroundColor: GOLD }} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Background Texture Overlay ─────────────────────────────────────────────────
const GrainOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
      opacity: 0.3,
      pointerEvents: 'none',
    }}
  />
);

// ─── Main Composition ───────────────────────────────────────────────────────────
export const FirstKeysIndy: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <GrainOverlay />
      {SLIDES.map((slide, i) => (
        <Sequence
          key={i}
          from={slide.from}
          durationInFrames={slide.durationInFrames + 12} // slight overlap for smoother cuts
        >
          <Slide
            bg={slide.bg}
            eyebrow={slide.eyebrow}
            headline={slide.headline}
            sub={slide.sub}
            accentColor={slide.accentColor}
            align={slide.align}
            localFrame={frame - slide.from}
            durationInFrames={slide.durationInFrames}
          />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
