import type { QuizProgress } from './types';

const PROGRESS_KEY_PREFIX = 'sh_genai_cert_progress_';

export function loadProgress(examId: string): QuizProgress {
  const LOCAL_STORAGE_KEY = `${PROGRESS_KEY_PREFIX}${examId}`;
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse progress', e);
      }
    }
  }
  return { categoryStats: {} };
}

export function saveProgress(examId: string, progress: QuizProgress): void {
  const LOCAL_STORAGE_KEY = `${PROGRESS_KEY_PREFIX}${examId}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(progress));
  }
}

export function recordAnswer(
  examId: string,
  questionId: string,
  category: string,
  isCorrect: boolean
): QuizProgress {
  const current = loadProgress(examId);
  
  if (!current.categoryStats[category]) {
    current.categoryStats[category] = { answered: 0, correct: 0 };
  }
  
  // Update category stats
  current.categoryStats[category].answered += 1;
  if (isCorrect) {
    current.categoryStats[category].correct += 1;
  }
  
  saveProgress(examId, current);
  return current;
}
