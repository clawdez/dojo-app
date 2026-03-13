import { NextRequest, NextResponse } from "next/server";
import { getTrainingRecommendations } from "@/lib/training-recs";

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get("agentId");
  const domain = request.nextUrl.searchParams.get("domain") ?? undefined;

  if (!agentId) {
    return NextResponse.json({ error: "Missing required query param: agentId" }, { status: 400 });
  }

  return NextResponse.json({
    agentId,
    recommendations: getTrainingRecommendations(agentId, domain),
  });
}

