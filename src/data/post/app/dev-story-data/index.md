---
publishDate: 2026-02-19
updateDate: 2026-02-19
title: '【技術解説】PDFシラバスをGeminiで構造化データへ。無限クイズ生成パイプラインの裏側'
excerpt: 'JSONで試験を再現する「Data Pipeline」の全貌。PDFパースからGemini 2.0 APIを使った問題生成までを技術的に解説。'
image: '~/data/post/app/dev-story-data/cover.jpg'
category: 'app'
tags: ['Gemini', 'API', 'Node.js', '技術解説']
metadata:
  description: 'ITパスポートやFE/SG試験の公式PDFシラバスから、Gemini APIを活用して高品質なクイズデータを生成する自動化パイプラインの技術詳細です。'
---

## 課題：PDFはデータではない

公式のシラバスはPDFで配布されています。人間には読めますが、アプリには最悪なフォーマットです。
このPDFから、いかにして「試験範囲の構造」を抽出するか？
Node.jsスクリプトによるPDF解析と、`syllabus.json` への構造化プロセスを紹介します。

## Gemini API (gemini-2.0-flash) の活用

抽出したキーワードを元に、Gemini APIを使って「作問」を行います。
単に「問題を作って」というだけでは駄目です。

- 科目A：知識問題（選択肢の生成ロジック）
- 科目B：長文シナリオ（ケーススタディ生成）
  プロンプトエンジニアリングの工夫と、APIレートリミットを考慮した一括生成スクリプトの実装詳細。

## JSONスキーマと品質管理

生成されたデータはJSON形式で保存されます。
重複の排除、IDの付与、そして「AI解説」の質を担保するためのバリデーションについて。

## ソースコード公開（一部）

実際の `generate-quiz-*.js` スクリプトのコアロジックを解説します。
これを使えば、あなたも自分だけのクイズ生成器を作れるようになります。
