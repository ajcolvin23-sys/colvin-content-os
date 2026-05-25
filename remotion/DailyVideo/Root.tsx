import { Composition } from 'remotion';
import React from 'react';
import { DailyVideo, DEFAULT_SLIDES } from './DailyVideo';
import type { DailyVideoProps } from './types';

// Read slide data from environment variable (set by render script)
function getSlidesFromEnv(): DailyVideoProps['slides'] {
  try {
    const raw = process.env.DAILY_VIDEO_SLIDES;
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_SLIDES;
}

const slides = getSlidesFromEnv() ?? DEFAULT_SLIDES;
const totalFrames = slides.reduce((acc, s) => Math.max(acc, s.from + s.durationInFrames + 12), 90);

export const DailyVideoRoot: React.FC = () => {
  return (
    <>
      {/* Vertical — TikTok / Instagram Reels (1080×1920) */}
      <Composition
        id="DailyVideo-Vertical"
        component={DailyVideo}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ slides, brandName: 'First Keys Indy' }}
      />

      {/* Square — Facebook / Instagram Feed (1080×1080) */}
      <Composition
        id="DailyVideo-Square"
        component={DailyVideo}
        durationInFrames={totalFrames}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ slides, brandName: 'First Keys Indy' }}
      />
    </>
  );
};
