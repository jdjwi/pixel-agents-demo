import { useEffect, useState } from 'react';

import type { OfficeState } from '../office/engine/officeState.js';
import { overlayProjection } from '../office/projection.js';
import { CharacterState } from '../office/types.js';
import { DEMO_AGENT_IDS } from './browserBridge.js';
import type { DemoRunState, RunEvent, TokenAgent } from './types.js';

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
];

const ARTIFACT_STATE_LABELS = {
  CREATED: '문서 생성',
  PRINTED: '출력 완료',
  CLASSIFYING: '분류 중',
  ASSIGNED: '담당 배정',
  IN_PROGRESS: '풀이 중',
  SOLUTION_READY: '답안 완료',
  SUBMITTING: '제출 이동 중',
  SUBMITTED: '제출 완료',
} as const;

function isCurrentOwner(key: DemoAgentKey, owner: string): boolean {
  if (key === 'planner') return owner === 'Planner';
  if (key === 'deep') return owner === 'Deep';
  return owner === 'Quick';
}

function isArtifactOwner(key: DemoAgentKey, owner: DemoRunState['artifactOwner']): boolean {
  return owner === key;
}

function completionAgentKey(event: RunEvent | undefined): DemoAgentKey | null {
  if (!event) return null;
  if (event.type === 'planner.document.delivered') return 'planner';
  if (event.type === 'agent.solve.completed' || event.type === 'document.submitted') {
    return event.actorId === 'deep' || event.actorId === 'quick' ? event.actorId : null;
  }
  return null;
}

function activatedAgentKey(event: RunEvent | undefined): DemoAgentKey | null {
  if (!event) return null;
  if (event.type.startsWith('planner.')) return 'planner';
  if (event.type.startsWith('agent.') && (event.actorId === 'deep' || event.actorId === 'quick')) {
    return event.actorId;
  }
  return null;
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
  const [currentTime, setCurrentTime] = useState(0);
  const [completionExpiresAt, setCompletionExpiresAt] = useState<
    Partial<Record<DemoAgentKey, number>>
  >({});

  useEffect(() => {
    let frame = 0;
    const updatePosition = () => {
      setCurrentTime(Date.now());
      frame = requestAnimationFrame(updatePosition);
    };
    frame = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(frame);
  }, []);

  const latestEvent = state.events[state.events.length - 1];
  useEffect(() => {
    if (state.status === 'idle') {
      setCompletionExpiresAt({});
      return;
    }

    const completedAgent = completionAgentKey(latestEvent);
    if (completedAgent) {
      setCompletionExpiresAt((current) => ({ ...current, [completedAgent]: Date.now() + 3_000 }));
      return;
    }

    const activatedAgent = activatedAgentKey(latestEvent);
    if (activatedAgent) {
      setCompletionExpiresAt((current) => {
        const next = { ...current };
        delete next[activatedAgent];
        return next;
      });
    }
  }, [latestEvent, state.status]);

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
        const holdsArtifact = isArtifactOwner(key, state.artifactOwner);
        const tokenTotal = tokenAgent ? state.tokenByAgent[tokenAgent] : null;
        const completedAt = completionExpiresAt[key];
        const isCompletionVisible = completedAt !== undefined && completedAt > currentTime;
        const isCompleted = completedAt !== undefined;
        const shouldShowHud = (!isCompleted && (isActive || holdsArtifact)) || isCompletionVisible;
        if (!shouldShowHud) return null;

        const verticalOffset = character.state === CharacterState.TYPE ? 24 : 0;
        const screenX = projection.toScreenX(character.x);
        const screenY = projection.toScreenY(character.y + verticalOffset - 42);
        const summary =
          isActive && !isCompleted
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
            <div className="demo-agent-hud-role">{label}</div>
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
              <div className="demo-agent-hud-tokens">
                {tokenTotal.toLocaleString('ko-KR')} TOKENS
              </div>
            )}
            {holdsArtifact && state.artifactState && (
              <div
                className="demo-agent-hud-document"
                data-artifact-id={state.artifactId ?? undefined}
                data-artifact-state={state.artifactState}
              >
                <span className="demo-document-sheet" aria-hidden="true" />
                <span>{ARTIFACT_STATE_LABELS[state.artifactState]}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
