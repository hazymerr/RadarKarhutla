import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  MapPin, 
  Sprout, 
  Sliders, 
  Flame, 
  Sparkles,
  PhoneCall,
  ShieldAlert,
  CloudFog
} from 'lucide-react';

export type ActiveNav = 'dashboard' | 'map' | 'presets' | 'smoke_forecast' | 'params';

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
    { id: 'dashboard' as ActiveNav, label: 'Dasbor', icon: LayoutDashboard },
    { id: 'map' as ActiveNav, label: 'Peta Api', icon: Map },
    { id: 'presets' as ActiveNav, label: 'Wilayah', icon: MapPin },
    { id: 'smoke_forecast' as ActiveNav, label: 'Prediksi Asap', icon: CloudFog },
    { id: 'params' as ActiveNav, label: 'Param', icon: Sliders },
  ];

  return (
    <>
      {/* 1. Desktop Left Sidebar (hidden on mobile, visible lg+) */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-[#0e172e] border-r border-slate-100 dark:border-slate-800 flex-col justify-between p-5 shrink-0 min-h-screen sticky top-0 h-screen transition-colors">
        <div className="space-y-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Flame className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center">
                Radar<span className="text-blue-600 dark:text-blue-400">Karhutla</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">
                Sistem Pantau & Siaga Bencana
              </p>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              const desktopLabel = item.id === 'dashboard' ? 'Dasbor Siaga'
                : item.id === 'map' ? 'Peta Satelit & Api'
                : item.id === 'presets' ? 'Wilayah Rawan'
                : item.id === 'smoke_forecast' ? 'Prediksi Kabut Asap'
                : 'Parameter AI';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectNav(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50/70 dark:bg-blue-950/40 font-bold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>{desktopLabel}</span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Info Card */}
        <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-[#152238] dark:to-[#152238] border border-blue-100/60 dark:border-slate-750 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Analisis Risiko AI</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              {hasGeminiKey ? 'Gemini 3.8 Flash Aktif' : 'Multikriteria Karhutla BMKG/KLHK'}
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
              Kontak Darurat Bencana:
            </div>
            <a
              href="tel:1500244"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 text-xs font-semibold border border-red-100 dark:border-red-800/50 transition-colors"
              title="Pos Komando Brigade Manggala Agni KLHK"
            >
              <PhoneCall className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span className="truncate">Posko KLHK: 1500-244</span>
            </a>
            <a
              href="tel:117"
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/40 dark:hover:bg-orange-900/40 text-orange-800 dark:text-orange-300 text-xs font-semibold border border-orange-200 dark:border-orange-800/50 transition-colors"
              title="Pusat Pengendalian Operasi BPBD / BNPB"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span className="truncate">Pusdalops BNPB: 117</span>
            </a>
          </div>
        </div>
      </aside>

      {/* 2. Mobile Bottom Navigation Bar */}
      <nav 
        id="mobile-bottom-nav"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0e172e]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-[0_-2px_10px_rgba(0,0,0,0.04)] pb-[calc(env(safe-area-inset-bottom)+6px)] transition-colors"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-btn-${item.id}`}
              type="button"
              onClick={() => onSelectNav(item.id)}
              className={`flex flex-col items-center justify-center min-w-[54px] min-h-[44px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-blue-600'
                  : 'text-slate-400 hover:text-slate-600 active:scale-95'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-400'
              }`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-[9px] leading-none mt-1 transition-all ${
                isActive ? 'font-bold text-blue-600' : 'font-medium text-slate-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
