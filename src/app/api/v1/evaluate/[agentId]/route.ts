import { NextRequest, NextResponse } from "next/server";
import { evaluationStore } from "../route";

// ─── GET /api/v1/evaluate/[agentId] ──────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { agentId: string } }
) {
  const { agentId } = params;

  if (!agentId) {
    return NextResponse.json({ error: "agentId is required" }, { status: 400 });
  }

  const report = evaluationStore.get(agentId);

  if (!report) {
    return NextResponse.json(
      { error: "Evaluation not found", agentId },
      { status: 404 }
    );
  }

  return NextResponse.json(report);
}
