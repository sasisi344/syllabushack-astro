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
};

/**
 * IDからアプリのメタデータを取得
 */
export const getAppById = (id: string): AppMetadata | undefined => {
  return appRegistry[id];
};
