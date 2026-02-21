import type { Question, Choice } from './types';

export function transformRawQuestions(raw: any[]): Question[] {
  return raw.map((r) => {
    const choices: Choice[] = r.options.map((opt: string) => {
      // "ア: ディープフェイク" -> label: "ア", text: "ディープフェイク"
      const [label, ...textParts] = opt.split(': ');
      return {
        label: label.trim(),
        text: textParts.join(': ').trim(),
      };
    });

    return {
      id: r.id.toString(),
      category: r.category,
      scenario: r.scenario,
      question: r.question,
      choices,
      answer: r.answer,
      explanation: r.explanation,
    };
  });
}
