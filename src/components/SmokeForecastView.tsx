import React, { useState, useMemo } from 'react';
import { FormInput, HasilAnalisis } from '../types.ts';
import { 
  Wind, 
  CloudFog, 
  ArrowLeft, 
  Sliders, 
  Eye, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sprout, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin
} from 'lucide-react';
import { FarmerAdvisoryCard } from './FarmerAdvisoryCard.tsx';

interface SmokeForecastViewProps {
  formData: FormInput;
  hasil: HasilAnalisis;
  onBackToDashboard: () => void;
  onOpenParams: () => void;
  onGoToMap: () => void;
}

interface DayForecast {
  dayIndex: number;
  dayLabel: string;
  dateStr: string;
  percentRemaining: number;
  category: string;
  colorClass: string;
  bgClass: string;
  barColor: string;
  summary: string;
  actionTip: string;
}

export const SmokeForecastView: React.FC<SmokeForecastViewProps> = ({
  formData,
  hasil,
  onBackToDashboard,
  onOpenParams,
  onGoToMap,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [showPltbAccordion, setShowPltbAccordion] = useState(false);

  // 1. Current atmospheric telemetry
  const riskScore = hasil.skor_risiko || 50;
  const fireDist = formData.jarak_sumber_api_km ?? 15;

  let ispuScore = Math.round(riskScore * 2.2 + (fireDist < 5 ? 40 : (fireDist < 10 ? 15 : 0)));
  ispuScore = Math.min(380, Math.max(25, ispuScore));

  let ispuCategory = 'SEDANG';
  let ispuColor = 'text-amber-600';
  let ispuBg = 'bg-amber-50 border-amber-200';
  let pm25 = Math.round(ispuScore * 0.65);
  let visibility = '6 - 9 km';
  let healthSummary = 'Kualitas udara sedang. Kelompok sensitif sebaiknya mengurangi aktivitas fisik di luar ruangan.';

  if (ispuScore > 200) {
    ispuCategory = 'SANGAT TIDAK SEHAT';
    ispuColor = 'text-rose-600';
    ispuBg = 'bg-rose-50 border-rose-200';
    visibility = '< 1.5 km';
    healthSummary = 'Bahaya kabut asap tebal! Wajib gunakan masker N95 dan tutup seluruh celah ventilasi.';
  } else if (ispuScore > 100) {
    ispuCategory = 'TIDAK SEHAT';
    ispuColor = 'text-orange-600';
    ispuBg = 'bg-orange-50 border-orange-200';
    visibility = '2 - 4 km';
    healthSummary = 'Udara berbau sangit dan berkabut. Anak-anak dan lansia dianjurkan tetap berada di dalam rumah.';
  } else if (ispuScore <= 50) {
    ispuCategory = 'BAIK';
    ispuColor = 'text-emerald-600';
    ispuBg = 'bg-emerald-50 border-emerald-200';
    visibility = '> 10 km';
    healthSummary = 'Udara bersih dan jarak pandang jernih. Aman untuk beraktivitas normal di luar ruangan.';
  }

  // 2. Compute 1 - 5 Day Forecast (% Smoke Remaining)
  const fiveDayForecast: DayForecast[] = useMemo(() => {
    const list: DayForecast[] = [];
    const now = new Date();
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    // Dispersion decay speed based on rain and wind
    let dailyDecay = 18; // default percentage drop per day
    if (formData.curah_hujan === 'tinggi') dailyDecay = 25;
    else if (formData.curah_hujan === 'rendah') dailyDecay = 14;
    if (formData.kecepatan_angin === 'kencang') dailyDecay += 4;

    // Starting baseline % on Day 1
    let basePercent = Math.min(95, Math.max(40, Math.round(riskScore * 0.95 + 15)));

    for (let i = 1; i <= 5; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(now.getDate() + i);

      const dayLabel = i === 1 ? 'Besok (Hari 1)' : i === 2 ? 'Lusa (Hari 2)' : `Hari ke-${i}`;
      const dateStr = `${dayNames[targetDate.getDay()]}, ${targetDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`;

      // Calculate percentage remaining
      let pct = Math.max(5, Math.round(basePercent - (i - 1) * dailyDecay));

      let cat = 'Ringan';
      let colorClass = 'text-emerald-600';
      let bgClass = 'bg-emerald-50 border-emerald-200';
      let barColor = 'bg-emerald-500';
      let summary = 'Kabut asap hampir hilang. Kualitas udara pulih jernih.';
      let actionTip = 'Aktivitas luar ruangan aman dijalankan secara normal.';

      if (pct >= 75) {
        cat = 'Sangat Pekat';
        colorClass = 'text-rose-700';
        bgClass = 'bg-rose-50 border-rose-200';
        barColor = 'bg-rose-600';
        summary = 'Asap masih pekat menyelimuti pemukiman warga, terutama pagi hari.';
        actionTip = 'Gunakan masker N95 bila terpaksa keluar, tutup rapat jendela.';
      } else if (pct >= 50) {
        cat = 'Pekat Sedang';
        colorClass = 'text-orange-700';
        bgClass = 'bg-orange-50 border-orange-200';
        barColor = 'bg-orange-500';
        summary = 'Hembusan angin mulai memecah partikulat asap, bau sangit masih terasa.';
        actionTip = 'Batasi aktivitas fisik berat di luar bagi anak dan lansia.';
      } else if (pct >= 25) {
        cat = 'Mulai Menipis';
        colorClass = 'text-amber-700';
        bgClass = 'bg-amber-50 border-amber-200';
        barColor = 'bg-amber-500';
        summary = 'Jarak pandang meningkat signifikan, sisa kabut tipis di udara.';
        actionTip = 'Buka ventilasi saat siang hari jika udara terasa lebih segar.';
      }

      list.push({
        dayIndex: i,
        dayLabel,
        dateStr,
        percentRemaining: pct,
        category: cat,
        colorClass,
        bgClass,
        barColor,
        summary,
        actionTip,
      });
    }

    return list;
  }, [riskScore, formData.curah_hujan, formData.kecepatan_angin]);

  const activeDay = fiveDayForecast.find(d => d.dayIndex === selectedDayIndex) || fiveDayForecast[0];

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-10">
      
      {/* 1. Header Minimalis & Navigasi */}
      <div className="bg-white dark:bg-[#152238] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">&bull;</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
              <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <strong className="text-slate-700 dark:text-slate-200">{formData.lokasi}</strong>
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <CloudFog className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <span>Prediksi Kabut Asap</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Prakiraan persentase sisa kabut asap dan kualitas udara hingga 5 hari ke depan.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onGoToMap}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Lihat di Peta</span>
          </button>
          <button
            type="button"
            onClick={onOpenParams}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0d1629] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Parameter</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Card: Status Kualitas Udara Saat Ini (Bersih & Mudah Dipahami) */}
      <div className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border ${ispuBg} dark:bg-[#152238] dark:border-slate-800 shadow-xs bg-white transition-colors`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-1">
              Kondisi Udara Hari Ini
            </span>
            <div className="flex items-baseline gap-3">
              <span className={`text-4xl sm:text-5xl font-black ${ispuColor}`}>
                {ispuScore}
              </span>
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${ispuBg} ${ispuColor} dark:bg-slate-900/60 dark:border-slate-700`}>
                  {ispuCategory}
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">Skala ISPU (0-500)</p>
              </div>
            </div>
          </div>

          {/* Clean Metric Chips */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0d1629] border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-medium">Partikel PM2.5</span>
              <strong className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-bold">{pm25} &micro;g/m&sup3;</strong>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0d1629] border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-medium">Jarak Pandang</span>
              <strong className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-bold">{visibility}</strong>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0d1629] border border-slate-100 dark:border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-medium">Angin Permukaan</span>
              <strong className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-bold capitalize">{formData.kecepatan_angin}</strong>
            </div>
          </div>
        </div>

        <div className="pt-3 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
          <AlertTriangle className={`w-4 h-4 shrink-0 ${ispuColor}`} />
          <span>{healthSummary}</span>
        </div>
      </div>

      {/* 3. FITUR UTAMA: Prediksi Kabut Asap 1-2-3-4-5 Hari Kedepan (% Asap Tersisa) */}
      <div className="bg-white dark:bg-[#152238] p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Prediksi Kabut Asap 5 Hari ke Depan</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prakiraan persentase (%) kabut asap yang masih tersisa di wilayah Anda setiap harinya:
            </p>
          </div>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg self-start sm:self-auto border border-blue-100 dark:border-blue-900/40">
            Klik kartu untuk melihat detail hari
          </span>
        </div>

        {/* 5-Day Interactive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {fiveDayForecast.map((day) => {
            const isSelected = day.dayIndex === selectedDayIndex;
            return (
              <button
                key={day.dayIndex}
                type="button"
                onClick={() => setSelectedDayIndex(day.dayIndex)}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 relative ${
                  isSelected 
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50/40 dark:bg-blue-950/40 shadow-sm ring-2 ring-blue-500/20' 
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0d1629] hover:border-blue-300 dark:hover:border-blue-600/60 hover:bg-slate-50/50 dark:hover:bg-[#131e33]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                      {day.dayLabel}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 block mb-2">
                    {day.dateStr}
                  </span>

                  {/* Percentage Remaining Display */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className={`text-xl font-black tracking-tight ${day.colorClass}`}>
                        {day.percentRemaining}%
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                        Sisa Asap
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${day.barColor}`}
                        style={{ width: `${day.percentRemaining}%` }}
                      />
                    </div>
                  </div>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md self-start border ${day.bgClass} ${day.colorClass} dark:bg-slate-900/60 dark:border-slate-700`}>
                  {day.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Day Detail Banner (Clean & Informative) */}
        <div className={`p-4 rounded-2xl border ${activeDay.bgClass} dark:bg-[#0d1629] dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn`}>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900 dark:text-white">
                Detail {activeDay.dayLabel} ({activeDay.dateStr}):
              </span>
              <span className={`text-xs font-bold ${activeDay.colorClass}`}>
                {activeDay.percentRemaining}% Asap Tersisa &bull; {activeDay.category}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeDay.summary}
            </p>
          </div>

          <div className="bg-white/90 dark:bg-[#152238] backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 shrink-0 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span><strong>Saran Warga:</strong> {activeDay.actionTip}</span>
          </div>
        </div>
      </div>

      {/* 4. Tiga Langkah Proteksi Warga (Minimalis, Tidak Menumpuk) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-3 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100 dark:border-blue-900/40">
            1
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Gunakan Masker N95</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Masker kain tidak menyaring PM2.5. Pakai masker standar N95 saat ke luar rumah.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-3 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 border border-sky-100 dark:border-sky-900/40">
            2
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tutup Celah Ventilasi</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tutup jendela dan gunakan kain basah di bawah pintu untuk menahan asap masuk.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#152238] border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-start gap-3 transition-colors">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 border border-rose-100 dark:border-rose-900/40">
            3
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Akses Posko Kesehatan</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Segera ke puskesmas/posko oksigen jika mengalami batuk berulang atau sesak napas.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Solusi di Kebun (PLTB) - Dibuat Rapi dalam Akordeon agar Tidak Crowded */}
      <div className="bg-white dark:bg-[#152238] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <button
          type="button"
          onClick={() => setShowPltbAccordion(!showPltbAccordion)}
          className="w-full p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/50 dark:border-emerald-800/40">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Pencegahan Asap di Kebun: Panduan Olah Lahan Tanpa Bakar (PLTB)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hentikan kabut asap dari sumbernya dengan metode cacah kompos atau mekanis.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold shrink-0">
            <span>{showPltbAccordion ? 'Tutup' : 'Lihat'}</span>
            {showPltbAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showPltbAccordion && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0d1629]/50">
            <FarmerAdvisoryCard
              rekomendasi={hasil.rekomendasi_petani}
              jenisLahan={formData.jenis_lahan}
              luasHa={formData.luas_lahan_ha}
            />
          </div>
        )}
      </div>

    </div>
  );
};
