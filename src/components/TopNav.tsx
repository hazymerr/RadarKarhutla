import React from 'react';
import { Search, Bell, Sparkles, SlidersHorizontal, Flame, Sun, Moon } from 'lucide-react';
import { PRESET_SKENARIOS } from '../data/presets.ts';
import { FormInput } from '../types.ts';

interface TopNavProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectPreset: (preset: FormInput) => void;
  onOpenParams: () => void;
  onOpenAlerts?: () => void;
  onOpenAiAssistant?: () => void;
  hasGeminiKey?: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  searchQuery,
  onSearchChange,
  onSelectPreset,
  onOpenParams,
  onOpenAlerts,
  onOpenAiAssistant,
  hasGeminiKey,
  isDarkMode,
  onToggleDarkMode
}) => {
  const filteredPresets = searchQuery.trim()
    ? PRESET_SKENARIOS.filter(p => 
        p.wilayah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.data.lokasi.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-8 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-[#0e172e]/90 backdrop-blur-md flex items-center justify-between gap-2.5 sm:gap-4 sticky top-0 z-30 transition-colors">
      
      {/* Mobile-only brand icon */}
      <div className="flex lg:hidden items-center gap-1.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-xs">
          <Flame className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <div className="relative">
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari lokasi..."
            className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-slate-50 dark:bg-[#152238] hover:bg-slate-100/70 dark:hover:bg-[#1a2b47] focus:bg-white dark:focus:bg-[#152238] border border-slate-200/80 dark:border-slate-700/60 rounded-full text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
          />
        </div>

        {/* Live Search Dropdown */}
        {filteredPresets.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#152238] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-2 z-40 space-y-1">
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
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{preset.wilayah}</span>
                </div>
                <span className="text-[11px] text-slate-400">{preset.data.jenis_lahan}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Quick Parameter Tuner Trigger: Icon-only on mobile */}
        <button
          type="button"
          onClick={onOpenParams}
          title="Ubah Parameter"
          className="flex items-center gap-1.5 p-2 sm:px-3.5 sm:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200/70 dark:bg-[#152238] dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer border border-transparent dark:border-slate-700/50"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span className="hidden sm:inline">Parameter</span>
        </button>

        {/* Interactive AI Assistant Feature Button */}
        <button
          type="button"
          onClick={onOpenAiAssistant}
          title="Tanya Asisten AI Gemini Karhutla"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 dark:from-blue-950/40 dark:to-indigo-950/40 dark:hover:from-blue-900/50 dark:hover:to-indigo-900/50 border border-blue-200 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300 transition-all cursor-pointer shadow-2xs group"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
          </span>
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">Asisten AI</span>
          <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">Gemini</span>
        </button>

        {/* Bell Icon for Early Warning Notifications */}
        <button
          type="button"
          onClick={onOpenAlerts}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200/70 dark:bg-[#152238] dark:hover:bg-slate-700/60 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors relative cursor-pointer border border-transparent dark:border-slate-700/50"
          title="Pusat Notifikasi & Peringatan Dini Karhutla"
        >
          <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 dark:text-red-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-slate-900 animate-ping" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-slate-900" />
        </button>

        {/* Theme Toggle (Light / Soft Dark Mode) */}
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 hover:bg-slate-200/70 dark:bg-[#152238] dark:hover:bg-slate-700/60 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer border border-transparent dark:border-slate-700/50"
          title={isDarkMode ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] sm:text-xs font-bold shadow-xs">
          RK
        </div>
      </div>
    </header>
  );
};
