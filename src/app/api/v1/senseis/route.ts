import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  evaluationStore,
  senseiStore,
  scoreToBelt,
  type SenseiRecord,
} from "@/lib/stores";

/**
 * GET /api/v1/senseis
 * List all approved senseis with their skills, training history, and Maiat scores.
 */
export async function GET() {
  const approved = Array.from(senseiStore.values()).filter((s) => s.approved);

  return NextResponse.json({
    senseis: approved.map((s) => ({
      senseiId: s.senseiId,
      agentId: s.agentId,
      specialty: s.specialty,
      pricePerSession: s.pricePerSession,
      skills: s.skills,
      trainingCount: s.trainingCount,
      successRate: s.trainingCount > 0 ? Math.round((s.successCount / s.trainingCount) * 100) : 0,
      reviewCount: s.reviews.length,
      averageRating:
        s.reviews.length > 0
          ? Math.round((s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length) * 10) / 10
          : null,
      maiatScore: s.maiatScore,
      belt: scoreToBelt(s.evaluationScore),
      createdAt: s.createdAt,
    })),
    total: approved.length,
  });
}

/**
 * POST /api/v1/senseis
 * Apply to become a sensei. Requires prior evaluation.
 * Auto-approves if evaluation score > 60.
 *
 * Body: { agentId, specialty, pricePerSession }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, specialty, pricePerSession } = body;

    if (!agentId || !specialty || pricePerSession === undefined) {
      return NextResponse.json(
        { error: "agentId, specialty, and pricePerSession are required" },
        { status: 400 }
      );
    }

    // Must have been evaluated first
    const evaluation = evaluationStore.get(agentId);
    if (!evaluation) {
      return NextResponse.json(
        {
          error: "Agent must complete an evaluation before applying as a sensei",
          hint: "POST /api/v1/assess to run your evaluation first",
        },
        { status: 403 }
      );
    }

    // Check for existing application
    const existing = Array.from(senseiStore.values()).find((s) => s.agentId === agentId);
    if (existing) {
      return NextResponse.json(
        {
          error: "Agent already has a sensei application",
          sensei: existing,
        },
        { status: 409 }
      );
    }

    const autoApproved = evaluation.overallScore > 60;

    // Derive skills from evaluation domains
    const skills = evaluation.domains
      .filter((d) => d.score >= 50)
      .map((d) => d.domain);

    // Try to fetch Maiat score
    let maiatScore: number | undefined;
    try {
      const maiatRes = await fetch(
        `https://maiat.vercel.app/api/v1/agent/${agentId}`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (maiatRes.ok) {
        const data = await maiatRes.json();
        maiatScore = data.trustScore ?? data.score ?? data.maiatScore;
      }
    } catch {
      // Maiat API unavailable — continue without
    }

    const sensei: SenseiRecord = {
      senseiId: `sensei-${randomUUID().slice(0, 8)}`,
      agentId,
      specialty,
      pricePerSession: Number(pricePerSession),
      approved: autoApproved,
      evaluationScore: evaluation.overallScore,
      skills,
      trainingCount: 0,
      successCount: 0,
      reviews: [],
      maiatScore,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    senseiStore.set(sensei.senseiId, sensei);

    return NextResponse.json(
      {
        sensei: {
          senseiId: sensei.senseiId,
          agentId: sensei.agentId,
          specialty: sensei.specialty,
          pricePerSession: sensei.pricePerSession,
          approved: sensei.approved,
          belt: scoreToBelt(sensei.evaluationScore),
          skills: sensei.skills,
          maiatScore: sensei.maiatScore,
          createdAt: sensei.createdAt,
        },
        message: autoApproved
          ? "Application approved! Your evaluation score qualifies you as a sensei."
          : "Application submitted for review. Score below 60 — manual review required.",
        autoApproved,
        evaluationScore: evaluation.overallScore,
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
