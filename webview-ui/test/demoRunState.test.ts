import assert from 'node:assert/strict';

import { test } from 'vitest';

import {
  buildPracticeEvents,
  matchPracticeProblem,
  practiceProblems,
} from '../src/demo/practiceProblems.js';
import { DEMO_RUN_IDLE, reduceDemoRun } from '../src/demo/runState.js';
import type { DemoRunState, PracticeProblem, RunEvent } from '../src/demo/types.js';

const selectedProblem = practiceProblems.find((problem) => problem.id === 'math-token-game');
if (!selectedProblem) throw new Error('math-token-game fixture is missing');
const PROBLEM: PracticeProblem = selectedProblem;

function start(problem: PracticeProblem = PROBLEM): DemoRunState {
  return reduceDemoRun(DEMO_RUN_IDLE, {
    kind: 'start',
    problem: problem.prompt,
    problemId: problem.id,
  });
}

function play(events: RunEvent[], problem: PracticeProblem = PROBLEM): DemoRunState {
  return events.reduce(
    (state, event) => reduceDemoRun(state, { kind: 'event', event }),
    start(problem),
  );
}

test('catalog contains three problems per category and routes only to Deep or Quick', () => {
  assert.equal(practiceProblems.length, 9);
  for (const category of ['math', 'coding', 'general'] as const) {
    const problems = practiceProblems.filter((problem) => problem.category === category);
    assert.equal(problems.length, 3);
    assert.deepEqual(
      problems.map((problem) => problem.solver).sort(),
      ['deep', 'quick', 'quick'],
    );
  }
  assert.equal(practiceProblems.some((problem) => String(problem.solver) === 'swift'), false);
  assert.equal(new Set(practiceProblems.map((problem) => problem.sourceId)).size, 9);
});

test('an original pasted prompt or source id resolves without rewriting the input', () => {
  assert.equal(
    matchPracticeProblem('A positive integer not less than 10 is called a Snake number.')?.id,
    'coding-snake-numbers',
  );
  assert.equal(matchPracticeProblem('math-visible-0021')?.id, 'math-coin-game');
  assert.equal(matchPracticeProblem('an unrelated prompt'), null);

  const rawPrompt = '\n  Original prompt with spacing.  \n';
  const state = reduceDemoRun(DEMO_RUN_IDLE, {
    kind: 'start',
    problem: rawPrompt,
    problemId: PROBLEM.id,
  });
  assert.equal(state.problem, rawPrompt);
});

test('each generated timeline is deterministic and chronologically ordered', () => {
  for (const problem of practiceProblems) {
    const events = buildPracticeEvents(problem);
    const timestamps = events.map((event) => event.timestampMs);
    assert.deepEqual(timestamps, [...timestamps].sort((a, b) => a - b));
    assert.equal(new Set(events.map((event) => event.eventId)).size, events.length);
    assert.equal(events.at(-1)?.type, 'run.completed');
    assert.equal(
      events.find((event) => event.type === 'planner.agent.selected')?.targetId,
      problem.solver,
    );
    assert.ok(
      events.findIndex((event) => event.type === 'planner.plan.completed') <
        events.findIndex((event) => event.type === 'planner.agent.selected'),
    );
    const plannerCompletedAt = events.find((event) => event.type === 'planner.plan.completed')?.timestampMs;
    const solverStartedAt = events.find((event) => event.type === 'agent.solve.started')?.timestampMs;
    assert.ok(plannerCompletedAt !== undefined && solverStartedAt !== undefined);
    assert.ok(solverStartedAt > plannerCompletedAt);
    assert.equal(
      events.some((event) => event.actorId === 'final-boss' && event.tokenTotal !== undefined),
      false,
    );
  }
});

test('token updates preserve the currently visible process description', () => {
  const events = buildPracticeEvents(PROBLEM);
  const plannerStepIndex = events.findIndex((event) => event.type === 'planner.plan.updated');
  const plannerStep = events[plannerStepIndex];
  const plannerUsage = events[plannerStepIndex + 1];
  assert.equal(plannerUsage.type, 'planner.usage.updated');

  const afterStep = play(events.slice(0, plannerStepIndex + 1));
  const afterUsage = reduceDemoRun(afterStep, { kind: 'event', event: plannerUsage });
  assert.equal(afterUsage.currentSummary, plannerStep.summary);
});

test('artifact state follows the planned vertical-slice lifecycle', () => {
  const events = buildPracticeEvents(PROBLEM);
  const expected = [
    ['run.created', 'CREATED'],
    ['document.printed', 'PRINTED'],
    ['planner.classification.started', 'CLASSIFYING'],
    ['planner.agent.selected', 'ASSIGNED'],
    ['agent.solve.started', 'IN_PROGRESS'],
    ['agent.solve.completed', 'SOLUTION_READY'],
    ['boss.review.started', 'IN_REVIEW'],
    ['boss.review.approved', 'APPROVED'],
    ['document.submitted', 'SUBMITTED'],
  ] as const;

  for (const [type, artifactState] of expected) {
    const index = events.findIndex((event) => event.type === type);
    assert.equal(play(events.slice(0, index + 1)).artifactState, artifactState);
  }
});

test('result cannot open before document.submitted', () => {
  const resultEvent = buildPracticeEvents(PROBLEM).find((event) => event.type === 'result.opened');
  assert.ok(resultEvent);
  assert.equal(reduceDemoRun(start(), { kind: 'event', event: resultEvent }).resultOpen, false);
});

test('the complete run exposes the selected problem usage and confidence', () => {
  const state = play(buildPracticeEvents(PROBLEM));
  assert.equal(state.status, 'completed');
  assert.equal(state.problemId, PROBLEM.id);
  assert.equal(state.artifactState, 'SUBMITTED');
  assert.equal(state.resultOpen, true);
  assert.equal(state.tokenByAgent.planner, PROBLEM.plannerTokenTotal);
  assert.equal(state.tokenByAgent.deep, PROBLEM.solverTokenTotal);
  assert.equal(state.tokenByAgent.quick, 0);
  assert.equal(state.tokenTotal, PROBLEM.plannerTokenTotal + PROBLEM.solverTokenTotal);
  assert.equal(state.confidence, PROBLEM.confidence);
  assert.equal(state.owner, '제출 완료');
});
