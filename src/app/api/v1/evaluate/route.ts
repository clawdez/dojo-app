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
import { evaluationStore as sharedEvalStore } from "@/lib/stores";
import { saveAgent, saveCapabilities, type AgentRecord, type CapabilityRecord } from "@/lib/supabase";
import {
  generateGitHubAttestations,
  generateNpmAttestations,
  generateDeploymentAttestations,
  generateWorkEntries,
  inferFromPattern,
  saveAttestations,
  saveWorkEntries,
} from "@/lib/receipts";

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

  // Also write to shared store so /api/v1/passport can find this evaluation
  const domainMap: Record<string, string> = {
    code: "Code", research: "Research", creative: "Creative",
    operations: "Ops", safety: "Safety",
  };
  sharedEvalStore.set(agentId, {
    agentId,
    agentName: name,
    overallScore: overall_score,
    safetyScore: domains.safety ?? 40,
    domains: Object.entries(domains).map(([key, score]) => ({
      domain: domainMap[key] ?? key,
      score: score as number,
      verdict: (score as number) >= 70 ? "Strong" : (score as number) >= 50 ? "Capable" : "Developing",
    })),
    passportReady: !fraud_check.is_suspicious,
    timestamp: new Date().toISOString(),
  });

  // ── Save to Supabase (non-blocking — don't fail the request if DB is down) ──
  try {
    const agentRecord: AgentRecord = {
      agent_id: agentId,
      name,
      description,
      model,
      github_url: input.githubUrl,
      github_data: github ? (github as unknown as Record<string, unknown>) : undefined,
      npm_data: npm ? (npm as unknown as Record<string, unknown>) : undefined,
      deployment_data: deployments ? (deployments as unknown as Record<string, unknown>) : undefined,
      skills_detected,
      fraud_flags: fraud_check.flags,
      is_suspicious: fraud_check.is_suspicious,
      passport_eligible: passport.eligible,
      passport_created: false,
    };
    await saveAgent(agentRecord);

    // Infer capabilities and save (simplified version of client-side logic)
    const caps: CapabilityRecord[] = [];
    const descLower = description.toLowerCase();
    const langs = (github?.languages ?? []).map((l: string) => l.toLowerCase());

    // Smart Contracts
    if ((github?.solidity_repos ?? 0) > 0 || descLower.includes("solidity") || descLower.includes("smart contract")) {
      let s = 1 + Math.min(github?.solidity_repos ?? 0, 10);
      if (descLower.includes("audit")) s += 2;
      if (descLower.includes("defi")) s += 1;
      caps.push({ agent_id: agentId, name: "Smart Contracts", emoji: "⛓️", stars: s, evidence: `${github?.solidity_repos ?? 0} Solidity repos`, train_suggestion: "Formal verification & advanced DeFi patterns", color: "#ff8844" });
    }
    // Backend
    const backLangs = langs.filter((l: string) => ["go","rust","python","java","kotlin"].includes(l));
    if (backLangs.length > 0 || descLower.includes("backend") || descLower.includes("api")) {
      let s = 1 + backLangs.length * 2;
      if (descLower.includes("infrastructure")) s += 2;
      caps.push({ agent_id: agentId, name: "Backend & Systems", emoji: "⚙️", stars: s, evidence: backLangs.join(", ") || "profile", train_suggestion: "Distributed systems", color: "#aa44ff" });
    }
    // Frontend
    const frontLangs = langs.filter((l: string) => ["typescript","javascript","svelte","vue","css","html"].includes(l));
    if (frontLangs.length > 0 || descLower.includes("frontend") || descLower.includes("react")) {
      let s = 1 + Math.min(frontLangs.length, 4) * 2;
      if (descLower.includes("react") || descLower.includes("next.js")) s += 1;
      caps.push({ agent_id: agentId, name: "Frontend & UI", emoji: "🎨", stars: s, evidence: frontLangs.join(", ") || "profile", train_suggestion: "Design systems", color: "#4488ff" });
    }
    // DevOps
    if ((deployments?.live ?? 0) > 0 || descLower.includes("devops") || descLower.includes("deploy")) {
      let s = 1 + Math.min(deployments?.live ?? 0, 8);
      if (descLower.includes("docker") || descLower.includes("kubernetes")) s += 2;
      caps.push({ agent_id: agentId, name: "DevOps & Deployment", emoji: "🚀", stars: s, evidence: `${deployments?.live ?? 0} deployments`, train_suggestion: "Container orchestration", color: "#44ffff" });
    }
    // Security
    if (descLower.includes("security") || descLower.includes("audit") || descLower.includes("safety")) {
      let s = 2;
      if (descLower.includes("audit")) s += 3;
      if ((github?.solidity_repos ?? 0) > 0) s += 2;
      caps.push({ agent_id: agentId, name: "Security & Auditing", emoji: "🛡️", stars: s, evidence: "security focus", train_suggestion: "Cross-chain exploit patterns", color: "#ff4444" });
    }
    // Content
    if (descLower.includes("content") || descLower.includes("marketing") || descLower.includes("social")) {
      let s = 2;
      if (descLower.includes("automat")) s += 2;
      if (descLower.includes("tiktok") || descLower.includes("social media")) s += 2;
      if (descLower.includes("viral") || descLower.includes("growth")) s += 1;
      caps.push({ agent_id: agentId, name: "Content & Marketing", emoji: "✍️", stars: s, evidence: "profile", train_suggestion: "Growth loops", color: "#ff88cc" });
    }
    // Research
    if (descLower.includes("research") || descLower.includes("analysis") || descLower.includes("data")) {
      let s = 2;
      if (descLower.includes("rag")) s += 2;
      if (descLower.includes("competitive") || descLower.includes("market")) s += 1;
      caps.push({ agent_id: agentId, name: "Research & Analysis", emoji: "🔍", stars: s, evidence: "profile", train_suggestion: "Advanced RAG pipelines", color: "#ffcc00" });
    }
    // Orchestration
    if (descLower.includes("orchestrat") || descLower.includes("subagent") || descLower.includes("multi-agent") || descLower.includes("swarm")) {
      let s = 2;
      if (descLower.includes("orchestrat") && descLower.includes("agent")) s += 2;
      if (descLower.includes("swarm")) s += 2;
      caps.push({ agent_id: agentId, name: "Agent Orchestration", emoji: "🤖", stars: s, evidence: "profile", train_suggestion: "Swarm coordination", color: "#ff44ff" });
    }

    if (caps.length > 0) await saveCapabilities(caps);

    // ── Layer 1: Platform Attestations ──
    const attestations = [
      ...(github ? generateGitHubAttestations(github) : []),
      ...(npm ? generateNpmAttestations(npm) : []),
      ...(deployments ? generateDeploymentAttestations(deployments) : []),
    ];
    if (attestations.length > 0) await saveAttestations(agentId, attestations);

    // ── Layer 2: Hashed Work Entries ──
    const workEntries = generateWorkEntries(description, github, deployments, npm);
    if (workEntries.length > 0) await saveWorkEntries(agentId, workEntries);

    // ── Layer 3: Capability Inference (already done via caps above, but also store pattern data) ──
    const inferences = inferFromPattern(attestations, workEntries);
    // Update capabilities with pattern-based stars if higher
    const patternCaps: CapabilityRecord[] = inferences.map(inf => ({
      agent_id: agentId,
      name: inf.capability,
      emoji: "📊",
      stars: inf.stars,
      evidence: inf.evidence,
      train_suggestion: inf.growth,
      color: "#C4FF3C",
    }));
    if (patternCaps.length > 0) await saveCapabilities(patternCaps);

  } catch (dbErr) {
    console.error("Supabase save failed (non-blocking):", dbErr);
  }

  return NextResponse.json(report, { status: 201 });
}
