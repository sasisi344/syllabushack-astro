/** @jsxImportSource preact */
import CategoryDrill from './CategoryDrill';
import type { QuizAppProps } from './types';
import '../genai-ethics-quiz/quiz.css'; // cssは使い回す

/**
 * GenAI Cert Quiz App
 * 生成AIの資格試験（パスポート／導入実務者検定）対応のクイズアプリ
 */
export default function QuizApp({ questions, examId, examName }: QuizAppProps) {
  return (
    <div class="ethics-quiz-app quiz-app">
      <CategoryDrill questions={questions} examId={examId} examName={examName} />
    </div>
  );
}
