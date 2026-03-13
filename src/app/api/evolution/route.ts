import { NextRequest, NextResponse } from "next/server";
import { getEvolutionPayload } from "@/lib/skill-evolution";

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get("agentId");

  if (!agentId) {
    return NextResponse.json({ error: "Missing required query param: agentId" }, { status: 400 });
  }

  return NextResponse.json(getEvolutionPayload(agentId));
}

