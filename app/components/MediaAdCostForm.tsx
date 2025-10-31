'use client';

import { useState } from 'react';
import { DailyAdCost, MediaType, MEDIA_TYPES } from '../types/media.types';

interface MediaAdCostFormProps {
  onAdd: (adCost: DailyAdCost) => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function MediaAdCostForm({ onAdd, minDate, maxDate }: MediaAdCostFormProps) {
  const [date, setDate] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('Instagram');
  const [cost, setCost] = useState('');
  const [contractCount, setContractCount] = useState('');
  const [note, setNote] = useState('');
  const [showForm, setShowForm] = useState(false);

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 早期return：必須項目チェック
    if (!date || !cost || !contractCount) {
      alert('日付、広告費用、成約数は必須項目です');
      return;
    }

    const costNum = parseFloat(cost);
    const contractNum = parseInt(contractCount, 10);

    // 早期return：数値バリデーション
    if (isNaN(costNum) || costNum < 0) {
      alert('広告費用は0以上の数値を入力してください');
      return;
    }

    if (isNaN(contractNum) || contractNum < 0) {
      alert('成約数は0以上の整数を入力してください');
      return;
    }

    const newAdCost: DailyAdCost = {
      id: `${Date.now()}-${Math.random()}`,
      date,
      mediaType,
      cost: costNum,
      contractCount: contractNum,
      note: note.trim() || undefined,
    };

    onAdd(newAdCost);

    // フォームをリセット
    setDate('');
    setCost('');
    setContractCount('');
    setNote('');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer font-medium"
        >
          + 広告費用・成約数を追加
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          広告費用・成約数を追加
        </h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 日付 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={formatDateForInput(minDate)}
            max={formatDateForInput(maxDate)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* 媒体選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            媒体 <span className="text-red-500">*</span>
          </label>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value as MediaType)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {MEDIA_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* 広告費用 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            広告費用（円） <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            min="0"
            step="1"
            required
            placeholder="例: 50000"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* 成約数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            成約数 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={contractCount}
            onChange={(e) => setContractCount(e.target.value)}
            min="0"
            step="1"
            required
            placeholder="例: 5"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* 備考 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            備考（任意）
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: リール広告"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* ボタン */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer font-medium"
          >
            追加
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
}
