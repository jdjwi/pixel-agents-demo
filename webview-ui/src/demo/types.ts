export type RunEventType =
  | 'run.created'
  | 'problem.submitted'
  | 'composer.hidden'
  | 'printer.started'
  | 'document.printed'
  | 'planner.spawned'
  | 'planner.document.picked'
  | 'planner.classification.started'
  | 'planner.classification.completed'
  | 'planner.plan.started'
  | 'planner.plan.updated'
  | 'planner.plan.completed'
  | 'planner.usage.updated'
  | 'planner.agent.selected'
  | 'planner.document.delivered'
  | 'agent.solve.started'
  | 'agent.step.updated'
  | 'agent.usage.updated'
  | 'agent.confidence.updated'
  | 'agent.solve.completed'
  | 'document.solution.updated'
  | 'boss.review.started'
  | 'boss.review.approved'
  | 'document.submitted'
  | 'result.opened'
  | 'run.completed';

export type ProblemCategory = 'math' | 'coding' | 'general';
export type ProblemDifficulty = 'easy' | 'medium' | 'hard';
export type SolverModel = 'quick' | 'deep';
export type TokenAgent = 'planner' | SolverModel;
export type ArtifactOwner =
  | 'user'
  | 'printer'
  | 'planner'
  | SolverModel
  | 'final-boss'
  | 'submission-window';

export type ArtifactState =
  | 'CREATED'
  | 'PRINTED'
  | 'CLASSIFYING'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'SOLUTION_READY'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'SUBMITTED';

export interface RunEvent {
  eventId: string;
  runId: string;
  scenarioId: string;
  timestampMs: number;
  type: RunEventType;
  actorId?: 'user' | 'printer' | 'planner' | SolverModel | 'final-boss';
  targetId?: string;
  artifactId: string;
  summary: string;
  status?: string;
  tokenDelta?: number;
  tokenTotal?: number;
  metadata?: Record<string, string | number | boolean>;
}

export interface PracticeProblem {
  id: string;
  sourceId: string;
  category: ProblemCategory;
  difficulty: ProblemDifficulty;
  solver: SolverModel;
  title: string;
  prompt: string;
  aliases: string[];
  modelPrompt: string;
  classification: string;
  plannerPlan: string[];
  solutionSteps: string[];
  finalAnswer: string;
  plannerTokenTotal: number;
  solverTokenTotal: number;
  confidence: number;
}

export type DemoRunStatus = 'idle' | 'running' | 'completed';

export interface DemoRunState {
  status: DemoRunStatus;
  problemId: string | null;
  problem: string;
  artifactState: ArtifactState | null;
  artifactId: string | null;
  artifactOwner: ArtifactOwner | null;
  owner: string;
  currentSummary: string;
  tokenTotal: number;
  tokenByAgent: Record<TokenAgent, number>;
  confidence: number | null;
  events: RunEvent[];
  resultOpen: boolean;
}

export type DemoRunAction =
  | { kind: 'start'; problem: string; problemId: string }
  | { kind: 'event'; event: RunEvent }
  | { kind: 'reset' }
  | { kind: 'closeResult' };
