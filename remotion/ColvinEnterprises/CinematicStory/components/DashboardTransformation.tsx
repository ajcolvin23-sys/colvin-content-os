/**
 * DashboardTransformation — shows visible outcomes as an animated dashboard.
 *
 * Elements:
 *  1. Lead pipeline — cards moving left to right
 *  2. Follow-up toggle — switches ON with a spring
 *  3. Content calendar — cells lighting up in sequence
 *  4. Growth progress bar — fills up over time
 *  5. Result text list — items reveal one by one
 *
 * ⚠ No CSS transitions — interpolate/spring only.
 */

import React from 'react';
import { AbsoluteFill, useVideoConfig, spring, interpolate } from 'remotion';
import { C, FONT } from '../theme';

// ─── Edit result statements here ──────────────────────────────────────────────
const RESULTS: Array<{ icon: string; text: string }> = [
  { icon: '✅', text: 'Leads captured.'           },
  { icon: '✅', text: 'Follow-up automated.'       },
  { icon: '✅', text: 'Content organized.'         },
  { icon: '✅', text: 'Growth repeated.'           },
  { icon: '✅', text: 'Mission moving.'            },
];

const PIPELINE_STAGES = ['New Lead', 'Contacted', 'Follow-Up', 'Converted'];

interface DashboardTransformationProps {
  localFrame: number;
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────
const PipelineRow: React.FC<{ localFrame: number }> = ({ localFrame }) => {
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display:      'flex',
        gap:          8,
        marginBottom: 28,
        overflow:     'hidden',
      }}
    >
      {PIPELINE_STAGES.map((stage, i) => {
        const p = spring({
          fps,
          frame:  Math.max(0, localFrame - i * 18),
          config: { damping: 18, stiffness: 120, mass: 0.6 },
        });
        const isActive = i === 0;
        return (
          <div
            key={stage}
            style={{
              flex:          '1 1 0',
              padding:       '10px 0',
              borderRadius:  8,
              backgroundColor: isActive ? `${C.gold}22` : C.card,
              border:        `1px solid ${isActive ? C.gold : C.blue}55`,
              textAlign:     'center',
              opacity:       p,
              transform:     `translateX(${interpolate(p, [0, 1], [30, 0])}px)`,
            }}
          >
            <span style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: isActive ? C.gold : C.gray }}>
              {stage}
            </span>
            {isActive && (
              <div
                style={{
                  width:  '60%',
                  height: 3,
                  backgroundColor: C.gold,
                  borderRadius: 2,
                  margin:  '6px auto 0',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Follow-up toggle ─────────────────────────────────────────────────────────
const AutoToggle: React.FC<{ localFrame: number; startFrame: number }> = ({ localFrame, startFrame }) => {
  const { fps } = useVideoConfig();
  const p = spring({
    fps,
    frame:  Math.max(0, localFrame - startFrame),
    config: { damping: 20, stiffness: 110, mass: 0.7 },
  });
  const thumbX = interpolate(p, [0, 1], [2, 26]);

  return (
    <div
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         16,
        marginBottom: 22,
        opacity:     p,
        transform:   `translateY(${interpolate(p, [0, 1], [16, 0])}px)`,
      }}
    >
      {/* Track */}
      <div
        style={{
          position:      'relative',
          width:         56,
          height:        30,
          borderRadius:  15,
          backgroundColor: `${C.green}${Math.round(p * 200).toString(16).padStart(2, '0')}`,
          border:        `2px solid ${C.green}`,
          flexShrink:    0,
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position:      'absolute',
            top:           3,
            left:          thumbX,
            width:         20,
            height:        20,
            borderRadius:  '50%',
            backgroundColor: C.white,
            boxShadow:     `0 0 8px ${C.green}88`,
          }}
        />
      </div>
      <span style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, color: C.white }}>
        Follow-up automation:{' '}
        <span style={{ color: C.green }}>{p > 0.5 ? 'ON' : 'OFF'}</span>
      </span>
    </div>
  );
};

// ─── Growth bar ───────────────────────────────────────────────────────────────
const GrowthBar: React.FC<{ localFrame: number; startFrame: number }> = ({ localFrame, startFrame }) => {
  const { fps } = useVideoConfig();
  const p = spring({
    fps,
    frame:  Math.max(0, localFrame - startFrame),
    config: { damping: 22, stiffness: 80, mass: 1 },
  });
  const fillW = interpolate(p, [0, 1], [0, 72]);

  return (
    <div
      style={{
        marginBottom: 28,
        opacity:     p,
        transform:   `translateY(${interpolate(p, [0, 1], [14, 0])}px)`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 600, color: C.white }}>
          Growth trajectory
        </span>
        <span style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: C.gold }}>
          {Math.round(fillW)}%
        </span>
      </div>
      <div
        style={{
          width:         '100%',
          height:        12,
          borderRadius:  6,
          backgroundColor: `${C.white}18`,
          overflow:      'hidden',
        }}
      >
        <div
          style={{
            width:         `${fillW}%`,
            height:        '100%',
            borderRadius:  6,
            background:    `linear-gradient(90deg, ${C.gold} 0%, ${C.blue} 100%)`,
            boxShadow:     `0 0 12px ${C.gold}88`,
          }}
        />
      </div>
    </div>
  );
};

// ─── Result item ──────────────────────────────────────────────────────────────
const ResultLine: React.FC<{
  icon:       string;
  text:       string;
  index:      number;
  localFrame: number;
  startFrame: number;
}> = ({ icon, text, index, localFrame, startFrame }) => {
  const { fps } = useVideoConfig();
  const delay = startFrame + index * 18;
  const p = spring({
    fps,
    frame:  Math.max(0, localFrame - delay),
    config: { damping: 18, stiffness: 120, mass: 0.6 },
  });
  return (
    <div
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         18,
        marginBottom: 20,
        opacity:     p,
        transform:   `translateY(${interpolate(p, [0, 1], [18, 0])}px)`,
      }}
    >
      <span style={{ fontSize: 30, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontFamily: FONT, fontSize: 38, fontWeight: 600, color: C.white }}>
        {text}
      </span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const DashboardTransformation: React.FC<DashboardTransformationProps> = ({ localFrame }) => (
  <AbsoluteFill
    style={{
      display:       'flex',
      flexDirection: 'column',
      justifyContent:'center',
      padding:       '0 72px',
    }}
  >
    <PipelineRow localFrame={localFrame} />
    <AutoToggle  localFrame={localFrame} startFrame={40} />
    <GrowthBar   localFrame={localFrame} startFrame={70} />

    {/* Divider */}
    <div
      style={{
        height:          1,
        backgroundColor: `${C.gold}33`,
        marginBottom:    32,
        opacity:         interpolate(localFrame, [90, 110], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        }),
      }}
    />

    {/* Result list */}
    {RESULTS.map((r, i) => (
      <ResultLine
        key={r.text}
        icon={r.icon}
        text={r.text}
        index={i}
        localFrame={localFrame}
        startFrame={110}
      />
    ))}
  </AbsoluteFill>
);
