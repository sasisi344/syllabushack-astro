/**
 * pdf-text-extractor.js
 * PDF からテキストをページ単位で抽出するヘルパー
 * pdfjs-dist を使用し、テキストアイテムの座標情報を活用して
 * 行の再構成を行う
 */
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// ノイズパターン（ページ番号、コピーライト等）
const NOISE_PATTERNS = [
  /^-\d+-$/,                                          // -48- 形式のページ番号
  /^Copyright\(c\)/i,                                 // Copyright行
  /Information-technology Promotion Agency/i,          // IPA名
  /All rights reserved/i,                             // 権利表記
  /^\d+$/,                                            // 数字だけの行（ページ番号）
];

/**
 * PDFファイルからテキストをページ単位で抽出する
 * @param {string} pdfPath - PDFファイルのパス
 * @returns {Promise<{pages: Array<{pageNum: number, text: string}>, totalPages: number}>}
 */
export async function extractTextFromPDF(pdfPath) {
  const doc = await pdfjsLib.getDocument(pdfPath).promise;
  const totalPages = doc.numPages;
  const pages = [];

  for (let i = 1; i <= totalPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    
    // テキストアイテムをY座標でグループ化して行を再構成
    const lines = reconstructLines(textContent.items);
    
    // ノイズ除去
    const cleanLines = lines.filter(line => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      return !NOISE_PATTERNS.some(pattern => pattern.test(trimmed));
    });

    pages.push({
      pageNum: i,
      text: cleanLines.join('\n'),
      rawLines: cleanLines,
    });
  }

  await doc.destroy();
  return { pages, totalPages };
}

/**
 * テキストアイテムをY座標でグループ化し、行を再構成する
 * PDF の textContent.items は個々のテキストフラグメントなので、
 * 同じY座標にあるものを結合して1行にする
 */
function reconstructLines(items) {
  if (!items || items.length === 0) return [];

  // Y座標でグループ化（閾値: 2pt以内を同じ行とみなす）
  const Y_THRESHOLD = 2;
  const groups = [];
  let currentGroup = null;

  // Y座標の降順（ページ上部が大きい）→昇順でソート
  const sorted = [...items]
    .filter(item => item.str && item.str.trim())
    .sort((a, b) => {
      const yDiff = b.transform[5] - a.transform[5]; // Y座標降順（上から下）
      if (Math.abs(yDiff) > Y_THRESHOLD) return yDiff;
      return a.transform[4] - b.transform[4]; // 同じ行ならX座標昇順（左から右）
    });

  for (const item of sorted) {
    const y = item.transform[5];
    
    if (!currentGroup || Math.abs(currentGroup.y - y) > Y_THRESHOLD) {
      currentGroup = { y, items: [] };
      groups.push(currentGroup);
    }
    currentGroup.items.push(item);
  }

  // 各グループのアイテムをX座標順に結合
  return groups.map(group => {
    group.items.sort((a, b) => a.transform[4] - b.transform[4]);
    return group.items.map(item => item.str).join('');
  });
}

/**
 * 全ページのテキストを結合して1つの文字列にする
 */
export function combinePages(pages) {
  return pages.map(p => p.text).join('\n');
}
