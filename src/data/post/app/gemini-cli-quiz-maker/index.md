---
publishDate: 2026-02-19
updateDate: 2026-02-19
title: '【Gemini 2.0】CLIで無限にクイズを作る自作ツール "Quiz Generator"'
excerpt: 'コマンド一発で試験問題を量産。Gemini APIのリミット制御と重複排除を実装したNode.jsスクリプトの全貌。'
image: '~/data/post/app/gemini-cli-quiz-maker/cover.jpg'
category: app
knowledge:
  type: method
  examId: common
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

### 3. CLIで動かす「真のメリット」

このツールをCLI（コマンドライン）で動かすことには、技術者ならではの大きなメリットがあります。

それは、**「AIエージェントのクォータ（利用制限）を消費しない」** ことです。

例えば、VS Codeなどで私（Antigravity）に直接「問題を作って」と頼むと、エージェント側の利用回数が削られてしまいます。しかし、自作のスクリプトをターミナルの外出しプロセスとして走らせれば、Gemini APIとあなたの直接対話になるため、エージェント側の制限を気にせず、バックグラウンドで何百問ものデータを量産できるのです。

## 開発の裏側：実際に使っているソースコード

「AIを活用してアプリを作る」そのプロセス自体が Syllabus Hack の核です。
実際に問題生成に使用している `scripts/generate-quiz-fe.js` のコアロジックを抜粋して紹介します。

### Gemini API 呼び出しの核心部

APIキーを設定し、構造化データ（JSON）を直接出力させるための設定です。

```javascript
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.0-flash';

async function callGemini(prompt) {
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL,
    // ストレートにJSONを返させるための魔法の設定
    generationConfig: { responseMimeType: 'application/json' },
  });

  const result = await model.generateContent(prompt);
  return result.response;
}
```

### 逐次保存とレートリミット対策

生成したそばからファイルに書き込み、API制限に配慮して「待つ」実装。これが安定した量産の秘訣です。

````javascript
for (const item of sample) {
  console.log(`🌀 生成中: [${item.keyword}]...`);
  const response = await callGemini(prompt);
  const jsonText = response
    .text()
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();
  const generatedData = JSON.parse(jsonText);

  if (generatedData && generatedData.question) {
    // 既存のリストに追記して即座に保存
    existingQuestions.push(generatedData);
    fs.writeFileSync(outputFile, JSON.stringify(existingQuestions, null, 2), 'utf8');
    console.log(`✅ Success: ${item.keyword}`);
  }
  // APIへの負荷を考慮して2秒のクールダウン
  await new Promise((resolve) => setTimeout(resolve, 2000));
}
````

## まとめ：構想があるならAIに具現化してもらう

このコード自体も、AIと対話しながらブラッシュアップしてきたものです。

コードをそのまま真似る必要はありません。あなたが「作りたいもの」をAIに伝え、自分専用の武器にカスタマイズしていく楽しさを、ぜひ体験してみてください。
