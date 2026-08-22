import { useState } from 'react';

interface DemoPromptComposerProps {
  onStart: (input: string) => boolean;
}

export function DemoPromptComposer({ onStart }: DemoPromptComposerProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const submitPrompt = () => {
    if (!onStart(input)) {
      setError('등록된 원본 프롬프트를 그대로 입력해주세요.');
    }
  };

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
