/**
 * SceneRenderer
 *
 * Routes a JSON SceneDefinition to the correct prebuilt component.
 * This is the core of the JSON-driven video engine.
 *
 * Gabriel writes JSON → SceneRenderer picks the component → video renders.
 * Never edit this file per-video. Add new scene types here when needed.
 *
 * Routing rules:
 *  1. Cinematic scene types (pain_stack, desire, mechanism, transformation)
 *     always use their dedicated component — they handle images internally.
 *  2. CTA always uses CTAScene — handles images internally.
 *  3. For generic types (hook, problem, solution, proof) that have a resolved
 *     image asset, ImageOverlayScene is used for full cinematic treatment.
 *  4. All remaining types fall through to SlideScene.
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
import { PainStackScene } from './scenes/PainStackScene';
import { DesireScene } from './scenes/DesireScene';
import { MechanismScene } from './scenes/MechanismScene';
import { TransformationScene } from './scenes/TransformationScene';

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

  // ── Cinematic scene types: dedicated components (handle their own images) ──
  switch (scene.type) {
    case 'pain_stack':
      return <PainStackScene {...commonProps} />;

    case 'desire':
      return <DesireScene {...commonProps} />;

    case 'mechanism':
      return <MechanismScene {...commonProps} />;

    case 'transformation':
      return <TransformationScene {...commonProps} />;

    case 'cta':
      return <CTAScene {...commonProps} />;
  }

  // ── Generic types: use ImageOverlayScene if image resolved ────────────────
  if (scene.assets?.[0]?.url) {
    return <ImageOverlayScene {...commonProps} />;
  }

  // ── Fallback: brand-color component matching scene type ───────────────────
  switch (scene.type) {
    case 'hook':
      return <HookScene {...commonProps} />;

    case 'problem':
      return <ProblemScene {...commonProps} />;

    case 'solution':
      return <SolutionScene {...commonProps} />;

    case 'proof':
      return <ProofScene {...commonProps} />;

    case 'step':
      return <SlideScene {...commonProps} sceneIndex={sceneIndex} />;

    case 'slide':
    case 'logo_intro':
    case 'lower_third':
    case 'countdown':
    default:
      return <SlideScene {...commonProps} sceneIndex={sceneIndex} />;
  }
};
