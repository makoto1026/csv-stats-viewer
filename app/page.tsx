'use client';

import { useState, useEffect, useMemo } from 'react';
import CSVUploader from './components/CSVUploader';
import Sidebar from './components/Sidebar';
import StatsView from './components/StatsView';
import DateFilterPanel from './components/DateFilterPanel';
import AdCostInput from './components/AdCostInput';
import AdPerformanceView from './components/AdPerformanceView';
import { CSVData } from './types/csv.types';
import { DateFilter } from './types/filter.types';
import { AdCost } from './types/advertisement.types';
import { saveToStorage, loadFromStorage, clearStorage } from './utils/storage';
import {
  detectDateColumn,
  filterDataByPeriod,
  getAvailableMonths,
  getDateRange,
} from './utils/dateFilter';
import { loadAdCosts, saveAdCosts, removeAdCost } from './utils/adCostStorage';
import { calculateAdPerformance, calculateTotalAdPerformance } from './utils/adPerformance';

export default function Home() {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>({ period: 'all' });
  const [adCosts, setAdCosts] = useState<AdCost[]>([]);
  const [showAdCostPanel, setShowAdCostPanel] = useState(false);

  // 初回マウント時にlocalStorageからデータを読み込み（クライアント側のみ）
  useEffect(() => {
    const savedData = loadFromStorage();
    if (savedData) {
      // localStorageからの初期データ読み込みのため、ここでのsetStateは問題なし
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCsvData(savedData);
      if (savedData.headers.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedColumn(savedData.headers[0]);
      }
    }

    // 広告費用データを読み込み
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAdCosts(loadAdCosts());

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsInitialized(true);
  }, []);

  // csvDataが変更されたらlocalStorageに保存（初期化後のみ）
  useEffect(() => {
    if (isInitialized && csvData) {
      saveToStorage(csvData);
    }
  }, [csvData, isInitialized]);

  const handleUploadSuccess = (data: CSVData) => {
    setCsvData(data);
    // 最初のカラムをデフォルトで選択
    if (data.headers.length > 0) {
      setSelectedColumn(data.headers[0]);
    }
  };

  const handleSelectColumn = (column: string) => {
    setSelectedColumn(column);
  };

  const handleReset = () => {
    setCsvData(null);
    setSelectedColumn(null);
    setDateFilter({ period: 'all' });
    clearStorage();
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
      {!csvData ? (
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              CSV統計ビューア
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              CSVファイルをアップロードして統計情報を確認できます
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              ※ アップロードしたデータはブラウザに保存され、ページを閉じても保持されます
            </p>
          </header>

          <div className="flex items-center justify-center min-h-[60vh]">
            <CSVUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        </div>
      ) : (
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
                  <button
                    onClick={() => setShowAdCostPanel(!showAdCostPanel)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showAdCostPanel
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    広告費用対効果
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  別のファイルを選択
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
                {/* 広告費用対効果パネル */}
                {showAdCostPanel && dateColumn && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        広告費用対効果
                      </h2>
                      <button
                        onClick={() => setShowAdCostPanel(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        ✕
                      </button>
                    </div>

                    <AdCostInput
                      onAdd={handleAddAdCost}
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
                {!showAdCostPanel && dateColumn && (
                  <DateFilterPanel
                    filter={dateFilter}
                    availableMonths={availableMonths}
                    onFilterChange={setDateFilter}
                    minDate={dateRange?.min}
                    maxDate={dateRange?.max}
                  />
                )}

                {/* 統計ビュー */}
                {!showAdCostPanel && selectedColumn && filteredData && (
                  <StatsView data={filteredData} selectedColumn={selectedColumn} />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
