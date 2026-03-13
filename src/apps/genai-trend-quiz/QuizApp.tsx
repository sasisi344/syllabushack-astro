/** @jsxImportSource preact */
import { useState, useCallback, useMemo, useRef } from 'preact/hooks';
import type { Question, QuizAppProps, ExamField } from './types';
import { FIELD_LABELS } from './types';
import { recordAnswer, loadProgress, getFieldAccuracy, getWeakestField } from './progress';

type QuizMode = 'menu' | 'drill' | 'result';

export default function QuizApp({ questions, examId, examName }: QuizAppProps) {
  const [mode, setMode] = useState<QuizMode>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(() => loadProgress(examId));
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

  const startDrill = useCallback((field: ExamField | null) => {
    setCurrentIndex(0);
    setAnswers({});
    
    // ドリルの問題セットを固定
    let filtered = questions;
    if (field) {
      filtered = questions.filter((q) => q.field === field);
    }
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setActiveQuestions(shuffled.slice(0, 10));
    
    setMode('drill');
    scrollToTop();
  }, [questions]);

  const currentQuestion = activeQuestions[currentIndex];

  const handleAnswer = useCallback((label: string) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: label }));
    
    const nextProgress = recordAnswer(
      examId,
      {
        questionId: currentQuestion.id,
        selectedLabel: label,
        isCorrect: label === currentQuestion.correctLabel,
        answeredAt: Date.now()
      },
      currentQuestion.field
    );
    setProgress(nextProgress);
  }, [currentQuestion, examId]);

  const goNext = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
      scrollToTop();
    } else {
      setMode('result');
      scrollToTop();
    }
  }, [currentIndex, activeQuestions]);

  const correctCount = useMemo(() => {
    return activeQuestions.filter(q => answers[q.id] === q.correctLabel).length;
  }, [activeQuestions, answers]);

  const weakest = useMemo(() => getWeakestField(progress), [progress]);

  const generateAiPrompt = (q: Question, userAnswer: string) => {
    return `以下の「${examName}」の問題について、なぜ「${q.correctLabel}」が正解なのか解説してください。
【問題】
${q.text}

【選択肢】
${q.choices.map(c => `${c.label}: ${c.text}`).join('\n')}

私の回答: ${userAnswer}
正解: ${q.correctLabel}

初心者にもわかりやすく、用語の背景も交えて説明してください。`;
  };

  // --- Render Sections ---

  if (mode === 'menu') {
    return (
      <div class="quiz-container" ref={containerRef}>
        <header class="quiz-header">
          <h2 class="quiz-title">{examName}</h2>
          <p class="quiz-subtitle">最新トレンドと重要ロジックを最速攻略</p>
        </header>

        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-value">{progress.totalAnswered}</span>
            <span class="stat-label">Total Answered</span>
          </div>
          <div class="stat-card">
            <span class="stat-value">
              {progress.totalAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100) : 0}%
            </span>
            <span class="stat-label">Accuracy</span>
          </div>
          <div class="stat-card">
            <span class="stat-value" style={{ fontSize: '0.9rem' }}>
              {weakest ? FIELD_LABELS[weakest as ExamField] : '---'}
            </span>
            <span class="stat-label">Weakest Area</span>
          </div>
        </div>

        <button class="btn-all-start" onClick={() => startDrill(null)}>
          🚀 全分野からランダムに挑戦 (10問)
        </button>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontWeight: 800 }}>分野別ドリル</h3>
          <div class="category-grid">
            {(Object.keys(FIELD_LABELS) as ExamField[]).map(field => {
              const count = questions.filter(q => q.field === field).length;
              if (count === 0) return null;
              const accuracy = getFieldAccuracy(progress, field);
              return (
                <div class="category-card" onClick={() => startDrill(field)} key={field}>
                  <div class="category-info">
                    <span class="name">{FIELD_LABELS[field]}</span>
                    <span class="meta">{count} 問収録 / 正答率 {accuracy}%</span>
                  </div>
                  {weakest === field && <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.8rem' }}>⚠️ 苦手</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'drill' && currentQuestion) {
    const userAnswer = answers[currentQuestion.id];
    const isAnswered = !!userAnswer;
    const isCorrect = userAnswer === currentQuestion.correctLabel;

    return (
      <div class="quiz-container" ref={containerRef}>
        <div class="drill-header">
          <div class="progress-container">
            <div class="progress-fill" style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }} />
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.8rem', color: '#64748b' }}>
            Question {currentIndex + 1} of {activeQuestions.length}
          </div>
        </div>

        <div class="question-text">{currentQuestion.text}</div>

        <div class="choice-list">
          {currentQuestion.choices.map(choice => {
            let stateClass = '';
            if (isAnswered) {
              if (choice.label === currentQuestion.correctLabel) stateClass = 'is-correct';
              else if (choice.label === userAnswer) stateClass = 'is-wrong';
              else stateClass = 'dimmed';
            }
            return (
              <div 
                class={`choice-item ${stateClass} ${isAnswered ? 'disabled' : ''}`} 
                onClick={() => !isAnswered && handleAnswer(choice.label)}
                key={choice.label}
              >
                <div class="choice-label">{choice.label}</div>
                <div class="choice-text">{choice.text}</div>
              </div>
            );
          })}
        </div>

        {isAnswered && (
          <div class={`feedback-panel ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`}>
            <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>
              {isCorrect ? '✨ Correct!' : '❌ Incorrect'}
            </h4>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.6 }}>{currentQuestion.explanation}</p>
            
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
              <a 
                href={`https://gemini.google.com/app?q=${encodeURIComponent(generateAiPrompt(currentQuestion, userAnswer))}`}
                target="_blank"
                class="ai-link"
              >
                🤖 Geminiに詳しく聞く
              </a>
              <button class="btn-next" onClick={goNext}>
                {currentIndex < activeQuestions.length - 1 ? 'Next Question →' : 'View Results'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'result') {
    return (
      <div class="quiz-container" ref={containerRef}>
        <div class="quiz-header">
          <h2 class="quiz-title">Test Complete!</h2>
          <p class="quiz-subtitle">お疲れ様でした。結果を確認しましょう。</p>
        </div>

        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: '#6366f1' }}>
            {correctCount} <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>/ {activeQuestions.length}</span>
          </div>
          <p style={{ fontWeight: 700, marginTop: '1rem' }}>
            Score: {Math.round((correctCount / activeQuestions.length) * 100)}%
          </p>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Review Incorrect Questions</h3>
          {activeQuestions.filter(q => answers[q.id] !== q.correctLabel).map(q => (
            <div class="category-card" style={{ marginBottom: '0.75rem', cursor: 'default' }} key={q.id}>
              <div>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>{q.text}</p>
                <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>
                  Your Answer: {answers[q.id]} | Correct: {q.correctLabel}
                </p>
              </div>
            </div>
          ))}
          {correctCount === activeQuestions.length && <p style={{ textAlign: 'center', color: '#22c55e', fontWeight: 700 }}>Perfect Score! GPT-4? No, it's you!</p>}
        </div>

        <button class="btn-all-start" style={{ marginTop: '2rem' }} onClick={() => setMode('menu')}>
          Back to Menu
        </button>
      </div>
    );
  }

  return null;
}
