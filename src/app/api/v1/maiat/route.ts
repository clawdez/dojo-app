import { NextRequest, NextResponse } from 'next/server';
import { mockMarketplaceAgents } from '@/lib/mock-data';
import { computeMaiatTrustBoost, getCertLevel } from '@/lib/maiat-bridge';

/**
 * POST /api/v1/maiat
 *
 * Maiat Protocol integration endpoint.
 * Accepts a base trust score and returns a combined score that factors in
 * Dojo certification performance.
 *
 * This is the primary bridge between Dojo and Maiat:
 * - Maiat calls this with its base on-chain/behavioral trust score
 * - Dojo responds with a boost based on verified skill assessments
 * - Maiat incorporates the boost into the final displayed trust score
 *
 * Request body:
 * {
 *   agentId: string,
 *   maiatBaseScore: number,  // 0–100 from Maiat's trust engine
 *   walletAddress?: string,  // for cross-referencing
 * }
 *
 * Response:
 * {
 *   agentId: string,
 *   maiatBaseScore: number,
 *   dojoBoost: number,        // points added from Dojo certs (0–25)
 *   combinedScore: number,    // base + boost, capped at 100
 *   certLevel: string,
 *   breakdown: { ... },
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, maiatBaseScore, walletAddress } = body;

    if (!agentId || maiatBaseScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, maiatBaseScore' },
        { status: 400 },
      );
    }

    if (typeof maiatBaseScore !== 'number' || maiatBaseScore < 0 || maiatBaseScore > 100) {
      return NextResponse.json(
        { error: 'maiatBaseScore must be a number between 0 and 100' },
        { status: 422 },
      );
    }

    // In production: query Supabase
    const agent = mockMarketplaceAgents.find(
      (a) => a.id === agentId || (walletAddress && a.skillProfile.walletAddress === walletAddress),
    );

    if (!agent) {
      // Agent has no Dojo record — return base score unchanged
      return NextResponse.json({
        agentId,
        maiatBaseScore,
        dojoBoost: 0,
        combinedScore: maiatBaseScore,
        certLevel: 'none',
        breakdown: {
          message: 'Agent has not completed Dojo assessment. No boost applied.',
          cta: 'https://dojo-app-theta.vercel.app/apply',
        },
        generatedAt: new Date().toISOString(),
      });
    }

    const sp = agent.skillProfile;
    const boost = computeMaiatTrustBoost(sp);
    const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
    const combined = Math.min(100, Math.round(maiatBaseScore + boost.total));

    return NextResponse.json({
      agentId,
      agentName: sp.agentName,
      maiatBaseScore,
      dojoBoost: boost.total,
      combinedScore: combined,
      certLevel,
      breakdown: boost.breakdown,
      domainHighlights: sp.topSkills,
      lastAssessed: sp.lastAssessed,
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/maiat
 * 
 * Returns the full Dojo leaderboard with Maiat trust boost data for all agents.
 * Useful for Maiat to bulk-fetch all certified agents and their boost values.
 */
export async function GET() {
  const agents = mockMarketplaceAgents.map((agent) => {
    const sp = agent.skillProfile;
    const boost = computeMaiatTrustBoost(sp);
    const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);

    return {
      agentId: sp.agentId,
      agentName: sp.agentName,
      walletAddress: sp.walletAddress || null,
      model: sp.model,
      dojoScore: sp.overallScore,
      dojoBoostAvailable: boost.total,
      certLevel,
      topSkills: sp.topSkills,
      lastAssessed: sp.lastAssessed,
    };
  });

  // Sort by Dojo score descending
  agents.sort((a, b) => b.dojoScore - a.dojoScore);

  return NextResponse.json({
    agents,
    count: agents.length,
    description: 'All Dojo-certified agents with available trust boosts for Maiat Protocol',
    docsUrl: 'https://dojo-app-theta.vercel.app/api/v1/agent-cert/[agentId]',
    generatedAt: new Date().toISOString(),
  });
}
