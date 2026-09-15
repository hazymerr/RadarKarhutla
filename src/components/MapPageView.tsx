import React from 'react';
import { RegionHeatmapMap } from './RegionHeatmapMap.tsx';
import { GroundingIntelligencePanel } from './GroundingIntelligencePanel.tsx';
import { FormInput, HasilAnalisis } from '../types.ts';
import { Flame, Wind, ShieldAlert, ArrowLeft, Radio, Sprout } from 'lucide-react';

interface MapPageViewProps {
  formData: FormInput;
  hasil: HasilAnalisis;
  onBackToDashboard: () => void;
  onOpenPLTB: () => void;
  onUpdateFormData?: (updated: Partial<FormInput>) => void;
}

export const MapPageView: React.FC<MapPageViewProps> = ({
  formData,
  hasil,
  onBackToDashboard,
  onOpenPLTB,
  onUpdateFormData,
}) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              Peta Satelit
            </span>
          </div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
            <span>Heatmap Sebaran</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-orange-100 text-orange-700">
              <Radio className="w-2.5 h-2.5 animate-pulse" />
              <span className="hidden sm:inline">Radar</span> Aktif
            </span>
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenPLTB}
          title="Solusi PLTB"
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Sprout className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Solusi PLTB &rarr;</span>
        </button>
      </div>

      {/* Map with GPS support */}
      <RegionHeatmapMap formData={formData} hasil={hasil} onUpdateFormData={onUpdateFormData} />

      {/* 3 Compact Metric Cards: 3-column on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Flame className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[11px] text-slate-400 font-medium block truncate">Hotspot</span>
            <span className="text-xs sm:text-base font-bold text-slate-900 block truncate">
              {formData.histori_titik_panas_10km} Titik
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:block">Radius 10 km</span>
          </div>
        </div>

        <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wind className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[11px] text-slate-400 font-medium block truncate">Angin</span>
            <span className="text-xs sm:text-base font-bold text-slate-900 capitalize block truncate">
              {formData.kecepatan_angin}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:block">Arah sebaran</span>
          </div>
        </div>

        <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[9px] sm:text-[11px] text-slate-400 font-medium block truncate">Status</span>
            <span className="text-xs sm:text-base font-bold text-red-600 block truncate">
              {hasil.kategori_risiko}
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:block">Sekat bakar 3m</span>
          </div>
        </div>
      </div>

      {/* Real-time Field Intelligence: Grounding Search & Maps */}
      <GroundingIntelligencePanel currentLocation={formData.lokasi} />
    </div>
  );
};
