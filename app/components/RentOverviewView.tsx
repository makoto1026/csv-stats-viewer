'use client';

import { useMemo, useState } from 'react';
import { SpreadsheetData } from '../types/spreadsheet.types';
import { generateRentOverview, getMediaDisplayName } from '../utils/rentOverview';
import { detectDateColumn } from '../utils/dateFilter';
import { MediaType } from '../types/media.types';
import { RentStatsByMonthMedia } from '../types/rentOverview.types';

interface RentOverviewViewProps {
  csvData: SpreadsheetData;
  onClose: () => void;
}

export default function RentOverviewView({ csvData, onClose }: RentOverviewViewProps) {
  const [viewMode, setViewMode] = useState<'all-time' | 'monthly'>('monthly');

  const dateColumn = useMemo(() => detectDateColumn(csvData), [csvData]);

  const overview = useMemo(() => {
    if (!dateColumn) return null;
    return generateRentOverview(csvData, dateColumn);
  }, [csvData, dateColumn]);

  const formatCurrency = (value: number) => {
    const rounded = Math.round(value / 1000) * 1000;
    return `${rounded.toLocaleString()}円`;
  };

  // 月ごとにグループ化
  const groupedByMonth = useMemo(() => {
    if (!overview) return new Map();
    const groups = new Map<string, RentStatsByMonthMedia[]>();
    overview.monthlyMediaStats.forEach(stat => {
      if (!groups.has(stat.yearMonth)) {
        groups.set(stat.yearMonth, []);
      }
      groups.get(stat.yearMonth)!.push(stat);
    });
    return groups;
  }, [overview]);

  const sortedMonths = useMemo(() => {
    return Array.from(groupedByMonth.keys()).sort().reverse();
  }, [groupedByMonth]);

  // デフォルトは「全て」を選択
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // 全期間の媒体別集計
  const allTimeByMedia = useMemo(() => {
    if (!overview) return [];

    const mediaMap = new Map<MediaType, {
      totalResponses: number;
      totalRentSum: number;
      allValues: number[];
    }>();

    overview.monthlyMediaStats.forEach(stat => {
      if (!mediaMap.has(stat.mediaType)) {
        mediaMap.set(stat.mediaType, {
          totalResponses: 0,
          totalRentSum: 0,
          allValues: [],
        });
      }
      const data = mediaMap.get(stat.mediaType)!;
      data.totalResponses += stat.responseCount;
      data.totalRentSum += stat.averageRent * stat.responseCount;
      // 本来は全ての値を集めるべきだが、簡易的に平均から推定
      for (let i = 0; i < stat.responseCount; i++) {
        data.allValues.push(stat.averageRent);
      }
    });

    return Array.from(mediaMap.entries()).map(([mediaType, data]) => ({
      mediaType,
      responseCount: data.totalResponses,
      averageRent: data.totalRentSum / data.totalResponses,
      medianRent: data.allValues.sort((a, b) => a - b)[Math.floor(data.allValues.length / 2)] || 0,
      minRent: Math.min(...data.allValues),
      maxRent: Math.max(...data.allValues),
    })).sort((a, b) => b.responseCount - a.responseCount);
  }, [overview]);

  // 月次表示で表示する月を決定
  const displayMonths = useMemo(() => {
    if (viewMode === 'all-time') return sortedMonths;
    if (selectedMonth) return [selectedMonth];
    return sortedMonths;
  }, [viewMode, selectedMonth, sortedMonths]);

  // 選択期間の統計を計算（月次表示の場合のみ動的に変化）
  const periodStats = useMemo(() => {
    if (!overview || viewMode === 'all-time') {
      // 全期間表示の場合は元のoverview統計を使用
      return {
        totalResponses: overview?.totalResponses || 0,
        average: overview?.overallAverage || 0,
        median: overview?.overallMedian || 0,
        period: overview?.period || { start: '', end: '' },
      };
    }

    // 月次表示で選択された月のデータのみを集計
    const selectedStats = overview.monthlyMediaStats.filter(stat =>
      displayMonths.includes(stat.yearMonth)
    );

    if (selectedStats.length === 0) {
      return {
        totalResponses: 0,
        average: 0,
        median: 0,
        period: { start: '', end: '' },
      };
    }

    // 全ての家賃値を収集（平均から推定）
    const allRentValues: number[] = [];
    let totalResponses = 0;
    let totalRentSum = 0;

    selectedStats.forEach(stat => {
      totalResponses += stat.responseCount;
      totalRentSum += stat.averageRent * stat.responseCount;
      // 簡易的に平均値を responseCount 回追加
      for (let i = 0; i < stat.responseCount; i++) {
        allRentValues.push(stat.averageRent);
      }
    });

    const average = totalResponses > 0 ? totalRentSum / totalResponses : 0;
    const sortedValues = [...allRentValues].sort((a, b) => a - b);
    const median = sortedValues.length > 0
      ? sortedValues[Math.floor(sortedValues.length / 2)]
      : 0;

    // 期間を計算
    const months = [...new Set(selectedStats.map(s => s.yearMonth))].sort();
    const period = {
      start: months[0] || '',
      end: months[months.length - 1] || '',
    };

    return {
      totalResponses,
      average,
      median,
      period,
    };
  }, [overview, viewMode, displayMonths]);

  // データがない場合の早期リターン
  if (!dateColumn || !overview) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              希望家賃上限分析
            </h1>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              閉じる
            </button>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <p className="text-gray-700 dark:text-gray-300">
              {!dateColumn ? '日付カラムが検出できませんでした。' : 'データの読み込みに失敗しました。'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      {/* ヘッダー */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            希望家賃上限分析
          </h1>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            閉じる
          </button>
        </div>

        {/* 表示切り替えボタン */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'monthly'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            月次表示
          </button>
          <button
            onClick={() => setViewMode('all-time')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'all-time'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            全期間表示
          </button>
        </div>

        {/* 月次表示の場合の月選択 */}
        {viewMode === 'monthly' && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setSelectedMonth(null)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedMonth === null
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              全て
            </button>
            {sortedMonths.map(month => (
              <button
                key={month}
                onClick={() => setSelectedMonth(month)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedMonth === month
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        )}

        {/* サマリーカード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">総回答数</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {periodStats.totalResponses}件
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {viewMode === 'all-time' || selectedMonth === null ? '全期間平均' : '選択期間平均'}
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(periodStats.average)}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {viewMode === 'all-time' || selectedMonth === null ? '全期間中央値' : '選択期間中央値'}
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(periodStats.median)}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">分析期間</p>
            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {periodStats.period.start} 〜 {periodStats.period.end}
            </p>
          </div>
        </div>
      </div>

      {/* テーブル表示 */}
      <div className="max-w-7xl mx-auto space-y-6">
        {viewMode === 'all-time' ? (
          /* 全期間表示：媒体別集計 */
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                全期間 媒体別統計
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      媒体
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      回答数
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      平均
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      中央値
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      最小値
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      最大値
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {allTimeByMedia.map(stat => (
                    <tr key={stat.mediaType} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getMediaDisplayName(stat.mediaType)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                        {stat.responseCount}件
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600 dark:text-blue-400">
                        {formatCurrency(stat.averageRent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                        {formatCurrency(stat.medianRent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(stat.minRent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(stat.maxRent)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* 月次表示：月別テーブル */
          <>
            {displayMonths.map(yearMonth => {
              const stats = groupedByMonth.get(yearMonth)!;
              const monthTotal = stats.reduce((sum: number, s: RentStatsByMonthMedia) => sum + s.responseCount, 0);
              const monthAverage = stats.reduce((sum: number, s: RentStatsByMonthMedia) => sum + s.averageRent * s.responseCount, 0) / monthTotal;

              return (
                <div key={yearMonth} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-100 dark:bg-gray-700 px-6 py-3 border-b border-gray-200 dark:border-gray-600">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {yearMonth}
                      <span className="ml-4 text-sm font-normal text-gray-600 dark:text-gray-400">
                        回答数: {monthTotal}件 / 月平均: {formatCurrency(monthAverage)}
                      </span>
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            媒体
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            回答数
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            平均
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            中央値
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            最小値
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            最大値
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {stats.map((stat: RentStatsByMonthMedia) => (
                          <tr key={stat.mediaType} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              {getMediaDisplayName(stat.mediaType)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                              {stat.responseCount}件
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-blue-600 dark:text-blue-400">
                              {formatCurrency(stat.averageRent)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600 dark:text-green-400">
                              {formatCurrency(stat.medianRent)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                              {formatCurrency(stat.minRent)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600 dark:text-gray-400">
                              {formatCurrency(stat.maxRent)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
