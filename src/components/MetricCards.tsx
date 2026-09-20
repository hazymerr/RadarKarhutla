import React from 'react';
import { Wind, CloudRain, Flame, Layers } from 'lucide-react';
import { FormInput, HasilAnalisis } from '../types.ts';

interface MetricCardsProps {
  formData: FormInput;
  hasil: HasilAnalisis;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ formData, hasil }) => {
  const getWindSpeed = () => {
    switch (formData.kecepatan_angin) {
      case 'kencang':
      case 'tinggi':
        return '28 km/h';
      case 'sedang':
        return '16 km/h';
      default:
        return '8 km/h';
    }
  };

  const getRainChance = () => {
    switch (formData.curah_hujan) {
      case 'sangat_tinggi':
      case 'tinggi':
        return { pct: '85%', ring: 'stroke-blue-500' };
      case 'sedang':
        return { pct: '50%', ring: 'stroke-sky-400' };
      case 'rendah':
        return { pct: '20%', ring: 'stroke-amber-400' };
      default:
        return { pct: '5%', ring: 'stroke-red-500' };
    }
  };

  const rainInfo = getRainChance();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
      
      {/* 1. Wind */}
      <div className="bg-white dark:bg-[#152238] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100/90 dark:border-slate-700/50 shadow-xs flex items-center justify-between min-w-0 transition-colors">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-400">
            <Wind className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>Angin</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
            {getWindSpeed()}
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 block capitalize truncate">
            {formData.kecepatan_angin}
          </span>
        </div>

        {/* Compass Rose */}
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-slate-200/90 dark:border-slate-700/60 relative flex items-center justify-center bg-slate-50/70 dark:bg-slate-900/80 shrink-0 ml-2">
          <span className="absolute top-0.5 text-[7px] font-bold text-slate-400">N</span>
          <span className="absolute bottom-0.5 text-[7px] font-bold text-slate-400">S</span>
          <span className="absolute left-0.5 text-[7px] font-bold text-slate-400">W</span>
          <span className="absolute right-0.5 text-[7px] font-bold text-slate-400">E</span>
          <div 
            className="w-5 sm:w-6 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full transform shadow-2xs"
            style={{
              transform: (formData.kecepatan_angin === 'tinggi' || formData.kecepatan_angin === 'kencang') ? 'rotate(65deg)' : 'rotate(35deg)'
            }}
          />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800 dark:bg-slate-300 absolute" />
        </div>
      </div>

      {/* 2. Peluang Hujan */}
      <div className="bg-white dark:bg-[#152238] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100/90 dark:border-slate-700/50 shadow-xs flex items-center justify-between min-w-0 transition-colors">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-400">
            <CloudRain className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
            <span>Peluang Hujan</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
            {rainInfo.pct}
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 block capitalize truncate">
            Lembap {formData.kelembapan_udara}%
          </span>
        </div>

        <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 ml-2">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 transform -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="19" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="4" fill="none" />
            <circle
              cx="24"
              cy="24"
              r="19"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={119.38}
              strokeDashoffset={119.38 - (parseInt(rainInfo.pct) / 100) * 119.38}
              strokeLinecap="round"
              fill="none"
              className={rainInfo.ring}
            />
          </svg>
          <span className="absolute text-[10px] sm:text-xs font-bold text-slate-700 dark:text-slate-200">{rainInfo.pct}</span>
        </div>
      </div>

      {/* 3. Hotspot Aktif */}
      <div className="bg-white dark:bg-[#152238] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100/90 dark:border-slate-700/50 shadow-xs flex items-center justify-between min-w-0 transition-colors">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-400">
            <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span>Hotspot Aktif</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight whitespace-nowrap">
            {formData.histori_titik_panas_10km} <span className="text-xs sm:text-sm font-normal text-slate-400">titik</span>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 block truncate">
            Radius 10 km
          </span>
        </div>

        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-orange-50/80 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800/40 shrink-0 ml-2">
          <Flame className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
        </div>
      </div>

      {/* 4. Tipe Lahan */}
      <div className="bg-white dark:bg-[#152238] p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100/90 dark:border-slate-700/50 shadow-xs flex items-center justify-between min-w-0 transition-colors">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-400">
            <Layers className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
            <span>Tipe Lahan</span>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight capitalize truncate">
            {formData.jenis_lahan}
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 block capitalize truncate">
            {formData.kelembapan_tanah.replace('_', ' ')}
          </span>
        </div>

        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center border shrink-0 ml-2 ${
          formData.jenis_lahan === 'gambut'
            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/40'
            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/40'
        }`}>
          <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

    </div>
  );
};
