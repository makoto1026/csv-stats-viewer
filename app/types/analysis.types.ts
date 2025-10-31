import { MediaType } from './media.types';

// 時間帯分析
export interface HourlyDistribution {
  hour: number; // 0-23
  count: number;
}

// ペット種類分析
export interface PetTypeDistribution {
  petType: string; // 例: "多頭飼い（犬２匹以上）", "猫１匹", "犬１匹"
  count: number;
  percentage: number;
}

// 媒体別詳細分析
export interface MediaDetailedAnalysis {
  mediaType: MediaType;
  yearMonth: string | 'all-time'; // 'all-time'は全期間を表す
  totalLeads: number;

  // 時間帯分析
  hourlyDistribution: HourlyDistribution[];
  peakHour: number; // 最も多い時間帯

  // ペット種類分析
  petTypeDistribution: PetTypeDistribution[];

  // 犬猫の区分
  dogCount: number; // 犬を飼っている人
  catCount: number; // 猫を飼っている人
  bothCount: number; // 両方飼っている人
  unknownCount: number; // 不明
}

// フィルタ条件
export interface AnalysisFilter {
  petType?: string; // ペット種類でフィルタ
  hourRange?: { start: number; end: number }; // 時間帯でフィルタ
}
