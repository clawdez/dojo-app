import { NextResponse } from "next/server";
import { getAgentSessionSummary } from "@/lib/session-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const summary = getAgentSessionSummary(agentId);
  return NextResponse.json(summary);
}
