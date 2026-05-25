import { Composition } from 'remotion';
import React from 'react';
import { FirstKeysIndy } from './FirstKeysIndy';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Vertical — TikTok / Instagram Reels (1080×1920) */}
      <Composition
        id="FirstKeysIndy-Vertical"
        component={FirstKeysIndy}
        durationInFrames={990}
        fps={30}
        width={1080}
        height={1920}
      />

      {/* Square — Facebook / Instagram Feed (1080×1080) */}
      <Composition
        id="FirstKeysIndy-Square"
        component={FirstKeysIndy}
        durationInFrames={990}
        fps={30}
        width={1080}
        height={1080}
      />
    </>
  );
};
