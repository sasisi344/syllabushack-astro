/** @jsxImportSource preact */
import { useState, useCallback, useMemo, useRef } from 'preact/hooks';
import './subject-b.css';

interface QuestionB {
  id: string;
  text: string;
  answer: string;
  explanation: string;
}

interface Scenario {
  id: string;
  title: string;
  field: string;
  scenario: string;
  questions: QuestionB[];
  keywords: string[];
}

interface SubjectBAppProps {
  scenarios: Scenario[];
  examName: string;
}

export default function SubjectBApp({ scenarios, examName }: SubjectBAppProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [showAnswer, setShowAnswer] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToTop = () => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectScenario = (s: Scenario) => {
    setSelectedScenario(s);
    setShowAnswer({});
    scrollToTop();
  };

  const toggleAnswer = (qId: string) => {
    setShowAnswer(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // メニュー画面
  if (!selectedScenario) {
    return (
      <div class="subject-b-app" ref={containerRef}>
        <div class="sb-menu">
           <h2 class="sb-title">{examName} <span class="badge">科目B対策</span></h2>
           <p class="sb-subtitle">長文読解と応用力を養う。ケーススタディを選択して学習を開始してください。</p>
           
           <div class="sb-grid">
             {scenarios.map(s => (
               <button key={s.id} class="sb-card" onClick={() => handleSelectScenario(s)}>
                 <span class="sb-card-field">{s.field.toUpperCase()}</span>
                 <h3 class="sb-card-title">{s.title}</h3>
                 <div class="sb-card-keywords">
                   {s.keywords.slice(0, 3).map(k => <span key={k} class="badge-sm">{k}</span>)}
                 </div>
               </button>
             ))}
           </div>
        </div>
      </div>
    );
  }

  // 学習画面
  return (
    <div class="subject-b-app" ref={containerRef}>
      <div class="sb-content">
        <button class="sb-back-link" onClick={() => setSelectedScenario(null)}>← ケース一覧に戻る</button>
        
        <header class="sb-header">
          <span class="sb-meta">{selectedScenario.field.toUpperCase()} / ケーススタディ</span>
          <h2 class="sb-case-title">{selectedScenario.title}</h2>
        </header>

        <section class="sb-scenario-box">
          <h3>【シナリオ】</h3>
          <p>{selectedScenario.scenario}</p>
        </section>

        <section class="sb-questions">
          <h3>【考察ポイント】</h3>
          {selectedScenario.questions.map((q, idx) => (
            <div key={q.id} class="sb-q-item">
              <div class="sb-q-text">
                <span class="sb-q-num">設問 {idx + 1}</span>
                <p>{q.text}</p>
              </div>
              
              <button class="sb-ans-toggle" onClick={() => toggleAnswer(q.id)}>
                {showAnswer[q.id] ? '答えを隠す' : '答えを確認する'}
              </button>

              {showAnswer[q.id] && (
                <div class="sb-ans-box">
                  <div class="sb-ans-main">
                    <strong>解答目安:</strong>
                    <p>{q.answer}</p>
                  </div>
                  <div class="sb-ans-exp">
                    <strong>解説:</strong>
                    <p>{q.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>

        <footer class="sb-footer">
          <div class="sb-keywords-full">
            <strong>関連キーワード:</strong>
            <div class="sb-tag-cloud">
               {selectedScenario.keywords.map(k => (
                 <a key={k} href={`https://www.google.com/search?q=${encodeURIComponent(k + ' 応用情報')}`} target="_blank" class="sb-tag">{k}</a>
               ))}
            </div>
          </div>
          <button class="sb-back-btn" onClick={() => setSelectedScenario(null)}>演習を終了して戻る</button>
        </footer>
      </div>
    </div>
  );
}
