/**
 * GenAI Ethics Quiz App Shared Types
 */

/** 1つの選択肢 */
export interface Choice {
  label: string; // "ア", "イ", "ウ", "エ"
  text: string;
}

/** 1問のデータ構造 */
export interface Question {
  id: string;
  category: string;      // mechanism, utilization, ethics_governance
  subCategory: string;   
  question: string;      // 問題文
  choices: Choice[];
  answer: string;        // 正解ラベル "ア" | "イ" | "ウ" | "エ"
  explanation: string;   // 解説テキスト
}

/** ユーザーの回答記録 (1問ごと) */
export interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  answeredAt: number; // Unix timestamp
}

/** LocalStorage に保存する進捗データ */
export interface UserProgress {
  totalAnswered: number;
  totalCorrect: number;
  categoryStats: Record<string, { answered: number; correct: number }>;
  history: AnswerRecord[];
}

/** クイズアプリ本体のProps */
export interface QuizAppProps {
  questions: Question[];
  examId: string;
  examName: string;
}
