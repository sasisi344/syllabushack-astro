/** @jsxImportSource preact */

export interface Flashcard {
  id: string;
  front: string;    // 用語
  back: string;     // 定義・解説
  category?: string; // 中分類名など
  examId: string;   // ip, fe, ap etc.
}

export interface FlashcardAppProps {
  initialDeck?: string; // 初回表示する試験区分
}

export type LearningStatus = 'new' | 'learning' | 'mastered';

export interface CardState {
  cardId: string;
  status: LearningStatus;
  lastViewed: number;
}

export interface QuizQuestion {
  id?: string | number;
  question?: string;
  text?: string;
  options?: string[];
  choices?: { label: string; text: string }[];
  answer?: string;
  correctLabel?: string;
  explanation?: string;
  middle_category?: string;
  category?: string;
  subField?: string;
}

export interface Syllabus {
  examId: string;
  categories: {
    name: string;
    large_categories: {
      name: string;
      middle_categories: {
        id: string;
        name: string;
        keywords: string[];
      }[];
    }[];
  }[];
}
