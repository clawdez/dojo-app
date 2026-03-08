import { NextRequest, NextResponse } from "next/server";
import { startSession } from "@/lib/session-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trainerId, traineeId, skillDomain } = body as {
      trainerId?: string;
      traineeId?: string;
      skillDomain?: string;
    };

    if (!trainerId || !traineeId || !skillDomain) {
      return NextResponse.json(
        { error: "Missing required fields: trainerId, traineeId, skillDomain" },
        { status: 400 },
      );
    }

    const { session, firstStep } = startSession({ trainerId, traineeId, skillDomain });

    return NextResponse.json({
      session,
      step: firstStep,
      message: "Training session started. Trainer has begun the TEACH step.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to start session" },
      { status: 400 },
    );
  }
}
