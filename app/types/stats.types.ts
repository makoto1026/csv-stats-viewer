export interface ColumnStats {
  columnName: string;
  dataType: 'number' | 'string' | 'date' | 'mixed';
  totalCount: number;
  uniqueCount: number;
  nullCount: number;

  // 数値型の統計
  numericStats?: {
    min: number;
    max: number;
    mean: number;
    median: number;
    sum: number;
  };

  // 文字列型の統計
  stringStats?: {
    topValues: Array<{ value: string; count: number }>;
    maxLength: number;
    minLength: number;
    avgLength: number;
  };

  // 日時型の統計
  dateTimeStats?: {
    hourDistribution: Array<{ hour: number; count: number }>;
    dayOfWeekDistribution: Array<{ dayOfWeek: number; dayName: string; count: number }>;
    dateRange?: {
      min: string;
      max: string;
    };
  };
}

export interface ValueFrequency {
  value: string | number;
  count: number;
  percentage: number;
}
