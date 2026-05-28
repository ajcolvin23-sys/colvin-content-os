/**
 * MusicTheorySecretsAd
 *
 * 1080x1920 @ 30fps — TikTok, Reels, Shorts, Facebook vertical.
 * Data-driven: accepts an `ad` prop (MusicTheoryAdData) or a raw
 * `videoScript` from Gabriel's JSON.
 *
 * Scene routing:
 *   hook               → MusicHookScene (punch-in headline)
 *   pain               → MusicPainScene (kinetic frustration lines)
 *   pattern-reveal     → ChordPatternScene (4 chord cards + arrows)
 *   keyboard-highlight → KeyboardHighlightScene (piano with lit keys)
 *   number-system      → NumberSystemScene (Nashville number rows)
 *   transformation     → MusicTransformationScene (golden sunrise)
 *   cta                → MusicCTAScene (pulsing button + URL)
 *
 * MusicProgressBar always on top.
 *
 * NOTE: This is a visual-only composition. Music/audio is added in the
 * post-production step by Alfred. The visual pacing is designed to feel
 * rhythmic at 80–120 BPM without requiring audio in the render pipeline.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';

import type { MusicTheoryAdData, MusicScene } from './data/musicTheoryAds';
import { defaultMusicAd } from './data/musicTheoryAds';

import { MusicHookScene }            from './components/MusicHookScene';
import { MusicPainScene }            from './components/MusicPainScene';
import { ChordPatternScene }         from './components/ChordPatternScene';
import { KeyboardHighlightScene }    from './components/KeyboardHighlightScene';
import { NumberSystemScene }         from './components/NumberSystemScene';
import { MusicTransformationScene }  from './components/MusicTransformationScene';
import { MusicCTAScene }             from './components/MusicCTAScene';
import { MusicProgressBar }          from './components/ProgressBar';

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  ad?:          MusicTheoryAdData;
  videoScript?: Record<string, unknown>;
}

// ── Scene frame lookup ────────────────────────────────────────────────────────
function getSceneAtFrame(
  scenes: MusicScene[],
  frame: number,
): { scene: MusicScene; localFrame: number } {
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

// ── Gabriel VideoScript → MusicTheoryAdData adapter ──────────────────────────
function videoScriptToAd(vs: Record<string, unknown>): MusicTheoryAdData {
  const rawScenes = (vs.scenes as Record<string, unknown>[]) ?? [];

  const scenes: MusicScene[] = rawScenes.map((s) => {
    const type   = (s.type as string) ?? 'hook';
    const frames = s.frames
      ? (s.frames as number)
      : Math.round(((s.duration_seconds as number) ?? 4) * 30);

    return {
      id:           (s.id as string)           ?? type,
      type:         type as MusicScene['type'],
      frames,
      headline:     (s.headline as string)     ?? undefined,
      subheadline:  (s.subheadline as string)  ?? undefined,
      lines:        (s.lines as string[])      ?? undefined,
      chords:       (s.chords as MusicScene['chords']) ?? undefined,
      keys:         (s.keys as MusicScene['keys'])     ?? undefined,
      badge:        (s.badge as string)        ?? undefined,
      cta:          (s.cta_text as string)     ?? undefined,
      button:       (s.button_text as string)  ?? (s.cta_text as string) ?? 'Watch Free Lesson',
      footer:       (s.footer as string)       ?? 'musictheorysecrets.com',
    };
  });

  return {
    id:      (vs.video_id as string) ?? 'gabriel-generated',
    name:    (vs.title as string)    ?? 'Music Theory Secrets',
    variant: 'chord-pattern',
    scenes,
  };
}

// ── calculateMetadata export ──────────────────────────────────────────────────
export const calculateMusicAdMetadata = async ({ props }: { props: Props }) => {
  const ad = props.videoScript
    ? videoScriptToAd(props.videoScript)
    : (props.ad ?? defaultMusicAd);

  const totalFrames = ad.scenes.reduce((acc, s) => acc + s.frames, 0);
  return { durationInFrames: Math.max(totalFrames, 450) };
};

// ── Fallback data ─────────────────────────────────────────────────────────────
import { PROGRESSION_CHORDS, PROGRESSION_KEYS } from './data/musicTheoryAds';

// ── Main composition ──────────────────────────────────────────────────────────
export const MusicTheorySecretsAd: React.FC<Props> = ({ ad, videoScript }) => {
  const frame = useCurrentFrame();

  const resolvedAd = videoScript
    ? videoScriptToAd(videoScript)
    : (ad ?? defaultMusicAd);

  const { scene, localFrame } = getSceneAtFrame(resolvedAd.scenes, frame);

  const renderScene = () => {
    switch (scene.type) {
      case 'hook':
        return (
          <MusicHookScene
            headline={scene.headline ?? '4 chords.'}
            subheadline={scene.subheadline}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'pain':
        return (
          <MusicPainScene
            lines={scene.lines ?? ["You can play songs.", "But can you create?", "Theory unlocks that."]}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'pattern-reveal':
        return (
          <ChordPatternScene
            headline={scene.headline ?? 'This progression is everywhere:'}
            chords={scene.chords ?? PROGRESSION_CHORDS}
            badge={scene.badge}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'keyboard-highlight':
        return (
          <KeyboardHighlightScene
            headline={scene.headline ?? 'On the piano: C → G → Am → F'}
            keys={scene.keys ?? PROGRESSION_KEYS}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'number-system':
        return (
          <NumberSystemScene
            headline={scene.headline ?? 'The number system works in every key.'}
            lines={scene.lines ?? ['1 = home', '5 = lift', '6 = emotion', '4 = resolution']}
            badge={scene.badge}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'transformation':
        return (
          <MusicTransformationScene
            headline={scene.headline ?? 'You already have the ear for it.'}
            subheadline={scene.subheadline}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'cta':
        return (
          <MusicCTAScene
            headline={scene.headline ?? 'Learn to play by ear — free.'}
            button={scene.button ?? 'Watch Free Lesson'}
            footer={scene.footer ?? 'musictheorysecrets.com'}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      default:
        return (
          <AbsoluteFill
            style={{ background: '#0A0A0F', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ color: '#F5C842', fontFamily: 'Inter, sans-serif', fontSize: 40 }}>
              {scene.headline}
            </div>
          </AbsoluteFill>
        );
    }
  };

  return (
    <AbsoluteFill>
      {renderScene()}
      <MusicProgressBar />
    </AbsoluteFill>
  );
};
