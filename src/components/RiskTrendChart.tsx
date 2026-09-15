import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { HasilAnalisis } from '../types.ts';
import { TrendingUp, ShieldAlert, Sparkles, Calendar, Info } from 'lucide-react';

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
    const getBadgeStyle = (kat: string) => {
      switch (kat) {
        case 'SANGAT TINGGI':
          return 'bg-red-100 text-red-800 border-red-200';
        case 'TINGGI':
          return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'SEDANG':
          return 'bg-amber-100 text-amber-800 border-amber-200';
        default:
          return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      }
    };

    return (
      <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-xl border border-stone-200 shadow-xl text-xs space-y-1.5 min-w-[200px]">
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1.5">
          <span className="font-bold text-stone-800">{data.label_hari}</span>
          <span className="text-[11px] text-stone-500">{data.tanggal}</span>
        </div>
        <div className="flex items-baseline justify-between pt-1">
          <span className="text-stone-500">Skor Risiko:</span>
          <span className="text-lg font-black text-stone-900">{data.skor}/100</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-stone-500">Status:</span>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getBadgeStyle(data.kategori)}`}>
            {data.kategori}
          </span>
        </div>
        <div className="pt-1.5 border-t border-stone-100 text-[11px] text-stone-600 leading-snug">
          <span className="font-semibold text-stone-700">Kondisi: </span>
          {data.kondisi}
        </div>
      </div>
    );
  }
  return null;
};

export const RiskTrendChart: React.FC<RiskTrendChartProps> = ({
  proyeksi,
  skorSaatIni,
  kategoriSaatIni,
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  if (!proyeksi || proyeksi.length === 0) return null;

  const maxScore = Math.max(...proyeksi.map((p) => p.skor), skorSaatIni);
  const minScore = Math.min(...proyeksi.map((p) => p.skor), skorSaatIni);

  const activeDetail = selectedDay
    ? proyeksi.find((p) => p.hari === selectedDay)
    : proyeksi[0];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                Fluktuasi Tren Risiko 7 Hari
              </h3>
              <p className="text-xs text-stone-500">
                Proyeksi interaktif dinamika cuaca, kelembapan, dan arah rambatan api
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            Rentang: H+1 s/d H+7
          </span>
        </div>
      </div>

      {/* Interactive Recharts Container */}
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={proyeksi}
            margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
            onClick={(state: any) => {
              if (state && state.activePayload && state.activePayload[0]) {
                setSelectedDay(state.activePayload[0].payload.hari);
              }
            }}
          >
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#f59e0b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="tanggal"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              dy={8}
            />

            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              ticks={[0, 30, 60, 85, 100]}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Threshold Reference Lines */}
            <ReferenceLine
              y={85}
              stroke="#ef4444"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: 'Sangat Tinggi (85)',
                fill: '#dc2626',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <ReferenceLine
              y={60}
              stroke="#f97316"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: 'Tinggi (60)',
                fill: '#ea580c',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            <ReferenceLine
              y={30}
              stroke="#10b981"
              strokeDasharray="4 4"
              strokeWidth={1}
              label={{
                value: 'Rendah (30)',
                fill: '#059669',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />

            <Area
              type="monotone"
              dataKey="skor"
              stroke="#ea580c"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#riskGradient)"
              activeDot={{
                r: 6,
                fill: '#c2410c',
                stroke: '#ffffff',
                strokeWidth: 2,
              }}
              dot={{
                r: 3.5,
                fill: '#ea580c',
                stroke: '#ffffff',
                strokeWidth: 1.5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Threshold Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-600">
          <span className="font-semibold text-stone-700">Zona Bahaya:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Rendah (0-30)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            Sedang (31-60)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            Tinggi (61-85)
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            Sangat Tinggi (86-100)
          </span>
        </div>

        <span className="text-[11px] text-stone-400 italic">
          *Klik titik atau kartu hari untuk melihat detail
        </span>
      </div>

      {/* Interactive 7-Day Day Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
        {proyeksi.map((item) => {
          const isSelected = selectedDay === item.hari;
          const getStatusColor = (kategori: string) => {
            switch (kategori) {
              case 'SANGAT TINGGI':
                return 'border-red-300 bg-red-50/70 text-red-800 hover:bg-red-50';
              case 'TINGGI':
                return 'border-orange-300 bg-orange-50/70 text-orange-800 hover:bg-orange-50';
              case 'SEDANG':
                return 'border-amber-300 bg-amber-50/70 text-amber-800 hover:bg-amber-50';
              default:
                return 'border-emerald-300 bg-emerald-50/70 text-emerald-800 hover:bg-emerald-50';
            }
          };

          return (
            <button
              key={item.hari}
              type="button"
              onClick={() => setSelectedDay(item.hari)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'ring-2 ring-orange-500 shadow-sm ' + getStatusColor(item.kategori)
                  : 'bg-stone-50/60 border-stone-200 text-stone-700 hover:bg-white hover:border-stone-300'
              }`}
            >
              <span className="text-[10px] font-semibold text-stone-500 block uppercase">
                {item.label_hari.split(' ')[0]}
              </span>
              <span className="text-[11px] font-medium text-stone-600 block">
                {item.tanggal}
              </span>
              <div className="my-1">
                <span className="text-xl font-bold text-stone-900 block">
                  {item.skor}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-tight block truncate">
                  {item.kategori}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Day Highlight Info Banner */}
      {activeDetail && (
        <div className="p-3.5 rounded-xl bg-orange-50/80 border border-orange-200 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-orange-100 text-orange-700 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">
                Peringatan Cuaca {activeDetail.label_hari} ({activeDetail.tanggal})
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-orange-800 border border-orange-200">
                Skor {activeDetail.skor} &bull; {activeDetail.kategori}
              </span>
            </div>
            <p className="text-stone-700 mt-1 leading-relaxed">
              {activeDetail.kondisi}. Direkomendasikan meningkatkan ronda keliling batas lahan serta memastikan cadangan air sumur bor/parit kanal dalam kondisi siap alir.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
