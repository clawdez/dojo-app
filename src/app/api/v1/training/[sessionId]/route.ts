import { NextRequest, NextResponse } from "next/server";
import { trainingStore, senseiStore, evaluationStore } from "@/lib/stores";

/**
 * GET /api/v1/training/:sessionId
 * Get full training session details.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  const session = trainingStore.get(sessionId);

  if (!session) {
    return NextResponse.json(
      { error: "Training session not found", sessionId },
      { status: 404 }
    );
  }

  const sensei = senseiStore.get(session.senseiId);

  return NextResponse.json({
    session: {
      sessionId: session.sessionId,
      studentAgentId: session.studentAgentId,
      senseiId: session.senseiId,
      domain: session.domain,
      status: session.status,
      trainingPlan: session.trainingPlan,
      skillScoresAfter: session.skillScoresAfter,
      startedAt: session.startedAt,
      completedAt: session.completedAt,
      updatedAt: session.updatedAt,
    },
    sensei: sensei
      ? {
          senseiId: sensei.senseiId,
          agentId: sensei.agentId,
          specialty: sensei.specialty,
          pricePerSession: sensei.pricePerSession,
        }
      : null,
  });
}

/**
 * PATCH /api/v1/training/:sessionId
 * Update session status. On completion, update student's skill scores.
 *
 * Body: { status: "completed" | "cancelled", review?: { rating, comment } }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const session = trainingStore.get(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Training session not found", sessionId },
        { status: 404 }
      );
    }

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Session is already completed" },
        { status: 409 }
      );
    }

    const body = await req.json();
    const { status, review } = body;

    const validTransitions: Record<string, string[]> = {
      pending: ["in_progress", "cancelled"],
      in_progress: ["completed", "cancelled"],
    };

    const allowed = validTransitions[session.status] || [];
    if (!status || !allowed.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from '${session.status}' to '${status}'`,
          allowed,
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    session.status = status;
    session.updatedAt = now;

    if (status === "completed") {
      session.completedAt = now;

      // Update student's skill scores based on training domain
      const evaluation = evaluationStore.get(session.studentAgentId);
      const domainScores: Record<string, number> = {};

      if (evaluation) {
        // Boost scores in trained domains
        for (const d of evaluation.domains) {
          const boost = d.domain === session.domain ? 8 : 2;
          domainScores[d.domain] = Math.min(100, d.score + boost);
        }
      } else {
        // No prior evaluation — seed baseline scores
        const trainingDomains = session.trainingPlan.targetDomains;
        for (const td of trainingDomains) {
          domainScores[td] = 55; // baseline after first training
        }
        domainScores[session.domain] = 60;
      }

      session.skillScoresAfter = domainScores;

      // Update sensei success count
      const sensei = senseiStore.get(session.senseiId);
      if (sensei) {
        sensei.successCount += 1;
        sensei.updatedAt = now;

        // Attach review if provided
        if (review && typeof review.rating === "number") {
          sensei.reviews.push({
            reviewId: `rev-${Date.now().toString(36)}`,
            studentAgentId: session.studentAgentId,
            rating: Math.min(5, Math.max(1, review.rating)),
            comment: review.comment || "",
            createdAt: now,
          });
        }

        senseiStore.set(session.senseiId, sensei);
      }
    }

    trainingStore.set(sessionId, session);

    return NextResponse.json({
      session: {
        sessionId: session.sessionId,
        studentAgentId: session.studentAgentId,
        senseiId: session.senseiId,
        domain: session.domain,
        status: session.status,
        skillScoresAfter: session.skillScoresAfter,
        startedAt: session.startedAt,
        completedAt: session.completedAt,
        updatedAt: session.updatedAt,
      },
      message:
        status === "completed"
          ? "Session completed. Student skill scores updated."
          : `Session status updated to '${status}'.`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
