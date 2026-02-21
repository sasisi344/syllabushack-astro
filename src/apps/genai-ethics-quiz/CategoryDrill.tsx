/** @jsxImportSource preact */
import { useState, useCallback, useMemo, useRef } from 'preact/hooks';
import type { Question } from './types';
import { recordAnswer, loadProgress } from './progress';

interface CategoryDrillProps {
  questions: Question[];
  examId: string;
  examName: string;
}

type DrillMode = 'setup' | 'drill' | 'result';

const CATEGORY_LABELS: Record<string, string> = {
  mechanism: '生成AIの仕組み',
  utilization: 'AI利活用',
  ethics_governance: 'AI倫理・ガバナンス',
};

export default function CategoryDrill({ questions, examId, examName }: CategoryDrillProps) {
  const [mode, setMode] = useState<DrillMode>('setup');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [drillQuestions, setDrillQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(() => loadProgress());
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const startDrill = useCallback((category: string) => {
    const filtered = questions.filter(q => q.category === category);
    // Shuffle
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setDrillQuestions(shuffled.slice(0, 10)); // 10 questions per drill
    setSelectedCategory(category);
    setCurrentIndex(0);
    setAnswers({});
    setMode('drill');
    scrollToTop();
  }, [questions]);

  const activeQuestion = drillQuestions[currentIndex];

  const handleAnswer = useCallback((label: string) => {
    if (!activeQuestion) return;
    const isCorrect = label === activeQuestion.answer;
    setAnswers(prev => ({ ...prev, [activeQuestion.id]: label }));
    const updated = recordAnswer(activeQuestion.id, activeQuestion.category, isCorrect);
    setProgress(updated);
  }, [activeQuestion]);

  const goNext = useCallback(() => {
    if (currentIndex < drillQuestions.length - 1) {
      setCurrentIndex(i => i + 1);
      scrollToTop();
    } else {
      setMode('result');
      scrollToTop();
    }
  }, [currentIndex, drillQuestions]);

  const generateAiPrompt = useCallback((q: Question, userAnswer: string) => {
    return `以下の「生成AIとAI倫理」に関する問題について、なぜ「${q.answer}」が正解なのか、初学者にもわかるように詳しく解説してください。
分野: ${CATEGORY_LABELS[q.category] || q.category}
キーワード: ${q.subCategory}

【問題】
${q.question}

${q.choices.map(c => `${c.label}. ${c.text}`).join('\n')}

正解: ${q.answer}
私の回答: ${userAnswer}`;
  }, []);

  // --- RENDER ---

  if (mode === 'setup') {
    return (
      <div class="qa-menu" ref={containerRef}>
        <h2 class="qa-title">🤖 {examName}</h2>
        <p class="qa-subtitle">分野を選んで最新キーワードを攻略しましょう</p>

        <div class="qa-grid">
          {Object.entries(CATEGORY_LABELS).map(([id, label]) => {
            const count = questions.filter(q => q.category === id).length;
            const stats = progress.categoryStats[id] || { answered: 0, correct: 0 };
            const accuracy = stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 100) : 0;

            return (
              <button key={id} class="qa-btn" onClick={() => startDrill(id)}>
                <span class="qa-field-name">{label}</span>
                <span class="qa-field-meta">{count}問収録 / 正答率 {accuracy}%</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === 'drill' && activeQuestion) {
    const userAnswer = answers[activeQuestion.id];
    const isAnswered = !!userAnswer;
    const isCorrect = userAnswer === activeQuestion.answer;

    return (
      <div class="qa-drill" ref={containerRef}>
        <div class="qa-progress-bar">
          <div class="qa-progress-fill" style={{ width: `${((currentIndex + 1) / drillQuestions.length) * 100}%` }} />
        </div>
        <div class="qa-progress-text">
          {CATEGORY_LABELS[selectedCategory!] || ''} ― {currentIndex + 1} / {drillQuestions.length}
        </div>

        <p class="qa-question">{activeQuestion.question}</p>

        <div class="qa-choices">
          {activeQuestion.choices.map((choice) => {
            let cls = 'qa-choice';
            if (isAnswered) {
              if (choice.label === activeQuestion.answer) cls += ' qa-correct';
              else if (choice.label === userAnswer) cls += ' qa-wrong';
              else cls += ' qa-dimmed';
            }
            return (
              <button key={choice.label} class={cls} onClick={() => handleAnswer(choice.label)} disabled={isAnswered}>
                <span class="qa-label">{choice.label}</span>
                <span class="qa-text">{choice.text}</span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div class={`qa-feedback ${isCorrect ? 'qa-fb-correct' : 'qa-fb-wrong'}`}>
            <strong>{isCorrect ? '✅ 正解！' : `❌ 不正解… 正解は「${activeQuestion.answer}」`}</strong>
            <p>{activeQuestion.explanation}</p>
            <div class="qa-feedback-actions">
              <a
                href={`https://gemini.google.com/app?q=${encodeURIComponent(generateAiPrompt(activeQuestion, userAnswer))}`}
                target="_blank"
                rel="noopener noreferrer"
                class="qa-ai-link"
              >
                🤖 AIに詳しく聞く
              </a>
              <button class="qa-next-btn" onClick={goNext}>
                {currentIndex < drillQuestions.length - 1 ? '次の問題 →' : '結果を見る'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (mode === 'result') {
    const correctCount = drillQuestions.filter(q => answers[q.id] === q.answer).length;
    return (
      <div class="qa-result" ref={containerRef}>
        <h2 class="qa-result-title">📊 演習結果</h2>
        <div class="qa-result-score">
          <span class="qa-result-num">{correctCount}</span>
          <span class="qa-result-denom">/ {drillQuestions.length}</span>
        </div>
        <p class="qa-result-rate">正答率: {Math.round((correctCount / drillQuestions.length) * 100)}%</p>

        <div class="qa-result-actions">
          <button class="qa-all-btn" onClick={() => setMode('setup')}>
            メニューに戻る
          </button>
        </div>
      </div>
    );
  }

  return null;
}
