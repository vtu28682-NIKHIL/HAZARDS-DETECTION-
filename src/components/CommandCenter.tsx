import React, { useState } from 'react';
import {
  SlidersHorizontal,
  GitCompare,
  RefreshCw,
  Layers,
  ShieldAlert,
  Radio,
  Search,
  Filter,
  ArrowRight
} from 'lucide-react';
import { DisasterIncident, EmergencyResource, ScoringWeights } from '../types/disaster';
import { DisasterMap } from './DisasterMap';
import { IncidentQueue } from './IncidentQueue';

interface CommandCenterProps {
  incidents: DisasterIncident[];
  selectedIncident: DisasterIncident | null;
  onSelectIncident: (incident: DisasterIncident) => void;
  onOpenWeights: () => void;
  onOpenCompare: (incident?: DisasterIncident) => void;
  onRefreshFeeds: () => void;
  isRefreshing: boolean;
  weights: ScoringWeights;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onOpenWeights,
  onOpenCompare,
  onRefreshFeeds,
  isRefreshing,
  weights
}) => {
  const criticalCount = incidents.filter(i => i.priorityCategory === 'Critical').length;
  const highCount = incidents.filter(i => i.priorityCategory === 'High').length;
  const moderateCount = incidents.filter(i => i.priorityCategory === 'Moderate').length;
  const lowCount = incidents.filter(i => i.priorityCategory === 'Low').length;

  const [mapExpanded, setMapExpanded] = useState(false);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-5.5rem)] overflow-hidden">
      {/* Tactical Sub-Header & Summary Strip */}
      <div className="bg-slate-950 px-4 sm:px-6 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        {/* Priority Counts */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 -ml-4"></span>
            <span className="text-rose-400 font-bold">{criticalCount}</span>
            <span className="text-slate-400 font-sans text-[11px]">Critical</span>
          </div>
          <span aria-hidden="true" className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-amber-400 font-bold">{highCount}</span>
            <span className="text-slate-400 font-sans text-[11px]">High</span>
          </div>
          <span aria-hidden="true" className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-blue-400 font-bold">{moderateCount}</span>
            <span className="text-slate-400 font-sans text-[11px]">Moderate</span>
          </div>
          <span aria-hidden="true" className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
            <span className="text-slate-400 font-bold">{lowCount}</span>
            <span className="text-slate-500 font-sans text-[11px]">Monitoring</span>
          </div>
        </div>

        {/* Tactical Actions Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapExpanded(!mapExpanded)}
            title={mapExpanded ? 'Switch to Split View' : 'Expand Map Fullscreen'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-rose-400" />
            <span>{mapExpanded ? 'Show Queue' : 'Expand Map'}</span>
          </button>

          <button
            onClick={() => onOpenCompare(selectedIncident || incidents[0])}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <GitCompare className="w-3.5 h-3.5 text-slate-400" />
            <span>Compare</span>
          </button>

          <button
            onClick={onOpenWeights}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Weights</span>
          </button>

          <button
            onClick={onRefreshFeeds}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Feeds'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split: Map + Synchronized Queue */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-[520px]">
        {/* Left: Map Container */}
        <div className={`relative overflow-hidden transition-all duration-300 min-h-[500px] ${
          mapExpanded ? 'w-full h-full flex-1' : 'w-full lg:flex-1 h-[55vh] lg:h-full'
        }`}>
          <DisasterMap
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={onSelectIncident}
          />
        </div>

        {/* Right: Synchronized Priority Queue */}
        {!mapExpanded && (
          <div className="w-full lg:w-[420px] xl:w-[460px] h-[50vh] lg:h-full overflow-hidden shrink-0 z-20">
            <IncidentQueue
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={onSelectIncident}
              onCompareWith={onOpenCompare}
            />
          </div>
        )}
      </div>
    </div>
  );
};
