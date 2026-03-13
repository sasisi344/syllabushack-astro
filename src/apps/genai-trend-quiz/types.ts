/**
 * Quiz App Shared Types for GenAI Trend Quiz
 */

export type ExamField = 'strategy' | 'management' | 'technology' | 'generative-ai' | 'practical';

export const FIELD_LABELS: Record<ExamField, string> = {
  strategy: 'ストラテジ系',
  management: 'マネジメント系',
  technology: 'テクノロジ系',
  'generative-ai': '生成AI理論',
  practical: '実務・セキュリティ',
};

export type ExamId = 'ip' | 'sg' | 'fe' | 'ap' | 'common' | 'st' | 'sa' | 'pm' | 'nw' | 'db' | 'es' | 'sm' | 'au' | 'sc';

export interface Choice {
  label: string; 
  text: string;
}

export interface Question {
  id: string;
  examId: string;
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
  fieldStats: Record<string, { answered: number; correct: number }>;
  history: AnswerRecord[];
  lastUpdated: number;
}

export interface QuizAppProps {
  questions: Question[];
  examId: string;
  examName: string;
}

export interface DailyQuizProps {
  questions: Question[];
}
