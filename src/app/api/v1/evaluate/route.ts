import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  EvaluationInput,
  EvaluationReport,
  fetchGitHubData,
  fetchNpmData,
  checkDeployments,
  scoreSkills,
  detectFraud,
  computeOverallScore,
  recommendBelt,
} from "@/lib/evaluation-engine";

// ─── In-memory store ──────────────────────────────────────────────────────────
// Shared with the GET [agentId] route via module-level singleton.
// Replace with Supabase in production.
export const evaluationStore = new Map<string, EvaluationReport>();

// ─── POST /api/v1/evaluate ────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description, model, walletAddress, githubUrl, npmPackages, deploymentUrls } =
    (body as Record<string, unknown>) ?? {};

  // Validate required fields
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!description || typeof description !== "string") {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }
  if (!model || typeof model !== "string") {
    return NextResponse.json({ error: "model is required" }, { status: 400 });
  }

  const input: EvaluationInput = {
    name,
    description,
    model,
    walletAddress: typeof walletAddress === "string" ? walletAddress : undefined,
    githubUrl: typeof githubUrl === "string" ? githubUrl : undefined,
    npmPackages: Array.isArray(npmPackages)
      ? (npmPackages as unknown[]).filter((p) => typeof p === "string") as string[]
      : undefined,
    deploymentUrls: Array.isArray(deploymentUrls)
      ? (deploymentUrls as unknown[]).filter((u) => typeof u === "string") as string[]
      : undefined,
  };

  // ── Off-chain data collection (parallel where possible) ────────────────────
  const [github, npm, deployments] = await Promise.all([
    input.githubUrl ? fetchGitHubData(input.githubUrl) : Promise.resolve(null),
    input.npmPackages && input.npmPackages.length > 0
      ? fetchNpmData(input.npmPackages)
      : Promise.resolve(null),
    input.deploymentUrls && input.deploymentUrls.length > 0
      ? checkDeployments(input.deploymentUrls)
      : Promise.resolve(null),
  ]);

  // ── Skills scoring ─────────────────────────────────────────────────────────
  const { domains, skills_detected } = scoreSkills(input, github, npm, deployments);

  // ── Fraud detection ────────────────────────────────────────────────────────
  const fraud_check = detectFraud(input, github);

  // ── Overall score & passport ───────────────────────────────────────────────
  const overall_score = computeOverallScore(domains);
  const passport = recommendBelt(overall_score, fraud_check);

  // ── Off-chain summary ──────────────────────────────────────────────────────
  const off_chain_summary = {
    repos: github?.repos ?? 0,
    total_stars: github?.total_stars ?? 0,
    npm_packages: npm?.packages_found ?? 0,
    live_deployments: deployments?.live ?? 0,
  };

  // ── Build report ───────────────────────────────────────────────────────────
  const agentId = randomUUID();
  const report: EvaluationReport = {
    agentId,
    input,
    evaluation: {
      overall_score,
      domains,
      skills_detected,
      fraud_check,
      off_chain_summary,
      raw: {
        ...(github ? { github } : {}),
        ...(npm ? { npm } : {}),
        ...(deployments ? { deployments } : {}),
      },
    },
    passport,
    evaluated_at: new Date().toISOString(),
  };

  evaluationStore.set(agentId, report);

  return NextResponse.json(report, { status: 201 });
}
