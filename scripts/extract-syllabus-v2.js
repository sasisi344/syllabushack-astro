/**
 * extract-syllabus-v2.js
 * 
 * IPAシラバスPDFからキーワードを抽出し、JSON形式で出力するスクリプト v2
 * 
 * 改善点（v1からの変更）:
 * - pdf-parse → pdfjs-dist による座標ベースの行再構成
 * - 括弧内英語表記をキーワードとして保持
 * - 活用例セクションからも抽出
 * - IP/FE 両対応
 * - 統計情報の出力
 * 
 * 使い方:
 *   node scripts/extract-syllabus-v2.js          # IP + FE 両方
 *   node scripts/extract-syllabus-v2.js --ip     # IPのみ
 *   node scripts/extract-syllabus-v2.js --fe     # FEのみ
 *   node scripts/extract-syllabus-v2.js --debug  # デバッグモード
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTextFromPDF, combinePages } from './lib/pdf-text-extractor.js';
import { extractKeywords } from './lib/keyword-extractor.js';
import { buildSyllabusJson, printStats } from './lib/syllabus-builder.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ============================================================
// コンフィグ
// ============================================================
const CONFIG = {
  ip: {
    examId: 'ip',
    version: '6.5',
    pdfPath: path.resolve(
      PROJECT_ROOT,
      '.workspace/syllabus-data-pdf/IP/syllabus_ip_ver6_5-ITパスポート試験シラバス（情報処理技術者試験における知識・技能の細目）.pdf'
    ),
    outputPath: path.resolve(PROJECT_ROOT, 'src/data/master/syllabus-ip.json'),
    debugRawTextPath: path.resolve(PROJECT_ROOT, '.workspace/debug/ip_extracted_v2.txt'),
  },
  fe: {
    examId: 'fe',
    version: '9.2',
    pdfPath: path.resolve(
      PROJECT_ROOT,
      '.workspace/syllabus-data-pdf/FE/syllabus_fe_ver9_2.pdf'
    ),
    outputPath: path.resolve(PROJECT_ROOT, 'src/data/master/syllabus-fe.json'),
    debugRawTextPath: path.resolve(PROJECT_ROOT, '.workspace/debug/fe_extracted_v2.txt'),
  },
  sg: {
    examId: 'sg',
    version: '4.1',
    pdfPath: path.resolve(
      PROJECT_ROOT,
      '.workspace/syllabus-data-pdf/SG/syllabus_sg_ver4_1.pdf'
    ),
    outputPath: path.resolve(PROJECT_ROOT, 'src/data/master/syllabus-sg.json'),
    debugRawTextPath: path.resolve(PROJECT_ROOT, '.workspace/debug/sg_extracted_v2.txt'),
  }
};

const MASTER_SYLLABUS_PATH = path.resolve(PROJECT_ROOT, 'src/data/master/syllabus.json');

// ============================================================
// メイン処理
// ============================================================
async function main() {
  const args = process.argv.slice(2);
  const isDebug = args.includes('--debug');
  const runIpOnly = args.includes('--ip');
  const runFeOnly = args.includes('--fe');
  const runSgOnly = args.includes('--sg');
  const runAll = !runIpOnly && !runFeOnly && !runSgOnly;

  console.log('🚀 Syllabus Keyword Extractor v2');
  console.log(`   Debug mode: ${isDebug ? 'ON' : 'OFF'}`);
  console.log();

  // マスターシラバス読み込み
  if (!fs.existsSync(MASTER_SYLLABUS_PATH)) {
    console.error(`❌ Master syllabus not found: ${MASTER_SYLLABUS_PATH}`);
    process.exit(1);
  }
  const masterSyllabus = JSON.parse(fs.readFileSync(MASTER_SYLLABUS_PATH, 'utf8'));
  console.log(`📖 Master syllabus loaded (${countMiddleCategories(masterSyllabus)} middle categories)`);

  // 処理対象
  const targets = [];
  if (runAll || runIpOnly) targets.push(CONFIG.ip);
  if (runAll || runFeOnly) targets.push(CONFIG.fe);
  if (runAll || runSgOnly) targets.push(CONFIG.sg);

  for (const config of targets) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`📄 Processing: ${config.examId.toUpperCase()} (${config.pdfPath})`);
    console.log(`${'─'.repeat(60)}`);

    // 1. PDF存在チェック
    if (!fs.existsSync(config.pdfPath)) {
      console.error(`  ❌ PDF not found: ${config.pdfPath}`);
      continue;
    }

    // 2. テキスト抽出
    console.log('  📥 Extracting text from PDF...');
    const { pages, totalPages } = await extractTextFromPDF(config.pdfPath);
    const fullText = combinePages(pages);
    console.log(`  ✅ Extracted ${totalPages} pages, ${fullText.length} chars`);

    // デバッグ: 生テキスト保存
    if (isDebug) {
      const debugDir = path.dirname(config.debugRawTextPath);
      if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
      fs.writeFileSync(config.debugRawTextPath, fullText, 'utf8');
      console.log(`  🐛 Debug raw text saved to: ${config.debugRawTextPath}`);
    }

    // 3. キーワード抽出
    console.log('  🔑 Extracting keywords...');
    const keywords = extractKeywords(fullText, masterSyllabus);

    // デバッグ: キーワードの詳細出力
    if (isDebug) {
      const debugKeywordsPath = config.debugRawTextPath.replace('_v2.txt', '_keywords_v2.json');
      const kwObj = {};
      for (const [name, kwSet] of keywords) {
        kwObj[name] = [...kwSet].sort();
      }
      fs.writeFileSync(debugKeywordsPath, JSON.stringify(kwObj, null, 2), 'utf8');
      console.log(`  🐛 Debug keywords saved to: ${debugKeywordsPath}`);
    }

    // 4. JSON生成・出力
    console.log(`  📝 Building syllabus JSON → ${config.outputPath}`);
    const { stats } = buildSyllabusJson({
      examId: config.examId,
      version: config.version,
      masterSyllabus,
      keywords,
      outputPath: config.outputPath,
    });

    // 5. 統計出力
    printStats(config.examId, stats);
  }

  console.log('🎉 All done!');
}

function countMiddleCategories(masterSyllabus) {
  let count = 0;
  for (const field of masterSyllabus) {
    for (const lc of field.large_categories) {
      count += lc.middle_categories.length;
    }
  }
  return count;
}

// 実行
main().catch(err => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
