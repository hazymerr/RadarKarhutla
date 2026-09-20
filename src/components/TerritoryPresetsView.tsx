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
  Check, 
  Navigation, 
  Crosshair, 
  Loader2 
} from 'lucide-react';

interface TerritoryPresetsViewProps {
  activePresetId: string;
  onSelectPreset: (data: FormInput) => void;
  onGoToDashboard: () => void;
  onGoToMap: () => void;
  userLocation?: {
    latitude: number;
    longitude: number;
    displayName: string;
  } | null;
  onSelectUserLocation?: () => void;
  onRequestGps?: () => void;
  isDetectingGps?: boolean;
}

export const TerritoryPresetsView: React.FC<TerritoryPresetsViewProps> = ({
  activePresetId,
  onSelectPreset,
  onGoToDashboard,
  userLocation,
  onSelectUserLocation,
  onRequestGps,
  isDetectingGps
}) => {
  const isUserLocationActive = activePresetId === 'user_gps';

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#152238] p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800 shadow-xs transition-colors">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <button
              type="button"
              onClick={onGoToDashboard}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-lg cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Wilayah
            </span>
          </div>
          <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight truncate">
            Wilayah Rawan Karhutla
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Daftar wilayah rawan kebakaran hutan, dengan prioritas utama pada lokasi Anda saat ini.
          </p>
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

      {/* TOP PRIORITY: USER'S OWN LOCATION CARD (Seamless in Dark & Light Mode) */}
      <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
        isUserLocationActive
          ? 'bg-gradient-to-r from-blue-50 via-sky-50 to-white dark:from-[#152238] dark:via-[#152238] dark:to-blue-950/40 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
          : 'bg-white dark:bg-[#152238] border-blue-200/90 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-500/60 shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Crosshair className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-600 text-white shadow-2xs">
                  ⭐ Prioritas Lokasi Anda
                </span>
                {userLocation && (
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    GPS Terkunci
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {userLocation ? userLocation.displayName : 'Lokasi Perangkat Anda'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {userLocation 
                  ? `Koordinat: ${userLocation.latitude.toFixed(4)}°, ${userLocation.longitude.toFixed(4)}°`
                  : 'Aktifkan GPS agar sistem memprioritaskan pemantauan langsung di tempat Anda berada.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {userLocation ? (
              <button
                type="button"
                onClick={onSelectUserLocation}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isUserLocationActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                }`}
              >
                {isUserLocationActive ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Sedang Dipantau</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Pilih Lokasi Saya</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequestGps}
                disabled={isDetectingGps}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mendeteksi GPS...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Deteksi Lokasi Saya Sekarang</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
          Wilayah Rawan Lainnya di Indonesia
        </span>
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
                  ? 'bg-white dark:bg-[#152238] border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white dark:bg-[#152238] hover:bg-slate-50/70 dark:hover:bg-[#1a2942] border-slate-100 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${
                    isGambut 
                      ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400' 
                      : 'bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  }`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {preset.wilayah.split(' (')[0]}
                    </h3>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 capitalize truncate block">
                      Lahan {preset.data.jenis_lahan}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1 shrink-0">
                    <Check className="w-3 h-3" />
                    Aktif
                  </span>
                ) : (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                    isGambut 
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-transparent dark:border-red-800/40' 
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 border border-transparent dark:border-emerald-800/40'
                  }`}>
                    {isGambut ? 'Tinggi' : 'Sedang'}
                  </span>
                )}
              </div>

              {/* 3 Micro Stats with icons */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-xs">
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-[#0d1629] text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="hidden sm:inline">Hotspot</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                    {preset.data.histori_titik_panas_10km}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-[#0d1629] text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Wind className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    <span className="hidden sm:inline">Angin</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm capitalize truncate block">
                    {preset.data.kecepatan_angin}
                  </span>
                </div>
                <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-[#0d1629] text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <span className="hidden sm:inline">Hujan</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-xs sm:text-sm capitalize truncate block">
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
                    : 'bg-slate-100 dark:bg-[#0d1629] hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white text-slate-700 dark:text-slate-300'
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
