/**
 * CaptionLayer — Overlay captions on any scene.
 * Renders on top of scene content. Timed by frame.
 */
import React from 'react';
import { AbsoluteFill } from 'remotion';
import type { BrandConfig, CaptionEntry } from '../types';

interface Props {
  captions: CaptionEntry[];
  brand: BrandConfig;
  currentFrame: number; // Absolute frame (not local)
}

export const CaptionLayer: React.FC<Props> = ({ captions, brand, currentFrame }) => {
  const activeCaption = captions.find(
    (c) => currentFrame >= c.startFrame && currentFrame <= c.endFrame
  );

  if (!activeCaption) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          bottom: '120px',
          left: '48px',
          right: '48px',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.82)',
            borderRadius: '12px',
            padding: '14px 28px',
            fontFamily: brand.font_body,
            fontSize: '30px',
            fontWeight: 600,
            color: '#FFFFFF',
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: '900px',
            backdropFilter: 'blur(4px)',
            border: `1px solid rgba(255,255,255,0.1)`,
          }}
        >
          {activeCaption.text}
        </div>
      </div>
    </AbsoluteFill>
  );
};
