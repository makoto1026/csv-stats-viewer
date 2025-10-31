'use client';

import { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatsView from './components/StatsView';
import DateFilterPanel from './components/DateFilterPanel';
import AdCostInput from './components/AdCostInput';
import AdPerformanceView from './components/AdPerformanceView';
import MediaAnalyticsView from './components/MediaAnalyticsView';
import { CSVData } from './types/csv.types';
import { DateFilter } from './types/filter.types';
import { AdCost } from './types/advertisement.types';
import {
  detectDateColumn,
  filterDataByPeriod,
  getAvailableMonths,
  getDateRange,
} from './utils/dateFilter';
import { loadAdCosts, saveAdCosts, removeAdCost } from './utils/adCostStorage';
import { calculateAdPerformance, calculateTotalAdPerformance } from './utils/adPerformance';
import { loadFromGoogleSheets } from './utils/sheetsLoader';

export default function Home() {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ period: 'all' });
  const [adCosts, setAdCosts] = useState<AdCost[]>([]);
  const [showAdCostPanel, setShowAdCostPanel] = useState(false);
  const [showMediaAnalytics, setShowMediaAnalytics] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Googleスプレッドシートからデータを読み込む
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadFromGoogleSheets();
      setCsvData(data);
      if (data.headers.length > 0) {
        setSelectedColumn(data.headers[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // 初回マウント時にスプレッドシートからデータを読み込み
  useEffect(() => {
    loadData();
    // 広告費用データを読み込み
    setAdCosts(loadAdCosts());
  }, []);

  const handleSelectColumn = (column: string) => {
    setSelectedColumn(column);
  };

  const handleReload = () => {
    loadData();
  };

  const handleAddAdCost = (adCost: AdCost) => {
    const newAdCosts = [...adCosts, adCost];
    setAdCosts(newAdCosts);
    saveAdCosts(newAdCosts);
  };

  const handleRemoveAdCost = (id: string) => {
    removeAdCost(id);
    setAdCosts(loadAdCosts());
  };

  // 日付カラムの検出
  const dateColumn = useMemo(() => {
    return csvData ? detectDateColumn(csvData) : null;
  }, [csvData]);

  // フィルタリングされたデータ
  const filteredData = useMemo(() => {
    if (!csvData || !dateColumn) return csvData;
    return filterDataByPeriod(csvData, dateColumn, dateFilter);
  }, [csvData, dateColumn, dateFilter]);

  // 利用可能な月のリスト
  const availableMonths = useMemo(() => {
    if (!csvData || !dateColumn) return [];
    return getAvailableMonths(csvData, dateColumn);
  }, [csvData, dateColumn]);

  // 日付範囲
  const dateRange = useMemo(() => {
    if (!csvData || !dateColumn) return null;
    return getDateRange(csvData, dateColumn);
  }, [csvData, dateColumn]);

  // 広告費用パフォーマンス
  const adPerformances = useMemo(() => {
    if (!csvData || !dateColumn || adCosts.length === 0) return [];
    return adCosts.map(adCost => calculateAdPerformance(csvData, dateColumn, adCost));
  }, [csvData, dateColumn, adCosts]);

  // 合計パフォーマンス
  const totalAdPerformance = useMemo(() => {
    if (!csvData || !dateColumn || adCosts.length === 0) return null;
    return calculateTotalAdPerformance(csvData, dateColumn, adCosts);
  }, [csvData, dateColumn, adCosts]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isLoading ? (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">データを読み込み中...</p>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
                  エラーが発生しました
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
                <button
                  onClick={handleReload}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer"
                >
                  再読み込み
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : csvData ? (
        <div className="h-screen flex flex-col">
          {/* ヘッダー */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {csvData.fileName}
                </h1>
                <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>
                    データ行数: {filteredData?.rows.length.toLocaleString() || 0} / {csvData.rows.length.toLocaleString()}
                  </span>
                  <span>カラム数: {csvData.headers.length}</span>
                  <span>
                    アップロード: {csvData.uploadedAt.toLocaleString('ja-JP')}
                  </span>
                  {dateColumn && (
                    <span className="text-blue-600 dark:text-blue-400">
                      期間フィルター: 有効
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {dateColumn && (
                  <>
                    <button
                      onClick={() => {
                        setShowMediaAnalytics(!showMediaAnalytics);
                        setShowAdCostPanel(false);
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
                        setShowAdCostPanel(!showAdCostPanel);
                        setShowMediaAnalytics(false);
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                        showAdCostPanel
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      広告費用対効果（旧）
                    </button>
                  </>
                )}
                <button
                  onClick={handleReload}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? '読み込み中...' : '再読み込み'}
                </button>
              </div>
            </div>
          </header>

          {/* メインコンテンツ */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              headers={csvData.headers}
              selectedColumn={selectedColumn}
              onSelectColumn={handleSelectColumn}
            />

            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-6xl mx-auto space-y-6">
                {/* 媒体別分析パネル */}
                {showMediaAnalytics && dateColumn && csvData && (
                  <MediaAnalyticsView
                    csvData={csvData}
                    dateColumn={dateColumn}
                    availableMonths={availableMonths}
                    minDate={dateRange?.min}
                    maxDate={dateRange?.max}
                  />
                )}

                {/* 広告費用対効果パネル（旧） */}
                {showAdCostPanel && dateColumn && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        広告費用対効果（旧）
                      </h2>
                      <button
                        onClick={() => setShowAdCostPanel(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <AdCostInput
                      onAdd={handleAddAdCost}
                      availableMonths={availableMonths}
                      minDate={dateRange?.min}
                      maxDate={dateRange?.max}
                    />

                    <AdPerformanceView
                      adCosts={adCosts}
                      performances={adPerformances}
                      totalPerformance={totalAdPerformance}
                      onRemove={handleRemoveAdCost}
                    />
                  </div>
                )}

                {/* 期間フィルター */}
                {!showAdCostPanel && !showMediaAnalytics && dateColumn && (
                  <DateFilterPanel
                    filter={dateFilter}
                    availableMonths={availableMonths}
                    onFilterChange={setDateFilter}
                    minDate={dateRange?.min}
                    maxDate={dateRange?.max}
                  />
                )}

                {/* 統計ビュー */}
                {!showAdCostPanel && !showMediaAnalytics && selectedColumn && filteredData && (
                  <StatsView data={filteredData} selectedColumn={selectedColumn} />
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
