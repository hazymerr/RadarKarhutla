import React from 'react';
import { Search, Bell, Sparkles, SlidersHorizontal, MapPin } from 'lucide-react';
import { PRESET_SKENARIOS } from '../data/presets.ts';
import { FormInput } from '../types.ts';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPreset: (preset: FormInput) => void;
  onOpenParams: () => void;
  hasGeminiKey?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  onSearchChange,
  onSelectPreset,
  onOpenParams,
  hasGeminiKey
}) => {
  const filteredPresets = searchQuery.trim()
    ? PRESET_SKENARIOS.filter(p => 
        p.wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.data.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-16 px-6 sm:px-8 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Search Input matching reference image */}
      <div className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari lokasi pantauan (contoh: Bengkalis, Kotim)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200/80 rounded-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Live Search Dropdown */}
        {filteredPresets.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-lg p-2 z-30 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 px-3 py-1 block">
              Wilayah Terdaftar
            </span>
            {filteredPresets.map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onSelectPreset(preset.data);
                  onSearchChange('');
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs hover:bg-blue-50 flex items-center justify-between text-slate-700 transition-colors"
              >
                <span className="font-semibold">{preset.wilayah}</span>
                <span className="text-[11px] text-slate-400">{preset.data.jenis_lahan}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side controls: Parameter button, AI Badge, Notifications, Avatar */}
      <div className="flex items-center gap-3">
        {/* Quick Parameter Tuner Trigger */}
        <button
          type="button"
          onClick={onOpenParams}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Ubah Parameter</span>
        </button>

        {/* AI Engine Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-xs font-semibold text-blue-700">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>{hasGeminiKey ? 'Gemini 3.8 Flash' : 'Analisis AI'}</span>
        </div>

        {/* Bell Icon matching photo */}
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200/70 flex items-center justify-center text-slate-600 transition-colors relative cursor-pointer"
          title="Notifikasi Siaga Karhutla"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 border border-white" />
        </button>

        {/* User / Agent Avatar matching photo */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          RK
        </div>
      </div>
    </header>
  );
};
