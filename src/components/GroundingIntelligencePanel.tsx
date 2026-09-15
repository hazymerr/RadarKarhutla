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
    <div id="grounding-intelligence-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-6">
      {/* Header section with Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Radio className="w-4 h-4 animate-pulse text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Intelijen Lapangan & Verifikasi Data
            </h3>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
              <Sparkles className="w-2.5 h-2.5" />
              gemini-3.8-flash
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Informasi aktual dan posko siaga untuk <span className="font-semibold text-slate-700">{currentLocation}</span>
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              id="tab-btn-search-grounding"
              type="button"
              onClick={() => handleTabChange('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'search'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Google Search</span>
            </button>
            <button
              id="tab-btn-maps-grounding"
              type="button"
              onClick={() => handleTabChange('maps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'maps'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
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
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
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
            <div className="flex items-center gap-2 text-xs font-medium text-blue-800 bg-blue-50/80 px-2.5 py-1 rounded-md border border-blue-100">
              <Search className="w-3.5 h-3.5 text-blue-600" />
              <span>Berita & Kondisi Karhutla Terkini (Google Search Grounding)</span>
            </div>
            {searchData?.queryTime && (
              <span className="text-[11px] text-slate-400">
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
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {searchData?.summary || 'Data berita terkini sedang dimuat...'}
              </div>

              {/* Verified Web Sources */}
              {searchData?.sources && searchData.sources.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
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
                        className="group flex items-start justify-between p-3 rounded-xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-xs transition-all text-left"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-blue-600 line-clamp-2 transition-colors">
                            {src.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 truncate">
                            {src.uri.replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0 mt-0.5 transition-colors" />
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-800 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-100">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Posko Manggala Agni & Fasilitas Damkar Terdekat (Google Maps Grounding)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                id="btn-use-gps"
                type="button"
                onClick={handleUseGPS}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium border border-emerald-200/80 transition-colors cursor-pointer"
              >
                <Navigation className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                <span>{userCoords ? 'GPS Terhubung' : 'Gunakan GPS Saya'}</span>
              </button>
              {mapsData?.queryTime && (
                <span className="text-[11px] text-slate-400">
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
              <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {mapsData?.summary || 'Data posko dan fasilitas penanganan sedang dimuat...'}
              </div>

              {/* Places extracted from Google Maps Grounding */}
              {mapsData?.places && mapsData.places.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Posko Siaga & Instansi Tanggap Bencana (Tautan Google Maps):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {mapsData.places.map((place, idx) => (
                      <div
                        key={idx}
                        id={`place-card-${idx}`}
                        className="p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:shadow-xs transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <h4 className="text-xs font-bold text-slate-800 line-clamp-2">
                              {place.title}
                            </h4>
                          </div>
                          {place.address && (
                            <p className="text-[11px] text-slate-500 mt-1 pl-6 line-clamp-2">
                              {place.address}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
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
