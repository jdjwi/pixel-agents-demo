import { useCallback, useEffect, useReducer, useRef } from 'react';

import { emitDemoEventToOffice, resetDemoAgents } from './browserBridge.js';
import { buildPracticeEvents, matchPracticeProblem, practiceProblems } from './practiceProblems.js';
import { DEMO_RUN_IDLE, reduceDemoRun } from './runState.js';
import type { RunEvent } from './types.js';

export function useDemoRun(
  enabled: boolean,
  canDispatchEvent: (event: RunEvent) => boolean = () => true,
) {
  const [state, dispatch] = useReducer(reduceDemoRun, DEMO_RUN_IDLE);
  const timersRef = useRef<number[]>([]);
  const lastInputRef = useRef('');
  const canDispatchEventRef = useRef(canDispatchEvent);

  useEffect(() => {
    canDispatchEventRef.current = canDispatchEvent;
  }, [canDispatchEvent]);

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

      const events = buildPracticeEvents(problem);
      const scheduleEvent = (index: number, delayMs: number): void => {
        const event = events[index];
        if (!event) return;

        const attempt = () => {
          if (!canDispatchEventRef.current(event)) {
            timersRef.current.push(window.setTimeout(attempt, 80));
            return;
          }

          dispatch({ kind: 'event', event });
          emitDemoEventToOffice(event);
          const next = events[index + 1];
          if (next) scheduleEvent(index + 1, Math.max(0, next.timestampMs - event.timestampMs));
        };

        timersRef.current.push(window.setTimeout(attempt, delayMs));
      };

      scheduleEvent(0, events[0]?.timestampMs ?? 0);
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
