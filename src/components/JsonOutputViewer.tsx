import React, { useState } from 'react';
import { HasilAnalisis } from '../types.ts';
import { Code, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface JsonOutputViewerProps {
  hasil: HasilAnalisis;
}

export const JsonOutputViewer: React.FC<JsonOutputViewerProps> = ({ hasil }) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const exactSchemaJson = {
    skor_risiko: hasil.skor_risiko,
    kategori_risiko: hasil.kategori_risiko,
    alasan_risiko: hasil.alasan_risiko,
    asumsi: hasil.asumsi,
    peringatan_keselamatan: hasil.peringatan_keselamatan,
    rekomendasi_petani: {
      metode_utama: hasil.rekomendasi_petani.metode_utama,
      penjelasan: hasil.rekomendasi_petani.penjelasan,
      estimasi_biaya_relatif: hasil.rekomendasi_petani.estimasi_biaya_relatif,
      estimasi_waktu: hasil.rekomendasi_petani.estimasi_waktu,
      alternatif_lain: hasil.rekomendasi_petani.alternatif_lain,
    },
  };

  const jsonString = JSON.stringify(exactSchemaJson, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-5 py-3 bg-stone-50 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-bold text-stone-700 uppercase tracking-wider hover:text-stone-900 transition-colors cursor-pointer"
        >
          <Code className="w-4 h-4 text-orange-600" />
          <span>Format Output JSON Resmi Sistem</span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-stone-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-stone-500" />
          )}
        </button>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors cursor-pointer shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-stone-500" />
              <span>Salin JSON</span>
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 bg-stone-900 font-mono text-xs text-amber-200 overflow-x-auto max-h-80">
          <pre>{jsonString}</pre>
        </div>
      )}
    </div>
  );
};
