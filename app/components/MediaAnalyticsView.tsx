'use client';

import { useState, useMemo, useEffect } from 'react';
import { SpreadsheetData } from '../types/spreadsheet.types';
import { DailyAdCost, MediaType, MEDIA_TYPES } from '../types/media.types';
import DailyMediaInputTable from './DailyMediaInputTable';
import MonthlyMediaReportView from './MonthlyMediaReportView';
import AllTimeReportView from './AllTimeReportView';
import DetailedAnalysisView from './DetailedAnalysisView';
import { loadMediaAdCosts, saveMediaAdCosts } from '../utils/mediaAdStorage';
import { getDailyLeadCounts, calculateMonthlyOverallReport, calculateAllTimeOverallReport } from '../utils/mediaAnalytics';
import { calculateMediaDetailedAnalysis } from '../utils/detailedAnalytics';

interface MediaAnalyticsViewProps {
  csvData: SpreadsheetData;
  dateColumn: string;
  availableMonths: string[];
  minDate?: Date;
  maxDate?: Date;
}

export default function MediaAnalyticsView({
  csvData,
  dateColumn,
  availableMonths,
  minDate,
  maxDate,
}: MediaAnalyticsViewProps) {
  const [adCosts, setAdCosts] = useState<DailyAdCost[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedMedia, setSelectedMedia] = useState<MediaType>('Instagram');
  const [viewMode, setViewMode] = useState<'input' | 'report' | 'alltime' | 'analysis'>('input');
  const [analysisTimeRange, setAnalysisTimeRange] = useState<'monthly' | 'alltime'>('monthly');

  // 初回マウント時にローカルストレージから読み込み
  useEffect(() => {
    setAdCosts(loadMediaAdCosts());
  }, []);

  // 最新月を自動選択
  useEffect(() => {
    if (availableMonths.length > 0 && !selectedMonth) {
      setSelectedMonth(availableMonths[0]); // 最新月（降順の最初）
    }
  }, [availableMonths]);

  // 選択月の日別リード数を取得
  const dailyLeadCounts = useMemo(() => {
    if (!selectedMonth) return [];
    return getDailyLeadCounts(csvData, selectedMedia, selectedMonth, dateColumn);
  }, [csvData, selectedMedia, selectedMonth, dateColumn]);

  // 選択月・選択媒体の広告費用データ
  const selectedMediaAdCosts = useMemo(() => {
    if (!selectedMonth) return [];
    return adCosts.filter(
      cost => cost.date.startsWith(selectedMonth) && cost.mediaType === selectedMedia
    );
  }, [adCosts, selectedMonth, selectedMedia]);

  // 月次レポートを計算
  const monthlyReport = useMemo(() => {
    if (!selectedMonth) return null;
    return calculateMonthlyOverallReport(csvData, selectedMonth, dateColumn);
  }, [csvData, selectedMonth, dateColumn, adCosts]);

  // 詳細分析を計算（月次）
  const detailedAnalysis = useMemo(() => {
    if (!selectedMonth) return null;
    return calculateMediaDetailedAnalysis(csvData, selectedMedia, selectedMonth, dateColumn);
  }, [csvData, selectedMedia, selectedMonth, dateColumn]);

  // 詳細分析を計算（全期間）
  const allTimeDetailedAnalysis = useMemo(() => {
    return calculateMediaDetailedAnalysis(csvData, selectedMedia, 'all-time', dateColumn);
  }, [csvData, selectedMedia, dateColumn]);

  // 全期間レポートを計算
  const allTimeReport = useMemo(() => {
    return calculateAllTimeOverallReport(csvData, dateColumn);
  }, [csvData, dateColumn, adCosts]);

  // 保存ハンドラ
  const handleSave = (newAdCosts: DailyAdCost[]) => {
    // 既存データから、選択月・選択媒体のデータを削除
    const otherAdCosts = adCosts.filter(
      cost => !(cost.date.startsWith(selectedMonth) && cost.mediaType === selectedMedia)
    );

    // 新しいデータと結合
    const updatedAdCosts = [...otherAdCosts, ...newAdCosts];
    setAdCosts(updatedAdCosts);
    saveMediaAdCosts(updatedAdCosts);

    alert('保存しました');
  };

  const formatYearMonth = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          媒体別分析レポート
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          各媒体の日別リード数を確認し、広告費用と成約数を入力して費用対効果を分析できます
        </p>
      </div>

      {/* 月選択 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          分析対象月を選択
        </label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="">月を選択してください</option>
          {availableMonths.map((month) => (
            <option key={month} value={month}>
              {formatYearMonth(month)}
            </option>
          ))}
        </select>
      </div>

      {selectedMonth && (
        <>
          {/* 表示モード切り替え */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setViewMode('input')}
                className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'input'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                データ入力
              </button>
              <button
                onClick={() => setViewMode('report')}
                className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'report'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                月次レポート
              </button>
              <button
                onClick={() => setViewMode('alltime')}
                className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'alltime'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                全期間レポート
              </button>
              <button
                onClick={() => setViewMode('analysis')}
                className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'analysis'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                詳細分析
              </button>
            </div>
          </div>

          {/* データ入力モード */}
          {viewMode === 'input' && (
            <>
              {/* 媒体タブ */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-wrap gap-2">
                  {MEDIA_TYPES.map((media) => (
                    <button
                      key={media}
                      onClick={() => setSelectedMedia(media)}
                      className={`px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
                        selectedMedia === media
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {media}
                    </button>
                  ))}
                </div>
              </div>

              {/* 日別入力テーブル */}
              <DailyMediaInputTable
                mediaType={selectedMedia}
                yearMonth={selectedMonth}
                dailyLeadCounts={dailyLeadCounts}
                existingAdCosts={selectedMediaAdCosts}
                onSave={handleSave}
              />
            </>
          )}

          {/* 月次レポートモード */}
          {viewMode === 'report' && monthlyReport && (
            <MonthlyMediaReportView report={monthlyReport} />
          )}

          {/* 全期間レポートモード */}
          {viewMode === 'alltime' && (
            <AllTimeReportView report={allTimeReport} />
          )}

          {/* 詳細分析モード */}
          {viewMode === 'analysis' && (
            <>
              {/* 媒体タブ */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-wrap gap-2">
                  {MEDIA_TYPES.map((media) => (
                    <button
                      key={media}
                      onClick={() => setSelectedMedia(media)}
                      className={`px-4 py-2 rounded-lg transition-colors cursor-pointer text-sm ${
                        selectedMedia === media
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {media}
                    </button>
                  ))}
                </div>
              </div>

              {/* 期間切り替え */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnalysisTimeRange('monthly')}
                    className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      analysisTimeRange === 'monthly'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    月次データ
                  </button>
                  <button
                    onClick={() => setAnalysisTimeRange('alltime')}
                    className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                      analysisTimeRange === 'alltime'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    全期間データ
                  </button>
                </div>
              </div>

              {/* 詳細分析ビュー */}
              {analysisTimeRange === 'monthly' && detailedAnalysis && (
                <DetailedAnalysisView analysis={detailedAnalysis} />
              )}
              {analysisTimeRange === 'alltime' && (
                <DetailedAnalysisView analysis={allTimeDetailedAnalysis} />
              )}
            </>
          )}
        </>
      )}

      {!selectedMonth && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">
            分析対象月を選択してください
          </p>
        </div>
      )}
    </div>
  );
}
