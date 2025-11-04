import { SpreadsheetData } from '../types/spreadsheet.types';
import { MonthlyResponseCount, ResponseAnalysisSummary } from '../types/response.types';

/**
 * 月別の回答数を集計
 *
 * @param csvData - スプレッドシートデータ
 * @param dateColumn - 日付カラム名
 * @returns 月別回答数データ
 */
export function calculateMonthlyResponseCounts(
  csvData: SpreadsheetData,
  dateColumn: string
): MonthlyResponseCount[] {
  // 月ごとにグループ化
  const monthCountMap = new Map<string, number>();

  csvData.rows.forEach(row => {
    const dateValue = String(row[dateColumn] || '');
    const datePart = dateValue.split(' ')[0]; // "2024-11-02"

    if (datePart && datePart.length >= 7) {
      const yearMonth = datePart.substring(0, 7); // "2024-11"
      monthCountMap.set(yearMonth, (monthCountMap.get(yearMonth) || 0) + 1);
    }
  });

  // 月をソート（昇順）
  const sortedMonths = Array.from(monthCountMap.keys()).sort();

  // 前月比を計算
  const monthlyData: MonthlyResponseCount[] = sortedMonths.map((yearMonth, index) => {
    const count = monthCountMap.get(yearMonth) || 0;

    let changeFromPrevMonth: number | null = null;
    let changeRateFromPrevMonth: number | null = null;

    if (index > 0) {
      const prevMonth = sortedMonths[index - 1];
      const prevCount = monthCountMap.get(prevMonth) || 0;
      changeFromPrevMonth = count - prevCount;

      if (prevCount > 0) {
        changeRateFromPrevMonth = (changeFromPrevMonth / prevCount) * 100;
      }
    }

    return {
      yearMonth,
      count,
      changeFromPrevMonth,
      changeRateFromPrevMonth,
    };
  });

  return monthlyData;
}

/**
 * 回答数分析のサマリーを生成
 *
 * @param csvData - スプレッドシートデータ
 * @param dateColumn - 日付カラム名
 * @returns 回答数分析サマリー
 */
export function generateResponseAnalysisSummary(
  csvData: SpreadsheetData,
  dateColumn: string
): ResponseAnalysisSummary {
  const monthlyData = calculateMonthlyResponseCounts(csvData, dateColumn);

  const totalCount = csvData.rows.length;
  const averageMonthlyCount = monthlyData.length > 0
    ? totalCount / monthlyData.length
    : 0;

  // 最多回答月を検索
  let peakMonth: { yearMonth: string; count: number } | null = null;
  let lowestMonth: { yearMonth: string; count: number } | null = null;

  monthlyData.forEach(item => {
    if (!peakMonth || item.count > peakMonth.count) {
      peakMonth = { yearMonth: item.yearMonth, count: item.count };
    }
    if (!lowestMonth || item.count < lowestMonth.count) {
      lowestMonth = { yearMonth: item.yearMonth, count: item.count };
    }
  });

  const period = monthlyData.length > 0
    ? {
        start: monthlyData[0].yearMonth,
        end: monthlyData[monthlyData.length - 1].yearMonth,
      }
    : { start: '', end: '' };

  return {
    totalCount,
    monthlyData,
    averageMonthlyCount,
    peakMonth,
    lowestMonth,
    period,
  };
}
