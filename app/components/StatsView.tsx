'use client';

import { useMemo } from 'react';
import { CSVData } from '../types/csv.types';
import { calculateColumnStats, getValueFrequencies } from '../utils/statsCalculator';

interface StatsViewProps {
  data: CSVData;
  selectedColumn: string;
}

export default function StatsView({ data, selectedColumn }: StatsViewProps) {
  const stats = useMemo(
    () => calculateColumnStats(data, selectedColumn),
    [data, selectedColumn]
  );

  const frequencies = useMemo(
    () => getValueFrequencies(data, selectedColumn, 20),
    [data, selectedColumn]
  );

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {selectedColumn}
          </h2>
          <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span>データ型: {getDataTypeLabel(stats.dataType)}</span>
            <span>総数: {stats.totalCount.toLocaleString()}</span>
            <span>ユニーク: {stats.uniqueCount.toLocaleString()}</span>
            {stats.nullCount > 0 && (
              <span className="text-orange-600 dark:text-orange-400">
                空値: {stats.nullCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>


        {/* 日時統計 */}
        {stats.dateTimeStats && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              日時統計
            </h3>

            {/* 日付範囲 */}
            {stats.dateTimeStats.dateRange && (
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最初の日時</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {stats.dateTimeStats.dateRange.min}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">最後の日時</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {stats.dateTimeStats.dateRange.max}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 時間帯別の分布 */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                時間帯別の回答数
              </h4>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="space-y-2">
                  {stats.dateTimeStats.hourDistribution.map((item) => {
                    const maxCount = Math.max(
                      ...stats.dateTimeStats!.hourDistribution.map((h) => h.count)
                    );
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                    return (
                      <div key={item.hour} className="flex items-center gap-3">
                        <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                          {item.hour}:00
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-6 relative">
                            <div
                              className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${percentage}%` }}
                            >
                              {item.count > 0 && (
                                <span className="text-xs font-medium text-white">
                                  {item.count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 曜日別の分布 */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                曜日別の回答数
              </h4>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="space-y-2">
                  {stats.dateTimeStats.dayOfWeekDistribution.map((item) => {
                    const maxCount = Math.max(
                      ...stats.dateTimeStats!.dayOfWeekDistribution.map((d) => d.count)
                    );
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;

                    return (
                      <div key={item.dayOfWeek} className="flex items-center gap-3">
                        <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                          {item.dayName}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-6 relative">
                            <div
                              className="bg-green-500 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${percentage}%` }}
                            >
                              {item.count > 0 && (
                                <span className="text-xs font-medium text-white">
                                  {item.count}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 値の分布 */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            値の分布（上位20件）
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      順位
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      値
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      出現回数
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      割合
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      グラフ
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {frequencies.map((freq, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                        {String(freq.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {freq.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {freq.percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${freq.percentage}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDataTypeLabel(dataType: string): string {
  const labels: Record<string, string> = {
    number: '数値',
    string: '文字列',
    date: '日時',
    mixed: '混合',
  };
  return labels[dataType] || dataType;
}
