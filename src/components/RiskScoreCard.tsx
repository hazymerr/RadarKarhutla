import React from 'react';
import { HasilAnalisis } from '../types.ts';
import { Flame, ShieldAlert, Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface RiskScoreCardProps {
  hasil: HasilAnalisis;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ hasil }) => {
  const { skor_risiko, kategori_risiko, alasan_risiko, asumsi, peringatan_keselamatan } = hasil;

  const getCategoryTheme = () => {
    switch (kategori_risiko) {
      case 'SANGAT TINGGI':
        return {
          badge: 'bg-red-50 text-red-700 border-red-200',
          strokeColor: '#dc2626',
          iconColor: 'text-red-600',
          cardBg: 'bg-red-50/50 border-red-200',
          label: 'Bahaya Ekstrem (86 - 100)'
        };
      case 'TINGGI':
        return {
          badge: 'bg-orange-50 text-orange-700 border-orange-200',
          strokeColor: '#ea580c',
          iconColor: 'text-orange-600',
          cardBg: 'bg-orange-50/40 border-orange-200',
          label: 'Siaga Tinggi (61 - 85)'
        };
      case 'SEDANG':
        return {
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          strokeColor: '#d97706',
          iconColor: 'text-amber-600',
          cardBg: 'bg-amber-50/40 border-amber-200',
          label: 'Waspada Moderat (31 - 60)'
        };
      default:
        return {
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          strokeColor: '#059669',
          iconColor: 'text-emerald-600',
          cardBg: 'bg-emerald-50/40 border-emerald-200',
          label: 'Relatif Rendah (0 - 30)'
        };
    }
  };

  const theme = getCategoryTheme();
  const circumference = 2 * Math.PI * 48;
  const strokeDashoffset = circumference - (skor_risiko / 100) * circumference;

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-stone-600">
            Hasil Analisis Risiko Karhutla
          </span>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <Flame className={`w-5 h-5 ${theme.iconColor}`} />
            Indeks Bahaya Kebakaran 7 Hari
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {hasil.metode_komputasi === 'gemini-ai' ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              Gemini AI Evaluated
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200 px-3 py-1 rounded-full">
              Analisis Multikriteria
            </span>
          )}

          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${theme.badge}`}>
            {kategori_risiko}
          </span>
        </div>
      </div>

      {/* Main Score Display & AI Evaluation */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Gauge Center */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl bg-stone-50/70 border border-stone-200 text-center">
          <div className="relative flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke="currentColor"
                strokeWidth="10"
                className="text-stone-200"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="48"
                stroke={theme.strokeColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-stone-900">
                {skor_risiko}
              </span>
              <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                Skor 0-100
              </span>
            </div>
          </div>

          <span className="mt-2 text-xs font-bold text-stone-800">
            {theme.label}
          </span>
        </div>

        {/* AI Reasoning Text */}
        <div className="md:col-span-8 space-y-3">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span>Penjelasan Kualitatif AI:</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              {alasan_risiko}
            </p>
          </div>

          {/* Assumptions note if any */}
          {asumsi && (
            <div className="flex items-start gap-2 text-xs text-stone-700 bg-stone-50/60 p-2.5 rounded-lg border border-stone-200">
              <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-stone-700">Catatan Asumsi: </strong>
                {asumsi}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Safety Alert (Mandatory for TINGGI / SANGAT TINGGI) */}
      {peringatan_keselamatan && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-red-900 block mb-0.5">
              Instruksi Keselamatan & Protokol Siaga Darurat:
            </span>
            <p className="text-red-800 leading-relaxed">
              {peringatan_keselamatan}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
