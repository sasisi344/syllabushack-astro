import type { Flashcard, QuizQuestion, Syllabus } from './types';

/**
 * クイズ形式のJSONからフラッシュカード形式に変換する
 */
export function mapQuestionsToCards(questions: QuizQuestion[], examId: string): Flashcard[] {
  return questions.map((q, idx) => {
    // データ形式の正規化 (ITパスポートなどの形式差分を吸収)
    const questionText = q.question || q.text || '';
    const rawOptions = q.options || (q.choices && q.choices.map((c) => `${c.label}: ${c.text}`)) || [];
    const answerLabel = q.answer || q.correctLabel || '';
    const explanation = q.explanation || '';

    // 正解の選択肢を取得
    const correctOptionRaw = rawOptions.find((opt) => opt.startsWith(answerLabel));
    let term = correctOptionRaw ? correctOptionRaw.replace(/^[ア-エ][：:]\s*/, '') : 'Unknown Term';

    // 裏面（定義）の作成
    // 1. 疑問形を定義形に変換
    let definition = questionText
      .replace(/[はを](何というか|何と呼ぶか|どれか|最も適切なものはどれか|指すものはどれか|説明したものはどれか|として適切なものはどれか)[？?。]?$/, '。')
      .replace(/を説明したものは。$/, '。')
      .trim();
    
    // 用語と定義の逆転チェック
    // 正解（term）が長く、問題文（definition）が短い場合、問題文側が用語である可能性が高い
    // 例：Front="企業の経営理念..." Back="経営理念" ではなく、Front="経営理念" Back="企業の存在意義..." にしたい
    if (term.length > 20 && definition.length < term.length) {
      const temp = term;
      term = definition.replace(/。$/, '');
      definition = temp;
    }

    // 末尾が「。」でない、かつ空でないなら「。」を補完
    if (definition && !definition.endsWith('。')) {
      definition += '。';
    }

    // 2. 解説がある場合は、解説の冒頭を優先的に使う（用語の重複を避ける）
    if (explanation) {
      // 解説の最初の1文を取得（。で区切る）
      const firstSentence = explanation.split(/[。！]/)[0];
      // 解説が「用語は、～である」形式なら「～である」部分を抽出
      const extracted = firstSentence.replace(/^.*?は、/, '').replace(/です$/, '');
      if (extracted.length > 5) {
        definition = extracted + '。' + (explanation.length > extracted.length ? '（' + explanation.substring(0, 100) + '...）' : '');
      } else {
        definition = explanation;
      }
    }

    return {
      id: `${examId}-q-${idx}`,
      front: term,
      back: definition,
      category: q.middle_category || q.category || q.subField,
      examId: examId
    };
  });
}

/**
 * シラバスのキーワードリストからフラッシュカード形式に変換する
 * (現状は定義がないため、表面のみ、裏面はプレースホルダ)
 */
export function mapSyllabusToCards(syllabus: Syllabus): Flashcard[] {
  const cards: Flashcard[] = [];
  const examId = syllabus.examId;

  syllabus.categories.forEach((cat) => {
    cat.large_categories.forEach((lc) => {
      lc.middle_categories.forEach((mc) => {
        mc.keywords.forEach((kw: string, idx: number) => {
          cards.push({
            id: `${examId}-kw-${mc.id}-${idx}`,
            front: kw,
            back: `「${kw}」の公式定義は現在準備中です。シラバス：${mc.name}`,
            category: mc.name,
            examId: examId
          });
        });
      });
    });
  });

  return cards;
}
