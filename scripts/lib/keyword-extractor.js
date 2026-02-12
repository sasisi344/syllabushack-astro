/**
 * keyword-extractor.js
 * シラバステキストから用語例・活用例のキーワードを抽出する
 * 
 * 方針:
 * 1. 括弧内の英語表記はキーワードとして保持
 * 2. 活用例セクションからも抽出する
 * 3. ノイズ文（説明文・目標文等）を除外
 */

// 用語例/活用例 に続くキーワード行を検出するための状態管理
const KEYWORD_START_MARKERS = ['用語例', '活用例'];

// キーワードとして除外するパターン
const EXCLUDE_PATTERNS = [
  /^[\d\s.]+$/,                  // 数字/空白のみ
  /^[（(]?\d+[)）]$/,            // (1) ① 等のセクション番号
  /^[①-⑳⑴-⒇]$/,               // 丸数字
  /を理解する/,                    // 説明文
  /を修得する/,
  /のあらまし/,
  /を知る$/,
  /すること$/,
  /することを/,
  /を適用する/,
  /できるよう/,
  /に適用する$/,
  /理解し$/,
  /^【.+】$/,                     // 【目標】等
  /^➢/,                          // 箇条書きマーカー
  /^✓/,
  /^大分類/,
  /^中分類/,
  /^小分類/,
  /\.{3,}\s*\d+$/,               // 目次参照 "... 15"
  /を使った/,                      // 活用例の文
  /による/,                        // 活用例の文（長い記述）
  /を活用した/,
  /のための/,
  /に関する/,
  /における/,
  /を題材/,
  /に惑わされ/,
  /の事例/,
  /に応じた/,
];

/**
 * テキスト全体から「用語例」「活用例」セクションのキーワードを
 * 中分類に紐づけて抽出する
 * 
 * @param {string} text - 結合されたテキスト全体
 * @param {Array} masterSyllabus - syllabus.json の配列
 * @returns {Map<string, Set<string>>} key: 中分類名, value: キーワードSet
 */
export function extractKeywords(text, masterSyllabus) {
  // 前処理: PDFの文字間スペースを除去
  text = cleanPdfText(text);
  
  const lines = text.split('\n');
  const result = new Map(); // middleCategoryName -> Set of keywords

  // 中分類名のリストを作成（マッチング用）
  const middleCategoryNames = [];
  for (const field of masterSyllabus) {
    for (const lc of field.large_categories) {
      for (const mc of lc.middle_categories) {
        middleCategoryNames.push({
          id: mc.id,
          name: mc.name,
          fieldName: field.name,
          largeCatName: lc.name,
        });
      }
    }
  }

  let currentMiddleCategory = null;
  let isInKeywordSection = false;
  let keywordBuffer = '';    // 行をまたぐ用語例を結合するバッファ

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      // 空行 → キーワードセクション終了、バッファをフラッシュ
      if (isInKeywordSection && keywordBuffer) {
        flushKeywordBuffer(keywordBuffer, currentMiddleCategory, result);
        keywordBuffer = '';
      }
      isInKeywordSection = false;
      continue;
    }

    // 目次行（ドットリーダー付き）はスキップ
    if (/\.{3,}/.test(trimmed) || /…{2,}/.test(trimmed)) {
      continue;
    }

    // 中分類ヘッダの検出
    const mcMatch = detectMiddleCategory(trimmed, middleCategoryNames);
    if (mcMatch) {
      // バッファをフラッシュ
      if (isInKeywordSection && keywordBuffer) {
        flushKeywordBuffer(keywordBuffer, currentMiddleCategory, result);
        keywordBuffer = '';
      }
      currentMiddleCategory = mcMatch;
      isInKeywordSection = false;
      continue;
    }

    // 用語例/活用例 マーカーの検出
    const markerIdx = KEYWORD_START_MARKERS.findIndex(m => trimmed.includes(m));
    if (markerIdx !== -1) {
      // 前のバッファをフラッシュ
      if (keywordBuffer) {
        flushKeywordBuffer(keywordBuffer, currentMiddleCategory, result);
      }

      isInKeywordSection = true;
      // マーカー以降のテキストをバッファに入れる
      const marker = KEYWORD_START_MARKERS[markerIdx];
      const afterMarker = trimmed.substring(trimmed.indexOf(marker) + marker.length).trim();
      keywordBuffer = afterMarker;
      continue;
    }

    // キーワードセクション内の継続行
    if (isInKeywordSection && currentMiddleCategory) {
      // セクション番号行や目標行が来たらキーワードセクション終了
      if (isNewSection(trimmed)) {
        flushKeywordBuffer(keywordBuffer, currentMiddleCategory, result);
        keywordBuffer = '';
        isInKeywordSection = false;
      } else {
        // 行を結合（改行で途切れた用語を再接続）
        keywordBuffer += trimmed;
      }
    }
  }

  // 最後のバッファをフラッシュ
  if (isInKeywordSection && keywordBuffer && currentMiddleCategory) {
    flushKeywordBuffer(keywordBuffer, currentMiddleCategory, result);
  }

  return result;
}

/**
 * 中分類ヘッダを検出する
 * 
 * 実際のパターン例:
 *   IP: "大分類1：企業と法務中分類1：企業活動"  (スペースなし)
 *   FE: "大分類9：企業と法務 中分類23：法務"    (スペースあり)
 *   IP: "中分類1：企業活動"                     (単体)
 * 
 * 注意: TOC行 "中分類1：企業活動.......4" はdotリーダーで既にスキップ済み
 */
function detectMiddleCategory(line, middleCategoryNames) {
  // パターン1: "大分類N：XXX中分類M：YYY" (スペースなしもあり)
  const fullPattern = /大分類\s*\d+\s*[：:]\s*.+?中分類\s*(\d+)\s*[：:]\s*(.+)/;
  const fullMatch = line.match(fullPattern);
  if (fullMatch) {
    const mcId = fullMatch[1];
    let mcName = fullMatch[2].trim();
    // 末尾のページ番号等を除去
    mcName = mcName.replace(/\s*\d+\s*$/, '');
    const found = middleCategoryNames.find(mc => mc.id === mcId || mc.name === mcName);
    return found || { id: mcId, name: mcName };
  }

  // パターン2: "中分類N：YYY" (行頭)
  const simplePattern = /^中分類\s*(\d+)\s*[：:]\s*(.+)/;
  const simpleMatch = line.match(simplePattern);
  if (simpleMatch) {
    const mcId = simpleMatch[1];
    let mcName = simpleMatch[2].trim();
    mcName = mcName.replace(/\s*\d+\s*$/, '');
    const found = middleCategoryNames.find(mc => mc.id === mcId || mc.name === mcName);
    return found || null;
  }

  return null;
}

/**
 * 新しいセクション開始行かどうかを判定
 * （キーワードセクション終了の判断に使用）
 */
function isNewSection(line) {
  // （N）パターン
  if (/^[（(]\d+[)）]/.test(line)) return true;
  // ① ② パターン
  if (/^[①-⑳]/.test(line)) return true;
  // （a）パターン
  if (/^[（(][a-z][)）]/.test(line)) return true;
  // 「N. タイトル」パターン（大項目）- IPは "N.タイトル" スペースなしの場合も
  if (/^\d+\.\s/.test(line) || /^\d+\.[\u3000-\u9FFF]/.test(line)) return true;
  // 【目標】等
  if (/^【/.test(line)) return true;
  // ・で始まる説明行
  if (/^・/.test(line)) return true;
  // 大分類、中分類ヘッダ
  if (/^大分類/.test(line)) return true;
  return false;
}

/**
 * キーワードバッファからキーワードを分割・クリーニングして結果に追加
 */
function flushKeywordBuffer(buffer, middleCategory, result) {
  if (!buffer || !middleCategory) return;

  const keywords = parseKeywords(buffer);
  if (keywords.length === 0) return;

  const mapKey = middleCategory.name;
  if (!result.has(mapKey)) {
    result.set(mapKey, new Set());
  }
  const set = result.get(mapKey);
  for (const kw of keywords) {
    set.add(kw);
  }
}

/**
 * カンマ・中黒区切りのキーワード文字列をパースする
 * 
 * 入力例: "PDCA，OODAループ，BCP（Business Continuity Plan：事業継続計画），BCM"
 * 出力例: ["PDCA", "OODAループ", "BCP（Business Continuity Plan：事業継続計画）", "BCM"]
 *
 * 方針: 括弧内の英語表記は保持する
 */
function parseKeywords(text) {
  if (!text || !text.trim()) return [];

  const keywords = [];
  
  // まず全角カンマ・読点・中黒で分割（ただし括弧内のカンマは保護）
  const parts = smartSplit(text);

  for (let part of parts) {
    part = part.trim();
    
    // 除外パターンチェック
    if (shouldExclude(part)) continue;

    // 長すぎる文字列は説明文の可能性が高い → スキップ
    if (part.length > 60) continue;
    
    // 短すぎるものもスキップ
    if (part.length < 2) continue;

    keywords.push(part);
  }

  return keywords;
}

/**
 * カンマ区切りで分割するが、括弧内のカンマは無視する
 * 例: "BCP（Business Continuity Plan），BCM" → ["BCP（Business Continuity Plan）", "BCM"]
 */
function smartSplit(text) {
  const parts = [];
  let current = '';
  let depth = 0; // 括弧のネスト深さ

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    
    if (ch === '（' || ch === '(') {
      depth++;
      current += ch;
    } else if (ch === '）' || ch === ')') {
      depth = Math.max(0, depth - 1);
      current += ch;
    } else if (depth === 0 && (ch === '，' || ch === '、' || ch === ',' || ch === '・')) {
      // 区切り文字 → パート分割
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = '';
    } else {
      current += ch;
    }
  }
  
  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

/**
 * 除外すべきキーワードかどうかを判定
 */
function shouldExclude(text) {
  if (!text) return true;
  // 短い一般的な単語を除外（1-2文字のひらがな/漢字のみ）
  if (text.length <= 2 && /^[\u3040-\u309F\u4E00-\u9FFF]+$/.test(text)) return true;
  return EXCLUDE_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * PDFから抽出したテキストのクリーニング
 * - 日本語文字間の不要なスペースを除去
 *   例: "パ ー パ ス 経 営" → "パーパス経営"
 *   例: "株 主 総 会" → "株主総会"
 */
function cleanPdfText(text) {
  // 日本語文字（全角文字）間の半角スペース・タブを除去
  // 注意: \s+ だと改行にもマッチして行が結合されるので [ \t]+ を使う
  // 隣接するマッチが重なるので繰り返しで適用する
  const jpChar = '[\\u3000-\\u303F\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FFF\\uFF00-\\uFFEF]';
  const pattern = new RegExp(`(${jpChar})[ \\t]+(${jpChar})`, 'g');
  let prev;
  do {
    prev = text;
    text = text.replace(pattern, '$1$2');
  } while (text !== prev);
  return text;
}
