import React from 'react';
import { MapPin, Wind, Droplets, Flame, Sparkles } from 'lucide-react';
import { HasilAnalisis, FormInput } from '../types.ts';

interface HeroRiskCardProps {
  hasil: HasilAnalisis;
  formData: FormInput;
}

export const HeroRiskCard: React.FC<HeroRiskCardProps> = ({ hasil, formData }) => {
  const { skor_risiko, kategori_risiko } = hasil;

  const getGradientStyle = () => {
    switch (kategori_risiko) {
      case 'SANGAT TINGGI':
        return 'from-red-100/90 via-orange-50 to-rose-50 text-red-950 border-red-200/80';
      case 'TINGGI':
        return 'from-amber-100/90 via-orange-50 to-amber-50 text-orange-950 border-orange-200/80';
      case 'SEDANG':
        return 'from-sky-100 via-blue-50 to-indigo-50/70 text-slate-900 border-sky-200/80';
      default:
        return 'from-blue-100/90 via-sky-50 to-emerald-50/60 text-slate-900 border-blue-200/80';
    }
  };

  const dailyTimeline = [
    { label: 'Pagi', time: '07:00', skor: Math.max(10, Math.round(skor_risiko * 0.7)) },
    { label: 'Siang', time: '13:00', skor: Math.min(100, Math.round(skor_risiko * 1.15)) },
    { label: 'Sore', time: '17:00', skor: Math.round(skor_risiko) },
    { label: 'Malam', time: '21:00', skor: Math.max(10, Math.round(skor_risiko * 0.75)) },
  ];

  return (
    <div className={`p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-r ${getGradientStyle()} border shadow-xs relative overflow-hidden`}>
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center relative z-10">
        
        {/* Left Section */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs sm:text-sm">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
              <span className="truncate">{formData.lokasi}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-500">
              Hari Ini
            </span>
          </div>

          {/* Main Number + Category status */}
          <div className="py-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl sm:text-7xl font-light tracking-tight text-slate-900">
                {skor_risiko}
              </span>
              <span className="text-xl sm:text-2xl font-light text-slate-400">
                /100
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm sm:text-base font-bold text-slate-900">
                Risiko {kategori_risiko}
              </span>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs sm:text-sm text-slate-600 font-medium capitalize">
                &bull; Lahan {formData.jenis_lahan}
              </span>
            </div>
          </div>

          {/* Clean concise pills: generous spacing */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs text-slate-700 pt-1">
            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/90 shadow-2xs" title="Curah Hujan">
              <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="text-slate-500">Hujan:</span>
              <span className="font-semibold capitalize">{formData.curah_hujan.replace('_', ' ')}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/90 shadow-2xs" title="Kecepatan Angin">
              <Wind className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span className="text-slate-500">Angin:</span>
              <span className="font-semibold capitalize">{formData.kecepatan_angin}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/90 shadow-2xs" title="Titik Panas Hotspot 10km">
              <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
              <span className="font-semibold">{formData.histori_titik_panas_10km}</span>
              <span className="text-slate-500">Hotspot</span>
            </div>
          </div>
        </div>

        {/* Right Section: Mini Fluctuation Sparkline */}
        <div className="lg:col-span-5 bg-white/60 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-white/90 shadow-2xs space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
            <span>Fluktuasi 24 Jam</span>
            <span className="text-[11px] text-slate-400 font-normal">Puncak 13:00</span>
          </div>

          {/* Curved SVG Sparkline */}
          <div className="w-full h-14 sm:h-18 flex items-center justify-center">
            <svg viewBox="0 0 320 60" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              <path
                d="M 20 40 C 70 42, 100 12, 135 15 C 170 18, 200 28, 235 30 C 270 32, 290 45, 305 44"
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="20" cy="40" r="4" fill="#ffffff" stroke="#38bdf8" strokeWidth="2.5" />
              <circle cx="135" cy="15" r="4.5" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" />
              <circle cx="235" cy="30" r="4" fill="#ffffff" stroke="#f97316" strokeWidth="2.5" />
              <circle cx="305" cy="44" r="4" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
            </svg>
          </div>

          {/* 4 intervals */}
          <div className="grid grid-cols-4 gap-2 text-center pt-1.5 border-t border-white/80">
            {dailyTimeline.map((item, idx) => (
              <div key={idx}>
                <span className="text-[10px] sm:text-[11px] text-slate-400 block font-medium">
                  {item.label}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 block">
                  {item.skor}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
