/** @jsxImportSource preact */
import { useState, useCallback, useMemo, useRef } from 'preact/hooks';
import type { Question, QuizAppProps, ExamField } from './types';
import { FIELD_LABELS } from './types';
import { recordAnswer, loadProgress, getFieldAccuracy, getWeakestField } from './progress';

type QuizMode = 'menu' | 'drill' | 'result';

export default function QuizApp({ questions, examId, examName }: QuizAppProps) {
  const [mode, setMode] = useState<QuizMode>('menu');
  const [currentField, setCurrentField] = useState<ExamField | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(() => loadProgress(examId));

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const drillQuestions = useMemo(() => {
    if (!currentField) return [];
    const filtered = questions.filter((q) => q.field === currentField);
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 10);
  }, [currentField, questions]);

  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  
  const startMock = useCallback(() => {
    // AP 本番バランス: テクノロジ50, ストラテジ20, マネジメント10 (計80問)
    const TARGET_COUNTS: Record<string, number> = { 
      technology: 50, 
      strategy: 20, 
      management: 10 
    };

    const selectedQuestions: Question[] = [];

    for (const [field, count] of Object.entries(TARGET_COUNTS)) {
      const fieldQuestions = questions.filter((q) => q.field === field);
      if (fieldQuestions.length === 0) continue;

      const shuffledField = [...fieldQuestions];
      for (let i = shuffledField.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledField[i], shuffledField[j]] = [shuffledField[j], shuffledField[i]];
      }
      selectedQuestions.push(...shuffledField.slice(0, Math.min(count, shuffledField.length)));
    }

    const finalSet = [...selectedQuestions];
    for (let i = finalSet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalSet[i], finalSet[j]] = [finalSet[j], finalSet[i]];
    }

    setAllQuestions(finalSet);
    setCurrentField(null);
    setCurrentIndex(0);
    setAnswers({});
    setMode('drill');
    scrollToTop();
  }, [questions]);

  const startAll = useCallback(() => {
    // クイック版 (10問)
    const TARGET_COUNTS: Record<string, number> = { 
      technology: 5, 
      strategy: 3, 
      management: 2 
    };

    const selectedQuestions: Question[] = [];

    for (const [field, count] of Object.entries(TARGET_COUNTS)) {
      const fieldQuestions = questions.filter((q) => q.field === field);
      if (fieldQuestions.length === 0) continue;

      const shuffledField = [...fieldQuestions];
      for (let i = shuffledField.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledField[i], shuffledField[j]] = [shuffledField[j], shuffledField[i]];
      }
      selectedQuestions.push(...shuffledField.slice(0, count));
    }

    const finalSet = [...selectedQuestions];
    for (let i = finalSet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalSet[i], finalSet[j]] = [finalSet[j], finalSet[i]];
    }

    setAllQuestions(finalSet);
    setCurrentField(null);
    setCurrentIndex(0);
    setAnswers({});
    setMode('drill');
    scrollToTop();
  }, [questions]);

  const startDrill = useCallback((field: ExamField) => {
    setCurrentField(field);
    setCurrentIndex(0);
    setAnswers({});
    setMode('drill');
    scrollToTop();
  }, []);

  const activeQuestions = currentField ? drillQuestions : allQuestions;
  const activeQuestion = activeQuestions[currentIndex];

  const handleAnswer = useCallback((label: string) => {
    if (!activeQuestion) return;
    setAnswers((prev) => ({ ...prev, [activeQuestion.id]: label }));
    const updated = recordAnswer(examId, activeQuestion.id, label, activeQuestion.correctLabel, activeQuestion.field);
    setProgress(updated);
  }, [activeQuestion, examId]);

  const goNext = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
      scrollToTop();
    } else {
      setMode('result');
      scrollToTop();
    }
  }, [currentIndex, activeQuestions]);

  const weakest = useMemo(() => getWeakestField(progress), [progress]);

  const generateAiPrompt = useCallback(
    (q: Question, userAnswer: string) => {
      return `以下の${examName}の問題について、なぜ「${q.correctLabel}」が正解なのか、応用情報を目指す学習者にわかるように詳しく解説してください。
解説では、各選択肢が「なぜ正しいのか」または「なぜ誤りなのか」を丁寧に説明してください。

【問題】
${q.text}

${q.choices.map((c) => `${c.label}. ${c.text}`).join('\n')}

正解: ${q.correctLabel}
私の回答: ${userAnswer}`;
    },
    [examName]
  );

  // メニュー
  if (mode === 'menu') {
    return (
      <div class="quiz-app" ref={containerRef}>
        <div class="qa-menu">
          <h2 class="qa-title">{examName} <span class="badge">科目A対策</span></h2>
          <p class="qa-subtitle">出題比率に基づいた模擬試験や分野別ドリルを選択してください</p>

          <div class="qa-main-actions">
            <button class="qa-btn primary full" onClick={startMock}>
              <span class="icon">🏆</span> 本番形式 模擬試験 (80問)
              <small>（比率：技術50 / 経営20 / 管理10）</small>
            </button>
            <button class="qa-btn full" onClick={startAll}>
              <span class="icon">🎲</span> クイック演習 (10問)
            </button>
          </div>

          <div class="qa-grid">
            {(Object.keys(FIELD_LABELS) as ExamField[]).filter(f => f !== 'generative-ai' && f !== 'practical').map((field) => {
              const count = questions.filter((q) => q.field === field).length;
              if (count === 0) return null;
              const accuracy = getFieldAccuracy(progress, field);
              return (
                <button
                  key={field}
                  class={`qa-btn ${weakest === field ? 'qa-weak' : ''}`}
                  onClick={() => startDrill(field)}
                >
                  <span class="qa-field-name">{FIELD_LABELS[field]}</span>
                  <span class="qa-field-meta">{count}問 / 正答率 {accuracy}%</span>
                  {weakest === field && <span class="qa-weak-badge">苦手</span>}
                </button>
              );
            })}
          </div>

          <div class="qa-stats">
            <h3>科目A 合計成績</h3>
            <div class="qa-row">
              <div class="qa-stat">
                <span class="qa-stat-num">{progress.totalAnswered}</span>
                <span class="qa-stat-label">総回答数</span>
              </div>
              <div class="qa-stat">
                <span class="qa-stat-num">
                  {progress.totalAnswered > 0
                    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
                    : 0}
                  %
                </span>
                <span class="qa-stat-label">累積正答率</span>
              </div>
              {weakest && (
                <div class="qa-stat qa-stat-weak">
                  <span class="qa-stat-num">{FIELD_LABELS[weakest]}</span>
                  <span class="qa-stat-label">重点学習分野</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ドリル
  if (mode === 'drill' && activeQuestion) {
    const userAnswer = answers[activeQuestion.id];
    const isAnswered = !!userAnswer;
    const isCorrect = userAnswer === activeQuestion.correctLabel;

    return (
      <div class="quiz-app" ref={containerRef}>
        <div class="qa-content">
          <div class="qa-progress-bar">
            <div
              ref={progressRef}
              class="qa-progress-fill"
              style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>
          <div class="qa-progress-text">
             問題 {currentIndex + 1} / {activeQuestions.length}
          </div>

          <p class="qa-question">{activeQuestion.text}</p>

          <div class="qa-choices">
            {activeQuestion.choices.map((choice) => {
              let cls = 'qa-choice';
              if (isAnswered) {
                if (choice.label === activeQuestion.correctLabel) cls += ' qa-correct';
                else if (choice.label === userAnswer) cls += ' qa-wrong';
                else cls += ' qa-dimmed';
              }
              return (
                <button
                  key={choice.label}
                  class={cls}
                  onClick={() => handleAnswer(choice.label)}
                  disabled={isAnswered}
                >
                  <span class="qa-label">{choice.label}</span>
                  <span class="qa-text">{choice.text}</span>
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div class={`qa-feedback ${isCorrect ? 'qa-fb-correct' : 'qa-fb-wrong'}`}>
              <strong>{isCorrect ? '✅ 正解！' : `❌ 不正解… 正解は「${activeQuestion.correctLabel}」`}</strong>
              <p>{activeQuestion.explanation}</p>
              <div class="qa-feedback-actions">
                <a
                  href={`https://gemini.google.com/app?q=${encodeURIComponent(generateAiPrompt(activeQuestion, userAnswer))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="qa-ai-link"
                >
                  🤖 AIに原理を聞く
                </a>
                <button class="qa-next-btn" onClick={goNext}>
                  {currentIndex < activeQuestions.length - 1 ? '次の問題 →' : '結果を見る'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 結果
  if (mode === 'result') {
    const correctCount = activeQuestions.filter((q) => answers[q.id] === q.correctLabel).length;
    return (
      <div class="quiz-app" ref={containerRef}>
        <div class="qa-result">
          <h2 class="qa-result-title">📊 演習結果</h2>
          <div class="qa-result-score">
            <span class="qa-result-num">{correctCount}</span>
            <span class="qa-result-denom">/ {activeQuestions.length}</span>
          </div>
          <p class="qa-result-rate">
            今回の正答率: {Math.round((correctCount / activeQuestions.length) * 100)}%
          </p>

          <div class="qa-wrong-list">
            <h3>要復習問題</h3>
            {activeQuestions
              .filter((q) => answers[q.id] !== q.correctLabel)
              .map((q) => (
                <div key={q.id} class="qa-wrong-item">
                  <p class="qa-wrong-q">{q.text}</p>
                  <p class="qa-wrong-a">
                    あなたの回答: {answers[q.id]} → 正解: {q.correctLabel}
                  </p>
                  <a
                    href={`https://gemini.google.com/app?q=${encodeURIComponent(generateAiPrompt(q, answers[q.id]))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="qa-ai-link-sm"
                  >
                    🤖 AIで概念を復習
                  </a>
                </div>
              ))}
            {correctCount === activeQuestions.length && (
              <p class="qa-perfect">🏆 パーフェクト！本番もこの調子で！</p>
            )}
          </div>

          <button class="qa-back-btn" onClick={() => setMode('menu')}>
            メニューに戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
}
