import React, { useState } from 'react';
import {
  Truck,
  HeartPulse,
  LifeBuoy,
  Droplets,
  PackageCheck,
  Radio,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Send,
  Plus
} from 'lucide-react';
import { DisasterIncident, EmergencyResource, ResourceAllocation } from '../types/disaster';

interface ResourceDispatchBoardProps {
  inventory: EmergencyResource[];
  allocations: ResourceAllocation[];
  incidents: DisasterIncident[];
  onApproveAllocation: (allocationId: string) => void;
  onRequestDispatch: (incidentId: string, resourceId: string, units: number, notes: string) => void;
}

export const ResourceDispatchBoard: React.FC<ResourceDispatchBoardProps> = ({
  inventory,
  allocations,
  incidents,
  onApproveAllocation,
  onRequestDispatch
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState(incidents[0]?.id || '');
  const [selectedResourceId, setSelectedResourceId] = useState(inventory[0]?.id || '');
  const [unitsToDispatch, setUnitsToDispatch] = useState(2);
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [submissionMsg, setSubmissionMsg] = useState<string | null>(null);

  const selectedResource = inventory.find(r => r.id === selectedResourceId);
  const selectedIncident = incidents.find(i => i.id === selectedIncidentId);

  const handleSubmitDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource || !selectedIncident) return;

    if (unitsToDispatch > selectedResource.availableUnits) {
      alert(`Cannot allocate ${unitsToDispatch} units. Only ${selectedResource.availableUnits} available.`);
      return;
    }

    onRequestDispatch(
      selectedIncidentId,
      selectedResourceId,
      unitsToDispatch,
      dispatchNotes || `Emergency deployment for ${selectedIncident.title}`
    );

    setSubmissionMsg(`Dispatch order staged for ${unitsToDispatch} units of ${selectedResource.name}. Awaiting commander confirmation.`);
    setTimeout(() => setSubmissionMsg(null), 5000);
    setDispatchNotes('');
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'medical': return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'rescue': return <LifeBuoy className="w-4 h-4 text-cyan-400" />;
      case 'water': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'shelter': return <PackageCheck className="w-4 h-4 text-emerald-400" />;
      case 'communications': return <Radio className="w-4 h-4 text-purple-400" />;
      default: return <Truck className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4" />
            <span>Emergency Logistics & Response Decision Support</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Emergency Resource Inventory & Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time tracking of disaster mitigation assets with double-allocation prevention and field approval controls.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Human-in-the-Loop Protocol Active</span>
        </div>
      </div>

      {submissionMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{submissionMsg}</span>
        </div>
      )}

      {/* Resource Inventory Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Available Regional Relief Assets
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((res) => {
            const pctAvailable = Math.round((res.availableUnits / res.totalUnits) * 100);

            return (
              <div
                key={res.id}
                className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                      {getCategoryIcon(res.category)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white line-clamp-1">{res.name}</h3>
                      <span className="text-[11px] text-slate-400 capitalize">{res.category} Logistics</span>
                    </div>
                  </div>
                </div>

                {/* Units Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Available Inventory</span>
                    <span className="font-mono font-bold text-white">
                      {res.availableUnits} <span className="text-slate-500 font-normal">/ {res.totalUnits} {res.unitType}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pctAvailable > 50 ? 'bg-emerald-500' : pctAvailable > 20 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pctAvailable}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[170px]" title={res.baseStation}>
                    Base: {res.baseStation}
                  </span>
                  <span className="font-mono text-slate-300">
                    Lead: ~{res.leadTimeHours}h
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Stage New Dispatch + Active Dispatch Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Stage New Dispatch */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Send className="w-4 h-4 text-rose-400" />
            <span>Stage Response Dispatch Order</span>
          </h2>

          <form onSubmit={handleSubmitDispatch} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-medium">Target Incident</label>
              <select
                value={selectedIncidentId}
                onChange={(e) => setSelectedIncidentId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                {incidents.map((inc) => (
                  <option key={inc.id} value={inc.id}>
                    {inc.title} ({inc.priorityScore}/100 - {inc.priorityCategory})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Select Resource</label>
              <select
                value={selectedResourceId}
                onChange={(e) => setSelectedResourceId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
              >
                {inventory.map((res) => (
                  <option key={res.id} value={res.id}>
                    {res.name} ({res.availableUnits} avail)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">
                Units to Allocate (Max: {selectedResource?.availableUnits || 0})
              </label>
              <input
                type="number"
                min="1"
                max={selectedResource?.availableUnits || 1}
                value={unitsToDispatch}
                onChange={(e) => setUnitsToDispatch(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-medium">Operational Rationale / Mission Order</label>
              <textarea
                rows={3}
                value={dispatchNotes}
                onChange={(e) => setDispatchNotes(e.target.value)}
                placeholder="Specify staging area, contact frequencies, or route constraints..."
                className="w-full bg-slate-950 border border-slate-750 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedResource || selectedResource.availableUnits < 1}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Stage Dispatch Order
            </button>
          </form>
        </div>

        {/* Active Dispatches & Authorizations Table */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Pending & Active Response Dispatches ({allocations.length})
            </h2>
            <span className="text-xs text-slate-400">Field Command Approval Required</span>
          </div>

          <div className="overflow-x-auto">
            {allocations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No active dispatches staged yet. Use the staging form or accept AI recommendations inside incident details.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-2.5 px-3">Resource</th>
                    <th className="py-2.5 px-3">Target Incident</th>
                    <th className="py-2.5 px-3">Units</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {allocations.map((alloc) => {
                    const res = inventory.find(r => r.id === alloc.resourceId);
                    const inc = incidents.find(i => i.id === alloc.incidentId);

                    return (
                      <tr key={alloc.id} className="hover:bg-slate-900/50">
                        <td className="py-3 px-3 font-medium text-slate-200">
                          {res?.name || alloc.resourceId}
                        </td>
                        <td className="py-3 px-3 text-slate-300">
                          {inc?.title || alloc.incidentId}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-200">
                          {alloc.unitsRequested}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            alloc.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                            alloc.status === 'en_route' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                            'bg-amber-950 text-amber-400 border border-amber-800'
                          }`}>
                            {alloc.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {alloc.status === 'recommended' ? (
                            <button
                              onClick={() => onApproveAllocation(alloc.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
                            >
                              Authorize
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400">Authorized</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
