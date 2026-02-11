/**
 * Quiz Progress Manager
 * LocalStorageを使った進捗管理ユーティリティ
 */
import type { UserProgress, ExamField, AnswerRecord } from './types';

const STORAGE_KEY_PREFIX = 'sh_quiz_';

/** デフォルトの進捗データ */
const createDefaultProgress = (): UserProgress => ({
  totalAnswered: 0,
  totalCorrect: 0,
  fieldStats: {
    strategy: { answered: 0, correct: 0 },
    management: { answered: 0, correct: 0 },
    technology: { answered: 0, correct: 0 },
  },
  history: [],
  lastUpdated: Date.now(),
});

/** 進捗データのロード */
export const loadProgress = (examId: string): UserProgress => {
  if (typeof window === 'undefined') return createDefaultProgress();
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${examId}`);
    if (!raw) return createDefaultProgress();
    return JSON.parse(raw) as UserProgress;
  } catch {
    return createDefaultProgress();
  }
};

/** 進捗データのセーブ */
export const saveProgress = (examId: string, progress: UserProgress): void => {
  if (typeof window === 'undefined') return;
  try {
    progress.lastUpdated = Date.now();
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${examId}`, JSON.stringify(progress));
  } catch {
    // Storage full or not available — デグレ無しでフォールバック
  }
};

/** 回答を記録して進捗を更新 */
export const recordAnswer = (
  examId: string,
  questionId: string,
  selectedLabel: string,
  correctLabel: string,
  field: ExamField
): UserProgress => {
  const progress = loadProgress(examId);
  const isCorrect = selectedLabel === correctLabel;

  const record: AnswerRecord = {
    questionId,
    selectedLabel,
    isCorrect,
    answeredAt: Date.now(),
  };

  progress.totalAnswered += 1;
  if (isCorrect) progress.totalCorrect += 1;

  progress.fieldStats[field].answered += 1;
  if (isCorrect) progress.fieldStats[field].correct += 1;

  // 直近100件のみ保持
  progress.history = [record, ...progress.history].slice(0, 100);

  saveProgress(examId, progress);
  return progress;
};

/** 分野ごとの正答率を取得 */
export const getFieldAccuracy = (progress: UserProgress, field: ExamField): number => {
  const stats = progress.fieldStats[field];
  if (stats.answered === 0) return 0;
  return Math.round((stats.correct / stats.answered) * 100);
};

/** 最も苦手な分野を取得 */
export const getWeakestField = (progress: UserProgress): ExamField | null => {
  const fields: ExamField[] = ['strategy', 'management', 'technology'];
  let weakest: ExamField | null = null;
  let lowestAccuracy = 101;

  for (const field of fields) {
    const stats = progress.fieldStats[field];
    if (stats.answered < 1) continue;
    const accuracy = (stats.correct / stats.answered) * 100;
    if (accuracy < lowestAccuracy) {
      lowestAccuracy = accuracy;
      weakest = field;
    }
  }
  return weakest;
};
