# Workspace Rules for GEMINI

## Project Type

This is an **Astro project (using AstroWind template)** focused on "Syllabus Hack" - using GenAI to conquer qualification exams.

## Content Rules

### Writing Style & Tone (Updated 2026-01-31)

- **Target Audience**:
  - Treat the reader as a **Beginner to GenAI**.
  - When introducing prompts or AI operations, assume zero prior knowledge. Provide careful, step-by-step guidance (e.g., "Copy this text and paste it into ChatGPT").
- **Emphasis Guidelines**:
  - **Headers**: Do NOT use brackets (`「」`) in article headers. (e.g., `## 落ちる人の計画` not `## 「落ちる人」の計画`)
  - **Metaphors/Terms**: Do NOT use brackets for emphasis in body text. Trust the context. (e.g., `借金のように` not `「借金」のように`)
  - **Bold Usage**:
    - **Keywords Only**: Bold only the core keywords, never entire sentences or instructions.
    - **No Bracket Bolding**: Do NOT wrap brackets in bold (`**「text」**`). Use `「**text**」` or simply `**text**` if brackets aren't needed.
    - **Punctuation**: Add a comma (`、`) before bolded segments for better rhythm where appropriate.

### Directory Structure & Categories

Articles must be created in `src/data/post/{category}/{slug}/index.md` (Page Bundle pattern).

**Project Management:**

- `.workspace/drafts/`: 下書き（ドラフト）記事の保管場所。
- `.workspace/tasks/`: タスク管理（TODO.md, ROADMAP.mdなど）の保管場所。

The allowed categories are exactly these three:

1.  **trend** (`src/data/post/trend/`)
    - **Display Name**: トレンド・試験情報
    - **Content**: Exam news, syllabus updates, Latest AI news related to exams.
2.  **method** (`src/data/post/method/`)
    - **Display Name**: 学習メソッド
    - **Content**: The "Syllabus Hack" core methods, prompt tools, study hacks, infinite drill generation.
3.  **career** (`src/data/post/career/`)
    - **Display Name**: キャリア戦略
    - **Content**: Career paths after passing, salary info, portfolio building, success stories.

### Frontmatter Constraint

For the full standard template, refer to [.skills/post_writer.md](.skills/post_writer.md).

- `category`: Must be a SINGLE string value matching the directory name.
  - OK: `category: "trend"`
  - OK: `category: "method"`
  - OK: `category: "career"`
- `tags`:
  - **Count**: 3 to 5 tags.
  - **Standardization**: MUST use the canonical tag for exam names (see [.skills/tag_rules.md](.skills/tag_rules.md)).
    - OK: `tags: ["基本情報技術者", "アルゴリズム", "SyllabusHack"]`
- `metadata`:
  - Use `metadata.description` for SEO.

### Visual Style Guidelines (New 2026-02-03)

- **Style**: Use **Minimalist Pictogram-style** illustrations. See [.skills/image_rules.md](.skills/image_rules.md).
- **Design**: Flat design with simple white icons/shapes on dark solid backgrounds (Deep Indigo, Navy).
- **Placement**: Place `cover.jpg` inside the article directory.

## Development Rules

### CSS & Styling

When creating new UI components with custom CSS:

- **Dark Mode is Required**: All custom CSS must support both light and dark modes.
- **Follow the Pattern**: See [.skills/dark_mode_css.md](.skills/dark_mode_css.md) for the standard implementation pattern.
- **Tailwind First**: Prefer using Tailwind’s `dark:` classes for Astro components.
