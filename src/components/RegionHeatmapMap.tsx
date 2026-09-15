import React, { useState, useRef, useEffect } from 'react';
import { 
  Map, 
  Flame, 
  MapPin, 
  Layers, 
  AlertTriangle,
  Compass,
  Sparkles,
  ShieldCheck,
  Plus,
  Minus,
  RotateCcw,
  LocateFixed,
  Earth,
  ExternalLink,
  Move,
  CheckCircle2,
  Navigation,
  Eye,
  EyeOff,
  Loader2,
  Crosshair,
  Radio
} from 'lucide-react';
import { FormInput, HasilAnalisis } from '../types.ts';

interface RegionHeatmapMapProps {
  formData: FormInput;
  hasil: HasilAnalisis;
  onUpdateFormData?: (updated: Partial<FormInput>) => void;
}

interface UserGpsData {
  latitude: number;
  longitude: number;
  accuracy: number;
  displayName: string;
  timestamp: number;
}

// Haversine formula to compute accurate distance in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const RegionHeatmapMap: React.FC<RegionHeatmapMapProps> = ({
  formData,
  hasil,
  onUpdateFormData,
}) => {
  // Layer and display toggles
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'topography'>('satellite');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showPeatBoundary, setShowPeatBoundary] = useState<boolean>(true);
  const [showCanalBlocks, setShowCanalBlocks] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [selectedDangerFilter, setSelectedDangerFilter] = useState<'all' | 'low' | 'moderate' | 'high' | 'extreme'>('all');

  // Interactive Zoom & Pan State
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // User GPS Location State
  const [userGps, setUserGps] = useState<UserGpsData | null>(
    formData.userCoordinates
      ? {
          latitude: formData.userCoordinates.latitude,
          longitude: formData.userCoordinates.longitude,
          accuracy: formData.userCoordinates.accuracy || 20,
          displayName: formData.userCoordinates.displayName || formData.lokasi,
          timestamp: formData.userCoordinates.timestamp || Date.now(),
        }
      : null
  );
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsStatusMessage, setGpsStatusMessage] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showUserTooltip, setShowUserTooltip] = useState<boolean>(false);
  const [showUserLocationBeacon, setShowUserLocationBeacon] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with formData.userCoordinates if updated externally
  useEffect(() => {
    if (formData.userCoordinates && (!userGps || formData.userCoordinates.timestamp !== userGps.timestamp)) {
      setUserGps({
        latitude: formData.userCoordinates.latitude,
        longitude: formData.userCoordinates.longitude,
        accuracy: formData.userCoordinates.accuracy || 20,
        displayName: formData.userCoordinates.displayName || formData.lokasi,
        timestamp: formData.userCoordinates.timestamp || Date.now(),
      });
    }
  }, [formData.userCoordinates]);

  // Region coordinates based on location
  const getRegionCoordinates = () => {
    const loc = (formData.lokasi || '').toLowerCase();
    if (loc.includes('bengkalis') || loc.includes('riau')) {
      return { 
        lat: '1.4820° N', 
        lng: '102.1380° E', 
        latNum: 1.4820, 
        lngNum: 102.1380, 
        elevation: '8 mdpl',
        province: 'Riau', 
        zone: 'KHG Semenanjung Kampar' 
      };
    }
    if (loc.includes('kotawaringin') || loc.includes('kalteng') || loc.includes('mentaya') || loc.includes('sampit')) {
      return { 
        lat: '2.5310° S', 
        lng: '112.9510° E', 
        latNum: -2.5310, 
        lngNum: 112.9510, 
        elevation: '12 mdpl',
        province: 'Kalimantan Tengah', 
        zone: 'KHG Mentaya - Katingan' 
      };
    }
    if (loc.includes('musi') || loc.includes('sumsel') || loc.includes('banyuasin') || loc.includes('sekayu')) {
      return { 
        lat: '2.8940° S', 
        lng: '103.8160° E', 
        latNum: -2.8940, 
        lngNum: 103.8160, 
        elevation: '15 mdpl',
        province: 'Sumatera Selatan', 
        zone: 'KHG Sugihan - Saleh' 
      };
    }
    return { 
      lat: '1.3620° N', 
      lng: '109.3010° E', 
      latNum: 1.3620, 
      lngNum: 109.3010, 
      elevation: '10 mdpl',
      province: 'Kalimantan Barat', 
      zone: 'KHG Sambas - Paloh' 
    };
  };

  const coords = getRegionCoordinates();

  // Official Google Earth 3D Web link for region
  const googleEarthUrl = `https://earth.google.com/web/@${coords.latNum},${coords.lngNum},120a,2800d,35y,0h,45t,0r`;

  // Google Earth link for user's detected GPS coordinates
  const userGoogleEarthUrl = userGps
    ? `https://earth.google.com/web/@${userGps.latitude},${userGps.longitude},100a,1200d,35y,0h,45t,0r`
    : googleEarthUrl;

  // Dynamic hotspots based on formData.histori_titik_panas_10km
  const rawHotspotCount = formData.histori_titik_panas_10km ?? (formData as any).riwayat_titik_panas_30hari ?? 3;
  const hotspotCount = Math.max(1, Math.min(8, rawHotspotCount));
  const mockHotspots = Array.from({ length: hotspotCount }).map((_, i) => ({
    id: `HS-${102 + i}`,
    x: 35 + ((i * 37) % 48),
    y: 25 + ((i * 29) % 48),
    confidence: i === 0 ? 'Tinggi (95%)' : i % 2 === 0 ? 'Moderat (82%)' : 'Rendah (64%)',
    frp: `${(18 + i * 9.2).toFixed(1)} MW`,
    jarak: `${(Number(formData.jarak_sumber_api_km || 2.5) + i * 1.4).toFixed(1)} km`,
    dangerTier: i === 0 || (rawHotspotCount > 6 && i < 3) ? 'extreme' : i % 2 === 0 ? 'high' : 'moderate',
  }));

  // Detect User Location using Browser Geolocation API
  const handleDetectUserLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    setIsDetectingGps(true);
    setGpsStatusMessage('Mengakses satelit GPS perangkat...');
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy || 20;

        setGpsStatusMessage('Mencari toponimi wilayah...');

        let detectedName = `GPS (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)`;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`
          );
          if (res.ok) {
            const data = await res.json();
            const locality = data.locality || data.city || data.principalSubdivision || '';
            const subLoc = data.localityInfo?.administrative?.[3]?.name || '';
            if (locality) {
              detectedName = subLoc ? `${subLoc}, ${locality}` : locality;
            }
          }
        } catch {
          // Fallback to coordinates
        }

        const gpsData: UserGpsData = {
          latitude: lat,
          longitude: lng,
          accuracy,
          displayName: detectedName,
          timestamp: Date.now(),
        };

        setUserGps(gpsData);
        setIsDetectingGps(false);
        setGpsStatusMessage(null);
        setShowUserTooltip(true);

        // Notify parent callback if provided
        if (onUpdateFormData) {
          onUpdateFormData({
            userCoordinates: gpsData,
          });
        }

        // Smoothly pan & zoom to the detected user location pin
        setZoom(1.6);
        setPan({ x: -10, y: -20 });
      },
      (error) => {
        setIsDetectingGps(false);
        setGpsStatusMessage(null);
        let msg = 'Gagal mendeteksi lokasi GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Izin akses lokasi ditolak oleh browser. Mohon izinkan izin lokasi di peramban Anda.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Waktu permintaan GPS habis. Pastikan GPS aktif dan coba lagi.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Sinyal satelit GPS tidak tersedia saat ini.';
        }
        setGpsError(msg);
        setTimeout(() => setGpsError(null), 5000);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      }
    );
  };

  // Apply User GPS as the primary analysis location
  const handleApplyGpsAsPrimaryLocation = () => {
    if (userGps && onUpdateFormData) {
      onUpdateFormData({
        lokasi: userGps.displayName,
        userCoordinates: userGps,
      });
      setShowUserTooltip(false);
    }
  };

  // User Canvas SVG Coordinates Calculation
  // We place user's beacon relative to region center or at a designated interactive position
  const getUserSvgCoords = () => {
    if (!userGps) return null;
    const dLat = userGps.latitude - coords.latNum;
    const dLng = userGps.longitude - coords.lngNum;

    // If coordinates are in reasonable bounds of the region, offset proportionally
    if (Math.abs(dLat) < 3 && Math.abs(dLng) < 3) {
      const cx = 300 + Math.max(-180, Math.min(180, dLng * 90));
      const cy = 175 - Math.max(-100, Math.min(100, dLat * 90));
      return { x: cx, y: cy };
    }
    // If user is accessing from elsewhere in Indonesia (e.g. Jakarta/Surabaya),
    // display within the monitored field radius as the active field surveyor
    return { x: 310, y: 195 };
  };

  const userSvgPos = getUserSvgCoords();

  // Distance from user to primary hotspot in km
  const distToPrimaryHotspotKm = userGps
    ? (
        calculateDistanceKm(
          userGps.latitude,
          userGps.longitude,
          coords.latNum + 0.04,
          coords.lngNum + 0.03
        ) || Number(formData.jarak_sumber_api_km || 2.5)
      ).toFixed(1)
    : Number(formData.jarak_sumber_api_km || 2.5).toFixed(1);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3.5));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.6));
  };

  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
    setSelectedHotspot(null);
    setShowUserTooltip(false);
  };

  const handleFocusFarm = () => {
    setZoom(1.6);
    setPan({ x: -20, y: -15 });
  };

  const handleFocusUserLocation = () => {
    if (!userGps) {
      handleDetectUserLocation();
      return;
    }
    setZoom(1.8);
    setPan({ x: -10, y: -20 });
    setShowUserTooltip(true);
  };

  // Pan Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Pan Touch Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey || true) {
      e.preventDefault();
      const delta = e.deltaY * -0.0015;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.6), 3.5));
    }
  };

  // Danger rating determination based on current score
  const currentScore = hasil.skor_risiko || 0;
  const currentCategory = (hasil.kategori_risiko || 'SEDANG').toUpperCase();

  // Color danger tiers definitions (Low to Extreme)
  const dangerTiers = [
    {
      id: 'low',
      label: 'Rendah (Low)',
      range: '0 – 40',
      color: '#10b981',
      activeBg: 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-200',
      kondisi: 'Serasah gambut basah, muka air tanah aman (> -20 cm).',
      rekomendasi: 'Aman untuk aktivitas pertanian PLTB (tanpa bakar), pengomposan mulsa.',
    },
    {
      id: 'moderate',
      label: 'Sedang (Moderate)',
      range: '41 – 60',
      color: '#f59e0b',
      activeBg: 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-200',
      kondisi: 'Lapisan serasah permukaan mulai kering, cuaca panas cerah berangin.',
      rekomendasi: 'Waspada percikan, siagakan parit keliling, dilarang merokok di lahan.',
    },
    {
      id: 'high',
      label: 'Tinggi (High)',
      range: '61 – 80',
      color: '#f97316',
      activeBg: 'bg-orange-50/80 border-orange-500 ring-2 ring-orange-200',
      kondisi: 'Gambut kering moderat (-40 cm), vegetasi paku/ilalang rapuh mudah menyala.',
      rekomendasi: 'Siaga kuning: patroli terpadu Manggala Agni, siapkan pompa air apung.',
    },
    {
      id: 'extreme',
      label: 'Ekstrem (Extreme)',
      range: '81 – 100',
      color: '#ef4444',
      activeBg: 'bg-red-50/80 border-red-500 ring-2 ring-red-200',
      kondisi: 'Gambut kering kritis (< -50 cm), kadar air bahan bakar < 15%.',
      rekomendasi: 'Siaga merah: larangan mutlak api terbuka, pembasahan gambut berkala (rewetting).',
    },
  ];

  const activeTierId = currentScore <= 40 ? 'low' : currentScore <= 60 ? 'moderate' : currentScore <= 80 ? 'high' : 'extreme';
  const scaleKm = (2.5 / zoom).toFixed(1);

  return (
    <div id="region-heatmap-wrapper" className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xs space-y-5">
      {/* Top Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-2xs">
              <Map className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Peta Satelit & Heatmap Interaktif Karhutla</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
              Live Spatial
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              {coords.zone} ({coords.province})
            </span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span>Koordinat: <strong className="text-slate-700 font-semibold">{coords.lat}, {coords.lng}</strong></span>
            <span className="text-slate-300 hidden sm:inline">&bull;</span>
            <span>Elevasi: {coords.elevation}</span>
          </div>
        </div>

        {/* Action Controls: User GPS Detector, Google Earth & Base Layer Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* USER LOCATION GPS DETECTION BUTTON */}
          <button
            id="btn-detect-user-location"
            type="button"
            onClick={handleDetectUserLocation}
            disabled={isDetectingGps}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
              userGps
                ? 'bg-cyan-50 border border-cyan-300 text-cyan-800 hover:bg-cyan-100'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            title="Deteksi posisi GPS Anda dan tampilkan di heatmap"
          >
            {isDetectingGps ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-600" />
                <span>{gpsStatusMessage || 'Mendeteksi...'}</span>
              </>
            ) : userGps ? (
              <>
                <Crosshair className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                <span>GPS Terkunci</span>
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5" />
                <span>Deteksi Lokasi Saya</span>
              </>
            )}
          </button>

          {/* Direct Google Earth Launch Button */}
          <a
            id="btn-open-google-earth"
            href={userGps ? userGoogleEarthUrl : googleEarthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer group"
            title="Buka tampilan 3D Google Earth Web untuk koordinat lokasi ini"
          >
            <Earth className="w-3.5 h-3.5 text-sky-200 group-hover:rotate-12 transition-transform" />
            <span>Google Earth 3D</span>
            <ExternalLink className="w-3 h-3 text-white/80" />
          </a>

          {/* Base Layer Switch: Google Earth Satellite vs KHG Topography */}
          <div className="flex p-1 bg-slate-100 rounded-xl text-xs">
            <button
              id="layer-btn-satellite"
              type="button"
              onClick={() => setActiveLayer('satellite')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeLayer === 'satellite'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Earth className="w-3.5 h-3.5 text-blue-600" />
              <span>Satelit Earth</span>
            </button>
            <button
              id="layer-btn-topography"
              type="button"
              onClick={() => setActiveLayer('topography')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                activeLayer === 'topography'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Radar Topo</span>
            </button>
          </div>
        </div>
      </div>

      {/* GPS Error Notification if any */}
      {gpsError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            type="button"
            onClick={() => setGpsError(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer"
          >
            &times;
          </button>
        </div>
      )}

      {/* GPS Active Notification Banner */}
      {userGps && (
        <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs animate-fadeIn">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Navigation className="w-4 h-4 -rotate-45" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 truncate">
                  Lokasi Anda Terdeteksi: {userGps.displayName}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200 shrink-0">
                  Akurasi &plusmn;{Math.round(userGps.accuracy)}m
                </span>
              </div>
              <p className="text-[11px] text-slate-600 truncate">
                Koordinat: {userGps.latitude.toFixed(5)}°, {userGps.longitude.toFixed(5)}° &bull; Jarak ke titik api terdekat: <strong className="text-orange-600 font-bold">{distToPrimaryHotspotKm} km</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleFocusUserLocation}
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <LocateFixed className="w-3 h-3" />
              <span>Pusatkan Peta</span>
            </button>
            <a
              href={userGoogleEarthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[11px] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <Earth className="w-3 h-3 text-blue-600" />
              <span>Earth 3D</span>
            </a>
          </div>
        </div>
      )}

      {/* Feature Layer Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium text-[11px] mr-1">Lapisan:</span>
          
          {/* User Location Layer Toggle */}
          {userGps && (
            <button
              id="toggle-user-beacon-btn"
              type="button"
              onClick={() => setShowUserLocationBeacon(!showUserLocationBeacon)}
              className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
                showUserLocationBeacon
                  ? 'bg-cyan-50 border-cyan-300 text-cyan-800 font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <Navigation className="w-3 h-3 text-cyan-600 -rotate-45" />
              <span>Posisi Saya ({showUserLocationBeacon ? 'ON' : 'OFF'})</span>
            </button>
          )}

          <button
            id="toggle-heatmap-btn"
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
              showHeatmap
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {showHeatmap ? <Eye className="w-3 h-3 text-orange-600" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
            <span>Heatmap Bahaya</span>
          </button>

          <button
            id="toggle-hotspots-btn"
            type="button"
            onClick={() => setShowHotspots(!showHotspots)}
            className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer flex items-center gap-1 ${
              showHotspots
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            <Flame className="w-3 h-3 text-red-600" />
            <span>Titik Api Satelit ({mockHotspots.length})</span>
          </button>

          <button
            id="toggle-peat-btn"
            type="button"
            onClick={() => setShowPeatBoundary(!showPeatBoundary)}
            className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer ${
              showPeatBoundary
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            Zona KHG
          </button>

          <button
            id="toggle-canal-btn"
            type="button"
            onClick={() => setShowCanalBlocks(!showCanalBlocks)}
            className={`px-2.5 py-1 rounded-lg font-medium border text-[11px] transition-colors cursor-pointer ${
              showCanalBlocks
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            Kanal & Parit
          </button>
        </div>

        {/* Pan Drag Hint */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
          <Move className="w-3 h-3 text-slate-400" />
          <span>Klik & geser untuk pan &bull; Scroll untuk zoom</span>
        </div>
      </div>

      {/* Interactive Map Viewport with Zoom and Pan */}
      <div 
        ref={containerRef}
        id="interactive-map-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`relative w-full h-88 sm:h-[440px] rounded-2xl overflow-hidden select-none border border-slate-200/90 shadow-inner ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        } ${activeLayer === 'satellite' ? 'bg-[#0b1d16]' : 'bg-[#0f172a]'}`}
      >
        {/* Floating Zoom & Navigation Controls (Top-Left) */}
        <div 
          id="map-zoom-controls"
          className="absolute top-3 left-3 z-30 flex flex-col gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Zoom In */}
          <button
            id="btn-zoom-in"
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 3.5}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            title="Perbesar Peta (Zoom In)"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Zoom Out */}
          <button
            id="btn-zoom-out"
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.6}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
            title="Perkecil Peta (Zoom Out)"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="h-px bg-slate-700 my-0.5" />

          {/* Reset Zoom & Pan */}
          <button
            id="btn-reset-view"
            type="button"
            onClick={handleResetView}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title="Reset Tampilan (100%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Focus on User Location (GPS) */}
          <button
            id="btn-focus-user-gps"
            type="button"
            onClick={handleFocusUserLocation}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer shadow-xs ${
              userGps
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
            title={userGps ? "Fokuskan ke Posisi GPS Anda" : "Deteksi & Fokuskan ke Posisi Anda"}
          >
            <Crosshair className="w-4 h-4" />
          </button>

          {/* Focus on Monitored Farm */}
          <button
            id="btn-focus-farm"
            type="button"
            onClick={handleFocusFarm}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            title="Fokuskan ke Lahan Pantauan"
          >
            <LocateFixed className="w-4 h-4" />
          </button>

          {/* Current Zoom Level Badge */}
          <span className="text-[9px] font-bold text-slate-400 text-center py-0.5">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Compass and Google Earth Status Tag (Top-Right) */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
          {activeLayer === 'satellite' && (
            <div className="bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl border border-slate-700 text-white text-[10px] font-medium flex items-center gap-1.5 shadow-md">
              <Earth className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Google Earth Imagery Active</span>
            </div>
          )}
          <div 
            onClick={handleResetView}
            className="bg-slate-900/90 backdrop-blur-md p-2 rounded-xl border border-slate-700 text-slate-300 flex items-center gap-1.5 shadow-md cursor-pointer hover:text-white transition-colors"
            title="Arah Utara (Klik untuk reset orientasi)"
          >
            <Compass className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-bold text-white">U</span>
          </div>
        </div>

        {/* Scalable and Pannable Canvas Container */}
        <div 
          className="w-full h-full transform origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0px) scale(${zoom})`,
          }}
        >
          <svg 
            className="w-full h-full object-cover" 
            viewBox="0 0 600 350" 
            preserveAspectRatio="none"
          >
            <defs>
              {/* Pattern 1: Grid Lines */}
              <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#334155" strokeWidth="0.4" opacity="0.35" />
              </pattern>

              {/* Pattern 2: Google Earth Satellite Agricultural & Canal Grid Pattern */}
              <pattern id="satellitePeatPattern" width="80" height="80" patternUnits="userSpaceOnUse">
                <rect width="80" height="80" fill="#0d2417" />
                <path d="M 0,20 Q 20,15 40,22 T 80,18" fill="none" stroke="#133623" strokeWidth="1.2" opacity="0.6" />
                <path d="M 0,55 Q 30,60 50,52 T 80,58" fill="none" stroke="#133623" strokeWidth="1.2" opacity="0.6" />
                <line x1="20" y1="0" x2="20" y2="80" stroke="#04120b" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                <line x1="60" y1="0" x2="60" y2="80" stroke="#04120b" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                <rect x="23" y="10" width="34" height="25" fill="#143422" opacity="0.5" />
                <rect x="23" y="45" width="34" height="25" fill="#183f2a" opacity="0.45" />
              </pattern>

              {/* Heatmap Radial Gradients */}
              <radialGradient id="heatEkstrem" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#f97316" stopOpacity="0.65" />
                <stop offset="70%" stopColor="#eab308" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatTinggi" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
                <stop offset="45%" stopColor="#eab308" stopOpacity="0.5" />
                <stop offset="85%" stopColor="#10b981" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="heatModerat" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#eab308" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>

              {/* User Location Radar Gradient */}
              <radialGradient id="userRadarPulse" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
                <stop offset="60%" stopColor="#0284c7" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Base Layer Background */}
            {activeLayer === 'satellite' ? (
              <>
                <rect width="600" height="350" fill="#0b1d16" />
                <rect width="600" height="350" fill="url(#satellitePeatPattern)" />
                <path d="M 40,40 L 260,30 L 250,200 L 30,190 Z" fill="#102b1c" stroke="#1d4d33" strokeWidth="0.8" opacity="0.7" />
                <path d="M 330,60 L 560,40 L 570,250 L 340,260 Z" fill="#0e2719" stroke="#1d4d33" strokeWidth="0.8" opacity="0.7" />
              </>
            ) : (
              <>
                <rect width="600" height="350" fill="#0f172a" />
                <rect width="600" height="350" fill="url(#gridPattern)" />
              </>
            )}

            {/* Peatland Ecological Boundary (KHG Area) */}
            {showPeatBoundary && (
              <g>
                <path
                  d="M 50 45 Q 180 25 330 65 T 550 115 L 530 295 Q 300 325 110 285 Z"
                  fill={activeLayer === 'satellite' ? '#07160e' : '#1e293b'}
                  fillOpacity={activeLayer === 'satellite' ? 0.35 : 0.6}
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                  opacity="0.85"
                />
                <text x="70" y="70" fill="#38bdf8" fontSize="10" fontWeight="bold" opacity="0.75">
                  DELINEASI KHG {coords.province.toUpperCase()}
                </text>
              </g>
            )}

            {/* River & Canal Waterway Network (Canal Blocking Route) */}
            {showCanalBlocks && (
              <g>
                <path
                  d="M 20 180 C 140 160, 220 210, 310 170 C 400 130, 480 200, 580 180"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth={activeLayer === 'satellite' ? '4' : '3.5'}
                  strokeLinecap="round"
                  opacity="0.85"
                />
                <path
                  d="M 310 170 L 320 310"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                <path
                  d="M 180 175 L 180 60"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  opacity="0.65"
                />
                <circle cx="315" cy="220" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="318" cy="265" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
                <circle cx="180" cy="110" r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            )}

            {/* Heatmap Danger Blobs */}
            {showHeatmap && (
              <g className="mix-blend-screen transition-opacity duration-300">
                {currentScore > 75 ? (
                  <circle cx="280" cy="155" r="105" fill="url(#heatEkstrem)" opacity="0.9" />
                ) : currentScore > 50 ? (
                  <circle cx="280" cy="155" r="90" fill="url(#heatTinggi)" opacity="0.85" />
                ) : (
                  <circle cx="280" cy="155" r="75" fill="url(#heatModerat)" opacity="0.8" />
                )}

                <circle cx="390" cy="130" r="70" fill="url(#heatTinggi)" opacity="0.75" />
                <circle cx="190" cy="190" r="60" fill="url(#heatModerat)" opacity="0.7" />

                {rawHotspotCount > 5 && (
                  <circle cx="450" cy="190" r="85" fill="url(#heatEkstrem)" opacity="0.85" />
                )}
              </g>
            )}

            {/* USER LOCATION BEACON ON SVG (Radar waves & proximity line) */}
            {userGps && showUserLocationBeacon && userSvgPos && (
              <g id="user-location-svg-radar">
                {/* Sonar wave pulse */}
                <circle
                  cx={userSvgPos.x}
                  cy={userSvgPos.y}
                  r="36"
                  className="animate-ping"
                  fill="#06b6d4"
                  fillOpacity="0.35"
                />
                {/* Accuracy perimeter circle */}
                <circle
                  cx={userSvgPos.x}
                  cy={userSvgPos.y}
                  r={Math.max(24, Math.min(55, userGps.accuracy))}
                  fill="#06b6d4"
                  fillOpacity="0.12"
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />
                {/* Inner radar glow */}
                <circle
                  cx={userSvgPos.x}
                  cy={userSvgPos.y}
                  r="18"
                  fill="url(#userRadarPulse)"
                />

                {/* Distance vector line from User to nearest Hotspot */}
                <line
                  x1={userSvgPos.x}
                  y1={userSvgPos.y}
                  x2={mockHotspots[0].x * 6}
                  y2={mockHotspots[0].y * 3.5}
                  stroke="#06b6d4"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.8"
                />
                {/* Distance label pill */}
                <g transform={`translate(${(userSvgPos.x + mockHotspots[0].x * 6) / 2}, ${(userSvgPos.y + mockHotspots[0].y * 3.5) / 2})`}>
                  <rect
                    x="-34"
                    y="-9"
                    width="68"
                    height="18"
                    rx="6"
                    fill="#0f172a"
                    fillOpacity="0.9"
                    stroke="#06b6d4"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    fill="#38bdf8"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {distToPrimaryHotspotKm} km
                  </text>
                </g>
              </g>
            )}

            {/* Sekat Bakar around Farm */}
            <rect
              x="240"
              y="130"
              width="80"
              height="60"
              rx="8"
              fill="#059669"
              fillOpacity="0.2"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <text x="245" y="145" fill="#34d399" fontSize="8" fontWeight="bold">
              Sekat Bakar Petani
            </text>
          </svg>

          {/* User Farm Location Marker Pin */}
          <div 
            className="absolute left-[46%] top-[43%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none"
          >
            <div className="relative">
              <span className="animate-ping absolute -inset-1 rounded-full bg-blue-400 opacity-75"></span>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 backdrop-blur-sm border border-slate-700 text-white text-[10px] font-bold whitespace-nowrap shadow-md">
              Lahan Pantauan ({formData.luas_lahan_ha || 2} Ha)
            </div>
          </div>

          {/* USER DETECTED LOCATION PIN (GPS) */}
          {userGps && showUserLocationBeacon && userSvgPos && (
            <div
              id="user-gps-marker-pin"
              className="absolute z-25 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer pointer-events-auto"
              style={{
                left: `${(userSvgPos.x / 600) * 100}%`,
                top: `${(userSvgPos.y / 350) * 100}%`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setShowUserTooltip(!showUserTooltip);
              }}
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute w-8 h-8 rounded-full bg-cyan-400 opacity-75"></span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xl border-2 border-white">
                  <Navigation className="w-4 h-4 text-white -rotate-45" />
                </div>
              </div>

              {/* Tag below Pin */}
              <div className="mt-1 px-2 py-0.5 rounded-full bg-cyan-900/95 backdrop-blur-sm border border-cyan-400 text-white text-[10px] font-bold whitespace-nowrap shadow-lg flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Posisi Anda (GPS)</span>
              </div>

              {/* Interactive Tooltip Card for User Location */}
              {showUserTooltip && (
                <div 
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-3 bg-slate-900/95 text-white rounded-2xl border border-cyan-500/80 shadow-2xl text-[11px] space-y-2 z-40 text-left pointer-events-auto backdrop-blur-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between font-bold text-cyan-400 border-b border-slate-700 pb-1.5">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3.5 h-3.5 text-cyan-400 -rotate-45" />
                      Posisi GPS Anda
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-700 font-semibold">
                      Akurat &plusmn;{Math.round(userGps.accuracy)}m
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-300">
                    <div className="font-semibold text-white truncate">
                      {userGps.displayName}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Lintang: {userGps.latitude.toFixed(5)}°</span>
                      <span>Bujur: {userGps.longitude.toFixed(5)}°</span>
                    </div>
                    <div className="flex justify-between text-slate-200 pt-1 border-t border-slate-800">
                      <span>Jarak ke Api Terdekat:</span>
                      <strong className="text-orange-400 font-bold">{distToPrimaryHotspotKm} km</strong>
                    </div>
                  </div>

                  {/* Action Buttons in Tooltip */}
                  <div className="pt-1 flex flex-col gap-1.5 border-t border-slate-800">
                    <a
                      href={userGoogleEarthUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 text-white rounded-lg text-center text-[10px] font-bold flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Earth className="w-3 h-3 text-sky-200" />
                      <span>Buka Posisi Anda di Google Earth 3D</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    {onUpdateFormData && formData.lokasi !== userGps.displayName && (
                      <button
                        type="button"
                        onClick={handleApplyGpsAsPrimaryLocation}
                        className="w-full py-1 px-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 rounded-lg text-center text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        Gunakan Sebagai Lokasi Analisis Utama
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dynamic Hotspot Pins */}
          {showHotspots && mockHotspots.map((hs) => {
            const isMatchFilter = selectedDangerFilter === 'all' || hs.dangerTier === selectedDangerFilter;
            if (!isMatchFilter) return null;

            return (
              <button
                key={hs.id}
                id={`hotspot-pin-${hs.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspot(selectedHotspot === hs.id ? null : hs.id);
                }}
                className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform hover:scale-125"
                style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              >
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute w-5 h-5 rounded-full bg-red-500 opacity-60"></span>
                  <div className={`w-6 h-6 rounded-full ${
                    hs.dangerTier === 'extreme' ? 'bg-red-600' : 'bg-orange-500'
                  } text-white flex items-center justify-center shadow-md border border-white`}>
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Tooltip on click */}
                {selectedHotspot === hs.id && (
                  <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-3 bg-slate-900/95 text-white rounded-xl border border-slate-700 shadow-2xl text-[11px] space-y-1.5 z-40 text-left pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between font-bold text-orange-400 border-b border-slate-700 pb-1">
                      <span>Titik Api {hs.id}</span>
                      <span className="text-[10px] text-red-400 font-semibold">{hs.confidence}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Intensitas FRP:</span>
                      <span className="font-semibold text-white">{hs.frp}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Jarak ke Lahan:</span>
                      <span className="font-semibold text-white">{hs.jarak}</span>
                    </div>
                    <div className="pt-1 text-[10px] text-slate-400 border-t border-slate-800">
                      Sensor: SNPP VIIRS &bull; Tanggap Darurat Siaga
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Map Scale Bar Indicator (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 z-30 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-white text-[10px] flex items-center gap-2 shadow-lg">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-slate-300 font-medium">Skala ~{scaleKm} km</span>
            <div className="w-16 h-1 bg-white/90 mt-0.5 relative rounded-full">
              <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-blue-500 rounded-l-full" />
            </div>
          </div>
          <span className="text-slate-400 border-l border-slate-700 pl-2">
            FDRS WGS-84
          </span>
        </div>
      </div>

      {/* DYNAMIC COLOR LEGEND (LOW - HIGH / EKSTREM) EXPLANATION PANEL */}
      <div id="dynamic-fire-danger-legend" className="space-y-3 pt-2">
        {/* Legend Header & Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-lg bg-orange-50 text-orange-600">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Legenda & Klasifikasi Tingkat Bahaya Karhutla (Low – High)
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Tingkat Saat Ini:
            </span>
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
              activeTierId === 'extreme' ? 'bg-red-100 text-red-800 border-red-200' :
              activeTierId === 'high' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              activeTierId === 'moderate' ? 'bg-amber-100 text-amber-800 border-amber-200' :
              'bg-emerald-100 text-emerald-800 border-emerald-200'
            }`}>
              {currentCategory} ({currentScore}%)
            </span>
          </div>
        </div>

        {/* Dynamic Continuous Spectrum Gradient Bar */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600">
            <span className="text-emerald-700 font-bold">Rendah (0–40)</span>
            <span className="text-amber-700 font-bold">Sedang (41–60)</span>
            <span className="text-orange-700 font-bold">Tinggi (61–80)</span>
            <span className="text-red-700 font-bold">Ekstrem (81–100)</span>
          </div>

          {/* Continuous Gradient Bar with Dynamic Pin Indicator */}
          <div className="relative w-full h-4 sm:h-5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 to-red-600 shadow-inner">
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 transition-all duration-500"
              style={{ left: `${Math.max(3, Math.min(97, currentScore))}%` }}
            >
              <div className="relative flex flex-col items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white border-2 border-slate-900 shadow-md flex items-center justify-center">
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-slate-900 animate-ping" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-0.5">
            <span>0%</span>
            <span>40%</span>
            <span>60%</span>
            <span>80%</span>
            <span>100%</span>
          </div>
        </div>

        {/* 4 Interactive Danger Tier Cards (Low, Moderate, High, Extreme) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {dangerTiers.map((tier) => {
            const isActive = activeTierId === tier.id;
            const isFilterSelected = selectedDangerFilter === tier.id;

            return (
              <div
                key={tier.id}
                id={`danger-tier-card-${tier.id}`}
                onClick={() => {
                  setSelectedDangerFilter(selectedDangerFilter === tier.id ? 'all' : (tier.id as any));
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isActive 
                    ? tier.activeBg + ' shadow-xs' 
                    : isFilterSelected
                    ? 'bg-slate-50 border-blue-500 ring-2 ring-blue-100'
                    : 'bg-white border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                        style={{ backgroundColor: tier.color }} 
                      />
                      <h5 className="text-xs font-bold text-slate-800">
                        {tier.label}
                      </h5>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {tier.range}
                    </span>
                  </div>

                  {isActive && (
                    <div className="mb-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 text-white shadow-2xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>STATUS WILAYAH INI</span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {tier.kondisi}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Rekomendasi Aksi:
                  </span>
                  <p className="text-[11px] font-medium text-slate-700 leading-snug">
                    {tier.rekomendasi}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Contextual Footer Note */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-start sm:items-center gap-2 text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            <span>
              <strong>Strategi Mitigasi Terintegrasi:</strong> Pemantauan satelit dikombinasikan dengan sekat bakar kebun (3–5m) dan penutupan pintu air sekat kanal BRGM mempertahankan kelembapan muka air tanah gambut &gt; -40 cm.
            </span>
          </div>

          <a
            href={userGps ? userGoogleEarthUrl : googleEarthUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Telusuri 3D di Google Earth</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
