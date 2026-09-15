import React from 'react';
import { FormInput } from '../types.ts';
import { RiskAnalysisForm } from './RiskAnalysisForm.tsx';
import { X, SlidersHorizontal, Sparkles } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl p-4 sm:p-6 relative space-y-3 sm:space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-800 truncate">
                Sesuaikan Parameter Lahan
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                Kondisi cuaca, lahan gambut & vegetasi
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Reusable Form */}
        <RiskAnalysisForm
          formData={formData}
          onChange={onChange}
          onSubmit={(e) => {
            onSubmit(e);
            onClose();
          }}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
