/** @jsxImportSource preact */
import CategoryDrill from './CategoryDrill';
import type { QuizAppProps } from './types';
import './quiz.css';

/**
 * GenAI Ethics Quiz App
 * 生成AIとAI倫理の重要用語に特化したクイズアプリ
 */
export default function QuizApp({ questions, examId, examName }: QuizAppProps) {
  return (
    <div class="ethics-quiz-app">
      <CategoryDrill questions={questions} examId={examId} examName={examName} />
    </div>
  );
}
