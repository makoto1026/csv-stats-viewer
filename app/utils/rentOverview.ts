import { SpreadsheetData } from '../types/spreadsheet.types';
import { RentOverviewSummary, RentStatsByMonthMedia } from '../types/rentOverview.types';
import { MediaType, MEDIA_TYPES } from '../types/media.types';
import { analyzeRent } from './rentAnalytics';

/**
 * 家賃上限の全体分析を生成
 *
 * @param csvData - スプレッドシートデータ
 * @param dateColumn - 日付カラム名
 * @param mediaColumn - 媒体カラム名
 * @returns 希望家賃上限分析サマリー
 */
export function generateRentOverview(
  csvData: SpreadsheetData,
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): RentOverviewSummary {
  console.log('[希望家賃上限分析] データ処理開始');
  console.log('dateColumn:', dateColumn);
  console.log('総行数:', csvData.rows.length);

  // 全ての年月を抽出
  const yearMonths = new Set<string>();
  csvData.rows.forEach((row, index) => {
    const dateValue = String(row[dateColumn] || '');
    const datePart = dateValue.split(' ')[0]; // "2024-11-02"

    // デバッグ: 最初の3行の日付フォーマットを確認
    if (index < 3) {
      console.log(`Row ${index}: dateValue="${dateValue}", datePart="${datePart}"`);
    }

    if (datePart.match(/^\d{4}-\d{2}/)) {
      const yearMonth = datePart.substring(0, 7); // "2024-11"
      yearMonths.add(yearMonth);
    } else if (datePart.match(/^\d{4}\/\d{2}/)) {
      // スラッシュ区切りの場合
      const yearMonth = datePart.substring(0, 7).replace('/', '-'); // "2024/11" → "2024-11"
      yearMonths.add(yearMonth);
    }
  });

  const sortedYearMonths = Array.from(yearMonths).sort();
  console.log('検出された年月:', sortedYearMonths);

  // 月別・媒体別の統計を計算
  const monthlyMediaStats: RentStatsByMonthMedia[] = [];
  const allRentValues: number[] = [];

  sortedYearMonths.forEach(yearMonth => {
    MEDIA_TYPES.forEach(mediaType => {
      const analysis = analyzeRent(csvData, mediaType, yearMonth, dateColumn, mediaColumn);

      if (analysis && analysis.validCount > 0) {
        console.log(`${yearMonth} - ${mediaType}: ${analysis.validCount}件`);
        monthlyMediaStats.push({
          yearMonth,
          mediaType,
          averageRent: analysis.averageRent,
          medianRent: analysis.medianRent,
          minRent: analysis.minRent,
          maxRent: analysis.maxRent,
          responseCount: analysis.validCount,
        });
        allRentValues.push(...analysis.rentValues);
      }
    });
  });

  console.log('月別媒体別統計の総数:', monthlyMediaStats.length);
  console.log('全有効回答数:', allRentValues.length);

  // 全期間の統計を計算
  const overallAverage = allRentValues.length > 0
    ? allRentValues.reduce((sum, v) => sum + v, 0) / allRentValues.length
    : 0;

  const sortedAll = [...allRentValues].sort((a, b) => a - b);
  const overallMedian = sortedAll.length > 0
    ? sortedAll[Math.floor(sortedAll.length / 2)]
    : 0;

  return {
    monthlyMediaStats,
    overallAverage,
    overallMedian,
    period: {
      start: sortedYearMonths[0] || '',
      end: sortedYearMonths[sortedYearMonths.length - 1] || '',
    },
    totalResponses: allRentValues.length,
  };
}

/**
 * 媒体名を表示用に返す（すでに日本語なのでそのまま返す）
 */
export function getMediaDisplayName(mediaType: MediaType): string {
  return mediaType;
}
