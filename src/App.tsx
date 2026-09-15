import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveNav } from './components/Sidebar.tsx';
import { TopNav } from './components/TopNav.tsx';
import { HeroRiskCard } from './components/HeroRiskCard.tsx';
import { MetricCards } from './components/MetricCards.tsx';
import { RegionHeatmapMap } from './components/RegionHeatmapMap.tsx';
import { RiskTrendChart } from './components/RiskTrendChart.tsx';
import { WeeklyForecastSidebar } from './components/WeeklyForecastSidebar.tsx';
import { FarmerAdvisoryCard } from './components/FarmerAdvisoryCard.tsx';
import { RiskScoreCard } from './components/RiskScoreCard.tsx';
import { JsonOutputViewer } from './components/JsonOutputViewer.tsx';
import { ParameterModal } from './components/ParameterModal.tsx';
import { PRESET_SKENARIOS } from './data/presets.ts';
import { FormInput, HasilAnalisis } from './types.ts';
import { hitungRisikoLokal } from './utils/karhutlaRules.ts';
import { Sparkles, MapPin, CheckCircle, AlertCircle, Sprout, Flame } from 'lucide-react';

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
    } catch (err) {
      console.warn('Menggunakan perhitungan aturan multikriteria lokal:', err);
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
      
      {/* 1. Left Sidebar Navigation matching reference image */}
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
          onSelectPreset={handlePresetSelect}
          onOpenParams={() => setIsParamModalOpen(true)}
          hasGeminiKey={hasGeminiKey}
        />

        {/* Scrollable Center Body */}
        <main className="flex-1 p-5 sm:p-7 space-y-6 max-w-6xl w-full mx-auto">
          
          {/* Quick Preset Selector Chips matching clean aesthetic */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              Wilayah:
            </span>
            {PRESET_SKENARIOS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handlePresetSelect(p.data)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
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
              {/* Hero Card matching the reference image's Gotham 14° card */}
              <div id="hero-section">
                <HeroRiskCard
                  hasil={hasilAnalisis}
                  formData={formData}
                />
              </div>

              {/* 4 Metric Cards matching the reference image (Wind, Rain, Hotspot, Peat) */}
              <div id="metrics-section">
                <MetricCards
                  formData={formData}
                  hasil={hasilAnalisis}
                />
              </div>

              {/* Static Map with Heatmap Overlay requested by the user */}
              <div id="map-section">
                <RegionHeatmapMap
                  formData={formData}
                  hasil={hasilAnalisis}
                />
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

              {/* PLTB Advisory for Farmers */}
              <div id="pltb-section">
                <FarmerAdvisoryCard
                  rekomendasi={hasilAnalisis.rekomendasi_petani}
                  kategoriRisiko={hasilAnalisis.kategori_risiko}
                  jenisLahan={formData.jenis_lahan}
                  luasHa={formData.luas_lahan_ha}
                />
              </div>

              {/* Raw JSON Schema Output Inspector */}
              <div id="json-section">
                <JsonOutputViewer hasil={hasilAnalisis} />
              </div>
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

      {/* 3. Right Sidebar: Weekly Forecast matching the reference photo */}
      {hasilAnalisis && hasilAnalisis.proyeksi_7_hari && (
        <WeeklyForecastSidebar
          proyeksi={hasilAnalisis.proyeksi_7_hari}
          skorSaatIni={hasilAnalisis.skor_risiko}
          kategoriSaatIni={hasilAnalisis.kategori_risiko}
          onOpenPLTB={() => {
            const el = document.getElementById('pltb-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />
      )}

      {/* Modal for parameter tuning */}
      <ParameterModal
        isOpen={isParamModalOpen}
        onClose={() => setIsParamModalOpen(false)}
        formData={formData}
        onChange={handleFormChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
