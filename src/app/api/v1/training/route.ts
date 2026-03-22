import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  senseiStore,
  trainingStore,
  generateTrainingPlan,
  type TrainingSessionRecord,
} from "@/lib/stores";

/**
 * POST /api/v1/training
 * Create a new training session.
 *
 * Body: { studentAgentId, senseiId, domain }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentAgentId, senseiId, domain } = body;

    if (!studentAgentId || !senseiId || !domain) {
      return NextResponse.json(
        { error: "studentAgentId, senseiId, and domain are required" },
        { status: 400 }
      );
    }

    // Verify sensei exists and is approved
    const sensei = senseiStore.get(senseiId);
    if (!sensei) {
      return NextResponse.json(
        { error: "Sensei not found", senseiId },
        { status: 404 }
      );
    }

    if (!sensei.approved) {
      return NextResponse.json(
        { error: "Sensei is not yet approved" },
        { status: 403 }
      );
    }

    const sessionId = `train-${randomUUID().slice(0, 12)}`;
    const trainingPlan = generateTrainingPlan(domain, sensei.specialty);

    const session: TrainingSessionRecord = {
      sessionId,
      studentAgentId,
      senseiId,
      domain,
      status: "in_progress",
      trainingPlan,
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    trainingStore.set(sessionId, session);

    // Increment sensei training count
    sensei.trainingCount += 1;
    sensei.updatedAt = new Date().toISOString();
    senseiStore.set(senseiId, sensei);

    return NextResponse.json(
      {
        session: {
          sessionId: session.sessionId,
          studentAgentId: session.studentAgentId,
          senseiId: session.senseiId,
          domain: session.domain,
          status: session.status,
          trainingPlan: session.trainingPlan,
          startedAt: session.startedAt,
        },
        sensei: {
          senseiId: sensei.senseiId,
          agentId: sensei.agentId,
          specialty: sensei.specialty,
          pricePerSession: sensei.pricePerSession,
        },
        message: "Training session started",
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
 * GET /api/v1/training
 * List all training sessions. Optional filter by agentId query param.
 */
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");

  let sessions = Array.from(trainingStore.values());

  if (agentId) {
    sessions = sessions.filter(
      (s) => s.studentAgentId === agentId || s.senseiId === agentId
    );
  }

  // Sort newest first
  sessions.sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
  );

  return NextResponse.json({
    sessions: sessions.map((s) => ({
      sessionId: s.sessionId,
      studentAgentId: s.studentAgentId,
      senseiId: s.senseiId,
      domain: s.domain,
      status: s.status,
      startedAt: s.startedAt,
      completedAt: s.completedAt,
    })),
    total: sessions.length,
    filter: agentId ? { agentId } : null,
  });
}
