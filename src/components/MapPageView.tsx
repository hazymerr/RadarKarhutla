import React from 'react';
import { RegionHeatmapMap } from './RegionHeatmapMap.tsx';
import { FormInput, HasilAnalisis } from '../types.ts';

interface MapPageViewProps {
  formData: FormInput;
  hasil: HasilAnalisis;
  onBackToDashboard: () => void;
  onOpenPLTB: () => void;
  onOpenAlerts?: () => void;
  onUpdateFormData?: (updated: Partial<FormInput>) => void;
  onSelectPreset?: (preset: FormInput) => void;
  activePresetId?: string;
}

export const MapPageView: React.FC<MapPageViewProps> = ({
  formData,
  hasil,
  onBackToDashboard,
  onOpenPLTB,
  onOpenAlerts,
  onUpdateFormData,
  onSelectPreset,
  activePresetId,
}) => {
  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-100">
      <RegionHeatmapMap
        formData={formData}
        hasil={hasil}
        onUpdateFormData={onUpdateFormData}
        isFullMapMode={true}
        onOpenPLTB={onOpenPLTB}
        onOpenAlerts={onOpenAlerts}
        onSelectPreset={onSelectPreset}
        activePresetId={activePresetId}
      />
    </div>
  );
};
