import React from 'react';
import { RekomendasiPetani, KategoriRisiko } from '../types.ts';
import { Sprout, Clock, Coins, Sparkles, CheckCircle2 } from 'lucide-react';

interface FarmerAdvisoryCardProps {
  rekomendasi: RekomendasiPetani;
  kategoriRisiko?: KategoriRisiko;
  jenisLahan: string;
  luasHa: number;
}

export const FarmerAdvisoryCard: React.FC<FarmerAdvisoryCardProps> = ({
  rekomendasi,
  jenisLahan,
  luasHa,
}) => {
  return (
    <div className="bg-white dark:bg-[#152238] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-7 shadow-xs transition-colors">
      {/* Header with clear category and stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Metode Utama yang Direkomendasikan</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              Lahan {jenisLahan} &bull; Luas {luasHa} Ha &bull; Zero Burning
            </p>
          </div>
        </div>

        {/* Cost & Time Pills */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40">
            <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Biaya: {rekomendasi.estimasi_biaya_relatif}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/40">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            {rekomendasi.estimasi_waktu}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-5 space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
          {rekomendasi.metode_utama}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {rekomendasi.penjelasan}
        </p>

        {/* Alternative options if available */}
        {rekomendasi.alternatif_lain && rekomendasi.alternatif_lain.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
              Alternatif Solusi Tambahan:
            </span>
            <div className="flex flex-wrap gap-2">
              {rekomendasi.alternatif_lain.map((alt, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#0d1629] text-slate-700 dark:text-slate-300 text-xs border border-slate-200/60 dark:border-slate-700/60"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{alt}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
