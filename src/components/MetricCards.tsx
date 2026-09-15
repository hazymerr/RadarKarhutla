import React from 'react';
import { Wind, CloudRain, Flame, Layers } from 'lucide-react';
import { FormInput, HasilAnalisis } from '../types.ts';

interface MetricCardsProps {
  formData: FormInput;
  hasil: HasilAnalisis;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ formData, hasil }) => {
  // Determine wind speed in km/h based on category
  const getWindSpeed = () => {
    switch (formData.kecepatan_angin) {
      case 'kencang':
        return '28 km/h';
      case 'sedang':
        return '16 km/h';
      default:
        return '8 km/h';
    }
  };

  // Determine rain probability
  const getRainChance = () => {
    switch (formData.curah_hujan) {
      case 'lebat':
        return { pct: '85%', label: 'Tinggi', ring: 'stroke-blue-500' };
      case 'sedang':
        return { pct: '50%', label: 'Sedang', ring: 'stroke-sky-400' };
      case 'sedikit':
        return { pct: '20%', label: 'Rendah', ring: 'stroke-amber-400' };
      default:
        return { pct: '5%', label: 'Kering', ring: 'stroke-red-500' };
    }
  };

  // Peatland vulnerability
  const getPeatVulnerability = () => {
    if (formData.jenis_lahan === 'gambut') {
      return { level: 'Ekstrem', desc: 'Bahan bakar tebal', color: 'text-red-600', arc: '#ef4444' };
    } else if (formData.jenis_lahan === 'semak') {
      return { level: 'Tinggi', desc: 'Serasah kering', color: 'text-orange-600', arc: '#f97316' };
    } else {
      return { level: 'Sedang', desc: 'Tanah mineral', color: 'text-emerald-600', arc: '#10b981' };
    }
  };

  const rainInfo = getRainChance();
  const peatInfo = getPeatVulnerability();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. Wind Card matching photo with Compass Rose */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Wind className="w-3.5 h-3.5 text-slate-400" />
            <span>Kecepatan Angin</span>
          </div>
          <p className="text-[11px] text-slate-400">Arah rambat api</p>
          <div className="text-2xl font-bold text-slate-800 pt-2">
            {getWindSpeed()}
          </div>
        </div>

        {/* Circular Compass Rose (N, W, E, S) */}
        <div className="w-16 h-16 rounded-full border border-slate-200 relative flex items-center justify-center bg-slate-50/50">
          <span className="absolute top-1 text-[9px] font-bold text-slate-400">N</span>
          <span className="absolute bottom-1 text-[9px] font-bold text-slate-400">S</span>
          <span className="absolute left-1.5 text-[9px] font-bold text-slate-400">W</span>
          <span className="absolute right-1.5 text-[9px] font-bold text-slate-400">E</span>
          {/* Compass Needle */}
          <div 
            className="w-8 h-0.5 bg-blue-600 rounded-full transform rotate-45 relative shadow-xs"
            style={{
              transform: formData.kecepatan_angin === 'kencang' ? 'rotate(65deg)' : 'rotate(35deg)'
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600 absolute right-0 -top-0.5" />
          </div>
          <div className="w-2 h-2 rounded-full bg-slate-800 absolute" />
        </div>
      </div>

      {/* 2. Rain Chance / Kelembapan matching photo with Circular Ring */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <CloudRain className="w-3.5 h-3.5 text-slate-400" />
            <span>Peluang Hujan</span>
          </div>
          <p className="text-[11px] text-slate-400">Kelembapan udara</p>
          <div className="text-2xl font-bold text-slate-800 pt-2">
            {rainInfo.pct}
          </div>
        </div>

        {/* Circular Ring Progress with Text inside */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#f1f5f9"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray="100"
              strokeDashoffset={100 - parseInt(rainInfo.pct)}
              strokeLinecap="round"
              fill="none"
              className="transition-all duration-500"
            />
          </svg>
          <span className="absolute text-[10px] font-bold text-slate-600">
            {rainInfo.label}
          </span>
        </div>
      </div>

      {/* 3. Titik Panas Hotspot / Dial Gauge matching photo Pressure gauge */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Flame className="w-3.5 h-3.5 text-slate-400" />
            <span>Titik Panas</span>
          </div>
          <p className="text-[11px] text-slate-400">Radius 10 km (30 hr)</p>
          <div className="text-2xl font-bold text-slate-800 pt-2">
            {formData.riwayat_titik_panas_30hari} <span className="text-xs font-normal text-slate-400">titik</span>
          </div>
        </div>

        {/* Dial meter needle */}
        <div className="w-16 h-16 rounded-full border border-slate-200 relative flex items-center justify-center bg-slate-50/50">
          <div 
            className="w-8 h-0.5 bg-orange-600 rounded-full transform -rotate-45 relative origin-right"
            style={{
              transform: `rotate(${Math.min(90, (formData.riwayat_titik_panas_30hari / 15) * 180 - 90)}deg)`
            }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800 absolute" />
          <span className="absolute bottom-1.5 text-[8px] font-bold text-slate-400">
            {formData.jarak_sumber_api_km} km
          </span>
        </div>
      </div>

      {/* 4. Kerentanan Gambut / Semicircle Arc matching photo UV Index */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Kerentanan Lahan</span>
          </div>
          <p className="text-[11px] text-slate-400">{formData.jenis_lahan.toUpperCase()}</p>
          <div className="text-xl font-bold text-slate-800 pt-2">
            {peatInfo.level}
          </div>
        </div>

        {/* Half arc meter matching UV Index in photo */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke="#f1f5f9"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="20"
              cy="20"
              r="16"
              stroke={peatInfo.arc}
              strokeWidth="4"
              strokeDasharray="60 100"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <span className={`absolute text-[10px] font-bold ${peatInfo.color}`}>
            {formData.jenis_lahan === 'gambut' ? 'Gambut' : 'Mineral'}
          </span>
        </div>
      </div>

    </div>
  );
};
