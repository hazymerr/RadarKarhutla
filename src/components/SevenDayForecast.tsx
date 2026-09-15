import React from 'react';
import { HasilAnalisis } from '../types.ts';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface SevenDayForecastProps {
  proyeksi: NonNullable<HasilAnalisis['proyeksi_7_hari']>;
}

export const SevenDayForecast: React.FC<SevenDayForecastProps> = ({ proyeksi }) => {
  if (!proyeksi || proyeksi.length === 0) return null;

  const getDayColor = (kat: string) => {
    switch (kat) {
      case 'SANGAT TINGGI':
        return 'border-red-600 bg-red-950/40 text-red-300';
      case 'TINGGI':
        return 'border-orange-500 bg-orange-950/40 text-orange-300';
      case 'SEDANG':
        return 'border-yellow-500 bg-yellow-950/40 text-yellow-300';
      default:
        return 'border-emerald-500 bg-emerald-950/40 text-emerald-300';
    }
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
            Proyeksi Tren Risiko Karhutla 7 Hari Ke Depan
          </h3>
        </div>
        <span className="text-xs text-stone-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
          Estimasi Fluktuasi Harian
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {proyeksi.map((item) => {
          const colorClass = getDayColor(item.kategori);
          return (
            <div
              key={item.hari}
              className={`p-3 rounded-lg border text-center transition-all ${colorClass}`}
            >
              <span className="text-[11px] font-semibold block text-stone-400">
                {item.label_hari}
              </span>
              <span className="text-[10px] text-stone-500 block mb-1">
                {item.tanggal}
              </span>
              <div className="my-1.5">
                <span className="text-2xl font-black text-white">
                  {item.skor}
                </span>
                <span className="text-[10px] block font-bold tracking-tight">
                  {item.kategori}
                </span>
              </div>
              <p className="text-[9px] text-stone-300 line-clamp-2 leading-tight mt-1 border-t border-stone-800/60 pt-1">
                {item.kondisi}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
