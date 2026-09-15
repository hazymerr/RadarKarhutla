import React, { useState } from 'react';
import { 
  Map, 
  Flame, 
  MapPin, 
  Layers, 
  Eye, 
  EyeOff, 
  Maximize2, 
  AlertTriangle,
  Compass,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { FormInput, HasilAnalisis } from '../types.ts';

interface RegionHeatmapMapProps {
  formData: FormInput;
  hasil: HasilAnalisis;
}

export const RegionHeatmapMap: React.FC<RegionHeatmapMapProps> = ({ formData, hasil }) => {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showPeatBoundary, setShowPeatBoundary] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  // Region coordinates based on location
  const getRegionCoordinates = () => {
    const loc = formData.lokasi.toLowerCase();
    if (loc.includes('bengkalis') || loc.includes('riau')) {
      return { lat: '1.4820° N', lng: '102.1380° E', province: 'Riau', zone: 'KHG Semenanjung Kampar' };
    }
    if (loc.includes('kotawaringin') || loc.includes('kalteng') || loc.includes('mentaya')) {
      return { lat: '2.5310° S', lng: '112.9510° E', province: 'Kalimantan Tengah', zone: 'KHG Mentaya - Katingan' };
    }
    if (loc.includes('musi') || loc.includes('sumsel') || loc.includes('banyuasin')) {
      return { lat: '2.8940° S', lng: '103.8160° E', province: 'Sumatera Selatan', zone: 'KHG Sugihan - Saleh' };
    }
    return { lat: '1.3620° N', lng: '109.3010° E', province: 'Kalimantan Barat', zone: 'KHG Sambas - Paloh' };
  };

  const coords = getRegionCoordinates();

  // Dynamic hotspots based on formData.riwayat_titik_panas_30hari
  const hotspotCount = Math.max(1, Math.min(8, formData.riwayat_titik_panas_30hari || 3));
  const mockHotspots = Array.from({ length: hotspotCount }).map((_, i) => ({
    id: `HS-${102 + i}`,
    x: 35 + ((i * 37) % 50),
    y: 25 + ((i * 29) % 50),
    confidence: i === 0 ? 'Tinggi (94%)' : 'Moderat (78%)',
    frp: `${(15 + i * 8.5).toFixed(1)} MW`,
    jarak: `${(formData.jarak_sumber_api_km + i * 1.5).toFixed(1)} km`,
  }));

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <Map className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
              Peta Satelit & Heatmap Bahaya Karhutla
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                Live Spatial
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Koordinat: {coords.lat}, {coords.lng} &bull; {coords.zone} ({coords.province})
            </p>
          </div>
        </div>

        {/* Map Layer Toggles */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer ${
              showHeatmap
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            Heatmap {showHeatmap ? 'ON' : 'OFF'}
          </button>

          <button
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer ${
              showHotspots
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            Titik Api {showHotspots ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Static Map Graphic Canvas Placeholder with Heatmap Overlay */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl bg-slate-900 overflow-hidden border border-slate-200/80 shadow-inner">
        {/* Stylized Map Base (Topography & River waterways) */}
        <svg className="w-full h-full object-cover" viewBox="0 0 600 350" preserveAspectRatio="none">
          <defs>
            {/* Peatland texture pattern */}
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
            </pattern>
            {/* Heatmap gradients */}
            <radialGradient id="heatEkstrem" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#f97316" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#eab308" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="heatModerat" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f97316" stopOpacity="0.75" />
              <stop offset="45%" stopColor="#eab308" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Map Base Landscape */}
          <rect width="600" height="350" fill="#0f172a" />
          <rect width="600" height="350" fill="url(#grid)" />

          {/* Peatland Ecological Boundary (KHG Area) */}
          {showPeatBoundary && (
            <path
              d="M 60 50 Q 180 30 320 70 T 540 120 L 520 290 Q 300 320 120 280 Z"
              fill="#1e293b"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="6 4"
              opacity="0.7"
            />
          )}

          {/* River / Canal Waterway (Canal Blocking Route) */}
          <path
            d="M 20 180 C 140 160, 220 210, 310 170 C 400 130, 480 200, 580 180"
            fill="none"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 310 170 L 320 310"
            fill="none"
            stroke="#0284c7"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Heatmap Overlay Blobs representing fire risk level */}
          {showHeatmap && (
            <g className="mix-blend-screen transition-opacity duration-300">
              {/* Primary Heat Zone around User Location / Hotspot Cluster */}
              <circle cx="280" cy="150" r="95" fill="url(#heatEkstrem)" />
              <circle cx="380" cy="130" r="75" fill="url(#heatModerat)" />
              <circle cx="190" cy="190" r="60" fill="url(#heatModerat)" />
              {/* Secondary heat plumes */}
              {formData.riwayat_titik_panas_30hari > 5 && (
                <circle cx="450" cy="190" r="85" fill="url(#heatEkstrem)" />
              )}
            </g>
          )}

          {/* Sekat Bakar (Fire Break Perimeter) around User Farm */}
          <rect
            x="240"
            y="130"
            width="80"
            height="60"
            rx="8"
            fill="#059669"
            fillOpacity="0.15"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
        </svg>

        {/* Selected Farm Location Marker Pin */}
        <div 
          className="absolute left-[45%] top-[42%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
        >
          <div className="relative">
            <span className="animate-ping absolute -inset-1 rounded-full bg-blue-400 opacity-75"></span>
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 text-white text-[10px] font-bold whitespace-nowrap shadow-md">
            Lahan Pantauan ({formData.luas_lahan_ha} Ha)
          </div>
        </div>

        {/* Dynamic Hotspot Pins */}
        {showHotspots && mockHotspots.map((hs, i) => (
          <button
            key={hs.id}
            type="button"
            onClick={() => setSelectedHotspot(selectedHotspot === hs.id ? null : hs.id)}
            className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
          >
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute w-5 h-5 rounded-full bg-red-500 opacity-60"></span>
              <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md border border-white">
                <Flame className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Tooltip on click or hover */}
            {selectedHotspot === hs.id && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-slate-900/95 text-white rounded-xl border border-slate-700 shadow-xl text-[11px] space-y-1 z-30">
                <div className="flex items-center justify-between font-bold text-orange-400 border-b border-slate-700 pb-1">
                  <span>{hs.id}</span>
                  <span>{hs.confidence}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Intensitas FRP:</span>
                  <span className="font-semibold text-white">{hs.frp}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Jarak ke Kebun:</span>
                  <span className="font-semibold text-white">{hs.jarak}</span>
                </div>
              </div>
            )}
          </button>
        ))}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 space-y-1.5 shadow-lg z-10">
          <span className="font-bold text-white block text-[10px] uppercase tracking-wider">
            Legenda Bahaya Kebakaran:
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs" />
            <span>Ekstrem (&gt;85) - Siaga Merah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-xs" />
            <span>Tinggi (61-85) - Rawan Terbakar</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
            <span>Sekat Bakar Kebun Petani (Aman)</span>
          </div>
        </div>

        {/* Water Canal & Wind direction chip */}
        <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-700 text-white text-[11px] flex items-center gap-2 z-10">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>Arah Angin: Timur Laut ke Barat Daya</span>
        </div>
      </div>

      {/* Map Action Guide Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Sekat bakar 3–5 meter dan parit berair di batas kebun mampu memotong rembetan bara bawah tanah.
          </span>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          *Data geospasial disinkronkan dengan peta KHG nasional
        </span>
      </div>
    </div>
  );
};
