import { useState } from 'react';

import { modelName } from './practiceProblems.js';
import type { DemoRunState, PracticeProblem } from './types.js';

interface DemoFlowPanelProps {
  state: DemoRunState;
  activeProblem: PracticeProblem;
  onStart: (input: string) => boolean;
  onReset: () => void;
}

const artifactLabels = {
  CREATED: '문서 생성',
  PRINTED: '출력 완료',
  CLASSIFYING: '분석 중',
  ASSIGNED: '담당 배정',
  IN_PROGRESS: '풀이 중',
  SOLUTION_READY: '풀이 완료',
  IN_REVIEW: '제출 접수',
  APPROVED: '접수 완료',
  SUBMITTED: '제출 완료',
} as const;

export function DemoFlowPanel({ state, activeProblem, onStart, onReset }: DemoFlowPanelProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const submitPrompt = () => {
    if (!onStart(input)) {
      setError('등록된 원본 프롬프트를 그대로 입력해주세요.');
    }
  };

  if (state.status === 'idle') {
    return (
      <section className="demo-prompt-composer" aria-label="문제 프롬프트 입력">
        {error && (
          <div className="demo-prompt-error" role="alert">
            {error}
          </div>
        )}
        <form
          className={`demo-prompt-bar ${error ? 'demo-prompt-bar-error' : ''}`}
          onSubmit={(event) => {
            event.preventDefault();
            submitPrompt();
          }}
        >
          <textarea
            value={input}
            onChange={(event) => {
              const textarea = event.currentTarget;
              setInput(textarea.value);
              textarea.style.height = 'auto';
              textarea.style.height = `${Math.min(textarea.scrollHeight, 76)}px`;
              textarea.style.overflowY = textarea.scrollHeight > 76 ? 'auto' : 'hidden';
              if (error) setError('');
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submitPrompt();
              }
            }}
            rows={1}
            placeholder="문제 프롬프트를 입력하세요"
            aria-label="원본 문제 프롬프트"
            className="demo-prompt-input pixel-scrollbar"
          />
          <button type="submit" className="demo-prompt-submit" aria-label="프롬프트 제출">
            ↑
          </button>
        </form>
      </section>
    );
  }

  const recentEvents = state.events.slice(-5).reverse();
  const plannerSteps = state.events.filter((event) => event.type === 'planner.plan.updated');
  const isPrinting = state.events.at(-1)?.type === 'printer.started';

  return (
    <aside className="demo-progress-menu absolute z-30 pixel-panel p-14 overflow-y-auto pixel-scrollbar">
      <div className="flex items-center justify-between gap-8 border-b border-border pb-9 mb-10">
        <div className="min-w-0">
          <div className="text-2xs text-accent-bright truncate">
            {activeProblem.sourceId} · {modelName(activeProblem.solver)}
          </div>
          <div className="text-xs text-text-muted mt-3 truncate">
            {activeProblem.classification}
          </div>
        </div>
        <span className="text-xs text-status-active pixel-pulse">●</span>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-10">
        <Metric label="TOTAL" value={state.tokenTotal.toLocaleString('ko-KR')} />
        <Metric label="PLANNER" value={state.tokenByAgent.planner.toLocaleString('ko-KR')} />
        <Metric label="DEEP" value={state.tokenByAgent.deep.toLocaleString('ko-KR')} />
        <Metric label="QUICK" value={state.tokenByAgent.quick.toLocaleString('ko-KR')} />
      </div>

      <div className="bg-bg-dark border border-border p-10 mb-8">
        <div className="flex justify-between gap-8 text-2xs text-text-muted mb-4">
          <span>CURRENT</span>
          <span>{state.artifactState ? artifactLabels[state.artifactState] : '준비'}</span>
        </div>
        <div className="text-xs leading-[1.35]">
          {isPrinting && <span className="inline-block mr-6 pixel-pulse">▤</span>}
          {state.currentSummary}
        </div>
      </div>

      {plannerSteps.length > 0 && (
        <div className="bg-bg-dark border border-border p-9 mb-10">
          <div className="text-2xs text-accent-bright mb-5">PLANNER PLAN</div>
          <ol className="m-0 pl-18 text-2xs text-text-muted space-y-4">
            {plannerSteps.map((event) => (
              <li key={event.eventId} className="leading-[1.3]">
                {event.summary}
              </li>
            ))}
          </ol>
        </div>
      )}

      <ol className="m-0 p-0 list-none space-y-5">
        {recentEvents.map((event) => (
          <li key={event.eventId} className="flex gap-7 text-2xs text-text-muted">
            <span className="text-accent-bright">{(event.timestampMs / 1000).toFixed(1)}s</span>
            <span className="truncate">{event.summary}</span>
          </li>
        ))}
      </ol>

      <button
        className="mt-10 text-2xs text-text-muted hover:text-text cursor-pointer bg-transparent border-0 p-0"
        onClick={onReset}
      >
        새 프롬프트 입력
      </button>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-dark border border-border p-6 min-w-0 text-center">
      <div className="text-[13px] text-text-muted mb-3 truncate">{label}</div>
      <div className="text-xs truncate">{value}</div>
    </div>
  );
}
