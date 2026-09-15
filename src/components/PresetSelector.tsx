import React from 'react';
import { PRESET_SKENARIOS } from '../data/presets.ts';
import { FormInput } from '../types.ts';
import { MapPin, Sparkles, Compass } from 'lucide-react';

interface PresetSelectorProps {
  onSelectPreset: (data: FormInput) => void;
  activeId?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({ onSelectPreset, activeId }) => {
  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-orange-600" />
          <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Simulasi Kasus Cepat (Preset Wilayah Rawan)
          </h3>
        </div>
        <span className="text-[11px] text-stone-500">
          Klik untuk memuat parameter lapangan riil di Indonesia
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {PRESET_SKENARIOS.map((preset) => {
          const isSelected = activeId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset.data)}
              className={`text-left p-3 rounded-xl border text-xs transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-orange-50/90 border-orange-500 ring-1 ring-orange-500/50 shadow-xs'
                  : 'bg-stone-50/70 hover:bg-stone-100/90 border-stone-200 text-stone-700 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold text-stone-900 mb-1">
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-orange-600' : 'text-stone-500'}`} />
                <span className="truncate">{preset.wilayah}</span>
              </div>
              <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                {preset.deskripsi}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
