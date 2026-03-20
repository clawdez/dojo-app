import { NextRequest, NextResponse } from 'next/server';
import { mockMarketplaceAgents } from '@/lib/mock-data';
import { computeMaiatTrustBoost, getCertLevel } from '@/lib/maiat-bridge';

/**
 * POST /api/v1/batch-trust
 *
 * Batch endpoint for Maiat Protocol to compute combined trust scores
 * for multiple agents in a single request. Much more efficient than
 * calling /api/v1/maiat for each agent individually.
 *
 * Max 50 agents per batch.
 *
 * Request body:
 * {
 *   agents: Array<{
 *     agentId: string,
 *     maiatBaseScore: number  // 0–100
 *   }>
 * }
 *
 * Response:
 * {
 *   results: Array<{
 *     agentId: string,
 *     agentName?: string,
 *     maiatBaseScore: number,
 *     dojoBoost: number,
 *     combinedScore: number,
 *     certLevel: string,
 *     found: boolean,
 *     error?: string
 *   }>,
 *   count: number,
 *   foundCount: number,
 *   generatedAt: string
 * }
 */

interface BatchAgentInput {
  agentId: string;
  maiatBaseScore: number;
}

interface BatchAgentResult {
  agentId: string;
  agentName?: string;
  maiatBaseScore: number;
  dojoBoost: number;
  combinedScore: number;
  certLevel: string;
  found: boolean;
  error?: string;
  topSkills?: string[];
  lastAssessed?: string;
}

const MAX_BATCH_SIZE = 50;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agents } = body as { agents: BatchAgentInput[] };

    if (!Array.isArray(agents)) {
      return NextResponse.json(
        { error: 'Request body must include an "agents" array' },
        { status: 400 },
      );
    }

    if (agents.length === 0) {
      return NextResponse.json(
        { error: 'Agents array cannot be empty' },
        { status: 400 },
      );
    }

    if (agents.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        {
          error: `Batch size exceeds maximum. Got ${agents.length}, max is ${MAX_BATCH_SIZE}.`,
          hint: 'Split your request into multiple batches of ≤50 agents.',
        },
        { status: 400 },
      );
    }

    const results: BatchAgentResult[] = agents.map((entry, idx) => {
      // Validate entry shape
      if (!entry || typeof entry.agentId !== 'string') {
        return {
          agentId: `entry[${idx}]`,
          maiatBaseScore: 0,
          dojoBoost: 0,
          combinedScore: 0,
          certLevel: 'none',
          found: false,
          error: 'Invalid entry: agentId must be a string',
        };
      }

      const { agentId, maiatBaseScore } = entry;

      if (typeof maiatBaseScore !== 'number' || maiatBaseScore < 0 || maiatBaseScore > 100) {
        return {
          agentId,
          maiatBaseScore: maiatBaseScore ?? 0,
          dojoBoost: 0,
          combinedScore: maiatBaseScore ?? 0,
          certLevel: 'none',
          found: false,
          error: 'maiatBaseScore must be a number between 0 and 100',
        };
      }

      // Look up agent in Dojo records
      // In production: query Supabase for real certification data
      const agent = mockMarketplaceAgents.find((a) => a.id === agentId);

      if (!agent) {
        return {
          agentId,
          maiatBaseScore,
          dojoBoost: 0,
          combinedScore: maiatBaseScore,
          certLevel: 'none',
          found: false,
        };
      }

      const sp = agent.skillProfile;
      const boost = computeMaiatTrustBoost(sp);
      const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
      const combinedScore = Math.min(100, Math.round(maiatBaseScore + boost.total));

      return {
        agentId,
        agentName: sp.agentName,
        maiatBaseScore,
        dojoBoost: boost.total,
        combinedScore,
        certLevel,
        found: true,
        topSkills: sp.topSkills,
        lastAssessed: sp.lastAssessed,
      };
    });

    const foundCount = results.filter((r) => r.found).length;

    return NextResponse.json({
      results,
      count: results.length,
      foundCount,
      notFoundCount: results.length - foundCount,
      description: 'Batch trust score computation. Use GET /api/v1/agent-cert/[agentId] for detailed per-agent data.',
      maxBoostPerAgent: 30,
      docsUrl: 'https://dojo-app-theta.vercel.app/docs',
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
 * GET /api/v1/batch-trust
 * Returns info about the batch endpoint (schema, limits, example).
 */
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/v1/batch-trust',
    description: 'Batch compute Maiat trust scores for multiple Dojo-certified agents in one request.',
    limits: {
      maxAgentsPerBatch: MAX_BATCH_SIZE,
      maxBoostPerAgent: 30,
    },
    requestSchema: {
      agents: 'Array<{ agentId: string, maiatBaseScore: number }>',
    },
    exampleRequest: {
      agents: [
        { agentId: 'ag-1', maiatBaseScore: 74 },
        { agentId: 'ag-2', maiatBaseScore: 81 },
        { agentId: 'unknown-agent', maiatBaseScore: 60 },
      ],
    },
    exampleResponse: {
      results: [
        {
          agentId: 'ag-1',
          agentName: 'Clawdez',
          maiatBaseScore: 74,
          dojoBoost: 22,
          combinedScore: 96,
          certLevel: 'elite',
          found: true,
        },
        {
          agentId: 'unknown-agent',
          maiatBaseScore: 60,
          dojoBoost: 0,
          combinedScore: 60,
          certLevel: 'none',
          found: false,
        },
      ],
      count: 3,
      foundCount: 2,
    },
    relatedEndpoints: [
      'GET /api/v1/agent-cert/[agentId]',
      'POST /api/v1/maiat',
      'GET /api/v1/maiat',
    ],
    generatedAt: new Date().toISOString(),
  });
}
