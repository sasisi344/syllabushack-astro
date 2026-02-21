/**
 * SG Subject B Quiz App Shared Types
 */

/** 1つの選択肢 */
export interface Choice {
  label: string; // "ア", "イ", "ウ", "エ"
  text: string;
}

/** 1問のデータ構造 */
export interface Question {
  id: string;
  category: string;
  scenario: string;      // シナリオ本文
  question: string;      // 設問文
  choices: Choice[];
  answer: string;        // 正解ラベル "ア" | "イ" | "ウ" | "エ"
  explanation: string;   // 解説テキスト
}

/** LocalStorage に保存する進捗データ */
export interface UserProgress {
  totalAnswered: number;
  totalCorrect: number;
  history: {
    questionId: string;
    isCorrect: boolean;
    answeredAt: number;
  }[];
}

/** クイズアプリ本体のProps */
export interface QuizAppProps {
  questions: Question[];
  examId: string;
  examName: string;
}
