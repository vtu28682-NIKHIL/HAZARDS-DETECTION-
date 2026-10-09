import {
  DisasterIncident,
  EmergencyResource,
  ResourceAllocation
} from '../types/disaster';

export const INITIAL_RESOURCE_INVENTORY: EmergencyResource[] = [
  {
    id: 'res-ndrf-01',
    name: 'National Disaster Response Squad (NDRF Unit Alpha)',
    category: 'rescue',
    totalUnits: 12,
    availableUnits: 8,
    allocatedUnits: 4,
    unitType: 'Teams (45 personnel + inflatable boats)',
    baseStation: 'Regional Response Depot, Arakkonam',
    coordinates: [13.0827, 79.6677],
    leadTimeHours: 1.5
  },
  {
    id: 'res-med-icu',
    name: 'Mobile Trauma & Critical Care Ambulances',
    category: 'medical',
    totalUnits: 40,
    availableUnits: 26,
    allocatedUnits: 14,
    unitType: 'Advanced Life Support Vehicles',
    baseStation: 'Central Emergency Command, Chennai',
    coordinates: [13.0827, 80.2707],
    leadTimeHours: 0.75
  },
  {
    id: 'res-water-pur',
    name: 'High-Capacity Mobile RO Water Filtration Units',
    category: 'water',
    totalUnits: 18,
    availableUnits: 12,
    allocatedUnits: 6,
    unitType: '20,000 Liters/Hour Containerized Units',
    baseStation: 'Metrowater Logistics Base',
    coordinates: [13.0674, 80.2376],
    leadTimeHours: 2.0
  },
  {
    id: 'res-shelter-kit',
    name: 'All-Weather Disaster Relief Shelter Kits',
    category: 'shelter',
    totalUnits: 250,
    availableUnits: 180,
    allocatedUnits: 70,
    unitType: 'Multi-family Geodesic Shelter Tents',
    baseStation: 'Red Cross Disaster Warehouse',
    coordinates: [13.0475, 80.2090],
    leadTimeHours: 3.0
  },
  {
    id: 'res-food-ration',
    name: 'Emergency Ready-to-Eat Humanitarian Ration Packs',
    category: 'food',
    totalUnits: 5000,
    availableUnits: 3800,
    allocatedUnits: 1200,
    unitType: '72-Hour Family Nutrition Packs',
    baseStation: 'Civil Supplies Godown, Ambattur',
    coordinates: [13.1143, 80.1548],
    leadTimeHours: 2.5
  },
  {
    id: 'res-earth-clear',
    name: 'Hydraulic Excavators & Debris Clearance Units',
    category: 'earthmoving',
    totalUnits: 15,
    availableUnits: 11,
    allocatedUnits: 4,
    unitType: 'Heavy Tracked Excavator Units',
    baseStation: 'Highways Emergency Division, Guindy',
    coordinates: [13.0067, 80.2026],
    leadTimeHours: 1.8
  },
  {
    id: 'res-sat-comm',
    name: 'Rapid Deployment Satellite Mesh Terminals',
    category: 'communications',
    totalUnits: 20,
    availableUnits: 16,
    allocatedUnits: 4,
    unitType: 'Solar-Assisted VSAT Ground Terminals',
    baseStation: 'State Disaster Management Authority HQ',
    coordinates: [13.0500, 80.2824],
    leadTimeHours: 1.0
  }
];

export interface RecommendationDraft {
  resource: EmergencyResource;
  unitsRecommended: number;
  priorityRationale: string;
  isAvailable: boolean;
}

/**
 * Generate intelligent resource recommendations based on incident priority and hazard dynamics
 */
export function recommendResourcesForIncident(
  incident: DisasterIncident,
  inventory: EmergencyResource[]
): RecommendationDraft[] {
  const recommendations: RecommendationDraft[] = [];

  const isCriticalOrHigh = incident.priorityCategory === 'Critical' || incident.priorityCategory === 'High';
  const populationScale = incident.estimatedPopulation;

  // Rule 1: Floods / Flash Floods / Cyclones
  if (incident.hazardType === 'flood' || incident.hazardType === 'cyclone' || incident.hazardType === 'tsunami') {
    const rescueRes = inventory.find(r => r.category === 'rescue');
    if (rescueRes) {
      const unitsNeeded = isCriticalOrHigh ? Math.min(rescueRes.availableUnits, 4) : 2;
      recommendations.push({
        resource: rescueRes,
        unitsRecommended: unitsNeeded,
        priorityRationale: `Swift water rescue and boat evacuations urgently needed due to rising flood inundation threatening ${populationScale.toLocaleString()} residents.`,
        isAvailable: rescueRes.availableUnits >= unitsNeeded
      });
    }

    const waterRes = inventory.find(r => r.category === 'water');
    if (waterRes) {
      const units = isCriticalOrHigh ? Math.min(waterRes.availableUnits, 3) : 1;
      recommendations.push({
        resource: waterRes,
        unitsRecommended: units,
        priorityRationale: 'Municipal water mains and open wells face floodwater contamination; deploy mobile purification.',
        isAvailable: waterRes.availableUnits >= units
      });
    }
  }

  // Rule 2: Earthquakes / Landslides
  if (incident.hazardType === 'earthquake' || incident.hazardType === 'landslide') {
    const earthRes = inventory.find(r => r.category === 'earthmoving');
    if (earthRes) {
      const units = isCriticalOrHigh ? Math.min(earthRes.availableUnits, 3) : 1;
      recommendations.push({
        resource: earthRes,
        unitsRecommended: units,
        priorityRationale: 'Debris blockage on arterial rescue corridors and collapsed infrastructure access requires heavy hydraulic clearance.',
        isAvailable: earthRes.availableUnits >= units
      });
    }
  }

  // Rule 3: Extreme Heatwave
  if (incident.hazardType === 'heatwave') {
    const medRes = inventory.find(r => r.category === 'medical');
    if (medRes) {
      const units = isCriticalOrHigh ? Math.min(medRes.availableUnits, 6) : 3;
      recommendations.push({
        resource: medRes,
        unitsRecommended: units,
        priorityRationale: 'Severe heat stress & wet-bulb index elevation; deploy mobile IV rehydration and cooling triage ambulances.',
        isAvailable: medRes.availableUnits >= units
      });
    }

    const waterRes = inventory.find(r => r.category === 'water');
    if (waterRes) {
      const units = Math.min(waterRes.availableUnits, 4);
      recommendations.push({
        resource: waterRes,
        unitsRecommended: units,
        priorityRationale: 'Establish urgent public hydration hubs for outdoor workers and vulnerable elderly communities.',
        isAvailable: waterRes.availableUnits >= units
      });
    }
  }

  // Universal medical support for high severity
  if (isCriticalOrHigh && !recommendations.some(r => r.resource.category === 'medical')) {
    const medRes = inventory.find(r => r.category === 'medical');
    if (medRes) {
      const units = Math.min(medRes.availableUnits, 5);
      recommendations.push({
        resource: medRes,
        unitsRecommended: units,
        priorityRationale: `Field trauma stabilization and hospital transfer support for high-priority hazard area (${incident.priorityScore}/100).`,
        isAvailable: medRes.availableUnits >= units
      });
    }
  }

  // Emergency Shelter for large displaced population
  if (populationScale > 10000 && isCriticalOrHigh) {
    const shelterRes = inventory.find(r => r.category === 'shelter');
    if (shelterRes) {
      const units = Math.min(shelterRes.availableUnits, 30);
      recommendations.push({
        resource: shelterRes,
        unitsRecommended: units,
        priorityRationale: `Provide temporary weatherproof shelter capacity for displaced households near relief staging zone.`,
        isAvailable: shelterRes.availableUnits >= units
      });
    }
  }

  // Satellite Communications if infrastructure is heavily impacted
  if (incident.infrastructureImpactLevel > 60) {
    const commRes = inventory.find(r => r.category === 'communications');
    if (commRes) {
      recommendations.push({
        resource: commRes,
        unitsRecommended: 2,
        priorityRationale: 'Ground telecommunications towers degraded; establish satellite mesh bridge for responders.',
        isAvailable: commRes.availableUnits >= 2
      });
    }
  }

  return recommendations;
}
