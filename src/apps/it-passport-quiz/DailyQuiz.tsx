/** @jsxImportSource preact */
import { useState, useCallback, useMemo } from 'preact/hooks';
import type { Question, DailyQuizProps } from './types';

/**
 * DailyQuiz — 「今日の1問」コンポーネント
 * トップページに埋め込む、1問だけの即時判定クイズ
 */
export default function DailyQuiz({ questions }: DailyQuizProps) {
  // 日付シードでランダムに1問選ぶ
  const todayQuestion: Question = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const index = seed % questions.length;
    return questions[index];
  }, [questions]);

  const [selected, setSelected] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const handleSelect = useCallback(
    (label: string) => {
      if (revealed) return;
      setSelected(label);
      setRevealed(true);
    },
    [revealed]
  );

  const isCorrect = selected === todayQuestion.correctLabel;

  // AIに聞くプロンプト生成
  const aiPrompt = useMemo(() => {
    if (!revealed || !selected) return '';
    const keywordsText = todayQuestion.keywords && todayQuestion.keywords.length > 0
      ? `【解答のヒントとなるキーワード】\n${todayQuestion.keywords.map(k => `・${k}`).join('\n')}\n\n`
      : '';

    return `以下のITパスポート試験の問題について、なぜ「${todayQuestion.correctLabel}」が正解なのか、初学者にもわかるように詳しく解説してください。
解説では、各選択肢が「なぜ正しいのか」または「なぜ誤りなのか」を、上記の関連キーワードの意味も交えて丁寧に説明してください。

${keywordsText}【問題】
${todayQuestion.text}

${todayQuestion.choices.map((c) => `${c.label}. ${c.text}`).join('\n')}

正解: ${todayQuestion.correctLabel}
私の回答: ${selected}`;
  }, [revealed, selected, todayQuestion]);

  const geminiUrl = useMemo(() => {
    if (!aiPrompt) return '#';
    return `https://gemini.google.com/app?q=${encodeURIComponent(aiPrompt)}`;
  }, [aiPrompt]);

  return (
    <div class="daily-quiz">
      {/* ヘッダー */}
      <div class="dq-header">
        <span class="dq-badge">今日の1問</span>
        <span class="dq-field">{todayQuestion.subField || todayQuestion.field}</span>
      </div>

      {/* 問題文 */}
      <p class="dq-question">{todayQuestion.text}</p>

      {/* 選択肢 */}
      <div class="dq-choices">
        {todayQuestion.choices.map((choice) => {
          let cls = 'dq-choice';
          if (revealed) {
            if (choice.label === todayQuestion.correctLabel) cls += ' dq-correct';
            else if (choice.label === selected) cls += ' dq-wrong';
            else cls += ' dq-dimmed';
          } else if (choice.label === selected) {
            cls += ' dq-selected';
          }

          return (
            <button
              key={choice.label}
              class={cls}
              onClick={() => handleSelect(choice.label)}
              disabled={revealed}
            >
              <span class="dq-label">{choice.label}</span>
              <span class="dq-text">{choice.text}</span>
            </button>
          );
        })}
      </div>

      {/* 結果表示 */}
      {revealed && (
        <div class={`dq-result ${isCorrect ? 'dq-result-correct' : 'dq-result-wrong'}`}>
          <div class="dq-result-icon">{isCorrect ? '🎉' : '😣'}</div>
          <div class="dq-result-text">
            <strong>{isCorrect ? '正解！' : `不正解… 正解は「${todayQuestion.correctLabel}」`}</strong>
            <p class="dq-explanation">{todayQuestion.explanation}</p>
          </div>
          <a
            href={geminiUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="dq-ai-btn"
          >
            🤖 AIにもっと詳しく聞く
          </a>
        </div>
      )}
    </div>
  );
}
