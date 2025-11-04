# 希望家賃分析・回答数分析機能 実装計画

## 概要

既存の媒体別分析機能に以下の機能を追加する：
1. 詳細分析ページ最下部に希望家賃上限額の分析情報を表示
2. 新規「回答数分析」ボタンおよびページの追加

## 要件定義

### 1. 希望家賃上限額分析（詳細分析ページ拡張）

**表示場所**: DetailedAnalysisView の最下部

**表示内容**:
- 希望家賃上限額の全回答一覧
- 平均家賃上限額

**データ処理ルール**:
- 範囲表記（例: "10万〜20万"、"100,000〜200,000"）の場合、上限値（20万、200,000）を採用
- 数値形式の多様性に対応:
  - 漢字表記: "10万", "15万", "20万"
  - 数値表記: "100000", "150000", "200000"
  - カンマ区切り: "100,000", "150,000", "200,000"
  - 単位付き: "15万円", "150,000円"
  - 範囲指定: "10万〜20万", "100,000〜200,000"
- 無効な値（数値として解釈できないもの）は除外

**対象カラム**:
- "希望家賃" または "希望家賃上限" という文字列が含まれるヘッダー

### 2. 回答数分析ページ（新規機能）

**UIアクセス**: 媒体別分析ボタンの横に「回答数分析」ボタンを配置

**表示内容**:
- 月別回答数の一覧表
- 全期間の総回答数
- 月別回答数の増減を示すグラフ（折れ線グラフ）

**分析内容**:
1. **月別集計**:
   - 各月の回答数
   - 前月比（増減数、増減率）
2. **全期間サマリー**:
   - 総回答数
   - 平均月間回答数
   - 最多回答月/最少回答月
3. **可視化**:
   - 月別推移の折れ線グラフ
   - 前月比増減の棒グラフ（正: 増加、負: 減少）

## アーキテクチャ設計

### ディレクトリ構成（追加ファイル）

```
app/
├── components/
│   ├── DetailedAnalysisView.tsx       # 既存（拡張）
│   ├── ResponseAnalyticsView.tsx      # 新規: 回答数分析メインビュー
│   └── RentSummarySection.tsx         # 新規: 希望家賃サマリーセクション
├── utils/
│   ├── rentAnalytics.ts               # 新規: 希望家賃分析ロジック
│   └── responseAnalytics.ts           # 新規: 回答数分析ロジック
├── types/
│   ├── rent.types.ts                  # 新規: 希望家賃関連の型定義
│   └── response.types.ts              # 新規: 回答数分析の型定義
└── page.tsx                           # 既存（拡張: ボタン追加）
```

### データフロー

#### 希望家賃分析フロー
```
SpreadsheetData
  ↓
detailedAnalytics.ts (拡張)
  ├─ rentAnalytics.ts
  │   ├─ 希望家賃カラム検出
  │   ├─ 各行からの家賃上限値抽出
  │   └─ 平均値計算
  ↓
MediaDetailedAnalysis (型拡張)
  ↓
DetailedAnalysisView (UI拡張)
  └─ RentSummarySection
```

#### 回答数分析フロー
```
SpreadsheetData
  ↓
responseAnalytics.ts
  ├─ 月別データ集計
  ├─ 前月比計算
  └─ 統計サマリー生成
  ↓
ResponseAnalysis (新規型)
  ↓
ResponseAnalyticsView
  ├─ 月別一覧テーブル
  ├─ サマリーカード
  └─ グラフ（Recharts）
```

## 型定義設計

### app/types/rent.types.ts

```typescript
/**
 * 希望家賃の分析結果
 */
export interface RentAnalysis {
  /** 有効な回答の一覧 */
  rentValues: number[];
  /** 平均家賃上限額 */
  averageRent: number;
  /** 中央値 */
  medianRent: number;
  /** 最小値 */
  minRent: number;
  /** 最大値 */
  maxRent: number;
  /** 有効回答数 */
  validCount: number;
  /** 無効回答数（数値化できなかったもの） */
  invalidCount: number;
}

/**
 * 家賃のパース結果
 */
export interface RentParseResult {
  /** パース成功時の値（範囲の場合は上限） */
  value: number | null;
  /** パース前の元の値 */
  original: string;
  /** パースに成功したかどうか */
  isValid: boolean;
}
```

### app/types/response.types.ts

```typescript
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
```

### app/types/analysis.types.ts（拡張）

```typescript
// 既存の MediaDetailedAnalysis に追加
export interface MediaDetailedAnalysis {
  mediaType: MediaType;
  yearMonth: string | 'all-time';
  totalLeads: number;
  hourlyDistribution: HourlyDistribution[];
  peakHour: number;
  petTypeDistribution: PetTypeDistribution[];
  dogCount: number;
  catCount: number;
  bothCount: number;
  unknownCount: number;

  // 新規追加
  rentAnalysis: RentAnalysis | null; // 希望家賃分析結果
}
```

## ユーティリティ関数設計

### app/utils/rentAnalytics.ts

```typescript
import { SpreadsheetData } from '../types/spreadsheet.types';
import { RentAnalysis, RentParseResult } from '../types/rent.types';
import { MediaType } from '../types/media.types';

/**
 * 希望家賃カラムを検出
 *
 * @param headers - スプレッドシートのヘッダー配列
 * @returns 希望家賃カラム名（見つからなければ null）
 */
export function detectRentColumn(headers: string[]): string | null {
  const rentKeywords = ['希望家賃', '希望家賃上限'];
  return headers.find(header =>
    rentKeywords.some(keyword => header.includes(keyword))
  ) || null;
}

/**
 * 家賃文字列を数値にパース
 *
 * @param value - 家賃の文字列表現
 * @returns パース結果
 *
 * @example
 * parseRentValue("15万") // { value: 150000, original: "15万", isValid: true }
 * parseRentValue("10万〜20万") // { value: 200000, original: "10万〜20万", isValid: true }
 * parseRentValue("150,000円") // { value: 150000, original: "150,000円", isValid: true }
 */
export function parseRentValue(value: string): RentParseResult {
  const original = value;
  const trimmed = value.trim();

  if (!trimmed) {
    return { value: null, original, isValid: false };
  }

  // 範囲指定の場合（〜、-、~で区切られている）
  const rangeMatch = trimmed.match(/(.+)[〜\-~](.+)/);
  if (rangeMatch) {
    // 上限値（2番目の値）を使用
    const upperValue = rangeMatch[2].trim();
    return parseRentValue(upperValue); // 再帰的に解析
  }

  // 数値部分を抽出（カンマを除去）
  let numericString = trimmed
    .replace(/,/g, '')      // カンマ除去
    .replace(/円/g, '')     // 円除去
    .replace(/万/g, '0000') // 万を0000に変換
    .replace(/[^\d]/g, ''); // 数字以外を除去

  const parsed = parseInt(numericString, 10);

  if (isNaN(parsed) || parsed <= 0) {
    return { value: null, original, isValid: false };
  }

  return { value: parsed, original, isValid: true };
}

/**
 * 希望家賃の分析を実行
 *
 * @param csvData - スプレッドシートデータ
 * @param mediaType - 媒体タイプ（フィルタ用）
 * @param yearMonth - 対象年月（'all-time' で全期間）
 * @param dateColumn - 日付カラム名
 * @param mediaColumn - 媒体カラム名
 * @returns 希望家賃分析結果
 */
export function analyzeRent(
  csvData: SpreadsheetData,
  mediaType: MediaType,
  yearMonth: string | 'all-time',
  dateColumn: string,
  mediaColumn: string = '何を見て知った？'
): RentAnalysis | null {
  // 希望家賃カラムを検出
  const rentColumn = detectRentColumn(csvData.headers);
  if (!rentColumn) {
    return null;
  }

  // 対象データをフィルタリング
  const filteredRows = csvData.rows.filter(row => {
    // 媒体でフィルタ
    const mediaValue = String(row[mediaColumn] || '');
    const normalizedMedia = normalizeMediaName(mediaValue);
    if (normalizedMedia !== mediaType) return false;

    // 期間でフィルタ
    if (yearMonth !== 'all-time') {
      const dateValue = String(row[dateColumn] || '');
      const datePart = dateValue.split(' ')[0]; // "2024-11-02"
      if (!datePart.startsWith(yearMonth)) return false;
    }

    return true;
  });

  // 家賃値をパース
  const parseResults = filteredRows.map(row => {
    const rentValue = String(row[rentColumn] || '');
    return parseRentValue(rentValue);
  });

  // 有効な値のみを抽出
  const rentValues = parseResults
    .filter(r => r.isValid && r.value !== null)
    .map(r => r.value as number);

  const validCount = rentValues.length;
  const invalidCount = parseResults.length - validCount;

  if (validCount === 0) {
    return {
      rentValues: [],
      averageRent: 0,
      medianRent: 0,
      minRent: 0,
      maxRent: 0,
      validCount: 0,
      invalidCount,
    };
  }

  // 統計値を計算
  const averageRent = rentValues.reduce((sum, v) => sum + v, 0) / validCount;
  const sortedValues = [...rentValues].sort((a, b) => a - b);
  const medianRent = sortedValues[Math.floor(validCount / 2)];
  const minRent = Math.min(...rentValues);
  const maxRent = Math.max(...rentValues);

  return {
    rentValues,
    averageRent,
    medianRent,
    minRent,
    maxRent,
    validCount,
    invalidCount,
  };
}

// mediaAnalytics.ts から normalizeMediaName をインポート
// （または同じロジックをここに複製）
function normalizeMediaName(value: string): MediaType | null {
  // 実装は mediaAnalytics.ts と同じ
  // ...
}
```

### app/utils/responseAnalytics.ts

```typescript
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
```

## コンポーネント設計

### app/components/RentSummarySection.tsx（新規）

```typescript
'use client';

import { RentAnalysis } from '../types/rent.types';

interface RentSummarySectionProps {
  rentAnalysis: RentAnalysis;
}

export default function RentSummarySection({ rentAnalysis }: RentSummarySectionProps) {
  const formatCurrency = (value: number) => {
    return `${Math.round(value).toLocaleString()}円`;
  };

  if (!rentAnalysis || rentAnalysis.validCount === 0) {
    return null; // データがない場合は非表示
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        希望家賃上限額 分析
      </h3>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">平均上限額</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(rentAnalysis.averageRent)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">中央値</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(rentAnalysis.medianRent)}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最小値</p>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {formatCurrency(rentAnalysis.minRent)}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最大値</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(rentAnalysis.maxRent)}
          </p>
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        <p>有効回答数: {rentAnalysis.validCount}件</p>
        {rentAnalysis.invalidCount > 0 && (
          <p className="text-amber-600 dark:text-amber-400">
            無効回答数: {rentAnalysis.invalidCount}件（数値として解釈できなかったデータ）
          </p>
        )}
      </div>

      {/* 回答一覧（最大10件表示） */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          回答一覧（最新10件）
        </h4>
        <div className="flex flex-wrap gap-2">
          {rentAnalysis.rentValues.slice(0, 10).map((value, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300"
            >
              {formatCurrency(value)}
            </span>
          ))}
          {rentAnalysis.rentValues.length > 10 && (
            <span className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400">
              他 {rentAnalysis.rentValues.length - 10}件
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
```

### app/components/ResponseAnalyticsView.tsx（新規）

```typescript
'use client';

import { useMemo } from 'react';
import { SpreadsheetData } from '../types/spreadsheet.types';
import { generateResponseAnalysisSummary } from '../utils/responseAnalytics';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResponseAnalyticsViewProps {
  csvData: SpreadsheetData;
  dateColumn: string;
}

export default function ResponseAnalyticsView({ csvData, dateColumn }: ResponseAnalyticsViewProps) {
  const summary = useMemo(() => {
    return generateResponseAnalysisSummary(csvData, dateColumn);
  }, [csvData, dateColumn]);

  const formatYearMonth = (yearMonth: string) => {
    if (!yearMonth) return '';
    const [year, month] = yearMonth.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  // 前月比増減グラフ用のデータ
  const changeData = summary.monthlyData.map(item => ({
    yearMonth: formatYearMonth(item.yearMonth),
    change: item.changeFromPrevMonth || 0,
  }));

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-lg border border-indigo-200 dark:border-indigo-800 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          回答数分析レポート
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          期間: {formatYearMonth(summary.period.start)} 〜 {formatYearMonth(summary.period.end)}
        </p>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">総回答数</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {summary.totalCount.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">平均月間回答数</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {Math.round(summary.averageMonthlyCount).toLocaleString()}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最多回答月</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {summary.peakMonth ? formatYearMonth(summary.peakMonth.yearMonth) : '-'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {summary.peakMonth ? `${summary.peakMonth.count}件` : ''}
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最少回答月</p>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {summary.lowestMonth ? formatYearMonth(summary.lowestMonth.yearMonth) : '-'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {summary.lowestMonth ? `${summary.lowestMonth.count}件` : ''}
          </p>
        </div>
      </div>

      {/* 月別推移グラフ */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          月別回答数の推移
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="yearMonth"
                tick={{ fill: 'currentColor' }}
                className="text-gray-700 dark:text-gray-300"
                tickFormatter={formatYearMonth}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: 'currentColor' }} className="text-gray-700 dark:text-gray-300" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
                labelFormatter={formatYearMonth}
                formatter={(value: number) => [`${value}件`, '回答数']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 前月比増減グラフ */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          前月比増減
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={changeData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="yearMonth"
                tick={{ fill: 'currentColor' }}
                className="text-gray-700 dark:text-gray-300"
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fill: 'currentColor' }} className="text-gray-700 dark:text-gray-300" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: number) => {
                  const sign = value >= 0 ? '+' : '';
                  return [`${sign}${value}件`, '増減'];
                }}
              />
              <Bar dataKey="change" radius={[8, 8, 0, 0]}>
                {changeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.change >= 0 ? '#10b981' : '#ef4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 月別一覧テーブル */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          月別詳細データ
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  年月
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  回答数
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  前月比
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  増減率
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {summary.monthlyData.map((item) => (
                <tr key={item.yearMonth}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatYearMonth(item.yearMonth)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                    {item.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {item.changeFromPrevMonth !== null ? (
                      <span className={item.changeFromPrevMonth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {item.changeFromPrevMonth >= 0 ? '+' : ''}{item.changeFromPrevMonth}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                    {item.changeRateFromPrevMonth !== null ? (
                      <span className={item.changeRateFromPrevMonth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                        {item.changeRateFromPrevMonth >= 0 ? '+' : ''}{item.changeRateFromPrevMonth.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

### app/components/DetailedAnalysisView.tsx（拡張）

既存ファイルの最下部に `RentSummarySection` を追加：

```typescript
// 既存のimportに追加
import RentSummarySection from './RentSummarySection';

// return内の最下部に追加（既存の</div>の直前）
export default function DetailedAnalysisView({ analysis }: DetailedAnalysisViewProps) {
  // ... 既存のコード ...

  return (
    <div className="space-y-6">
      {/* 既存のコンテンツ */}
      {/* ... */}

      {/* 希望家賃分析（新規追加） */}
      {analysis.rentAnalysis && (
        <RentSummarySection rentAnalysis={analysis.rentAnalysis} />
      )}
    </div>
  );
}
```

### app/page.tsx（拡張）

「媒体別分析」ボタンの横に「回答数分析」ボタンを追加：

```typescript
// 既存のimportに追加
import ResponseAnalyticsView from './components/ResponseAnalyticsView';

export default function Home() {
  // 既存のstateに追加
  const [showResponseAnalytics, setShowResponseAnalytics] = useState(false);

  // handleSelectColumn を拡張
  const handleSelectColumn = (column: string) => {
    setSelectedColumn(column);
    setShowMediaAnalytics(false);
    setShowResponseAnalytics(false); // 新規追加
  };

  return (
    // ...
    <div className="flex gap-2">
      {dateColumn && (
        <>
          <button
            onClick={() => {
              setShowMediaAnalytics(!showMediaAnalytics);
              setShowResponseAnalytics(false); // 新規追加
            }}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              showMediaAnalytics
                ? 'bg-green-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            媒体別分析
          </button>
          <button
            onClick={() => {
              setShowResponseAnalytics(!showResponseAnalytics);
              setShowMediaAnalytics(false); // 新規追加
            }}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              showResponseAnalytics
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            回答数分析
          </button>
        </>
      )}
      {/* 再読み込みボタン */}
    </div>

    {/* メインコンテンツ内に追加 */}
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 媒体別分析パネル */}
        {showMediaAnalytics && dateColumn && spreadsheetData && (
          <MediaAnalyticsView ... />
        )}

        {/* 回答数分析パネル（新規追加） */}
        {showResponseAnalytics && dateColumn && spreadsheetData && (
          <ResponseAnalyticsView
            csvData={spreadsheetData}
            dateColumn={dateColumn}
          />
        )}

        {/* 期間フィルター */}
        {!showMediaAnalytics && !showResponseAnalytics && dateColumn && (
          <DateFilterPanel ... />
        )}

        {/* 統計ビュー */}
        {!showMediaAnalytics && !showResponseAnalytics && selectedColumn && filteredData && (
          <StatsView ... />
        )}
      </div>
    </div>
  );
}
```

## 実装手順

### フェーズ1: 型定義とユーティリティ関数

1. **型定義の作成**
   - [ ] `app/types/rent.types.ts` を作成
   - [ ] `app/types/response.types.ts` を作成
   - [ ] `app/types/analysis.types.ts` を拡張

2. **ユーティリティ関数の実装**
   - [ ] `app/utils/rentAnalytics.ts` を実装
     - [ ] `detectRentColumn` 関数
     - [ ] `parseRentValue` 関数（範囲対応、各種フォーマット対応）
     - [ ] `analyzeRent` 関数
   - [ ] `app/utils/responseAnalytics.ts` を実装
     - [ ] `calculateMonthlyResponseCounts` 関数
     - [ ] `generateResponseAnalysisSummary` 関数

3. **ユーティリティ関数のテスト**
   - [ ] `parseRentValue` の各種パターンテスト
     - "15万", "150000", "150,000", "150,000円"
     - "10万〜20万", "100,000-200,000"
     - 無効な値（空文字、文字列のみ）
   - [ ] `analyzeRent` の動作確認
   - [ ] `generateResponseAnalysisSummary` の動作確認

### フェーズ2: コンポーネント実装

4. **希望家賃分析コンポーネント**
   - [ ] `app/components/RentSummarySection.tsx` を作成
   - [ ] `app/utils/detailedAnalytics.ts` を拡張して `analyzeRent` を呼び出し
   - [ ] `MediaDetailedAnalysis` 型に `rentAnalysis` フィールドを追加
   - [ ] `DetailedAnalysisView.tsx` に `RentSummarySection` を統合

5. **回答数分析コンポーネント**
   - [ ] `app/components/ResponseAnalyticsView.tsx` を作成
     - [ ] サマリーカードセクション
     - [ ] 月別推移グラフ（折れ線グラフ）
     - [ ] 前月比増減グラフ（棒グラフ）
     - [ ] 月別一覧テーブル

6. **メインページの統合**
   - [ ] `app/page.tsx` に「回答数分析」ボタンを追加
   - [ ] ボタンクリック時の状態管理を実装
   - [ ] `ResponseAnalyticsView` の表示制御

### フェーズ3: テストと調整

7. **動作確認**
   - [ ] 詳細分析ページで希望家賃分析が正しく表示されるか
   - [ ] 範囲表記の上限値が正しく抽出されるか
   - [ ] 回答数分析ボタンが正しく動作するか
   - [ ] 月別データが正しく集計されるか
   - [ ] グラフが正しく表示されるか
   - [ ] レスポンシブデザインが機能するか

8. **エッジケース対応**
   - [ ] 希望家賃カラムが存在しない場合
   - [ ] 有効な家賃データが0件の場合
   - [ ] データが1ヶ月しかない場合（前月比が計算できない）
   - [ ] ダークモード表示の確認

9. **パフォーマンス最適化**
   - [ ] `useMemo` による計算の最適化確認
   - [ ] 大量データでのレンダリング速度確認

### フェーズ4: ドキュメント更新

10. **ドキュメント作成**
    - [ ] 実装内容を `docs/implementation/updates/rent-analysis-enhancement-complete.md` にまとめる
    - [ ] CLAUDE.md に知見を追記（必要に応じて）

## 技術的考慮事項

### 1. 家賃パースのロバスト性

**問題**: ユーザー入力が多様で予測不可能

**対策**:
- 正規表現による柔軟なパース
- 範囲指定の再帰的処理
- 失敗時のグレースフルな処理（無効データとしてカウント）

### 2. データの欠損対応

**希望家賃カラムがない場合**:
```typescript
if (!rentColumn) {
  return null; // セクション全体を非表示
}
```

**有効データが0件の場合**:
```typescript
if (validCount === 0) {
  return {
    rentValues: [],
    averageRent: 0,
    // ...
  };
}
```

### 3. ゼロ除算の防止

**前月比計算**:
```typescript
if (prevCount > 0) {
  changeRateFromPrevMonth = (changeFromPrevMonth / prevCount) * 100;
}
```

**平均計算**:
```typescript
const averageMonthlyCount = monthlyData.length > 0
  ? totalCount / monthlyData.length
  : 0;
```

### 4. グラフ表示の最適化

**Recharts の型対応**:
```typescript
// 型エラー回避のため any を使用
formatter={(value: number) => [`${value}件`, '回答数']}
```

**レスポンシブ対応**:
```typescript
<ResponsiveContainer width="100%" height="100%">
```

## 懸念点と対策

### 懸念点1: 家賃パースの精度

**懸念**: 予期しないフォーマットが入力された場合、正しくパースできない可能性

**対策**:
- 無効データをカウントして表示
- ログ出力で問題を検出しやすくする
- 今後、パターンが増えた場合に容易に追加できる設計

### 懸念点2: パフォーマンス

**懸念**: 全データスキャンによる計算コストが高い

**対策**:
- `useMemo` で必要な時のみ再計算
- 依存配列を適切に設定
- データ量が増えた場合は Web Worker を検討

### 懸念点3: UI/UXの一貫性

**懸念**: 既存の媒体別分析と見た目が統一されていない

**対策**:
- 同じ Tailwind クラスパターンを使用
- カラースキームを統一（indigo系を回答数分析に使用）
- レイアウト構造を既存コンポーネントに合わせる

## 拡張可能性

### 短期的な拡張

1. **希望家賃の分布グラフ**
   - ヒストグラム表示
   - 価格帯別の件数集計

2. **回答数分析のフィルタリング**
   - 媒体別の回答数推移
   - ペット種類別の回答数推移

### 長期的な拡張

1. **予測機能**
   - 線形回帰による回答数予測
   - 季節性の分析

2. **エクスポート機能**
   - CSV/Excel 形式でのデータエクスポート
   - PDF レポート生成

3. **比較機能**
   - 年次比較（前年同月比）
   - 複数媒体の同時比較

## まとめ

この実装計画は以下の原則に基づいています：

1. **既存設計の踏襲**: 媒体別分析機能の設計パターンを活用
2. **型安全性**: TypeScript の厳密な型定義
3. **ロバスト性**: エラー処理とエッジケース対応
4. **拡張性**: 将来的な機能追加を見据えた設計
5. **ユーザビリティ**: 直感的なUI、レスポンシブデザイン

実装完了後は、実際のデータでテストを行い、パフォーマンスとUXを検証します。
