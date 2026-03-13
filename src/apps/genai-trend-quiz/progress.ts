import type { UserProgress, AnswerRecord } from './types';

const STORAGE_KEY_PREFIX = 'sh_genai_trend_';

const INITIAL_PROGRESS: UserProgress = {
  totalAnswered: 0,
  totalCorrect: 0,
  fieldStats: {},
  history: [],
  lastUpdated: Date.now(),
};

export function loadProgress(examId: string): UserProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  
  const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}${examId}`);
  if (!saved) return INITIAL_PROGRESS;
  
  try {
    return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to load progress', e);
    return INITIAL_PROGRESS;
  }
}

export function saveProgress(examId: string, progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${examId}`, JSON.stringify(progress));
}

export function recordAnswer(
  examId: string,
  record: AnswerRecord,
  field: string
): UserProgress {
  const current = loadProgress(examId);
  
  // 更新データの作成
  const nextStats = { ...current.fieldStats };
  if (!nextStats[field]) {
    nextStats[field] = { answered: 0, correct: 0 };
  }
  
  nextStats[field].answered += 1;
  if (record.isCorrect) {
    nextStats[field].correct += 1;
  }
  
  const nextProgress: UserProgress = {
    totalAnswered: current.totalAnswered + 1,
    totalCorrect: record.isCorrect ? current.totalCorrect + 1 : current.totalCorrect,
    fieldStats: nextStats,
    history: [record, ...current.history].slice(0, 100), // 最新100件を保持
    lastUpdated: Date.now(),
  };
  
  saveProgress(examId, nextProgress);
  return nextProgress;
}

export function getFieldAccuracy(progress: UserProgress, field: string): number {
  const stats = progress.fieldStats[field];
  if (!stats || stats.answered === 0) return 0;
  return Math.round((stats.correct / stats.answered) * 100);
}

export function getWeakestField(progress: UserProgress): string | null {
  let weakestField: string | null = null;
  let lowestAccuracy = 101;
  let maxAnswered = 0;

  for (const [field, stats] of Object.entries(progress.fieldStats)) {
    if (stats.answered < 3) continue; // ある程度の回答数があるものを優先
    const accuracy = Math.round((stats.correct / stats.answered) * 100);
    if (accuracy < lowestAccuracy) {
      lowestAccuracy = accuracy;
      weakestField = field;
    } else if (accuracy === lowestAccuracy && stats.answered > maxAnswered) {
      maxAnswered = stats.answered;
      weakestField = field;
    }
  }

  return weakestField;
}
