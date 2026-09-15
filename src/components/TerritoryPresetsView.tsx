import React from 'react';
import { PRESET_SKENARIOS } from '../data/presets.ts';
import { FormInput } from '../types.ts';
import { 
  MapPin, 
  Flame, 
  Droplets, 
  Wind, 
  ArrowRight, 
  ArrowLeft,
  Check
} from 'lucide-react';

interface TerritoryPresetsViewProps {
  activePresetId: string;
  onSelectPreset: (data: FormInput) => void;
  onGoToDashboard: () => void;
  onGoToMap: () => void;
}

export const TerritoryPresetsView: React.FC<TerritoryPresetsViewProps> = ({
  activePresetId,
  onSelectPreset,
  onGoToDashboard,
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <button
              type="button"
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Wilayah
            </span>
          </div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            Wilayah Rawan Karhutla
          </h2>
        </div>

        <button
          type="button"
          onClick={onGoToDashboard}
          title="Ke Dashboard"
          className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <span className="hidden sm:inline">Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {PRESET_SKENARIOS.map((preset) => {
          const isSelected = activePresetId === preset.id;
          const isGambut = preset.data.jenis_lahan === 'gambut';

          return (
            <div
              key={preset.id}
              className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border transition-all flex flex-col justify-between space-y-3 sm:space-y-4 ${
                isSelected
                  ? 'bg-white border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white hover:bg-slate-50/70 border-slate-100 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                    isGambut ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {preset.wilayah.split(' (')[0]}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 capitalize truncate block">
                      Lahan {preset.data.jenis_lahan}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200 flex items-center gap-1 shrink-0">
                    <Check className="w-3 h-3" />
                    Aktif
                  </span>
                ) : (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isGambut ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {isGambut ? 'Tinggi' : 'Sedang'}
                  </span>
                )}
              </div>

              {/* 3 Micro Stats with icons */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="hidden sm:inline">Hotspot</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm">
                    {preset.data.histori_titik_panas_10km}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Wind className="w-3 h-3 text-cyan-600" />
                    <span className="hidden sm:inline">Angin</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm capitalize truncate block">
                    {preset.data.kecepatan_angin}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span className="hidden sm:inline">Hujan</span>
                  </div>
                  <span className="font-bold text-slate-800 text-xs sm:text-sm capitalize truncate block">
                    {preset.data.curah_hujan}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectPreset(preset.data);
                  onGoToDashboard();
                }}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                }`}
              >
                {isSelected ? 'Sedang Dipantau' : 'Pilih Wilayah Ini'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
