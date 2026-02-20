---
publishDate: 2026-02-19
updateDate: 2026-02-19
title: '【技術解説】PDFシラバスをGeminiで構造化データへ。無限クイズ生成パイプラインの裏側'
excerpt: 'JSONで試験を再現する「Data Pipeline」の全貌。PDFパースからGemini 2.0 APIを使った問題生成までを技術的に解説。'
image: '~/data/post/app/dev-story-data/cover.jpg'
category: 'app'
knowledge:
  type: method
tags: ['Gemini', 'API', 'Node.js', '技術解説']
metadata:
  description: 'ITパスポートやFE/SG試験の公式PDFシラバスから、Gemini APIを活用して高品質なクイズデータを生成する自動化パイプラインの技術詳細です。'
---

## 課題：PDFはデータではない

公式のシラバスはPDFで配布されています。人間には読めますが、プログラムがそのままパースして構造を理解するには、非常に「ノイジー」で扱いづらいフォーマットです。

### 解決策：座標ベースの再構成パイプライン

この課題を解決するため、以下のプロセスを自動化するCLIツール（`extract-syllabus-v2.js`）を構築しました。

1.  **PDFから座標情報を保持しつつテキスト抽出**: `pdfjs-dist` を使用し、テキストのXY座標を元に行を再構成します。単なるテキスト抽出では崩れてしまう階層構造（大分類・中分類・キーワード）を維持するためです。
2.  **ノイズ除去**: ページ番号やコピーライト、ヘッダーなどの「資格学習には不要な情報」を正規表現で自動的に排除します。
3.  **シラバス全体のマップ化**: 抽出したテキストを検索し、試験範囲のツリー構造にキーワードを紐付けた `syllabus.json` を生成します。

この「前処理」によって、初めてAI（Gemini）に「どのキーワードについて問えばいいのか」を正確に伝える基盤が整います。

## Gemini API (gemini-2.0-flash) の活用

抽出したキーワードを元に、Gemini API（モデル：`gemini-2.0-flash`）を使って「作問」を行います。
単に「問題を作って」というだけでは、本番試験のクオリティには届きません。

### キーワード補正の重要性

PDFから機械的に抽出したキーワードは、文字化けや改行による「ゴミ」が混じることがあります。
そのため、プロンプトには必ず **「キーワードが不自然な場合は適切な専門用語に修正して作問すること」** という指示を組み込んでいます。

### プロンプトエンジニアリング

以下のように、役割（作問プロフェッショナル）と制約事項、そして期待する出力フォーマットを明確に定義しています。

```javascript
const prompt = `
あなたは基本情報技術者試験(FE)の作問プロフェッショナルです。
以下のキーワードに関する、科目A対策の本番レベルの4択問題を作成してください。

キーワード: ${item.keyword}
分類: ${item.category} > ${item.middleCategory}

【重要：キーワードの補正について】
提供されたキーワードがPDF抽出由来でゴミが含まれていたり、文脈がおかしい場合は、
適切な専門用語に修正して作問してください。

【要件】
1. セキュリティ実務に即した、実用的な知識を問う内容にすること。
2. 初学者でも「なぜそれが正解か」がわかる丁寧な解説を含めること。
... (中略) ...
`;
```

## JSONスキーマと品質管理

生成されたデータはJSON形式で保存されます。
アプリ側での処理を容易にするため、`responseMimeType: 'application/json'` を設定し、AIに直接構造化データを返させています。

```javascript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: { responseMimeType: 'application/json' },
});
```

また、既に生成済みのキーワードを `Set` で管理し、重複して生成しないようにフィルタリングするロジックも実装されています。

## ソースコード公開（コアロジック）

実際の `generate-quiz-fe.js` スクリプトの中から、Geminiを呼び出してデータを保存する中核部分を解説します。

````javascript
// 未生成のキーワードをランダムに選択してループ
for (const item of sample) {
  try {
    const response = await callGemini(prompt);
    const jsonText = response
      .text()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    const generatedData = JSON.parse(jsonText);

    if (generatedData && generatedData.question) {
      // メタ情報を付与
      generatedData.keyword = item.keyword;
      generatedData.examId = 'fe';

      // 既存のリストに追加して保存
      existingQuestions.push(generatedData);
      fs.writeFileSync(outputFile, JSON.stringify(existingQuestions, null, 2), 'utf8');
      console.log(`✅ Success: ${item.keyword}`);
    }
  } catch (err) {
    console.error(`❌ Error [${item.keyword}]:`, err.message);
  }
  // APIへの負荷軽減のため2秒待機
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
````

この「自動生成パイプライン」により、人間が数ヶ月かけて作成する数百問のデータを、わずか数時間で、かつ高い解説クオリティで整備することが可能になりました。

コードを真似る必要はありません。作りたい物を想像出来ているなら、それをAIに伝えて作ってもらいましょう。
