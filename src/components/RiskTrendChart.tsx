import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { HasilAnalisis } from '../types.ts';
import { TrendingUp } from 'lucide-react';

interface RiskTrendChartProps {
  proyeksi: NonNullable<HasilAnalisis['proyeksi_7_hari']>;
  skorSaatIni: number;
  kategoriSaatIni: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: NonNullable<HasilAnalisis['proyeksi_7_hari']>[0] }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-[#0e172e]/95 backdrop-blur-sm p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-md text-xs space-y-1">
        <div className="font-bold text-slate-800 dark:text-white flex justify-between gap-3">
          <span>{data.label_hari}</span>
          <span className="text-blue-600 dark:text-blue-400 font-bold">{data.skor}/100</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400">{data.kategori} &bull; {data.kondisi}</div>
      </div>
    );
  }
  return null;
};

export const RiskTrendChart: React.FC<RiskTrendChartProps> = ({
  proyeksi,
  skorSaatIni,
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (!proyeksi || proyeksi.length === 0) return null;

  const maxScore = Math.max(...proyeksi.map((p) => p.skor), skorSaatIni);

  return (
    <div className="bg-white dark:bg-[#152238] border border-slate-100 dark:border-slate-700/50 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xs space-y-3 sm:space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              Tren Risiko 7 Hari
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400">Proyeksi harian</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline">Puncak:</span>
          <span className="px-2 py-0.5 rounded-md font-bold text-[11px] sm:text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50">
            {maxScore}/100
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-36 sm:h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={proyeksi} margin={{ top: 8, right: 8, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.18)" />
            <XAxis
              dataKey="tanggal"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              ticks={[0, 30, 60, 85, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="skor"
              stroke="#ea580c"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#areaGrad)"
              dot={{ r: 2.5, fill: '#ea580c', stroke: '#fff', strokeWidth: 1.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Minimal 7-Day Chips */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 pt-1 border-t border-slate-50">
        {proyeksi.map((item) => {
          const isSelected = selectedDay === item.hari;
          const isHigh = item.skor >= 61;

          return (
            <button
              key={item.hari}
              type="button"
              onClick={() => setSelectedDay(item.hari)}
              className={`p-1 sm:p-2 rounded-lg sm:rounded-xl text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <span className={`text-[9px] sm:text-[10px] block font-medium ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {item.label_hari.split(' ')[0]}
              </span>
              <span className="text-[11px] sm:text-xs font-bold block my-0.5">
                {item.skor}
              </span>
              <span className={`w-1.5 h-1.5 rounded-full mx-auto block ${
                isSelected ? 'bg-white' : (isHigh ? 'bg-red-500' : 'bg-emerald-500')
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
};
