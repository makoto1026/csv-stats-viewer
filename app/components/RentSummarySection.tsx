'use client';

import { RentAnalysis } from '../types/rent.types';

interface RentSummarySectionProps {
  rentAnalysis: RentAnalysis;
}

export default function RentSummarySection({ rentAnalysis }: RentSummarySectionProps) {
  const formatCurrency = (value: number) => {
    // 1000の位で四捨五入
    const rounded = Math.round(value / 1000) * 1000;
    return `${rounded.toLocaleString()}円`;
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

      {/* 回答一覧テーブル */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          回答一覧（全{rentAnalysis.validCount}件）
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  日付
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  元の入力
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  家賃上限額
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ペット種類
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {rentAnalysis.responses.map((response, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {response.date}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {response.originalValue}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(response.rentValue)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {response.petType}
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
