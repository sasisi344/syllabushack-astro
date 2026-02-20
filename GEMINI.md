# Workspace Rules for GEMINI

## Project Type

This is an **Astro project (using AstroWind template)** focused on "Syllabus Hack" - using GenAI to conquer qualification exams.

## Content Rules

### Writing Style & Tone (Updated 2026-01-31)

- **Target Audience**:
  - Treat the reader as a **Beginner to GenAI**.
  - When introducing prompts or AI operations, assume zero prior knowledge. Provide careful, step-by-step guidance (e.g., "Copy this text and paste it into ChatGPT").
- **Emphasis Guidelines**:
  - **Headers**:
    - Do NOT use brackets (`「」`).
    - Do NOT use numbering (e.g., `## 1. Step` is wrong, use `## Step`).
  - **Metaphors/Terms**: Do NOT use brackets for emphasis in body text. Trust the context.
  - **Bold Usage**:
    - **Keywords Only**: Bold only the core keywords, never entire sentences or instructions.
    - **Spacing**: Add a space before and after bolded segments (e.g., `文字 **強調** 文字`) to avoid Japanese markdown rendering errors.
    - **No Bracket Bolding**: Do NOT wrap brackets in bold (`**「text」**`). Use `「**text**」`.
    - **Punctuation**: Add a comma (`、`) before bolded segments for better rhythm where appropriate.
- **Sectioning**:
  - **Horizontal Rules**: Use `---` only after the frontmatter and directly before the "Summary" (まとめ) section. Avoid using them between every H2 section.

### Directory Structure & Categories

Articles must be created in `src/data/post/{category}/{slug}/index.md` (Page Bundle pattern).

- **App Category Fine-tuning**:
  - **Tool Main**: Use `index.mdx` and set `knowledge.type: "app"`.
  - **Technical Explanation**: Use `index.md` and set `knowledge.type: "method"`.

**Project Management:**

- `.workspace/drafts/`: 下書き（ドラフト）記事の保管場所。
- `.workspace/tasks/`: タスク管理（TODO.md, ROADMAP.mdなど）の保管場所。
- `.workspace/scripts/`: 開発支援スクリプト（PDF変換、データ加工等）の保管場所。

The allowed categories are exactly these four:

1.  **trend** (`src/data/post/trend/`)
    - **Display Name**: トレンド・試験情報
    - **Content**: Exam news, syllabus updates, Latest AI news related to exams.
2.  **method** (`src/data/post/method/`)
    - **Display Name**: 学習メソッド
    - **Content**: The "Syllabus Hack" core methods, prompt tools, study hacks, infinite drill generation.
3.  **career** (`src/data/post/career/`)
    - **Display Name**: キャリア戦略
    - **Content**: Career paths after passing, salary info, portfolio building, success stories.
4.  **app** (`src/data/post/app/`)
    - **Display Name**: ウェブアプリ
    - **Content**: CBT simulators, quiz tools, PDF converters, and other interactive tools.
    - **Category Page**: Posts are automatically separated into "Tools/Apps" and "Development Stories/Technical Explanations" based on their `knowledge.type`.

### Frontmatter Constraint

For the full standard template, refer to `00_templates/post-template.md`.

- `publishDate`: 記事の初公開日。
- `lastmod`: 記事の最終更新日。
- `category`: Must be a SINGLE string value matching the directory name.
  - OK: `category: "trend"`
  - OK: `category: "method"`
  - OK: `category: "career"`
  - OK: `category: "app"`
- `tags`:
  - **Count**: 3 to 5 tags.
  - **Standardization**: MUST use the canonical tag for exam names (see [.skills/tag_rules.md](.skills/tag_rules.md)).
    - OK: `tags: ["基本情報技術者", "アルゴリズム", "SyllabusHack"]`
- `knowledge` (Optional - for App Integration):
  - `examId`: `it-passport`, `sg`, `fe`, `ap`, `common`
  - `type`: `app` (ツール本体・シミュレーター), `method` (開発ストーリー・技術解説), `term` (用語), `problem` (問題解説)
  - `syllabusRef`: Reference to syllabus section (e.g., "Strategy-1")
  - `difficulty`: `beginner`, `intermediate`, `advanced`
- `metadata`:
  - Use `metadata.description` for SEO.

### Visual Style Guidelines (New 2026-02-03)

- **Style**: Use **Minimalist Pictogram-style** illustrations. See [.skills/image_rules.md](.skills/image_rules.md).
- **Design**: Flat design with simple white icons/shapes on dark solid backgrounds (Deep Indigo, Navy).
- **Placement**: Place `cover.jpg` inside the article directory.
- **Generation Tool**: Use the local script `.workspace/scripts/Antigravity-nanobana/generate-image.js` for image creation.
  - **Command**: `node .workspace/scripts/Antigravity-nanobana/generate-image.js "PROMPT" "PATH"`
  - **Prompting**: Strictly follow the "Minimalist Pictogram-style" prompt structure.
    - _Example_: "Minimalist pictogram-style illustration. A white icon of [SUBJECT] on a dark [COLOR] background. Flat design, no text."

## Development Rules

### CSS & Styling

When creating new UI components with custom CSS:

- **Dark Mode is Required**: All custom CSS must support both light and dark modes.
- **Follow the Pattern**: See [.skills/dark_mode_css.md](.skills/dark_mode_css.md) for the standard implementation pattern.
- **Tailwind First**: Prefer using Tailwind’s `dark:` classes for Astro components.

## App Development Rules

### Implementation Path

Web apps (interactive tools) source code must be kept in:

- **Root**: `src/apps/`
- **Sub-folder**: `src/apps/{app-slug}/`
- **Registry**: `src/apps/index.ts` (All apps MUST be registered here)

### Quiz App Development

- **Development Rules**: For building quiz/CBT apps, follow [.skills/quiz_app_rules.md](.skills/quiz_app_rules.md).
- **Requirements Template**: Copy `00_templates/quiz-app-requirement-template.md` to `.workspace/tasks/` for new apps.

### Best Practice

- **Logic & Content Separation**: Keep the visual content (Markdown/Page) and technical implementation (TS/React) separate.
- **Shared Data**: Use centralized JSON datasets for quiz questions to maintain consistency across apps and articles.
  - **Data Management**: For creating/updating quiz questions, follow [.skills/quiz_data_rules.md](.skills/quiz_data_rules.md).
- **Astro Integration**: Import app components/logic into `src/data/post/app/` pages for seamless content-app integration.
