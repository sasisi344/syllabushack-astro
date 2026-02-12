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
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src/data/quiz/it-passport');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash'; // 2.5 is not stable yet

// カテゴリ定義
const CATEGORY_MAP = {
  strategy: { 
    name: 'ストラテジ系', 
    filename: 'strategy.json' 
  },
  management: { 
    name: 'マネジメント系', 
    filename: 'management.json' 
  },
  technology: { 
    name: 'テクノロジ系', 
    filename: 'technology.json' 
  },
  'generative-ai': { 
    name: '生成AI特化', 
    filename: 'generative-ai.json' 
  }
};

/**
 * Gemini API 呼び出し
 */
async function callGemini(prompt) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ 
    model: MODEL,
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  try {
    const result = await model.generateContent(prompt);
    return result.response;
  } catch (error) {
    return { error };
  }
}

/**
 * メイン処理
 */
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
    console.error('Error: Please specify a valid category (--category [strategy|management|technology|generative-ai])');
    console.error('Example: node scripts/generate-quiz.js --category generative-ai --count 50 --keyword "AI|生成|モデル"');
    process.exit(1);
  }

  const targetCategory = CATEGORY_MAP[categoryArg];
  const numToGenerate = countArg ? parseInt(countArg, 10) : 5;
  const filterRegex = keywordArg ? new RegExp(keywordArg, 'i') : null;
  
  const outputFile = path.join(OUTPUT_DIR, targetCategory.filename);
  console.log(`🚀 Syllabus Quiz Generator (${MODEL})`);
  console.log(`Target: ${targetCategory.name} (${numToGenerate} questions)`);
  if (filterRegex) console.log(`Filter: ${filterRegex}`);
  console.log(`Output: ${outputFile}`);

  // シラバスデータの読み込み
  const syllabusPath = path.join(MASTER_DIR, 'syllabus-ip.json');
  const syllabusData = JSON.parse(fs.readFileSync(syllabusPath, 'utf8'));

  // キーワード抽出
  let allKeywords = [];
  
  // 生成AI特化の場合は全分野対象だが、基本はターゲットカテゴリのみ
  const searchCategoryNames = categoryArg === 'generative-ai' 
    ? ['ストラテジ系', 'マネジメント系', 'テクノロジ系'] 
    : [targetCategory.name];

  if (syllabusData.categories) {
    syllabusData.categories.forEach(cat => {
      // カテゴリ名チェック
      if (!searchCategoryNames.includes(cat.name)) return;

      cat.large_categories.forEach(lCat => {
        lCat.middle_categories.forEach(mCat => {
          mCat.keywords.forEach(kw => {
            // 文字列の場合とオブジェクトの場合があるかも（syllabus-ip.jsonは文字列配列）
            const keywordText = typeof kw === 'string' ? kw : kw.keyword;
            
            // フィルタチェック
            if (filterRegex && !filterRegex.test(keywordText)) return;

            // 生成AIカテゴリでフィルタが無い場合、全件入ってしまうのを防ぐため、
            // 生成AIカテゴリ指定かつキーワード未指定の場合は警告を出して終了したほうがいいが、
            // 今回はとりあえず全件入る挙動にする（ただし生成AIならフィルタ必須推奨）
            
            allKeywords.push({
              category: cat.name,
              middleCategory: mCat.name,
              keyword: keywordText,
              syllabusRef: mCat.id // 文字列ID
            });
          });
        });
      });
    });
  }

  console.log(`📖 候補キーワード数: ${allKeywords.length}語`);

  // 既存データの読み込み
  let existingQuestions = [];
  if (fs.existsSync(outputFile)) {
    try {
      existingQuestions = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      console.log(`✅ 既存データ読み込み: ${existingQuestions.length}問`);
    } catch (e) {
      console.warn("⚠️ 既存データの読み込みに失敗しました（空として扱います）");
    }
  }

  // 既に生成済みのキーワードを除外するためのSet
  // 生成AIカテゴリの場合は、同じキーワードで複数回生成したいかもしれないが、
  // 一旦重複チェックを入れる（問題文の重複を防ぐため）
  const existingKeywords = new Set(existingQuestions.map(q => q.keyword));
  
  // 未生成のキーワードをフィルタリング
  const targetKeywords = allKeywords.filter(k => !existingKeywords.has(k.keyword));
  console.log(`🎯 未生成ターゲット: ${targetKeywords.length} 個`);

  if (targetKeywords.length === 0) {
    console.log("✨ 全キーワード生成済みです！");
    // 生成AIの場合は追加生成したいかもしれないので、強制終了せずに
    // ランダムサンプルするロジックに変えるのもありだが、今回は終了する
    process.exit(0);
  }

  // シャッフルして指定数だけ選択
  const sample = targetKeywords.sort(() => 0.5 - Math.random()).slice(0, numToGenerate);

  for (const item of sample) {
    console.log(`🌀 生成中: [${item.keyword}]...`);

    const prompt = `
あなたはITパスポート試験の作問プロフェッショナルです。
以下のキーワードに関する、本番レベルの4択問題を作成してください。

キーワード: ${item.keyword}
分類: ${item.category} > ${item.middleCategory} (シラバス番号: ${item.syllabusRef})

【重要：キーワードの補正について】
提供されたキーワードがPDF抽出由来で「1情報セキュリティ」のようにゴミが含まれていたり、文脈がおかしい場合は、
適切な専門用語（例：「情報セキュリティ」）に修正して作問してください。

【要件】
1. 初学者でも「なぜそれが正解か」がわかる丁寧な解説を含めること。
2. 誤答の選択肢も含め、それぞれ1行程度の簡潔な解説文を入れること。
3. 出力は以下のJSON形式のみ（Markdownコードブロック不要）。

{
  "question": "問題文（60文字程度）",
  "options": [
    "ア: 選択肢テキスト",
    "イ: 選択肢テキスト",
    "ウ: 選択肢テキスト",
    "エ: 選択肢テキスト"
  ],
  "answer": "ア",
  "explanation": "正解の解説文...（200文字程度）\\n\\n各選択肢の補足:\\nア: ...\\nイ: ...",
  "id": "ip-${Date.now()}"
}
`;

    try {
      const response = await callGemini(prompt);
      
      if (response.error) {
        throw new Error(`Gemini API Error: ${response.error.message}`);
      }

      // レスポンスの解析
      // SDKのレスポンスからテキストを取得
      let generatedData = null;
      try {
        const text = response.text();
        // JSONパース（たまにMarkdownブロックで囲まれることがあるので除去）
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        generatedData = JSON.parse(jsonText);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        console.error("Raw Text:", response.text());
        continue;
      }

      if (generatedData && generatedData.question) {
        // メタデータ付与
        generatedData.keyword = item.keyword;
        generatedData.category = item.category; // 日本語名 (ストラテジ系 etc)
        generatedData.field = categoryArg === 'generative-ai' ? 'technology' : categoryArg; // 生成AIは暫定でtechnology扱い（アプリロジック上は別フィールドにしたいかもしれないが）
        // アプリ側で 'generative-ai' フィールドを作るならここも修正必要
        if (categoryArg === 'generative-ai') {
             generatedData.field = 'generative-ai';
        }
        
        generatedData.middleCategory = item.middleCategory;
        generatedData.syllabusRef = item.syllabusRef;
        
        existingQuestions.push(generatedData);
        
        // 都度保存
        fs.writeFileSync(outputFile, JSON.stringify(existingQuestions, null, 2), 'utf8');
        console.log(`✅ Success: ${item.keyword}`);
      } else {
        console.error(`❌ Invalid Format: ${item.keyword}`);
      }

    } catch (err) {
      console.error(`❌ Error [${item.keyword}]:`, err.message);
    }
    
    // APIレートリミット対策（少し待機）
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

main().catch(console.error);
