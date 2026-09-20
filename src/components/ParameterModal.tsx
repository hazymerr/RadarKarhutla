import React from 'react';
import { FormInput } from '../types.ts';
import { RiskAnalysisForm } from './RiskAnalysisForm.tsx';
import { X, SlidersHorizontal } from 'lucide-react';

interface ParameterModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormInput;
  onChange: (updated: Partial<FormInput>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ParameterModal: React.FC<ParameterModalProps> = ({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  isLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-[#0e172e] border border-slate-200/90 dark:border-slate-800 rounded-2xl sm:rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl p-5 sm:p-7 relative space-y-5 text-slate-800 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100/80 dark:border-blue-900/40 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                Sesuaikan Parameter Lapangan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Konfigurasi cuaca mikro, kondisi gambut, dan kapasitas lahan
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

        {/* Spacious, uncrowded Form */}
        <RiskAnalysisForm
          formData={formData}
          onChange={onChange}
          onSubmit={(e) => {
            onSubmit(e);
            onClose();
          }}
          isLoading={isLoading}
          isModal={true}
        />
      </div>
    </div>
  );
};
