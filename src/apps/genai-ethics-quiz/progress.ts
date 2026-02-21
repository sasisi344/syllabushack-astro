import type { UserProgress, AnswerRecord } from './types';

const STORAGE_KEY = 'syllabushack_genai_ethics_progress';

export function loadProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return createEmptyProgress();
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return createEmptyProgress();
  try {
    return JSON.parse(saved);
  } catch {
    return createEmptyProgress();
  }
}

function createEmptyProgress(): UserProgress {
  return {
    totalAnswered: 0,
    totalCorrect: 0,
    categoryStats: {},
    history: [],
  };
}

export function saveProgress(progress: UserProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function recordAnswer(
  questionId: string,
  category: string,
  isCorrect: boolean
): UserProgress {
  const current = loadProgress();
  
  const record: AnswerRecord = {
    questionId,
    isCorrect,
    answeredAt: Date.now(),
  };

  const categoryStat = current.categoryStats[category] || { answered: 0, correct: 0 };
  categoryStat.answered += 1;
  if (isCorrect) categoryStat.correct += 1;

  const updated: UserProgress = {
    ...current,
    totalAnswered: current.totalAnswered + 1,
    totalCorrect: current.totalCorrect + (isCorrect ? 1 : 0),
    categoryStats: {
      ...current.categoryStats,
      [category]: categoryStat,
    },
    history: [record, ...current.history].slice(0, 1000), // Keep last 1000
  };

  saveProgress(updated);
  return updated;
}
