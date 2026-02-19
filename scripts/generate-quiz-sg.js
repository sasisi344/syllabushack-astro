import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { parseArgs } from 'util';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MASTER_DIR = path.join(PROJECT_ROOT, 'src/data/master');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src/data/quiz/sg'); // SG用フォルダ

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';

const CATEGORY_MAP = {
  strategy: { name: 'ストラテジ系', filename: 'strategy.json' },
  management: { name: 'マネジメント系', filename: 'management.json' },
  technology: { name: 'テクノロジ系', filename: 'technology.json' },
};

async function callGemini(prompt) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    generationConfig: { responseMimeType: 'application/json' },
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
      category: { type: 'string', alias: 'C' },
      count: { type: 'string', alias: 'n' },
      keyword: { type: 'string', alias: 'k' },
    },
  });

  const categoryArg = values.category;
  const countArg = values.count;
  const keywordArg = values.keyword;

  if (!categoryArg || !CATEGORY_MAP[categoryArg]) {
    console.error('Error: Please specify a valid category (--category [strategy|management|technology])');
    process.exit(1);
  }

  const targetCategory = CATEGORY_MAP[categoryArg];
  const numToGenerate = countArg ? parseInt(countArg, 10) : 5;
  const filterRegex = keywordArg ? new RegExp(keywordArg, 'i') : null;

  const outputFile = path.join(OUTPUT_DIR, targetCategory.filename);
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`🚀 SG (Security Management) Quiz Generator (${MODEL})`);
  console.log(`Target: ${targetCategory.name} (${numToGenerate} questions)`);
  if (filterRegex) console.log(`Filter: ${filterRegex}`);
  console.log(`Output: ${outputFile}`);

  // シラバスデータの読み込み
  const syllabusPath = path.join(MASTER_DIR, 'syllabus-sg.json');
  const syllabusData = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));

  let allKeywords = [];
  if (syllabusData.categories) {
    syllabusData.categories.forEach((cat) => {
      // idで判定する方が安全 (NFC/NFD問題回避)
      if (cat.id !== categoryArg) return;

      cat.large_categories.forEach((lCat) => {
        lCat.middle_categories.forEach((mCat) => {
          mCat.keywords.forEach((kw) => {
            const keywordText = typeof kw === 'string' ? kw : kw.keyword;
            if (filterRegex && !filterRegex.test(keywordText)) return;

            allKeywords.push({
              category: cat.name,
              middleCategory: mCat.name,
              keyword: keywordText,
              syllabusRef: mCat.id,
            });
          });
        });
      });
    });
  }

  // Fallback for Technology category if keywords are missing
  if (categoryArg === 'technology' && allKeywords.length === 0) {
    console.log('⚠️ Technology keywords missing from syllabus. Using fallback list.');
    const TECH_KEYWORDS_FALLBACK = [
      'ISMS(JIS Q 27001)',
      'CIA(機密性・完全性・可用性)',
      'リスクマネジメント',
      'マルウェア(ランサムウェア等)',
      'フィッシング詐欺',
      'ソーシャルエンジニアリング',
      'DoS/DDoS攻撃',
      'SQLインジェクション',
      'XSS(クロスサイトスクリプティング)',
      'ファイアウォール',
      'WAF',
      'IDS/IPS',
      'VPN',
      '暗号技術(共通鍵/公開鍵)',
      'デジタル署名',
      'PKI(公開鍵基盤)',
      '認証(多要素/生体)',
      'CSIRT',
      'IoTセキュリティ',
      'クラウドセキュリティ',
    ];
    TECH_KEYWORDS_FALLBACK.forEach((kw) => {
      allKeywords.push({
        category: 'テクノロジ系',
        middleCategory: 'セキュリティ',
        keyword: kw,
        syllabusRef: '23',
      });
    });
  }

  console.log(`📖 候補キーワード数: ${allKeywords.length}語`);

  let existingQuestions = [];
  if (fs.existsSync(outputFile)) {
    try {
      existingQuestions = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    } catch (e) {}
  }

  const existingKeywords = new Set(existingQuestions.map((q) => q.keyword));
  const targetKeywords = allKeywords.filter((k) => !existingKeywords.has(k.keyword));
  console.log(`🎯 未生成ターゲット: ${targetKeywords.length} 個`);

  if (targetKeywords.length === 0) {
    console.log('✨ 全キーワード生成済みです！');
    process.exit(0);
  }

  const sample = targetKeywords.sort(() => 0.5 - Math.random()).slice(0, numToGenerate);

  for (const item of sample) {
    console.log(`🌀 生成中: [${item.keyword}]...`);

    const prompt = `
あなたは情報セキュリティマネジメント試験(SG)の作問プロフェッショナルです。
以下のキーワードに関する、科目A対策の本番レベルの4択問題を作成してください。

キーワード: ${item.keyword}
分類: ${item.category} > ${item.middleCategory} (シラバス番号: ${item.syllabusRef})

【重要：キーワードの補正について】
提供されたキーワードがPDF抽出由来でゴミが含まれていたり、文脈がおかしい場合は、適切な専門用語に修正して作問してください。

【要件】
1. セキュリティ実務に即した、実用的な知識を問う内容にすること。
2. 初学者でも「なぜそれが正解か」がわかる丁寧な解説を含めること。
3. 出力は以下のJSON形式のみ（Markdownコードブロック不要）。

{
  "question": "問題文",
  "options": [
    "ア: 選択肢",
    "イ: 選択肢",
    "ウ: 選択肢",
    "エ: 選択肢"
  ],
  "answer": "ア",
  "explanation": "解説文...",
  "id": "sg-${Date.now()}"
}
`;

    try {
      const response = await callGemini(prompt);
      if (response.error) throw new Error(response.error.message);

      const text = response.text();
      const jsonText = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();
      const generatedData = JSON.parse(jsonText);

      if (generatedData && generatedData.question) {
        generatedData.keyword = item.keyword;
        generatedData.category = item.category;
        generatedData.field = categoryArg;
        generatedData.examId = 'sg';
        generatedData.middleCategory = item.middleCategory;
        generatedData.syllabusRef = item.syllabusRef;

        existingQuestions.push(generatedData);
        fs.writeFileSync(outputFile, JSON.stringify(existingQuestions, null, 2), 'utf8');
        console.log(`✅ Success: ${item.keyword}`);
      }
    } catch (err) {
      console.error(`❌ Error [${item.keyword}]:`, err.message);
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);
