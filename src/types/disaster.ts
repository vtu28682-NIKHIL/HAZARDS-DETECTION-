export type HazardType = 
  | 'flood'
  | 'storm'
  | 'heatwave'
  | 'drought'
  | 'cyclone'
  | 'earthquake'
  | 'wildfire'
  | 'landslide'
  | 'infrastructure_outage'
  | 'tsunami';

export type PriorityCategory = 'Critical' | 'High' | 'Moderate' | 'Low';

export type SeverityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export type VerificationStatus = 
  | 'official_warning'
  | 'confirmed_observation'
  | 'forecast_model'
  | 'unverified_community';

export type IncidentStatus = 
  | 'active_triage'
  | 'verified'
  | 'dispatch_in_progress'
  | 'contained'
  | 'resolved';

export interface FactorBreakdown {
  hazardSeverityScore: number;       // 0-100
  populationExposureScore: number;   // 0-100
  communityVulnerabilityScore: number; // 0-100
  urgencyScore: number;              // 0-100
  criticalInfrastructureScore: number; // 0-100
  weightedTotal: number;             // 0-100
}

export interface ScoringWeights {
  hazardSeverity: number;       // default 30
  populationExposure: number;   // default 25
  communityVulnerability: number; // default 20
  urgency: number;              // default 15
  criticalInfrastructure: number; // default 10
}

export interface CriticalFacility {
  id: string;
  name: string;
  type: 'hospital' | 'shelter' | 'water_treatment' | 'power_substation' | 'bridge';
  lat: number;
  lng: number;
  status: 'operational' | 'at_risk' | 'compromised' | 'evacuated';
  capacity?: number;
  currentOccupancy?: number;
  distanceKm?: number;
}

export interface DisasterIncident {
  id: string;
  title: string;
  hazardType: HazardType;
  severityLevel: SeverityLevel;
  locationName: string;
  country: string;
  coordinates: [number, number]; // [lat, lng]
  radiusKm: number;
  reportedAt: string;
  retrievedAt: string;
  source: string;
  sourceUrl?: string;
  sourceRecordId?: string;
  verificationStatus: VerificationStatus;
  confidenceScore: number; // 0 - 100, evaluated independently
  
  // Raw and estimated factors
  estimatedPopulation: number;
  vulnerabilityIndex: number; // 0 - 100
  urgencyLevel: number; // 0 - 100
  infrastructureImpactLevel: number; // 0 - 100
  impactedFacilities: CriticalFacility[];
  missingDataFields: string[];
  
  // Priority calculation result
  priorityScore: number; // 0 - 100
  priorityCategory: PriorityCategory;
  factorBreakdown: FactorBreakdown;
  rationale: string;
  
  // Response management
  status: IncidentStatus;
  recommendedActions: string[];
  dispatchedResources: string[];
  assignedCommander?: string;
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface EmergencyResource {
  id: string;
  name: string;
  category: 'medical' | 'rescue' | 'shelter' | 'water' | 'food' | 'earthmoving' | 'communications';
  totalUnits: number;
  availableUnits: number;
  allocatedUnits: number;
  unitType: string;
  baseStation: string;
  coordinates: [number, number];
  leadTimeHours: number;
}

export interface ResourceAllocation {
  id: string;
  incidentId: string;
  resourceId: string;
  unitsRequested: number;
  priorityRationale: string;
  authorizedBy?: string;
  authorizedAt?: string;
  status: 'recommended' | 'approved' | 'en_route' | 'delivered' | 'cancelled';
}

export interface DistrictVulnerability {
  districtCode: string;
  districtName: string;
  stateOrProvince: string;
  country: string;
  population: number;
  elderlyPercentage: number;
  childPercentage: number;
  povertyRate: number;
  healthcareAccessibilityScore: number; // 0-100 (higher = better access)
  powerGridReliabilityScore: number; // 0-100
  potableWaterAccessRate: number; // 0-100
  overallSVI: number; // Social Vulnerability Index 0-100 (higher = more vulnerable)
}

export interface ClimateRiskForecast {
  id: string;
  hazard: 'flood' | 'heatwave' | 'drought';
  locationName: string;
  coordinates: [number, number];
  riskLevel: SeverityLevel;
  probabilityPercent: number;
  forecastHorizon: string; // e.g. "Next 24 to 72 hours"
  validUntil: string;
  keyIndicators: {
    label: string;
    value: string;
    trend: 'rising' | 'steady' | 'falling';
  }[];
  precautionaryGuidance: string[];
  sourceModel: string;
  dataFreshness: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetId: string;
  details: string;
}

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'bn' | 'mr';

export interface AiBriefingResponse {
  incidentId: string;
  overview: string;
  knownFacts: string[];
  uncertainties: string[];
  affectedCommunities: string;
  criticalFacilitiesAtRisk: string[];
  priorityScoreExplanation: string;
  immediateAssessmentSteps: string[];
  recommendedResourceList: string[];
  dataFreshnessSummary: string;
  verificationChecklist: string[];
}
