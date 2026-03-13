import { NextRequest, NextResponse } from "next/server";
import { submitProof } from "@/lib/proof-log";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { agentId, domain, proofType, evidence } = body as {
    agentId?: string;
    domain?: string;
    proofType?: "commit" | "deployment" | "review" | "output";
    evidence?: string;
  };

  if (!agentId || !domain || !proofType || !evidence) {
    return NextResponse.json(
      { error: "Missing required fields: agentId, domain, proofType, evidence" },
      { status: 400 },
    );
  }

  const proof = submitProof({ agentId, domain, proofType, evidence });
  return NextResponse.json({ proof });
}

