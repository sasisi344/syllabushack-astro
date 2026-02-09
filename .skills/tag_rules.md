---
name: content-tags
description: Rules for article tagging, including count limits and controlled vocabulary for exams.
---

# Tag Rules

## 1. Constraints

- **Count**: Minimum **3**, Maximum **5** tags per article.
- **Source**: Extract high-relevance keywords from the content that would make good search hashtags.

## 2. Controlled Vocabulary (Standardized Exam Names)

To prevent taxonomy fragmentation, ALWAYS use the **Canonical Tag** for qualification names. Do NOT use aliases.

| Qualification Name (Alias/Variation)                                 | **Canonical Tag (Use this)** |
| :------------------------------------------------------------------- | :--------------------------- |
| ITパスポート, IP, Iパス                                              | `ITパスポート`               |
| 基本情報技術者試験, FE, 基本情報                                     | `基本情報技術者`             |
| 応用情報技術者試験, AP, 応用情報                                     | `応用情報技術者`             |
| 情報処理安全確保支援士, SC, 登録セキスペ, セキュリティスペシャリスト | `情報処理安全確保支援士`     |
| ネットワークスペシャリスト, NW                                       | `ネットワークスペシャリスト` |
| データベーススペシャリスト, DB                                       | `データベーススペシャリスト` |
| プロジェクトマネージャ, PM                                           | `プロジェクトマネージャ`     |

## 3. General Tagging Strategy

- **Mix**: Combine 1 "Exam Name" tag + 1 "Category/Topic" tag + 1-3 "Specific Keyword" tags.
- **Examples**:
  - Target: FE Subject B Algorithm article
  - Tags: `["基本情報技術者", "アルゴリズム", "科目B", "疑似言語", "Python"]` (5 tags)
  - Target: AP Essay writing hack
  - Tags: `["応用情報技術者", "午後問題", "記述式", "独学"]` (4 tags)
