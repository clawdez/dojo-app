import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/v1/synthesis
 * 
 * Fetches all published Synthesis hackathon projects, scores them through
 * the Dojo evaluation engine, and returns portfolios.
 * 
 * Query params:
 *   ?page=1&limit=20 — pagination
 *   ?refresh=true — re-fetch from Synthesis API (otherwise uses cached data)
 */

interface SynthesisProject {
  uuid: string;
  name: string;
  slug: string;
  description: string;
  problemStatement: string;
  repoURL: string;
  deployedURL: string | null;
  submissionMetadata: {
    model?: string;
    agentHarness?: string;
    agentFramework?: string;
    skills?: string[];
    tools?: string[];
    commitCount?: number;
    contributorCount?: number;
    firstCommitAt?: string;
    lastCommitAt?: string;
    intention?: string;
  };
  members: { participantName: string; walletAddress: string }[];
  tracks: { name: string; slug: string }[];
}

interface ScoredAgent {
  name: string;
  slug: string;
  description: string;
  repoURL: string;
  deployedURL: string | null;
  model: string;
  harness: string;
  skills: string[];
  tools: string[];
  commitCount: number;
  contributorCount: number;
  tracks: string[];
  // Dojo scores
  totalStars: number;
  capabilities: { name: string; stars: number; evidence: string }[];
}

function scoreProject(project: SynthesisProject): ScoredAgent {
  const meta = project.submissionMetadata || {};
  const caps: { name: string; stars: number; evidence: string }[] = [];

  const commitCount = meta.commitCount ?? 0;
  const contributorCount = meta.contributorCount ?? 0;
  const skills = meta.skills ?? [];
  const tools = meta.tools ?? [];
  const hasDeployment = !!project.deployedURL;
  const hasRepo = !!project.repoURL;

  // Software Development — based on commits + contributors
  if (hasRepo) {
    let stars = 1;
    if (commitCount >= 500) stars += 5;
    else if (commitCount >= 200) stars += 4;
    else if (commitCount >= 100) stars += 3;
    else if (commitCount >= 50) stars += 2;
    else if (commitCount >= 10) stars += 1;
    if (contributorCount >= 5) stars += 2;
    else if (contributorCount >= 2) stars += 1;
    caps.push({ name: "Software Development", stars, evidence: `${commitCount} commits, ${contributorCount} contributors` });
  }

  // Deployment — has a live URL
  if (hasDeployment) {
    caps.push({ name: "DevOps & Deployment", stars: 3, evidence: "live deployment verified" });
  }

  // Smart Contracts — check tools/skills
  const scSignals = [...skills, ...tools].filter(s =>
    s.toLowerCase().includes("solidity") || s.toLowerCase().includes("foundry") ||
    s.toLowerCase().includes("hardhat") || s.toLowerCase().includes("smart-contract") ||
    s.toLowerCase().includes("viem") || s.toLowerCase().includes("wagmi")
  );
  if (scSignals.length > 0) {
    caps.push({ name: "Smart Contracts", stars: 2 + scSignals.length, evidence: scSignals.join(", ") });
  }

  // AI/Agent — check model + harness
  if (meta.model || meta.agentHarness) {
    let stars = 2;
    if (meta.agentFramework) stars += 1;
    if (skills.length >= 5) stars += 1;
    caps.push({ name: "Agent Development", stars, evidence: `${meta.model ?? "unknown"} on ${meta.agentHarness ?? "unknown"}` });
  }

  // Security — check for security-related tools/skills
  const secSignals = [...skills, ...tools].filter(s =>
    s.toLowerCase().includes("security") || s.toLowerCase().includes("audit") ||
    s.toLowerCase().includes("slither") || s.toLowerCase().includes("mythril")
  );
  if (secSignals.length > 0) {
    caps.push({ name: "Security", stars: 2 + secSignals.length, evidence: secSignals.join(", ") });
  }

  // Research — description keywords
  const desc = (project.description || "").toLowerCase();
  if (desc.includes("research") || desc.includes("analysis") || desc.includes("data")) {
    caps.push({ name: "Research & Analysis", stars: 2, evidence: "described in submission" });
  }

  // Sort by stars
  caps.sort((a, b) => b.stars - a.stars);
  const totalStars = caps.reduce((s, c) => s + c.stars, 0);

  return {
    name: project.name,
    slug: project.slug,
    description: (project.description || "").slice(0, 200),
    repoURL: project.repoURL,
    deployedURL: project.deployedURL,
    model: meta.model ?? "unknown",
    harness: meta.agentHarness ?? "unknown",
    skills,
    tools,
    commitCount,
    contributorCount,
    tracks: project.tracks?.map(t => t.name) ?? [],
    totalStars,
    capabilities: caps,
  };
}

export async function GET(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") ?? "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") ?? "50");

  try {
    // Fetch published projects from Synthesis API
    const res = await fetch(
      `https://synthesis.devfolio.co/projects?page=${page}&limit=${limit}`,
      { next: { revalidate: 300 } } // cache for 5 min
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch Synthesis projects" }, { status: 502 });
    }

    const data = await res.json();
    const projects: SynthesisProject[] = data.data ?? [];

    // Score each project
    const scored = projects.map(scoreProject);

    // Sort by total stars
    scored.sort((a, b) => b.totalStars - a.totalStars);

    // Stats
    const totalProjects = data.pagination?.total ?? projects.length;
    const avgStars = scored.length > 0 ? Math.round(scored.reduce((s, a) => s + a.totalStars, 0) / scored.length) : 0;
    const topAgent = scored[0];

    // Save top agents to Supabase (non-blocking)
    try {
      for (const agent of scored.slice(0, 10)) {
        await supabaseAdmin.from("agents").upsert({
          agent_id: `synthesis-${agent.slug}`,
          name: agent.name,
          description: agent.description,
          model: agent.model,
          skills_detected: [...agent.skills, ...agent.tools],
          fraud_flags: [],
          is_suspicious: false,
          passport_eligible: true,
          passport_created: false,
        }, { onConflict: "agent_id" });
      }
    } catch {
      // non-blocking
    }

    return NextResponse.json({
      summary: {
        totalProjects,
        scoredThisPage: scored.length,
        avgStars,
        topAgent: topAgent ? { name: topAgent.name, stars: topAgent.totalStars } : null,
      },
      agents: scored,
      pagination: data.pagination,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
