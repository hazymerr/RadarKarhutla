import React from 'react';
import { MapPin, Wind, Droplets, Gauge, Sparkles, Flame } from 'lucide-react';
import { HasilAnalisis, FormInput } from '../types.ts';

interface HeroRiskCardProps {
  hasil: HasilAnalisis;
  formData: FormInput;
}

export const HeroRiskCard: React.FC<HeroRiskCardProps> = ({ hasil, formData }) => {
  const { skor_risiko, kategori_risiko, alasan_risiko } = hasil;

  // Determine soft pastel gradient matching the uploaded reference image
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

  // 4 timeline points matching "Morning, Afternoon, Evening, Night" in the photo
  const dailyTimeline = [
    { label: 'Pagi', time: '07:00', skor: Math.max(10, Math.round(skor_risiko * 0.7)) },
    { label: 'Siang', time: '13:00', skor: Math.min(100, Math.round(skor_risiko * 1.15)) },
    { label: 'Sore', time: '17:00', skor: Math.round(skor_risiko) },
    { label: 'Malam', time: '21:00', skor: Math.max(10, Math.round(skor_risiko * 0.75)) },
  ];

  return (
    <div className={`p-6 sm:p-7 rounded-3xl bg-gradient-to-r ${getGradientStyle()} border shadow-sm relative overflow-hidden`}>
      {/* Background soft cloud/radial shine */}
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-white/40 rounded-full blur-3xl pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Left Section: Location, Massive Risk Score, and mini weather pills */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="truncate max-w-xs">{formData.lokasi}</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Hari Ini {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
            </span>
          </div>

          {/* Huge Main Number + Category status matching "14° Mostly Clear" in photo */}
          <div className="py-1">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl sm:text-7xl font-light tracking-tight text-slate-900 font-sans">
                {skor_risiko}
              </span>
              <span className="text-3xl font-light text-slate-400">
                /100
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm sm:text-base font-semibold text-slate-800">
                Risiko {kategori_risiko}
              </span>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">
                ({formData.jenis_lahan === 'gambut' ? 'Lahan Gambut' : 'Tanah Mineral'})
              </span>
            </div>
          </div>

          {/* Bottom Pills matching the photo (e.g. 720hpa, 32%, 12km/h) */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/80 shadow-2xs">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>{formData.curah_hujan.toUpperCase()}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/80 shadow-2xs">
              <Wind className="w-3.5 h-3.5 text-cyan-600" />
              <span>Angin {formData.kecepatan_angin}</span>
            </div>

            <div className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/80 shadow-2xs">
              <Gauge className="w-3.5 h-3.5 text-amber-600" />
              <span>{formData.riwayat_titik_panas_30hari} Titik Panas</span>
            </div>
          </div>
        </div>

        {/* Right Section: Temperature/Risk Fluctuation Curve matching photo right half */}
        <div className="lg:col-span-6 bg-white/50 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Fluktuasi Harian (Siklus 24 Jam)
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              Puncak Panas: 12:00 - 15:00
            </span>
          </div>

          {/* Curved SVG Sparkline matching photo */}
          <div className="w-full h-20 pt-2 flex items-center justify-center">
            <svg viewBox="0 0 320 60" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="curveGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
              </defs>
              {/* Smooth Bezier path */}
              <path
                d="M 20 40 C 70 42, 100 12, 135 15 C 170 18, 200 28, 235 30 C 270 32, 290 45, 305 44"
                fill="none"
                stroke="url(#curveGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              {/* Data points */}
              <circle cx="20" cy="40" r="4.5" fill="#ffffff" stroke="#38bdf8" strokeWidth="2.5" />
              <circle cx="135" cy="15" r="5" fill="#ffffff" stroke="#f59e0b" strokeWidth="3" />
              <circle cx="235" cy="30" r="4.5" fill="#ffffff" stroke="#f97316" strokeWidth="2.5" />
              <circle cx="305" cy="44" r="4.5" fill="#ffffff" stroke="#64748b" strokeWidth="2" />
            </svg>
          </div>

          {/* 4 intervals matching Morning, Afternoon, Evening, Night */}
          <div className="grid grid-cols-4 gap-2 text-center pt-1 border-t border-white/60">
            {dailyTimeline.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-[10px] text-slate-500 block font-medium">
                  {item.label}
                </span>
                <span className="text-xs font-bold text-slate-800 block">
                  {item.skor}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
