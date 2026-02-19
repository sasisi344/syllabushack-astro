---
publishDate: 2026-02-19
updateDate: 2026-02-19
title: '【Gemini 2.0】CLIで無限にクイズを作る自作ツール "Quiz Generator"'
excerpt: 'コマンド一発で試験問題を量産。Gemini APIのリミット制御と重複排除を実装したNode.jsスクリプトの全貌。'
image: '~/data/post/app/gemini-cli-quiz-maker/cover.jpg'
category: 'app'
tags: ['Gemini', 'CLI', 'Node.js', '自作ツール']
metadata:
  description: 'Gemini 2.0 Flash APIを活用し、コマンドラインから資格試験のクイズデータを一括生成するNode.js製CLIツールの紹介と技術的な実装ポイント。'
---

## 欲しいのは「アプリ」ではなく「データ」

世の中には学習アプリが溢れていますが、本当に必要なのは「自分に合った問題データ」です。
既存アプリの問題集に飽きたら、自分で作ればいい。
そのためのCLIツール **"GenAI Quiz Generator"** を作成しました。

## ツールの概要

ターミナルからコマンドを叩くだけで、指定したカテゴリの良質な4択問題を生成し、JSONファイルに追記します。
FE（基本情報）やSG（セマネ）のシラバスに対応しています。

```bash
# 基本情報のテクノロジ系問題を10問生成
node scripts/generate-quiz-fe.js --category technology --count 10

# セマネのケーススタディ（長文）を5問生成
node scripts/generate-quiz-sg-b.js --count 5
```

ここまでで「うっ……」と気遅れした方がいるかもしれません。
安心してください。
文字列をAIに投げかければ、同じように作成してくれますよ。なんなら全文をコピペすれば、AIは「このようなものをご所望で？」と提案してくれるはずです。

## 技術的なこだわりポイント

### 1. APIレートリミットの制御

Gemini API (Free tier) には分間のリクエスト制限があります。
単純なループで叩くと `429 Too Many Requests` で死ぬため、`sleep` 関数による待機処理と、エラー時のグレースフルなハンドリングを実装しました。

### 2. 重複の排除

生成された問題が既存のデータと被らないよう、既存のJSONを読み込んでキーワードベースでフィルタリングします。
これにより、「まだ作っていない問題」だけをピンポイントで生成できます。

### 3. "Gemini 2.0 Flash" の実力

高速で安価（現在は無料枠あり）な `gemini-2.0-flash` モデルを採用。
思考時間は短いですが、明確なプロンプトを与えることで、試験センター公認レベルの「ひっかけ問題」も生成可能です。

## コードの公開

このツールは Syllabus Hack の開発プロセスで実際に使用されています。
ソースコードの主要部分は [GitHub (344dev/syllabushack-astro)](https://github.com/344dev/syllabushack-astro) で確認できます。
ぜひフォークして、あなただけの「無限問題生成器」を作ってみてください。
