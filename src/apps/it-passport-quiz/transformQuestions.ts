import type { Question } from './types';

/**
 * Raw JSON データを Question 型に変換するユーティリティ
 * MDX内でのインライン変換はMDXパーサーとの互換性問題があるため、
 * このファイルに分離して管理する
 */
export function transformRawQuestions(rawQuestions: any[]): Question[] {
  return rawQuestions.map((q) => {
    // すでに正規化されている場合のガード
    if (q.choices && q.correctLabel) return q;

    // 生成データの変換
    return {
      id: q.id,
      examId: 'ip',
      field: q.field || 'strategy',
      text: q.question || q.text,
      middleCategory: q.middleCategory || '',
      choices: Array.isArray(q.options)
        ? q.options.map((opt: string) => {
            const match = opt.match(/^([アイウエ]):\s*(.+)$/);
            if (match) {
              return { label: match[1], text: match[2] };
            }
            return { label: '?', text: opt };
          })
        : q.choices,
      correctLabel: q.answer || q.correctLabel,
      explanation: q.explanation,
      keyword: q.keyword,
      syllabusRef: q.syllabusRef,
      difficulty: 'beginner',
    };
  });
}
