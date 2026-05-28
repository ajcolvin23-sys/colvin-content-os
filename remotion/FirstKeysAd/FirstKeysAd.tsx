/**
 * FirstKeysAd
 *
 * 1080x1920 @ 30fps — TikTok, Reels, Shorts, Facebook vertical.
 * Data-driven: accepts an `ad` prop (FirstKeysAdData) or a raw
 * `videoScript` from Gabriel's JSON. Both produce the same output.
 *
 * Scene routing:
 *   hook          → HookScene (punch-in headline)
 *   pain          → KineticPainScene (word-by-word kinetic lines)
 *   reveal        → GrantRevealScene (badge + gold burst)
 *   trust / proof → TrustScene (local credibility)
 *   transformation→ TransformationScene (golden peak, key icon)
 *   cta           → CTAScene (pulsing button, URL)
 *
 * ProgressBar always on top (frame 0 → end).
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import type { FirstKeysAdData, FirstKeysScene } from './data/firstKeysAds';
import { defaultAd } from './data/firstKeysAds';

import { HookScene }           from './components/HookScene';
import { KineticPainScene }    from './components/KineticPainScene';
import { GrantRevealScene }    from './components/GrantRevealScene';
import { TrustScene }          from './components/TrustScene';
import { TransformationScene } from './components/TransformationScene';
import { CTAScene }            from './components/CTAScene';
import { ProgressBar }         from './components/ProgressBar';

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  ad?:          FirstKeysAdData;
  videoScript?: Record<string, unknown>;  // Gabriel VideoScript JSON passthrough
}

// ── Scene frame lookup ────────────────────────────────────────────────────────
function getSceneAtFrame(
  scenes: FirstKeysScene[],
  frame: number,
): { scene: FirstKeysScene; localFrame: number } {
  let offset = 0;
  for (const scene of scenes) {
    if (frame < offset + scene.frames) {
      return { scene, localFrame: frame - offset };
    }
    offset += scene.frames;
  }
  const last = scenes[scenes.length - 1];
  return { scene: last, localFrame: last.frames - 1 };
}

// ── Gabriel VideoScript → FirstKeysAdData adapter ────────────────────────────
function videoScriptToAd(vs: Record<string, unknown>): FirstKeysAdData {
  const rawScenes = (vs.scenes as Record<string, unknown>[]) ?? [];

  const scenes: FirstKeysScene[] = rawScenes.map((s) => {
    const type    = (s.type as string) ?? 'hook';
    const frames  = s.frames
      ? (s.frames as number)
      : Math.round(((s.duration_seconds as number) ?? 4) * 30);

    // Infer visual mood from scene type
    const isProblem = ['hook', 'problem'].includes(type);

    return {
      id:          (s.id as string) ?? type,
      type:        type as FirstKeysScene['type'],
      frames,
      headline:    (s.headline as string)   ?? undefined,
      subheadline: (s.subheadline as string) ?? undefined,
      lines:       (s.lines as string[])    ?? undefined,
      badge:       (s.badge as string)      ?? undefined,
      cta:         (s.cta_text as string)   ?? undefined,
      button:      (s.button_text as string) ?? (s.cta_text as string) ?? 'See If You Qualify',
      footer:      (s.footer as string)     ?? 'firstkeysindy.org',
      imageUrl:    (s.assets as { url?: string }[])?.[0]?.url ?? undefined,
      visualMood:  isProblem ? 'stress' : 'hope',
    };
  });

  return {
    id:      (vs.video_id as string) ?? 'gabriel-generated',
    name:    (vs.title as string)    ?? 'First Keys Indy',
    variant: 'pain-first',
    complianceLanguage: {
      use:   ['may qualify', 'check eligibility', 'options may be available'],
      avoid: ['guaranteed', 'everyone qualifies', 'free house', 'instant approval'],
    },
    scenes,
  };
}

// ── calculateMetadata export — dynamic duration from scene data ───────────────
export const calculateFirstKeysAdMetadata = async ({
  props,
}: {
  props: Props;
}) => {
  const ad = props.videoScript
    ? videoScriptToAd(props.videoScript)
    : (props.ad ?? defaultAd);

  const totalFrames = ad.scenes.reduce((acc, s) => acc + s.frames, 0);
  return { durationInFrames: Math.max(totalFrames, 450) }; // min 15s
};

// ── Main composition ──────────────────────────────────────────────────────────
export const FirstKeysAd: React.FC<Props> = ({ ad, videoScript }) => {
  const frame            = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const resolvedAd = videoScript
    ? videoScriptToAd(videoScript)
    : (ad ?? defaultAd);

  const { scene, localFrame } = getSceneAtFrame(resolvedAd.scenes, frame);

  const renderScene = () => {
    switch (scene.type) {

      case 'hook':
        return (
          <HookScene
            headline={scene.headline ?? ''}
            subheadline={scene.subheadline ?? ''}
            imageUrl={scene.imageUrl}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'pain':
        return (
          <KineticPainScene
            lines={scene.lines ?? [scene.headline ?? '']}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'reveal':
      case 'solution':
        return (
          <GrantRevealScene
            headline={scene.headline ?? ''}
            badge={scene.badge}
            cta={scene.cta}
            imageUrl={scene.imageUrl}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'trust':
      case 'proof':
        return (
          <TrustScene
            headline={scene.headline ?? ''}
            imageUrl={scene.imageUrl}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'transformation':
        return (
          <TransformationScene
            headline={scene.headline ?? ''}
            imageUrl={scene.imageUrl}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'cta':
        return (
          <CTAScene
            headline={scene.headline ?? 'Check your eligibility today.'}
            button={scene.button  ?? 'See If You Qualify'}
            footer={scene.footer  ?? 'firstkeysindy.org'}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      default:
        // Unknown scene type — fall back to a simple dark frame
        return (
          <AbsoluteFill
            style={{ background: '#0A1520', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ color: '#F2B84B', fontFamily: 'Inter, sans-serif', fontSize: 40 }}>
              {scene.headline}
            </div>
          </AbsoluteFill>
        );
    }
  };

  return (
    <AbsoluteFill>
      {renderScene()}
      <ProgressBar />
    </AbsoluteFill>
  );
};
