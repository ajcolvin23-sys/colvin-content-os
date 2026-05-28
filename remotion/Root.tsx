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
import { FirstKeysAd, calculateFirstKeysAdMetadata } from './FirstKeysAd/FirstKeysAd';
import { defaultAd } from './FirstKeysAd/data/firstKeysAds';
import { ColvinEnterpriseAd, calculateColvinAdMetadata } from './ColvinEnterpriseAd/ColvinEnterpriseAd';
import { defaultColvinAd } from './ColvinEnterpriseAd/data/colvinEnterpriseAds';
import { MusicTheorySecretsAd, calculateMusicAdMetadata } from './MusicTheorySecretsAd/MusicTheorySecretsAd';
import { defaultMusicAd } from './MusicTheorySecretsAd/data/musicTheoryAds';

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

      {/* ── FirstKeysAd — high-retention short-form ad engine ── */}
      {/* Pain-first, hope-first, grant-curiosity, local, and fast-cta variants */}
      <Composition
        id="FirstKeysAd"
        component={FirstKeysAd}
        durationInFrames={750}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ ad: defaultAd }}
        calculateMetadata={calculateFirstKeysAdMetadata}
      />

      {/* ── ColvinEnterpriseAd — high-retention lead-gen ad engine ── */}
      {/* Task-chaos, revenue-leak, automation-reveal, ai-staff, and fast-cta variants */}
      <Composition
        id="ColvinEnterpriseAd"
        component={ColvinEnterpriseAd}
        durationInFrames={720}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ ad: defaultColvinAd }}
        calculateMetadata={calculateColvinAdMetadata}
      />

      {/* ── MusicTheorySecretsAd — chord cards, keyboard, number system ── */}
      {/* chord-pattern, frustration-first, number-system-reveal, fast-cta variants */}
      <Composition
        id="MusicTheorySecretsAd"
        component={MusicTheorySecretsAd}
        durationInFrames={720}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ ad: defaultMusicAd }}
        calculateMetadata={calculateMusicAdMetadata}
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
