---
name: image-creation-rules
description: Rules for generating article cover images.
---

# Image Creation Rules

## 1. File Specifications

- **Filename**: `cover.jpg` (preferred) or relative path in frontmatter.
- **Format**: JPEG
- **Aspect Ratio**: 16:9 (Landscape)
- **Placement**: Inside the article's Page Bundle directory (e.g., `src/data/post/category/slug/cover.jpg`).

## 2. Design Constraints

- **NO TEXT**: Do **NOT** include any text inside the image. The article title will be overlaid by the theme.
- **Subject**: Abstract, symbolic, or atmospheric representations of the topic. Avoid generic "stock photo" styles.

## 3. Aesthetic Theme (Syllabus Hack Brand - Updated 2026-02-06)

- **Style**: **Minimalist Pictogram-style** illustrations. Flat design with simple white icons/shapes.
- **Background**: Solid color backgrounds (Deep Indigo, Navy, Charcoal) or very subtle gradients.
- **Keywords**: Blueprint, Digital Network, AI Neural Nodes, Terminal Green, Abstract data visualization, Minimalist icon.
- **Vibe**: "Hacking the system", "Digital intelligence", "Future of learning".

## 4. Prompting Strategy (for AI Image Generation)

- **Style Modifiers**: `minimalist pictogram, flat design, white icon on dark solid background, vector style, simple shapes, 16:9 aspect ratio`
- **Negative Prompt**: `text, letters, words, realistic photo, complex details, gradient overkill, human faces`

## 5. Tooling & Workflow

- **Automation**: Use the official generation tools or the `generate_image` tool directly following these rules.
- **Drafting Phase**: During draft creation, insert the English prompt as a comment in the markdown file.
