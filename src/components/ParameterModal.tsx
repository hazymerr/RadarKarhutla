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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Sesuaikan Parameter Analisis AI
              </h3>
              <p className="text-xs text-slate-400">
                Ubah kondisi cuaca, vegetasi gambut, dan data lahan pertanian
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
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
