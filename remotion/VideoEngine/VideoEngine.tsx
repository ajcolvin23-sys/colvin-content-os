/**
 * VideoEngine — JSON-driven Remotion composition.
 *
 * Gabriel writes a small JSON file. This engine renders it.
 * No React code changes needed per new video.
 *
 * Usage:
 *   npm run render:json -- videos/my-video.json
 *   remotion render remotion/index.ts VideoEngine-Vertical --props='{"videoScript": {...}}'
 */
import React from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import type { VideoScript } from './types';
import { getBrand } from './brands';
import { SceneRenderer } from './SceneRenderer';
import { CaptionLayer } from './scenes/CaptionLayer';

// ── Default preview script (shown in Remotion Studio) ────────────────────────
export const DEFAULT_VIDEO_SCRIPT: VideoScript = {
  video_id: 'preview-001',
  created_at: new Date().toISOString(),
  brand: 'colvin_enterprises',
  platform: 'linkedin_video',
  format: '9:16',
  render_format: '9:16',
  title: 'Preview Video',
  audience: 'Indianapolis business owners',
  goal: 'Book a discovery call',
  hook: 'Most businesses waste 20 hours a week on tasks AI can do in minutes.',
  scenes: [
    {
      id: 'scene-1',
      type: 'hook',
      duration_seconds: 4,
      headline: 'Most businesses waste 20 hours a week',
      emphasis: '20 hours',
      caption_text: 'Most businesses waste 20 hours a week on tasks AI can automate.',
    },
    {
      id: 'scene-2',
      type: 'problem',
      duration_seconds: 5,
      headline: 'Manual follow-ups. Missed leads. Burnt-out teams.',
      body: "You're doing work an AI employee should handle.",
      caption_text: 'Manual work is killing your growth.',
    },
    {
      id: 'scene-3',
      type: 'solution',
      duration_seconds: 5,
      headline: 'Colvin Enterprises builds your AI employee.',
      emphasis: 'AI employee',
      body: 'We automate the repetitive. You focus on revenue.',
      caption_text: 'We build AI systems that work while you sleep.',
    },
    {
      id: 'scene-4',
      type: 'proof',
      duration_seconds: 4,
      stat: '40%',
      stat_label: 'Average time saved in the first 30 days',
      caption_text: 'Clients save an average of 40% of manual work time.',
    },
    {
      id: 'scene-5',
      type: 'cta',
      duration_seconds: 4,
      headline: 'Ready to stop doing it manually?',
      cta_text: 'Book Free AI Audit',
      cta_url: 'https://calendar.app.google/igj4Vfwvc1ZUB3Gc9',
      caption_text: 'Book your free AI audit — link in bio.',
    },
  ],
  music_direction: 'Modern trap/hip-hop pulse — confident, forward-moving',
  thumbnail_concept: 'Split screen: chaotic inbox vs clean AI dashboard. Bold text: Your AI Employee.',
  claims_check: { risk_level: 'low', issues: [], reviewed: false },
  approval_required: true,
  render_status: 'draft',
};

// ── Props ─────────────────────────────────────────────────────────────────────
export interface VideoEngineProps {
  videoScript?: VideoScript;
}

// ── Main composition ──────────────────────────────────────────────────────────
export const VideoEngine: React.FC<VideoEngineProps> = ({
  videoScript = DEFAULT_VIDEO_SCRIPT,
}) => {
  const { fps } = useVideoConfig();
  const currentFrame = useCurrentFrame();

  const brand = getBrand(videoScript.brand);

  // Build scene timeline
  const sceneTimeline = videoScript.scenes.reduce<
    Array<{ scene: (typeof videoScript.scenes)[0]; startFrame: number; durationInFrames: number }>
  >((acc, scene, i) => {
    const startFrame =
      i === 0 ? 0 : acc[i - 1].startFrame + acc[i - 1].durationInFrames;
    const durationInFrames = Math.round(scene.duration_seconds * fps);
    return [...acc, { scene, startFrame, durationInFrames }];
  }, []);

  return (
    <AbsoluteFill style={{ background: brand.background_color }}>
      {sceneTimeline.map(({ scene, startFrame, durationInFrames }, index) => (
        <Sequence
          key={scene.id}
          from={startFrame}
          durationInFrames={durationInFrames}
          name={`Scene-${index + 1}-${scene.type}`}
        >
          <SceneRenderer
            scene={scene}
            brand={brand}
            localFrame={currentFrame - startFrame}
            durationInFrames={durationInFrames}
            sceneIndex={index}
          />
        </Sequence>
      ))}

      {videoScript.captions && videoScript.captions.length > 0 && (
        <CaptionLayer
          captions={videoScript.captions}
          brand={brand}
          currentFrame={currentFrame}
        />
      )}
    </AbsoluteFill>
  );
};

// ── calculateMetadata — sets duration from JSON scene list ────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const calculateVideoEngineMetadata = async ({ props }: { props: any }) => {
  const fps = 30;
  const scenes = (props?.videoScript?.scenes ??
    DEFAULT_VIDEO_SCRIPT.scenes) as VideoScript['scenes'];
  const totalSeconds = scenes.reduce((sum, s) => sum + s.duration_seconds, 0);
  return { durationInFrames: Math.max(Math.round(totalSeconds * fps), 30) };
};
