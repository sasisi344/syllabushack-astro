/**
 * syllabus-builder.js
 * 抽出されたキーワードをマスターシラバス構造に統合してJSONを生成する
 */
import fs from 'fs';

/**
 * 抽出結果からシラバスJSONを構築する
 * 
 * @param {Object} options
 * @param {string} options.examId - 試験ID ('ip' | 'fe')
 * @param {string} options.version - シラバスバージョン
 * @param {Array} options.masterSyllabus - syllabus.json のマスターデータ
 * @param {Map<string, Set<string>>} options.keywords - 中分類名→キーワードSet
 * @param {string} options.outputPath - 出力JSONファイルパス
 */
export function buildSyllabusJson({ examId, version, masterSyllabus, keywords, outputPath }) {
  const syllabusData = {
    examId,
    version,
    categories: masterSyllabus.map(field => ({
      id: field.id,
      name: field.name,
      large_categories: field.large_categories.map(lc => ({
        id: lc.id,
        name: lc.name,
        middle_categories: lc.middle_categories.map(mc => {
          const kwSet = keywords.get(mc.name);
          const kwArray = kwSet ? [...kwSet].sort() : [];
          return {
            id: mc.id,
            name: mc.name,
            keywords: kwArray,
          };
        }),
      })),
    })),
  };

  // 統計情報
  const stats = collectStats(syllabusData, keywords);

  // JSON出力
  fs.writeFileSync(outputPath, JSON.stringify(syllabusData, null, 2), 'utf8');

  return { syllabusData, stats };
}

/**
 * 統計情報を収集する
 */
function collectStats(syllabusData, keywords) {
  let totalKeywords = 0;
  let categoriesWithKeywords = 0;
  let categoriesWithoutKeywords = 0;
  const categoryBreakdown = [];

  for (const field of syllabusData.categories) {
    for (const lc of field.large_categories) {
      for (const mc of lc.middle_categories) {
        const count = mc.keywords.length;
        totalKeywords += count;
        if (count > 0) {
          categoriesWithKeywords++;
        } else {
          categoriesWithoutKeywords++;
        }
        categoryBreakdown.push({
          path: `${field.name} > ${lc.name} > ${mc.name}`,
          id: mc.id,
          count,
        });
      }
    }
  }

  // キーワードMap に含まれるがマスターにマッチしなかったカテゴリ
  const unmatchedCategories = [];
  for (const [name, kwSet] of keywords) {
    const found = categoryBreakdown.some(cb => cb.path.includes(name));
    if (!found) {
      unmatchedCategories.push({ name, count: kwSet.size });
    }
  }

  return {
    totalKeywords,
    categoriesWithKeywords,
    categoriesWithoutKeywords,
    totalCategories: categoriesWithKeywords + categoriesWithoutKeywords,
    unmatchedCategories,
    categoryBreakdown,
  };
}

/**
 * 統計をコンソールに出力する
 */
export function printStats(examId, stats) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 抽出結果サマリー: ${examId.toUpperCase()}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`  総キーワード数:       ${stats.totalKeywords}`);
  console.log(`  キーワードあり中分類: ${stats.categoriesWithKeywords}/${stats.totalCategories}`);
  console.log(`  キーワードなし中分類: ${stats.categoriesWithoutKeywords}/${stats.totalCategories}`);

  if (stats.unmatchedCategories.length > 0) {
    console.log(`\n⚠️  マスターにマッチしなかったカテゴリ:`);
    for (const uc of stats.unmatchedCategories) {
      console.log(`    - ${uc.name} (${uc.count} keywords)`);
    }
  }

  console.log(`\n📋 カテゴリ別内訳:`);
  for (const cb of stats.categoryBreakdown) {
    const bar = '█'.repeat(Math.min(Math.floor(cb.count / 3), 30));
    const status = cb.count > 0 ? '✅' : '❌';
    console.log(`  ${status} [${cb.id.padStart(2)}] ${cb.path}: ${cb.count} ${bar}`);
  }
  console.log();
}
