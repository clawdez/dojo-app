/**
 * Maiat Bridge — Dojo ↔ Maiat Protocol integration logic
 *
 * Computes how much a Dojo certification should boost an agent's Maiat trust score.
 * The boost is based on:
 *   1. Overall assessment score (quality of verified skills)
 *   2. Number of domains assessed (breadth of verification)
 *   3. Confidence levels from assessors (reliability of scores)
 *   4. Recency — scores decay after 30 days
 *
 * Max boost: 25 points on a 100-point Maiat scale
 * This is additive but non-stacking — only the best certification counts.
 */

import type { SkillProfile } from './mock-data';

export type CertLevel = 'none' | 'certified' | 'verified' | 'elite';

export interface TrustBoost {
  total: number;           // 0–25 points
  breakdown: BoostBreakdown;
}

export interface BoostBreakdown {
  scoreBoost: number;      // up to 12 pts from overall score quality
  breadthBoost: number;    // up to 6 pts from domain coverage
  confidenceBoost: number; // up to 4 pts from assessor confidence
  recencyBoost: number;    // up to 3 pts from freshness
  explanation: string;
}

/**
 * Compute the Maiat trust boost for an agent based on their Dojo profile.
 */
export function computeMaiatTrustBoost(profile: SkillProfile): TrustBoost {
  const { overallScore, capabilities, lastAssessed } = profile;

  // 1. Score boost (0–12 pts)
  //    Scales with assessment quality: 50→0pts, 70→4pts, 85→8pts, 95+→12pts
  let scoreBoost = 0;
  if (overallScore >= 95) scoreBoost = 12;
  else if (overallScore >= 90) scoreBoost = 10;
  else if (overallScore >= 85) scoreBoost = 8;
  else if (overallScore >= 80) scoreBoost = 6;
  else if (overallScore >= 75) scoreBoost = 4;
  else if (overallScore >= 65) scoreBoost = 2;
  else if (overallScore >= 50) scoreBoost = 1;

  // 2. Breadth boost (0–6 pts)
  //    More domains assessed = broader trustworthiness signal
  const uniqueDomains = new Set(capabilities.map((c) => c.domain)).size;
  const breadthBoost = Math.min(6, uniqueDomains * 1.5);

  // 3. Confidence boost (0–4 pts)
  //    Average assessor confidence across all trials
  const avgConfidence =
    capabilities.length > 0
      ? capabilities.reduce((sum, c) => sum + c.confidence, 0) / capabilities.length
      : 0;
  const confidenceBoost = Math.round(avgConfidence * 4);

  // 4. Recency boost (0–3 pts)
  //    Full boost if assessed within 7 days, decays linearly to 0 at 30 days
  const daysSinceAssessed = Math.floor(
    (Date.now() - new Date(lastAssessed).getTime()) / (1000 * 60 * 60 * 24),
  );
  let recencyBoost = 0;
  if (daysSinceAssessed <= 7) recencyBoost = 3;
  else if (daysSinceAssessed <= 14) recencyBoost = 2;
  else if (daysSinceAssessed <= 21) recencyBoost = 1;
  else if (daysSinceAssessed <= 30) recencyBoost = 0;

  const total = Math.round(scoreBoost + breadthBoost + confidenceBoost + recencyBoost);

  const explanation = buildExplanation(
    overallScore,
    uniqueDomains,
    avgConfidence,
    daysSinceAssessed,
    total,
  );

  return {
    total: Math.min(25, total), // hard cap at 25
    breakdown: {
      scoreBoost: Math.round(scoreBoost),
      breadthBoost: Math.round(breadthBoost),
      confidenceBoost,
      recencyBoost,
      explanation,
    },
  };
}

/**
 * Determine the certification level based on score + assessment depth.
 */
export function getCertLevel(overallScore: number, assessmentCount: number): CertLevel {
  if (assessmentCount === 0 || overallScore === 0) return 'none';
  if (overallScore >= 88 && assessmentCount >= 4) return 'elite';
  if (overallScore >= 75 && assessmentCount >= 3) return 'verified';
  if (overallScore >= 60 && assessmentCount >= 1) return 'certified';
  return 'none';
}

/**
 * Human-readable explanation of the boost for transparency.
 */
function buildExplanation(
  score: number,
  domains: number,
  confidence: number,
  daysSince: number,
  total: number,
): string {
  const parts: string[] = [];

  if (score >= 85) parts.push(`High skill quality (${score}/100)`);
  else if (score >= 70) parts.push(`Solid skill quality (${score}/100)`);
  else parts.push(`Moderate skill quality (${score}/100)`);

  parts.push(`${domains} domain${domains !== 1 ? 's' : ''} assessed`);

  if (confidence >= 0.9) parts.push('High assessor confidence');
  else if (confidence >= 0.8) parts.push('Good assessor confidence');

  if (daysSince <= 7) parts.push('Recently assessed (full freshness)');
  else if (daysSince <= 30) parts.push(`Assessed ${daysSince}d ago`);
  else parts.push('Assessment expired — re-assess for full boost');

  return `+${total} pts: ${parts.join(' · ')}`;
}

/**
 * Format cert level for display
 */
export const CERT_LEVEL_META: Record<CertLevel, {
  label: string;
  color: string;
  emoji: string;
  description: string;
}> = {
  none: {
    label: 'Uncertified',
    color: '#666',
    emoji: '○',
    description: 'No Dojo assessment on record',
  },
  certified: {
    label: 'Certified',
    color: '#FFD700',
    emoji: '◈',
    description: 'Basic skill verification passed',
  },
  verified: {
    label: 'Verified',
    color: '#44ff88',
    emoji: '◉',
    description: 'Multi-domain assessment with strong scores',
  },
  elite: {
    label: 'Elite',
    color: '#C4FF3C',
    emoji: '◆',
    description: 'Top-tier performance across 4+ domains',
  },
};
