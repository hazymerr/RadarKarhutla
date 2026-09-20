import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  CloudSun, 
  Flame, 
  CloudRain, 
  Sprout,
  CloudFog
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
    <aside className="hidden 2xl:flex 2xl:w-80 bg-white dark:bg-[#0e172e] border-l border-slate-100 dark:border-slate-800 p-6 flex-col justify-between shrink-0 space-y-6 min-h-screen sticky top-0 h-screen transition-colors">
      <div className="space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Minggu Ini
          </h3>

          <button
            type="button"
            className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400"
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
                className={`py-2.5 px-1 rounded-2xl flex flex-col items-center justify-between text-center transition-colors ${
                  slot.isNow
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-[#152238] text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-750'
                }`}
              >
                <span className={`text-[10px] font-medium block ${slot.isNow ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {slot.time}
                </span>
                <div className="my-1">
                  <Icon className={`w-3.5 h-3.5 ${slot.isNow ? 'text-white' : 'text-amber-500'}`} />
                </div>
                <span className="text-xs font-bold block dark:text-slate-200">
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
              className="flex items-center justify-between py-1 px-2 hover:bg-slate-50 dark:hover:bg-[#152238]/60 rounded-xl text-xs transition-colors"
            >
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {item.label_hari.split(' ')[1]?.replace('(', '').replace(')', '') || item.label_hari}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
                  {item.tanggal}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {item.skor}
                </span>
                <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-[#152238] flex items-center justify-center">
                  {getRiskIcon(item.kategori)}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Quick Smoke Forecast Button */}
      {onOpenPLTB && (
        <button
          type="button"
          onClick={onOpenPLTB}
          className="w-full py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/40 text-sky-800 dark:text-sky-300 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-sky-200/80 dark:border-sky-800/60"
        >
          <CloudFog className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span>Prediksi Kabut Asap &rarr;</span>
        </button>
      )}

    </aside>
  );
};
