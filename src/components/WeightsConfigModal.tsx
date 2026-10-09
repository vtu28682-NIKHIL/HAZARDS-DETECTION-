import React, { useState } from 'react';
import {
  X,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Check,
  Info
} from 'lucide-react';
import { ScoringWeights } from '../types/disaster';
import { DEFAULT_WEIGHTS } from '../services/priorityEngine';

interface WeightsConfigModalProps {
  weights: ScoringWeights;
  onSaveWeights: (newWeights: ScoringWeights) => void;
  onClose: () => void;
}

export const WeightsConfigModal: React.FC<WeightsConfigModalProps> = ({
  weights,
  onSaveWeights,
  onClose
}) => {
  const [currentWeights, setCurrentWeights] = useState<ScoringWeights>({ ...weights });

  const total =
    currentWeights.hazardSeverity +
    currentWeights.populationExposure +
    currentWeights.communityVulnerability +
    currentWeights.urgency +
    currentWeights.criticalInfrastructure;

  const handleChange = (key: keyof ScoringWeights, value: number) => {
    setCurrentWeights((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const applyPreset = (preset: ScoringWeights) => {
    setCurrentWeights(preset);
  };

  const handleSave = () => {
    onSaveWeights(currentWeights);
    onClose();
  };

  const handleReset = () => {
    setCurrentWeights({ ...DEFAULT_WEIGHTS });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-6 text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Configure Priority Scoring Formula
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Customize factor weights to adapt response prioritization to local doctrine. The engine normalizes all values transparently.
        </p>

        {/* Presets */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Tactical Presets
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => applyPreset(DEFAULT_WEIGHTS)}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-slate-700 transition-colors"
            >
              <span className="font-semibold text-white block">Default Balanced</span>
              <span className="text-[10px] text-slate-400">30% Hazard · 25% Pop · 20% Vuln</span>
            </button>
            <button
              onClick={() => applyPreset({
                hazardSeverity: 20,
                populationExposure: 25,
                communityVulnerability: 35,
                urgency: 10,
                criticalInfrastructure: 10
              })}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-slate-700 transition-colors"
            >
              <span className="font-semibold text-white block">Humanitarian Focus</span>
              <span className="text-[10px] text-slate-400">35% Vulnerability · 25% Pop</span>
            </button>
            <button
              onClick={() => applyPreset({
                hazardSeverity: 25,
                populationExposure: 15,
                communityVulnerability: 15,
                urgency: 15,
                criticalInfrastructure: 30
              })}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-slate-700 transition-colors"
            >
              <span className="font-semibold text-white block">Infrastructure Defense</span>
              <span className="text-[10px] text-slate-400">30% Critical Utilities Impact</span>
            </button>
            <button
              onClick={() => applyPreset({
                hazardSeverity: 35,
                populationExposure: 20,
                communityVulnerability: 15,
                urgency: 20,
                criticalInfrastructure: 10
              })}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-left hover:border-slate-700 transition-colors"
            >
              <span className="font-semibold text-white block">Rapid Flash Onset</span>
              <span className="text-[10px] text-slate-400">35% Severity · 20% Urgency</span>
            </button>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          {/* Hazard Severity */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-slate-300">Hazard Severity</span>
              <span className="font-mono text-rose-400 font-bold">{currentWeights.hazardSeverity}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={currentWeights.hazardSeverity}
              onChange={(e) => handleChange('hazardSeverity', parseInt(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

          {/* Population Exposure */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-slate-300">Population Exposure</span>
              <span className="font-mono text-amber-400 font-bold">{currentWeights.populationExposure}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={currentWeights.populationExposure}
              onChange={(e) => handleChange('populationExposure', parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Community Vulnerability */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-slate-300">Community Vulnerability (SVI)</span>
              <span className="font-mono text-cyan-400 font-bold">{currentWeights.communityVulnerability}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={currentWeights.communityVulnerability}
              onChange={(e) => handleChange('communityVulnerability', parseInt(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Urgency */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-slate-300">Urgency & Time Sensitivity</span>
              <span className="font-mono text-purple-400 font-bold">{currentWeights.urgency}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={currentWeights.urgency}
              onChange={(e) => handleChange('urgency', parseInt(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Critical Infrastructure */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="font-medium text-slate-300">Critical Infrastructure Impact</span>
              <span className="font-mono text-emerald-400 font-bold">{currentWeights.criticalInfrastructure}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={currentWeights.criticalInfrastructure}
              onChange={(e) => handleChange('criticalInfrastructure', parseInt(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Total Validation */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Sum of Configured Weights:</span>
          <span className={`font-mono font-bold ${total === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {total}% {total !== 100 && '(will auto-normalize)'}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm"
            >
              Apply Weights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
