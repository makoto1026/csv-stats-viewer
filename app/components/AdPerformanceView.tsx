'use client';

import { AdCost, AdPerformance } from '../types/advertisement.types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdPerformanceViewProps {
  adCosts: AdCost[];
  performances: AdPerformance[];
  totalPerformance: AdPerformance | null;
  onRemove: (id: string) => void;
}

export default function AdPerformanceView({
  adCosts,
  performances,
  totalPerformance,
  onRemove,
}: AdPerformanceViewProps) {
  if (adCosts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          広告費用を追加すると、費用対効果が表示されます
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 合計パフォーマンス */}
      {totalPerformance && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            合計パフォーマンス
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">合計広告費</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ¥{totalPerformance.totalCost.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">総回答数</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalPerformance.responseCount.toLocaleString()}件
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">1件あたりの費用</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ¥{totalPerformance.costPerResponse.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
          </div>

          {/* 日別回答数グラフ */}
          {totalPerformance.responseCounts.length > 0 && (
            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">
                日別回答数の推移
              </h4>
              <div className="h-64 bg-white dark:bg-gray-800 rounded-lg p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={totalPerformance.responseCounts}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: 'currentColor' }}
                      className="text-gray-700 dark:text-gray-300"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis tick={{ fill: 'currentColor' }} className="text-gray-700 dark:text-gray-300" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                      }}
                      labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('ja-JP');
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
          )}
        </div>
      )}

      {/* 個別の広告費用パフォーマンス */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          個別のパフォーマンス
        </h3>
        <div className="space-y-4">
          {adCosts.map((adCost, index) => {
            const performance = performances[index];
            return (
              <div
                key={adCost.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {performance.period}
                      </h4>
                      {adCost.description && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          ({adCost.description})
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(adCost.id)}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium cursor-pointer"
                  >
                    削除
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">広告費</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ¥{performance.totalCost.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">回答数</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {performance.responseCount.toLocaleString()}件
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">1件あたり</p>
                    <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                      ¥{performance.costPerResponse.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
