import React, { useState } from 'react';
import {
  X,
  GitCompare,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { DisasterIncident, ScoringWeights } from '../types/disaster';
import { compareIncidents, DEFAULT_WEIGHTS } from '../services/priorityEngine';

interface CompareIncidentsModalProps {
  primaryIncident: DisasterIncident;
  incidents: DisasterIncident[];
  onClose: () => void;
  weights?: ScoringWeights;
}

export const CompareIncidentsModal: React.FC<CompareIncidentsModalProps> = ({
  primaryIncident,
  incidents,
  onClose,
  weights = DEFAULT_WEIGHTS
}) => {
  const otherIncidents = incidents.filter(i => i.id !== primaryIncident.id);
  const [secondaryId, setSecondaryId] = useState(otherIncidents[0]?.id || '');

  const secondaryIncident = incidents.find(i => i.id === secondaryId) || otherIncidents[0];

  if (!secondaryIncident) return null;

  const comparison = compareIncidents(primaryIncident, secondaryIncident, weights);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-750 rounded-xl shadow-2xl p-6 text-slate-100 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-tight">
              Compare Disaster Response Priorities
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Incidents Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Incident A */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-semibold text-rose-400 tracking-wider">
              Selected Incident A
            </span>
            <h3 className="font-bold text-white text-sm line-clamp-1">{primaryIncident.title}</h3>
            <div className="flex items-center justify-between text-slate-400 pt-1">
              <span>{primaryIncident.locationName}</span>
              <span className="font-mono font-bold text-rose-400 text-base">
                {primaryIncident.priorityScore}/100
              </span>
            </div>
          </div>

          {/* Incident B (Selectable) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-amber-400 tracking-wider">
                Compare Against (Incident B)
              </span>
            </div>
            <select
              value={secondaryId}
              onChange={(e) => setSecondaryId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-750 rounded-lg p-1.5 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              {otherIncidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  {inc.title} ({inc.priorityScore}/100)
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between text-slate-400 pt-1">
              <span>{secondaryIncident.locationName}</span>
              <span className="font-mono font-bold text-amber-400 text-base">
                {secondaryIncident.priorityScore}/100
              </span>
            </div>
          </div>
        </div>

        {/* Explainable Comparison Rationale */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
            <TrendingUp className="w-4 h-4" />
            <span>Why {comparison.higherIncident.title.slice(0, 30)}... Ranks Higher</span>
          </div>
          <p className="text-slate-200 leading-relaxed">
            {comparison.explanation}
          </p>
          {comparison.decisiveFactors.length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-[11px]">Decisive Drivers:</span>
              {comparison.decisiveFactors.map((df, i) => (
                <span key={i} className="text-emerald-400 font-mono text-[11px] bg-emerald-950/50 border border-emerald-800/80 px-2 py-0.5 rounded">
                  {df}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Side-by-Side Factor Comparison Table */}
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2 px-3">Evaluation Factor</th>
                <th className="py-2 px-3">{primaryIncident.title.slice(0, 20)}...</th>
                <th className="py-2 px-3">{secondaryIncident.title.slice(0, 20)}...</th>
                <th className="py-2 px-3 text-right">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-300">Hazard Severity</td>
                <td className="py-2.5 px-3 text-rose-400">{primaryIncident.factorBreakdown.hazardSeverityScore} pts</td>
                <td className="py-2.5 px-3 text-amber-400">{secondaryIncident.factorBreakdown.hazardSeverityScore} pts</td>
                <td className="py-2.5 px-3 text-right text-slate-200">
                  {(primaryIncident.factorBreakdown.hazardSeverityScore - secondaryIncident.factorBreakdown.hazardSeverityScore).toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-300">Population Exposure</td>
                <td className="py-2.5 px-3 text-rose-400">{primaryIncident.factorBreakdown.populationExposureScore} pts</td>
                <td className="py-2.5 px-3 text-amber-400">{secondaryIncident.factorBreakdown.populationExposureScore} pts</td>
                <td className="py-2.5 px-3 text-right text-slate-200">
                  {(primaryIncident.factorBreakdown.populationExposureScore - secondaryIncident.factorBreakdown.populationExposureScore).toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-300">Community Vulnerability</td>
                <td className="py-2.5 px-3 text-rose-400">{primaryIncident.factorBreakdown.communityVulnerabilityScore} pts</td>
                <td className="py-2.5 px-3 text-amber-400">{secondaryIncident.factorBreakdown.communityVulnerabilityScore} pts</td>
                <td className="py-2.5 px-3 text-right text-slate-200">
                  {(primaryIncident.factorBreakdown.communityVulnerabilityScore - secondaryIncident.factorBreakdown.communityVulnerabilityScore).toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-300">Urgency & Time Sensitivity</td>
                <td className="py-2.5 px-3 text-rose-400">{primaryIncident.factorBreakdown.urgencyScore} pts</td>
                <td className="py-2.5 px-3 text-amber-400">{secondaryIncident.factorBreakdown.urgencyScore} pts</td>
                <td className="py-2.5 px-3 text-right text-slate-200">
                  {(primaryIncident.factorBreakdown.urgencyScore - secondaryIncident.factorBreakdown.urgencyScore).toFixed(1)}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans text-slate-300">Critical Infrastructure Impact</td>
                <td className="py-2.5 px-3 text-rose-400">{primaryIncident.factorBreakdown.criticalInfrastructureScore} pts</td>
                <td className="py-2.5 px-3 text-amber-400">{secondaryIncident.factorBreakdown.criticalInfrastructureScore} pts</td>
                <td className="py-2.5 px-3 text-right text-slate-200">
                  {(primaryIncident.factorBreakdown.criticalInfrastructureScore - secondaryIncident.factorBreakdown.criticalInfrastructureScore).toFixed(1)}
                </td>
              </tr>
              <tr className="font-bold bg-slate-950/40">
                <td className="py-3 px-3 font-sans text-white">Weighted Total Priority</td>
                <td className="py-3 px-3 text-rose-400 text-sm">{primaryIncident.priorityScore}</td>
                <td className="py-3 px-3 text-amber-400 text-sm">{secondaryIncident.priorityScore}</td>
                <td className="py-3 px-3 text-right text-emerald-400 text-sm">
                  {primaryIncident.priorityScore - secondaryIncident.priorityScore > 0 ? `+${primaryIncident.priorityScore - secondaryIncident.priorityScore}` : `${primaryIncident.priorityScore - secondaryIncident.priorityScore}`}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-750 rounded-lg"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
