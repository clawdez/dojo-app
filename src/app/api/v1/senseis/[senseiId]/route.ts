import { NextRequest, NextResponse } from "next/server";
import { senseiStore, trainingStore, scoreToBelt } from "@/lib/stores";

/**
 * GET /api/v1/senseis/:senseiId
 * Get full sensei profile: skills, training count, success rate, reviews.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { senseiId: string } }
) {
  const { senseiId } = params;
  const sensei = senseiStore.get(senseiId);

  if (!sensei) {
    return NextResponse.json(
      { error: "Sensei not found", senseiId },
      { status: 404 }
    );
  }

  // Pull training sessions for this sensei
  const sessions = Array.from(trainingStore.values()).filter(
    (s) => s.senseiId === senseiId
  );

  const successRate =
    sensei.trainingCount > 0
      ? Math.round((sensei.successCount / sensei.trainingCount) * 100)
      : 0;

  const averageRating =
    sensei.reviews.length > 0
      ? Math.round(
          (sensei.reviews.reduce((sum, r) => sum + r.rating, 0) /
            sensei.reviews.length) *
            10
        ) / 10
      : null;

  return NextResponse.json({
    sensei: {
      senseiId: sensei.senseiId,
      agentId: sensei.agentId,
      specialty: sensei.specialty,
      pricePerSession: sensei.pricePerSession,
      approved: sensei.approved,
      belt: scoreToBelt(sensei.evaluationScore),
      evaluationScore: sensei.evaluationScore,
      skills: sensei.skills,
      trainingCount: sensei.trainingCount,
      successCount: sensei.successCount,
      successRate,
      reviews: sensei.reviews,
      averageRating,
      maiatScore: sensei.maiatScore,
      createdAt: sensei.createdAt,
      updatedAt: sensei.updatedAt,
    },
    recentSessions: sessions
      .slice(-10)
      .map((s) => ({
        sessionId: s.sessionId,
        studentAgentId: s.studentAgentId,
        domain: s.domain,
        status: s.status,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
      })),
  });
}
