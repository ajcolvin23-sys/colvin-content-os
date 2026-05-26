/**
 * SceneRenderer
 *
 * Routes a JSON SceneDefinition to the correct prebuilt component.
 * This is the core of the JSON-driven video engine.
 *
 * Gabriel writes JSON → SceneRenderer picks the component → video renders.
 * Never edit this file per-video. Add new scene types here when needed.
 */
import React from 'react';
import type { BrandConfig, SceneDefinition } from './types';
import { HookScene } from './scenes/HookScene';
import { ProblemScene } from './scenes/ProblemScene';
import { SolutionScene } from './scenes/SolutionScene';
import { ProofScene } from './scenes/ProofScene';
import { CTAScene } from './scenes/CTAScene';
import { SlideScene } from './scenes/SlideScene';
import { ImageOverlayScene } from './scenes/ImageOverlayScene';

interface Props {
  scene: SceneDefinition;
  brand: BrandConfig;
  localFrame: number;
  durationInFrames: number;
  sceneIndex: number;
}

export const SceneRenderer: React.FC<Props> = ({
  scene,
  brand,
  localFrame,
  durationInFrames,
  sceneIndex,
}) => {
  const commonProps = { scene, brand, localFrame, durationInFrames };

  // If the scene has a resolved image asset, always use ImageOverlayScene
  if (scene.assets?.[0]?.url) {
    return <ImageOverlayScene {...commonProps} />;
  }

  switch (scene.type) {
    case 'hook':
      return <HookScene {...commonProps} />;

    case 'problem':
      return <ProblemScene {...commonProps} />;

    case 'solution':
      return <SolutionScene {...commonProps} />;

    case 'proof':
      return <ProofScene {...commonProps} />;

    case 'cta':
      return <CTAScene {...commonProps} />;

    case 'step':
      return <SlideScene {...commonProps} sceneIndex={sceneIndex} />;

    case 'slide':
    case 'logo_intro':
    case 'lower_third':
    case 'countdown':
    default:
      // Generic slide handles all remaining types
      return <SlideScene {...commonProps} sceneIndex={sceneIndex} />;
  }
};
