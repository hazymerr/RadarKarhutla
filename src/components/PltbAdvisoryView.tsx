import React, { useState } from 'react';
import { FarmerAdvisoryCard } from './FarmerAdvisoryCard.tsx';
import { JsonOutputViewer } from './JsonOutputViewer.tsx';
import { FormInput, HasilAnalisis } from '../types.ts';
import { 
  Sprout, 
  ShieldAlert, 
  ArrowLeft, 
  Sliders, 
  Layers, 
  Check, 
  Coins, 
  Clock, 
  Code
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
  const [showJson, setShowJson] = useState<boolean>(false);

  const methodsList = [
    {
      title: 'Chopping & Mulching (Pencacahan)',
      desc: 'Cacah sisa tebasan semak menjadi mulsa penutup tanah untuk menjaga kelembapan.',
      cost: 'Rendah',
      time: '3-7 Hari',
      bestFor: 'Petani Swadaya',
    },
    {
      title: 'Ekskavator Mini & Pembalikan',
      desc: 'Alat berat mini mencabut tunggul dan meratakan lahan tanpa menimbulkan asap.',
      cost: 'Sedang',
      time: '2-4 Hari',
      bestFor: 'Lahan >2 Ha',
    },
    {
      title: 'Biodekomposer Mikroba',
      desc: 'Aplikasi cairan mikroba pengurai untuk membusukkan jerami menjadi kompos alami.',
      cost: 'Sangat Murah',
      time: '14-21 Hari',
      bestFor: 'Penyubur Tanah',
    },
    {
      title: 'Kanalisasi & Sekat Bakar',
      desc: 'Pembuatan parit pembatas 2-3 meter untuk menghalangi rambatan api dari luar.',
      cost: 'Sedang',
      time: '3-5 Hari',
      bestFor: 'Batas Lahan Gambut',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mitigasi
            </span>
          </div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            Solusi Lahan Tanpa Bakar (PLTB)
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenParams}
          title="Sesuaikan Lahan"
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Sliders className="w-3.5 h-3.5 text-slate-600" />
          <span className="hidden sm:inline">Sesuaikan Lahan</span>
        </button>
      </div>

      {/* Sleek Minimal Legal Banner */}
      <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold text-[11px] sm:text-xs">
            Zero Burning: Dilarang membakar lahan (UU No. 32/2009).
          </span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 hidden sm:inline">
          Bebas Asap
        </span>
      </div>

      {/* AI Tailored Recommendation */}
      <FarmerAdvisoryCard
        rekomendasi={hasil.rekomendasi_petani}
        kategoriRisiko={hasil.kategori_risiko}
        jenisLahan={formData.jenis_lahan}
        luasHa={formData.luas_lahan_ha}
      />

      {/* 4 Clean Practical Methods Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Metode Lapangan Teruji
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {methodsList.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  {m.title}
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {m.bestFor}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                {m.desc}
              </p>

              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 font-medium">
                  <Coins className="w-3 h-3 text-amber-500" />
                  Biaya {m.cost}
                </span>
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {m.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discreet JSON toggle */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={() => setShowJson(!showJson)}
          className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 inline-flex items-center gap-1 cursor-pointer"
        >
          <Code className="w-3 h-3" />
          <span>{showJson ? 'Tutup Data JSON' : 'Lihat Data JSON'}</span>
        </button>

        {showJson && (
          <div className="mt-3 text-left">
            <JsonOutputViewer data={hasil} />
          </div>
        )}
      </div>
    </div>
  );
};
