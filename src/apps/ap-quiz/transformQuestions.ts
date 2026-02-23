import type { Question, Choice, ExamId, ExamField } from './types';

interface RawQuestion {
  id?: string;
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
  field?: string;
  middleCategory?: string;
  syllabusRef?: string;
  keyword?: string;
}

export function transformRawQuestions(raw: RawQuestion[]): Question[] {
  return raw.map((q, index) => {
    const choices: Choice[] = (q.options || []).map((opt: string) => {
      const match = opt.match(/^([ア-エ])[:：\s]*(.*)$/);
      return {
        label: match ? match[1] : opt[0] || "",
        text: match ? match[2] : opt.slice(1).trim()
      };
    });

    return {
      id: q.id || `ap-${index}`,
      examId: 'ap' as ExamId,
      field: (q.field || 'technology') as ExamField,
      text: q.question || "",
      choices: choices,
      correctLabel: q.answer || "",
      explanation: q.explanation || '解説は準備中です。',
      subField: q.middleCategory,
      syllabusRef: q.syllabusRef,
      difficulty: 'intermediate',
      keywords: q.keyword ? [q.keyword] : []
    };
  });
}
