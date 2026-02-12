/**
 * Quiz App Shared Types
 * 問題データ・進捗管理・コンポーネントProps の型定義
 */

/** 分野カテゴリ */
export type ExamField = 'strategy' | 'management' | 'technology' | 'generative-ai' | 'practical';

/** 分野の日本語ラベル */
export const FIELD_LABELS: Record<ExamField, string> = {
  strategy: 'ストラテジ系',
  management: 'マネジメント系',
  technology: 'テクノロジ系',
  'generative-ai': '生成AI特化',
  practical: '科目B・実践',
};

/** 対応試験ID */
export type ExamId = 'ip' | 'sg' | 'fe' | 'ap' | 'st' | 'sa' | 'pm' | 'nw' | 'db' | 'es' | 'sm' | 'au' | 'sc';

/** 1つの選択肢 */
export interface Choice {
  label: string; // "ア", "イ", "ウ", "エ"
  text: string;
}

/** 1問のデータ構造 */
export interface Question {
  id: string;
  examId: ExamId;
  field: ExamField;
  scenario?: string;         // 長文ケーススタディのシナリオ文
  subField?: string;         // 例: "企業活動", "ネットワーク"
  year?: string;             // 出典年度 例: "R05秋"
  questionNumber?: number;   // 問題番号
  text: string;              // 問題文
  choices: Choice[];
  correctLabel: string;      // 正解ラベル "ア" | "イ" | "ウ" | "エ"
  explanation: string;       // 解説テキスト
  keywords?: string[];       // キーワード集 (AI解説生成・検索用)
  syllabusRef?: string;      // シラバス参照
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

/** ユーザーの回答記録 (1問ごと) */
export interface AnswerRecord {
  questionId: string;
  selectedLabel: string;
  isCorrect: boolean;
  answeredAt: number; // Unix timestamp
}

/** LocalStorage に保存する進捗データ */
export interface UserProgress {
  totalAnswered: number;
  totalCorrect: number;
  fieldStats: Record<ExamField, { answered: number; correct: number }>;
  history: AnswerRecord[];
  lastUpdated: number;
}

/** 「今日の1問」コンポーネントのProps */
export interface DailyQuizProps {
  questions: Question[];
}

/** クイズアプリ本体のProps */
export interface QuizAppProps {
  questions: Question[];
  examId: ExamId;
  examName: string;
}
