import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveNav } from './components/Sidebar.tsx';
import { TopNav } from './components/TopNav.tsx';
import { HeroRiskCard } from './components/HeroRiskCard.tsx';
import { MetricCards } from './components/MetricCards.tsx';
import { RiskTrendChart } from './components/RiskTrendChart.tsx';
import { WeeklyForecastSidebar } from './components/WeeklyForecastSidebar.tsx';
import { RiskScoreCard } from './components/RiskScoreCard.tsx';
import { ParameterModal } from './components/ParameterModal.tsx';
import { MapPageView } from './components/MapPageView.tsx';
import { TerritoryPresetsView } from './components/TerritoryPresetsView.tsx';
import { PltbAdvisoryView } from './components/PltbAdvisoryView.tsx';
import { GroundingIntelligencePanel } from './components/GroundingIntelligencePanel.tsx';
import { PRESET_SKENARIOS } from './data/presets.ts';
import { FormInput, HasilAnalisis } from './types.ts';
import { hitungRisikoLokal } from './utils/karhutlaRules.ts';
import { 
  MapPin, 
  AlertCircle, 
  Sprout, 
  Flame, 
  Compass, 
  Sliders, 
  ArrowRight,
  ShieldAlert,
  Layers
} from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState<FormInput>(PRESET_SKENARIOS[0].data);
  const [activePresetId, setActivePresetId] = useState<string>(PRESET_SKENARIOS[0].id);
  const [hasilAnalisis, setHasilAnalisis] = useState<HasilAnalisis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(false);
  const [activeNav, setActiveNav] = useState<ActiveNav>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isParamModalOpen, setIsParamModalOpen] = useState<boolean>(false);

  // Check health on mount & execute initial run
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasGeminiKey) {
          setHasGeminiKey(true);
        }
      })
      .catch(() => {
        // Fallback
      });

    runAnalysis(PRESET_SKENARIOS[0].data);
  }, []);

  const handlePresetSelect = (presetData: FormInput) => {
    setFormData(presetData);
    const matched = PRESET_SKENARIOS.find((p) => p.data.lokasi === presetData.lokasi);
    setActivePresetId(matched ? matched.id : '');
    runAnalysis(presetData);
  };

  const handleFormChange = (updated: Partial<FormInput>) => {
    setFormData((prev) => ({ ...prev, ...updated }));
    setActivePresetId('');
  };

  const runAnalysis = async (dataToAnalyze: FormInput) => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToAnalyze),
      });

      if (!res.ok) {
        throw new Error(`Server status: ${res.status}`);
      }

      const data: HasilAnalisis = await res.json();
      setHasilAnalisis(data);
    } catch {
      // Clean fallback to deterministic multikriteria rule engine
      const fallbackResult = hitungRisikoLokal(dataToAnalyze);
      setHasilAnalisis(fallbackResult);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis(formData);
  };

  const handleNavSelect = (nav: ActiveNav) => {
    setActiveNav(nav);
    if (nav === 'params') {
      setIsParamModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row font-sans selection:bg-blue-200 selection:text-slate-900">
      
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={handleNavSelect}
        hasGeminiKey={hasGeminiKey}
      />

      {/* 2. Main Center Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Top Search & Action Bar */}
        <TopNav
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectPreset={(preset) => {
            handlePresetSelect(preset);
            if (activeNav !== 'dashboard' && activeNav !== 'map') {
              setActiveNav('dashboard');
            }
          }}
          onOpenParams={() => setIsParamModalOpen(true)}
          hasGeminiKey={hasGeminiKey}
        />

        {/* Scrollable Center Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          
          {/* Quick Preset Selector Chips (Icon first on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Wilayah:</span>
            </span>
            {PRESET_SKENARIOS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.data)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  {p.wilayah.split(' (')[0]}
                </button>
              );
            })}
          </div>

          {/* Error Banner if any */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {hasilAnalisis ? (
            <>
              {/* VIEW 1: DASHBOARD (Overview) */}
              {activeNav === 'dashboard' && (
                <div className="space-y-5 sm:space-y-6">
                  {/* Hero Card matching reference design */}
                  <div id="hero-section">
                    <HeroRiskCard
                      hasil={hasilAnalisis}
                      formData={formData}
                    />
                  </div>

                  {/* 4 Metric Cards (Wind, Rain, Hotspot, Peat) */}
                  <div id="metrics-section">
                    <MetricCards
                      formData={formData}
                      hasil={hasilAnalisis}
                    />
                  </div>

                  {/* Quick Shortcuts to Map and PLTB */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveNav('map')}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1 truncate">
                            <span>Peta Satelit & Earth</span>
                          </h4>
                          <p className="text-[10px] text-orange-600 font-bold sm:hidden">
                            Google Earth 3D
                          </p>
                          <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                            Google Earth 3D & Heatmap
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all hidden sm:block shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNav('pltb')}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-100 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <Sprout className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1 truncate">
                            <span>Solusi PLTB</span>
                          </h4>
                          <p className="text-[10px] text-emerald-600 font-bold sm:hidden">
                            Zero Burning
                          </p>
                          <p className="text-[11px] text-slate-400 hidden sm:block truncate">
                            Metode tanpa bakar
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all hidden sm:block shrink-0" />
                    </button>
                  </div>

                  {/* 7-Day Risk Trend Chart using Recharts */}
                  {hasilAnalisis.proyeksi_7_hari && (
                    <div id="chart-section">
                      <RiskTrendChart
                        proyeksi={hasilAnalisis.proyeksi_7_hari}
                        skorSaatIni={hasilAnalisis.skor_risiko}
                        kategoriSaatIni={hasilAnalisis.kategori_risiko}
                      />
                    </div>
                  )}

                  {/* AI Reasoning & Detailed Risk Evaluation Card */}
                  <div id="reasoning-section">
                    <RiskScoreCard hasil={hasilAnalisis} />
                  </div>

                  {/* Real-time Field Intelligence with Google Search & Maps Grounding */}
                  <div id="grounding-section">
                    <GroundingIntelligencePanel currentLocation={formData.lokasi} />
                  </div>
                </div>
              )}

              {/* VIEW 2: PETA & HEATMAP */}
              {activeNav === 'map' && (
                <MapPageView
                  formData={formData}
                  hasil={hasilAnalisis}
                  onBackToDashboard={() => setActiveNav('dashboard')}
                  onOpenPLTB={() => setActiveNav('pltb')}
                  onUpdateFormData={handleFormChange}
                />
              )}

              {/* VIEW 3: WILAYAH RAWAN (Presets Catalogue) */}
              {activeNav === 'presets' && (
                <TerritoryPresetsView
                  activePresetId={activePresetId}
                  onSelectPreset={(pData) => {
                    handlePresetSelect(pData);
                  }}
                  onGoToDashboard={() => setActiveNav('dashboard')}
                  onGoToMap={() => setActiveNav('map')}
                  currentResult={hasilAnalisis}
                />
              )}

              {/* VIEW 4: SOLUSI PLTB */}
              {activeNav === 'pltb' && (
                <PltbAdvisoryView
                  formData={formData}
                  hasil={hasilAnalisis}
                  onBackToDashboard={() => setActiveNav('dashboard')}
                  onOpenParams={() => setIsParamModalOpen(true)}
                />
              )}

              {/* VIEW 5: PARAMETER AI (Shown as view or modal) */}
              {activeNav === 'params' && (
                <div className="p-8 rounded-3xl bg-white border border-slate-100 shadow-xs text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Pengaturan Parameter Lapangan & Cuaca
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                      Sesuaikan cuaca mikro, jenis lahan gambut/mineral, kecepatan angin, dan data petani untuk analisis kustom.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsParamModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition-colors cursor-pointer inline-flex items-center gap-2"
                  >
                    <Sliders className="w-4 h-4" />
                    <span>Buka Form Parameter</span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
              <Flame className="w-10 h-10 text-orange-400 mb-3 animate-pulse" />
              <p className="text-base font-semibold text-slate-700">
                Memuat Analisis Risiko Karhutla & Peta Satelit...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Harap tunggu sejenak sementara data cuaca dan gambut diproses.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* 3. Right Sidebar: Weekly Forecast */}
      {hasilAnalisis && hasilAnalisis.proyeksi_7_hari && (
        <WeeklyForecastSidebar
          proyeksi={hasilAnalisis.proyeksi_7_hari}
          skorSaatIni={hasilAnalisis.skor_risiko}
          kategoriSaatIni={hasilAnalisis.kategori_risiko}
          onOpenPLTB={() => setActiveNav('pltb')}
        />
      )}

      {/* Modal for parameter tuning */}
      <ParameterModal
        isOpen={isParamModalOpen}
        onClose={() => {
          setIsParamModalOpen(false);
          if (activeNav === 'params') {
            setActiveNav('dashboard');
          }
        }}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
