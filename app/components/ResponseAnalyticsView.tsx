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

  // 月別推移グラフ用のデータ
  const trendData = summary.monthlyData.map(item => ({
    yearMonth: formatYearMonth(item.yearMonth),
    count: item.count,
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
            <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
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
            <BarChart data={changeData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
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
