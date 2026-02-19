/** @jsxImportSource preact */
import { useState, useCallback, useMemo, useEffect, useRef } from 'preact/hooks';
import type { Question, QuizAppProps, ExamField } from './types';
import { recordAnswer, loadProgress, getFieldAccuracy } from './progress';

/**
 * 重み付きランダム選出アルゴリズム
 * - 未回答: weight 3（未知の問題を優先）
 * - 過去に不正解あり: weight 5（苦手を最優先で再出題）
 * - 過去に全正解: weight 1（出にくいがゼロにはしない）
 */
function selectWeightedQuestions(
  questions: Question[],
  count: number,
  history: { questionId: string; isCorrect: boolean }[]
): Question[] {
  // 問題ごとの正解/不正解を集計
  const statsMap = new Map<string, { correct: number; wrong: number }>();
  for (const record of history) {
    const existing = statsMap.get(record.questionId) || { correct: 0, wrong: 0 };
    if (record.isCorrect) {
      existing.correct += 1;
    } else {
      existing.wrong += 1;
    }
    statsMap.set(record.questionId, existing);
  }

  // ウェイトの割り当て
  const weighted = questions.map((q) => {
    const stats = statsMap.get(q.id);
    let weight: number;
    if (!stats) {
      weight = 3; // 未回答
    } else if (stats.wrong > 0) {
      // 不正解が多いほどウェイト増加（最大8）
      weight = Math.min(5 + stats.wrong, 8);
    } else {
      weight = 1; // 全問正解
    }
    return { question: q, weight };
  });

  // 重み付きランダム抽出
  const selected: Question[] = [];
  const remaining = [...weighted];
  const targetCount = Math.min(count, remaining.length);

  for (let i = 0; i < targetCount; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    let chosenIndex = 0;
    for (let j = 0; j < remaining.length; j++) {
      random -= remaining[j].weight;
      if (random <= 0) {
        chosenIndex = j;
        break;
      }
    }

    selected.push(remaining[chosenIndex].question);
    remaining.splice(chosenIndex, 1);
  }

  // Fisher-Yates シャッフル（出題順をランダム化）
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }

  return selected;
}

type DrillMode = 'setup' | 'drill' | 'result';

interface StrategyDrillProps {
  questions: Question[];
  examId: string;
  examName: string;
}

/**
 * StrategyDrill — 苦手問題を優先出題する集中ドリルコンポーネント
 */
export default function StrategyDrill({ questions, examId, examName }: StrategyDrillProps) {
  const [mode, setMode] = useState<DrillMode>('setup');
  const [questionCount, setQuestionCount] = useState(30);
  const [drillQuestions, setDrillQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(() => loadProgress(examId));
  const containerRef = useRef<HTMLDivElement>(null);

  // 次の問題へ進む際の上部スクロール
  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 中分類ごとの統計
  const middleCategoryStats = useMemo(() => {
    const cats = new Map<string, { total: number; answered: number; correct: number }>();
    for (const q of questions) {
      const raw = (q as any).middleCategory || (q as any).keyword || 'その他';
      // middleCategoryが生データに含まれているか確認
      const cat = raw;
      const existing = cats.get(cat) || { total: 0, answered: 0, correct: 0 };
      existing.total += 1;
      cats.set(cat, existing);
    }
    // historyで正解・不正解を反映
    const qMap = new Map(questions.map(q => [q.id, q]));
    for (const record of progress.history) {
      const q = qMap.get(record.questionId);
      if (!q) continue;
      const raw = (q as any).middleCategory || (q as any).keyword || 'その他';
      const existing = cats.get(raw);
      if (existing) {
        existing.answered += 1;
        if (record.isCorrect) existing.correct += 1;
      }
    }
    return cats;
  }, [questions, progress]);

  // ドリル開始
  const startDrill = useCallback(() => {
    const currentProgress = loadProgress(examId);
    const selected = selectWeightedQuestions(questions, questionCount, currentProgress.history);
    setDrillQuestions(selected);
    setCurrentIndex(0);
    setAnswers({});
    setMode('drill');
  }, [questions, questionCount, examId]);

  const activeQuestion = drillQuestions[currentIndex];

  // 回答ハンドラ
  const handleAnswer = useCallback(
    (label: string) => {
      if (!activeQuestion) return;
      setAnswers((prev) => ({ ...prev, [activeQuestion.id]: label }));
      const updated = recordAnswer(examId, activeQuestion.id, label, activeQuestion.correctLabel, activeQuestion.field);
      setProgress(updated);
    },
    [activeQuestion, examId]
  );

  // 次の問題
  const goNext = useCallback(() => {
    if (currentIndex < drillQuestions.length - 1) {
      setCurrentIndex((i) => i + 1);
      scrollToTop();
    } else {
      setMode('result');
      scrollToTop();
    }
  }, [currentIndex, drillQuestions]);

  // 正解数
  const correctCount = useMemo(() => {
    return drillQuestions.filter((q) => answers[q.id] === q.correctLabel).length;
  }, [drillQuestions, answers]);

  // 結果画面の中分類別正答率
  const categoryResults = useMemo(() => {
    const cats = new Map<string, { total: number; correct: number }>();
    for (const q of drillQuestions) {
      const cat = (q as any).middleCategory || 'その他';
      const existing = cats.get(cat) || { total: 0, correct: 0 };
      existing.total += 1;
      if (answers[q.id] === q.correctLabel) {
        existing.correct += 1;
      }
      cats.set(cat, existing);
    }
    return Array.from(cats.entries()).sort((a, b) => {
      const rateA = a[1].total > 0 ? a[1].correct / a[1].total : 0;
      const rateB = b[1].total > 0 ? b[1].correct / b[1].total : 0;
      return rateA - rateB; // 正答率の低い順
    });
  }, [drillQuestions, answers]);

  // AIプロンプト生成
  const generateAiPrompt = useCallback(
    (q: Question, userAnswer: string) => {
      const scenarioText = q.scenario ? `【シナリオ】\n${q.scenario}\n\n` : '';
      const keywordsText = q.keywords && q.keywords.length > 0
        ? `【解答のヒントとなるキーワード】\n${q.keywords.map(k => `・${k}`).join('\n')}\n\n`
        : '';

      return `以下の${examName}の問題について、なぜ「${q.correctLabel}」が正解なのか、初学者にもわかるように詳しく解説してください。
解説では、各選択肢が「なぜ正しいのか」または「なぜ誤りなのか」を、上記の関連キーワードの意味も交えて丁寧に説明してください。

${keywordsText}${scenarioText}【問題】
${q.text}

${q.choices.map((c) => `${c.label}. ${c.text}`).join('\n')}

正解: ${q.correctLabel}
私の回答: ${userAnswer}`;
    },
    [examName]
  );

  // ==== RENDER ====

  // セットアップ画面
  if (mode === 'setup') {
    const overallRate = progress.totalAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalAnswered) * 100)
      : 0;

    return (
      <div class="quiz-app" ref={containerRef}>
        <div class="qa-menu">
          <h2 class="qa-title">🎯 {examName}</h2>
          <p class="qa-subtitle">苦手な問題を優先的に出題する集中ドリル</p>

          {/* 問題数セレクター */}
          <div class="qa-count-selector">
            <p class="qa-count-label">出題数を選んでください</p>
            <div class="qa-count-buttons">
              {[30, 40, 50].map((n) => (
                <button
                  key={n}
                  class={`qa-count-btn ${questionCount === n ? 'qa-count-active' : ''}`}
                  onClick={() => setQuestionCount(n)}
                >
                  {n}問
                </button>
              ))}
            </div>
          </div>

          <button class="qa-btn full primary" onClick={startDrill}>
            <span class="icon">🚀</span> ドリル開始（{questionCount}問）
          </button>

          {/* 苦手分析（履歴がある場合のみ） */}
          {progress.totalAnswered > 0 && (
            <div class="qa-stats">
              <h3>📊 あなたの学習状況</h3>
              <div class="qa-row">
                <div class="qa-stat">
                  <span class="qa-stat-num">{progress.totalAnswered}</span>
                  <span class="qa-stat-label">累計回答</span>
                </div>
                <div class="qa-stat">
                  <span class="qa-stat-num">{overallRate}%</span>
                  <span class="qa-stat-label">正答率</span>
                </div>
              </div>

              <div class="qa-weak-analysis">
                <h4>中分類ごとの実力</h4>
                <div class="qa-weak-list">
                  {Array.from(middleCategoryStats.entries())
                    .filter(([_, stats]) => stats.answered > 0)
                    .sort((a, b) => {
                      const rateA = a[1].correct / a[1].answered;
                      const rateB = b[1].correct / b[1].answered;
                      return rateA - rateB;
                    })
                    .map(([cat, stats]) => {
                      const rate = Math.round((stats.correct / stats.answered) * 100);
                      const isWeak = rate < 60;
                      return (
                        <div key={cat} class={`qa-weak-row ${isWeak ? 'qa-is-weak' : ''}`}>
                          <span class="qa-weak-cat">
                            {isWeak && '⚠️ '}{cat}
                          </span>
                          <span class="qa-weak-bar-wrap">
                            <span
                              class="qa-weak-bar-fill"
                              style={{ width: `${rate}%`, backgroundColor: rate >= 80 ? '#22c55e' : rate >= 60 ? '#eab308' : '#ef4444' }}
                            />
                          </span>
                          <span class="qa-weak-rate">{rate}%</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          <p class="qa-hint">
            💡 回答履歴をもとに、苦手な問題が出やすくなります。繰り返し挑戦して弱点を克服しましょう！
          </p>
        </div>
      </div>
    );
  }

  // ドリル画面
  if (mode === 'drill' && activeQuestion) {
    const userAnswer = answers[activeQuestion.id];
    const isAnswered = !!userAnswer;
    const isCorrect = userAnswer === activeQuestion.correctLabel;
    const answeredSoFar = Object.keys(answers).length;
    const correctSoFar = drillQuestions
      .filter((q) => answers[q.id] && answers[q.id] === q.correctLabel)
      .length;
    const currentRate = answeredSoFar > 0 ? Math.round((correctSoFar / answeredSoFar) * 100) : 0;

    return (
      <div class="quiz-app" ref={containerRef}>
        <div class="qa-drill">
          {/* プログレスバー */}
          <div class="qa-progress-bar">
            <div
              class="qa-progress-fill"
              style={{ width: `${((currentIndex + 1) / drillQuestions.length) * 100}%` }}
            />
          </div>
          <div class="qa-progress-text">
            {currentIndex + 1} / {drillQuestions.length}
            <span class="qa-live-rate"> ― 正答率 {currentRate}%</span>
          </div>

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
                  {currentIndex < drillQuestions.length - 1 ? '次の問題 →' : '結果を見る'}
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
    const rate = Math.round((correctCount / drillQuestions.length) * 100);
    const wrongQuestions = drillQuestions.filter((q) => answers[q.id] !== q.correctLabel);

    return (
      <div class="quiz-app" ref={containerRef}>
        <div class="qa-result">
          <h2 class="qa-result-title">📊 セッション結果</h2>
          <div class="qa-result-score">
            <span class="qa-result-num">{correctCount}</span>
            <span class="qa-result-denom">/ {drillQuestions.length}</span>
          </div>
          <p class="qa-result-rate">正答率: {rate}%</p>

          {rate >= 90 && <p class="qa-perfect">🏆 素晴らしい成績です！この調子で本番に臨みましょう！</p>}
          {rate >= 70 && rate < 90 && <p class="qa-good">👍 良い成績です。間違えた問題を復習すれば合格ラインを超えられます。</p>}
          {rate < 70 && <p class="qa-encourage">💪 もう一度挑戦しましょう。苦手な問題が優先的に出題されるので、繰り返すほど強くなります！</p>}

          {/* 中分類ごとの正答率 */}
          {categoryResults.length > 0 && (
            <div class="qa-category-breakdown">
              <h3>中分類ごとの正答率</h3>
              {categoryResults.map(([cat, stats]) => {
                const catRate = Math.round((stats.correct / stats.total) * 100);
                return (
                  <div key={cat} class="qa-weak-row">
                    <span class="qa-weak-cat">
                      {catRate < 60 && '⚠️ '}{cat}
                    </span>
                    <span class="qa-weak-bar-wrap">
                      <span
                        class="qa-weak-bar-fill"
                        style={{ width: `${catRate}%`, backgroundColor: catRate >= 80 ? '#22c55e' : catRate >= 60 ? '#eab308' : '#ef4444' }}
                      />
                    </span>
                    <span class="qa-weak-rate">{stats.correct}/{stats.total} ({catRate}%)</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 不正解リスト */}
          {wrongQuestions.length > 0 && (
            <div class="qa-wrong-list">
              <h3>間違えた問題</h3>
              {wrongQuestions.map((q) => (
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
            </div>
          )}

          <div class="qa-result-actions">
            <button class="qa-btn primary" onClick={startDrill}>
              🔄 もう一度挑戦（苦手を優先出題）
            </button>
            <button class="qa-back-btn" onClick={() => setMode('setup')}>
              メニューに戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
