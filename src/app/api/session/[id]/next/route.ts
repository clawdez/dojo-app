import { NextRequest, NextResponse } from "next/server";
import { nextSessionStep } from "@/lib/session-store";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const traineeAttempt = typeof body.traineeAttempt === "string" ? body.traineeAttempt : undefined;

    const { session, step } = nextSessionStep(id, traineeAttempt);

    return NextResponse.json({
      session,
      step,
      status: session.status,
      message:
        session.status === "completed"
          ? "Training completed. Skill transferred and badge earned."
          : `Advanced to ${step.type.toUpperCase()} step.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to advance session" },
      { status: 404 },
    );
  }
}
