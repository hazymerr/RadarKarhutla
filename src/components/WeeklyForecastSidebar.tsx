import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  CloudSun, 
  Flame, 
  CloudRain, 
  Sprout
} from 'lucide-react';
import { HasilAnalisis } from '../types.ts';

interface WeeklyForecastSidebarProps {
  proyeksi: NonNullable<HasilAnalisis['proyeksi_7_hari']>;
  skorSaatIni: number;
  kategoriSaatIni: string;
  onOpenPLTB?: () => void;
}

export const WeeklyForecastSidebar: React.FC<WeeklyForecastSidebarProps> = ({
  proyeksi,
  skorSaatIni,
  onOpenPLTB
}) => {
  const todayHourly = [
    { time: 'Now', skor: skorSaatIni, isNow: true, icon: Flame },
    { time: '14:00', skor: Math.min(100, Math.round(skorSaatIni * 1.1)), isNow: false, icon: Sun },
    { time: '17:00', skor: Math.round(skorSaatIni * 0.9), isNow: false, icon: CloudSun },
    { time: '20:00', skor: Math.max(10, Math.round(skorSaatIni * 0.65)), isNow: false, icon: CloudSun },
  ];

  const getRiskIcon = (kategori: string) => {
    switch (kategori) {
      case 'SANGAT TINGGI':
        return <Flame className="w-4 h-4 text-red-500" />;
      case 'TINGGI':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'SEDANG':
        return <CloudSun className="w-4 h-4 text-yellow-500" />;
      default:
        return <CloudRain className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <aside className="hidden 2xl:flex 2xl:w-80 bg-white border-l border-slate-100 p-6 flex-col justify-between shrink-0 space-y-6 min-h-screen sticky top-0 h-screen">
      <div className="space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Minggu Ini
          </h3>

          <button
            type="button"
            className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 4 Hourly Slots */}
        <div className="grid grid-cols-4 gap-1.5">
          {todayHourly.map((slot, i) => {
            const Icon = slot.icon;
            return (
              <div
                key={i}
                className={`py-2.5 px-1 rounded-2xl flex flex-col items-center justify-between text-center ${
                  slot.isNow
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700'
                }`}
              >
                <span className={`text-[10px] font-medium block ${slot.isNow ? 'text-blue-100' : 'text-slate-400'}`}>
                  {slot.time}
                </span>
                <div className="my-1">
                  <Icon className={`w-3.5 h-3.5 ${slot.isNow ? 'text-white' : 'text-amber-500'}`} />
                </div>
                <span className="text-xs font-bold block">
                  {slot.skor}
                </span>
              </div>
            );
          })}
        </div>

        {/* 7-Day List */}
        <div className="space-y-2 pt-1">
          {proyeksi.map((item) => (
            <div
              key={item.hari}
              className="flex items-center justify-between py-1 px-1 hover:bg-slate-50 rounded-xl text-xs"
            >
              <div>
                <span className="font-bold text-slate-800 block">
                  {item.label_hari.split(' ')[1]?.replace('(', '').replace(')', '') || item.label_hari}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {item.tanggal}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-900">
                  {item.skor}
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center">
                  {getRiskIcon(item.kategori)}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Quick PLTB Button */}
      {onOpenPLTB && (
        <button
          type="button"
          onClick={onOpenPLTB}
          className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-200/80"
        >
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span>Solusi PLTB Petani &rarr;</span>
        </button>
      )}

    </aside>
  );
};
