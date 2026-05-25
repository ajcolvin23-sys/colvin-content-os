/**
 * ColvinEnterpriseStoryVideo — Remotion composition
 *
 * 60-second cinematic story promo for Colvin Enterprises.
 * Vertical (1080×1920) primary format; also registered as 1920×1080 horizontal.
 *
 * ─── HOW TO EDIT ───────────────────────────────────────────────────────────────
 *  • Colors   → COLORS object (line ~20)
 *  • Timing   → SCENES object (line ~35) — values in frames at 30 fps
 *  • Problems → PROBLEMS array (line ~175)
 *  • Services → SERVICES array (line ~250)
 *  • Results  → RESULTS array  (line ~310)
 *  • Copy     → each scene component's JSX string props
 * ───────────────────────────────────────────────────────────────────────────────
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

// ─── Brand Design System ───────────────────────────────────────────────────────
// Edit brand colors here:
const COLORS = {
  bg:      '#080A0F',   // deep near-black
  bgAlt:   '#060810',   // slightly blue-tinted black (tension)
  bgGreen: '#060D0A',   // very dark green (turning point / results)
  card:    '#111318',   // dark charcoal cards
  gold:    '#D4AF37',   // primary gold
  white:   '#FFFFFF',
  gray:    '#B8B8B8',
  blue:    '#2F80ED',   // electric blue accent
  red:     '#6B1E1E',   // problem/danger red
};

const FONT = '"Inter", "Helvetica Neue", Arial, sans-serif';

// ─── Scene timing (frames at 30 fps) ──────────────────────────────────────────
// Edit frame counts here to change scene pacing:
//   30 frames = 1 second
const SCENES = {
  vision:   { from: 0,    dur: 210 },   //  0 – 7 s
  tension:  { from: 210,  dur: 330 },   //  7 – 18 s
  turning:  { from: 540,  dur: 300 },   // 18 – 28 s
  solution: { from: 840,  dur: 450 },   // 28 – 43 s
  result:   { from: 1290, dur: 300 },   // 43 – 53 s
  cta:      { from: 1590, dur: 210 },   // 53 – 60 s
};

// ─── Shared animation helpers ─────────────────────────────────────────────────

/** Fade out near the end of a scene */
function exitFade(localFrame: number, dur: number): number {
  return interpolate(localFrame, [dur - 20, dur - 4], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

/** Translate up from `dist` px → 0 as progress goes 0 → 1 */
function slideUp(progress: number, dist = 28): string {
  return `translateY(${interpolate(progress, [0, 1], [dist, 0])}px)`;
}

// ─── Grain overlay (subtle film texture) ──────────────────────────────────────
const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      opacity: 0.22,
      pointerEvents: 'none',
    }}
  />
);

// ─── Radial glow helper ────────────────────────────────────────────────────────
interface GlowProps {
  size: number;
  color1?: string;
  color2?: string;
  top?: string;
  left?: string;
}
const RadialGlow: React.FC<GlowProps> = ({
  size,
  color1 = COLORS.gold,
  color2 = COLORS.blue,
  top = '50%',
  left = '50%',
}) => (
  <div
    style={{
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color1}44 0%, ${color2}22 42%, transparent 68%)`,
      top,
      left,
      transform: 'translate(-50%, -50%)',
      pointerEvents: 'none',
    }}
  />
);

// ─── Scene 1: Vision (0 – 7 s) ────────────────────────────────────────────────
// Edit headline/sub copy here:
const VisionScene: React.FC<{ localFrame: number; dur: number }> = ({ localFrame, dur }) => {
  const { fps } = useVideoConfig();
  const exit  = exitFade(localFrame, dur);
  const glow  = spring({ fps, frame: localFrame,                         config: { damping: 22, stiffness: 55,  mass: 1.1 } });
  const head  = spring({ fps, frame: Math.max(0, localFrame - 16),       config: { damping: 18, stiffness: 100, mass: 0.7 } });
  const sub   = spring({ fps, frame: Math.max(0, localFrame - 34),       config: { damping: 20, stiffness: 90,  mass: 0.8 } });

  const glowSz = interpolate(glow, [0, 1], [0, 400]);
  const lineW  = interpolate(head, [0, 1], [0, 72]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 72px',
        opacity: exit,
        overflow: 'hidden',
      }}
    >
      <RadialGlow size={glowSz} />

      {/* Gold accent line */}
      <div style={{ width: lineW, height: 3, backgroundColor: COLORS.gold, borderRadius: 2, marginBottom: 28 }} />

      {/* Eyebrow */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: COLORS.gold,
          textTransform: 'uppercase',
          marginBottom: 22,
          opacity: head,
          transform: slideUp(head, 12),
          textAlign: 'center',
        }}
      >
        Colvin Enterprises
      </div>

      {/* Main headline — edit copy here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 80,
          fontWeight: 900,
          lineHeight: 1.08,
          color: COLORS.white,
          textAlign: 'center',
          marginBottom: 36,
          opacity: head,
          transform: slideUp(head, 28),
          whiteSpace: 'pre-line',
        }}
      >
        {'Every great\nbusiness starts\nwith a mission.'}
      </div>

      {/* Sub text — edit copy here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 400,
          lineHeight: 1.55,
          color: 'rgba(255,255,255,0.62)',
          textAlign: 'center',
          opacity: sub,
          transform: slideUp(sub, 14),
          maxWidth: 820,
        }}
      >
        An idea. A calling. A problem worth solving.
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 2: Tension (7 – 18 s) ─────────────────────────────────────────────
// Edit problem labels here:
const PROBLEMS: string[] = [
  'Missed leads',
  'Manual follow-ups',
  'Disconnected tools',
  'Inconsistent content',
  'Slow websites',
  'No clear system',
];

const ProbCard: React.FC<{ label: string; index: number; localFrame: number }> = ({
  label,
  index,
  localFrame,
}) => {
  const { fps } = useVideoConfig();
  const p = spring({
    fps,
    frame: Math.max(0, localFrame - index * 12),
    config: { damping: 16, stiffness: 140, mass: 0.5 },
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 24px',
        backgroundColor: COLORS.card,
        border: `1px solid rgba(107,30,30,0.45)`,
        borderLeft: `4px solid ${COLORS.red}`,
        borderRadius: 12,
        marginBottom: 18,
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-40, 0])}px)`,
      }}
    >
      <span style={{ fontSize: 26, lineHeight: 1 }}>⚠️</span>
      <span style={{ fontFamily: FONT, fontSize: 34, fontWeight: 600, color: COLORS.white }}>
        {label}
      </span>
    </div>
  );
};

const TensionScene: React.FC<{ localFrame: number; dur: number }> = ({ localFrame, dur }) => {
  const { fps } = useVideoConfig();
  const exit = exitFade(localFrame, dur);
  const head = spring({ fps, frame: localFrame, config: { damping: 18, stiffness: 110, mass: 0.6 } });
  const subP = interpolate(localFrame, [150, 192], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgAlt,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 72px',
        opacity: exit,
      }}
    >
      {/* Headline — edit copy here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 70,
          fontWeight: 900,
          color: COLORS.white,
          marginBottom: 44,
          opacity: head,
          transform: slideUp(head, 24),
          lineHeight: 1.1,
        }}
      >
        {'But vision '}
        <span style={{ color: 'rgba(255,255,255,0.38)' }}>{'gets\nburied\u2026'}</span>
      </div>

      {PROBLEMS.map((label, i) => (
        <ProbCard key={label} label={label} index={i} localFrame={localFrame} />
      ))}

      {/* Sub text — edit copy here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 30,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.42)',
          marginTop: 28,
          opacity: subP,
          transform: slideUp(subP, 10),
        }}
      >
        Your mission isn&apos;t missing. Your systems are.
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Turning Point (18 – 28 s) ──────────────────────────────────────
// Edit headline/sub copy here:
const TurningScene: React.FC<{ localFrame: number; dur: number }> = ({ localFrame, dur }) => {
  const { fps } = useVideoConfig();
  const exit = exitFade(localFrame, dur);
  const head = spring({ fps, frame: localFrame,                     config: { damping: 18, stiffness: 100, mass: 0.7 } });
  const sub  = spring({ fps, frame: Math.max(0, localFrame - 22),   config: { damping: 20, stiffness: 90,  mass: 0.8 } });
  const glow = spring({ fps, frame: Math.max(0, localFrame - 8),    config: { damping: 25, stiffness: 50,  mass: 1.2 } });

  const glowSz = interpolate(glow, [0, 1], [0, 700]);
  const lineW  = interpolate(head, [0, 1], [0, 90]);
  const connP  = interpolate(localFrame, [70, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgGreen,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 72px',
        opacity: exit,
        overflow: 'hidden',
      }}
    >
      <RadialGlow size={glowSz} color1={COLORS.gold} color2={COLORS.blue} />

      <div style={{ width: lineW, height: 3, backgroundColor: COLORS.gold, borderRadius: 2, marginBottom: 28 }} />

      <div
        style={{
          fontFamily: FONT,
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: '0.14em',
          color: COLORS.gold,
          textTransform: 'uppercase',
          marginBottom: 22,
          opacity: head,
          textAlign: 'center',
        }}
      >
        The shift
      </div>

      {/* Main headline — edit copy here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 84,
          fontWeight: 900,
          lineHeight: 1.05,
          color: COLORS.white,
          textAlign: 'center',
          marginBottom: 40,
          opacity: head,
          transform: slideUp(head, 30),
          whiteSpace: 'pre-line',
        }}
      >
        {'Then systems\nchange everything.'}
      </div>

      {/* Sub text — edit copy here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 36,
          fontWeight: 400,
          color: 'rgba(255,255,255,0.65)',
          textAlign: 'center',
          opacity: sub,
          transform: slideUp(sub, 14),
          maxWidth: 800,
          lineHeight: 1.5,
        }}
      >
        Strategy connects the mission to execution.
      </div>

      {/* Animated connecting line — visual system metaphor */}
      <div
        style={{
          position: 'absolute',
          bottom: 220,
          left: '50%',
          transform: `translateX(-50%) scaleX(${connP})`,
          transformOrigin: 'center',
          width: 700,
          height: 2,
          background: `linear-gradient(90deg, transparent 0%, ${COLORS.blue}88 25%, ${COLORS.gold} 50%, ${COLORS.blue}88 75%, transparent 100%)`,
          opacity: connP,
        }}
      />
    </AbsoluteFill>
  );
};

// ─── Scene 4: Solution (28 – 43 s) ───────────────────────────────────────────
// Edit service pillars here:
const SERVICES: Array<{ icon: string; label: string }> = [
  { icon: '🌐', label: 'Websites\nthat convert'       },
  { icon: '🎯', label: 'Lead generation\nsystems'      },
  { icon: '🔄', label: 'CRM follow-up\nworkflows'      },
  { icon: '🤖', label: 'AI\nautomation'                },
  { icon: '📱', label: 'Social media\ncontent systems' },
  { icon: '🚀', label: 'Business\ngrowth funnels'      },
];

const SvcCard: React.FC<{ icon: string; label: string; index: number; localFrame: number }> = ({
  icon,
  label,
  index,
  localFrame,
}) => {
  const { fps } = useVideoConfig();
  const p = spring({
    fps,
    frame: Math.max(0, localFrame - 24 - index * 14),
    config: { damping: 18, stiffness: 120, mass: 0.6 },
  });
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        padding: '26px 18px',
        backgroundColor: COLORS.card,
        border: `1px solid rgba(212,175,55,0.22)`,
        borderTop: `3px solid ${COLORS.gold}`,
        borderRadius: 16,
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [24, 0])}px) scale(${interpolate(p, [0, 1], [0.93, 1])})`,
        textAlign: 'center',
        flex: '1 1 0',
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 34, lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontFamily: FONT,
          fontSize: 25,
          fontWeight: 600,
          color: COLORS.white,
          lineHeight: 1.3,
          whiteSpace: 'pre-line',
        }}
      >
        {label}
      </span>
    </div>
  );
};

const SolutionScene: React.FC<{ localFrame: number; dur: number }> = ({ localFrame, dur }) => {
  const { fps } = useVideoConfig();
  const exit  = exitFade(localFrame, dur);
  const head  = spring({ fps, frame: localFrame, config: { damping: 18, stiffness: 110, mass: 0.6 } });
  const lineW = interpolate(head, [0, 1], [0, 80]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 64px',
        opacity: exit,
      }}
    >
      <div style={{ width: lineW, height: 3, backgroundColor: COLORS.gold, borderRadius: 2, marginBottom: 22 }} />

      <div
        style={{
          fontFamily: FONT,
          fontSize: 27,
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: COLORS.gold,
          textTransform: 'uppercase',
          marginBottom: 18,
          opacity: head,
        }}
      >
        What we build
      </div>

      {/* Headline — edit copy here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 58,
          fontWeight: 900,
          color: COLORS.white,
          lineHeight: 1.08,
          marginBottom: 44,
          opacity: head,
          transform: slideUp(head, 22),
          whiteSpace: 'pre-line',
        }}
      >
        {'Colvin Enterprises\nbuilds AI-powered\ngrowth systems.'}
      </div>

      {/* Service grid — 2 columns × 3 rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {[0, 1, 2].map((row) => (
          <div key={row} style={{ display: 'flex', gap: 18 }}>
            {SERVICES.slice(row * 2, row * 2 + 2).map((svc, col) => (
              <SvcCard
                key={svc.label}
                icon={svc.icon}
                label={svc.label}
                index={row * 2 + col}
                localFrame={localFrame}
              />
            ))}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Transformation (43 – 53 s) ─────────────────────────────────────
// Edit result statements here:
const RESULTS: Array<{ icon: string; text: string }> = [
  { icon: '✅', text: 'Leads captured.'           },
  { icon: '✅', text: 'Follow-up automated.'       },
  { icon: '✅', text: 'Content organized.'         },
  { icon: '✅', text: 'Operations clearer.'        },
  { icon: '✅', text: 'Growth becomes repeatable.' },
];

const ResultItem: React.FC<{ icon: string; text: string; index: number; localFrame: number }> = ({
  icon,
  text,
  index,
  localFrame,
}) => {
  const { fps } = useVideoConfig();
  const p = spring({
    fps,
    frame: Math.max(0, localFrame - 20 - index * 16),
    config: { damping: 18, stiffness: 120, mass: 0.6 },
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        marginBottom: 28,
        opacity: p,
        transform: slideUp(p, 20),
      }}
    >
      <span style={{ fontSize: 32, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontFamily: FONT, fontSize: 40, fontWeight: 600, color: COLORS.white }}>
        {text}
      </span>
    </div>
  );
};

const ResultScene: React.FC<{ localFrame: number; dur: number }> = ({ localFrame, dur }) => {
  const { fps } = useVideoConfig();
  const exit = exitFade(localFrame, dur);
  const head = spring({ fps, frame: localFrame, config: { damping: 18, stiffness: 110, mass: 0.7 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bgGreen,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 72px',
        opacity: exit,
      }}
    >
      {/* Headline — edit copy here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 72,
          fontWeight: 900,
          color: COLORS.white,
          lineHeight: 1.08,
          marginBottom: 52,
          opacity: head,
          transform: slideUp(head, 28),
          whiteSpace: 'pre-line',
        }}
      >
        {'Now the mission\nmoves faster.'}
      </div>

      {RESULTS.map((r, i) => (
        <ResultItem key={r.text} icon={r.icon} text={r.text} index={i} localFrame={localFrame} />
      ))}
    </AbsoluteFill>
  );
};

// ─── Scene 6: CTA (53 – 60 s) ────────────────────────────────────────────────
// Edit brand name, tagline, URL, and closing line here:
const CTAScene: React.FC<{ localFrame: number; dur: number }> = ({ localFrame, dur }) => {
  const { fps } = useVideoConfig();
  const exit  = exitFade(localFrame, dur);
  const glow  = spring({ fps, frame: localFrame,                     config: { damping: 24, stiffness: 55,  mass: 1.0 } });
  const brand = spring({ fps, frame: Math.max(0, localFrame - 10),   config: { damping: 18, stiffness: 100, mass: 0.7 } });
  const tag   = spring({ fps, frame: Math.max(0, localFrame - 28),   config: { damping: 20, stiffness: 90,  mass: 0.8 } });
  const cta   = spring({ fps, frame: Math.max(0, localFrame - 46),   config: { damping: 20, stiffness: 90,  mass: 0.8 } });

  const glowSz = interpolate(glow, [0, 1], [0, 560]);
  const lineHW = interpolate(brand, [0, 1], [0, 60]);   // half-width of flanking lines

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.bg,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 72px',
        opacity: exit,
        overflow: 'hidden',
      }}
    >
      <RadialGlow size={glowSz} color1={COLORS.gold} color2={COLORS.blue} top="55%" />

      {/* Flanking lines + dot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginBottom: 38,
          opacity: brand,
        }}
      >
        <div style={{ width: lineHW, height: 2, backgroundColor: COLORS.gold }} />
        <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: COLORS.gold, opacity: 0.85 }} />
        <div style={{ width: lineHW, height: 2, backgroundColor: COLORS.gold }} />
      </div>

      {/* Brand name — edit here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 74,
          fontWeight: 900,
          color: COLORS.white,
          textAlign: 'center',
          letterSpacing: '-0.02em',
          marginBottom: 22,
          opacity: brand,
          transform: slideUp(brand, 28),
        }}
      >
        Colvin Enterprises
      </div>

      {/* Tagline — edit here */}
      <div
        style={{
          fontFamily: FONT,
          fontSize: 34,
          fontWeight: 400,
          color: COLORS.gold,
          textAlign: 'center',
          letterSpacing: '0.04em',
          marginBottom: 62,
          opacity: tag,
          transform: slideUp(tag, 16),
        }}
      >
        Turning mission into momentum.
      </div>

      {/* CTA box — edit URL here */}
      <div
        style={{
          padding: '28px 56px',
          border: `2px solid ${COLORS.gold}`,
          borderRadius: 20,
          opacity: cta,
          transform: slideUp(cta, 20),
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize: 26,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.55)',
            marginBottom: 10,
            letterSpacing: '0.07em',
            textTransform: 'uppercase',
          }}
        >
          Visit us at
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 42,
            fontWeight: 800,
            color: COLORS.white,
            letterSpacing: '0.01em',
          }}
        >
          colvinenterprise.info
        </div>
      </div>

      {/* Closing line — edit here */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          fontFamily: FONT,
          fontSize: 26,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.32)',
          textAlign: 'center',
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          opacity: cta,
        }}
      >
        Build the system. Move the mission.
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ─────────────────────────────────────────────────────────
// Registered as:
//   ColvinEnterpriseStoryPromo          (1080 × 1920 vertical)
//   ColvinEnterpriseStoryPromo-Wide     (1920 × 1080 horizontal)
// Total: 60 s × 30 fps = 1800 frames
export const ColvinEnterpriseStoryVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Grain />

      {/* Each Sequence gets +14 frames of overlap for smooth cross-fade via exitFade */}
      <Sequence from={SCENES.vision.from}   durationInFrames={SCENES.vision.dur   + 14}>
        <VisionScene   localFrame={frame - SCENES.vision.from}   dur={SCENES.vision.dur} />
      </Sequence>

      <Sequence from={SCENES.tension.from}  durationInFrames={SCENES.tension.dur  + 14}>
        <TensionScene  localFrame={frame - SCENES.tension.from}  dur={SCENES.tension.dur} />
      </Sequence>

      <Sequence from={SCENES.turning.from}  durationInFrames={SCENES.turning.dur  + 14}>
        <TurningScene  localFrame={frame - SCENES.turning.from}  dur={SCENES.turning.dur} />
      </Sequence>

      <Sequence from={SCENES.solution.from} durationInFrames={SCENES.solution.dur + 14}>
        <SolutionScene localFrame={frame - SCENES.solution.from} dur={SCENES.solution.dur} />
      </Sequence>

      <Sequence from={SCENES.result.from}   durationInFrames={SCENES.result.dur   + 14}>
        <ResultScene   localFrame={frame - SCENES.result.from}   dur={SCENES.result.dur} />
      </Sequence>

      <Sequence from={SCENES.cta.from}      durationInFrames={SCENES.cta.dur}>
        <CTAScene      localFrame={frame - SCENES.cta.from}      dur={SCENES.cta.dur} />
      </Sequence>
    </AbsoluteFill>
  );
};
