import React from 'react';
import { FarmerAdvisoryCard } from './FarmerAdvisoryCard.tsx';
import { FormInput, HasilAnalisis } from '../types.ts';
import { 
  ArrowLeft, 
  Sliders, 
  Leaf, 
  ShieldCheck, 
  Scissors, 
  Sprout, 
  Tractor,
  Layers,
  Coins,
  Clock,
  PhoneCall
} from 'lucide-react';

interface PltbAdvisoryViewProps {
  formData: FormInput;
  hasil: HasilAnalisis;
  onBackToDashboard: () => void;
  onOpenParams: () => void;
}

export const PltbAdvisoryView: React.FC<PltbAdvisoryViewProps> = ({
  formData,
  hasil,
  onBackToDashboard,
  onOpenParams,
}) => {
  const practicalSteps = [
    {
      step: '01',
      title: 'Penebasan & Pencacahan',
      desc: 'Tebas semak atau sisa panen, lalu cacah ranting dan dedaunan menjadi serasah halus.',
      icon: Scissors,
      tag: 'Hari 1 - 3',
    },
    {
      step: '02',
      title: 'Penguraian Alami (Kompos)',
      desc: 'Hamparkan serasah sebagai mulsa tanah atau semprotkan bio-dekomposer agar menjadi humus.',
      icon: Sprout,
      tag: 'Hari 4 - 14',
    },
    {
      step: '03',
      title: 'Proteksi Sekat Bakar',
      desc: 'Buat jalur bersih selebar 2-3 meter di tapal batas lahan untuk memblokir rambatan api luar.',
      icon: ShieldCheck,
      tag: 'Hari Terakhir',
    },
  ];

  const practicalMethods = [
    {
      title: 'Pencacahan & Mulsa (Chopping)',
      desc: 'Sisa tebasan dicacah dan dihamparkan merata untuk menjaga kelembapan tanah.',
      cost: 'Rendah',
      time: '3 - 7 Hari',
      bestFor: 'Petani Swadaya',
      icon: Scissors,
    },
    {
      title: 'Bio-Dekomposer Mikroba',
      desc: 'Aplikasi cairan mikroorganisme pengurai (seperti EM4) agar serasah cepat membusuk jadi pupuk.',
      cost: 'Sangat Hemat',
      time: '14 - 21 Hari',
      bestFor: 'Penyubur Lahan',
      icon: Sprout,
    },
    {
      title: 'Mekanis (Traktor / Mini Excavator)',
      desc: 'Alat berat mini meratakan tanah dan mencabut tunggul kayu tanpa api.',
      cost: 'Sedang',
      time: '2 - 4 Hari',
      bestFor: 'Lahan >2 Ha',
      icon: Tractor,
    },
    {
      title: 'Kanalisasi & Parit Basah',
      desc: 'Parit pembatas untuk mempertahankan tinggi muka air gambut dan menyekat api.',
      cost: 'Sedang',
      time: '3 - 5 Hari',
      bestFor: 'Lahan Gambut',
      icon: Layers,
    },
  ];

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* 1. Minimalist Top Header */}
      <div className="bg-white dark:bg-[#152238] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Panduan Mitigasi Lahan
            </span>
          </div>
          <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pembukaan Lahan Tanpa Bakar (PLTB)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Panduan praktis membuka & mengolah lahan secara aman tanpa api untuk mencegah karhutla dan kabut asap.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenParams}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-[#0d1629] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700/60 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span>Sesuaikan Data Lahan</span>
        </button>
      </div>

      {/* 2. Main Tailored Recommendation */}
      <FarmerAdvisoryCard
        rekomendasi={hasil.rekomendasi_petani}
        jenisLahan={formData.jenis_lahan}
        luasHa={formData.luas_lahan_ha}
      />

      {/* 3. Three-Step Field Flow (Simple & Visual) */}
      <div className="bg-white dark:bg-[#152238] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              3 Langkah Praktis Pembukaan Lahan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Urutan kerja yang terbukti efektif di lapangan tanpa menggunakan api.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 hidden sm:inline-block">
            Bebas Asap
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {practicalSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative p-4 rounded-xl bg-slate-50 dark:bg-[#0d1629] border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400 tracking-wider">
                      TAHAP {s.step}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                      {s.tag}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>{s.title}</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Alternative Methods (Clean Minimal Grid) */}
      <div className="bg-white dark:bg-[#152238] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Pilihan Metode Lainnya
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dapat disesuaikan dengan ketersediaan anggaran dan alat kelompok tani.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {practicalMethods.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#0d1629] hover:bg-slate-50/50 dark:hover:bg-[#131e33] transition-colors flex items-start gap-3.5"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {m.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                      {m.bestFor}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {m.desc}
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                      {m.cost}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                      {m.time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Minimalist Legal & Assistance Footer */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200">
        <div className="flex items-start sm:items-center gap-2.5">
          <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-xs leading-relaxed text-emerald-900 dark:text-emerald-300">
            <strong>Kepatuhan Regulasi (UU No. 32/2009):</strong> Penerapan PLTB melindungi kesuburan humus tanah dan terbebas dari sanksi kebakaran hutan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold">
          <PhoneCall className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Konsultasi PPL / Gapoktan Desa</span>
        </div>
      </div>
    </div>
  );
};
