import React, { useState, useEffect } from 'react';
import { Sidebar, ActiveNav } from './components/Sidebar.tsx';
import { TopNav } from './components/TopNav.tsx';
import { HeroRiskCard } from './components/HeroRiskCard.tsx';
import { MetricCards } from './components/MetricCards.tsx';
import { RiskTrendChart } from './components/RiskTrendChart.tsx';
import { WeeklyForecastSidebar } from './components/WeeklyForecastSidebar.tsx';
import { RiskScoreCard } from './components/RiskScoreCard.tsx';
import { ParameterModal } from './components/ParameterModal.tsx';
import { RiskAnalysisForm } from './components/RiskAnalysisForm.tsx';
import { MapPageView } from './components/MapPageView.tsx';
import { TerritoryPresetsView } from './components/TerritoryPresetsView.tsx';
import { PltbAdvisoryView } from './components/PltbAdvisoryView.tsx';
import { SmokeForecastView } from './components/SmokeForecastView.tsx';
import { GroundingIntelligencePanel } from './components/GroundingIntelligencePanel.tsx';
import { PRESET_SKENARIOS } from './data/presets.ts';
import { FormInput, HasilAnalisis } from './types.ts';
import { hitungRisikoLokal } from './utils/karhutlaRules.ts';
import { DisasterAlertModal } from './components/DisasterAlertModal.tsx';
import { AiAssistantModal } from './components/AiAssistantModal.tsx';
import { 
  MapPin, 
  AlertCircle, 
  Sprout, 
  Flame, 
  Compass, 
  Sliders, 
  ArrowRight, 
  ShieldAlert, 
  Layers, 
  Bell, 
  PhoneCall,
  CloudFog,
  Navigation,
  Crosshair
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
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('radarkarhutla_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('radarkarhutla_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('radarkarhutla_theme', 'light');
    }
  }, [isDarkMode]);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    displayName: string;
  } | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  // Auto-detect user GPS location to prioritize user's region
  const detectUserLocation = () => {
    if (!navigator.geolocation) return;
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        let name = `Lokasi Anda (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`, {
            headers: { 'User-Agent': 'RadarKarhutla/2.0' }
          });
          const data = await res.json();
          const addr = data.address;
          const cityOrRegency = addr?.city || addr?.town || addr?.county || addr?.state_district;
          const prov = addr?.state;
          if (cityOrRegency && prov) {
            name = `${cityOrRegency}, ${prov}`;
          } else if (data.display_name) {
            name = data.display_name.split(',').slice(0, 2).join(',').trim();
          }
        } catch {
          // Fallback to coordinate name
        }

        const locInfo = { latitude: lat, longitude: lng, displayName: name };
        setUserLocation(locInfo);
        setIsDetectingGps(false);

        // Prioritize user's own location in form data & risk analysis
        const userPreset: FormInput = {
          lokasi: name,
          musim: 'kemarau',
          jenis_lahan: 'gambut',
          curah_hujan: 'rendah',
          kelembapan_udara: 55,
          kelembapan_tanah: 'kering_sedang',
          kecepatan_angin: 'sedang',
          histori_titik_panas_10km: 2,
          jarak_sumber_api_km: 3.5,
          luas_lahan_ha: 2,
          is_petani: true
        };
        setFormData(userPreset);
        setActivePresetId('user_gps');
        runAnalysis(userPreset);
      },
      () => {
        setIsDetectingGps(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const handleSelectUserLocation = () => {
    if (!userLocation) {
      detectUserLocation();
      return;
    }
    const userPreset: FormInput = {
      lokasi: userLocation.displayName,
      musim: 'kemarau',
      jenis_lahan: 'gambut',
      curah_hujan: 'rendah',
      kelembapan_udara: 55,
      kelembapan_tanah: 'kering_sedang',
      kecepatan_angin: 'sedang',
      histori_titik_panas_10km: 2,
      jarak_sumber_api_km: 3.5,
      luas_lahan_ha: 2,
      is_petani: true
    };
    setFormData(userPreset);
    setActivePresetId('user_gps');
    runAnalysis(userPreset);
  };

  // Check health on mount & auto-detect location
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
    detectUserLocation();
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
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden h-screen">
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
          onOpenAlerts={() => setIsAlertModalOpen(true)}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          hasGeminiKey={hasGeminiKey}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        />

        {activeNav === 'map' && hasilAnalisis ? (
          /* FULL GOOGLE MAPS SATELLITE VIEW (Edge-to-edge, fills remaining screen, no scrollbar) */
          <div className="flex-1 relative w-full h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden">
            <MapPageView
              formData={formData}
              hasil={hasilAnalisis}
              onBackToDashboard={() => setActiveNav('dashboard')}
              onOpenPLTB={() => setActiveNav('smoke_forecast')}
              onOpenAlerts={() => setIsAlertModalOpen(true)}
              onUpdateFormData={handleFormChange}
              onSelectPreset={(pData) => handlePresetSelect(pData)}
              activePresetId={activePresetId}
            />
          </div>
        ) : (
          /* Scrollable Center Body for other views */
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto pb-24 lg:pb-8">
          
          {/* Quick Preset Selector Chips (Icon first on mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Wilayah:</span>
            </span>

            {/* PRIORITIZED USER LOCATION CHIP */}
            {userLocation ? (
              <button
                type="button"
                onClick={handleSelectUserLocation}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  activePresetId === 'user_gps'
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/60'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-500" />
                <span>📍 Lokasi Saya</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={detectUserLocation}
                disabled={isDetectingGps}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-[#152238] dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700/60 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-500" />
                <span>{isDetectingGps ? 'Mencari GPS...' : '📍 GPS Saya'}</span>
              </button>
            )}

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
                      : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-[#152238] dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700/60'
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

                  {/* Live Karhutla Early Warning Alert Banner */}
                  <div className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs transition-all ${
                    hasilAnalisis.kategori_risiko === 'SANGAT TINGGI'
                      ? 'bg-red-50/90 border-red-200 text-red-950 dark:bg-red-950/30 dark:border-red-500/40 dark:text-red-200'
                      : hasilAnalisis.kategori_risiko === 'TINGGI'
                      ? 'bg-amber-50/90 border-amber-200 text-amber-950 dark:bg-amber-950/30 dark:border-amber-500/40 dark:text-amber-200'
                      : 'bg-blue-50/90 border-blue-200 text-blue-950 dark:bg-blue-950/30 dark:border-blue-500/40 dark:text-blue-200'
                  }`}>
                    <div className="flex items-start sm:items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                        hasilAnalisis.kategori_risiko === 'SANGAT TINGGI'
                          ? 'bg-red-600 text-white'
                          : hasilAnalisis.kategori_risiko === 'TINGGI'
                          ? 'bg-amber-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}>
                        <Flame className="w-5 h-5 animate-pulse" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold truncate">
                            Peringatan Dini Karhutla & Asap: {formData.lokasi}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            hasilAnalisis.kategori_risiko === 'SANGAT TINGGI'
                              ? 'bg-red-100 text-red-800 border border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700/50'
                              : hasilAnalisis.kategori_risiko === 'TINGGI'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700/50'
                              : 'bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700/50'
                          }`}>
                            Status {hasilAnalisis.kategori_risiko}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs opacity-85 leading-relaxed">
                          {hasilAnalisis.kategori_risiko === 'SANGAT TINGGI' || hasilAnalisis.kategori_risiko === 'TINGGI'
                            ? `Terpantau ${formData.histori_titik_panas_10km} hotspot aktif. Potensi kabut asap tebal. Siapkan sekat bakar, kenakan masker jika asap tercium, dan hindari menyalakan api terbuka.`
                            : `Kondisi vegetasi terpantau aman terkendali. Pantau terus perubahan cuaca kering dan arah angin untuk antisipasi dini bahaya kebakaran hutan & semak.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setIsAlertModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#152238] dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700/50 shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Bell className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        <span>Pusat Siaga Bencana</span>
                      </button>
                    </div>
                  </div>

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

                  {/* 3 Action Shortcuts: Map, Alert Center, and PLTB */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveNav('map')}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#152238] dark:hover:bg-[#1c2c47] border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            Peta Satelit & Api
                          </h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                            Pantau sebaran hotspot live
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsAlertModalOpen(true)}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#152238] dark:hover:bg-[#1c2c47] border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            Siaga Asap & Evakuasi
                          </h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                            Panduan warga & kontak darurat
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveNav('smoke_forecast')}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white hover:bg-slate-50 dark:bg-[#152238] dark:hover:bg-[#1c2c47] border border-slate-100 dark:border-slate-700/50 shadow-xs flex items-center justify-between text-left transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                          <CloudFog className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            Prediksi Kabut Asap
                          </h4>
                          <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">
                            Sebaran ISPU, PM2.5 & Vektor Angin
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all shrink-0" />
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



              {/* VIEW 3: WILAYAH RAWAN (Presets Catalogue) */}
              {activeNav === 'presets' && (
                <TerritoryPresetsView
                  activePresetId={activePresetId}
                  onSelectPreset={(pData) => {
                    handlePresetSelect(pData);
                  }}
                  onGoToDashboard={() => setActiveNav('dashboard')}
                  onGoToMap={() => setActiveNav('map')}
                  userLocation={userLocation}
                  onSelectUserLocation={handleSelectUserLocation}
                  onRequestGps={detectUserLocation}
                  isDetectingGps={isDetectingGps}
                />
              )}

              {/* VIEW 4: PREDIKSI KABUT ASAP */}
              {activeNav === 'smoke_forecast' && hasilAnalisis && (
                <SmokeForecastView
                  formData={formData}
                  hasil={hasilAnalisis}
                  onBackToDashboard={() => setActiveNav('dashboard')}
                  onOpenParams={() => setIsParamModalOpen(true)}
                  onGoToMap={() => setActiveNav('map')}
                />
              )}

              {/* VIEW 5: PARAMETER AI (Spacious Dedicated View) */}
              {activeNav === 'params' && (
                <div className="max-w-3xl mx-auto space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <Sliders className="w-5 h-5 text-blue-600" />
                        <span>Pengaturan Parameter Lapangan</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Sesuaikan cuaca mikro, karakteristik lahan gambut, dan kapasitas pengelolaan secara terperinci.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveNav('dashboard')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>← Kembali ke Dasbor</span>
                    </button>
                  </div>

                  <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
                    <RiskAnalysisForm
                      formData={formData}
                      onChange={handleFormChange}
                      onSubmit={(e) => {
                        handleSubmit(e);
                        setActiveNav('dashboard');
                      }}
                      isLoading={isLoading}
                      isModal={false}
                    />
                  </div>
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
      )}
      </div>

      {/* 3. Right Sidebar: Weekly Forecast (Hidden in full Google Maps view) */}
      {activeNav !== 'map' && hasilAnalisis && hasilAnalisis.proyeksi_7_hari && (
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

      {/* Modal for Karhutla Disaster Early Warning Center */}
      <DisasterAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        formData={formData}
        hasil={hasilAnalisis}
        onGoToMap={() => {
          setIsAlertModalOpen(false);
          setActiveNav('map');
        }}
      />

      {/* Interactive Gemini AI Assistant Modal */}
      {hasilAnalisis && (
        <AiAssistantModal
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          formData={formData}
          hasilAnalisis={hasilAnalisis}
          hasGeminiKey={hasGeminiKey}
          userLocation={userLocation}
        />
      )}
    </div>
  );
}
