'use client';

import { useState } from 'react';
import CSVUploader from './components/CSVUploader';
import Sidebar from './components/Sidebar';
import StatsView from './components/StatsView';
import { CSVData } from './types/csv.types';

export default function Home() {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);

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
  };

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
                  <span>データ行数: {csvData.rows.length.toLocaleString()}</span>
                  <span>カラム数: {csvData.headers.length}</span>
                  <span>
                    アップロード: {csvData.uploadedAt.toLocaleString('ja-JP')}
                  </span>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                別のファイルを選択
              </button>
            </div>
          </header>

          {/* メインコンテンツ */}
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              headers={csvData.headers}
              selectedColumn={selectedColumn}
              onSelectColumn={handleSelectColumn}
            />

            {selectedColumn && (
              <StatsView data={csvData} selectedColumn={selectedColumn} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
