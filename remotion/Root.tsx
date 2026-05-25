// Master root — registers all compositions
import React from 'react';
import { Composition } from 'remotion';
import { FirstKeysIndy } from './FirstKeysIndy/FirstKeysIndy';
import { DailyVideo, DEFAULT_SLIDES } from './DailyVideo/DailyVideo';
import type { DailyVideoProps } from './DailyVideo/types';
import { ColvinEnterpriseStoryVideo } from './ColvinEnterprises/ColvinEnterpriseStoryVideo';
import { ColvinEnterpriseCinematicStory } from './ColvinEnterprises/CinematicStory/ColvinEnterpriseCinematicStory';
import { VideoEngine, DEFAULT_VIDEO_SCRIPT, calculateVideoEngineMetadata } from './VideoEngine/VideoEngine';
import type { VideoScript } from './VideoEngine/types';

// calculateMetadata: dynamically set durationInFrames based on actual slides passed via --props
const calcDailyMetadata = async ({ props }: { props: DailyVideoProps }) => {
  const slides = props.slides ?? DEFAULT_SLIDES;
  const totalFrames = slides.reduce(
    (acc, s) => Math.max(acc, s.from + s.durationInFrames + 12),
    90
  );
  return { durationInFrames: totalFrames };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ── First Keys Indy — static storytelling slideshow ── */}
      <Composition
        id="FirstKeysIndy-Vertical"
        component={FirstKeysIndy}
        durationInFrames={990}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="FirstKeysIndy-Square"
        component={FirstKeysIndy}
        durationInFrames={990}
        fps={30}
        width={1080}
        height={1080}
      />

      {/* ── Colvin Enterprises — basic story promo ── */}
      <Composition
        id="ColvinEnterpriseStoryPromo"
        component={ColvinEnterpriseStoryVideo}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ColvinEnterpriseStoryPromo-Wide"
        component={ColvinEnterpriseStoryVideo}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ── Colvin Enterprises — CINEMATIC (advanced) ── */}
      <Composition
        id="ColvinEnterpriseCinematicStory"
        component={ColvinEnterpriseCinematicStory}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="ColvinEnterpriseCinematicStoryWide"
        component={ColvinEnterpriseCinematicStory}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ── VideoEngine — JSON-driven compositions (Gabriel writes JSON, not code) ── */}
      {/* Vertical 9:16 — TikTok, Reels, Shorts */}
      <Composition
        id="VideoEngine-Vertical"
        component={VideoEngine}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ videoScript: DEFAULT_VIDEO_SCRIPT }}
        calculateMetadata={calculateVideoEngineMetadata}
      />
      {/* Square 1:1 — Instagram feed, LinkedIn */}
      <Composition
        id="VideoEngine-Square"
        component={VideoEngine}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ videoScript: DEFAULT_VIDEO_SCRIPT }}
        calculateMetadata={calculateVideoEngineMetadata}
      />
      {/* Wide 16:9 — YouTube, LinkedIn, Facebook */}
      <Composition
        id="VideoEngine-Wide"
        component={VideoEngine}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ videoScript: DEFAULT_VIDEO_SCRIPT }}
        calculateMetadata={calculateVideoEngineMetadata}
      />

      {/* ── Daily Video — dynamic content, duration set by calculateMetadata ── */}
      <Composition
        id="DailyVideo-Vertical"
        component={DailyVideo}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slides: DEFAULT_SLIDES, brandName: 'First Keys Indy' }}
        calculateMetadata={calcDailyMetadata}
      />
      <Composition
        id="DailyVideo-Square"
        component={DailyVideo}
        durationInFrames={1800}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ slides: DEFAULT_SLIDES, brandName: 'First Keys Indy' }}
        calculateMetadata={calcDailyMetadata}
      />
    </>
  );
};
