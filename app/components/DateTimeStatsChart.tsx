'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface HourDistributionData {
  hour: number;
  count: number;
}

interface DayOfWeekDistributionData {
  dayOfWeek: number;
  dayName: string;
  count: number;
}

interface DateTimeStatsChartProps {
  hourDistribution?: HourDistributionData[];
  dayOfWeekDistribution?: DayOfWeekDistributionData[];
}

const HOUR_COLOR = '#3b82f6'; // blue-500
const DAY_COLORS = [
  '#ef4444', // 日曜日 - red-500
  '#f59e0b', // 月曜日 - amber-500
  '#10b981', // 火曜日 - green-500
  '#06b6d4', // 水曜日 - cyan-500
  '#3b82f6', // 木曜日 - blue-500
  '#8b5cf6', // 金曜日 - violet-500
  '#ec4899', // 土曜日 - pink-500
];

export default function DateTimeStatsChart({
  hourDistribution,
  dayOfWeekDistribution,
}: DateTimeStatsChartProps) {
  return (
    <div className="space-y-6">
      {/* 時間帯分布 */}
      {hourDistribution && hourDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            時間帯別の回答分布
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="hour"
                  tick={{ fill: 'currentColor' }}
                  className="text-gray-700 dark:text-gray-300"
                  tickFormatter={(value) => `${value}時`}
                />
                <YAxis tick={{ fill: 'currentColor' }} className="text-gray-700 dark:text-gray-300" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 'bold' }}
                  labelFormatter={(value) => `${value}時台`}
                  formatter={(value: number) => [`${value}件`, '回答数']}
                />
                <Bar dataKey="count" fill={HOUR_COLOR} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 曜日別分布 */}
      {dayOfWeekDistribution && dayOfWeekDistribution.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            曜日別の回答分布
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekDistribution} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                <XAxis
                  dataKey="dayName"
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
                  formatter={(value: number) => [`${value}件`, '回答数']}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {dayOfWeekDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DAY_COLORS[entry.dayOfWeek]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
