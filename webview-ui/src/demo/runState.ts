import type {
  ArtifactOwner,
  ArtifactState,
  DemoRunAction,
  DemoRunState,
  RunEvent,
  RunEventType,
} from './types.js';

export const DEMO_RUN_IDLE: DemoRunState = {
  status: 'idle',
  problemId: null,
  problem: '',
  artifactState: null,
  artifactId: null,
  artifactOwner: null,
  owner: '사용자',
  currentSummary: '문제를 입력하면 Agent Squad가 작업을 시작합니다.',
  tokenTotal: 0,
  tokenByAgent: { planner: 0, deep: 0, quick: 0 },
  confidence: null,
  events: [],
  resultOpen: false,
};

const artifactStateByEvent: Partial<Record<RunEventType, ArtifactState>> = {
  'run.created': 'CREATED',
  'document.printed': 'PRINTED',
  'planner.document.picked': 'CLASSIFYING',
  'planner.classification.started': 'CLASSIFYING',
  'planner.agent.selected': 'ASSIGNED',
  'agent.solve.started': 'IN_PROGRESS',
  'agent.solve.completed': 'SOLUTION_READY',
  'boss.review.started': 'IN_REVIEW',
  'boss.review.approved': 'APPROVED',
  'document.submitted': 'SUBMITTED',
};

const ownerByEvent: Partial<Record<RunEventType, string>> = {
  'run.created': '사용자',
  'printer.started': '프린터',
  'planner.spawned': 'Planner',
  'planner.document.picked': 'Planner',
  'planner.classification.started': 'Planner',
  'planner.classification.completed': 'Planner',
  'planner.plan.started': 'Planner',
  'planner.plan.updated': 'Planner',
  'planner.plan.completed': 'Planner',
  'planner.usage.updated': 'Planner',
  'planner.agent.selected': 'Planner',
  'boss.review.started': 'Final Boss · 제출 창구',
  'boss.review.approved': 'Final Boss · 제출 창구',
  'document.submitted': '제출 완료',
};

function getArtifactOwner(event: RunEvent, current: ArtifactOwner | null): ArtifactOwner | null {
  switch (event.type) {
    case 'run.created':
    case 'problem.submitted':
      return 'user';
    case 'printer.started':
    case 'document.printed':
      return 'printer';
    case 'planner.document.picked':
    case 'planner.classification.started':
    case 'planner.classification.completed':
    case 'planner.plan.started':
    case 'planner.plan.updated':
    case 'planner.plan.completed':
    case 'planner.usage.updated':
    case 'planner.agent.selected':
      return 'planner';
    case 'planner.document.delivered':
      return event.targetId === 'deep' || event.targetId === 'quick' ? event.targetId : current;
    case 'agent.solve.started':
    case 'agent.step.updated':
    case 'agent.usage.updated':
    case 'agent.confidence.updated':
    case 'agent.solve.completed':
    case 'document.solution.updated':
      return event.actorId === 'deep' || event.actorId === 'quick' ? event.actorId : current;
    case 'boss.review.started':
    case 'boss.review.approved':
      return 'final-boss';
    case 'document.submitted':
      return 'submission-window';
    default:
      return current;
  }
}

export function reduceDemoRun(state: DemoRunState, action: DemoRunAction): DemoRunState {
  if (action.kind === 'reset') return DEMO_RUN_IDLE;
  if (action.kind === 'closeResult') return { ...state, resultOpen: false };
  if (action.kind === 'start') {
    return {
      ...DEMO_RUN_IDLE,
      status: 'running',
      problemId: action.problemId,
      problem: action.problem,
      currentSummary: '작업을 시작합니다.',
    };
  }

  const { event } = action;
  const submitted =
    event.type === 'document.submitted' ||
    state.artifactState === 'SUBMITTED' ||
    state.events.some((item) => item.type === 'document.submitted');
  const solverOwner =
    event.actorId === 'deep'
      ? 'Deep'
      : event.actorId === 'quick'
        ? 'Quick'
        : null;
  const isSolverEvent =
    event.type.startsWith('agent.') || event.type === 'document.solution.updated';
  const tokenAgent =
    event.actorId === 'planner' || event.actorId === 'deep' || event.actorId === 'quick'
      ? event.actorId
      : null;
  const tokenByAgent =
    tokenAgent && event.tokenTotal !== undefined
      ? { ...state.tokenByAgent, [tokenAgent]: event.tokenTotal }
      : state.tokenByAgent;
  const tokenTotal = tokenByAgent.planner + tokenByAgent.deep + tokenByAgent.quick;
  const isUsageUpdate =
    event.type === 'planner.usage.updated' || event.type === 'agent.usage.updated';
  const artifactOwner = getArtifactOwner(event, state.artifactOwner);

  return {
    ...state,
    status: event.type === 'run.completed' ? 'completed' : state.status,
    artifactState: artifactStateByEvent[event.type] ?? state.artifactState,
    artifactId: event.artifactId || state.artifactId,
    artifactOwner,
    owner: (isSolverEvent ? solverOwner : null) ?? ownerByEvent[event.type] ?? state.owner,
    // Token updates are supporting metrics, not a new action. Keep the
    // currently displayed action in place so people can read it.
    currentSummary: isUsageUpdate ? state.currentSummary : event.summary,
    tokenTotal,
    tokenByAgent,
    confidence:
      event.type === 'agent.confidence.updated'
        ? Number(event.metadata?.confidence ?? state.confidence)
        : state.confidence,
    events: [...state.events, event],
    resultOpen: event.type === 'result.opened' ? submitted : state.resultOpen,
  };
}
