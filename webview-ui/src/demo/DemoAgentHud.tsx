import { useEffect, useState } from 'react';

import type { OfficeState } from '../office/engine/officeState.js';
import { overlayProjection } from '../office/projection.js';
import { CharacterState } from '../office/types.js';
import { DEMO_AGENT_IDS } from './browserBridge.js';
import type { DemoRunState, TokenAgent } from './types.js';

interface DemoAgentHudProps {
  state: DemoRunState;
  officeState: OfficeState;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoom: number;
  panRef: React.RefObject<{ x: number; y: number }>;
}

type DemoAgentKey = keyof typeof DEMO_AGENT_IDS;

const HUD_AGENTS: Array<{
  key: DemoAgentKey;
  label: string;
  tokenAgent?: TokenAgent;
}> = [
  { key: 'planner', label: 'PLANNER', tokenAgent: 'planner' },
  { key: 'deep', label: 'DEEP', tokenAgent: 'deep' },
  { key: 'quick', label: 'QUICK', tokenAgent: 'quick' },
  { key: 'boss', label: 'FINAL BOSS' },
];

function isCurrentOwner(key: DemoAgentKey, owner: string): boolean {
  if (key === 'planner') return owner === 'Planner';
  if (key === 'deep') return owner === 'Deep';
  if (key === 'quick') return owner === 'Quick';
  return owner.startsWith('Final Boss');
}

/**
 * The demo has a deliberately compact, always-visible HUD: the current action
 * and each actor's cumulative tokens live directly above that actor instead of
 * competing with the office in a separate progress panel.
 */
export function DemoAgentHud({
  state,
  officeState,
  containerRef,
  zoom,
  panRef,
}: DemoAgentHudProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    let frame = 0;
    const updatePosition = () => {
      setTick((tick) => tick + 1);
      frame = requestAnimationFrame(updatePosition);
    };
    frame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(frame);
  }, []);

  const container = containerRef.current;
  if (!container || state.status === 'idle') return null;

  const projection = overlayProjection(
    officeState.getLayout(),
    container.getBoundingClientRect(),
    zoom,
    panRef.current,
    window.devicePixelRatio || 1,
  );

  return (
    <div className="absolute inset-0 z-30 pointer-events-none" aria-live="polite">
      {HUD_AGENTS.map(({ key, label, tokenAgent }) => {
        const character = officeState.characters.get(DEMO_AGENT_IDS[key]);
        if (!character) return null;

        const isActive = isCurrentOwner(key, state.owner);
        const tokenTotal = tokenAgent ? state.tokenByAgent[tokenAgent] : null;
        const verticalOffset = character.state === CharacterState.TYPE ? 24 : 0;
        const screenX = projection.toScreenX(character.x);
        const screenY = projection.toScreenY(character.y + verticalOffset - 42);
        const summary = isActive
          ? state.currentSummary
          : tokenTotal && tokenTotal > 0
            ? '작업 완료'
            : '대기 중';

        return (
          <div
            key={key}
            className={`demo-agent-hud ${isActive ? 'demo-agent-hud-active' : ''}`}
            style={{ left: screenX, top: screenY }}
            data-testid="demo-agent-hud"
            data-agent={key}
          >
            <div className="demo-agent-hud-role">
              {label}
            </div>
            <div className="demo-agent-hud-summary">
              {isActive && (
                <span className="demo-agent-hud-thinking" aria-label="처리 중">
                  <span />
                  <span />
                  <span />
                </span>
              )}
              {summary}
            </div>
            {tokenTotal !== null && tokenTotal > 0 && (
              <div className="demo-agent-hud-tokens">{tokenTotal.toLocaleString('ko-KR')} TOKENS</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
