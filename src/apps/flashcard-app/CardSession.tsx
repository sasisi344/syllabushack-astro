/** @jsxImportSource preact */
import { useState } from 'preact/hooks';
import type { Flashcard } from './types';
import './flashcard.css';

export default function FlashcardApp({ initialCards }: { initialCards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [history, setHistory] = useState<{ id: string; ok: boolean }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleRetry = () => {
    setCurrentIndex(0);
    setHistory([]);
    setIsFlipped(false);
    setIsFinished(false);
  };

  // 現在のカード
  const currentCard = initialCards[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (ok: boolean) => {
    setHistory([...history, { id: currentCard.id, ok }]);
    setIsFlipped(false);
    
    if (currentIndex < initialCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsFinished(true);
    }
  };

  const progress = ((currentIndex) / initialCards.length) * 100;
  const okCount = history.filter(h => h.ok).length;

  if (isFinished) {
    return (
      <div class="flashcard-app finished-view">
        <div class="card-face result-card">
          <div class="completion-icon" style={{fontSize: '4rem', marginBottom: '1rem'}}>🎉</div>
          <h2 class="term" style={{fontSize: '1.8rem'}}>学習完了！</h2>
          <div class="explanation" style={{border: 'none', textAlign: 'center', marginTop: '0.5rem'}}>
            <p>今回のセッション結果:</p>
            <p style={{fontSize: '2rem', margin: '0.5rem 0', color: '#22c55e', fontWeight: 'bold'}}>
              {okCount} / {initialCards.length} 習得
            </p>
          </div>
          <button 
            class="control-btn btn-ok" 
            style={{flex: 'none', width: '100%', marginTop: '2rem'}} 
            onClick={handleRetry}
          >
            もう一度学習する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div class="flashcard-app">
      <div class="app-header">
        <span class="deck-info">{currentCard.examId.toUpperCase()} - {currentCard.category}</span>
        <span class="stats-info">{currentIndex + 1} / {initialCards.length}</span>
      </div>
      
      <div class="progress-bar">
        <div class="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div class="card-scene" onClick={handleFlip}>
        <div class={`flashcard-inner ${isFlipped ? 'is-flipped' : ''}`}>
          {/* Front */}
          <div class="card-face card-face-front">
            <div class="term">{currentCard.front}</div>
            <div class="hint">Click to flip</div>
          </div>
          
          {/* Back */}
          <div class="card-face card-face-back">
            <div class="definition">{currentCard.back}</div>
            {/* シラバス意図などの追加情報があればここに */}
            <div class="explanation">
              ID: {currentCard.id}
            </div>
          </div>
        </div>
      </div>

      {isFlipped && (
        <div class="card-controls animate-fade-in">
          <button class="control-btn btn-ng" onClick={(e) => { e.stopPropagation(); handleNext(false); }}>
            <span>✕</span> まだ不安
          </button>
          <button class="control-btn btn-ok" onClick={(e) => { e.stopPropagation(); handleNext(true); }}>
            <span>✓</span> 覚えた！
          </button>
        </div>
      )}
      
      {!isFlipped && (
        <p style={{textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', marginTop: '1rem'}}>
          カードをタップして裏面を確認してください
        </p>
      )}
    </div>
  );
}
