/** @jsxImportSource preact */
import { useState, useCallback, useMemo, useEffect } from 'preact/hooks';
import type { Question, QuizAppProps, ExamField } from './types';
import { FIELD_LABELS } from './types';
import { recordAnswer, loadProgress, getFieldAccuracy, getWeakestField } from './progress';

type QuizMode = 'menu' | 'drill' | 'result';

/**
 * QuizApp — 分野別ドリル + 進捗管理 の本体コンポーネント
 */
export default function QuizApp({ questions, examId, examName }: QuizAppProps) {
  const [mode, setMode] = useState<QuizMode>('menu');
  const [currentField, setCurrentField] = useState<ExamField | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [progress, setProgress] = useState(() => loadProgress(examId));

  // ドリルの問題セット
  const drillQuestions = useMemo(() => {
    if (!currentField) return [];
    const filtered = questions.filter((q) => q.field === currentField);
    // Fisher-Yatesシャッフル（毎回異なる順番）
    const shuffled = [...filtered];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 10); // 最大10問
  }, [currentField, questions]);

  const currentQuestion = drillQuestions[currentIndex];

  const startDrill = useCallback((field: ExamField) => {
    setCurrentField(field);
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setMode('drill');
  }, []);

  /** 全問ドリル（シャッフルで全分野） */
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const startAll = useCallback(() => {
    // 分野ごとのターゲット出題数 (合計10問)
    // ストラテジ: 35% -> 3-4問 (3)
    // マネジメント: 20% -> 2問 (2)
    // テクノロジ: 45% -> 4-5問 (5)
    const TARGET_COUNTS = {
      strategy: 3,
      management: 2,
      technology: 5,
    };

    const selectedQuestions: Question[] = [];

    // 各分野からランダムに抽出
    for (const [field, count] of Object.entries(TARGET_COUNTS)) {
      let fieldQuestions = [];
      if (field === 'technology') {
        fieldQuestions = questions.filter((q) => q.field === 'technology' || q.field === 'generative-ai');
      } else {
        fieldQuestions = questions.filter((q) => q.field === field);
      }
      // シャッフル
      for (let i = fieldQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [fieldQuestions[i], fieldQuestions[j]] = [fieldQuestions[j], fieldQuestions[i]];
      }
      // 指定数だけ取得（足りなければあるだけ）
      selectedQuestions.push(...fieldQuestions.slice(0, count));
    }

    // 最終セットをシャッフル
    const finalSet = [...selectedQuestions];
    for (let i = finalSet.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [finalSet[i], finalSet[j]] = [finalSet[j], finalSet[i]];
    }

    setAllQuestions(finalSet);
    setCurrentField(null);
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setMode('drill');
  }, [questions]);

  // 汎用的な現在の問題リスト
  const activeQuestions = currentField ? drillQuestions : allQuestions;
  const activeQuestion = activeQuestions[currentIndex];

  const handleAnswer = useCallback(
    (label: string) => {
      if (!activeQuestion) return;
      setAnswers((prev) => ({ ...prev, [activeQuestion.id]: label }));
      // 進捗記録
      const updated = recordAnswer(examId, activeQuestion.id, label, activeQuestion.correctLabel, activeQuestion.field);
      setProgress(updated);
    },
    [activeQuestion, examId]
  );

  const goNext = useCallback(() => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      setMode('result');
    }
  }, [currentIndex, activeQuestions]);

  const correctCount = useMemo(() => {
    return activeQuestions.filter((q) => answers[q.id] === q.correctLabel).length;
  }, [activeQuestions, answers]);

  // 苦手分野の取得
  const weakest = useMemo(() => getWeakestField(progress), [progress]);

  // AIに聞くプロンプト生成
  const generateAiPrompt = useCallback(
    (q: Question, userAnswer: string) => {
      const scenarioText = q.scenario ? `【シナリオ】\n${q.scenario}\n\n` : '';
      return `以下の${examName}の問題について、なぜ「${q.correctLabel}」が正解なのか、初学者にもわかるように詳しく解説してください。

${scenarioText}【問題】
${q.text}

${q.choices.map((c) => `${c.label}. ${c.text}`).join('\n')}

正解: ${q.correctLabel}
私の回答: ${userAnswer}`;
    },
    [examName]
  );

  // ---- RENDER ----

  // メニュー画面
  if (mode === 'menu') {
    return (
      <div class="quiz-app">
        <div class="qa-menu">
          <h2 class="qa-title">{examName}</h2>
          <p class="qa-subtitle">分野を選んでドリルを開始</p>

          <button class="qa-btn full" onClick={startAll}>
            <span class="icon">🎲</span> 全分野シャッフル (10問)
          </button>
          <div class="qa-grid">
            {(Object.keys(FIELD_LABELS) as ExamField[]).filter(f => f !== 'generative-ai').map((field) => {
              const count = questions.filter((q) => q.field === field).length;
              if (count === 0) return null; // 問題がない分野は表示しない
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

          {/* 生成AI特訓ボタン */}
          {questions.some(q => q.field === 'generative-ai') && (
            <div class="qa-special-menu">
              <button class="qa-btn primary" onClick={() => startDrill('generative-ai')}>
                <span class="icon">🤖</span> {FIELD_LABELS['generative-ai']} (特訓)
              </button>
            </div>
          )}

          <div class="qa-stats">
            <h3>これまでの成績</h3>
            <div class="qa-row">
              <div class="qa-stat">
                <span class="qa-stat-num">{progress.totalAnswered}</span>
                <span class="qa-stat-label">回答数</span>
              </div>
              <div class="qa-stat">
                <span class="qa-stat-num">
                  {progress.totalAnswered > 0
                    ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
                    : 0}
                  %
                </span>
                <span class="qa-stat-label">正答率</span>
              </div>
              {weakest && (
                <div class="qa-stat qa-stat-weak">
                  <span class="qa-stat-num">{FIELD_LABELS[weakest]}</span>
                  <span class="qa-stat-label">苦手分野</span>
                </div>
              )}
            </div>
          </div>

          <button class="qa-all-btn" onClick={startAll}>
            🎲 全分野シャッフルで挑戦
          </button>
        </div>
      </div>
    );
  }

  // ドリル画面
  if (mode === 'drill' && activeQuestion) {
    const userAnswer = answers[activeQuestion.id];
    const isAnswered = !!userAnswer;
    const isCorrect = userAnswer === activeQuestion.correctLabel;

    return (
      <div class="quiz-app">
        <div class="qa-drill">
          {/* プログレスバー */}
          <div class="qa-progress-bar">
            <div
              class="qa-progress-fill"
              style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>
          <div class="qa-progress-text">
            {currentIndex + 1} / {activeQuestions.length}
          </div>

          {/* シナリオ文 (Subject B用) */}
          {activeQuestion.scenario && (
            <div class="qa-scenario">
              {activeQuestion.scenario.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          )}

          {/* 問題文 */}
          <p class="qa-question">{activeQuestion.text}</p>

          {/* 選択肢 */}
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

          {/* 解説 */}
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
                  🤖 AIにもっと詳しく聞く
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

  // 結果画面
  if (mode === 'result') {
    return (
      <div class="quiz-app">
        <div class="qa-result">
          <h2 class="qa-result-title">📊 結果発表</h2>
          <div class="qa-result-score">
            <span class="qa-result-num">{correctCount}</span>
            <span class="qa-result-denom">/ {activeQuestions.length}</span>
          </div>
          <p class="qa-result-rate">
            正答率: {Math.round((correctCount / activeQuestions.length) * 100)}%
          </p>

          {/* 間違った問題一覧 */}
          <div class="qa-wrong-list">
            <h3>間違えた問題</h3>
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
                    🤖 AIで復習
                  </a>
                </div>
              ))}
            {correctCount === activeQuestions.length && (
              <p class="qa-perfect">🏆 全問正解！素晴らしいです！</p>
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
