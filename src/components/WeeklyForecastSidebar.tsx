import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  CloudSun, 
  Flame, 
  CloudRain, 
  ShieldAlert, 
  Sparkles,
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
  kategoriSaatIni,
  onOpenPLTB
}) => {
  // 4 time slots for "Today" matching the horizontal cards in the photo
  const todayHourly = [
    { label: 'Saat Ini', time: '12:00', skor: skorSaatIni, isNow: true, icon: Flame },
    { label: 'Puncak', time: '14:00', skor: Math.min(100, Math.round(skorSaatIni * 1.1)), isNow: false, icon: Sun },
    { label: 'Sore', time: '17:00', skor: Math.round(skorSaatIni * 0.9), isNow: false, icon: CloudSun },
    { label: 'Malam', time: '20:00', skor: Math.max(10, Math.round(skorSaatIni * 0.65)), isNow: false, icon: CloudSun },
  ];

  const getRiskIcon = (kategori: string) => {
    switch (kategori) {
      case 'SANGAT TINGGI':
        return <Flame className="w-5 h-5 text-red-500" />;
      case 'TINGGI':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'SEDANG':
        return <CloudSun className="w-5 h-5 text-yellow-500" />;
      default:
        return <CloudRain className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <aside className="w-full lg:w-80 bg-white border-l border-slate-100 p-6 flex flex-col justify-between shrink-0 space-y-6">
      <div className="space-y-6">
        
        {/* Header matching `< This Week >` in photo */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <h3 className="text-sm font-bold text-slate-800 tracking-tight">
            Prakiraan 7 Hari
          </h3>

          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* "Today" section matching the photo */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-slate-800 block">
            Hari Ini
          </span>

          <div className="grid grid-cols-4 gap-2">
            {todayHourly.map((slot, i) => {
              const Icon = slot.icon;
              return (
                <div
                  key={i}
                  className={`py-3 px-1.5 rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                    slot.isNow
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span className={`text-[10px] font-semibold block ${slot.isNow ? 'text-blue-100' : 'text-slate-400'}`}>
                    {slot.isNow ? 'Now' : slot.time}
                  </span>

                  <div className="my-1.5">
                    <Icon className={`w-4 h-4 ${slot.isNow ? 'text-white' : 'text-amber-500'}`} />
                  </div>

                  <span className={`text-xs font-bold block ${slot.isNow ? 'text-white' : 'text-slate-900'}`}>
                    {slot.skor}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vertical list of 7 days matching the photo */}
        <div className="space-y-3 pt-2">
          {proyeksi.map((item) => (
            <div
              key={item.hari}
              className="flex items-center justify-between py-1.5 px-1 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  {item.label_hari.split(' ')[0]} {item.label_hari.split(' ')[1]}
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {item.tanggal}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900 min-w-[28px] text-right">
                  {item.skor}
                </span>
                <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center">
                  {getRiskIcon(item.kategori)}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Quick PLTB & Fire Advisory Banner at the bottom of the sidebar */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>Panduan Petani PLTB</span>
        </div>
        <p className="text-[11px] text-emerald-800 leading-relaxed">
          Gunakan metode mekanis atau dekomposer hayati. Membakar lahan berisiko sanksi pidana dan merusak tanah.
        </p>
        {onOpenPLTB && (
          <button
            type="button"
            onClick={onOpenPLTB}
            className="w-full mt-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold transition-colors cursor-pointer"
          >
            Lihat Rekomendasi Lengkap
          </button>
        )}
      </div>

    </aside>
  );
};
