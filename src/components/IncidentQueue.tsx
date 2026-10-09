import React, { useState } from 'react';
import {
  Filter,
  ArrowUpDown,
  AlertTriangle,
  Flame,
  Waves,
  Sun,
  Activity,
  Wind,
  ShieldCheck,
  Clock,
  Users,
  Building,
  CheckCircle2,
  ChevronRight,
  GitCompare,
  ShieldAlert
} from 'lucide-react';
import { DisasterIncident, HazardType, PriorityCategory } from '../types/disaster';

interface IncidentQueueProps {
  incidents: DisasterIncident[];
  selectedIncident: DisasterIncident | null;
  onSelectIncident: (incident: DisasterIncident) => void;
  onCompareWith: (incident: DisasterIncident) => void;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onCompareWith
}) => {
  const [selectedHazard, setSelectedHazard] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'severity' | 'population' | 'recent'>('priority');

  // Filter incidents
  const filtered = incidents.filter((inc) => {
    if (selectedHazard !== 'all' && inc.hazardType !== selectedHazard) return false;
    if (selectedPriority !== 'all' && inc.priorityCategory !== selectedPriority) return false;
    return true;
  });

  // Sort incidents
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'priority') return b.priorityScore - a.priorityScore;
    if (sortBy === 'population') return b.estimatedPopulation - a.estimatedPopulation;
    if (sortBy === 'recent') return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    if (sortBy === 'severity') {
      const rank = { Critical: 4, High: 3, Moderate: 2, Low: 1 };
      return (rank[b.severityLevel] || 0) - (rank[a.severityLevel] || 0);
    }
    return 0;
  });

  // Hazard Icon helper
  const getHazardIcon = (type: HazardType) => {
    switch (type) {
      case 'flood': return <Waves className="w-3.5 h-3.5 text-cyan-400" />;
      case 'cyclone':
      case 'storm': return <Wind className="w-3.5 h-3.5 text-teal-400" />;
      case 'heatwave': return <Sun className="w-3.5 h-3.5 text-amber-400" />;
      case 'wildfire': return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'earthquake': return <Activity className="w-3.5 h-3.5 text-rose-400" />;
      case 'landslide': return <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />;
      default: return <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const getPriorityStyle = (cat: PriorityCategory) => {
    switch (cat) {
      case 'Critical':
        return {
          textColor: 'text-rose-400',
          bgBorder: 'border-rose-500/30 bg-rose-950/20',
          badgeText: 'Critical Response'
        };
      case 'High':
        return {
          textColor: 'text-amber-400',
          bgBorder: 'border-amber-500/30 bg-amber-950/20',
          badgeText: 'High Priority'
        };
      case 'Moderate':
        return {
          textColor: 'text-blue-400',
          bgBorder: 'border-blue-500/20 bg-blue-950/20',
          badgeText: 'Moderate'
        };
      case 'Low':
        return {
          textColor: 'text-slate-400',
          bgBorder: 'border-slate-800 bg-slate-900/30',
          badgeText: 'Monitoring'
        };
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/40 border-l border-slate-800">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/70 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight">
              Priority-Ranked Incidents
            </h2>
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              ({sorted.length} active)
            </span>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ArrowUpDown className="w-3 h-3 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-rose-500"
            >
              <option value="priority">Sort: Priority Score</option>
              <option value="severity">Sort: Hazard Severity</option>
              <option value="population">Sort: Population Exposed</option>
              <option value="recent">Sort: Most Recent</option>
            </select>
          </div>
        </div>

        {/* Hazard Segmented Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Hazards' },
            { id: 'flood', label: 'Floods' },
            { id: 'heatwave', label: 'Heat' },
            { id: 'cyclone', label: 'Cyclones' },
            { id: 'earthquake', label: 'Seismic' },
            { id: 'landslide', label: 'Landslides' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedHazard(item.id)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors whitespace-nowrap ${
                selectedHazard === item.id
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 text-[11px]">
          <span className="text-slate-500 mr-1">Level:</span>
          {['all', 'Critical', 'High', 'Moderate', 'Low'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedPriority(cat)}
              className={`px-2 py-0.5 rounded transition-colors ${
                selectedPriority === cat
                  ? 'bg-slate-700 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat === 'all' ? 'Any' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 space-y-2">
        {sorted.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No incidents matched the selected hazard and priority filters.
          </div>
        ) : (
          sorted.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            const style = getPriorityStyle(inc.priorityCategory);

            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`p-3 rounded-lg border transition-all cursor-pointer text-left group ${
                  isSelected
                    ? 'border-rose-500/80 bg-slate-900/90 shadow-md ring-1 ring-rose-500/20'
                    : 'border-slate-800/80 bg-slate-950/40 hover:bg-slate-900/60 hover:border-slate-700'
                }`}
              >
                {/* Header Row: Title & Score */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 p-1 rounded bg-slate-900 border border-slate-800 shrink-0">
                      {getHazardIcon(inc.hazardType)}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-slate-100 group-hover:text-white line-clamp-1">
                        {inc.title}
                      </h3>
                      {/* Zero-Pill Unboxed Text Metadata */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-medium text-slate-300">{inc.locationName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{inc.hazardType}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-400">Severity: {inc.severityLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Priority Numerical Score */}
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline justify-end gap-1 font-mono">
                      <span className={`text-base font-bold tabular-nums ${style.textColor}`}>
                        {inc.priorityScore}
                      </span>
                      <span className="text-[10px] text-slate-500">/100</span>
                    </div>
                    <span className={`text-[10px] font-medium block uppercase tracking-wider ${style.textColor}`}>
                      {inc.priorityCategory}
                    </span>
                  </div>
                </div>

                {/* Contributing Factor Micro-Bar */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-mono tabular-nums">
                      Pop: {inc.estimatedPopulation.toLocaleString()}
                    </span>
                    <span className="text-slate-400">
                      Confidence: <span className="text-slate-200 font-mono">{inc.confidenceScore}%</span>
                    </span>
                  </div>

                  {/* Segmented factor representation */}
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${(inc.factorBreakdown.hazardSeverityScore / 30) * 30}%` }}
                      className="bg-rose-500"
                      title={`Hazard: ${inc.factorBreakdown.hazardSeverityScore} pts`}
                    />
                    <div
                      style={{ width: `${(inc.factorBreakdown.populationExposureScore / 25) * 25}%` }}
                      className="bg-amber-500"
                      title={`Population: ${inc.factorBreakdown.populationExposureScore} pts`}
                    />
                    <div
                      style={{ width: `${(inc.factorBreakdown.communityVulnerabilityScore / 20) * 20}%` }}
                      className="bg-cyan-500"
                      title={`Vulnerability: ${inc.factorBreakdown.communityVulnerabilityScore} pts`}
                    />
                    <div
                      style={{ width: `${(inc.factorBreakdown.urgencyScore / 15) * 15}%` }}
                      className="bg-purple-500"
                      title={`Urgency: ${inc.factorBreakdown.urgencyScore} pts`}
                    />
                    <div
                      style={{ width: `${(inc.factorBreakdown.criticalInfrastructureScore / 10) * 10}%` }}
                      className="bg-emerald-500"
                      title={`Infrastructure: ${inc.factorBreakdown.criticalInfrastructureScore} pts`}
                    />
                  </div>
                </div>

                {/* Footer with Source & Compare Action */}
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[200px]" title={inc.source}>
                    Source: {inc.source}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompareWith(inc);
                    }}
                    title="Compare this incident with another"
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 px-1.5 py-0.5 rounded hover:bg-slate-800"
                  >
                    <GitCompare className="w-3 h-3" />
                    <span>Compare</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
