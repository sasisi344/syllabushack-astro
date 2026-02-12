import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src/data/quiz/sg');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'practical.json');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';

const THEMES = [
  "標的型攻撃メールへの組織的対応",
  "テレワーク環境におけるVPNと端末管理",
  "クラウドストレージの公開設定ミスと機密情報漏えい",
  "内部関係者による顧客情報の不正持ち出し",
  "ランサムウェア感染後の初動対応とバックアップ活用",
  "委託先企業のセキュリティ監査と是正指示",
  "退職者のアカウント削除漏れによる不正アクセス",
  "個人所有PC（BYOD）の業務利用におけるリスク管理",
  "Webサイト改ざんの発見と対外公表の判断",
  "物理セキュリティ（入退室管理）の不備と盗難"
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
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let existingQuestions = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingQuestions = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
    } catch (e) {}
  }

  console.log(`🚀 SG Subject B (科目B) Case Study Generator`);
  
  const selectedThemes = THEMES.sort(() => 0.5 - Math.random()).slice(0, 5);

  for (const theme of selectedThemes) {
    console.log(`🌀 Generating Case Study: [${theme}]...`);

    const prompt = `
あなたは情報セキュリティマネジメント試験(SG)の専門家です。
科目B（旧午後試験レベル）のケーススタディ形式の問題を1問作成してください。

【テーマ】
${theme}

【要件】
1. シナリオ(scenario): 
   - A社などの架空組織を舞台にする。
   - 登場人物（情報セキュリティ責任者、情報システム部員など）を出す。
   - セキュリティ上の問題が発生、または改善が必要な状況を10〜15行程度の文章で記述する。
2. 問題文(question): 
   - シナリオを踏まえ、適切な対応や判断、リスク分析について問う。
3. 選択肢(options): 
   - ア〜エの4択。
4. 解説(explanation): 
   - 初学者でも「なぜこれが正解/不正解か」が納得できる、実務的な観点を含む丁寧な解説。

【出力形式】
JSON形式のみ。Markdown不可。

{
  "scenario": "シナリオ文...",
  "question": "問題文...",
  "options": ["ア: ...", "イ: ...", "ウ: ...", "エ: ..."],
  "answer": "正解ラベル (ア〜エ)",
  "explanation": "解説文...",
  "id": "sg-b-${Date.now()}"
}
`;

    try {
      const response = await callGemini(prompt);
      if (response.error) throw new Error(response.error.message);

      const text = response.text();
      const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const generatedData = JSON.parse(jsonText);

      if (generatedData && generatedData.scenario) {
        generatedData.field = 'practical';
        generatedData.examId = 'sg';
        generatedData.theme = theme;
        generatedData.difficulty = 'intermediate';
        
        // fields compatible with Question type
        generatedData.text = generatedData.question;
        generatedData.choices = generatedData.options.map((opt) => {
          const [label, ...textParts] = opt.split(':');
          return { label: label.trim(), text: textParts.join(':').trim() };
        });
        generatedData.correctLabel = generatedData.answer;

        existingQuestions.push(generatedData);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(existingQuestions, null, 2), 'utf8');
        console.log(`✅ Success: ${theme}`);
      }
    } catch (err) {
      console.error(`❌ Error [${theme}]:`, err.message);
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);
