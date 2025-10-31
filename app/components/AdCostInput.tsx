'use client';

import { useState } from 'react';
import { AdCost } from '../types/advertisement.types';

interface AdCostInputProps {
  onAdd: (adCost: AdCost) => void;
  availableMonths: string[];
  minDate?: Date;
  maxDate?: Date;
}

export default function AdCostInput({ onAdd, availableMonths, minDate, maxDate }: AdCostInputProps) {
  const [inputMode, setInputMode] = useState<'month' | 'custom'>('month');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // バリデーション
    if (!cost) {
      setError('広告費用を入力してください');
      return;
    }

    const costNumber = parseFloat(cost);
    if (isNaN(costNumber) || costNumber <= 0) {
      setError('費用は0より大きい数値を入力してください');
      return;
    }

    let start: Date;
    let end: Date;

    if (inputMode === 'month') {
      // 月モード
      if (!selectedMonth) {
        setError('対象月を選択してください');
        return;
      }
      const [year, month] = selectedMonth.split('-').map(Number);
      start = new Date(year, month - 1, 1);
      end = new Date(year, month, 0); // 月の最終日
    } else {
      // カスタム日付モード
      if (!startDate || !endDate) {
        setError('開始日と終了日を入力してください');
        return;
      }
      start = new Date(startDate);
      end = new Date(endDate);

      if (start > end) {
        setError('開始日は終了日より前である必要があります');
        return;
      }
    }

    // 広告費用を追加
    const newAdCost: AdCost = {
      id: `ad-${Date.now()}`,
      startDate: start,
      endDate: end,
      cost: costNumber,
      description: description || undefined,
    };

    onAdd(newAdCost);

    // フォームをリセット
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
    setCost('');
    setDescription('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        広告費用を追加
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* 入力モード切り替え */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setInputMode('month')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              inputMode === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            月ごと指定
          </button>
          <button
            type="button"
            onClick={() => setInputMode('custom')}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              inputMode === 'custom'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            カスタム日付
          </button>
        </div>

        {/* 月ごと指定 */}
        {inputMode === 'month' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              対象月 <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required={inputMode === 'month'}
            >
              <option value="">月を選択してください</option>
              {availableMonths.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* カスタム日付指定 */}
        {inputMode === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                開始日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={formatDateForInput(minDate)}
                max={formatDateForInput(maxDate)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required={inputMode === 'custom'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                終了日 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || formatDateForInput(minDate)}
                max={formatDateForInput(maxDate)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required={inputMode === 'custom'}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            広告費用（円） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="例: 100000"
            min="0"
            step="1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            説明（任意）
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例: Google広告キャンペーン"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium cursor-pointer"
        >
          追加
        </button>
      </form>
    </div>
  );
}
