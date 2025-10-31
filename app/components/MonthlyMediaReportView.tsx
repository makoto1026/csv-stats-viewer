'use client';

import { MonthlyOverallReport } from '../types/media.types';

interface MonthlyMediaReportViewProps {
  report: MonthlyOverallReport;
}

export default function MonthlyMediaReportView({ report }: MonthlyMediaReportViewProps) {
  const formatYearMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const formatCurrency = (value: number) => {
    return `¥${Math.round(value).toLocaleString()}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // データがない媒体は除外
  const activeMediaReports = report.mediaReports.filter(
    (mr) => mr.leadCount > 0 || mr.totalAdCost > 0 || mr.totalContractCount > 0
  );

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {formatYearMonth(report.yearMonth)} 月次レポート
        </h2>

        {/* 全体サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">総リード数</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {report.totalLeadCount.toLocaleString()}件
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">総広告費</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(report.totalAdCost)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">総成約数</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {report.totalContractCount.toLocaleString()}件
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">全体成約率</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPercent(report.overallContractRate)}
            </p>
          </div>
        </div>

        {/* 追加指標 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              リード1件あたりのコスト
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {report.totalLeadCount > 0 ? formatCurrency(report.overallCostPerLead) : '-'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              成約1件あたりのコスト
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {report.totalContractCount > 0
                ? formatCurrency(report.overallCostPerContract)
                : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 媒体別詳細 */}
      {activeMediaReports.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    媒体
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    リード数
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    広告費
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    成約数
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    成約率
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    日平均単価
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    リード単価
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    成約単価
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {activeMediaReports.map((mediaReport) => (
                  <tr
                    key={mediaReport.mediaType}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {mediaReport.mediaType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      {mediaReport.leadCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      {formatCurrency(mediaReport.totalAdCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      {mediaReport.totalContractCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                      {mediaReport.leadCount > 0
                        ? formatPercent(mediaReport.contractRate)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      {mediaReport.totalAdCost > 0
                        ? formatCurrency(mediaReport.averageCostPerDay)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      {mediaReport.leadCount > 0
                        ? formatCurrency(mediaReport.costPerLead)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-gray-100">
                      {mediaReport.totalContractCount > 0
                        ? formatCurrency(mediaReport.costPerContract)
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            この月のデータがありません。広告費用を追加してください。
          </p>
        </div>
      )}
    </div>
  );
}
