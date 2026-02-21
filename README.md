# Syllabus Hack 🚀

**生成AIでシラバスをハックする**

Syllabus Hackは、最新の生成AI（Gemini, ChatGPT, NotebookLM等）をフル活用して、IT資格試験や専門知識の習得を「効率的かつ本質的」に進めるためのメディア＆統合学習プラットフォームです。

## 🌟 Concept

試験合格のその先へ。
膨大なシラバス（出題範囲）をAIで構造化・要約し、自分だけの「AI家庭教師」を作るメソッドと、知識を定着させるための実践的なWebアプリを提供します。

## 🛠️ Main Features

### 1. 実践的Webアプリ (Interactive Tools)

Preact + Tailwind CSS で構築された、学習効率を最大化するためのツール群。

- **ITパスポート 徹底攻略ドリル**: 分野別の集中特訓とAIによる解説生成。
- **情報セキュリティマネジメント 科目Bシミュレーター**: スマホでも快適に学べるシナリオ問題特化型アプリ。
- **生成AI倫理クイズ**: 最新のAIリテラシーを問うオリジナルドリル。

### 2. AI学習メソッド (Methodology)

- **NotebookLM 活用術**: ソースを読み込ませた「AIポッドキャスト」や「マインドマップ」の自動生成。
- **エンジニア向けプロンプト集**: 難解な概念を一瞬で理解するための「構造的要約」プロンプト。
- **無限問題生成**: シラバスのキーワードから初見の問題をAIに作成させるトレーニング。

### 3. キャリア戦略 (Career Strategy)

- 資格を業務にどう活かすか、AI時代のポートフォリオ構築術などのコラム。

## 💻 Technology Stack

- **Framework**: [Astro 5.0](https://astro.build/) (AstroWind base)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Logic**: Preact / TypeScript / Python (Data processing)
- **Content**: MDX (Page Bundle pattern)

## 🚀 Getting Started

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# 本番ビルドの実行
npm run build
```

## 📂 Project Structure

```text
src/
├── apps/         # 独自開発クイズアプリのソース（Preact）
├── assets/       # 画像・スタイル
├── components/   # ウィジェット・共通コンポーネント
├── data/         # 記事コンテンツ（MDX）および設問データ（JSON）
└── pages/        # Astro ルートページ
```

## 👤 Admin

**さしし / @sasisi344**
「なんでもやればできる」をモットーに、ITインフラからWeb開発まで幅広く経験。「AIコソ錬」を提唱し、シニア・アダルト層のリスキリングをテクノロジーで支援することを目指しています。

- [X (Twitter)](https://x.com/sasisi344)
- [Threads](https://www.threads.com/@sasisi344)
- [GitHub](https://github.com/344dev)

---

Created by [Syllabus Hack](https://syllabushack.com) team.  
Based on the [AstroWind](https://github.com/onwidget/astrowind) template.
