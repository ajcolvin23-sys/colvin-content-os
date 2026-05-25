/**
 * ColvinEnterpriseCinematicStory
 *
 * 60-second cinematic brand film for Colvin Enterprises.
 * 7 scenes × 1800 frames @ 30 fps.
 *
 * ─── QUICK EDIT GUIDE ────────────────────────────────────────────────────────
 *  Colors / fonts       → ./theme.ts
 *  Scene timing         → ./theme.ts  SCENES object
 *  Problem cards        → ./components/ProblemStorm.tsx  PROBLEM_CARDS
 *  Service cards        → ./components/ServiceEcosystem.tsx  SERVICES
 *  Result statements    → ./components/DashboardTransformation.tsx  RESULTS
 *  CTA copy             → ./components/FinalCTA.tsx  (BRAND / TAGLINE / URL)
 *  Headline copy        → this file, inside each Scene component below
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 🎵 MUSIC DIRECTION (add your own audio via Remotion's <Audio> component):
 *  Scene 1  Cinematic dark ambient intro — soft, emotional, restrained
 *  Scene 2  Tension rise — faster BPM, low percussion hits
 *  Scene 3  Sudden silence → deep cinematic impact hit
 *  Scene 4  System activation — modern trap/hip-hop pulse
 *  Scene 5  Smooth tech groove — confident, forward-moving
 *  Scene 6  Uplift — warm resolving tone, momentum
 *  Scene 7  Final logo shimmer — soft resolve, premium feel
 *
 * ⚠  No CSS transitions or Tailwind animation classes — Remotion only.
 */

import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Easing,
} from 'remotion';
import { C, FONT, SCENES } from './theme';

// ─── Components ───────────────────────────────────────────────────────────────
import { ParticleField        } from './components/ParticleField';
import { LightBeam            } from './components/LightBeam';
import { FounderSilhouette    } from './components/FounderSilhouette';
import { ProblemStorm         } from './components/ProblemStorm';
import { SystemMap            } from './components/SystemMap';
import { ServiceEcosystem     } from './components/ServiceEcosystem';
import { DashboardTransformation } from './components/DashboardTransformation';
import { FinalCTA             } from './components/FinalCTA';
import { CinematicText        } from './components/CinematicText';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fade out near scene end to allow overlap cross-dissolve */
function exitFade(lf: number, dur: number, startAt = 20): number {
  return interpolate(lf, [dur - startAt, dur - 4], [1, 0], {
    extrapolateLeft:  'clamp',
    extrapolateRight: 'clamp',
    easing:           Easing.ease,
  });
}

/** Radial glow div centered absolutely */
const Glow: React.FC<{
  size:   number;
  color?: string;
  color2?:string;
  top?:   string;
  opacity?:number;
}> = ({ size, color = C.gold, color2 = C.blue, top = '50%', opacity = 1 }) => (
  <div
    style={{
      position:     'absolute',
      width:        size,
      height:       size,
      borderRadius: '50%',
      background:   `radial-gradient(circle, ${color}45 0%, ${color2}20 40%, transparent 68%)`,
      top,
      left:         '50%',
      transform:    'translate(-50%, -50%)',
      pointerEvents:'none',
      filter:       'blur(3px)',
      opacity,
    }}
  />
);

// ─── Scene 1: Vision (0–7 s) ──────────────────────────────────────────────────
// 🎵 MUSIC: Soft ambient intro — gold spark sound on beat 1
const VisionScene: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const { fps } = useVideoConfig();
  const exit  = exitFade(lf, dur);
  const glow  = spring({ fps, frame: lf,                    config: { damping: 22, stiffness: 50, mass: 1.2 } });
  const lineP = spring({ fps, frame: Math.max(0, lf - 14),  config: { damping: 18, stiffness: 100, mass: 0.7 } });

  const glowSz = interpolate(glow, [0, 1], [0, 500]);
  const lineW  = interpolate(lineP, [0, 1], [0, 80]);

  // Slow cinematic camera push (subtle scale 1.06→1.0)
  const camScale = interpolate(lf, [0, dur], [1.06, 1.0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.ease,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        display:         'flex',
        flexDirection:   'column',
        justifyContent:  'flex-start',
        alignItems:      'center',
        padding:         '160px 80px 0',
        opacity:         exit,
        transform:       `scale(${camScale})`,
      }}
    >
      {/* 🔊 SOUND: Soft gold spark on glow entrance */}
      <Glow size={glowSz} top="48%" />
      <LightBeam color={C.gold} angle={0} width={80} opacity={0.5} xPercent={50} />

      {/* Gold accent line */}
      <div style={{ width: lineW, height: 3, backgroundColor: C.gold, borderRadius: 2, marginBottom: 28 }} />

      {/* Eyebrow */}
      <CinematicText
        lines={['Colvin Enterprises']}
        startFrame={10}
        fontSize={26}
        fontWeight={700}
        color={C.gold}
        textAlign="center"
        containerStyle={{ letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 22 }}
        localFrame={lf}
      />

      {/* Main headline — edit copy here */}
      <CinematicText
        lines={['Every mission', 'starts with a vision.']}
        startFrame={16}
        staggerFrames={14}
        fontSize={82}
        fontWeight={900}
        textAlign="center"
        blurReveal
        containerStyle={{ marginBottom: 36 }}
        localFrame={lf}
      />

      {/* Sub text */}
      <CinematicText
        lines={['An idea.', 'A calling.', 'A problem worth solving.']}
        startFrame={40}
        staggerFrames={10}
        fontSize={36}
        fontWeight={400}
        color="rgba(255,255,255,0.62)"
        textAlign="center"
        containerStyle={{ maxWidth: 820 }}
        localFrame={lf}
      />

      {/* Founder silhouette */}
      <FounderSilhouette localFrame={lf} />
    </AbsoluteFill>
  );
};

// ─── Scene 2: Pressure (7–16 s) ───────────────────────────────────────────────
// 🎵 MUSIC: Tension rise — faster hits, notification pings stagger with cards
const PressureScene: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const { fps } = useVideoConfig();
  const exit  = exitFade(lf, dur);
  const headP = spring({ fps, frame: lf, config: { damping: 18, stiffness: 110, mass: 0.6 } });

  // Background dims progressively as cards pile up
  const dimOverlay = interpolate(lf, [40, 180], [0, 0.45], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.ease,
  });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgAlt, opacity: exit }}>
      {/* 🔊 SOUND: Notification ping on each card entrance (~12-frame stagger) */}
      <FounderSilhouette localFrame={lf} yOffset={60} />
      <ProblemStorm localFrame={lf} compressAt={200} />

      {/* Dim overlay tightens as cards arrive */}
      <div
        style={{
          position:       'absolute',
          inset:          0,
          backgroundColor: `rgba(0,0,0,${dimOverlay})`,
          pointerEvents:  'none',
        }}
      />

      {/* Headline */}
      <div
        style={{
          position:   'absolute',
          top:        120,
          left:       72,
          right:      72,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize:   72,
            fontWeight: 900,
            color:      C.white,
            opacity:    headP,
            transform:  `translateY(${interpolate(headP, [0, 1], [24, 0])}px)`,
            lineHeight: 1.1,
          }}
        >
          {'But vision '}
          <span style={{ color: 'rgba(255,255,255,0.35)' }}>{'gets\nburied\u2026'}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 3: Truth (16–24 s) ─────────────────────────────────────────────────
// 🎵 MUSIC: Sudden silence → deep cinematic hit on "systems problem"
const TruthScene: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const { fps } = useVideoConfig();
  const exit  = exitFade(lf, dur);

  // Freeze all card motion at frame 20 (simulated freeze-frame)
  const frozenLf = Math.min(lf, 20);

  // Background desaturates
  const desat = interpolate(lf, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // Gold beam cuts through after freeze
  const beamLf = Math.max(0, lf - 18);

  // Text lines stagger after beam arrives
  const lineA = spring({ fps, frame: Math.max(0, lf - 30), config: { damping: 18, stiffness: 100, mass: 0.7 } });
  const lineB = spring({ fps, frame: Math.max(0, lf - 52), config: { damping: 18, stiffness: 100, mass: 0.7 } });
  const lineC = spring({ fps, frame: Math.max(0, lf - 80), config: { damping: 18, stiffness: 100, mass: 0.7 } });
  const lineD = spring({ fps, frame: Math.max(0, lf - 102), config: { damping: 18, stiffness: 100, mass: 0.7 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bgDeep,
        opacity:         exit,
        filter:          `saturate(${interpolate(desat, [0, 1], [1, 0.4])})`,
      }}
    >
      {/* 🔊 SOUND: Deep hit on freeze */}
      {/* Frozen problem cards in background */}
      <ProblemStorm localFrame={frozenLf} opacity={0.35} />

      {/* Gold beam slices through */}
      <LightBeam
        color={C.gold}
        angle={-35}
        width={160}
        opacity={0.7}
        startFrame={18}
        xPercent={48}
      />

      {/* Strong truth statements */}
      <AbsoluteFill
        style={{
          display:        'flex',
          flexDirection:  'column',
          justifyContent: 'center',
          padding:        '0 80px',
        }}
      >
        {/* 🔊 SOUND: Low cinematic pulse on each text line */}
        <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 900, color: C.white, opacity: lineA, transform: `translateY(${interpolate(lineA, [0, 1], [20, 0])}px)`, marginBottom: 20 }}>
          You are not losing
        </div>
        <div style={{ fontFamily: FONT, fontSize: 44, fontWeight: 900, color: C.white, opacity: lineA, marginBottom: 44 }}>
          because you lack vision.
        </div>
        <div
          style={{
            width:           interpolate(lineB, [0, 1], [0, 200]),
            height:          3,
            backgroundColor: C.red,
            borderRadius:    2,
            marginBottom:    32,
          }}
        />
        <div style={{ fontFamily: FONT, fontSize: 52, fontWeight: 900, color: C.white, opacity: lineB, transform: `translateY(${interpolate(lineB, [0, 1], [20, 0])}px)`, marginBottom: 16 }}>
          You do not have a
        </div>
        {/* 🔊 SOUND: Impact hit on "systems problem" */}
        <div style={{ fontFamily: FONT, fontSize: 64, fontWeight: 900, color: C.gold, opacity: lineC, transform: `translateY(${interpolate(lineC, [0, 1], [20, 0])}px) scale(${interpolate(lineC, [0.7, 1], [1.06, 1])})`, marginBottom: 12 }}>
          systems problem.
        </div>
        <div style={{ fontFamily: FONT, fontSize: 34, fontWeight: 400, color: 'rgba(255,255,255,0.52)', opacity: lineD, transform: `translateY(${interpolate(lineD, [0, 1], [14, 0])}px)` }}>
          Your systems cannot carry the mission.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Scene 4: System Arrives (24–34 s) ────────────────────────────────────────
// 🎵 MUSIC: Beat drop → system activation pulse
const SystemScene: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const { fps } = useVideoConfig();
  const exit  = exitFade(lf, dur);
  const headP = spring({ fps, frame: lf, config: { damping: 18, stiffness: 100, mass: 0.7 } });
  const subP  = spring({ fps, frame: Math.max(0, lf - 22), config: { damping: 20, stiffness: 90, mass: 0.8 } });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bgAlt, opacity: exit }}>
      {/* 🔊 SOUND: Data connection pulses as each spoke draws */}
      <SystemMap localFrame={lf} lineStartFrame={20} />

      {/* Headline at top */}
      <div
        style={{
          position:  'absolute',
          top:       100,
          left:      80,
          right:     80,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily:    FONT,
            fontSize:      62,
            fontWeight:    900,
            color:         C.white,
            opacity:       headP,
            transform:     `translateY(${interpolate(headP, [0, 1], [22, 0])}px)`,
            marginBottom:  16,
          }}
        >
          Then systems change everything.
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize:   30,
            fontWeight: 400,
            color:      C.gold,
            opacity:    subP,
            transform:  `translateY(${interpolate(subP, [0, 1], [12, 0])}px)`,
            letterSpacing: '0.04em',
          }}
        >
          Colvin Enterprises builds the missing infrastructure.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 5: Services (34–46 s) ──────────────────────────────────────────────
// 🎵 MUSIC: Smooth tech groove — confident staggered card reveals
const ServicesScene: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const { fps } = useVideoConfig();
  const exit  = exitFade(lf, dur);
  const headP = spring({ fps, frame: lf, config: { damping: 18, stiffness: 110, mass: 0.6 } });

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg, opacity: exit }}>
      {/* Headline */}
      <div
        style={{
          position:  'absolute',
          top:       80,
          left:      72,
          right:     72,
        }}
      >
        <div
          style={{
            fontFamily:    FONT,
            fontSize:      26,
            fontWeight:    700,
            letterSpacing: '0.12em',
            color:         C.gold,
            textTransform: 'uppercase',
            opacity:       headP,
            marginBottom:  14,
          }}
        >
          What we build
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize:   56,
            fontWeight: 900,
            color:      C.white,
            opacity:    headP,
            transform:  `translateY(${interpolate(headP, [0, 1], [20, 0])}px)`,
            lineHeight: 1.1,
          }}
        >
          {/* 🔊 SOUND: Light UI swipe on each card reveal */}
          AI-powered systems{'\n'}built to move your{'\n'}mission forward.
        </div>
      </div>

      {/* Service grid — positioned below headline */}
      <div
        style={{
          position: 'absolute',
          top:      360,
          left:     0,
          right:    0,
          bottom:   0,
        }}
      >
        <ServiceEcosystem localFrame={lf} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 6: Transformation (46–55 s) ────────────────────────────────────────
// 🎵 MUSIC: Warm uplift — pipeline movement clicks, warm rising tone
const TransformScene: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => {
  const { fps } = useVideoConfig();
  const exit  = exitFade(lf, dur);
  const headP = spring({ fps, frame: lf, config: { damping: 18, stiffness: 110, mass: 0.7 } });
  const subP  = spring({ fps, frame: Math.max(0, lf - 22), config: { damping: 20, stiffness: 90, mass: 0.8 } });

  // Upward momentum: the whole scene drifts upward slightly
  const liftY = interpolate(lf, [0, dur], [0, -12], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.ease,
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bgGreen,
        opacity:         exit,
        transform:       `translateY(${liftY}px)`,
      }}
    >
      {/* 🔊 SOUND: Success pulse wave as dashboard activates */}
      <LightBeam color={C.green} angle={0} width={200} opacity={0.25} xPercent={50} />

      {/* Headline */}
      <div
        style={{
          position: 'absolute',
          top:      90,
          left:     72,
          right:    72,
        }}
      >
        <div
          style={{
            fontFamily: FONT,
            fontSize:   68,
            fontWeight: 900,
            color:      C.white,
            opacity:    headP,
            transform:  `translateY(${interpolate(headP, [0, 1], [24, 0])}px)`,
            lineHeight: 1.1,
            marginBottom: 16,
          }}
        >
          When your systems work…
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontSize:   52,
            fontWeight: 900,
            color:      C.gold,
            opacity:    subP,
            transform:  `translateY(${interpolate(subP, [0, 1], [18, 0])}px)`,
            lineHeight: 1.1,
          }}
        >
          your mission{'\n'}moves faster.
        </div>
      </div>

      {/* Dashboard below headline */}
      <div
        style={{
          position: 'absolute',
          top:      380,
          left:     0,
          right:    0,
          bottom:   0,
        }}
      >
        <DashboardTransformation localFrame={lf} />
      </div>
    </AbsoluteFill>
  );
};

// ─── Scene 7: CTA (55–60 s) ───────────────────────────────────────────────────
// 🎵 MUSIC: Final shimmer — soft premium resolve, hold
const CTAScene: React.FC<{ lf: number; dur: number }> = ({ lf, dur }) => (
  <AbsoluteFill>
    {/* 🔊 SOUND: Gold shimmer on brand name reveal */}
    <FinalCTA localFrame={lf} />
  </AbsoluteFill>
);

// ─── Main composition ─────────────────────────────────────────────────────────
// Registered as:
//   ColvinEnterpriseCinematicStory      — 1080 × 1920 vertical
//   ColvinEnterpriseCinematicStoryWide  — 1920 × 1080 horizontal
// 1800 frames = 60 seconds @ 30 fps
export const ColvinEnterpriseCinematicStory: React.FC = () => {
  const frame = useCurrentFrame();

  // Particle field is always present with varying opacity per scene
  const particleOpacity = interpolate(
    frame,
    [
      SCENES.vision.from,
      SCENES.pressure.from,
      SCENES.truth.from,
      SCENES.system.from,
      SCENES.services.from,
      SCENES.transform.from,
      SCENES.cta.from,
    ],
    [0.4, 0.2, 0.1, 0.3, 0.35, 0.3, 0.45],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Each Sequence gets +16 frames overlap so exitFade creates a cross-dissolve
  const OVERLAP = 16;

  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {/* Ambient particles — persistent across all scenes */}
      <ParticleField opacity={particleOpacity} />

      <Sequence from={SCENES.vision.from}    durationInFrames={SCENES.vision.dur    + OVERLAP}>
        <VisionScene   lf={frame - SCENES.vision.from}    dur={SCENES.vision.dur} />
      </Sequence>

      <Sequence from={SCENES.pressure.from}  durationInFrames={SCENES.pressure.dur  + OVERLAP}>
        <PressureScene lf={frame - SCENES.pressure.from}  dur={SCENES.pressure.dur} />
      </Sequence>

      <Sequence from={SCENES.truth.from}     durationInFrames={SCENES.truth.dur     + OVERLAP}>
        <TruthScene    lf={frame - SCENES.truth.from}     dur={SCENES.truth.dur} />
      </Sequence>

      <Sequence from={SCENES.system.from}    durationInFrames={SCENES.system.dur    + OVERLAP}>
        <SystemScene   lf={frame - SCENES.system.from}    dur={SCENES.system.dur} />
      </Sequence>

      <Sequence from={SCENES.services.from}  durationInFrames={SCENES.services.dur  + OVERLAP}>
        <ServicesScene lf={frame - SCENES.services.from}  dur={SCENES.services.dur} />
      </Sequence>

      <Sequence from={SCENES.transform.from} durationInFrames={SCENES.transform.dur + OVERLAP}>
        <TransformScene lf={frame - SCENES.transform.from} dur={SCENES.transform.dur} />
      </Sequence>

      <Sequence from={SCENES.cta.from}       durationInFrames={SCENES.cta.dur}>
        <CTAScene      lf={frame - SCENES.cta.from}       dur={SCENES.cta.dur} />
      </Sequence>
    </AbsoluteFill>
  );
};
