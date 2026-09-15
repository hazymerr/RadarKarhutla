import React from 'react';
import { Flame, Sparkles, PhoneCall, MapPin, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  hasGeminiKey?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ hasGeminiKey }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200 text-stone-900 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Brand & Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-stone-900 flex items-center">
                  Radar<span className="text-orange-600">Karhutla</span>
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                  Siaga 7 Hari
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Mitigasi Risiko Karhutla & Rekomendasi Pembukaan Lahan Tanpa Bakar (PLTB)
              </p>
            </div>
          </div>

          {/* Highlights & Hotline */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* AI Highlight Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs font-semibold text-amber-900 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>AI Engine:</span>
              <span className="font-bold text-orange-700">
                {hasGeminiKey ? 'Gemini AI Aktif' : 'Analisis Multikriteria'}
              </span>
            </div>

            {/* Emergency Hotline */}
            <a
              href="tel:1500244"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 transition-colors shadow-xs"
              title="Posko Siaga Karhutla KLHK / Manggala Agni"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-600" />
              <span className="hidden md:inline">Hotline Manggala Agni:</span>
              <span className="font-bold">1500-244</span>
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
