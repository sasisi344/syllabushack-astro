/** @jsxImportSource preact */
import { useState, useEffect } from 'preact/hooks';
import CardSession from './CardSession';
import DeckSelector from './DeckSelector';
import { mapQuestionsToCards, mapSyllabusToCards } from './utils';
import type { Flashcard, QuizQuestion, Syllabus } from './types';

interface FlashcardAppProps {
  allData?: {
    genai?: QuizQuestion[];
    ipQuestions?: QuizQuestion[];
    apSyllabus?: Syllabus;
    feSyllabus?: Syllabus;
    ipSyllabus?: Syllabus;
  }
}

export default function FlashcardApp({ allData }: FlashcardAppProps) {
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);

  useEffect(() => {
    if (!selectedDeckId || !allData) return;

    let newCards: Flashcard[] = [];
    switch (selectedDeckId) {
      case 'genai-ethics':
        if (allData.genai) {
          newCards = mapQuestionsToCards(allData.genai, 'common');
        }
        break;
      case 'ip':
        if (allData.ipQuestions) {
          newCards = mapQuestionsToCards(allData.ipQuestions, 'ip');
        } else if (allData.ipSyllabus) {
          newCards = mapSyllabusToCards(allData.ipSyllabus);
        }
        break;
      case 'ap':
        if (allData.apSyllabus) {
          // APは数が多いので、とりあえず最初の100件などに絞る
          newCards = mapSyllabusToCards(allData.apSyllabus).slice(0, 100);
        }
        break;
      case 'fe':
        if (allData.feSyllabus) {
          newCards = mapSyllabusToCards(allData.feSyllabus).slice(0, 50);
        }
        break;
    }
    
    // ランダムシャッフル
    setCards(newCards.sort(() => Math.random() - 0.5));
  }, [selectedDeckId, allData]);

  const handleBackToMenu = () => {
    setSelectedDeckId(null);
    setCards([]);
  };

  if (!selectedDeckId) {
    return <DeckSelector onSelect={setSelectedDeckId} />;
  }

  if (cards.length === 0) {
    return (
      <div style={{textAlign: 'center', padding: '2rem'}}>
        <p>データを読み込んでいます...</p>
        <button class="control-btn" onClick={handleBackToMenu}>戻る</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{marginBottom: '1rem'}}>
        <button 
          onClick={handleBackToMenu}
          style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem'}}
        >
          ← デッキ選択に戻る
        </button>
      </div>
      <CardSession initialCards={cards} />
    </div>
  );
}
