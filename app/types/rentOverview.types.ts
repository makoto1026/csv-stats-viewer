import { MediaType } from './media.types';

/**
 * 月別・媒体別の家賃統計
 */
export interface RentStatsByMonthMedia {
  yearMonth: string;
  mediaType: MediaType;
  averageRent: number;
  medianRent: number;
  minRent: number;
  maxRent: number;
  responseCount: number;
}

/**
 * 希望家賃上限分析の全体サマリー
 */
export interface RentOverviewSummary {
  /** 月別・媒体別の統計データ */
  monthlyMediaStats: RentStatsByMonthMedia[];
  /** 全期間の平均家賃 */
  overallAverage: number;
  /** 全期間の中央値 */
  overallMedian: number;
  /** 分析期間 */
  period: { start: string; end: string };
  /** 総回答数 */
  totalResponses: number;
}
