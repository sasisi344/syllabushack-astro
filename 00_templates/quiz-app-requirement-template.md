# クイズアプリ 要件定義テンプレート

> 新しいクイズアプリを作成する際は、このテンプレートをコピーして `.workspace/tasks/requirement-{app-slug}.md` に保存し、各項目を埋めてから実装に進んでください。

---

## 基本情報

| 項目       | 値                                          |
| :--------- | :------------------------------------------ |
| アプリ名   | （例: ITパスポート 模擬試験シミュレーター） |
| app-slug   | （例: `it-passport-quiz`）                  |
| 試験区分   | （`it-passport` / `sg` / `fe`）             |
| ステータス | （`development` / `beta` / `stable`）       |

## ファイル構成チェックリスト

以下のファイルを作成・更新する必要があります。

### アプリ本体 (`src/apps/{app-slug}/`)

- [ ] `types.ts` — 型定義（共通の `Question` 型を再利用 or 拡張）
- [ ] `progress.ts` — LocalStorageベースの進捗管理
- [ ] `QuizApp.tsx` — メインのドリルコンポーネント（Preact）
- [ ] `DailyQuiz.tsx` — 「今日の1問」コンポーネント（Preact）
- [ ] `quiz.css` — コンポーネント用CSS（ダークモード必須）

### データ (`src/data/master/`)

- [ ] `questions-{examId}.json` — 問題データ（[quiz_data_rules.md](../.skills/quiz_data_rules.md) に従う）

### コンテンツページ (`src/data/post/app/{app-slug}/`)

- [ ] `index.mdx` — アプリ紹介記事（QuizAppコンポーネントを `client:load` で埋め込み）
- [ ] `cover.jpg` — カバー画像（ピクトグラムスタイル）

### サイト連携

- [ ] `src/apps/index.ts` — アプリレジストリにメタデータを追加
- [ ] `src/components/widgets/DailyQuizSection.astro` — トップページ用ラッパー（必要に応じて更新）

## 機能要件

### 必須機能（MVP）

- [ ] **分野別ドリル**: field（strategy / management / technology）で問題を分類し、ユーザーが選択。
- [ ] **全分野シャッフル**: ランダム出題モード。
- [ ] **即時フィードバック**: 選択肢タップ後に正誤表示＋解説。
- [ ] **AI解説リンク**: 不正解時にGeminiへのプロンプト付きリンクを表示。
- [ ] **進捗トラッキング**: 総回答数、正答率、分野別正答率をLocalStorageに保存。
- [ ] **苦手分野検出**: 正答率が最も低い分野に「苦手」バッジを表示。
- [ ] **結果画面**: ドリル終了後に正答数、正答率、間違えた問題一覧を表示。

### 「今日の1問」（トップページ用）

- [ ] 日付シードでランダムに1問選出。
- [ ] 即時正誤判定。
- [ ] AI解説リンク付き。

### 将来機能（Future Scope）

- [ ] 記事内への設問埋め込み（Astroコンポーネント経由）
- [ ] 間違えた問題をまとめてAIに解説させるプロンプトジェネレーター
- [ ] タイマー付き本番モード

## デザイン要件

- [ ] **モバイルファースト**: スマホでの隙間学習を最優先。
- [ ] **ダークモード対応**: `.dark` クラスによる完全対応（[dark_mode_css.md](../.skills/dark_mode_css.md)）。
- [ ] **ブランドカラー**: インディゴ系グラデーション（`#1e1b4b` → `#312e81` → `#6366f1`）。
- [ ] **アニメーション**: フィードバック表示のスライドアップ・フェードイン。

## MDX 記事テンプレート

```mdx
---
publishDate: YYYY-MM-DD
title: '{試験名} 模擬試験シミュレーター (CBT対応)'
image: '~/data/post/app/{app-slug}/cover.jpg'
excerpt: { 説明文 }
category: app
tags:
  - { 試験タグ }
  - CBT
  - 模擬試験
  - SyllabusHack
metadata:
  description: { SEO用メタディスクリプション }
---

import QuizApp from '~/apps/{app-slug}/QuizApp';
import '~/apps/{app-slug}/quiz.css';
import questions from '~/data/master/questions-{examId}.json';

## アプリについて

{アプリの説明}

### 主な機能

- **分野別ドリル**: 苦手な分野を集中攻撃。
- **進捗トラッキング**: 正答率・回答数を自動で記録し、苦手分野を可視化。
- **AI解説機能**: 間違えた問題に対し、Geminiがあなた専用の解説を作成。

### 使い方

1. 下のアプリで分野を選ぶか「全分野シャッフル」をタップしてください。
2. 選択肢をタップすると即時に正誤が判定されます。
3. 「AIにもっと詳しく聞く」でGeminiに質問できます。

> ※ 現在はベータ版です。問題データは順次追加しています。

---

<QuizApp client:load questions={questions} examId="{examId}" examName="{試験名}" />
```

## アプリレジストリ登録テンプレート

`src/apps/index.ts` の `appRegistry` に追加:

```typescript
'{app-slug}': {
  id: '{app-slug}',
  slug: '{app-slug}',
  title: '{試験名} 模擬試験シミュレーター',
  description: '{説明}',
  category: 'quiz',
  status: 'development',
  examId: '{examId}',
},
```
