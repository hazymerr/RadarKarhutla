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
  Activity,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface RiskAnalysisFormProps {
  formData: FormInput;
  onChange: (updated: Partial<FormInput>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const RiskAnalysisForm: React.FC<RiskAnalysisFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Form Header */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-orange-600" />
            Parameter Lapangan
          </h2>
          <p className="text-xs text-stone-500">
            Sesuaikan kondisi aktual lokasi dan rencana pengolahan lahan
          </p>
        </div>
        <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
          Input Sederhana
        </span>
      </div>

      {/* Primary Essential Inputs */}
      <div className="space-y-4">
        {/* Lokasi */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Lokasi Pengamatan (Desa / Kecamatan / Kabupaten)
          </label>
          <input
            type="text"
            value={formData.lokasi}
            onChange={(e) => onChange({ lokasi: e.target.value })}
            placeholder="Contoh: Desa Sepahat, Bengkalis, Riau"
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
            required
          />
        </div>

        {/* 2-Column: Musim & Jenis Lahan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Musim Saat Ini
            </label>
            <select
              value={formData.musim}
              onChange={(e) => onChange({ musim: e.target.value as Musim })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="kemarau">Kemarau (Kering / Rawan Api)</option>
              <option value="pancaroba">Pancaroba (Peralihan)</option>
              <option value="hujan">Penghujan (Basah / Lembap)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-orange-600" />
              Jenis Lahan
            </label>
            <select
              value={formData.jenis_lahan}
              onChange={(e) => onChange({ jenis_lahan: e.target.value as JenisLahan })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 font-medium"
            >
              <option value="gambut">Lahan Gambut (Rawan Api Bawah Tanah)</option>
              <option value="mineral">Tanah Mineral Biasa</option>
              <option value="semak">Semak Belukar / Alang-alang</option>
              <option value="bekas_kebun">Bekas Kebun / Ladang Tua</option>
            </select>
          </div>
        </div>

        {/* 2-Column: Curah Hujan & Kecepatan Angin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <CloudRain className="w-3.5 h-3.5 text-blue-500" />
              Kondisi Curah Hujan
            </label>
            <select
              value={formData.curah_hujan}
              onChange={(e) => onChange({ curah_hujan: e.target.value as CurahHujan })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="kering">Kering / Tidak Hujan (&gt;7 hari)</option>
              <option value="sedikit">Sedikit / Gerimis Sporadis</option>
              <option value="sedang">Sedang (Ada hujan selang-seling)</option>
              <option value="lebat">Lebat (Hampir setiap hari)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-cyan-600" />
              Kecepatan Angin
            </label>
            <select
              value={formData.kecepatan_angin}
              onChange={(e) => onChange({ kecepatan_angin: e.target.value as KecepatanAngin })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="tenang">Tenang (&lt; 10 km/jam)</option>
              <option value="sedang">Sedang (10 - 25 km/jam)</option>
              <option value="kencang">Kencang (&gt; 25 km/jam - bahaya)</option>
            </select>
          </div>
        </div>

        {/* Luas Lahan & Anggaran */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <Trees className="w-3.5 h-3.5 text-emerald-600" />
              Luas Lahan: <span className="font-bold text-stone-900">{formData.luas_lahan_ha} Ha</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0.25"
                max="20"
                step="0.25"
                value={formData.luas_lahan_ha}
                onChange={(e) => onChange({ luas_lahan_ha: parseFloat(e.target.value) || 1 })}
                className="w-full accent-orange-600 cursor-pointer"
              />
              <span className="text-xs font-semibold text-stone-600 min-w-[45px] text-right">
                {formData.luas_lahan_ha} Ha
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
              <Tractor className="w-3.5 h-3.5 text-amber-600" />
              Ketersediaan Alat Petani
            </label>
            <select
              value={formData.ketersediaan_alat}
              onChange={(e) => onChange({ ketersediaan_alat: e.target.value as any })}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            >
              <option value="manual_saja">Manual (Parang, Cangkul, Sabit)</option>
              <option value="ada_mesin_kecil">Mesin Pencacah / Chainsaw Kecil</option>
              <option value="akses_alat_berat">Akses Traktor / Eskavator Mini</option>
            </select>
          </div>
        </div>
      </div>

      {/* Advanced Toggle for Kelembapan, Hotspot, Jarak Api, Anggaran */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full py-2 px-3 rounded-xl bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-600 border border-stone-200 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-stone-500" />
            Parameter Tambahan (Titik Panas & Kelembapan Tanah)
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-3 p-4 rounded-xl bg-stone-50/70 border border-stone-200 space-y-3.5 animate-fadeIn text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Kelembapan Permukaan Tanah
                </label>
                <select
                  value={formData.kelembapan_tanah}
                  onChange={(e) => onChange({ kelembapan_tanah: e.target.value as KelembapanTanah })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                >
                  <option value="sangat_kering">Sangat Kering (Retak / Serasah rapuh)</option>
                  <option value="kering">Kering</option>
                  <option value="lembab">Lembap</option>
                  <option value="basah">Basah / Tergenang</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Kemampuan Anggaran Petani
                </label>
                <select
                  value={formData.anggaran_petani}
                  onChange={(e) => onChange({ anggaran_petani: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs text-stone-900"
                >
                  <option value="sangat_terbatas">Sangat Terbatas (Swadaya Mandiri)</option>
                  <option value="sedang">Sedang (Bisa beli dekomposer/sewa)</option>
                  <option value="cukup">Cukup (Bisa pengolahan mekanis)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>Titik Panas (Hotspot 30 hari)</span>
                  <span className="font-bold text-orange-600">{formData.riwayat_titik_panas_30hari} titik</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={formData.riwayat_titik_panas_30hari}
                  onChange={(e) => onChange({ riwayat_titik_panas_30hari: parseInt(e.target.value) || 0 })}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1 flex items-center justify-between">
                  <span>Jarak Sumber Api Terdekat</span>
                  <span className="font-bold text-orange-600">{formData.jarak_sumber_api_km} km</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="30"
                  step="0.5"
                  value={formData.jarak_sumber_api_km}
                  onChange={(e) => onChange({ jarak_sumber_api_km: parseFloat(e.target.value) || 1 })}
                  className="w-full accent-orange-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prominent AI Action Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3.5 px-6 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-700 hover:to-amber-700 transition-all duration-200 shadow-md hover:shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            <span>AI Sedang Menganalisis Kondisi 7 Hari...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-amber-200 animate-pulse" />
            <span>Jalankan Analisis Risiko AI & Solusi PLTB</span>
          </>
        )}
      </button>
    </form>
  );
};
