'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ValueDistributionChartProps {
  data: Array<{ value: string; count: number; percentage: number }>;
  title: string;
}

const COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
  '#f97316', // orange-500
];

export default function ValueDistributionChart({ data, title }: ValueDistributionChartProps) {
  // データが多すぎる場合は上位10件のみ表示
  const displayData = data.slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{title}</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="value"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: 'currentColor' }}
              className="text-gray-700 dark:text-gray-300"
            />
            <YAxis tick={{ fill: 'currentColor' }} className="text-gray-700 dark:text-gray-300" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#111827', fontWeight: 'bold' }}
              formatter={(value: number) => {
                const item = displayData.find((d) => d.count === value);
                return [
                  `${value}件 (${item?.percentage.toFixed(1)}%)`,
                  '回答数',
                ];
              }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {displayData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {data.length > 10 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          ※ 上位10件のみ表示しています（全{data.length}件）
        </p>
      )}
    </div>
  );
}
