import { SpreadsheetData } from '../types/spreadsheet.types';
import { ColumnStats, ValueFrequency } from '../types/stats.types';

export function calculateColumnStats(
  data: SpreadsheetData,
  columnName: string
): ColumnStats {
  const values = data.rows.map((row) => row[columnName]);
  const totalCount = values.length;
  const nullCount = values.filter((v) => v === '' || v === null || v === undefined).length;
  const nonNullValues = values.filter((v) => v !== '' && v !== null && v !== undefined);

  // データ型の判定
  const dataType = detectDataType(nonNullValues);

  // ユニーク値の数
  const uniqueValues = new Set(nonNullValues.map(String));
  const uniqueCount = uniqueValues.size;

  const stats: ColumnStats = {
    columnName,
    dataType,
    totalCount,
    uniqueCount,
    nullCount,
  };

  // 数値型の統計
  if (dataType === 'number') {
    const numericValues = nonNullValues
      .map((v) => (typeof v === 'number' ? v : parseFloat(String(v))))
      .filter((v) => !isNaN(v));

    if (numericValues.length > 0) {
      const sorted = [...numericValues].sort((a, b) => a - b);
      const sum = numericValues.reduce((acc, v) => acc + v, 0);
      const mean = sum / numericValues.length;
      const median = calculateMedian(sorted);

      stats.numericStats = {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean,
        median,
        sum,
      };
    }
  }

  // 文字列型の統計
  if (dataType === 'string' || dataType === 'mixed') {
    const stringValues = nonNullValues.map(String);
    const frequencies = calculateFrequencies(stringValues);
    const topValues = frequencies.slice(0, 10);

    const lengths = stringValues.map((v) => v.length);
    const maxLength = Math.max(...lengths);
    const minLength = Math.min(...lengths);
    const avgLength = lengths.reduce((acc, l) => acc + l, 0) / lengths.length;

    stats.stringStats = {
      topValues,
      maxLength,
      minLength,
      avgLength: Math.round(avgLength * 10) / 10,
    };
  }

  // 日時型の統計
  if (dataType === 'date') {
    const dateValues = nonNullValues
      .map((v) => {
        const date = new Date(String(v));
        return isNaN(date.getTime()) ? null : date;
      })
      .filter((d): d is Date => d !== null);

    if (dateValues.length > 0) {
      // 時間帯別の分布
      const hourDistribution = calculateHourDistribution(dateValues);

      // 曜日別の分布
      const dayOfWeekDistribution = calculateDayOfWeekDistribution(dateValues);

      // 日付範囲
      const sortedDates = [...dateValues].sort((a, b) => a.getTime() - b.getTime());
      const dateRange = {
        min: sortedDates[0].toLocaleString('ja-JP'),
        max: sortedDates[sortedDates.length - 1].toLocaleString('ja-JP'),
      };

      stats.dateTimeStats = {
        hourDistribution,
        dayOfWeekDistribution,
        dateRange,
      };
    }
  }

  return stats;
}

export function getValueFrequencies(
  data: SpreadsheetData,
  columnName: string,
  limit = 20
): ValueFrequency[] {
  const values = data.rows
    .map((row) => row[columnName])
    .filter((v) => v !== '' && v !== null && v !== undefined);

  const totalCount = values.length;
  const frequencyMap = new Map<string, number>();

  values.forEach((value) => {
    const key = String(value);
    frequencyMap.set(key, (frequencyMap.get(key) || 0) + 1);
  });

  const frequencies: ValueFrequency[] = Array.from(frequencyMap.entries())
    .map(([value, count]) => ({
      value,
      count,
      percentage: Math.round((count / totalCount) * 10000) / 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return frequencies;
}

function detectDataType(values: (string | number)[]): 'number' | 'string' | 'date' | 'mixed' {
  if (values.length === 0) return 'string';

  let numberCount = 0;
  let stringCount = 0;
  let dateCount = 0;

  for (const value of values) {
    if (typeof value === 'number') {
      numberCount++;
    } else {
      const strValue = String(value);

      // 日時形式かチェック（数値チェックの前に実行）
      if (isDateString(strValue)) {
        dateCount++;
      } else if (!isNaN(parseFloat(strValue)) && isFinite(Number(strValue))) {
        // 数値に変換可能かチェック
        numberCount++;
      } else {
        stringCount++;
      }
    }
  }

  // デバッグ用ログ（開発時のみ）
  if (dateCount > 0) {
    console.log('Data type detection:', {
      total: values.length,
      numberCount,
      stringCount,
      dateCount,
      sample: values.slice(0, 3),
    });
  }

  // 80%以上が日時なら日時型
  if (dateCount / values.length >= 0.8) {
    return 'date';
  }

  // 80%以上が数値なら数値型
  if (numberCount / values.length >= 0.8) {
    return 'number';
  }

  // それ以外は文字列型
  if (stringCount > 0) {
    return numberCount > 0 || dateCount > 0 ? 'mixed' : 'string';
  }

  return 'string';
}

function isDateString(value: string): boolean {
  // 値が空または短すぎる場合は日時ではない
  if (!value || value.length < 8) return false;

  // 一般的な日時フォーマットをチェック
  const datePatterns = [
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/, // YYYY-MM-DD or YYYY/MM/DD
    /^\d{4}[-/]\d{1,2}[-/]\d{1,2}\s+\d{1,2}:\d{1,2}/, // YYYY-MM-DD HH:mm
    /^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/, // DD-MM-YYYY or MM/DD/YYYY
    /^\d{1,2}[-/]\d{1,2}[-/]\d{4}\s+\d{1,2}:\d{1,2}/, // DD-MM-YYYY HH:mm
  ];

  const matches = datePatterns.some(pattern => pattern.test(value.trim()));
  if (!matches) return false;

  // 実際にDateオブジェクトとして解析できるかチェック
  const date = new Date(value);
  return !isNaN(date.getTime());
}

function calculateMedian(sortedValues: number[]): number {
  const mid = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 0) {
    return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  }

  return sortedValues[mid];
}

function calculateFrequencies(values: string[]): Array<{ value: string; count: number }> {
  const frequencyMap = new Map<string, number>();

  values.forEach((value) => {
    frequencyMap.set(value, (frequencyMap.get(value) || 0) + 1);
  });

  return Array.from(frequencyMap.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count);
}

function calculateHourDistribution(dates: Date[]): Array<{ hour: number; count: number }> {
  const hourCounts = new Map<number, number>();

  // 0-23時すべてを初期化
  for (let i = 0; i < 24; i++) {
    hourCounts.set(i, 0);
  }

  // 各日時から時間を抽出してカウント
  dates.forEach((date) => {
    const hour = date.getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  return Array.from(hourCounts.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);
}

function calculateDayOfWeekDistribution(
  dates: Date[]
): Array<{ dayOfWeek: number; dayName: string; count: number }> {
  const dayNames = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
  const dayCounts = new Map<number, number>();

  // 0-6（日曜-土曜）すべてを初期化
  for (let i = 0; i < 7; i++) {
    dayCounts.set(i, 0);
  }

  // 各日時から曜日を抽出してカウント
  dates.forEach((date) => {
    const dayOfWeek = date.getDay();
    dayCounts.set(dayOfWeek, (dayCounts.get(dayOfWeek) || 0) + 1);
  });

  return Array.from(dayCounts.entries())
    .map(([dayOfWeek, count]) => ({
      dayOfWeek,
      dayName: dayNames[dayOfWeek],
      count,
    }))
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}
