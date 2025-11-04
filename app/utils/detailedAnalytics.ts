import { SpreadsheetData } from '../types/spreadsheet.types';
import { MediaType } from '../types/media.types';
import {
  MediaDetailedAnalysis,
  HourlyDistribution,
  PetTypeDistribution,
} from '../types/analysis.types';
import { normalizeMediaName } from './mediaAnalytics';
import { analyzeRent } from './rentAnalytics';

/**
 * 媒体別の詳細分析を実行
 */
export function calculateMediaDetailedAnalysis(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string | 'all-time',
  dateColumn: string = '回答日時',
  mediaColumn: string = '何を見て知った？',
  petColumn: string = 'ペットは何匹？'
): MediaDetailedAnalysis {
  // 対象月・対象媒体のデータを抽出
  const targetRows = csvData.rows.filter(row => {
    const dateValue = row[dateColumn];
    const mediaValue = row[mediaColumn];

    if (!dateValue || typeof dateValue !== 'string') return false;

    // 全期間の場合は日付フィルタなし
    if (yearMonth === 'all-time') {
      const normalizedMedia = normalizeMediaName(String(mediaValue));
      return normalizedMedia === mediaType;
    }

    const datePart = dateValue.split(' ')[0];
    if (!datePart.startsWith(yearMonth)) return false;

    const normalizedMedia = normalizeMediaName(String(mediaValue));
    return normalizedMedia === mediaType;
  });

  const totalLeads = targetRows.length;

  // 時間帯分析
  const hourlyDistribution = calculateHourlyDistribution(targetRows, dateColumn);
  const peakHour = findPeakHour(hourlyDistribution);

  // ペット種類分析
  const petTypeDistribution = calculatePetTypeDistribution(targetRows, petColumn);

  // 犬猫の区分
  const { dogCount, catCount, bothCount, unknownCount } = calculatePetCategory(
    targetRows,
    petColumn
  );

  // 希望家賃分析
  const rentAnalysis = analyzeRent(
    csvData,
    mediaType,
    yearMonth,
    dateColumn,
    mediaColumn
  );

  return {
    mediaType,
    yearMonth,
    totalLeads,
    hourlyDistribution,
    peakHour,
    petTypeDistribution,
    dogCount,
    catCount,
    bothCount,
    unknownCount,
    rentAnalysis,
  };
}

/**
 * 時間帯別の分布を計算
 */
function calculateHourlyDistribution(
  rows: Record<string, string | number>[],
  dateColumn: string
): HourlyDistribution[] {
  const hourCounts: { [hour: number]: number } = {};

  // 0-23時を初期化
  for (let h = 0; h < 24; h++) {
    hourCounts[h] = 0;
  }

  rows.forEach(row => {
    const dateValue = row[dateColumn];
    if (!dateValue || typeof dateValue !== 'string') return;

    // "2024-11-02 07:17:22 pm" から時刻を抽出
    const timePart = dateValue.split(' ')[1]; // "07:17:22"
    const period = dateValue.split(' ')[2]; // "pm" or "am"

    if (!timePart) return;

    let hour = parseInt(timePart.split(':')[0], 10);

    // 12時間表記を24時間表記に変換
    if (period === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }

    if (hour >= 0 && hour < 24) {
      hourCounts[hour]++;
    }
  });

  return Object.entries(hourCounts).map(([hour, count]) => ({
    hour: parseInt(hour, 10),
    count,
  }));
}

/**
 * ピーク時間帯を見つける
 */
function findPeakHour(distribution: HourlyDistribution[]): number {
  let maxCount = 0;
  let peakHour = 0;

  distribution.forEach(({ hour, count }) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = hour;
    }
  });

  return peakHour;
}

/**
 * ペット種類別の分布を計算
 */
function calculatePetTypeDistribution(
  rows: Record<string, string | number>[],
  petColumn: string
): PetTypeDistribution[] {
  const petTypeCounts: { [type: string]: number } = {};

  rows.forEach(row => {
    const petValue = row[petColumn];
    const petType = petValue ? String(petValue).trim() : '(不明)';

    petTypeCounts[petType] = (petTypeCounts[petType] || 0) + 1;
  });

  const total = rows.length;

  return Object.entries(petTypeCounts)
    .map(([petType, count]) => ({
      petType,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count); // 多い順
}

/**
 * 犬猫の区分を計算
 */
function calculatePetCategory(
  rows: Record<string, string | number>[],
  petColumn: string
): { dogCount: number; catCount: number; bothCount: number; unknownCount: number } {
  let dogCount = 0;
  let catCount = 0;
  let bothCount = 0;
  let unknownCount = 0;

  rows.forEach(row => {
    const petValue = row[petColumn];
    if (!petValue) {
      unknownCount++;
      return;
    }

    const petStr = String(petValue).toLowerCase();

    const hasDog = petStr.includes('犬');
    const hasCat = petStr.includes('猫');

    if (hasDog && hasCat) {
      bothCount++;
    } else if (hasDog) {
      dogCount++;
    } else if (hasCat) {
      catCount++;
    } else {
      unknownCount++;
    }
  });

  return { dogCount, catCount, bothCount, unknownCount };
}
