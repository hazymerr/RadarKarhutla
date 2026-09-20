import React from 'react';
import { HasilAnalisis } from '../types.ts';
import { Flame, Sparkles, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface RiskScoreCardProps {
  hasil: HasilAnalisis;
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({ hasil }) => {
  const { skor_risiko, kategori_risiko, alasan_risiko, peringatan_keselamatan } = hasil;

  const isSevere = kategori_risiko === 'SANGAT TINGGI' || kategori_risiko === 'TINGGI';

  return (
    <div className="bg-white dark:bg-[#152238] border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 shadow-xs space-y-3 sm:space-y-4 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-orange-50 dark:bg-orange-950/40 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              Evaluasi Risiko AI
            </h3>
            <span className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">Analisis Multikriteria</span>
          </div>
        </div>

        <span className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold whitespace-nowrap shrink-0 ${
          kategori_risiko === 'SANGAT TINGGI'
            ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/50'
            : kategori_risiko === 'TINGGI'
            ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50'
            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50'
        }`}>
          {kategori_risiko} <span className="hidden sm:inline">({skor_risiko}/100)</span>
        </span>
      </div>

      {/* Concise Reason */}
      <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-[#0d1629] border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
        {alasan_risiko}
      </div>

      {/* Safety Alert */}
      {isSevere && peringatan_keselamatan && (
        <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-red-50/70 dark:bg-red-950/30 border border-red-200/80 dark:border-red-500/30 flex items-center gap-2 text-[11px] sm:text-xs text-red-800 dark:text-red-200">
          <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span className="font-semibold truncate">
            {peringatan_keselamatan.split('.')[0]}. Dilarang menyalakan api.
          </span>
        </div>
      )}
    </div>
  );
};
