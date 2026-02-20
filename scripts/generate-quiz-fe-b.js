import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

import { parseArgs } from 'util';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src/data/quiz/fe');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'practical.json');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';

const THEMES = [
  "基本的アルゴリズム：二分探索（Binary Search）",
  "基本的アルゴリズム：基本交換法（バブルソート）",
  "基本的アルゴリズム：基本選択法（選択ソート）",
  "基本的アルゴリズム：基本挿入法（挿入ソート）",
  "データ構造：スタック（push/pop操作）",
  "データ構造：キュー（enqueue/dequeue操作）",
  "データ構造：連結リストの挿入・削除",
  "データ構造：2分探索木の探索と追加",
  "再帰処理：階乗計算・フィボナッチ数列",
  "文字列処理：文字列のパターン照合",
  "計算量：オーダー記法とアルゴリズムの効率性",
  "情報セキュリティ：公開鍵暗号（RSA）の暗号化・復号プロセス",
  "情報セキュリティ：デジタル署名の付与と検証"
];

async function callGemini(prompt) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: MODEL,
    generationConfig: { responseMimeType: "application/json" }
  });

  try {
    const result = await model.generateContent(prompt);
    return result.response;
  } catch (error) {
    return { error };
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      count: { type: 'string', alias: 'n' },
    },
  });

  const countArg = values.count;
  const numToGenerate = countArg ? parseInt(countArg, 10) : 5;

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let existingQuestions = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingQuestions = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    } catch (e) {}
  }

  console.log(`🚀 FE Subject B (科目B) Algorithm Generator`);
  
  // 指定された数だけランダムに選択（重複を許容してシャッフル）
  const selectedThemes = [];
  for (let i = 0; i < numToGenerate; i++) {
    selectedThemes.push(THEMES[Math.floor(Math.random() * THEMES.length)]);
  }

  for (const theme of selectedThemes) {
    console.log(`🌀 Generating FE Algorithm Question: [${theme}]...`);

    const prompt = `
あなたは基本情報技術者試験(FE)の専門家です。
2023年以降の新形式「科目B」に基づいたアルゴリズム問題を1問作成してください。

【テーマ】
${theme}

【要件】
1. 擬似言語(Pseudo-language)の使用: 
   - 2023年以降のIPA公式公開問題と同等の表記法を使用すること。
   - 関数定義: 〇 関数名(型: 引数)
   - 代入: ←
   - 条件: もし ... ならば ... を実行する / そうでなければ ... 
   - 繰返し: を ... から ... まで 1 ずつ増やす間 / ... の間
   - 配列: 配列[添字] (0始まりか1始まりかを文中で明文化すること)
   - 論理演算: かつ, 又は, 否定
   - 【重要・翻訳禁止ルール】: コード内の「変数名(例: current, index)」や「予約語・真偽値(例: return, true, false)」などの英単語は、絶対に日本語に翻訳せず英語のまま出力すること。（「戻る」「真」「一時変数」などの不自然な直訳は禁止）

2. シナリオ(scenario): 
   - 処理の背景や目的、データの状態を説明する文章（5〜10行）。
   - コード内で使用される変数や配列の役割も記述する。

3. コードブロック: 
   - シナリオの中に、不完全な（穴埋め箇所の含まれる）コード、または正誤を判断させるコードを記述する。
   - 穴埋め箇所は「■」または「[ a ]」などで示す。

4. 問題文(question): 
   - 「空欄 [ a ] に入れるべき適切な式はどれか」や「関数実行後の変数xの値はいくつか」など。

5. 選択肢(options): 
   - ア〜エの4択。

6. 解説(explanation): 
   - トレースの手順（「i=1のとき...」など）を具体的に示し、正解の導出過程を詳しく書く。

【出力形式】
JSON形式のみ。

{
  "scenario": "シナリオ文とコードを含む...",
  "question": "問題文...",
  "options": ["ア: ...", "イ: ...", "ウ: ...", "エ: ..."],
  "answer": "正解ラベル (ア〜エ)",
  "explanation": "解説文...",
  "id": "fe-b-${Date.now()}"
}
`;

    try {
      const response = await callGemini(prompt);
      if (response.error) throw new Error(response.error.message);

      const text = response.text();
      const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedData = JSON.parse(jsonText);

      if (generatedData && generatedData.scenario) {
        generatedData.field = 'practical'; // FEの「科目B」も practical カテゴリとする
        generatedData.examId = 'fe';
        generatedData.theme = theme;
        generatedData.difficulty = 'intermediate';
        
        // fields compatible with QuizApp types
        generatedData.text = generatedData.question;
        generatedData.choices = generatedData.options.map((opt) => {
          const splitIdx = opt.indexOf(':');
          if (splitIdx === -1) return { label: '?', text: opt };
          const label = opt.substring(0, splitIdx);
          const text = opt.substring(splitIdx + 1);
          return { label: label.trim(), text: text.trim() };
        });
        generatedData.correctLabel = generatedData.answer;

        existingQuestions.push(generatedData);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingQuestions, null, 2), 'utf8');
        console.log(`✅ Success: ${theme}`);
      }
    } catch (err) {
      console.error(`❌ Error [${theme}]:`, err.message);
    }
    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}

main().catch(console.error);
