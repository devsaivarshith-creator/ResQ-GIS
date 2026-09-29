import type { Habitation, RelocationSite } from '../types';

export interface RouteDetails {
  modeLabel: string;
  modeIcon: string;
  vehicleType: string;
  distKm: number;
  journeyTimeStr: string;
  corridor: string;
  speedKmH: number;
  inundationRisk: 'LOW' | 'MODERATE' | 'HIGH';
}

export function getRouteDetails(hab: Habitation, site?: RelocationSite | null): RouteDetails {
  const distKm = site?.distanceFromAffected || 12.5;
  const isFlood = hab.hazardExposure.some(
    (he) => he.type === 'flood' && (he.level === 'HIGH' || he.level === 'CRITICAL')
  );
  const isGLOF = hab.hazardExposure.some(
    (he) => he.type === 'glof' && (he.level === 'HIGH' || he.level === 'CRITICAL')
  );
  const isHighAltitude = (hab.location.elevation || 1500) > 1800;

  let modeLabel = 'Heavy Evacuation Bus';
  let modeIcon = '🚌';
  let speedKmH = 32;
  let vehicleType = '45-Seater High-Clearance State Transport Bus';
  let inundationRisk: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';

  if (isGLOF || (isHighAltitude && hab.riskLevel === 'CRITICAL')) {
    modeLabel = 'Air / Helicopter Sortie';
    modeIcon = '🚁';
    speedKmH = 80;
    vehicleType = 'Mi-17V5 / ALH Dhruv SAR Helicopter Sortie';
    inundationRisk = 'LOW';
  } else if (isFlood && hab.vulnerabilityIndex.overall > 0.6) {
    modeLabel = 'Motorboat / Flood Vessel';
    modeIcon = '🚤';
    speedKmH = 22;
    vehicleType = 'NDRF Inflatable Motorized Rescue Boat';
    inundationRisk = 'HIGH';
  } else if (isHighAltitude) {
    modeLabel = 'Heavy 4x4 Off-Road Truck';
    modeIcon = '🚜';
    speedKmH = 24;
    vehicleType = 'Army 4x4 All-Terrain Stallion Troop Carrier';
    inundationRisk = 'MODERATE';
  } else if (isFlood) {
    inundationRisk = 'HIGH';
  }

  const travelMins = Math.round((distKm / speedKmH) * 60);
  const journeyTimeStr =
    travelMins >= 60
      ? `${Math.floor(travelMins / 60)}h ${travelMins % 60}m`
      : `${travelMins} mins`;

  return {
    modeLabel,
    modeIcon,
    vehicleType,
    distKm,
    journeyTimeStr,
    speedKmH,
    inundationRisk,
    corridor: site?.lifelineCorridor || 'NH Lifeline Highway',
  };
}

export interface PriorityRecommendation {
  recommendedId: string;
  recommendedName: string;
  priorityScoreA: number;
  priorityScoreB: number;
  deltaRiskPct: number;
  deltaPop: number;
  primaryRationale: string;
  secondaryRationale: string;
}

export function evaluateEvacuationPriority(
  habA: Habitation,
  habB: Habitation,
  siteA?: RelocationSite | null,
  siteB?: RelocationSite | null
): PriorityRecommendation {
  // Score formula: Risk (45%) + Population Exposure (30%) + Vulnerability (25%)
  const normRiskA = habA.riskScore;
  const normRiskB = habB.riskScore;
  const maxPop = Math.max(habA.population, habB.population, 1);
  const popFactorA = habA.population / maxPop;
  const popFactorB = habB.population / maxPop;
  const vulnFactorA = habA.vulnerabilityIndex.overall;
  const vulnFactorB = habB.vulnerabilityIndex.overall;

  const scoreA = normRiskA * 45 + popFactorA * 30 + vulnFactorA * 25;
  const scoreB = normRiskB * 45 + popFactorB * 30 + vulnFactorB * 25;

  const deltaRisk = Math.round((normRiskA - normRiskB) * 100);
  const deltaPop = habA.population - habB.population;

  const isA = scoreA >= scoreB;
  const winner = isA ? habA : habB;
  const loser = isA ? habB : habA;

  let primaryRationale = '';
  if (Math.abs(deltaRisk) >= 5) {
    primaryRationale = `${winner.name} exhibits a higher composite risk severity (${Math.round(winner.riskScore * 100)}% vs ${Math.round(loser.riskScore * 100)}%).`;
  } else if (Math.abs(deltaPop) >= 200) {
    primaryRationale = `${winner.name} has a substantially larger civilian population exposed (${winner.population.toLocaleString()} vs ${loser.population.toLocaleString()}).`;
  } else {
    primaryRationale = `${winner.name} has higher community vulnerability (${Math.round(winner.vulnerabilityIndex.overall * 100)}% HVI) requiring prioritized immediate evacuation.`;
  }

  const site = isA ? siteA : siteB;
  const secondaryRationale = site
    ? `Designated destination "${site.name}" has ${site.capacity.toLocaleString()} beds capacity with ${site.foodStockDays || 14} days ration buffer.`
    : `Priority Stage 1 corridor dispatch authorized.`;

  return {
    recommendedId: winner.id,
    recommendedName: winner.name,
    priorityScoreA: Math.round(scoreA),
    priorityScoreB: Math.round(scoreB),
    deltaRiskPct: Math.abs(deltaRisk),
    deltaPop: Math.abs(deltaPop),
    primaryRationale,
    secondaryRationale,
  };
}
