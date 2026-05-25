import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import React from 'react';
import type { DailySlide, DailyVideoProps } from './types';

// ─── Brand Colors ──────────────────────────────────────────────────────────────
const BLACK = '#0A0A0A';
const GOLD = '#C9A84C';
const WHITE = '#F5F0EB';

// ─── Default slides (fallback if no props passed) ───────────────────────────────
export const DEFAULT_SLIDES: DailySlide[] = [
  {
    from: 0,
    durationInFrames: 105,
    bg: BLACK,
    headline: 'First Keys Indy',
    sub: 'Daily homebuyer education for Indianapolis families.',
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

  const entryProgress = spring({
    fps,
    frame: localFrame,
    config: { damping: 18, stiffness: 120, mass: 0.6 },
  });

  const exitOpacity = interpolate(
    localFrame,
    [durationInFrames - 18, durationInFrames - 2],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const eyebrowProgress = spring({
    fps,
    frame: Math.max(0, localFrame - 6),
    config: { damping: 20, stiffness: 100, mass: 0.5 },
  });

  const subProgress = spring({
    fps,
    frame: Math.max(0, localFrame - 16),
    config: { damping: 22, stiffness: 90, mass: 0.7 },
  });

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

// ─── Grain Overlay ──────────────────────────────────────────────────────────────
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
export const DailyVideo: React.FC<DailyVideoProps> = ({
  slides: slidesProp,
  brandName = 'First Keys Indy',
}) => {
  const frame = useCurrentFrame();
  const slides = slidesProp ?? DEFAULT_SLIDES;

  return (
    <AbsoluteFill style={{ backgroundColor: BLACK }}>
      <GrainOverlay />
      {slides.map((slide, i) => (
        <Sequence
          key={i}
          from={slide.from}
          durationInFrames={slide.durationInFrames + 12}
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
