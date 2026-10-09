import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Sparkles,
  Users,
  Building2,
  Clock,
  Compass,
  FileCheck2,
  AlertOctagon,
  Truck,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  RefreshCw,
  GitCompare,
  Download
} from 'lucide-react';
import {
  AiBriefingResponse,
  CriticalFacility,
  DisasterIncident,
  EmergencyResource,
  ScoringWeights
} from '../types/disaster';
import { DEFAULT_WEIGHTS } from '../services/priorityEngine';
import { recommendResourcesForIncident } from '../services/resourceOptimizer';

interface IncidentDetailModalProps {
  incident: DisasterIncident | null;
  onClose: () => void;
  onStatusChange: (incidentId: string, newStatus: any) => void;
  onCompare: (incident: DisasterIncident) => void;
  onAllocateResource: (incidentId: string, resourceId: string, units: number) => void;
  inventory: EmergencyResource[];
  weights?: ScoringWeights;
}

export const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  onClose,
  onStatusChange,
  onCompare,
  onAllocateResource,
  inventory,
  weights = DEFAULT_WEIGHTS
}) => {
  if (!incident) return null;

  const [aiBrief, setAiBrief] = useState<AiBriefingResponse | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [briefError, setBriefError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'factors' | 'aiBrief' | 'resources' | 'facilities'>('factors');

  // Fetch AI Response Briefing from server endpoint
  useEffect(() => {
    let isCancelled = false;

    async function fetchBriefing() {
      if (!incident) return;
      setBriefLoading(true);
      setBriefError(null);
      try {
        const res = await fetch('/api/gemini/briefing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incident }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!isCancelled) {
          setAiBrief(data);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setBriefError('Using offline decision baseline.');
        }
      } finally {
        if (!isCancelled) setBriefLoading(false);
      }
    }

    fetchBriefing();

    return () => {
      isCancelled = true;
    };
  }, [incident.id]);

  const recommendedResources = recommendResourcesForIncident(incident, inventory);

  // Export report to Markdown
  const handleExportBrief = () => {
    const md = `# DisasterLens AI Incident Brief: ${incident.title}
**Location:** ${incident.locationName}, ${incident.country}
**Coordinates:** [${incident.coordinates[0]}, ${incident.coordinates[1]}]
**Reported:** ${incident.reportedAt}
**Priority Score:** ${incident.priorityScore}/100 (${incident.priorityCategory})
**Confidence Level:** ${incident.confidenceScore}%
**Source:** ${incident.source} (${incident.sourceRecordId || 'N/A'})

## Factor Breakdown
- Hazard Severity: ${incident.factorBreakdown.hazardSeverityScore} pts (${weights.hazardSeverity}% weight)
- Population Exposure: ${incident.factorBreakdown.populationExposureScore} pts (${weights.populationExposure}% weight)
- Community Vulnerability: ${incident.factorBreakdown.communityVulnerabilityScore} pts (${weights.communityVulnerability}% weight)
- Urgency: ${incident.factorBreakdown.urgencyScore} pts (${weights.urgency}% weight)
- Critical Infrastructure: ${incident.factorBreakdown.criticalInfrastructureScore} pts (${weights.criticalInfrastructure}% weight)

## Priority Rationale
${incident.rationale}

## Missing Data / Uncertainty Gaps
${incident.missingDataFields.length ? incident.missingDataFields.map(f => `- ${f}`).join('\n') : 'No critical gaps reported.'}

## Recommended Emergency Resources
${recommendedResources.map(r => `- ${r.resource.name} (${r.unitsRecommended} units): ${r.priorityRationale}`).join('\n')}

---
*Notice: AI-Assisted Decision Support. Authorized emergency commanders retain final operational command.*
`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-brief-${incident.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-slate-900 border border-slate-750 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-semibold text-rose-400 uppercase tracking-wider text-[10px]">
                {incident.hazardType}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{incident.coordinates[0].toFixed(4)}°N, {incident.coordinates[1].toFixed(4)}°E</span>
              <span aria-hidden="true">·</span>
              <span>{incident.locationName}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {incident.title}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://earth.google.com/web/@${incident.coordinates[0]},${incident.coordinates[1]},3500a,35d,35y,0h,45t,0r`}
              target="_blank"
              rel="noopener noreferrer"
              title="Flyover in Google Earth 3D"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium transition-colors border border-slate-700"
            >
              <span>🌍 3D Earth</span>
            </a>
            <button
              onClick={handleExportBrief}
              title="Download Incident Report Markdown"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCompare(incident)}
              title="Compare with another incident"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <GitCompare className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Priority Banner with Score & Confidence Separation */}
        <div className="px-5 py-3.5 bg-slate-950/40 border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-400 block">Priority Score</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className={`text-2xl font-bold font-mono tabular-nums ${
                incident.priorityCategory === 'Critical' ? 'text-rose-400' :
                incident.priorityCategory === 'High' ? 'text-amber-400' :
                incident.priorityCategory === 'Moderate' ? 'text-blue-400' : 'text-slate-300'
              }`}>
                {incident.priorityScore}
              </span>
              <span className="text-slate-500 font-mono text-xs">/100</span>
              <span className="ml-1 text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                ({incident.priorityCategory})
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Data Confidence</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl font-bold font-mono tabular-nums text-slate-200">
                {incident.confidenceScore}%
              </span>
              <span className="text-[11px] text-slate-400">
                {incident.confidenceScore >= 85 ? '(Verified)' : '(Provisional)'}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Exposed Population</span>
            <span className="text-base font-semibold font-mono text-slate-100 block mt-0.5">
              {incident.estimatedPopulation.toLocaleString()}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Incident Status</span>
            <div className="mt-0.5 flex items-center gap-1.5">
              <select
                value={incident.status}
                onChange={(e) => onStatusChange(incident.id, e.target.value)}
                className="bg-slate-800 border border-slate-700 text-xs rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="active_triage">Active Triage</option>
                <option value="verified">Verified Official</option>
                <option value="dispatch_in_progress">Dispatch In Progress</option>
                <option value="contained">Hazard Contained</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 border-b border-slate-800 bg-slate-900 flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('factors')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'factors'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Priority Engine & Contributing Factors
          </button>
          <button
            onClick={() => setActiveTab('aiBrief')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'aiBrief'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>AI Tactical Response Brief</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'resources'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Emergency Resource Recommendations ({recommendedResources.length})
          </button>
          <button
            onClick={() => setActiveTab('facilities')}
            className={`py-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'facilities'
                ? 'border-rose-500 text-rose-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Facilities At Risk ({incident.impactedFacilities?.length || 0})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: FACTORS */}
          {activeTab === 'factors' && (
            <div className="space-y-6">
              {/* Score Explanation Rationale Callout */}
              <div className="p-4 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                <div className="font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Explainable Decision Rationale</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {incident.rationale}
                </p>
              </div>

              {/* Contributing Factor Sliders & Mathematical Breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Weighted Factor Breakdown
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Factor 1: Hazard Severity */}
                  <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-200">1. Hazard Severity</span>
                      <span className="font-mono text-rose-400 font-bold">
                        {incident.factorBreakdown.hazardSeverityScore} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${(incident.factorBreakdown.hazardSeverityScore / 30) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Weight: {weights.hazardSeverity}%</span>
                      <span>Reported: {incident.severityLevel}</span>
                    </div>
                  </div>

                  {/* Factor 2: Population Exposure */}
                  <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-200">2. Population Exposure</span>
                      <span className="font-mono text-amber-400 font-bold">
                        {incident.factorBreakdown.populationExposureScore} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${(incident.factorBreakdown.populationExposureScore / 25) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Weight: {weights.populationExposure}%</span>
                      <span>Exposed: {incident.estimatedPopulation.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Factor 3: Community Vulnerability */}
                  <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-200">3. Community Vulnerability (SVI)</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {incident.factorBreakdown.communityVulnerabilityScore} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: `${(incident.factorBreakdown.communityVulnerabilityScore / 20) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Weight: {weights.communityVulnerability}%</span>
                      <span>Index: {incident.vulnerabilityIndex}/100</span>
                    </div>
                  </div>

                  {/* Factor 4: Urgency */}
                  <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-200">4. Urgency & Time Sensitivity</span>
                      <span className="font-mono text-purple-400 font-bold">
                        {incident.factorBreakdown.urgencyScore} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                      <div
                        className="bg-purple-500 h-full rounded-full"
                        style={{ width: `${(incident.factorBreakdown.urgencyScore / 15) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Weight: {weights.urgency}%</span>
                      <span>Onset: {incident.urgencyLevel}/100</span>
                    </div>
                  </div>

                  {/* Factor 5: Critical Infrastructure Impact */}
                  <div className="p-3.5 rounded-lg bg-slate-950/50 border border-slate-800 sm:col-span-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-200">5. Critical Infrastructure Impact</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {incident.factorBreakdown.criticalInfrastructureScore} pts
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden my-2">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${(incident.factorBreakdown.criticalInfrastructureScore / 10) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Weight: {weights.criticalInfrastructure}%</span>
                      <span>Impact Score: {incident.infrastructureImpactLevel}/100</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Missing Data Disclosure */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <div className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Data Quality & Uncertainty Assessment</span>
                </div>
                {incident.missingDataFields && incident.missingDataFields.length > 0 ? (
                  <div className="text-amber-300/90 space-y-1 mt-1">
                    <p>The following observational streams remain pending:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                      {incident.missingDataFields.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-slate-400">
                    High data completeness verified across upstream river gauges, meteorological radar, and district demographics.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: AI TACTICAL RESPONSE BRIEF */}
          {activeTab === 'aiBrief' && (
            <div className="space-y-4">
              {briefLoading ? (
                <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                  <RefreshCw className="w-6 h-6 mx-auto animate-spin text-rose-500" />
                  <p>Synthesizing grounded tactical briefing via DisasterLens AI Engine...</p>
                </div>
              ) : aiBrief ? (
                <div className="space-y-5 text-xs">
                  {/* Overview */}
                  <div className="p-4 rounded-lg bg-slate-950/80 border border-slate-800">
                    <h4 className="font-semibold text-rose-400 uppercase tracking-wider text-[11px] mb-1">
                      1. Incident Overview
                    </h4>
                    <p className="text-slate-200 leading-relaxed">{aiBrief.overview}</p>
                  </div>

                  {/* Known Facts vs Uncertainties */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                      <h4 className="font-semibold text-emerald-400 uppercase tracking-wider text-[11px] mb-2">
                        2. Verified Known Facts
                      </h4>
                      <ul className="space-y-1.5 text-slate-300">
                        {aiBrief.knownFacts.map((fact, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{fact}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                      <h4 className="font-semibold text-amber-400 uppercase tracking-wider text-[11px] mb-2">
                        3. What Remains Uncertain
                      </h4>
                      <ul className="space-y-1.5 text-slate-300">
                        {aiBrief.uncertainties.map((unc, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <AlertOctagon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>{unc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Immediate Assessment Steps */}
                  <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                    <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-2">
                      4. Immediate Response Checklist
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {aiBrief.immediateAssessmentSteps.map((step, idx) => (
                        <div key={idx} className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          <span className="font-mono text-rose-400 font-bold block mb-1">Step {idx + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Verification Notice */}
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Operational Notice: </span>
                    {aiBrief.dataFreshnessSummary}. Response dispatches require human authorization by the incident commander.
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Briefing generated using standard fallback procedures.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RESOURCE RECOMMENDATIONS */}
          {activeTab === 'resources' && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/30 text-xs text-rose-300 flex items-center justify-between">
                <span>Decision support engine recommendations. Human authorization required before field deployment.</span>
              </div>

              <div className="space-y-3">
                {recommendedResources.map((rec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-rose-400" />
                        <span className="font-bold text-white text-sm">
                          {rec.resource.name}
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed max-w-xl">
                        {rec.priorityRationale}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>Depot: {rec.resource.baseStation}</span>
                        <span aria-hidden="true">·</span>
                        <span>Available: <strong className="text-white font-mono">{rec.resource.availableUnits}</strong> of {rec.resource.totalUnits} {rec.resource.unitType}</span>
                        <span aria-hidden="true">·</span>
                        <span>Lead Time: ~{rec.resource.leadTimeHours} hrs</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => onAllocateResource(incident.id, rec.resource.id, rec.unitsRecommended)}
                        disabled={!rec.isAvailable}
                        className={`px-3.5 py-2 rounded-lg font-medium text-xs transition-colors whitespace-nowrap ${
                          rec.isAvailable
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {rec.isAvailable ? `Authorize ${rec.unitsRecommended} Units` : 'Insufficient Units'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CRITICAL FACILITIES */}
          {activeTab === 'facilities' && (
            <div className="space-y-4">
              {(!incident.impactedFacilities || incident.impactedFacilities.length === 0) ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No immediate Level-1 hospitals or primary utility hubs reported directly inside the hazard core perimeter. Secondary regional facilities continue normal monitoring.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {incident.impactedFacilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex items-start gap-3"
                    >
                      <div className="p-2 rounded bg-slate-900 border border-slate-750 text-sky-400 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{fac.name}</h4>
                        <div className="text-[11px] text-slate-400 capitalize mt-0.5">
                          Type: {fac.type.replace('_', ' ')}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Status: <span className={fac.status === 'operational' ? 'text-emerald-400' : 'text-amber-400'}>{fac.status}</span>
                        </div>
                        {fac.capacity && (
                          <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            Capacity: {fac.capacity.toLocaleString()} (Occ: {fac.currentOccupancy || 'N/A'})
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>
            Source Record: <a href={incident.sourceUrl || '#'} target="_blank" rel="noreferrer" className="text-slate-200 hover:underline">{incident.sourceRecordId || incident.source}</a>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
