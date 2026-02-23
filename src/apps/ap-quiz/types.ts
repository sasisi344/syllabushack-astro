/**
 * Quiz App Shared Types for AP
 */

export type ExamField = 'strategy' | 'management' | 'technology' | 'generative-ai' | 'practical';

export const FIELD_LABELS: Record<ExamField, string> = {
  strategy: 'ストラテジ系',
  management: 'マネジメント系',
  technology: 'テクノロジ系',
  'generative-ai': '生成AI特化',
  practical: '科目B・実践',
};

export type ExamId = 'ip' | 'sg' | 'fe' | 'ap' | 'st' | 'sa' | 'pm' | 'nw' | 'db' | 'es' | 'sm' | 'au' | 'sc';

export interface Choice {
  label: string; // "ア", "イ", "ウ", "エ"
  text: string;
}

export interface Question {
  id: string;
  examId: ExamId;
  field: ExamField;
  scenario?: string;
  subField?: string;
  year?: string;
  questionNumber?: number;
  text: string;
  choices: Choice[];
  correctLabel: string;
  explanation: string;
  keywords?: string[];
  syllabusRef?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface AnswerRecord {
  questionId: string;
  selectedLabel: string;
  isCorrect: boolean;
  answeredAt: number;
}

export interface UserProgress {
  totalAnswered: number;
  totalCorrect: number;
  fieldStats: Record<ExamField, { answered: number; correct: number }>;
  history: AnswerRecord[];
  lastUpdated: number;
}

export interface QuizAppProps {
  questions: Question[];
  examId: ExamId;
  examName: string;
}
