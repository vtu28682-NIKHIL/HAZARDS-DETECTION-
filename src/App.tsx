import React, { useState, useEffect, useCallback } from 'react';
import {
  DisasterIncident,
  EmergencyResource,
  ResourceAllocation,
  ScoringWeights,
  SupportedLanguage,
  AuditLogItem
} from './types/disaster';
import {
  DEFAULT_WEIGHTS,
  calculatePriorityScore,
  generateScoreExplanation,
  mapSeverityToHazardScore,
  normalizePopulationExposure
} from './services/priorityEngine';
import { INITIAL_RESOURCE_INVENTORY } from './services/resourceOptimizer';
import { generateBaselineIncidents } from './data/mockAndHistoricalData';
import { Header } from './components/Header';
import { CommandCenter } from './components/CommandCenter';
import { CitizenPortal } from './components/CitizenPortal';
import { ClimateForecasts } from './components/ClimateForecasts';
import { ResourceDispatchBoard } from './components/ResourceDispatchBoard';
import { VulnerabilityMap } from './components/VulnerabilityMap';
import { SdgImpactView } from './components/SdgImpactView';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { WeightsConfigModal } from './components/WeightsConfigModal';
import { CompareIncidentsModal } from './components/CompareIncidentsModal';
import { DisasterVoiceModal } from './components/DisasterVoiceModal';
import { AuditTrailModal } from './components/AuditTrailModal';

export default function App() {
  // Main State
  const [incidents, setIncidents] = useState<DisasterIncident[]>(() => generateBaselineIncidents());
  const [selectedIncident, setSelectedIncident] = useState<DisasterIncident | null>(null);
  const [currentTab, setCurrentTab] = useState<'command' | 'citizen' | 'forecast' | 'resources' | 'vulnerability' | 'sdg'>('command');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  const [inventory, setInventory] = useState<EmergencyResource[]>(INITIAL_RESOURCE_INVENTORY);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([
    {
      id: 'alloc-01',
      incidentId: 'inc-tn-01',
      resourceId: 'res-ndrf-01',
      unitsRequested: 4,
      priorityRationale: 'Swift water rescue for Adyar river flash flood perimeter.',
      status: 'approved',
      authorizedBy: 'State Relief Commissioner',
      authorizedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([
    {
      id: 'log-init',
      timestamp: new Date().toISOString(),
      actor: 'System Ingestion Service',
      action: 'BASELINE_FEED_LOADED',
      targetId: 'ALL',
      details: 'Initialized baseline disaster dataset with CWC, IMD and NASA observations.'
    }
  ]);

  // Modal Dialogs
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isWeightsModalOpen, setIsWeightsModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareTargetIncident, setCompareTargetIncident] = useState<DisasterIncident | null>(null);

  // Live telemetry status
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now');

  // Recalculate priority scores when weights change
  const recalculateIncidentsWithWeights = useCallback((currentIncidents: DisasterIncident[], activeWeights: ScoringWeights) => {
    return currentIncidents.map((inc) => {
      const hazardScore = mapSeverityToHazardScore(inc.severityLevel);
      const popScore = normalizePopulationExposure(inc.estimatedPopulation);
      const { priorityScore, priorityCategory, factorBreakdown } = calculatePriorityScore(
        hazardScore,
        popScore,
        inc.vulnerabilityIndex,
        inc.urgencyLevel,
        inc.infrastructureImpactLevel,
        activeWeights
      );

      const rationale = generateScoreExplanation(
        {
          ...inc,
          priorityScore,
          priorityCategory,
          factorBreakdown
        },
        activeWeights
      );

      return {
        ...inc,
        priorityScore,
        priorityCategory,
        factorBreakdown,
        rationale
      };
    });
  }, []);

  // Fetch Live Feeds from /api/disasters/live
  const fetchLiveDisasterFeeds = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/disasters/live');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.liveIncidents && Array.isArray(data.liveIncidents)) {
        // Compute priority for newly ingested items
        const computedLive = data.liveIncidents.map((item: any) => {
          const hazardScore = mapSeverityToHazardScore(item.severityLevel);
          const popScore = normalizePopulationExposure(item.estimatedPopulation);
          const { priorityScore, priorityCategory, factorBreakdown } = calculatePriorityScore(
            hazardScore,
            popScore,
            item.vulnerabilityIndex,
            item.urgencyLevel,
            item.infrastructureImpactLevel,
            weights
          );
          const rationale = generateScoreExplanation(
            { ...item, priorityScore, priorityCategory, factorBreakdown },
            weights
          );
          return {
            ...item,
            priorityScore,
            priorityCategory,
            factorBreakdown,
            rationale
          };
        });

        // Merge without duplicates based on id
        setIncidents((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = computedLive.filter((c: any) => !existingIds.has(c.id));
          const updated = [...prev, ...newUnique];
          return recalculateIncidentsWithWeights(updated, weights);
        });

        setLastUpdated(new Date().toLocaleTimeString());

        // Audit Log entry
        setAuditLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: 'Automated Ingestion Adapter',
            action: 'LIVE_FEEDS_SYNCED',
            targetId: 'USGS/NASA',
            details: `Successfully ingested ${data.totalLiveCount} real-time external records.`
          },
          ...prev
        ]);
      }
    } catch (err: any) {
      console.warn('Live disaster feed fetch fallback:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [weights, recalculateIncidentsWithWeights]);

  // Initial live feed fetch
  useEffect(() => {
    fetchLiveDisasterFeeds();
  }, []);

  // Handle Weight Update
  const handleSaveWeights = (newWeights: ScoringWeights) => {
    setWeights(newWeights);
    const updated = recalculateIncidentsWithWeights(incidents, newWeights);
    setIncidents(updated);

    // If an incident is selected, update its reference too
    if (selectedIncident) {
      const match = updated.find(i => i.id === selectedIncident.id);
      if (match) setSelectedIncident(match);
    }

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Incident Commander',
        action: 'WEIGHTS_RECONFIGURED',
        targetId: 'PRIORITY_ENGINE',
        details: `Adjusted weights: Severity ${newWeights.hazardSeverity}%, Pop ${newWeights.populationExposure}%, Vuln ${newWeights.communityVulnerability}%, Urgency ${newWeights.urgency}%, Infra ${newWeights.criticalInfrastructure}%.`
      },
      ...prev
    ]);
  };

  // Handle Incident Status Change
  const handleStatusChange = (incidentId: string, newStatus: any) => {
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          return {
            ...inc,
            status: newStatus,
            lastUpdatedAt: new Date().toISOString()
          };
        }
        return inc;
      })
    );

    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident((prev) => prev ? { ...prev, status: newStatus } : null);
    }

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Duty Officer',
        action: 'INCIDENT_STATUS_UPDATED',
        targetId: incidentId,
        details: `Status transitioned to "${newStatus.toUpperCase()}" with timestamp record.`
      },
      ...prev
    ]);
  };

  // Handle Resource Allocation
  const handleAllocateResource = (incidentId: string, resourceId: string, units: number, notes?: string) => {
    const resource = inventory.find(r => r.id === resourceId);
    if (!resource || resource.availableUnits < units) return;

    // Deduct available inventory
    setInventory((prev) =>
      prev.map((res) => {
        if (res.id === resourceId) {
          return {
            ...res,
            availableUnits: res.availableUnits - units,
            allocatedUnits: res.allocatedUnits + units
          };
        }
        return res;
      })
    );

    // Create allocation record
    const newAlloc: ResourceAllocation = {
      id: `alloc-${Date.now()}`,
      incidentId,
      resourceId,
      unitsRequested: units,
      priorityRationale: notes || `Direct allocation for high priority incident.`,
      status: 'approved',
      authorizedBy: 'Emergency Command Center',
      authorizedAt: new Date().toISOString()
    };

    setAllocations((prev) => [newAlloc, ...prev]);

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Logistics Commander',
        action: 'RESOURCE_AUTHORIZED',
        targetId: incidentId,
        details: `Authorized dispatch of ${units} units of ${resource.name} to incident ${incidentId}.`
      },
      ...prev
    ]);
  };

  // Approve a pending allocation
  const handleApproveAllocation = (allocationId: string) => {
    setAllocations((prev) =>
      prev.map((a) => {
        if (a.id === allocationId) {
          return {
            ...a,
            status: 'approved',
            authorizedBy: 'Duty Commander',
            authorizedAt: new Date().toISOString()
          };
        }
        return a;
      })
    );

    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'Field Operations Chief',
        action: 'DISPATCH_CONFIRMED',
        targetId: allocationId,
        details: `Confirmed operational dispatch approval for allocation record ${allocationId}.`
      },
      ...prev
    ]);
  };

  const handleSelectIncident = (inc: DisasterIncident) => {
    setSelectedIncident(inc);
    setIsDetailModalOpen(true);
  };

  const handleOpenCompare = (inc?: DisasterIncident) => {
    setCompareTargetIncident(inc || selectedIncident || incidents[0]);
    setIsCompareModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500/20 selection:text-rose-200">
      {/* Universal Header with Top Bar Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        language={language}
        onLanguageChange={setLanguage}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        onOpenWeights={() => setIsWeightsModalOpen(true)}
        onOpenAudit={() => setIsAuditModalOpen(true)}
        liveFeedCount={incidents.length}
        lastUpdated={lastUpdated}
      />

      {/* Main Viewport Routing */}
      <main className={`flex-1 flex flex-col ${currentTab === 'command' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        {currentTab === 'command' && (
          <CommandCenter
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={handleSelectIncident}
            onOpenWeights={() => setIsWeightsModalOpen(true)}
            onOpenCompare={handleOpenCompare}
            onRefreshFeeds={fetchLiveDisasterFeeds}
            isRefreshing={isRefreshing}
            weights={weights}
          />
        )}

        {currentTab === 'citizen' && (
          <CitizenPortal
            incidents={incidents}
            language={language}
            onExploreMap={() => setCurrentTab('command')}
            onOpenVoice={() => setIsVoiceModalOpen(true)}
            onSelectIncident={handleSelectIncident}
          />
        )}

        {currentTab === 'forecast' && (
          <ClimateForecasts />
        )}

        {currentTab === 'resources' && (
          <ResourceDispatchBoard
            inventory={inventory}
            allocations={allocations}
            incidents={incidents}
            onApproveAllocation={handleApproveAllocation}
            onRequestDispatch={handleAllocateResource}
          />
        )}

        {currentTab === 'vulnerability' && (
          <VulnerabilityMap />
        )}

        {currentTab === 'sdg' && (
          <SdgImpactView
            incidents={incidents}
            inventory={inventory}
          />
        )}
      </main>

      {/* MODAL 1: Incident Detail Drawer / Inspector */}
      {isDetailModalOpen && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setIsDetailModalOpen(false)}
          onStatusChange={handleStatusChange}
          onCompare={handleOpenCompare}
          onAllocateResource={handleAllocateResource}
          inventory={inventory}
          weights={weights}
        />
      )}

      {/* MODAL 2: Priority Weights Configurator */}
      {isWeightsModalOpen && (
        <WeightsConfigModal
          weights={weights}
          onSaveWeights={handleSaveWeights}
          onClose={() => setIsWeightsModalOpen(false)}
        />
      )}

      {/* MODAL 3: Compare Incidents Side-by-Side */}
      {isCompareModalOpen && compareTargetIncident && (
        <CompareIncidentsModal
          primaryIncident={compareTargetIncident}
          incidents={incidents}
          onClose={() => setIsCompareModalOpen(false)}
          weights={weights}
        />
      )}

      {/* MODAL 4: DisasterVoice Assistant */}
      {isVoiceModalOpen && (
        <DisasterVoiceModal
          onClose={() => setIsVoiceModalOpen(false)}
          language={language}
          onLanguageChange={setLanguage}
          incidents={incidents}
        />
      )}

      {/* MODAL 5: Decision Audit Trail */}
      {isAuditModalOpen && (
        <AuditTrailModal
          logs={auditLogs}
          onClose={() => setIsAuditModalOpen(false)}
        />
      )}
    </div>
  );
}
