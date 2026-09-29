/**
 * ResQ-GIS Risk Classification & Dynamic Spectral Scale
 * 
 * Standard bands:
 *  0–30%   → Low
 *  30–60%  → Moderate
 *  60–80%  → High
 *  80–100% → Red Zone
 * 
 * Continuous Color Gradient:
 *  Every integer has a mathematically unique hex color.
 *  In the 80–100 Red Zone, every score gets progressively darker red
 *  (e.g., 96% is visibly darker crimson than 95%).
 */

export interface RiskBandInfo {
  label: 'Low' | 'Moderate' | 'High' | 'Red Zone';
  percentage: number; // 0 to 100
  color: string;      // dynamic color for this exact score
  textColor: string;  // high-contrast text color
  bgSubtle: string;   // transparent subtle tint
  borderColor: string;
}

export interface FeatureWeightageBreakdown {
  hazardWeight: number;        // 40
  exposureWeight: number;      // 35
  vulnerabilityWeight: number; // 25
  hazardContribution: number;  // (H_i * 40)%
  exposureContribution: number;// (E_i * 35)%
  vulnerabilityContribution: number; // (V_i * 25)%
  collectiveScore: number;     // Sum out of 100%
  formulaString: string;
}

/**
 * Normalizes any score (0–1 float or 0–100 integer) to an integer percentage 0–100.
 */
export function toRiskPercentage(score: number | undefined | null): number {
  if (score === undefined || score === null || isNaN(score)) return 0;
  const p = Math.round(score <= 1.0 && score > 0 ? score * 100 : score);
  return Math.max(0, Math.min(100, p));
}

/**
 * Returns dynamic hex color for any integer score 0–100.
 * In the 80–100 Red Zone, 96 is darker red than 95.
 */
export function getRiskColor(score: number): string {
  const p = toRiskPercentage(score);

  if (p <= 30) {
    // 0–30: Low Risk (Mint #34d399 to Emerald #10b981)
    const t = p / 30.0;
    const r = Math.round(52 + (16 - 52) * t);
    const g = Math.round(211 + (185 - 211) * t);
    const b = Math.round(153 + (129 - 153) * t);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else if (p <= 60) {
    // 30–60: Moderate Risk (Golden Yellow #eab308 to Warm Amber #d97706)
    const t = (p - 30) / 30.0;
    const r = Math.round(234 + (217 - 234) * t);
    const g = Math.round(179 + (119 - 179) * t);
    const b = Math.round(8 + (6 - 8) * t);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else if (p <= 80) {
    // 60–80: High Risk (Bright Orange #f97316 to Vermilion #ef4444)
    const t = (p - 60) / 20.0;
    const r = Math.round(249 + (239 - 249) * t);
    const g = Math.round(115 + (68 - 115) * t);
    const b = Math.round(22 + (68 - 22) * t);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  } else {
    // 80–100: Red Zone (Bright Crimson #ef4444 to Deep Blood Red #450a0a)
    // Every integer increases darkness
    const t = (p - 80) / 20.0;
    const r = Math.round(239 + (69 - 239) * t);
    const g = Math.round(68 + (10 - 68) * t);
    const b = Math.round(68 + (10 - 68) * t);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

/**
 * Returns full classification info and styling for a risk score.
 */
export function getRiskBandInfo(score: number): RiskBandInfo {
  const p = toRiskPercentage(score);
  const color = getRiskColor(p);

  let label: RiskBandInfo['label'];
  if (p <= 30) {
    label = 'Low';
  } else if (p <= 60) {
    label = 'Moderate';
  } else if (p <= 80) {
    label = 'High';
  } else {
    label = 'Red Zone';
  }

  // Dark text on bright yellows/greens, light text on orange/reds
  const textColor = p > 55 ? '#ffffff' : '#0f172a';
  const bgSubtle = `${color}22`;
  const borderColor = color;

  return {
    label,
    percentage: p,
    color,
    textColor,
    bgSubtle,
    borderColor,
  };
}

/**
 * Calculates the feature weightage breakdown out of 100 for a given habitation.
 * Formula: Collective Score = Hazard (40%) + Exposure (35%) + Vulnerability (25%)
 */
export function calculateWeightageBreakdown(
  riskScore: number,
  hviScore?: number,
  hazardScore?: number
): FeatureWeightageBreakdown {
  const pct = toRiskPercentage(riskScore);
  
  // Normalizing factors or estimating from overall score
  const hvi = hviScore !== undefined ? toRiskPercentage(hviScore) : pct;
  const hz = hazardScore !== undefined ? toRiskPercentage(hazardScore) : pct;
  const exp = pct; // population & asset exposure factor

  // Weights sum to 100: Hazard (40%), Exposure (35%), Vulnerability (25%)
  const hazardContribution = Math.round((hz / 100) * 40);
  const exposureContribution = Math.round((exp / 100) * 35);
  const vulnerabilityContribution = Math.round((hvi / 100) * 25);
  const collectiveScore = Math.min(100, hazardContribution + exposureContribution + vulnerabilityContribution);

  return {
    hazardWeight: 40,
    exposureWeight: 35,
    vulnerabilityWeight: 25,
    hazardContribution,
    exposureContribution,
    vulnerabilityContribution,
    collectiveScore: collectiveScore > 0 ? collectiveScore : pct,
    formulaString: `H(40%) [${hazardContribution}%] + E(35%) [${exposureContribution}%] + V(25%) [${vulnerabilityContribution}%]`,
  };
}
