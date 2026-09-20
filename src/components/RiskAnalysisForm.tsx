import React, { useState } from 'react';
import {
  FormInput,
  JenisLahan,
  Musim,
  CurahHujan,
  KelembapanTanah,
  KecepatanAngin,
} from '../types.ts';
import {
  CloudRain,
  Wind,
  Layers,
  Flame,
  Trees,
  Tractor,
  Sliders,
  ChevronDown,
  ChevronUp,
  Navigation,
  Loader2,
  CheckCircle2,
  MapPin,
  Droplets,
  Sparkles,
} from 'lucide-react';

interface RiskAnalysisFormProps {
  formData: FormInput;
  onChange: (updated: Partial<FormInput>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isModal?: boolean;
}

export const RiskAnalysisForm: React.FC<RiskAnalysisFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
  isModal = false,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsMessage('Geolokasi tidak didukung oleh browser Anda.');
      return;
    }

    setIsDetectingGps(true);
    setGpsMessage('Mencari koordinat GPS...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = pos.coords.accuracy || 20;

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
          // fallback
        }

        onChange({
          lokasi: detectedName,
          userCoordinates: {
            latitude: lat,
            longitude: lng,
            accuracy,
            displayName: detectedName,
            timestamp: Date.now(),
          },
        });

        setIsDetectingGps(false);
        setGpsMessage(`Lokasi terdeteksi: ${detectedName}`);
        setTimeout(() => setGpsMessage(null), 4000);
      },
      (err) => {
        setIsDetectingGps(false);
        setGpsMessage(
          err.code === 1
            ? 'Izin lokasi ditolak di peramban.'
            : 'Sinyal GPS tidak dapat ditemukan.'
        );
        setTimeout(() => setGpsMessage(null), 4000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  const containerClass = isModal
    ? 'space-y-5'
    : 'space-y-6';

  return (
    <form onSubmit={onSubmit} className={containerClass}>
      
      {/* 1. LOKASI PENGAMATAN */}
      <div className="bg-slate-50/60 dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-2.5 transition-colors">
        <div className="flex items-center justify-between">
          <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Lokasi Pengamatan Wilayah</span>
          </label>
          {formData.userCoordinates && (
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-900/40 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              GPS Aktif
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={formData.lokasi}
              onChange={(e) => onChange({ lokasi: e.target.value })}
              placeholder="Contoh: Desa Sepahat, Bengkalis, Riau"
              className="w-full px-3.5 py-2.5 bg-white dark:bg-[#0d1629] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleDetectGps}
            disabled={isDetectingGps}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0 shadow-2xs"
            title="Deteksi lokasi koordinat GPS Anda saat ini"
          >
            {isDetectingGps ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Mendeteksi...</span>
              </>
            ) : (
              <>
                <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>GPS Otomatis</span>
              </>
            )}
          </button>
        </div>

        {gpsMessage && (
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium animate-fadeIn">
            {gpsMessage}
          </p>
        )}
      </div>

      {/* 2. KONDISI IKLIM & CUACA */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Parameter Iklim & Cuaca
          </span>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Musim */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Musim Saat Ini
            </label>
            <select
              value={formData.musim}
              onChange={(e) => onChange({ musim: e.target.value as Musim })}
              className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-[#0d1629] dark:hover:bg-[#111c33] focus:bg-white dark:focus:bg-[#0d1629] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium"
            >
              <option value="kemarau">Kemarau (Kering & Rawan)</option>
              <option value="pancaroba">Pancaroba (Peralihan)</option>
              <option value="hujan">Penghujan (Basah & Lembap)</option>
            </select>
          </div>

          {/* Curah Hujan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Curah Hujan
            </label>
            <select
              value={formData.curah_hujan}
              onChange={(e) => onChange({ curah_hujan: e.target.value as CurahHujan })}
              className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-[#0d1629] dark:hover:bg-[#111c33] focus:bg-white dark:focus:bg-[#0d1629] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium"
            >
              <option value="sangat_rendah">Sangat Rendah (&lt;5 mm / Kering)</option>
              <option value="rendah">Rendah (5 - 15 mm)</option>
              <option value="sedang">Sedang (15 - 30 mm)</option>
              <option value="tinggi">Tinggi (&gt;30 mm / Basah)</option>
            </select>
          </div>

          {/* Kecepatan Angin */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span>Kecepatan Angin</span>
            </label>
            <select
              value={formData.kecepatan_angin}
              onChange={(e) => onChange({ kecepatan_angin: e.target.value as KecepatanAngin })}
              className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-[#0d1629] dark:hover:bg-[#111c33] focus:bg-white dark:focus:bg-[#0d1629] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium"
            >
              <option value="rendah">Tenang (&lt; 10 km/jam)</option>
              <option value="sedang">Sedang (10 - 25 km/jam)</option>
              <option value="tinggi">Kencang (&gt; 25 km/jam - Waspada)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. KARAKTERISTIK WILAYAH & LAHAN */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Karakteristik Wilayah & Tutupan Lahan
          </span>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Jenis Lahan */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tipe & Lapisan Tanah
            </label>
            <select
              value={formData.jenis_lahan}
              onChange={(e) => onChange({ jenis_lahan: e.target.value as JenisLahan })}
              className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-[#0d1629] dark:hover:bg-[#111c33] focus:bg-white dark:focus:bg-[#0d1629] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all font-medium"
            >
              <option value="gambut">Lahan Gambut (Rawan Api Bawah Permukaan)</option>
              <option value="mineral">Tanah Mineral Biasa</option>
              <option value="semak">Semak Belukar / Alang-alang Kering</option>
              <option value="bekas_kebun">Bekas Kebun / Ladang Tua</option>
            </select>
          </div>

          {/* Luas Area Pantauan */}
          <div className="space-y-1.5 bg-slate-50/60 dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Trees className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Luas Area Pantauan</span>
              </label>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                {formData.luas_lahan_ha} Ha
              </span>
            </div>
            <input
              type="range"
              min="0.25"
              max="20"
              step="0.25"
              value={formData.luas_lahan_ha}
              onChange={(e) => onChange({ luas_lahan_ha: parseFloat(e.target.value) || 1 })}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>
        </div>

        {/* Kelembapan Udara & Vegetasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 bg-slate-50/60 dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 rounded-xl p-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Kelembapan Udara (RH)</span>
              </label>
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                {formData.kelembapan_udara}%
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="95"
              step="1"
              value={formData.kelembapan_udara}
              onChange={(e) => onChange({ kelembapan_udara: parseInt(e.target.value) || 50 })}
              className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kondisi Vegetasi / Serasah Kering
            </label>
            <input
              type="text"
              value={formData.kondisi_vegetasi || ''}
              onChange={(e) => onChange({ kondisi_vegetasi: e.target.value })}
              placeholder="Contoh: Semak pakis kawat dan serasah kering tebal"
              className="w-full px-3 py-2.5 bg-slate-50/70 hover:bg-slate-50 dark:bg-[#0d1629] dark:hover:bg-[#111c33] focus:bg-white dark:focus:bg-[#0d1629] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. PARAMETER LANJUTAN (COLLAPSIBLE, CLEAN & BLUE) */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full py-2.5 px-4 rounded-xl bg-blue-50/60 hover:bg-blue-50 dark:bg-[#152238] dark:hover:bg-[#1b2b47] text-xs font-semibold text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-slate-800 transition-all cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Parameter Tambahan (Kelembapan Tanah, Titik Panas & Alat)</span>
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-[#0d1629] border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  Kelembapan Permukaan Gambut / Tanah
                </label>
                <select
                  value={formData.kelembapan_tanah}
                  onChange={(e) => onChange({ kelembapan_tanah: e.target.value as KelembapanTanah })}
                  className="w-full px-3 py-2 bg-white dark:bg-[#152238] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 font-medium"
                >
                  <option value="kering_kritis">Kering Kritis (Muka air &lt;-40cm, retak)</option>
                  <option value="kering_sedang">Kering Sedang</option>
                  <option value="lembab">Lembap Normal</option>
                  <option value="basah">Basah / Tergenang</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Tractor className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Kapasitas Penanganan & Peralatan di Lokasi</span>
                </label>
                <input
                  type="text"
                  value={formData.ketersediaan_alat_anggaran || ''}
                  onChange={(e) => onChange({ ketersediaan_alat_anggaran: e.target.value })}
                  placeholder="Contoh: Pompa air apung, parang, regu MPA/Damkar desa, swadaya"
                  className="w-full px-3 py-2 bg-white dark:bg-[#152238] border border-slate-200 dark:border-slate-700/60 rounded-xl text-xs text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5 bg-white dark:bg-[#152238] border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Hotspot Terpantau (Radius 10 km)</span>
                  </label>
                  <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                    {formData.histori_titik_panas_10km} titik
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={formData.histori_titik_panas_10km}
                  onChange={(e) => onChange({ histori_titik_panas_10km: parseInt(e.target.value) || 0 })}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </div>

              <div className="space-y-1.5 bg-white dark:bg-[#152238] border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Jarak Sumber Api Terdekat
                  </label>
                  <span className="font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-900/40">
                    {formData.jarak_sumber_api_km !== null ? `${formData.jarak_sumber_api_km} km` : 'Aman'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={formData.jarak_sumber_api_km || 5}
                  onChange={(e) => onChange({ jarak_sumber_api_km: parseFloat(e.target.value) || 1 })}
                  className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. ACTION SUBMIT BUTTON (CONSISTENT BLUE GRADIENT) */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-white text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Memproses Analisis Parameter...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-sky-200 animate-pulse" />
            <span>Simpan Parameter & Jalankan Analisis AI</span>
          </>
        )}
      </button>
    </form>
  );
};
