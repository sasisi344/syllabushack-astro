# クイズアプリ開発ルール

クイズアプリ（CBTシミュレーター）の新規作成・改修に関する統一ルールです。

## 開発フロー

1. **要件定義**: `00_templates/quiz-app-requirement-template.md` をコピーして `.workspace/tasks/` に保存し、各項目を埋める。
2. **データ作成**: `00_templates/quiz-data-template.json` および [quiz_data_rules.md](quiz_data_rules.md) に従い、問題JSONを作成。格納先は `src/data/master/questions-{examId}.json`。
3. **アプリ実装**: `src/apps/{app-slug}/` にコンポーネントを配置。既存の `it-passport-quiz` を参照実装として活用する。
4. **レジストリ登録**: `src/apps/index.ts` にメタデータを追加。
5. **記事作成**: `src/data/post/app/{app-slug}/index.mdx` にアプリ紹介記事を Page Bundle 形式で作成。

## ディレクトリ構造

```
src/
├── apps/
│   ├── index.ts                    # アプリレジストリ（全アプリ共通）
│   └── {app-slug}/
│       ├── types.ts                # 型定義
│       ├── progress.ts             # 進捗管理（LocalStorage）
│       ├── QuizApp.tsx             # メインUIコンポーネント（Preact）
│       ├── DailyQuiz.tsx           # 「今日の1問」コンポーネント（Preact）
│       └── quiz.css                # スタイル（ダークモード必須）
├── data/
│   ├── master/
│   │   ├── exams.json              # 試験マスタ
│   │   ├── questions-it-passport.json
│   │   ├── questions-sg.json
│   │   └── questions-fe.json
│   └── post/app/{app-slug}/
│       ├── index.mdx               # アプリ記事ページ（MDX）
│       └── cover.jpg               # カバー画像
└── components/widgets/
    └── DailyQuizSection.astro      # トップページ用ラッパー
```

## コンポーネント設計原則

### 技術スタック

- **Preact** (`@astrojs/preact`) をUI基盤とする（React互換、軽量）。
- Astroの **Islands Architecture** で `client:load` を使用してハイドレーション。
- スタイルは **Vanilla CSS** で記述（Tailwindとの共存可）。

### 共通型の再利用

`src/apps/it-passport-quiz/types.ts` の `Question`, `UserProgress` 等の型を共通基盤とする。試験区分固有の拡張が必要な場合は、既存の型を `extends` して使う。新たに独自のインターフェースをゼロから作らない。

### 進捗管理

- **LocalStorage** を使用してユーザーの回答履歴を保存。
- ストレージキーは `sh_quiz_{examId}` で統一。
- 直近100件の回答履歴を保持（オーバーフロー防止）。
- `progress.ts` のロジックは既存のものをそのまま再利用する。

### CSSルール

- 全コンポーネントで **ダークモード** を必須サポート（`.dark` クラス）。
- クラス命名は既存のプレフィックス規則に従う:
  - `dq-` → DailyQuiz専用
  - `qa-` → QuizApp専用
- ブランドカラー: インディゴ系（`#1e1b4b`, `#312e81`, `#6366f1`, `#818cf8`）。
- 正解: `#22c55e`（green-500）、不正解: `#ef4444`（red-500）。

## MDX統合ルール

### フロントマター

- `category: app` 固定。
- `tags` に試験名の正式タグ + `CBT` + `模擬試験` + `SyllabusHack`。
- [tag_rules.md](tag_rules.md) に従い、試験名タグは正規化されたものを使用。

### コンポーネント埋め込み

```mdx
import QuizApp from '~/apps/{app-slug}/QuizApp';
import '~/apps/{app-slug}/quiz.css';
import questions from '~/data/master/questions-{examId}.json';

<QuizApp client:load questions={questions} examId="{examId}" examName="{試験名}" />
```

- 必ず `client:load` を指定する（SPAライクな即時インタラクション）。
- `client:visible` は使わない（クイズはページの主役であり、遅延ロードすべきでない）。

## AI解説連携ルール

- 解説プロンプトは `QuizApp.tsx` 内の `generateAiPrompt()` 関数で生成する。
- リンク先は `https://gemini.google.com/app?q={encodedPrompt}`。
- 将来的に他の生成AI（ChatGPT等）へのリンクも追加可能な設計とする。
- `keywords` フィールドを活用し、最小限のキーワードからAIに解説を求められるようにする。

## チェックリスト（リリース前確認）

- [ ] 問題データが [quiz_data_rules.md](quiz_data_rules.md) に準拠している
- [ ] `src/apps/index.ts` にレジストリ登録済み
- [ ] ダークモードで表示崩れがない
- [ ] モバイル（375px幅）で操作可能
- [ ] AI解説リンクが正しいプロンプトを生成する
- [ ] LocalStorageへの進捗保存が動作する
- [ ] `npm run dev` でエラーなし
- [ ] カバー画像（cover.jpg）がピクトグラムスタイルで作成済み
