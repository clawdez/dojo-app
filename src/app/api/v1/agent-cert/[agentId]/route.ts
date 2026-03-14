import { NextRequest, NextResponse } from 'next/server';
import { mockMarketplaceAgents } from '@/lib/mock-data';
import { computeMaiatTrustBoost, getCertLevel } from '@/lib/maiat-bridge';

/**
 * GET /api/v1/agent-cert/[agentId]
 *
 * Public endpoint for Maiat Protocol to pull Dojo certification data.
 * Returns verified skill scores, cert level, and the trust boost Maiat
 * can apply to this agent's on-chain score.
 *
 * Example Maiat call:
 *   GET https://dojo-app-theta.vercel.app/api/v1/agent-cert/ag-1
 *
 * Response is signed-ready JSON that Maiat can cache or verify against
 * the agent's on-chain address.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;

  // In production: query Supabase for real assessment data
  // For MVP: serve from mock data
  const agent = mockMarketplaceAgents.find((a) => a.id === agentId);

  if (!agent) {
    return NextResponse.json(
      {
        error: 'Agent not found',
        message: `No Dojo certification record for agent ID: ${agentId}`,
        hint: 'POST /api/senseis/apply to start the assessment process',
      },
      { status: 404 },
    );
  }

  const sp = agent.skillProfile;
  const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
  const maiatBoost = computeMaiatTrustBoost(sp);

  // Domain scores formatted for Maiat consumption
  const domainScores = sp.capabilities.reduce(
    (acc, cap) => {
      acc[`${cap.domain}.${cap.subdomain}`] = {
        score: cap.score,
        confidence: cap.confidence,
        trials: cap.trialCount,
        assessedAt: cap.assessedAt,
      };
      return acc;
    },
    {} as Record<string, { score: number; confidence: number; trials: number; assessedAt: string }>,
  );

  const cert = {
    // Identity
    agentId: sp.agentId,
    agentName: sp.agentName,
    walletAddress: sp.walletAddress || null,
    model: sp.model,

    // Dojo certification
    certLevel,              // "none" | "certified" | "verified" | "elite"
    overallScore: sp.overallScore,
    belt: getBeltFromScore(sp.overallScore),
    assessmentCount: sp.assessmentCount,
    lastAssessed: sp.lastAssessed,
    topSkills: sp.topSkills,

    // Domain breakdown
    domainScores,

    // Maiat integration fields
    maiatTrustBoost: maiatBoost.total,   // raw points (0–25) to add to Maiat score
    boostBreakdown: maiatBoost.breakdown, // how the boost was computed
    boostExpiry: getBoostExpiry(sp.lastAssessed), // ISO timestamp when boost expires

    // Meta
    source: 'dojo',
    sourceUrl: 'https://dojo-app-theta.vercel.app',
    generatedAt: new Date().toISOString(),
  };

  return NextResponse.json(cert, {
    headers: {
      'Cache-Control': 'public, max-age=300', // 5-min cache
      'X-Dojo-Version': '1.0',
    },
  });
}

// ── Helpers ──

function getBeltFromScore(score: number): string {
  if (score >= 90) return 'black';
  if (score >= 75) return 'blue';
  if (score >= 60) return 'green';
  if (score >= 40) return 'yellow';
  return 'white';
}

function getBoostExpiry(lastAssessed: string): string {
  const assessed = new Date(lastAssessed);
  assessed.setDate(assessed.getDate() + 30); // boosts expire after 30 days
  return assessed.toISOString();
}
