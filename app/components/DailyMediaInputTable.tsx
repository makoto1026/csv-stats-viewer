'use client';

import { useState, useEffect } from 'react';
import { MediaType } from '../types/media.types';
import { DailyLeadCount } from '../utils/mediaAnalytics';
import { DailyAdCost } from '../types/media.types';

interface DailyMediaInputTableProps {
  mediaType: MediaType;
  yearMonth: string;
  dailyLeadCounts: DailyLeadCount[];
  existingAdCosts: DailyAdCost[];
  onSave: (adCosts: DailyAdCost[]) => void;
}

interface DailyInputData {
  date: string;
  leadCount: number;
  cost: string;
  contractCount: string;
}

export default function DailyMediaInputTable({
  mediaType,
  yearMonth,
  dailyLeadCounts,
  existingAdCosts,
  onSave,
}: DailyMediaInputTableProps) {
  const [inputData, setInputData] = useState<DailyInputData[]>([]);

  // 初期化: リード数と既存の入力データをマージ
  useEffect(() => {
    const merged = dailyLeadCounts.map(({ date, leadCount }) => {
      const existing = existingAdCosts.find(ac => ac.date === date);
      return {
        date,
        leadCount,
        cost: existing ? String(existing.cost) : '',
        contractCount: existing ? String(existing.contractCount) : '',
      };
    });
    setInputData(merged);
  }, [dailyLeadCounts, existingAdCosts]);

  // 入力値の変更ハンドラ
  const handleCostChange = (date: string, value: string) => {
    setInputData(prev =>
      prev.map(item =>
        item.date === date ? { ...item, cost: value } : item
      )
    );
  };

  const handleContractChange = (date: string, value: string) => {
    setInputData(prev =>
      prev.map(item =>
        item.date === date ? { ...item, contractCount: value } : item
      )
    );
  };

  // 保存ハンドラ
  const handleSave = () => {
    const adCosts: DailyAdCost[] = inputData
      .filter(item => item.cost || item.contractCount)
      .map(item => {
        // 既存のIDを保持、なければ新規作成
        const existingId = existingAdCosts.find(ac => ac.date === item.date)?.id;

        return {
          id: existingId || `${Date.now()}-${Math.random()}`,
          date: item.date,
          mediaType,
          cost: parseFloat(item.cost) || 0,
          contractCount: parseInt(item.contractCount, 10) || 0,
        };
      });

    onSave(adCosts);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}/${day}(${dayOfWeek})`;
  };

  // 合計を計算
  const totalLeads = inputData.reduce((sum, item) => sum + item.leadCount, 0);
  const totalCost = inputData.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
  const totalContracts = inputData.reduce((sum, item) => sum + (parseInt(item.contractCount, 10) || 0), 0);

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {mediaType} - 日別データ入力
        </h3>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer font-medium"
        >
          保存
        </button>
      </div>

      {/* テーブル */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                  日付
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                  リード数
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-32">
                  広告費用（円）
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">
                  成約数
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {inputData.map((item) => (
                <tr key={item.date} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(item.date)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-medium text-blue-600 dark:text-blue-400">
                    {item.leadCount}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="number"
                      value={item.cost}
                      onChange={(e) => handleCostChange(item.date, e.target.value)}
                      min="0"
                      step="1"
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <input
                      type="number"
                      value={item.contractCount}
                      onChange={(e) => handleContractChange(item.date, e.target.value)}
                      min="0"
                      step="1"
                      placeholder="0"
                      className="w-full px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  </td>
                </tr>
              ))}
              {/* 合計行 */}
              <tr className="bg-blue-50 dark:bg-blue-900/20 font-bold">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  合計
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-600 dark:text-blue-400">
                  {totalLeads}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                  ¥{totalCost.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                  {totalContracts}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">成約率</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {totalLeads > 0 ? ((totalContracts / totalLeads) * 100).toFixed(1) : '0.0'}%
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">リード単価</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {totalLeads > 0 ? `¥${Math.round(totalCost / totalLeads).toLocaleString()}` : '-'}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">成約単価</p>
          <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {totalContracts > 0 ? `¥${Math.round(totalCost / totalContracts).toLocaleString()}` : '-'}
          </p>
        </div>
      </div>
    </div>
  );
}
