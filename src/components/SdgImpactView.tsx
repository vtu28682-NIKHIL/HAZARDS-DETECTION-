import React from 'react';
import {
  Globe2,
  ShieldCheck,
  TrendingUp,
  Heart,
  Droplets,
  Building,
  Target,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { DisasterIncident, EmergencyResource } from '../types/disaster';

interface SdgImpactViewProps {
  incidents: DisasterIncident[];
  inventory: EmergencyResource[];
}

export const SdgImpactView: React.FC<SdgImpactViewProps> = ({
  incidents,
  inventory
}) => {
  const totalExposedPopulation = incidents.reduce((sum, i) => sum + i.estimatedPopulation, 0);
  const criticalCount = incidents.filter(i => i.priorityCategory === 'Critical').length;
  const highCount = incidents.filter(i => i.priorityCategory === 'High').length;
  const totalAllocatedResources = inventory.reduce((sum, r) => sum + r.allocatedUnits, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 max-w-3xl">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
          <Target className="w-4 h-4" />
          <span>Sustainable Development Goals Alignment Framework</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          SDG 13 Climate Action & Disaster Resilience Dashboard
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          DisasterLens AI operationalizes international climate resilience targets by transforming raw hazard observations into prioritized, equitable emergency response intelligence.
        </p>
      </div>

      {/* Primary Goal Banner: SDG 13 */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span>Primary Focus: SDG 13 — Climate Action</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Target 13.1: Strengthen Resilience to Climate-Related Hazards
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            By ranking disaster incidents based on population vulnerability rather than raw financial asset loss alone, DisasterLens AI ensures that low-income delta settlements, rain-shadow farming belts, and floodplains receive rapid, evidence-grounded response staging.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/60 text-center shrink-0">
          <span className="text-xs text-slate-400 block">Monitored Catchment</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {totalExposedPopulation.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Citizens in danger perimeters</span>
        </div>
      </div>

      {/* Verified System Activity Telemetry (Honest Metrics) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Operational System Telemetry
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Incidents Ingested</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {incidents.length}
            </span>
            <span className="text-[10px] text-emerald-400 block">USGS, NASA & IMD Feeds</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Critical Triage Alerts</span>
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
              {criticalCount}
            </span>
            <span className="text-[10px] text-slate-400 block">Priority score &ge; 80</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">High Priority Hazards</span>
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {highCount}
            </span>
            <span className="text-[10px] text-slate-400 block">Priority score 60–79</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 block">Allocated Relief Units</span>
            <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
              {totalAllocatedResources}
            </span>
            <span className="text-[10px] text-slate-400 block">Boats, ICUs & Water Units</span>
          </div>
        </div>
      </div>

      {/* Supporting Sustainable Development Goals Matrix */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Supporting Global Goals Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* SDG 11 */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400">SDG 11</span>
              <h4 className="text-sm font-bold text-white">Sustainable Cities & Communities</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target 11.5: Reduce the number of deaths and people affected by disasters with a focus on protecting the poor and people in vulnerable situations.
            </p>
          </div>

          {/* SDG 3 */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-400">SDG 3</span>
              <h4 className="text-sm font-bold text-white">Good Health and Well-Being</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target 3.D: Early warning, risk reduction and management of national and global health risks during flood contamination and severe heat stress.
            </p>
          </div>

          {/* SDG 6 */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400">SDG 6</span>
              <h4 className="text-sm font-bold text-white">Clean Water and Sanitation</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target 6.4: Increase water-use efficiency and address water scarcity through real-time drought tracking and emergency mobile purification deployment.
            </p>
          </div>

          {/* SDG 1 */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-rose-400">SDG 1</span>
              <h4 className="text-sm font-bold text-white">No Poverty</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target 1.5: Build the resilience of the poor and reduce their exposure and vulnerability to climate-related extreme events and environmental shocks.
            </p>
          </div>

          {/* SDG 2 */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-yellow-400">SDG 2</span>
              <h4 className="text-sm font-bold text-white">Zero Hunger</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target 2.4: Ensure sustainable food production systems and implement resilient agricultural practices that strengthen capacity for adaptation to drought.
            </p>
          </div>

          {/* SDG 9 */}
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-purple-400">SDG 9</span>
              <h4 className="text-sm font-bold text-white">Industry, Innovation & Infrastructure</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Target 9.1: Develop quality, reliable, sustainable and resilient infrastructure with proactive risk identification for bridges and power substations.
            </p>
          </div>
        </div>
      </div>

      {/* Honest Boundary Disclosure */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
        <span className="font-semibold text-slate-300 block mb-1">Methodological Disclosure:</span>
        <p>
          All figures displayed reflect system operational telemetry and modeled catchment assessments. In accordance with strict engineering standards, we do not claim unverified lives saved or economic losses prevented without post-disaster field audits.
        </p>
      </div>
    </div>
  );
};
