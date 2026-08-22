import type { RunEvent } from './types.js';

export const DEMO_AGENT_IDS = {
  planner: 101,
  deep: 102,
  quick: 103,
  boss: 105,
} as const;

const AGENTS = {
  planner: { id: DEMO_AGENT_IDS.planner, palette: 6, name: 'Planner' },
  deep: { id: DEMO_AGENT_IDS.deep, palette: 7, name: 'Deep' },
  quick: { id: DEMO_AGENT_IDS.quick, palette: 8, name: 'Quick' },
  boss: { id: DEMO_AGENT_IDS.boss, palette: 10, name: 'Final Boss' },
} as const;

function dispatch(data: unknown): void {
  window.dispatchEvent(new MessageEvent('message', { data }));
}

function createAgent(agent: (typeof AGENTS)[keyof typeof AGENTS]): void {
  dispatch({
    type: 'agentCreated',
    id: agent.id,
    palette: agent.palette,
    folderName: agent.name,
  });
}

/**
 * The demo team is a standing office roster, not a set of agents created for
 * each mission. Creation is idempotent in OfficeState, so this is also safe
 * when a run starts before the mock layout has finished loading.
 */
export function ensureDemoAgents(): void {
  for (const agent of Object.values(AGENTS)) {
    createAgent(agent);
  }
}

function startTool(id: number, toolId: string, status: string): void {
  dispatch({ type: 'agentToolsClear', id });
  dispatch({ type: 'agentToolStart', id, toolId, toolName: 'Read', status });
}

function finishTool(id: number, toolId: string): void {
  dispatch({ type: 'agentToolDone', id, toolId });
}

export function resetDemoAgents(): void {
  ensureDemoAgents();
  for (const agent of Object.values(AGENTS)) dispatch({ type: 'agentToolsClear', id: agent.id });
}

export function emitDemoEventToOffice(event: RunEvent): void {
  const solver =
    event.actorId === 'deep' || event.actorId === 'quick' ? event.actorId : null;
  const targetSolver =
    event.targetId === 'deep' || event.targetId === 'quick' ? event.targetId : null;

  switch (event.type) {
    case 'planner.spawned':
      startTool(AGENTS.planner.id, 'planner-pickup', 'Planner · 문서 확인 중');
      break;
    case 'planner.classification.started':
      startTool(AGENTS.planner.id, 'planner-classify', 'Planner · 문제 유형 분류 중');
      break;
    case 'planner.classification.completed':
      finishTool(AGENTS.planner.id, 'planner-classify');
      break;
    case 'planner.plan.started':
      startTool(AGENTS.planner.id, 'planner-plan', 'Planner · 해결 계획 작성 중');
      break;
    case 'planner.plan.updated':
      startTool(AGENTS.planner.id, 'planner-plan-step', `Planner · ${event.summary}`);
      break;
    case 'planner.plan.completed':
      finishTool(AGENTS.planner.id, 'planner-plan-step');
      break;
    case 'planner.agent.selected':
      startTool(
        AGENTS.planner.id,
        'planner-assign',
        `Planner · ${targetSolver ? AGENTS[targetSolver].name : '모델'} 배정 중`,
      );
      break;
    case 'planner.document.delivered':
      finishTool(AGENTS.planner.id, 'planner-assign');
      break;
    case 'agent.solve.started':
      if (solver) {
        startTool(
          AGENTS[solver].id,
          `${solver}-start`,
          `${AGENTS[solver].name} · 문제 분석 시작`,
        );
      }
      break;
    case 'agent.step.updated': {
      const step = Number(event.metadata?.step ?? 1);
      if (solver) {
        startTool(
          AGENTS[solver].id,
          `${solver}-step-${step.toString()}`,
          `${AGENTS[solver].name} · ${event.summary}`,
        );
      }
      break;
    }
    case 'agent.solve.completed':
      if (solver) {
        const stepCount = Number(event.metadata?.stepCount ?? 1);
        finishTool(AGENTS[solver].id, `${solver}-step-${stepCount.toString()}`);
      }
      break;
    case 'boss.review.started':
      startTool(AGENTS.boss.id, 'boss-submit', 'Final Boss · 답안 접수 중');
      break;
    case 'boss.review.approved':
      finishTool(AGENTS.boss.id, 'boss-submit');
      break;
    default:
      break;
  }
}
