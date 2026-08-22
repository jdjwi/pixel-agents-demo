import { Button } from '../components/ui/Button.js';
import { Modal } from '../components/ui/Modal.js';
import { modelName } from './practiceProblems.js';
import type { DemoRunState, PracticeProblem } from './types.js';

interface DemoResultModalProps {
  state: DemoRunState;
  problem: PracticeProblem;
  onClose: () => void;
  onReplay: () => void;
}

export function DemoResultModal({ state, problem, onClose, onReplay }: DemoResultModalProps) {
  return (
    <Modal
      isOpen={state.resultOpen}
      onClose={onClose}
      title="MISSION COMPLETE"
      zIndex={60}
      className="w-[min(820px,calc(100%-32px))] max-h-[calc(100%-32px)] overflow-y-auto pixel-scrollbar"
    >
      <div className="px-12 pb-12">
        <div className="grid grid-cols-4 gap-8 mb-14">
          <Summary label="TOTAL" value={state.tokenTotal.toLocaleString('ko-KR')} />
          <Summary label="PLANNER" value={state.tokenByAgent.planner.toLocaleString('ko-KR')} />
          <Summary
            label={modelName(problem.solver).toUpperCase()}
            value={state.tokenByAgent[problem.solver].toLocaleString('ko-KR')}
          />
          <Summary label="신뢰도" value={`${state.confidence ?? 0}%`} />
        </div>

        <section className="mb-14">
          <div className="flex justify-between gap-8 text-xs text-text-muted mb-5">
            <span>사용자 프롬프트</span>
            <span>{problem.sourceId}</span>
          </div>
          <pre className="text-xs m-0 leading-[1.45] whitespace-pre-wrap break-words font-pixel">
            {state.problem}
          </pre>
        </section>

        <section className="mb-14">
          <div className="text-xs text-text-muted mb-6">Planner 계획</div>
          <ol className="m-0 pl-22 text-xs space-y-6">
            {problem.plannerPlan.map((step) => (
              <li key={step} className="leading-[1.4]">
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-14">
          <div className="text-xs text-text-muted mb-6">
            {modelName(problem.solver)} 풀이 과정
          </div>
          <ol className="m-0 pl-22 text-xs space-y-6">
            {problem.solutionSteps.map((step) => (
              <li key={step} className="leading-[1.4]">
                {step}
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-14 bg-bg-dark border-2 border-accent p-12">
          <div className="text-xs text-accent-bright mb-6">FINAL ANSWER</div>
          <pre className="text-xs m-0 leading-[1.45] whitespace-pre-wrap break-words font-pixel">
            {problem.finalAnswer}
          </pre>
        </section>

        <p className="text-2xs text-text-muted m-0 mb-14">
          Final Boss는 UI 제출 창구이며 토큰을 사용하지 않습니다.
        </p>

        <div className="flex justify-end gap-8">
          <Button size="md" onClick={onClose}>
            닫기
          </Button>
          <Button variant="accent" size="md" onClick={onReplay}>
            Replay
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-dark border border-border p-9 text-center">
      <div className="text-2xs text-text-muted mb-4">{label}</div>
      <div className="text-base text-accent-bright">{value}</div>
    </div>
  );
}
