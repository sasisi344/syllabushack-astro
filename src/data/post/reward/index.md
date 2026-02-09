---
publishDate: 2026-01-30
title: 🏆 ご褒美：クイズシステムの作り方
excerpt: ''
category: docs
tags:
- SyllabusHack
- Reward
- TypeScript
draft: false
metadata:
  description: ''
---

## 🎉 おめでとうございます！

あなたは見事にクイズを全問正解し、この特別ページをアンロックしました。
ここでは、あなたが今解いたクイズシステムがどのように作られているかを解説します。

> **これがSyllabus Hackの本質です。**
> 試験勉強を通じて、実際に使えるプログラミングスキルも身につける。

---

## 📁 システムの構成

このクイズは3つのファイルで構成されています：

| ファイル | 役割 |
|:---------|:-----|
| `quiz.ts` | クイズのロジック（TypeScript） |
| `quiz.css` | 見た目のスタイル |
| `quiz.html` | ショートコード（Hugo用） |

---

## 🧠 メインロジック：quiz.ts

### 1. データの型定義

まず、問題データの「型」を決めます。これにより、どんなデータが来るか明確になります。

```typescript
interface QuizData {
    id: string;           // 問題ID
    question: string;     // 問題文
    options: string[];    // 選択肢（配列）
    answer_index: number; // 正解の番号（0から始まる）
    explanation: string;  // 解説
    tags?: string[];      // タグ（オプション）
}
```

### 2. 問題データの取得

JSONファイルから問題を取得し、シャッフルして10問選びます。

```typescript
async fetchQuestions() {
    const response = await fetch(`/data/${this.category}.json`);
    const data = await response.json();
    this.questions = this.shuffleArray(data).slice(0, 10);
}
```

**ポイント**: `fetch()` は外部ファイルを読み込むWeb標準API。`async/await` で非同期処理をスッキリ書けます。

### 3. 正解判定

ユーザーが選んだ番号と、正解番号を比較します。

```typescript
checkAnswer(selectedIndex: number) {
    const q = this.questions[this.currentQuestionIndex];
    const isCorrect = selectedIndex === q.answer_index;
    
    if(isCorrect) this.score++;
    
    // ローカルストレージに保存
    this.saveResult({ questionId: q.id, isCorrect, tags: q.tags });
}
```

### 4. 苦手分野の分析

タグごとに正答率を集計し、70%未満を「苦手分野」として表示します。

```typescript
// 正答率70%未満のタグを抽出
const weakAreas = Object.entries(stored.tagStats)
    .filter(([tag, stats]) => {
        const accuracy = stats.correct / stats.total;
        return accuracy < 0.7 && stats.total >= 2;
    })
    .sort((a, b) => a.accuracy - b.accuracy);
```

---

## 💾 データの永続化：localStorage

ブラウザの `localStorage` を使って、回答履歴を保存しています。
サーバー不要で、ユーザーのブラウザにデータが残ります。

```typescript
// 保存
localStorage.setItem('syllabushack_quiz_stats', JSON.stringify(data));

// 読み込み
const data = localStorage.getItem('syllabushack_quiz_stats');
if (data) {
    const parsed = JSON.parse(data);
}
```

---

## ✨ 紙吹雪アニメーション

全問正解時の紙吹雪は、JavaScriptで動的にDOM要素を生成しています。

```typescript
showConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#ffeaa7'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        container.appendChild(confetti);
    }
}
```

CSSアニメーションで落下させます：

```css
@keyframes confetti-fall {
    0% {
        opacity: 1;
        transform: translateY(0) rotate(0deg);
    }
    100% {
        opacity: 0;
        transform: translateY(100vh) rotate(720deg);
    }
}
```

---

## 🚀 次のステップ

このクイズシステムを自分でカスタマイズしてみましょう：

1. **問題を追加** - `static/data/` にJSONファイルを作成
2. **デザイン変更** - `quiz.css` を編集
3. **機能追加** - 制限時間、ヒント機能など

---

## 📚 参考リソース

- [MDN Web Docs - Fetch API](https://developer.mozilla.org/ja/docs/Web/API/Fetch_API)
- [MDN Web Docs - localStorage](https://developer.mozilla.org/ja/docs/Web/API/Window/localStorage)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)

---

*この特別コンテンツは、クイズ全問正解者だけがアクセスできます。*
*あなたは学習を通じて「作る側」のスキルも獲得しました。おめでとうございます！*