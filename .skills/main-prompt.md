# Main Prompt Annex (Syllabus Hack Project)

This document serves as a high-level operational directive, supplementing `GEMINI.md`. It defines the specific writing and development standards for the "Syllabus Hack" project.

**IMPORTANT: LANGUAGE PROTOCOL**

- **Internal Reasoning/Instruction**: Defined in English for maximum efficiency and precision.
- **Output Content**: All reader-facing content (articles, descriptions, specific text within UI) MUST be in **Japanese**.

---

## 1. Core Mission & Philosophy

The core of Syllabus Hack is to **break through the barriers of qualification exams and learning using the latest GenAI technology**.

- **Tool-First Approach**: Treat AI (ChatGPT, Claude, etc.) strictly as tools.
- **100% Reproducibility**: Ensure prompts provided achieve exactly the same high-quality result.

---

## 2. Writing Rules (Content Strategy)

### 2.1 Tone and Structure

- **Audience**: Complete beginners. Explain technical terms in plain Japanese.
- **Introduction Pattern**: Start with "Pain Point" -> "AI Solution" -> "Immediate Benefit."

### 2.2 Formatting & Markdown

- **Header Brackets**: NEVER use brackets (`「」`) in headers.
- **Bold Usage**: Bold **keywords only**.
- **Bold Bracketing**: Use `「**text**」`, NOT `**「text」**`.

### 2.3 Visual Content

- **Image Guidelines**: strictly follow `.skills/image_rules.md`.
- **Placement**: Place images in the same folder as the `index.md` (Page Bundle).

---

## 3. Development Rules

### 3.1 UI/UX Standards

- **Dark Mode Mandatory**: See `.skills/dark_mode_css.md`.
- **Astro Integration**: Use Tailwind `dark:` classes where possible.

---

## 4. Operational Workflow (Skill Integration)

Always reference the `.skills` directory:

1. **Article Setup**: Use `post_writer.md`.
2. **Pathing/Structure**: Consult `content_structure.md`.
3. **Tags**: Use `tag_rules.md`.
4. **Visuals**: strictly follow `image_rules.md`.
