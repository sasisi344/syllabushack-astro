/**
 * Syllabus Hack App Registry
 * Webアプリの実装とメタデータを一元管理するためのインデックスファイルです。
 * 
 * 役割:
 * 1. アプリのメタデータ（タイトル、カテゴリ、説明）の定義
 * 2. 各コンテンツページ（src/data/post/app/...）からの呼び出しの正規化
 */

export interface AppMetadata {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: 'quiz' | 'tool' | 'converter';
  status: 'development' | 'beta' | 'stable';
  examId?: string;
}

export const appRegistry: Record<string, AppMetadata> = {
  'it-passport-quiz': {
    id: 'it-passport-quiz',
    slug: 'it-passport-quiz',
    title: 'ITパスポート 模擬試験シミュレーター',
    description: '本番のCBT試験を忠実に再現した模擬試験ツール。分野別ドリル＋AI解説付き。',
    category: 'quiz',
    status: 'beta',
    examId: 'ip',
  },
  'pdf-to-text': {
    id: 'pdf-to-text',
    slug: 'pdf-to-text',
    title: 'PDFテキスト変換君',
    description: 'シラバスなどのPDFをプロンプト用に最適化されたテキストに変換',
    category: 'tool',
    status: 'development',
  },
  'ip-strategy-drill': {
    id: 'ip-strategy-drill',
    slug: 'ip-strategy-drill',
    title: 'ITパスポート ストラテジ系 集中100問ドリル',
    description: '配点35%を占める最重要分野「ストラテジ系」に特化した集中演習ドリル。AI解説付き。',
    category: 'quiz',
    status: 'beta',
    examId: 'ip',
  },
  'sg-quiz': {
    id: 'sg-quiz',
    slug: 'sg-quiz',
    title: '情報セキュリティマネジメント 攻略マスター',
    description: '科目A・B完全対応。AIによる実務シナリオ演習でSG合格を確実にする戦略的シミュレーター。',
    category: 'quiz',
    status: 'stable',
    examId: 'sg',
  },
  'fe-quiz': {
    id: 'fe-quiz',
    slug: 'fe-quiz',
    title: '基本情報技術者 攻略シミュレーター',
    description: 'FE試験の科目A（全分野）と科目B（アルゴリズム・セキュリティ）に完全対応した戦略的学習ツール。',
    category: 'quiz',
    status: 'stable',
    examId: 'fe',
  },
  'genai-ethics-quiz': {
    id: 'genai-ethics-quiz',
    slug: 'genai-ethics-quiz',
    title: '生成AI・AI倫理「新用語」特化型クイズ',
    description: '最新シラバス対応！生成AIとAI倫理の重要キーワードをAI解説付きドリルで攻略。',
    category: 'quiz',
    status: 'development',
  },
  'sg-subject-b-quiz': {
    id: 'sg-subject-b-quiz',
    slug: 'sg-subject-b-quiz',
    title: 'SG科目B 実務シナリオ演習ドリル',
    description: '情報セキュリティマネジメント試験の最難関「科目B」に特化。実務シナリオ形式の長文問題を攻略。',
    category: 'quiz',
    status: 'development',
    examId: 'sg',
  },
};

/**
 * IDからアプリのメタデータを取得
 */
export const getAppById = (id: string): AppMetadata | undefined => {
  return appRegistry[id];
};
