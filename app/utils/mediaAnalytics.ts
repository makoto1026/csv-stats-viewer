import { SpreadsheetData } from '../types/spreadsheet.types';
import {
  MediaType,
  MEDIA_TYPES,
  MonthlyMediaReport,
  MonthlyOverallReport,
  DailyAdCost,
  AllTimeMediaReport,
  AllTimeOverallReport
} from '../types/media.types';
import { getMediaAdCostsByMonthAndType, loadMediaAdCosts } from './mediaAdStorage';

/**
 * 日別・媒体別のリード数を集計
 */
export interface DailyLeadCount {
  date: string; // YYYY-MM-DD形式
  leadCount: number;
}

/**
 * 特定の日・媒体のリード数をカウント
 */
export function countLeadsByMediaAndDate(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  date: string, // YYYY-MM-DD形式
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): number {
  let count = 0;

  for (const row of csvData.rows) {
    const dateValue = row[dateColumn];
    const mediaValue = row[mediaColumn];

    // 日付が一致するかチェック
    // dateValueは "2024-11-02 07:17:22 pm" のような形式
    // dateは "2024-11-02" 形式
    if (dateValue && typeof dateValue === 'string') {
      // 日付部分のみを抽出して比較
      const datePart = dateValue.split(' ')[0]; // "2024-11-02"

      if (datePart === date) {
        // 媒体名が一致するかチェック
        const normalizedMedia = normalizeMediaName(String(mediaValue));
        if (normalizedMedia === mediaType) {
          count++;
        }
      }
    }
  }

  return count;
}

/**
 * 月のすべての日付リストを生成
 */
export function generateMonthDates(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const dates: string[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`;
    dates.push(dateStr);
  }

  return dates;
}

/**
 * 月全体の日別・媒体別リード数を集計
 */
export function getDailyLeadCounts(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string,
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): DailyLeadCount[] {
  const dates = generateMonthDates(yearMonth);

  return dates.map(date => ({
    date,
    leadCount: countLeadsByMediaAndDate(csvData, mediaType, date, dateColumn, mediaColumn),
  }));
}

/**
 * スプレッドシートの「何を見て知った?」列から媒体別のリード数をカウント
 */
export function countLeadsByMedia(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string,
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): number {
  let count = 0;

  for (const row of csvData.rows) {
    const dateValue = row[dateColumn];
    const mediaValue = row[mediaColumn];

    // 日付が指定月に含まれるかチェック
    if (dateValue && typeof dateValue === 'string') {
      // 日付部分のみを抽出
      const datePart = dateValue.split(' ')[0]; // "2024-11-02"

      if (datePart.startsWith(yearMonth)) {
        // 媒体名が一致するかチェック
        const normalizedMedia = normalizeMediaName(String(mediaValue));
        if (normalizedMedia === mediaType) {
          count++;
        }
      }
    }
  }

  return count;
}

/**
 * 媒体別の月次レポートを計算
 */
export function calculateMonthlyMediaReport(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string,
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): MonthlyMediaReport {
  // スプレッドシートからリード数を集計
  const leadCount = countLeadsByMedia(csvData, mediaType, yearMonth, dateColumn, mediaColumn);

  // ローカルストレージから広告費用データを取得
  const adCosts = getMediaAdCostsByMonthAndType(yearMonth, mediaType);

  // 広告費用と成約数を集計
  const totalAdCost = adCosts.reduce((sum, cost) => sum + cost.cost, 0);
  const totalContractCount = adCosts.reduce((sum, cost) => sum + cost.contractCount, 0);

  // 日数を計算
  const daysCount = new Set(adCosts.map(cost => cost.date)).size;

  // 計算値
  const averageCostPerDay = daysCount > 0 ? totalAdCost / daysCount : 0;
  const contractRate = leadCount > 0 ? (totalContractCount / leadCount) * 100 : 0;
  const costPerLead = leadCount > 0 ? totalAdCost / leadCount : 0;
  const costPerContract = totalContractCount > 0 ? totalAdCost / totalContractCount : 0;

  return {
    yearMonth,
    mediaType,
    leadCount,
    totalAdCost,
    totalContractCount,
    averageCostPerDay,
    contractRate,
    costPerLead,
    costPerContract,
  };
}

/**
 * 全媒体の月次レポートを計算
 */
export function calculateMonthlyOverallReport(
  csvData: SpreadsheetData,
  yearMonth: string,
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): MonthlyOverallReport {
  const mediaReports: MonthlyMediaReport[] = MEDIA_TYPES.map(mediaType =>
    calculateMonthlyMediaReport(csvData, mediaType, yearMonth, dateColumn, mediaColumn)
  );

  // 合計値を計算
  const totalLeadCount = mediaReports.reduce((sum, report) => sum + report.leadCount, 0);
  const totalAdCost = mediaReports.reduce((sum, report) => sum + report.totalAdCost, 0);
  const totalContractCount = mediaReports.reduce((sum, report) => sum + report.totalContractCount, 0);

  // 全体の計算値
  const overallContractRate = totalLeadCount > 0 ? (totalContractCount / totalLeadCount) * 100 : 0;
  const overallCostPerLead = totalLeadCount > 0 ? totalAdCost / totalLeadCount : 0;
  const overallCostPerContract = totalContractCount > 0 ? totalAdCost / totalContractCount : 0;

  return {
    yearMonth,
    mediaReports,
    totalLeadCount,
    totalAdCost,
    totalContractCount,
    overallContractRate,
    overallCostPerLead,
    overallCostPerContract,
  };
}

/**
 * 媒体名の正規化（スプレッドシートの値とマスタデータのマッチング精度向上）
 */
export function normalizeMediaName(value: string): MediaType | null {
  const normalized = value.trim();

  // 完全一致
  for (const mediaType of MEDIA_TYPES) {
    if (normalized === mediaType) {
      return mediaType;
    }
  }

  // 部分一致
  const lowerValue = normalized.toLowerCase();
  if (lowerValue.includes('instagram') || lowerValue.includes('インスタ')) return 'Instagram';
  if (lowerValue.includes('tiktok') || lowerValue.includes('ティックトック')) return 'TikTok';
  if (lowerValue.includes('youtube') || lowerValue.includes('ユーチューブ')) return 'YouTube';
  if (lowerValue.includes('lemon8') || lowerValue.includes('レモン')) return 'Lemon8';
  if (lowerValue.includes('line') || lowerValue.includes('ライン')) return 'LINE';
  if (lowerValue.includes('ラグジュアリー') || lowerValue.includes('luxury')) return 'ラグジュアリーカード';
  if (lowerValue.includes('ホームページ') || lowerValue.includes('hp') || lowerValue.includes('web')) return 'ホームページ';
  if (lowerValue.includes('チラシ') || lowerValue.includes('flyer')) return 'チラシ';
  if (lowerValue.includes('紹介') || lowerValue.includes('その他')) return 'その他（紹介等）';
  if (lowerValue.includes('classy') || lowerValue.includes('雑誌')) return 'CLASSY(雑誌)';

  return null;
}

/**
 * 全期間の媒体別リード数をカウント
 */
export function countAllTimeLeadsByMedia(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  mediaColumn: string = '何を見て知った？'
): number {
  let count = 0;

  for (const row of csvData.rows) {
    const mediaValue = row[mediaColumn];
    const normalizedMedia = normalizeMediaName(String(mediaValue));
    if (normalizedMedia === mediaType) {
      count++;
    }
  }

  return count;
}

/**
 * 全期間の媒体別レポートを計算
 */
export function calculateAllTimeMediaReport(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  mediaColumn: string = '何を見て知った？'
): AllTimeMediaReport {
  // 全期間のリード数を集計
  const leadCount = countAllTimeLeadsByMedia(csvData, mediaType, mediaColumn);

  // ローカルストレージから全期間の広告費用データを取得
  const allAdCosts = loadMediaAdCosts();
  const mediaAdCosts = allAdCosts.filter(cost => cost.mediaType === mediaType);

  // 広告費用と成約数を集計
  const totalAdCost = mediaAdCosts.reduce((sum, cost) => sum + cost.cost, 0);
  const totalContractCount = mediaAdCosts.reduce((sum, cost) => sum + cost.contractCount, 0);

  // データがある月数を計算
  const uniqueMonths = new Set(mediaAdCosts.map(cost => cost.date.substring(0, 7))); // YYYY-MM
  const monthCount = uniqueMonths.size;

  // 計算値
  const contractRate = leadCount > 0 ? (totalContractCount / leadCount) * 100 : 0;
  const costPerLead = leadCount > 0 ? totalAdCost / leadCount : 0;
  const costPerContract = totalContractCount > 0 ? totalAdCost / totalContractCount : 0;

  return {
    mediaType,
    leadCount,
    totalAdCost,
    totalContractCount,
    contractRate,
    costPerLead,
    costPerContract,
    monthCount,
  };
}

/**
 * 全期間の全媒体レポートを計算
 */
export function calculateAllTimeOverallReport(
  csvData: SpreadsheetData,
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): AllTimeOverallReport {
  const mediaReports: AllTimeMediaReport[] = MEDIA_TYPES.map(mediaType =>
    calculateAllTimeMediaReport(csvData, mediaType, mediaColumn)
  );

  // 合計値を計算
  const totalLeadCount = mediaReports.reduce((sum, report) => sum + report.leadCount, 0);
  const totalAdCost = mediaReports.reduce((sum, report) => sum + report.totalAdCost, 0);
  const totalContractCount = mediaReports.reduce((sum, report) => sum + report.totalContractCount, 0);

  // 全体の計算値
  const overallContractRate = totalLeadCount > 0 ? (totalContractCount / totalLeadCount) * 100 : 0;
  const overallCostPerLead = totalLeadCount > 0 ? totalAdCost / totalLeadCount : 0;
  const overallCostPerContract = totalContractCount > 0 ? totalAdCost / totalContractCount : 0;

  // データの日付範囲を取得
  const allDates = csvData.rows
    .map(row => row[dateColumn])
    .filter((val): val is string => typeof val === 'string')
    .map(dateValue => dateValue.split(' ')[0]); // "2024-11-02" 形式に変換

  const sortedDates = allDates.sort();
  const dateRange = {
    start: sortedDates[0] || '',
    end: sortedDates[sortedDates.length - 1] || '',
  };

  return {
    mediaReports,
    totalLeadCount,
    totalAdCost,
    totalContractCount,
    overallContractRate,
    overallCostPerLead,
    overallCostPerContract,
    dateRange,
  };
}
