/** @jsxImportSource preact */
import { useState, useMemo } from 'preact/hooks';
import type { DailyQuizProps } from './types';

export default function DailyQuiz({ questions }: DailyQuizProps) {
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // 日替わりのシードを使用して1問選出
  const dailyQuestion = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const seed = today.split('-').reduce((sum, n) => sum + parseInt(n), 0);
    return questions[seed % questions.length];
  }, [questions]);

  const handleAnswer = (label: string) => {
    if (isAnswered) return;
    setSelectedLabel(label);
    setIsAnswered(true);
  };

  const isCorrect = selectedLabel === dailyQuestion.correctLabel;

  return (
    <div class="daily-quiz-widget" style={{ 
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
      padding: '1.5rem',
      borderRadius: '1rem',
      color: '#fff',
      maxWidth: '500px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <span style={{ 
          background: '#6366f1', 
          fontSize: '0.7rem', 
          padding: '0.2rem 0.6rem', 
          borderRadius: '999px',
          fontWeight: 800
        }}>DAILY DRILL</span>
        <span style={{ fontSize: '0.8rem', color: '#a5b4fc' }}>{dailyQuestion.subField}</span>
      </div>

      <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.6, marginBottom: '1.25rem' }}>
        {dailyQuestion.text}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {dailyQuestion.choices.map(choice => (
          <button
            key={choice.label}
            onClick={() => handleAnswer(choice.label)}
            disabled={isAnswered}
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.2)',
              background: isAnswered 
                ? (choice.label === dailyQuestion.correctLabel ? '#22c55e' : (choice.label === selectedLabel ? '#ef4444' : 'rgba(255,255,255,0.05)'))
                : 'rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: isAnswered ? 'default' : 'pointer',
              fontSize: '0.85rem',
              textAlign: 'left'
            }}
          >
            <strong>{choice.label}</strong> {choice.text}
          </button>
        ))}
      </div>

      {isAnswered && (
        <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
          <p style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            {isCorrect ? '✅ 正解！' : `❌ 不正解... 正解は「${dailyQuestion.correctLabel}」`}
          </p>
          <p style={{ fontSize: '0.8rem', color: '#a5b4fc', lineHeight: 1.5 }}>
            {dailyQuestion.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
