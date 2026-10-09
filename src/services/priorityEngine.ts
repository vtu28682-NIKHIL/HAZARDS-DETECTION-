import {
  DisasterIncident,
  FactorBreakdown,
  PriorityCategory,
  ScoringWeights,
  SeverityLevel
} from '../types/disaster';

export const DEFAULT_WEIGHTS: ScoringWeights = {
  hazardSeverity: 30,
  populationExposure: 25,
  communityVulnerability: 20,
  urgency: 15,
  criticalInfrastructure: 10
};

/**
 * Normalizes population exposure on a logarithmic scale (0 - 100)
 * 0 exposure = 0
 * 1,000 = ~35
 * 25,000 = ~65
 * 100,000 = ~80
 * 500,000+ = 100
 */
export function normalizePopulationExposure(population: number): number {
  if (population <= 0) return 5;
  // Logarithmic scale clamped between 5 and 100
  const logVal = Math.log10(Math.max(1, population));
  // log10(1) = 0, log10(500,000) ~= 5.7
  const score = Math.min(100, Math.round((logVal / 5.7) * 100));
  return Math.max(5, score);
}

/**
 * Map reported severity string to a 0-100 hazard severity scale
 */
export function mapSeverityToHazardScore(severity: SeverityLevel): number {
  switch (severity) {
    case 'Critical': return 95;
    case 'High': return 75;
    case 'Moderate': return 45;
    case 'Low': return 20;
    default: return 30;
  }
}

/**
 * Calculates priority score from normalized inputs and custom weights
 */
export function calculatePriorityScore(
  hazardScore: number,
  populationScore: number,
  vulnerabilityScore: number,
  urgencyScore: number,
  infrastructureScore: number,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): {
  priorityScore: number;
  priorityCategory: PriorityCategory;
  factorBreakdown: FactorBreakdown;
} {
  // Normalize weights to sum to 100 if user modified them
  const weightSum = 
    weights.hazardSeverity +
    weights.populationExposure +
    weights.communityVulnerability +
    weights.urgency +
    weights.criticalInfrastructure;
  
  const wHazard = weightSum > 0 ? (weights.hazardSeverity / weightSum) * 100 : 30;
  const wPop = weightSum > 0 ? (weights.populationExposure / weightSum) * 100 : 25;
  const wVuln = weightSum > 0 ? (weights.communityVulnerability / weightSum) * 100 : 20;
  const wUrg = weightSum > 0 ? (weights.urgency / weightSum) * 100 : 15;
  const wInfra = weightSum > 0 ? (weights.criticalInfrastructure / weightSum) * 100 : 10;

  const contribHazard = (hazardScore * wHazard) / 100;
  const contribPop = (populationScore * wPop) / 100;
  const contribVuln = (vulnerabilityScore * wVuln) / 100;
  const contribUrg = (urgencyScore * wUrg) / 100;
  const contribInfra = (infrastructureScore * wInfra) / 100;

  const total = Math.min(100, Math.max(0, Math.round(
    contribHazard + contribPop + contribVuln + contribUrg + contribInfra
  )));

  let category: PriorityCategory = 'Low';
  if (total >= 80) {
    category = 'Critical';
  } else if (total >= 60) {
    category = 'High';
  } else if (total >= 35) {
    category = 'Moderate';
  } else {
    category = 'Low';
  }

  const factorBreakdown: FactorBreakdown = {
    hazardSeverityScore: Math.round(contribHazard * 10) / 10,
    populationExposureScore: Math.round(contribPop * 10) / 10,
    communityVulnerabilityScore: Math.round(contribVuln * 10) / 10,
    urgencyScore: Math.round(contribUrg * 10) / 10,
    criticalInfrastructureScore: Math.round(contribInfra * 10) / 10,
    weightedTotal: total
  };

  return {
    priorityScore: total,
    priorityCategory: category,
    factorBreakdown
  };
}

/**
 * Generates an explainable text breakdown for why this incident received this score
 */
export function generateScoreExplanation(
  incident: Partial<DisasterIncident>,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): string {
  const breakdown = incident.factorBreakdown;
  if (!breakdown) return 'Awaiting factor calculation.';

  const factors = [
    { name: 'Hazard Severity', score: breakdown.hazardSeverityScore, weight: weights.hazardSeverity },
    { name: 'Population Exposure', score: breakdown.populationExposureScore, weight: weights.populationExposure },
    { name: 'Community Vulnerability', score: breakdown.communityVulnerabilityScore, weight: weights.communityVulnerability },
    { name: 'Urgency & Time Sensitivity', score: breakdown.urgencyScore, weight: weights.urgency },
    { name: 'Critical Infrastructure Impact', score: breakdown.criticalInfrastructureScore, weight: weights.criticalInfrastructure }
  ];

  // Sort by highest contributing factor
  factors.sort((a, b) => b.score - a.score);
  const primaryFactor = factors[0];
  const secondaryFactor = factors[1];

  let explanation = `Scored ${breakdown.weightedTotal}/100 (${incident.priorityCategory}). `;
  explanation += `Primary driver is ${primaryFactor.name} contributing ${primaryFactor.score} pts (weight ${primaryFactor.weight}%), followed by ${secondaryFactor.name} contributing ${secondaryFactor.score} pts. `;

  if (incident.missingDataFields && incident.missingDataFields.length > 0) {
    explanation += `Note: Assessment has provisional confidence (${incident.confidenceScore}%) due to missing ${incident.missingDataFields.join(', ')}.`;
  }

  return explanation;
}

/**
 * Compare two incidents and explain why Incident A ranks higher/lower than Incident B
 */
export function compareIncidents(
  a: DisasterIncident,
  b: DisasterIncident,
  weights: ScoringWeights = DEFAULT_WEIGHTS
): {
  higherIncident: DisasterIncident;
  lowerIncident: DisasterIncident;
  pointDifference: number;
  decisiveFactors: string[];
  explanation: string;
} {
  const diff = a.priorityScore - b.priorityScore;
  const higher = diff >= 0 ? a : b;
  const lower = diff >= 0 ? b : a;
  const absDiff = Math.abs(diff);

  const deltaHazard = higher.factorBreakdown.hazardSeverityScore - lower.factorBreakdown.hazardSeverityScore;
  const deltaPop = higher.factorBreakdown.populationExposureScore - lower.factorBreakdown.populationExposureScore;
  const deltaVuln = higher.factorBreakdown.communityVulnerabilityScore - lower.factorBreakdown.communityVulnerabilityScore;
  const deltaUrg = higher.factorBreakdown.urgencyScore - lower.factorBreakdown.urgencyScore;
  const deltaInfra = higher.factorBreakdown.criticalInfrastructureScore - lower.factorBreakdown.criticalInfrastructureScore;

  const factorDeltas = [
    { factor: 'Hazard Severity', delta: deltaHazard },
    { factor: 'Population Exposure', delta: deltaPop },
    { factor: 'Community Vulnerability', delta: deltaVuln },
    { factor: 'Urgency', delta: deltaUrg },
    { factor: 'Critical Infrastructure Impact', delta: deltaInfra }
  ].filter(item => item.delta > 1.5)
   .sort((x, y) => y.delta - x.delta);

  const decisiveFactors = factorDeltas.map(f => `${f.factor} (+${f.delta.toFixed(1)} pts)`);

  let explanation = `"${higher.title}" ranks ${absDiff} points higher than "${lower.title}". `;
  if (factorDeltas.length > 0) {
    explanation += `The difference is primarily governed by higher ${factorDeltas.map(f => f.factor).join(', ')}.`;
  } else {
    explanation += `Scores are closely matched with marginal differences across multiple vulnerability and response criteria.`;
  }

  return {
    higherIncident: higher,
    lowerIncident: lower,
    pointDifference: absDiff,
    decisiveFactors,
    explanation
  };
}
