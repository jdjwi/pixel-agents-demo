import { useCallback, useEffect, useReducer, useRef } from 'react';

import { emitDemoEventToOffice, resetDemoAgents } from './browserBridge.js';
import {
  buildPracticeEvents,
  matchPracticeProblem,
  practiceProblems,
} from './practiceProblems.js';
import { DEMO_RUN_IDLE, reduceDemoRun } from './runState.js';

export function useDemoRun(enabled: boolean) {
  const [state, dispatch] = useReducer(reduceDemoRun, DEMO_RUN_IDLE);
  const timersRef = useRef<number[]>([]);
  const lastInputRef = useRef('');

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const start = useCallback(
    (input: string) => {
      if (!enabled || input.trim().length === 0) return false;
      const problem = matchPracticeProblem(input);
      if (!problem) return false;
      clearTimers();
      resetDemoAgents();
      lastInputRef.current = input;
      dispatch({ kind: 'start', problem: input, problemId: problem.id });
      timersRef.current = buildPracticeEvents(problem).map((event) =>
        window.setTimeout(() => {
          dispatch({ kind: 'event', event });
          emitDemoEventToOffice(event);
        }, event.timestampMs),
      );
      return true;
    },
    [clearTimers, enabled],
  );

  const reset = useCallback(() => {
    clearTimers();
    resetDemoAgents();
    dispatch({ kind: 'reset' });
  }, [clearTimers]);

  const replay = useCallback(() => {
    start(lastInputRef.current);
  }, [start]);

  const closeResult = useCallback(() => dispatch({ kind: 'closeResult' }), []);

  useEffect(
    () => () => {
      clearTimers();
      if (enabled) resetDemoAgents();
    },
    [clearTimers, enabled],
  );

  const activeProblem =
    practiceProblems.find((problem) => problem.id === state.problemId) ?? practiceProblems[0];

  return { state, start, reset, replay, closeResult, activeProblem };
}
