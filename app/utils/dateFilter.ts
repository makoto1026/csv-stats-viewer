import { CSVData } from '../types/csv.types';
import { DateFilter } from '../types/filter.types';

/**
 * 日時型のカラムを検出
 */
export function detectDateColumn(data: CSVData): string | null {
  for (const header of data.headers) {
    // ヘッダー名に「日時」「日付」が含まれるか確認
    if (header.includes('日時') || header.includes('日付') || header.toLowerCase().includes('date')) {
      return header;
    }
  }

  // ヘッダー名で判定できない場合、データから判定
  for (const header of data.headers) {
    const values = data.rows.slice(0, 10).map(row => row[header]);
    const dateCount = values.filter(value => {
      if (!value) return false;
      const date = new Date(String(value));
      return !isNaN(date.getTime());
    }).length;

    // 80%以上が日時形式なら日時カラムと判定
    if (dateCount / values.length >= 0.8) {
      return header;
    }
  }

  return null;
}

/**
 * データを期間でフィルタリング
 */
export function filterDataByPeriod(
  data: CSVData,
  dateColumn: string,
  filter: DateFilter
): CSVData {
  if (filter.period === 'all') {
    return data;
  }

  const filteredRows = data.rows.filter(row => {
    const value = row[dateColumn];
    if (!value) return false;

    const date = new Date(String(value));
    if (isNaN(date.getTime())) return false;

    if (filter.period === 'month' && filter.selectedMonth) {
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return yearMonth === filter.selectedMonth;
    }

    if (filter.period === 'custom') {
      if (filter.startDate && date < filter.startDate) return false;
      if (filter.endDate) {
        // endDateの23:59:59まで含める
        const endOfDay = new Date(filter.endDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (date > endOfDay) return false;
      }
      return true;
    }

    return true;
  });

  return {
    ...data,
    rows: filteredRows,
  };
}

/**
 * データから利用可能な月のリストを取得
 */
export function getAvailableMonths(data: CSVData, dateColumn: string): string[] {
  const monthSet = new Set<string>();

  data.rows.forEach(row => {
    const value = row[dateColumn];
    if (!value) return;

    const date = new Date(String(value));
    if (isNaN(date.getTime())) return;

    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(yearMonth);
  });

  return Array.from(monthSet).sort().reverse();
}

/**
 * データの日付範囲を取得
 */
export function getDateRange(data: CSVData, dateColumn: string): { min: Date; max: Date } | null {
  const dates: Date[] = [];

  data.rows.forEach(row => {
    const value = row[dateColumn];
    if (!value) return;

    const date = new Date(String(value));
    if (!isNaN(date.getTime())) {
      dates.push(date);
    }
  });

  if (dates.length === 0) return null;

  const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}
