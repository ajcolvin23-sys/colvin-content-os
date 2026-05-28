/**
 * ColvinEnterpriseAd
 *
 * 1080x1920 @ 30fps — TikTok, Reels, Shorts, Facebook vertical.
 * Data-driven: accepts a `ad` prop (ColvinEnterpriseAdData) or a raw
 * `videoScript` from Gabriel's JSON.
 *
 * Scene routing:
 *   hook                 → ColvinHookScene (pattern interrupt)
 *   task-leak            → TaskLeakScene (task cards flying in)
 *   lost-revenue         → LostRevenueScene (pain stats)
 *   automation-pipeline  → AutomationPipelineScene (nodes lighting up)
 *   audit-offer          → WorkflowAuditScene (free offer card)
 *   cta                  → CTAEndScene (button + URL)
 *
 * ColvinProgressBar always on top.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';

import type { ColvinEnterpriseAdData, ColvinScene } from './data/colvinEnterpriseAds';
import { defaultColvinAd } from './data/colvinEnterpriseAds';

import { ColvinHookScene }           from './components/ColvinHookScene';
import { TaskLeakScene }             from './components/TaskLeakScene';
import { LostRevenueScene }          from './components/LostRevenueScene';
import { AutomationPipelineScene }   from './components/AutomationPipelineScene';
import { WorkflowAuditScene }        from './components/WorkflowAuditScene';
import { CTAEndScene }               from './components/CTAEndScene';
import { ColvinProgressBar }         from './components/ProgressBar';

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  ad?:          ColvinEnterpriseAdData;
  videoScript?: Record<string, unknown>;
}

// ── Scene frame lookup ────────────────────────────────────────────────────────
function getSceneAtFrame(
  scenes: ColvinScene[],
  frame: number,
): { scene: ColvinScene; localFrame: number } {
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

// ── Gabriel VideoScript → ColvinEnterpriseAdData adapter ─────────────────────
function videoScriptToAd(vs: Record<string, unknown>): ColvinEnterpriseAdData {
  const rawScenes = (vs.scenes as Record<string, unknown>[]) ?? [];

  const scenes: ColvinScene[] = rawScenes.map((s) => {
    const type   = (s.type as string) ?? 'hook';
    const frames = s.frames
      ? (s.frames as number)
      : Math.round(((s.duration_seconds as number) ?? 4) * 30);

    return {
      id:           (s.id as string) ?? type,
      type:         type as ColvinScene['type'],
      frames,
      headline:     (s.headline as string)    ?? undefined,
      subheadline:  (s.subheadline as string) ?? undefined,
      tasks:        (s.tasks as ColvinScene['tasks']) ?? undefined,
      nodes:        (s.nodes as ColvinScene['nodes']) ?? undefined,
      statLines:    (s.stat_lines as string[]) ?? (s.lines as string[]) ?? undefined,
      badge:        (s.badge as string)       ?? undefined,
      cta:          (s.cta_text as string)    ?? undefined,
      button:       (s.button_text as string) ?? (s.cta_text as string) ?? 'Book Free Audit',
      footer:       (s.footer as string)      ?? 'colvinenterprises.com',
    };
  });

  return {
    id:      (vs.video_id as string) ?? 'gabriel-generated',
    name:    (vs.title as string)    ?? 'Colvin Enterprises',
    variant: 'task-chaos',
    scenes,
  };
}

// ── calculateMetadata export ──────────────────────────────────────────────────
export const calculateColvinAdMetadata = async ({ props }: { props: Props }) => {
  const ad = props.videoScript
    ? videoScriptToAd(props.videoScript)
    : (props.ad ?? defaultColvinAd);

  const totalFrames = ad.scenes.reduce((acc, s) => acc + s.frames, 0);
  return { durationInFrames: Math.max(totalFrames, 450) };
};

// ── Fallback tasks (Gabriel may not provide them) ────────────────────────────
const FALLBACK_TASKS = [
  { label: 'Send follow-up email', category: 'email' as const },
  { label: 'Update CRM notes',     category: 'crm' as const },
  { label: 'Schedule next call',   category: 'scheduling' as const },
  { label: 'Write weekly report',  category: 'reporting' as const },
  { label: 'Chase unpaid invoice', category: 'admin' as const },
];

const FALLBACK_NODES = [
  { label: 'New Lead',     icon: '📥' },
  { label: 'Auto-Qualify', icon: '🤖', active: true },
  { label: 'CRM Update',   icon: '📊', active: true },
  { label: 'Nurture Seq.', icon: '📧', active: true },
  { label: 'Book Meeting', icon: '📅', active: true },
  { label: 'Close',        icon: '✅' },
];

// ── Main composition ──────────────────────────────────────────────────────────
export const ColvinEnterpriseAd: React.FC<Props> = ({ ad, videoScript }) => {
  const frame = useCurrentFrame();

  const resolvedAd = videoScript
    ? videoScriptToAd(videoScript)
    : (ad ?? defaultColvinAd);

  const { scene, localFrame } = getSceneAtFrame(resolvedAd.scenes, frame);

  const renderScene = () => {
    switch (scene.type) {
      case 'hook':
        return (
          <ColvinHookScene
            headline={scene.headline ?? 'Your business runs on you.'}
            subheadline={scene.subheadline}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'task-leak':
        return (
          <TaskLeakScene
            headline={scene.headline ?? 'Tasks are slipping every week.'}
            tasks={scene.tasks ?? FALLBACK_TASKS}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'lost-revenue':
        return (
          <LostRevenueScene
            headline={scene.headline ?? 'Manual work is quietly killing growth.'}
            statLines={scene.statLines ?? ['Tasks slip every week', 'Leads go cold', 'You hit the ceiling']}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'automation-pipeline':
        return (
          <AutomationPipelineScene
            headline={scene.headline ?? 'What if your systems ran themselves?'}
            badge={scene.badge}
            nodes={scene.nodes ?? FALLBACK_NODES}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'audit-offer':
        return (
          <WorkflowAuditScene
            headline={scene.headline ?? 'Free Workflow Audit'}
            subheadline={scene.subheadline}
            badge={scene.badge}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      case 'cta':
        return (
          <CTAEndScene
            headline={scene.headline ?? 'Claim your free workflow audit.'}
            button={scene.button ?? 'Book My Free Audit'}
            footer={scene.footer ?? 'colvinenterprises.com'}
            localFrame={localFrame}
            durationInFrames={scene.frames}
          />
        );

      default:
        return (
          <AbsoluteFill
            style={{ background: '#08111F', alignItems: 'center', justifyContent: 'center' }}
          >
            <div style={{ color: '#36B8FF', fontFamily: 'Inter, sans-serif', fontSize: 40 }}>
              {scene.headline}
            </div>
          </AbsoluteFill>
        );
    }
  };

  return (
    <AbsoluteFill>
      {renderScene()}
      <ColvinProgressBar />
    </AbsoluteFill>
  );
};
