---
name: content-categories
description: Rules for classifying articles into `trend`, `method`, or `career`.
---

# Content Category Rules

Syllabus Hack content is strictly divided into three categories. Articles must be placed in `src/data/post/{category}/`.

## 1. trend (トレンド・試験情報)

**"News & Context"**

- **Directory**: `src/data/post/trend/`
- **Frontmatter**: `category: "trend"`
- **Content**:
  - Syllabus updates (e.g., "IPA adds GenAI to syllabus").
  - Exam schedule and logistics.
  - Latest AI industry news relevant to exams.
  - Analysis of certification value in the AI era.

## 2. method (学習メソッド)

**"The Solution (Syllabus Hack)"**

- **Directory**: `src/data/post/method/`
- **Frontmatter**: `category: "method"`
- **Content**:
  - **Core Hacks**: How to use AI for studying.
  - **Tools/Prompts**: "Infinite Drill Generator", "Syllabus Scheduler".
  - **Tutorials**: Specific algorithm/subject explanations using AI metaphors.

## 3. career (キャリア戦略)

**"The Outcome"**

- **Directory**: `src/data/post/career/`
- **Frontmatter**: `category: "career"`
- **Content**:
  - Job market data for qualification holders.
  - Portfolio building with AI-enhanced skills.
  - Career paths and salary impact.

## Decision Tree

1.  Is it about _how to pass_ or _study tools_? -> **method**
2.  Is it about _what happens after passing_ or _jobs_? -> **career**
3.  Is it about _the exam itself_ or _industry trends_? -> **trend**
