/**
 * 月別回答数データ
 */
export interface MonthlyResponseCount {
  /** 年月（YYYY-MM） */
  yearMonth: string;
  /** 回答数 */
  count: number;
  /** 前月比増減数 */
  changeFromPrevMonth: number | null;
  /** 前月比増減率（%） */
  changeRateFromPrevMonth: number | null;
}

/**
 * 回答数分析の全体サマリー
 */
export interface ResponseAnalysisSummary {
  /** 総回答数 */
  totalCount: number;
  /** 月別データ */
  monthlyData: MonthlyResponseCount[];
  /** 平均月間回答数 */
  averageMonthlyCount: number;
  /** 最多回答月 */
  peakMonth: {
    yearMonth: string;
    count: number;
  } | null;
  /** 最少回答月 */
  lowestMonth: {
    yearMonth: string;
    count: number;
  } | null;
  /** データ期間 */
  period: {
    start: string; // YYYY-MM
    end: string;   // YYYY-MM
  };
}
