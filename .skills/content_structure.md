# Astro Project Folder Structure (Syllabus Hack)

This project uses the **AstroWind** template. Content is managed in `src/data/post/`.

## 1. Directory Overview

```text
src/
├── data/
│   └── post/             # 📝 Blog Posts (Main content)
│       ├── trend/        # Trend & Exam Info
│       ├── method/       # Study Methods (Syllabus Hack)
│       └── career/       # Career Strategy
├── assets/
│   └── images/           # 🖼️ Shared Images
└── content/
    └── config.ts         # Schema definitions
```

## 2. Page Bundle Pattern

Every blog post MUST follow the Page Bundle pattern: a directory named after the slug, containing an `index.md` file and its local assets (images).

**Correct Structure:**

```text
src/data/post/method/my-awesome-hack/
├── index.md              # Article body
└── cover.jpg             # Local thumbnail image (if not using shared assets)
```

**Naming Convention:**

- **Folders/Slugs**: Use hyphens (kebab-case), lowercase only. (e.g., `fe-exam-2026`)
- **Images**: `cover.jpg` for primary thumbnails.

## 3. Categories vs folders

The folder name under `src/data/post/` should match the `category` field in the frontmatter.

- `src/data/post/trend/` -> `category: "trend"`
- `src/data/post/method/` -> `category: "method"`
- `src/data/post/career/` -> `category: "career"`
