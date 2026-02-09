---
name: Post Writer
description: Standard guidelines and template for writing Syllabus Hack blog posts for AstroWind.
---

# Post Writer Skill

Use this skill when creating or editing blog posts for Syllabus Hack.

## 1. Frontmatter Template

All new articles MUST start with this frontmatter structure. Copy and paste this template.

```yaml
---
publishDate: 2026-02-10T00:00:00Z
title: '記事タイトル'
excerpt: '記事の要約（100文字程度）'
image: '~/assets/images/cover.jpg' # または直接URL
category: 'method' # trend, method, career のいずれか
tags: ['Tag1', 'Tag2', 'Tag3']
draft: false
metadata:
  description: '検索エンジン向けのメタディスクリプション（120-160文字）'
---
```

## 2. Field Rules

- **title**: 読者の興味を惹くキャッチーなタイトル。
- **excerpt**: 記事一覧に表示される要約文。
- **publishDate**: 公開日時（ISO 8601形式推奨）。
- **category**: 以下のいずれか1つを選択。
  - `"trend"`: トレンド・試験情報
  - `"method"`: 学習メソッド
  - `"career"`: キャリア戦略
- **tags**: 3〜5個。必ず `.skills/tag_rules.md` の標準化タグを使用すること。
- **image**: アイキャッチ画像。`~/assets/images/` 配下のリソース、または外部URLを指す。
- **draft**: 公開時は `false`。
- **metadata.description**: SEO用のメタディスクリプション。

## 3. Publication Rules

- **Remove Prompts**: 記事を公開用フォルダ（`src/data/post/`）に配置する際、画像生成プロンプトなどのHTMLコメント（`<!-- Image Generation Prompt: ... -->`）は削除すること。

## 4. Writing Process Reference

- Directory Structure: See `content_structure.md`
- Tagging Strategy: See `tag_rules.md`
- Image Guidelines: See `image_rules.md`
