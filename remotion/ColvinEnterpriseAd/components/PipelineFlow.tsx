/**
 * PipelineFlow.tsx
 * Automation pipeline nodes that light up sequentially left→right.
 * Each node activates with a glow pulse on its turn.
 */
import React from 'react';
import { spring, useVideoConfig, interpolate } from 'remotion';
import { colvinTheme } from '../theme/colvinTheme';
import type { ColvinPipelineNode } from '../data/colvinEnterpriseAds';

interface PipelineFlowProps {
  nodes:      ColvinPipelineNode[];
  localFrame: number;
}

export const PipelineFlow: React.FC<PipelineFlowProps> = ({ nodes, localFrame }) => {
  const { fps } = useVideoConfig();
  const activateEvery = 16; // frames per node activation

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        width: '100%',
      }}
    >
      {nodes.map((node, i) => {
        const activateAt = i * activateEvery;
        const isActive = localFrame >= activateAt;

        const glow = isActive
          ? spring({
              frame: Math.max(0, localFrame - activateAt),
              fps,
              config: { damping: 20, stiffness: 100 },
            })
          : 0;

        // Connector between nodes
        const connectorProgress = i < nodes.length - 1
          ? interpolate(
              localFrame,
              [activateAt + 8, activateAt + activateEvery + 8],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            )
          : 0;

        const nodeColor = isActive ? colvinTheme.colors.green : colvinTheme.colors.gray;

        return (
          <div key={node.label}>
            {/* Node row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: isActive ? `${colvinTheme.colors.navyLight}` : colvinTheme.colors.navyMid,
                border: `1px solid ${isActive ? colvinTheme.colors.green : colvinTheme.colors.gray}50`,
                borderLeft: `3px solid ${nodeColor}`,
                borderRadius: 10,
                padding: '14px 20px',
                transform: `scale(${0.96 + glow * 0.04})`,
                boxShadow: isActive
                  ? `0 0 24px ${colvinTheme.colors.green}30, 0 4px 16px rgba(0,0,0,0.4)`
                  : '0 2px 8px rgba(0,0,0,0.3)',
                transition: 'all 0s',
              }}
            >
              <span style={{ fontSize: 28 }}>{node.icon}</span>
              <span
                style={{
                  fontFamily: colvinTheme.fonts.body,
                  fontSize: 26,
                  fontWeight: 600,
                  color: isActive ? colvinTheme.colors.white : colvinTheme.colors.gray,
                  letterSpacing: '-0.3px',
                }}
              >
                {node.label}
              </span>
              {isActive && (
                <div
                  style={{
                    marginLeft: 'auto',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: colvinTheme.colors.green,
                    boxShadow: `0 0 10px ${colvinTheme.colors.green}`,
                    opacity: glow,
                  }}
                />
              )}
            </div>
            {/* Connector line */}
            {i < nodes.length - 1 && (
              <div
                style={{
                  marginLeft: 28,
                  width: 2,
                  height: 14,
                  background: colvinTheme.colors.navyLight,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0,
                    height: `${connectorProgress * 100}%`,
                    background: colvinTheme.colors.green,
                    boxShadow: `0 0 6px ${colvinTheme.colors.green}`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
