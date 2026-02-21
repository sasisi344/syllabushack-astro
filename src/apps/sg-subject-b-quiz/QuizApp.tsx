/** @jsxImportSource preact */
import { useState, useCallback, useMemo, useRef } from 'preact/hooks';
import type { Question, QuizAppProps } from './types';
import ScenarioViewer from './ScenarioViewer';
import './quiz.css';

export default function QuizApp({ questions, examId, examName }: QuizAppProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeQuestion = questions[currentIndex];
  const userAnswer = answers[activeQuestion?.id];
  const isAnswered = !!userAnswer;

  const handleAnswer = useCallback((label: string) => {
    if (!activeQuestion || isAnswered) return;
    setAnswers(prev => ({ ...prev, [activeQuestion.id]: label }));
  }, [activeQuestion, isAnswered]);

  const goNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      if (containerRef.current) containerRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, questions.length]);

  const reset = () => {
    setCurrentIndex(0);
    setAnswers({});
    setIsFinished(false);
  };

  const generateAiPrompt = (q: Question) => {
    return `情報セキュリティマネジメント試験の科目B（実務シナリオ）について解説してください。
【シナリオ】
${q.scenario}
【設問】
${q.question}
【正解】
${q.answer}
なぜこれが正解なのか、実務上の観点（リスク管理、組織的対応等）から詳しく教えてください。`;
  };

  if (isFinished) {
    const correctCount = questions.filter(q => answers[q.id] === q.answer).length;
    return (
      <div class="sg-quiz-container res-view" ref={containerRef}>
        <div class="sg-result-card">
          <h2>演習終了</h2>
          <div class="sg-score">
            <span class="num">{correctCount}</span> / {questions.length}
          </div>
          <button class="sg-btn primary" onClick={reset}>もう一度挑戦</button>
        </div>
      </div>
    );
  }

  return (
    <div class="sg-quiz-container" ref={containerRef}>
      <div class="sg-quiz-layout">
        <aside class="sg-side-scenario">
          <ScenarioViewer text={activeQuestion.scenario} />
        </aside>

        <main class="sg-main-content">
          <div class="sg-q-header">
            <span class="sg-q-num">第 {currentIndex + 1} 問</span>
            <div class="sg-progress-dots">
              {questions.map((_, i) => (
                <span key={i} class={`dot ${i === currentIndex ? 'active' : ''} ${answers[questions[i].id] ? 'done' : ''}`} />
              ))}
            </div>
          </div>

          <p class="sg-question-text">{activeQuestion.question}</p>

          <div class="sg-choices">
            {activeQuestion.choices.map((choice) => {
              let cls = 'sg-choice-btn';
              if (isAnswered) {
                if (choice.label === activeQuestion.answer) cls += ' correct';
                else if (choice.label === userAnswer) cls += ' wrong';
                else cls += ' dimmed';
              }
              return (
                <button
                  key={choice.label}
                  class={cls}
                  onClick={() => handleAnswer(choice.label)}
                  disabled={isAnswered}
                >
                  <span class="label">{choice.label}</span>
                  <span class="text">{choice.text}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div class="sg-explanation-box">
              <div class="sg-status-badge">
                {userAnswer === activeQuestion.answer ? '✅ 正解' : '❌ 不正解'}
              </div>
              <p class="text">{activeQuestion.explanation}</p>
              <div class="sg-actions">
                <a
                  href={`https://gemini.google.com/app?q=${encodeURIComponent(generateAiPrompt(activeQuestion))}`}
                  target="_blank"
                  rel="noopener"
                  class="sg-ai-btn"
                >
                  🤖 AIに詳しく相談
                </a>
                <button class="sg-btn next" onClick={goNext}>
                  {currentIndex < questions.length - 1 ? '次の問題へ' : '結果を見る'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
