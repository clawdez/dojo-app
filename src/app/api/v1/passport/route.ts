import { NextRequest, NextResponse } from "next/server";

// In-memory passport store (MVP — use Supabase in production)
const passportStore = new Map<string, PassportData>();

interface PassportData {
  passportId: string;
  agentId: string;
  agentName: string;
  walletAddress?: string;
  ens?: string;
  overallScore: number;
  safetyScore: number;
  domains: { domain: string; score: number; verdict: string }[];
  fraudChecks: { test: string; result: string; detail: string }[];
  recommendations: { domain: string; description: string; priority: string }[];
  maiatTrustScore?: number;
  certLevel: string;
  createdAt: string;
  lastAssessed: string;
  passportReady: boolean;
}

function getCertLevel(score: number): string {
  if (score >= 88) return "elite";
  if (score >= 75) return "verified";
  if (score >= 60) return "certified";
  return "uncertified";
}

/**
 * POST /api/v1/passport
 * 
 * Create a Maiat Passport from assessment results.
 * Body: { agentId, agentName, walletAddress?, assessmentResult }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, agentName, walletAddress, assessmentResult } = body;

    if (!agentId || !assessmentResult) {
      return NextResponse.json(
        { error: "agentId and assessmentResult are required" },
        { status: 400 },
      );
    }

    const passportId = `MTP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const ens = `${agentId.replace(/[^a-z0-9]/gi, "").toLowerCase()}.maiat.eth`;

    // Query Maiat API for trust score if wallet provided
    let maiatTrustScore: number | undefined;
    if (walletAddress && walletAddress.startsWith("0x")) {
      try {
        const maiatRes = await fetch(
          `https://app.maiat.io/api/v1/agent/${walletAddress}`,
          { signal: AbortSignal.timeout(5000) },
        );
        if (maiatRes.ok) {
          const maiatData = await maiatRes.json();
          maiatTrustScore = maiatData.trustScore ?? maiatData.score;
        }
      } catch {
        // Maiat API unavailable — continue without trust score
      }
    }

    const passport: PassportData = {
      passportId,
      agentId,
      agentName: agentName || agentId,
      walletAddress,
      ens,
      overallScore: assessmentResult.overallScore,
      safetyScore: assessmentResult.safetyScore,
      domains: assessmentResult.domains,
      fraudChecks: assessmentResult.fraudChecks,
      recommendations: assessmentResult.recommendations,
      maiatTrustScore,
      certLevel: getCertLevel(assessmentResult.overallScore),
      createdAt: new Date().toISOString(),
      lastAssessed: assessmentResult.timestamp,
      passportReady: assessmentResult.passportReady,
    };

    passportStore.set(agentId, passport);

    return NextResponse.json({
      passport,
      message: "Maiat Passport created successfully",
      actions: {
        view: `/dashboard?agent=${agentId}`,
        share: `https://dojo-app-theta.vercel.app/passport/${agentId}`,
        embed: `<iframe src="https://dojo-app-theta.vercel.app/api/v1/badge/${agentId}" width="320" height="180"></iframe>`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/passport?agentId=<id>
 * 
 * Look up an agent's passport.
 */
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");

  if (!agentId) {
    // Return all passports
    const all = Array.from(passportStore.values());
    return NextResponse.json({
      passports: all,
      count: all.length,
    });
  }

  const passport = passportStore.get(agentId);
  if (!passport) {
    return NextResponse.json(
      { error: "Passport not found", agentId },
      { status: 404 },
    );
  }

  return NextResponse.json({ passport });
}
