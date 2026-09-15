import React from 'react';
import { RekomendasiPetani, KategoriRisiko } from '../types.ts';
import { 
  Sprout, 
  Clock, 
  Coins, 
  Layers, 
  ShieldCheck, 
  AlertOctagon, 
  Check, 
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface FarmerAdvisoryCardProps {
  rekomendasi: RekomendasiPetani;
  kategoriRisiko: KategoriRisiko;
  jenisLahan: string;
  luasHa: number;
}

export const FarmerAdvisoryCard: React.FC<FarmerAdvisoryCardProps> = ({
  rekomendasi,
  kategoriRisiko,
  jenisLahan,
  luasHa,
}) => {
  const getCostBadge = (biaya: string) => {
    switch (biaya) {
      case 'Tinggi':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Sedang':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
            Hasil Penasihat Pertanian
          </span>
          <h2 className="text-base sm:text-lg font-bold text-stone-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            Rekomendasi Pembukaan Lahan Tanpa Bakar (PLTB)
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1 rounded-full border border-emerald-200">
            {luasHa} Ha &bull; {jenisLahan.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Strict Anti-Burn Mandate Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
        <AlertOctagon className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-amber-900 block mb-0.5">
            Prinsip Mutlak Bebas Api (Zero Burning Policy)
          </span>
          <p className="text-stone-600 leading-relaxed">
            Pembakaran lahan dilarang oleh UU No. 32 Tahun 2009. Selain risiko pidana berat, pembakaran mematikan mikroba tanah subur dan memicu kebakaran bawah permukaan gambut yang sulit dipadamkan.
          </p>
        </div>
      </div>

      {/* Primary Recommended Method Box */}
      <div className="p-4 sm:p-5 rounded-xl bg-emerald-50/40 border border-emerald-200 relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
            Solusi Utama Terbaik
          </span>
        </div>

        <h3 className="text-base font-bold text-stone-900 mb-2">
          {rekomendasi.metode_utama}
        </h3>

        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed mb-4 bg-white/80 p-3 rounded-lg border border-emerald-100">
          {rekomendasi.penjelasan}
        </p>

        {/* Estimation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white border border-stone-200 flex items-center gap-3 shadow-2xs">
            <div className="p-2 rounded-md bg-amber-50 text-amber-600">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block">
                Estimasi Biaya Relatif
              </span>
              <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded border mt-0.5 ${getCostBadge(rekomendasi.estimasi_biaya_relatif)}`}>
                {rekomendasi.estimasi_biaya_relatif}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-white border border-stone-200 flex items-center gap-3 shadow-2xs">
            <div className="p-2 rounded-md bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] text-stone-500 block">
                Perkiraan Durasi Pengerjaan
              </span>
              <span className="text-xs font-bold text-stone-800">
                {rekomendasi.estimasi_waktu}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Options */}
      {rekomendasi.alternatif_lain && rekomendasi.alternatif_lain.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            Opsi Alternatif & Langkah Tambahan:
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {rekomendasi.alternatif_lain.map((alt, index) => (
              <div
                key={index}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span className="leading-relaxed">{alt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fire Break & Gov Scheme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-stone-100">
        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
            Sekat Bakar (Fire Break)
          </h4>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Buat sekat keliling selebar 3–5 meter di batas kebun. Bersihkan serasah kering hingga tanah terbuka/lembab untuk menyetop laju rambatan api liar dari luar kebun.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            Bantuan Alat Pemerintah / BRGM
          </h4>
          <p className="text-[11px] text-stone-600 leading-relaxed">
            Petani di Kesatuan Hidrologis Gambut dapat meminjam mesin pencacah rumput (*chopper*) dan bibit ramah gambut melalui Gapoktan atau Kantor Desa / BRGM setempat.
          </p>
        </div>
      </div>
    </div>
  );
};
