import type { Question, Choice } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformRawQuestions(raw: any[]): Question[] {
  return raw.map((r) => {
    // Already transformed guard
    if (r.choices) return r;

    const choices: Choice[] = r.options.map((opt: string) => {
      // e.g. "ア: ディープフェイク" -> label: "ア", text: "ディープフェイク"
      const match = opt.match(/^([アイウエA-D]):\s*(.+)$/);
      if (match) {
        return { label: match[1], text: match[2] };
      }
      return { label: '?', text: opt };
    });

    return {
      id: r.id.toString(),
      category: r.category,
      middleCategory: r.middleCategory,
      question: r.question,
      choices,
      answer: r.answer,
      explanation: r.explanation,
      keyword: r.keyword,
      syllabusRef: r.syllabusRef,
      role: r.role || 'general',
      difficulty: r.difficulty || 'beginner',
    };
  });
}
