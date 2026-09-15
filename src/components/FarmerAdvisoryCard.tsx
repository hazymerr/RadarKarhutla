import React from 'react';
import { RekomendasiPetani, KategoriRisiko } from '../types.ts';
import { 
  Sprout, 
  Clock, 
  Coins, 
  ShieldCheck, 
  AlertOctagon, 
  Check 
} from 'lucide-react';

interface FarmerAdvisoryCardProps {
  rekomendasi: RekomendasiPetani;
  kategoriRisiko: KategoriRisiko;
  jenisLahan: string;
  luasHa: number;
}

export const FarmerAdvisoryCard: React.FC<FarmerAdvisoryCardProps> = ({
  rekomendasi,
  jenisLahan,
  luasHa,
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sprout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Rekomendasi Metode PLTB
            </h3>
            <span className="text-[11px] text-slate-400 capitalize">
              {luasHa} Ha &bull; Lahan {jenisLahan}
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Zero Burning
        </span>
      </div>

      {/* Main Solution Box */}
      <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900">
            {rekomendasi.metode_utama}
          </h4>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-emerald-200 flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-500" />
              Biaya {rekomendasi.estimasi_biaya_relatif}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white text-slate-700 border border-emerald-200 flex items-center gap-1">
              <Clock className="w-3 h-3 text-blue-500" />
              {rekomendasi.estimasi_waktu}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {rekomendasi.penjelasan}
        </p>
      </div>

      {/* Step Checklist (Crisp chips) */}
      {rekomendasi.langkah_langkah && rekomendasi.langkah_langkah.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tahapan Operasional:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {rekomendasi.langkah_langkah.map((langkah, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-xs text-slate-700"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  {idx + 1}
                </div>
                <span>{langkah}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives list as compact chips */}
      {rekomendasi.alternatif_lain && rekomendasi.alternatif_lain.length > 0 && (
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Alternatif:</span>
          <div className="flex flex-wrap gap-1.5">
            {rekomendasi.alternatif_lain.map((alt, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
              >
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
