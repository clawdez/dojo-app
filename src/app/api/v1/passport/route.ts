import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  evaluationStore,
  passportStore,
  scoreToBelt,
  type PassportRecord,
} from "@/lib/stores";

/**
 * POST /api/v1/passport
 * Create a Maiat Passport for an evaluated agent.
 *
 * Body: { agentId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, evaluationData } = body;

    if (!agentId) {
      return NextResponse.json(
        { error: "agentId is required" },
        { status: 400 }
      );
    }

    // Try store first, fall back to inline evaluation data
    let evaluation = evaluationStore.get(agentId);
    if (!evaluation && evaluationData) {
      // Accept inline evaluation data (needed for serverless where stores don't persist across lambdas)
      evaluation = {
        agentId,
        agentName: evaluationData.agentName,
        overallScore: evaluationData.overallScore ?? 0,
        safetyScore: evaluationData.safetyScore ?? 40,
        domains: evaluationData.domains ?? [],
        passportReady: true,
        timestamp: new Date().toISOString(),
      };
      evaluationStore.set(agentId, evaluation);
    }
    if (!evaluation) {
      return NextResponse.json(
        {
          error: "Agent must complete an evaluation before minting a passport",
          hint: "POST /api/v1/evaluate first, or include evaluationData in the request",
        },
        { status: 403 }
      );
    }

    // Check for existing passport
    const existing = Array.from(passportStore.values()).find(
      (p) => p.agentId === agentId
    );
    if (existing) {
      return NextResponse.json({
        passport: existing,
        message: "Passport already exists for this agent",
      });
    }

    // Try to get Maiat trust score from the API
    let maiatScore: number | undefined;
    try {
      const maiatRes = await fetch(
        `https://maiat.vercel.app/api/v1/agent/${encodeURIComponent(agentId)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (maiatRes.ok) {
        const data = await maiatRes.json();
        maiatScore =
          data.trustScore ?? data.score ?? data.maiatScore ?? null;
      }
    } catch {
      // Maiat API unavailable — fall through to derived score
    }

    // Derive maiatScore from evaluation if not obtained from API
    if (maiatScore === undefined || maiatScore === null) {
      // Weight: overall score 70%, safety score 30%
      maiatScore = Math.round(
        evaluation.overallScore * 0.7 + evaluation.safetyScore * 0.3
      );
    }

    const belt = scoreToBelt(evaluation.overallScore);

    // Build domain scores map
    const domainScores: Record<string, number> = {};
    for (const d of evaluation.domains) {
      domainScores[d.domain] = d.score;
    }

    const passportId = `MTP-${randomUUID().slice(0, 12).toUpperCase()}`;

    const passport: PassportRecord = {
      passportId,
      agentId,
      belt,
      domainScores,
      maiatScore,
      issuedAt: new Date().toISOString(),
      evaluationScore: evaluation.overallScore,
    };

    passportStore.set(passportId, passport);

    return NextResponse.json(
      {
        passport: {
          passportId: passport.passportId,
          agentId: passport.agentId,
          belt: passport.belt,
          domainScores: passport.domainScores,
          maiatScore: passport.maiatScore,
          evaluationScore: passport.evaluationScore,
          issuedAt: passport.issuedAt,
        },
        message: "Maiat Passport issued successfully",
        actions: {
          badge: `/api/v1/badge/${agentId}`,
          profile: `/profile/${agentId}`,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/passport
 * List all passports. Optionally filter by agentId query param.
 */
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");

  const all = Array.from(passportStore.values());

  if (agentId) {
    const filtered = all.filter((p) => p.agentId === agentId);
    if (filtered.length === 0) {
      return NextResponse.json(
        { error: "No passport found for this agent", agentId },
        { status: 404 }
      );
    }
    return NextResponse.json({
      passports: filtered,
      total: filtered.length,
    });
  }

  return NextResponse.json({
    passports: all,
    total: all.length,
  });
}
