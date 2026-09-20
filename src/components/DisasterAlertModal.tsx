import React from 'react';
import { 
  X, 
  Flame, 
  Wind, 
  ShieldAlert, 
  PhoneCall, 
  AlertTriangle, 
  Bell, 
  CheckCircle2, 
  Radio, 
  HeartHandshake,
  MapPin
} from 'lucide-react';
import { FormInput, HasilAnalisis } from '../types.ts';

interface DisasterAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormInput;
  hasil: HasilAnalisis | null;
  onGoToMap: () => void;
}

export const DisasterAlertModal: React.FC<DisasterAlertModalProps> = ({
  isOpen,
  onClose,
  formData,
  hasil,
  onGoToMap,
}) => {
  if (!isOpen) return null;

  const skor = hasil?.skor_risiko || 50;
  const kategori = hasil?.kategori_risiko || 'SEDANG';
  const isSevere = kategori === 'SANGAT TINGGI' || kategori === 'TINGGI';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#0e172e] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 relative space-y-4 text-slate-800 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/40 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                <span>Pusat Peringatan & Siaga Karhutla</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>{formData.lokasi}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Threat Status Pill */}
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
          isSevere
            ? 'bg-red-50/80 dark:bg-red-950/30 border-red-200 dark:border-red-500/30 text-red-950 dark:text-red-200'
            : 'bg-blue-50/80 dark:bg-blue-950/30 border-blue-200 dark:border-blue-500/30 text-blue-950 dark:text-blue-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 ${
              isSevere ? 'bg-red-600' : 'bg-blue-600'
            }`}>
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold block">Status Bahaya Karhutla: {kategori}</span>
              <span className="text-[11px] opacity-80 block">
                Skor Indeks Risiko: <strong>{skor}/100</strong> &bull; {formData.histori_titik_panas_10km} Hotspot radius 10 km
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToMap();
            }}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-[#152238] hover:bg-slate-50 dark:hover:bg-[#1c2d4a] text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            Peta Api &rarr;
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-3 text-xs">
          {/* Alert 1: Asap & Kualitas Udara */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Wind className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Peringatan Kabut Asap & Kualitas Udara (ISPU)</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
              {isSevere
                ? 'Angin kencang dan cuaca kering berpotensi membawa kepulan kabut asap tebal ke arah pemukiman. Disarankan mengenakan masker standar (N95/KN95), membatasi aktivitas luar ruangan anak-anak dan lansia, serta menutup ventilasi rumah.'
                : 'Kualitas udara saat ini relatif stabil. Tetap waspadai potensi asap kiriman jika terjadi kenaikan suhu permukaan tanah gambut.'}
            </p>
          </div>

          {/* Alert 2: Larangan dan Himbauan Lapangan */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Himbauan & Larangan Bencana Karhutla</span>
            </div>
            <ul className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px] space-y-1 list-disc pl-4">
              <li><strong>Dilarang keras menyalakan api terbuka</strong> di semak belukar, serasah daun, dan lahan gambut kering.</li>
              <li>Jangan membuang puntung rokok sembarangan di tepi jalan perkebunan atau semak kering.</li>
              <li>Pastikan sumber air pompa, parit sekat, atau embung desa selalu terisi dan dapat diakses regu pemadam.</li>
            </ul>
          </div>

          {/* Alert 3: Nomor Tanggap Darurat Bencana */}
          <div className="p-3.5 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/80 dark:border-red-500/30 space-y-2">
            <div className="flex items-center justify-between font-bold text-red-900 dark:text-red-300">
              <span className="flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Kontak Cepat Tanggap Darurat Kebakaran</span>
              </span>
              <span className="text-[10px] bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-full border border-red-200/60 dark:border-red-700/50">24 Jam</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <a
                href="tel:1500244"
                className="p-2 rounded-lg bg-white dark:bg-[#0e172e] border border-red-200 dark:border-red-800/60 text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-between transition-colors font-semibold"
              >
                <span>Posko KLHK</span>
                <span className="text-red-600 dark:text-red-400 font-bold">1500-244</span>
              </a>
              <a
                href="tel:117"
                className="p-2 rounded-lg bg-white dark:bg-[#0e172e] border border-red-200 dark:border-red-800/60 text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-between transition-colors font-semibold"
              >
                <span>Pusdalops BNPB</span>
                <span className="text-red-600 dark:text-red-400 font-bold">117</span>
              </a>
              <a
                href="tel:113"
                className="p-2 rounded-lg bg-white dark:bg-[#0e172e] border border-red-200 dark:border-red-800/60 text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-between transition-colors font-semibold"
              >
                <span>Damkar Darat</span>
                <span className="text-red-600 dark:text-red-400 font-bold">113</span>
              </a>
              <a
                href="tel:112"
                className="p-2 rounded-lg bg-white dark:bg-[#0e172e] border border-red-200 dark:border-red-800/60 text-slate-800 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-between transition-colors font-semibold"
              >
                <span>Call Center Terpadu</span>
                <span className="text-red-600 dark:text-red-400 font-bold">112</span>
              </a>
            </div>
          </div>
        </div>

        {/* Action button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Mengerti & Tutup
        </button>
      </div>
    </div>
  );
};
