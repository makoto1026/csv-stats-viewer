import { CSVData } from '../types/csv.types';
import { AdCost, AdPerformance } from '../types/advertisement.types';

/**
 * 指定期間内の回答数をカウント
 */
export function countResponsesInPeriod(
  csvData: CSVData,
  dateColumn: string,
  startDate: Date,
  endDate: Date
): number {
  let count = 0;

  for (const row of csvData.rows) {
    const dateValue = row[dateColumn];
    if (!dateValue) continue;

    const date = new Date(String(dateValue));
    if (isNaN(date.getTime())) continue;

    // 期間内かチェック
    if (date >= startDate && date <= endDate) {
      count++;
    }
  }

  return count;
}

/**
 * 日別の回答数を取得
 */
export function getResponseCountsByDate(
  csvData: CSVData,
  dateColumn: string,
  startDate: Date,
  endDate: Date
): { date: string; count: number }[] {
  const countMap = new Map<string, number>();

  for (const row of csvData.rows) {
    const dateValue = row[dateColumn];
    if (!dateValue) continue;

    const date = new Date(String(dateValue));
    if (isNaN(date.getTime())) continue;

    // 期間内かチェック
    if (date >= startDate && date <= endDate) {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      countMap.set(dateStr, (countMap.get(dateStr) || 0) + 1);
    }
  }

  // 日付順にソート
  return Array.from(countMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * 広告費用対効果を計算
 */
export function calculateAdPerformance(
  csvData: CSVData,
  dateColumn: string,
  adCost: AdCost
): AdPerformance {
  const { startDate, endDate, cost } = adCost;

  // 終了日の23:59:59まで含める
  const adjustedEndDate = new Date(endDate);
  adjustedEndDate.setHours(23, 59, 59, 999);

  const responseCount = countResponsesInPeriod(
    csvData,
    dateColumn,
    startDate,
    adjustedEndDate
  );

  const responseCounts = getResponseCountsByDate(
    csvData,
    dateColumn,
    startDate,
    adjustedEndDate
  );

  const costPerResponse = responseCount > 0 ? cost / responseCount : 0;

  const periodStr = `${startDate.toLocaleDateString('ja-JP')} 〜 ${endDate.toLocaleDateString('ja-JP')}`;

  return {
    period: periodStr,
    totalCost: cost,
    responseCount,
    costPerResponse,
    responseCounts,
  };
}

/**
 * 複数の広告費用の合計パフォーマンスを計算
 */
export function calculateTotalAdPerformance(
  csvData: CSVData,
  dateColumn: string,
  adCosts: AdCost[]
): AdPerformance | null {
  if (adCosts.length === 0) return null;

  // 全期間の最小・最大日付を取得
  const allDates = adCosts.flatMap(cost => [cost.startDate, cost.endDate]);
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

  // 終了日の23:59:59まで含める
  const adjustedMaxDate = new Date(maxDate);
  adjustedMaxDate.setHours(23, 59, 59, 999);

  const totalCost = adCosts.reduce((sum, cost) => sum + cost.cost, 0);

  const responseCount = countResponsesInPeriod(
    csvData,
    dateColumn,
    minDate,
    adjustedMaxDate
  );

  const responseCounts = getResponseCountsByDate(
    csvData,
    dateColumn,
    minDate,
    adjustedMaxDate
  );

  const costPerResponse = responseCount > 0 ? totalCost / responseCount : 0;

  const periodStr = `${minDate.toLocaleDateString('ja-JP')} 〜 ${maxDate.toLocaleDateString('ja-JP')}`;

  return {
    period: periodStr,
    totalCost,
    responseCount,
    costPerResponse,
    responseCounts,
  };
}
