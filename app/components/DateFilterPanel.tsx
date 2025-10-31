'use client';

import { DateFilter, FilterPeriod } from '../types/filter.types';

interface DateFilterPanelProps {
  filter: DateFilter;
  availableMonths: string[];
  onFilterChange: (filter: DateFilter) => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function DateFilterPanel({
  filter,
  availableMonths,
  onFilterChange,
  minDate,
  maxDate,
}: DateFilterPanelProps) {
  const handlePeriodChange = (period: FilterPeriod) => {
    onFilterChange({ ...filter, period });
  };

  const handleMonthChange = (month: string) => {
    onFilterChange({ ...filter, selectedMonth: month });
  };

  const handleStartDateChange = (date: string) => {
    onFilterChange({ ...filter, startDate: date ? new Date(date) : undefined });
  };

  const handleEndDateChange = (date: string) => {
    onFilterChange({ ...filter, endDate: date ? new Date(date) : undefined });
  };

  const formatMonthLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        期間フィルター
      </h3>

      {/* 期間タイプ選択 */}
      <div className="mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => handlePeriodChange('all')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              filter.period === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            全期間
          </button>
          <button
            onClick={() => handlePeriodChange('month')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              filter.period === 'month'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            月別
          </button>
          <button
            onClick={() => handlePeriodChange('custom')}
            className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
              filter.period === 'custom'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            カスタム期間
          </button>
        </div>
      </div>

      {/* 月別選択 */}
      {filter.period === 'month' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            月を選択
          </label>
          <select
            value={filter.selectedMonth || ''}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            <option value="">月を選択してください</option>
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* カスタム期間選択 */}
      {filter.period === 'custom' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              開始日
            </label>
            <input
              type="date"
              value={formatDateForInput(filter.startDate)}
              onChange={(e) => handleStartDateChange(e.target.value)}
              min={formatDateForInput(minDate)}
              max={formatDateForInput(maxDate)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              終了日
            </label>
            <input
              type="date"
              value={formatDateForInput(filter.endDate)}
              onChange={(e) => handleEndDateChange(e.target.value)}
              min={formatDateForInput(filter.startDate || minDate)}
              max={formatDateForInput(maxDate)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      )}
    </div>
  );
}
