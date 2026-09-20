import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  MapPin, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  Navigation, 
  ShieldAlert, 
  Building2, 
  Radio, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { SearchGroundingResult, MapsGroundingResult } from '../types.ts';

// In-memory client cache across component mounts
const clientSearchCache = new Map<string, SearchGroundingResult>();
const clientMapsCache = new Map<string, MapsGroundingResult>();

interface GroundingIntelligencePanelProps {
  currentLocation: string;
}

export const GroundingIntelligencePanel: React.FC<GroundingIntelligencePanelProps> = ({
  currentLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'maps'>('search');
  const [searchData, setSearchData] = useState<SearchGroundingResult | null>(() => {
    return clientSearchCache.get(currentLocation.toLowerCase()) || null;
  });
  const [mapsData, setMapsData] = useState<MapsGroundingResult | null>(() => {
    return clientMapsCache.get(currentLocation.toLowerCase()) || null;
  });
  const [loadingSearch, setLoadingSearch] = useState<boolean>(false);
  const [loadingMaps, setLoadingMaps] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);

  // Fetch search grounding data with client caching
  const fetchSearchGrounding = async (loc: string, force = false) => {
    const key = loc.toLowerCase().trim();
    if (!force && clientSearchCache.has(key)) {
      setSearchData(clientSearchCache.get(key)!);
      return;
    }

    setLoadingSearch(true);
    try {
      const res = await fetch('/api/grounding/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lokasi: loc }),
      });
      if (res.ok) {
        const data = await res.json();
        clientSearchCache.set(key, data);
        setSearchData(data);
      }
    } catch (e) {
      console.info('Notice: using regional search baseline');
    } finally {
      setLoadingSearch(false);
    }
  };

  // Fetch maps grounding data with client caching
  const fetchMapsGrounding = async (loc: string, coords?: { latitude: number; longitude: number }, force = false) => {
    const key = loc.toLowerCase().trim();
    if (!force && !coords && clientMapsCache.has(key)) {
      setMapsData(clientMapsCache.get(key)!);
      return;
    }

    setLoadingMaps(true);
    try {
      const res = await fetch('/api/grounding/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lokasi: loc,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (!coords) {
          clientMapsCache.set(key, data);
        }
        setMapsData(data);
      }
    } catch (e) {
      console.info('Notice: using regional maps baseline');
    } finally {
      setLoadingMaps(false);
    }
  };

  // Fetch when location changes
  useEffect(() => {
    if (currentLocation) {
      // Prioritize active tab first to reduce concurrent burst requests
      if (activeTab === 'search') {
        fetchSearchGrounding(currentLocation);
      } else {
        fetchMapsGrounding(currentLocation, userCoords || undefined);
      }
    }
  }, [currentLocation, activeTab]);

  // When switching tabs, ensure data is loaded for that tab
  const handleTabChange = (tab: 'search' | 'maps') => {
    setActiveTab(tab);
    if (tab === 'search' && !searchData) {
      fetchSearchGrounding(currentLocation);
    } else if (tab === 'maps' && !mapsData) {
      fetchMapsGrounding(currentLocation, userCoords || undefined);
    }
  };

  const handleUseGPS = () => {
    if ('geolocation' in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          setUserCoords(coords);
          setGpsLoading(false);
          fetchMapsGrounding(currentLocation, coords);
        },
        (err) => {
          console.warn('Geolocation denied or error', err);
          setGpsLoading(false);
        },
        { timeout: 8000 }
      );
    }
  };

  return (
    <div id="grounding-intelligence-card" className="bg-white dark:bg-[#152238] border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 transition-colors">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Intelijen Lapangan & Verifikasi Data</span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-blue-500" />
                gemini-3.8-flash
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Informasi aktual dan posko siaga untuk <span className="font-semibold text-slate-700 dark:text-slate-200">{currentLocation}</span>
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 dark:bg-[#0d1629] rounded-xl">
            <button
              id="tab-btn-search-grounding"
              type="button"
              onClick={() => handleTabChange('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-white dark:bg-[#152238] text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Google Search</span>
            </button>
            <button
              id="tab-btn-maps-grounding"
              type="button"
              onClick={() => handleTabChange('maps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'maps'
                  ? 'bg-white dark:bg-[#152238] text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Google Maps</span>
            </button>
          </div>

          <button
            id="btn-refresh-grounding"
            type="button"
            onClick={() => {
              if (activeTab === 'search') fetchSearchGrounding(currentLocation, true);
              else fetchMapsGrounding(currentLocation, userCoords || undefined, true);
            }}
            disabled={loadingSearch || loadingMaps}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Segarkan data grounding"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(loadingSearch || loadingMaps) ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tab 1: Google Search Grounding */}
      {activeTab === 'search' && (
        <div id="grounding-search-content" className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-50/80 dark:bg-blue-950/40 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800/50">
              <Search className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Berita & Kondisi Karhutla Terkini (Google Search Grounding)</span>
            </div>
            {searchData?.queryTime && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Diperbarui: {searchData.queryTime} WIB
              </span>
            )}
          </div>

          {loadingSearch ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
              <span className="text-xs">Menelusuri informasi terkini via Google Search...</span>
            </div>
          ) : (
            <>
              {/* Summary text */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#0d1629] border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {searchData?.summary || 'Data berita terkini sedang dimuat...'}
              </div>

              {/* Verified Web Sources */}
              {searchData?.sources && searchData.sources.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Sumber Berita & Rujukan Terverifikasi:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {searchData.sources.map((src, idx) => (
                      <a
                        key={idx}
                        id={`source-link-${idx}`}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start justify-between p-3 rounded-xl bg-white dark:bg-[#0d1629] border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/60 hover:shadow-xs transition-all text-left"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 transition-colors">
                            {src.title}
                          </p>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate block mt-0.5">
                            {src.uri.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                          </span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab 2: Google Maps Grounding */}
      {activeTab === 'maps' && (
        <div id="grounding-maps-content" className="pt-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-100 dark:border-emerald-800/50">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Posko Manggala Agni & Fasilitas Damkar Terdekat (Google Maps Grounding)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-use-gps"
                type="button"
                onClick={handleUseGPS}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium border border-emerald-200/80 dark:border-emerald-800/50 transition-colors cursor-pointer"
              >
                <Navigation className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{userCoords ? 'GPS Terhubung' : 'Gunakan GPS Saya'}</span>
              </button>
              {mapsData?.queryTime && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Diperbarui: {mapsData.queryTime} WIB
                </span>
              )}
            </div>
          </div>

          {loadingMaps ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
              <span className="text-xs">Menemukan posko & fasilitas di Google Maps...</span>
            </div>
          ) : (
            <>
              {/* Summary text */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#0d1629] border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {mapsData?.summary || 'Data posko dan fasilitas penanganan sedang dimuat...'}
              </div>

              {/* Places extracted from Google Maps Grounding */}
              {mapsData?.places && mapsData.places.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Posko Siaga & Instansi Tanggap Bencana (Tautan Google Maps):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {mapsData.places.map((place, idx) => (
                      <div
                        key={idx}
                        id={`place-card-${idx}`}
                        className="p-3.5 rounded-xl bg-white dark:bg-[#0d1629] border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/60 hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2">
                              {place.title}
                            </h4>
                          </div>
                          {place.address && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-6 line-clamp-2">
                              {place.address}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                            Rute & Lokasi
                          </span>
                          <a
                            id={`place-map-link-${idx}`}
                            href={place.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium transition-colors shadow-2xs"
                          >
                            <span>Buka di Maps</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
