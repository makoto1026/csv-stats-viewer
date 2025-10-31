// 媒体種別の定義
export const MEDIA_TYPES = [
  'Instagram',
  'TikTok',
  'YouTube',
  'Lemon8',
  'LINE',
  'ラグジュアリーカード',
  'ホームページ',
  'チラシ',
  'その他（紹介等）',
  'CLASSY(雑誌)',
] as const;

export type MediaType = typeof MEDIA_TYPES[number];

// 日別の広告費用入力データ
export interface DailyAdCost {
  id: string;
  date: string; // YYYY-MM-DD形式
  mediaType: MediaType;
  cost: number;
  contractCount: number; // 成約数
  note?: string;
}

// 月次集計データ
export interface MonthlyMediaReport {
  yearMonth: string; // YYYY-MM形式
  mediaType: MediaType;
  // スプレッドシートから集計
  leadCount: number; // LINE登録/フォーマット記入数（「何を見て知った？」から）
  // ユーザー入力から集計
  totalAdCost: number; // 広告費用の合計
  totalContractCount: number; // 成約数の合計
  // 計算値
  averageCostPerDay: number; // 日平均単価
  contractRate: number; // 成約率（成約数 / リード数）
  costPerLead: number; // リード1件あたりのコスト
  costPerContract: number; // 成約1件あたりのコスト
}

// 全媒体の月次サマリー
export interface MonthlyOverallReport {
  yearMonth: string;
  mediaReports: MonthlyMediaReport[];
  totalLeadCount: number;
  totalAdCost: number;
  totalContractCount: number;
  overallContractRate: number;
  overallCostPerLead: number;
  overallCostPerContract: number;
}
