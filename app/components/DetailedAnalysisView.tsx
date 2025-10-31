'use client';

import { MediaDetailedAnalysis } from '../types/analysis.types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface DetailedAnalysisViewProps {
  analysis: MediaDetailedAnalysis;
}

export default function DetailedAnalysisView({ analysis }: DetailedAnalysisViewProps) {
  const formatYearMonth = (yearMonth: string | 'all-time') => {
    if (yearMonth === 'all-time') return '全期間';
    const [year, month] = yearMonth.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  // 円グラフ用のデータ（犬猫区分）
  const petCategoryData = [
    { name: '犬のみ', value: analysis.dogCount, color: '#3b82f6' },
    { name: '猫のみ', value: analysis.catCount, color: '#10b981' },
    { name: '両方', value: analysis.bothCount, color: '#f59e0b' },
    { name: '不明', value: analysis.unknownCount, color: '#6b7280' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {analysis.mediaType} - 詳細分析
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatYearMonth(analysis.yearMonth)} / 総リード数: {analysis.totalLeads}件
        </p>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ピーク時間帯</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {analysis.peakHour}:00
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">犬飼い</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {analysis.dogCount}件
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">猫飼い</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {analysis.catCount}件
          </p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">両方飼い</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {analysis.bothCount}件
          </p>
        </div>
      </div>

      {/* 時間帯分析 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          時間帯別リード数
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analysis.hourlyDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="hour"
                tick={{ fill: 'currentColor' }}
                className="text-gray-700 dark:text-gray-300"
                label={{ value: '時刻', position: 'insideBottom', offset: -10 }}
              />
              <YAxis tick={{ fill: 'currentColor' }} className="text-gray-700 dark:text-gray-300" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
                labelFormatter={(value) => `${value}:00`}
                formatter={(value: number) => [`${value}件`, 'リード数']}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {analysis.hourlyDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.hour === analysis.peakHour ? '#3b82f6' : '#93c5fd'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ペット種類分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 円グラフ */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            犬猫の飼育比率
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={petCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => {
                    const { name, percent } = props;
                    return `${name} ${(percent * 100).toFixed(0)}%`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {petCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value}件`, 'リード数']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* テーブル */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            ペット種類の詳細
          </h3>
          <div className="overflow-y-auto max-h-64">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    ペット種類
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    件数
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    割合
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {analysis.petTypeDistribution.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                      {item.petType}
                    </td>
                    <td className="px-4 py-2 text-sm text-right text-gray-900 dark:text-gray-100">
                      {item.count}
                    </td>
                    <td className="px-4 py-2 text-sm text-right font-medium text-blue-600 dark:text-blue-400">
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
