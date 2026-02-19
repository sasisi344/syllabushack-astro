---
publishDate: 2026-02-19
updateDate: 2026-02-19
title: '【実装編】Antigravityとペアプログラミング。Astro+Reactで構築する爆速Webアプリ開発'
excerpt: 'フロントエンド開発の新時代。AIと共同で作り上げたUI/UXの実装プロセスと、Astro × Reactの技術選定。'
image: '~/data/post/app/dev-story-ui/cover.jpg'
category: 'app'
tags: ['Astro', 'React', 'Tailwind', 'ペアプロ']
metadata:
  description: 'AIエージェント「Antigravity」とのペアプログラミングでクイズアプリを爆速構築したUI実装ドキュメント。科目B画面やTailwindの実践例。'
---

## AstroWind から始まるプロトタイピング

ベースとなるテンプレート AstroWind (PageSpeed Insights 100) をどう拡張したか。
React コンポーネントの組み込みと、ハイブリッドレンダリングの戦略。

## QuizApp コンポーネント (UI/UX)

ユーザー体験を中心に据えたUI設計。

- **ダークモード対応**: Tailwind の `dark:` クラスでスマートに。
- **画面遷移なしの学習**: SPAライクな軽快なクイズ体験。
- **Confetti**: 全問正解時の小さなご褒美。canvas-confetti の実装。

## Antigravity との「意思疎通」

AIとの共同作業において、どのように指示を出し、どのようにレスポンスを得たか。

- `MultiReplaceFileContent` を駆使した一括リファクタリング。
- デザイン提案から修正までのスピード感。
- 人間が考えるべき「戦略」と、AIに任せるべき「実装」。

## 今後の展望：PWA化とネイティブアプリへの道

Webアプリ（TWA）としてだけでなく、将来的にはネイティブアプリへの展開も視野に入れています。
