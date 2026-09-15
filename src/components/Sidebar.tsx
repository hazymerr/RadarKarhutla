import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  MapPin, 
  Sprout, 
  Sliders, 
  Flame, 
  ShieldCheck,
  Sparkles,
  PhoneCall
} from 'lucide-react';

export type ActiveNav = 'dashboard' | 'map' | 'presets' | 'pltb' | 'params';

interface SidebarProps {
  activeNav: ActiveNav;
  onSelectNav: (nav: ActiveNav) => void;
  hasGeminiKey?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeNav, 
  onSelectNav,
  hasGeminiKey 
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveNav, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map' as ActiveNav, label: 'Peta & Heatmap', icon: Map },
    { id: 'presets' as ActiveNav, label: 'Wilayah Rawan', icon: MapPin },
    { id: 'pltb' as ActiveNav, label: 'Solusi PLTB', icon: Sprout },
    { id: 'params' as ActiveNav, label: 'Parameter AI', icon: Sliders },
  ];

  return (
    <aside className="w-full lg:w-60 bg-white border-r border-slate-100 flex flex-col justify-between p-5 shrink-0">
      <div className="space-y-6">
        {/* Brand Logo matching the reference photo */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center">
              Radar<span className="text-blue-600">Karhutla</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">
              Sistem Mitigasi Karhutla
            </p>
          </div>
        </div>

        {/* Navigation items with the active vertical indicator bar */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNav(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'text-blue-600 bg-blue-50/70'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-5 bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Info Card matching clean dashboard style */}
      <div className="space-y-3 pt-6 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 border border-blue-100/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Status</span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            {hasGeminiKey ? 'Gemini 3.8 Flash Aktif & Terhubung' : 'Analisis Multikriteria Cerdas'}
          </p>
        </div>

        <a
          href="tel:1500244"
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold border border-red-100 transition-colors"
        >
          <PhoneCall className="w-3.5 h-3.5 text-red-500" />
          <span>Posko KLHK: 1500-244</span>
        </a>
      </div>
    </aside>
  );
};
