import {
  ClimateRiskForecast,
  CriticalFacility,
  DisasterIncident,
  DistrictVulnerability
} from '../types/disaster';
import {
  calculatePriorityScore,
  DEFAULT_WEIGHTS,
  generateScoreExplanation,
  mapSeverityToHazardScore,
  normalizePopulationExposure
} from '../services/priorityEngine';

export const VERIFIED_FACILITIES: CriticalFacility[] = [
  {
    id: 'fac-hosp-01',
    name: 'Government Rajiv Gandhi General Hospital (Level 1 Trauma)',
    type: 'hospital',
    lat: 13.0818,
    lng: 80.2785,
    status: 'operational',
    capacity: 2500,
    currentOccupancy: 1820
  },
  {
    id: 'fac-hosp-02',
    name: 'Stanley Medical College & Hospital',
    type: 'hospital',
    lat: 13.1067,
    lng: 80.2872,
    status: 'operational',
    capacity: 1200,
    currentOccupancy: 980
  },
  {
    id: 'fac-shel-01',
    name: 'Jawaharlal Nehru Indoor Stadium Disaster Shelter',
    type: 'shelter',
    lat: 13.0844,
    lng: 80.2728,
    status: 'operational',
    capacity: 4000,
    currentOccupancy: 850
  },
  {
    id: 'fac-shel-02',
    name: 'Tambaram Community Relief Center',
    type: 'shelter',
    lat: 12.9249,
    lng: 80.1000,
    status: 'operational',
    capacity: 1500,
    currentOccupancy: 320
  },
  {
    id: 'fac-water-01',
    name: 'Kilpauk Water Treatment & Pumping Station',
    type: 'water_treatment',
    lat: 13.0800,
    lng: 80.2400,
    status: 'operational',
    capacity: 270000000 // liters/day
  },
  {
    id: 'fac-power-01',
    name: 'TANGEDCO 400kV Central Transmission Substation',
    type: 'power_substation',
    lat: 13.0450,
    lng: 80.2200,
    status: 'operational'
  },
  {
    id: 'fac-bridge-01',
    name: 'Adyar River Maraimalai Adigal Bridge',
    type: 'bridge',
    lat: 13.0110,
    lng: 80.2220,
    status: 'at_risk'
  }
];

export const DISTRICT_VULNERABILITIES: DistrictVulnerability[] = [
  {
    districtCode: 'TN-CHE',
    districtName: 'Chennai Urban Coastal',
    stateOrProvince: 'Tamil Nadu',
    country: 'India',
    population: 4681087,
    elderlyPercentage: 11.2,
    childPercentage: 9.8,
    povertyRate: 14.5,
    healthcareAccessibilityScore: 88,
    powerGridReliabilityScore: 82,
    potableWaterAccessRate: 78,
    overallSVI: 58.4
  },
  {
    districtCode: 'TN-CUD',
    districtName: 'Cuddalore Coastal Delta',
    stateOrProvince: 'Tamil Nadu',
    country: 'India',
    population: 2605914,
    elderlyPercentage: 12.8,
    childPercentage: 11.4,
    povertyRate: 28.2,
    healthcareAccessibilityScore: 52,
    powerGridReliabilityScore: 61,
    potableWaterAccessRate: 64,
    overallSVI: 74.2
  },
  {
    districtCode: 'AS-BAR',
    districtName: 'Barpeta Brahmaputra Basin',
    stateOrProvince: 'Assam',
    country: 'India',
    population: 1693622,
    elderlyPercentage: 7.9,
    childPercentage: 14.6,
    povertyRate: 36.4,
    healthcareAccessibilityScore: 38,
    powerGridReliabilityScore: 45,
    potableWaterAccessRate: 42,
    overallSVI: 84.6
  },
  {
    districtCode: 'MH-NAG',
    districtName: 'Nagpur Vidarbha Heat Belt',
    stateOrProvince: 'Maharashtra',
    country: 'India',
    population: 4653570,
    elderlyPercentage: 10.1,
    childPercentage: 10.5,
    povertyRate: 21.8,
    healthcareAccessibilityScore: 74,
    powerGridReliabilityScore: 75,
    potableWaterAccessRate: 62,
    overallSVI: 66.8
  },
  {
    districtCode: 'UK-CHA',
    districtName: 'Chamoli Himalayan Valley',
    stateOrProvince: 'Uttarakhand',
    country: 'India',
    population: 391605,
    elderlyPercentage: 11.4,
    childPercentage: 12.1,
    povertyRate: 24.5,
    healthcareAccessibilityScore: 35,
    powerGridReliabilityScore: 50,
    potableWaterAccessRate: 70,
    overallSVI: 72.1
  }
];

export const CLIMATE_FORECAST_DATA: ClimateRiskForecast[] = [
  {
    id: 'fc-flood-01',
    hazard: 'flood',
    locationName: 'Lower Adyar River Basin & South Coastal Corridor',
    coordinates: [13.0067, 80.2206],
    riskLevel: 'High',
    probabilityPercent: 78,
    forecastHorizon: 'Next 24 to 48 Hours',
    validUntil: '2026-10-10T18:00:00Z',
    keyIndicators: [
      { label: 'Forecast Precipitation', value: '185 mm / 24h', trend: 'rising' },
      { label: 'Upstream Chembarambakkam Reservoir Outflow', value: '8,200 cusecs', trend: 'rising' },
      { label: 'Estuary Tidal Surge High Tide Height', value: '1.42 meters', trend: 'steady' },
      { label: 'Soil Water Saturation Index', value: '92%', trend: 'rising' }
    ],
    precautionaryGuidance: [
      'Pre-position inflatable motorboats and SDRF rescue platoons along Saidapet and Jafferkhanpet.',
      'Alert primary health centers to stock anti-venom, ORS, and water-purification chlorine tablets.',
      'Prepare low-lying riverside colonies for preemptive relocation to designated multi-purpose shelters.'
    ],
    sourceModel: 'IMD Coastal Nowcast & Open-Meteo High-Resolution Hydrology Ensemble',
    dataFreshness: 'Updated 22 minutes ago'
  },
  {
    id: 'fc-heat-01',
    hazard: 'heatwave',
    locationName: 'Vidarbha Central Dry Belt (Nagpur-Chandrapur)',
    coordinates: [21.1458, 79.0882],
    riskLevel: 'Critical',
    probabilityPercent: 88,
    forecastHorizon: 'Next 72 Hours',
    validUntil: '2026-10-11T20:00:00Z',
    keyIndicators: [
      { label: 'Peak 2m Ambient Temperature', value: '44.8 °C', trend: 'rising' },
      { label: 'Calculated Wet-Bulb Heat Index', value: '32.4 °C (Extreme Danger)', trend: 'rising' },
      { label: 'Nighttime Minimum Cooling Recovery', value: '31.2 °C (Severe Stress)', trend: 'steady' },
      { label: 'Relative Humidity', value: '28%', trend: 'falling' }
    ],
    precautionaryGuidance: [
      'Enforce mandatory suspension of outdoor construction and manual agricultural labor between 11:30 AM and 4:00 PM.',
      'Activate cold-room cooling centers and misting stations at public bus interchanges and railway terminals.',
      'Issue targeted SMS warnings in Marathi and Hindi to MGNREGA workers and senior citizens.'
    ],
    sourceModel: 'WRF 3km Meso-Scale Numerical Prediction & IMD Heat Action Plan Trigger',
    dataFreshness: 'Updated 1 hour ago'
  },
  {
    id: 'fc-drought-01',
    hazard: 'drought',
    locationName: 'Marathwada Agricultural Rainshadow Zone',
    coordinates: [19.8762, 75.3433],
    riskLevel: 'Moderate',
    probabilityPercent: 65,
    forecastHorizon: 'Next 14 Days',
    validUntil: '2026-10-22T00:00:00Z',
    keyIndicators: [
      { label: 'Standardized Precipitation Index (SPI-3)', value: '-1.84 (Severe Deficit)', trend: 'falling' },
      { label: 'Root-Zone Soil Moisture Anomaly', value: '-38% vs 10-Yr Mean', trend: 'falling' },
      { label: 'Jayakwadi Reservoir Live Storage', value: '31.4% Capacity', trend: 'falling' },
      { label: 'NDVI Vegetation Stress Anomaly', value: '-0.22', trend: 'falling' }
    ],
    precautionaryGuidance: [
      'Prioritize municipal drinking water allocation over industrial extraction.',
      'Pre-deploy GPS-tracked emergency water tanker rosters for 142 rural taluks.',
      'Mobilize veterinary fodder camps and community livestock watering troughs.'
    ],
    sourceModel: 'CWC Reservoir Bulletin & NASA GRACE Terrestrial Water Anomaly',
    dataFreshness: 'Updated 4 hours ago'
  }
];

export function generateBaselineIncidents(): DisasterIncident[] {
  const rawIncidents: Omit<DisasterIncident, 'priorityScore' | 'priorityCategory' | 'factorBreakdown' | 'rationale'>[] = [
    {
      id: 'inc-tn-01',
      title: 'Adyar Basin Urban Flash Flood Inundation Alert',
      hazardType: 'flood',
      severityLevel: 'Critical',
      locationName: 'Saidapet & Kotturpuram, Chennai',
      country: 'India',
      coordinates: [13.0185, 80.2238],
      radiusKm: 6.5,
      reportedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      retrievedAt: new Date().toISOString(),
      source: 'Tamil Nadu SDMA & CWC River Gauge Network',
      sourceUrl: 'https://cwc.gov.in',
      sourceRecordId: 'CWC-ADY-2026-891',
      verificationStatus: 'official_warning',
      confidenceScore: 92,
      estimatedPopulation: 78500,
      vulnerabilityIndex: 72,
      urgencyLevel: 94,
      infrastructureImpactLevel: 85,
      impactedFacilities: [
        VERIFIED_FACILITIES[0],
        VERIFIED_FACILITIES[6]
      ],
      missingDataFields: [],
      status: 'active_triage',
      recommendedActions: [
        'Deploy 4 swift water rescue platoons with inflatable motor craft.',
        'Issue targeted SMS evacuation bulletin to zones within 500m of river embankment.',
        'Pre-stage standby diesel pumps at Kilpauk water pumping station.'
      ],
      dispatchedResources: ['Mobile Trauma Ambulances (4 units)']
    },
    {
      id: 'inc-ass-02',
      title: 'Brahmaputra Embankment Breach Threat',
      hazardType: 'flood',
      severityLevel: 'High',
      locationName: 'Barpeta District Riverine Plain, Assam',
      country: 'India',
      coordinates: [26.3200, 91.0000],
      radiusKm: 18.0,
      reportedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
      retrievedAt: new Date().toISOString(),
      source: 'Assam State Disaster Management Authority (ASDMA)',
      sourceUrl: 'https://asdma.assam.gov.in',
      sourceRecordId: 'ASDMA-BR-1044',
      verificationStatus: 'confirmed_observation',
      confidenceScore: 86,
      estimatedPopulation: 142000,
      vulnerabilityIndex: 88,
      urgencyLevel: 82,
      infrastructureImpactLevel: 68,
      impactedFacilities: [
        {
          id: 'fac-ass-01',
          name: 'Barpeta Civil Hospital',
          type: 'hospital',
          lat: 26.3240,
          lng: 91.0060,
          status: 'at_risk'
        }
      ],
      missingDataFields: ['Telemetry on secondary village spur roads'],
      status: 'active_triage',
      recommendedActions: [
        'Geobag reinforcement along vulnerable 350-meter river dyke.',
        'Air-drop ready-to-eat ration packets to marooned char islands.',
        'Mobilize temporary livestock shelters on higher bunds.'
      ],
      dispatchedResources: []
    },
    {
      id: 'inc-mh-03',
      title: 'Severe Wet-Bulb Heatwave Emergency (Code Red)',
      hazardType: 'heatwave',
      severityLevel: 'Critical',
      locationName: 'Nagpur Metropolitan Region, Maharashtra',
      country: 'India',
      coordinates: [21.1458, 79.0882],
      radiusKm: 25.0,
      reportedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
      retrievedAt: new Date().toISOString(),
      source: 'IMD National Weather Forecasting Centre',
      sourceUrl: 'https://mausam.imd.gov.in',
      sourceRecordId: 'IMD-HW-RED-07',
      verificationStatus: 'official_warning',
      confidenceScore: 94,
      estimatedPopulation: 420000,
      vulnerabilityIndex: 68,
      urgencyLevel: 88,
      infrastructureImpactLevel: 60,
      impactedFacilities: [],
      missingDataFields: [],
      status: 'active_triage',
      recommendedActions: [
        'Trigger Heat Action Plan Level 3: halt afternoon outdoor manual work.',
        'Distribute oral rehydration solutions at 84 transit hubs.',
        'Ensure continuous 24/7 dedicated electricity feeder lines to all ICU wards.'
      ],
      dispatchedResources: ['Water Tanker Fleet (8 units)']
    },
    {
      id: 'inc-uk-04',
      title: 'Himalayan Arterial Highway Landslide Blockade',
      hazardType: 'landslide',
      severityLevel: 'High',
      locationName: 'Badrinath National Highway (NH-7), Chamoli',
      country: 'India',
      coordinates: [30.4000, 79.3300],
      radiusKm: 5.0,
      reportedAt: new Date(Date.now() - 200 * 60 * 1000).toISOString(),
      retrievedAt: new Date().toISOString(),
      source: 'Border Roads Organisation (BRO) & Uttarakhand Police',
      sourceUrl: 'https://bro.gov.in',
      sourceRecordId: 'BRO-CHA-882',
      verificationStatus: 'confirmed_observation',
      confidenceScore: 89,
      estimatedPopulation: 6500,
      vulnerabilityIndex: 76,
      urgencyLevel: 80,
      infrastructureImpactLevel: 92,
      impactedFacilities: [
        {
          id: 'fac-uk-br',
          name: 'Alaknanda River Gorge Access Bridge',
          type: 'bridge',
          lat: 30.3950,
          lng: 79.3280,
          status: 'compromised'
        }
      ],
      missingDataFields: ['Geotechnical slope stability lidar data'],
      status: 'dispatch_in_progress',
      recommendedActions: [
        'Deploy heavy hydraulic rock breakers and wheeled bulldozers.',
        'Establish medical aid station for 1,200 stranded pilgrim vehicles.',
        'Broadcast detour advisories via local FM radio and emergency SMS.'
      ],
      dispatchedResources: ['Excavator Squad 2', 'Medical First Responders (3)']
    },
    {
      id: 'inc-od-05',
      title: 'Bay of Bengal Deep Depression Cyclonic Alert',
      hazardType: 'cyclone',
      severityLevel: 'High',
      locationName: 'Gopalpur Coastal Sector, Odisha',
      country: 'India',
      coordinates: [19.2600, 84.8600],
      radiusKm: 35.0,
      reportedAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
      retrievedAt: new Date().toISOString(),
      source: 'IMD Regional Specialized Meteorological Centre',
      sourceUrl: 'https://rsmcnewdelhi.imd.gov.in',
      sourceRecordId: 'IMD-BOB-CYC-04',
      verificationStatus: 'official_warning',
      confidenceScore: 91,
      estimatedPopulation: 210000,
      vulnerabilityIndex: 79,
      urgencyLevel: 75,
      infrastructureImpactLevel: 70,
      impactedFacilities: [
        {
          id: 'fac-od-shel',
          name: 'Gopalpur Cyclone Multipurpose Shelter',
          type: 'shelter',
          lat: 19.2630,
          lng: 84.8640,
          status: 'operational',
          capacity: 2000,
          currentOccupancy: 450
        }
      ],
      missingDataFields: [],
      status: 'active_triage',
      recommendedActions: [
        'Order return of all deep-sea fishing trawlers to port immediately.',
        'Pre-position ODRAF rescue battalions and satellite communication kits.',
        'Inspect backup diesel generators at district headquarters hospital.'
      ],
      dispatchedResources: []
    },
    {
      id: 'inc-dl-06',
      title: 'Yamuna Water Level Exceeding Warning Mark',
      hazardType: 'flood',
      severityLevel: 'Moderate',
      locationName: 'Old Railway Bridge (Loha Pul), Delhi',
      country: 'India',
      coordinates: [28.6650, 77.2450],
      radiusKm: 8.0,
      reportedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
      retrievedAt: new Date().toISOString(),
      source: 'Central Water Commission (CWC) Delhi Gauge',
      sourceUrl: 'https://cwc.gov.in',
      sourceRecordId: 'CWC-DEL-YAM-33',
      verificationStatus: 'confirmed_observation',
      confidenceScore: 96,
      estimatedPopulation: 34000,
      vulnerabilityIndex: 65,
      urgencyLevel: 62,
      infrastructureImpactLevel: 55,
      impactedFacilities: [],
      missingDataFields: [],
      status: 'active_triage',
      recommendedActions: [
        'Erect temporary barricades around Yamuna floodplain settlements.',
        'Inspect drainage sluice gates near Kashmere Gate ISBT.',
        'Keep civil defense volunteers on 2-hour standby call.'
      ],
      dispatchedResources: []
    }
  ];

  return rawIncidents.map(item => {
    const hazardScore = mapSeverityToHazardScore(item.severityLevel);
    const popScore = normalizePopulationExposure(item.estimatedPopulation);
    const { priorityScore, priorityCategory, factorBreakdown } = calculatePriorityScore(
      hazardScore,
      popScore,
      item.vulnerabilityIndex,
      item.urgencyLevel,
      item.infrastructureImpactLevel,
      DEFAULT_WEIGHTS
    );

    const rationale = generateScoreExplanation(
      {
        ...item,
        priorityScore,
        priorityCategory,
        factorBreakdown
      },
      DEFAULT_WEIGHTS
    );

    return {
      ...item,
      priorityScore,
      priorityCategory,
      factorBreakdown,
      rationale
    };
  });
}
