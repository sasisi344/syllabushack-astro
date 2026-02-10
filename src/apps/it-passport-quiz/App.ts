/**
 * IT Passport Quiz App Logic
 * 
 * TODO: 
 * - 問題データの取得 (JSON)
 * - タイマー機能
 * - スコア計算
 * - AI解説リクエスト
 */

export class ITPassportQuiz {
  private questions: any[] = [];
  private currentQuestionIndex: number = 0;

  constructor() {
    console.log('IT Passport Quiz Initialized');
  }

  start() {
    console.log('Quiz Started');
  }
}
