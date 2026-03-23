/**
 * receipts.ts — The Receipt Model
 * 
 * Prove what you did without showing the work.
 * Three layers:
 *   Layer 1: Platform Attestations (GitHub, OpenClaw, Vercel, npm, on-chain)
 *   Layer 2: Hashed Work Summaries (agent-generated, verifiable)
 *   Layer 3: Capability Inference (pattern recognition from metadata)
 */

import { createHash } from "crypto";
import { supabaseAdmin } from "./supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlatformAttestation {
  platform: "github" | "openclaw" | "vercel" | "npm" | "onchain";
  attestationType: string; // e.g. "repository_activity", "task_completion"
  summary: string; // human-readable: "Built 12 repos, 847 commits, 5 languages"
  metrics: Record<string, number | string | boolean>;
  verified: boolean;
}

export interface WorkEntry {
  entryType: string; // "smart_contract_audit", "app_deployment", "research_report"
  domain: string; // "security", "frontend", "research"
  durationHours?: number;
  outcome: "completed" | "partial" | "failed";
  complexity: "low" | "medium" | "high" | "critical";
  toolsUsed: string[];
  hash?: string; // computed
}

export interface CapabilityInference {
  capability: string;
  stars: number;
  evidence: string;
  pattern: string; // what the data pattern tells us
  growth: string; // what to improve
}

// ─── Layer 1: Platform Attestations ──────────────────────────────────────────

export function generateGitHubAttestations(githubData: {
  repos: number;
  total_stars: number;
  total_forks: number;
  languages: string[];
  account_age_days: number;
  commit_activity_signal: string;
  solidity_repos: number;
  top_repos?: { name: string; stars: number; language: string }[];
}): PlatformAttestation[] {
  const attestations: PlatformAttestation[] = [];

  // Repository activity
  attestations.push({
    platform: "github",
    attestationType: "repository_activity",
    summary: `Built ${githubData.repos} repositories across ${githubData.languages.length} languages`,
    metrics: {
      repos: githubData.repos,
      languages: githubData.languages.length,
      commit_activity: githubData.commit_activity_signal,
    },
    verified: true,
  });

  // Community impact
  if (githubData.total_stars > 0 || githubData.total_forks > 0) {
    attestations.push({
      platform: "github",
      attestationType: "community_impact",
      summary: `${githubData.total_stars.toLocaleString()} stars earned, ${githubData.total_forks.toLocaleString()} forks by others`,
      metrics: {
        total_stars: githubData.total_stars,
        total_forks: githubData.total_forks,
      },
      verified: true,
    });
  }

  // Account longevity
  if (githubData.account_age_days > 0) {
    const years = Math.floor(githubData.account_age_days / 365);
    const months = Math.floor((githubData.account_age_days % 365) / 30);
    attestations.push({
      platform: "github",
      attestationType: "account_longevity",
      summary: years > 0 ? `Active for ${years}+ years` : `Active for ${months} months`,
      metrics: {
        account_age_days: githubData.account_age_days,
        years,
      },
      verified: true,
    });
  }

  // Smart contract specialization
  if (githubData.solidity_repos > 0) {
    attestations.push({
      platform: "github",
      attestationType: "smart_contract_development",
      summary: `${githubData.solidity_repos} Solidity repositories — smart contract developer`,
      metrics: {
        solidity_repos: githubData.solidity_repos,
      },
      verified: true,
    });
  }

  // Language diversity
  if (githubData.languages.length >= 3) {
    attestations.push({
      platform: "github",
      attestationType: "language_diversity",
      summary: `Proficient in ${githubData.languages.slice(0, 5).join(", ")}${githubData.languages.length > 5 ? ` and ${githubData.languages.length - 5} more` : ""}`,
      metrics: {
        language_count: githubData.languages.length,
        primary_languages: githubData.languages.slice(0, 5).join(", "),
      },
      verified: true,
    });
  }

  return attestations;
}

export function generateNpmAttestations(npmData: {
  packages_found: number;
  total_weekly_downloads: number;
}): PlatformAttestation[] {
  if (npmData.packages_found === 0) return [];

  return [{
    platform: "npm",
    attestationType: "package_publishing",
    summary: `Published ${npmData.packages_found} packages with ${npmData.total_weekly_downloads.toLocaleString()} weekly downloads`,
    metrics: {
      packages: npmData.packages_found,
      weekly_downloads: npmData.total_weekly_downloads,
    },
    verified: true,
  }];
}

export function generateDeploymentAttestations(deployData: {
  live: number;
  checked: number;
}): PlatformAttestation[] {
  if (deployData.live === 0) return [];

  return [{
    platform: "vercel",
    attestationType: "live_deployments",
    summary: `${deployData.live} live deployments verified (${deployData.checked} checked)`,
    metrics: {
      live: deployData.live,
      checked: deployData.checked,
      uptime_rate: deployData.checked > 0 ? Math.round((deployData.live / deployData.checked) * 100) : 0,
    },
    verified: true,
  }];
}

// ─── Layer 2: Hashed Work Summaries ──────────────────────────────────────────

export function hashWorkEntry(entry: WorkEntry): string {
  const payload = JSON.stringify({
    type: entry.entryType,
    domain: entry.domain,
    duration: entry.durationHours,
    outcome: entry.outcome,
    complexity: entry.complexity,
    tools: entry.toolsUsed.sort(),
    timestamp: new Date().toISOString(),
  });
  return "0x" + createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function generateWorkEntries(
  description: string,
  githubData?: { repos: number; solidity_repos: number; languages: string[]; commit_activity_signal: string } | null,
  deployData?: { live: number } | null,
  npmData?: { packages_found: number } | null,
): WorkEntry[] {
  const entries: WorkEntry[] = [];
  const desc = description.toLowerCase();

  // Infer work entries from GitHub data
  if (githubData && githubData.repos > 0) {
    // Repository building
    const repoEntries = Math.min(githubData.repos, 20); // cap representation
    for (let i = 0; i < Math.ceil(repoEntries / 5); i++) {
      const entry: WorkEntry = {
        entryType: "repository_development",
        domain: "code",
        durationHours: undefined, // unknown
        outcome: "completed",
        complexity: githubData.repos > 20 ? "high" : githubData.repos > 5 ? "medium" : "low",
        toolsUsed: githubData.languages.slice(0, 4),
      };
      entry.hash = hashWorkEntry(entry);
      entries.push(entry);
    }

    // Smart contract specific
    if (githubData.solidity_repos > 0) {
      for (let i = 0; i < Math.min(githubData.solidity_repos, 5); i++) {
        const entry: WorkEntry = {
          entryType: "smart_contract_development",
          domain: "blockchain",
          outcome: "completed",
          complexity: "high",
          toolsUsed: ["Solidity", ...(githubData.languages.includes("Rust") ? ["Rust"] : [])],
        };
        entry.hash = hashWorkEntry(entry);
        entries.push(entry);
      }
    }
  }

  // Deployment work
  if (deployData && deployData.live > 0) {
    for (let i = 0; i < Math.min(deployData.live, 5); i++) {
      const entry: WorkEntry = {
        entryType: "app_deployment",
        domain: "devops",
        outcome: "completed",
        complexity: "medium",
        toolsUsed: ["Vercel"],
      };
      entry.hash = hashWorkEntry(entry);
      entries.push(entry);
    }
  }

  // npm publishing
  if (npmData && npmData.packages_found > 0) {
    for (let i = 0; i < Math.min(npmData.packages_found, 3); i++) {
      const entry: WorkEntry = {
        entryType: "package_publishing",
        domain: "open_source",
        outcome: "completed",
        complexity: "medium",
        toolsUsed: ["npm", "TypeScript"],
      };
      entry.hash = hashWorkEntry(entry);
      entries.push(entry);
    }
  }

  // Description-inferred entries
  if (desc.includes("audit")) {
    const entry: WorkEntry = {
      entryType: "security_audit",
      domain: "security",
      outcome: "completed",
      complexity: "high",
      toolsUsed: desc.includes("slither") ? ["Slither"] : desc.includes("foundry") ? ["Foundry"] : ["manual review"],
    };
    entry.hash = hashWorkEntry(entry);
    entries.push(entry);
  }

  if (desc.includes("research") || desc.includes("analysis")) {
    const entry: WorkEntry = {
      entryType: "research_analysis",
      domain: "research",
      outcome: "completed",
      complexity: "medium",
      toolsUsed: desc.includes("rag") ? ["RAG pipeline"] : ["web research"],
    };
    entry.hash = hashWorkEntry(entry);
    entries.push(entry);
  }

  if (desc.includes("marketing") || desc.includes("content")) {
    const entry: WorkEntry = {
      entryType: "content_creation",
      domain: "marketing",
      outcome: "completed",
      complexity: desc.includes("automat") ? "high" : "medium",
      toolsUsed: desc.includes("tiktok") ? ["TikTok", "social automation"] : ["content pipeline"],
    };
    entry.hash = hashWorkEntry(entry);
    entries.push(entry);
  }

  return entries;
}

// ─── Layer 3: Capability Inference ───────────────────────────────────────────

export function inferFromPattern(
  attestations: PlatformAttestation[],
  workEntries: WorkEntry[],
): CapabilityInference[] {
  const inferences: CapabilityInference[] = [];

  // Group work entries by domain
  const domainCounts: Record<string, { count: number; highComplexity: number; tools: Set<string> }> = {};
  for (const entry of workEntries) {
    if (!domainCounts[entry.domain]) {
      domainCounts[entry.domain] = { count: 0, highComplexity: 0, tools: new Set() };
    }
    domainCounts[entry.domain].count++;
    if (entry.complexity === "high" || entry.complexity === "critical") {
      domainCounts[entry.domain].highComplexity++;
    }
    entry.toolsUsed.forEach(t => domainCounts[entry.domain].tools.add(t));
  }

  // Analyze attestations
  const githubAttestations = attestations.filter(a => a.platform === "github");
  const hasGitHub = githubAttestations.length > 0;
  const repoCount = (githubAttestations.find(a => a.attestationType === "repository_activity")?.metrics.repos as number) ?? 0;
  const starCount = (githubAttestations.find(a => a.attestationType === "community_impact")?.metrics.total_stars as number) ?? 0;
  const accountYears = (githubAttestations.find(a => a.attestationType === "account_longevity")?.metrics.years as number) ?? 0;

  // Code capability
  if (domainCounts.code || hasGitHub) {
    const codeEntries = domainCounts.code?.count ?? 0;
    let stars = 1;
    stars += Math.min(Math.floor(repoCount / 5), 8);
    if (starCount >= 1000) stars += 3;
    else if (starCount >= 100) stars += 2;
    else if (starCount >= 10) stars += 1;
    if (accountYears >= 3) stars += 1;

    let pattern = `${repoCount} repos built`;
    if (starCount > 0) pattern += `, ${starCount.toLocaleString()} stars earned`;
    if (codeEntries > 0) pattern += `, ${codeEntries} verified work entries`;

    inferences.push({
      capability: "Software Development",
      stars,
      evidence: `${repoCount} repositories · ${starCount.toLocaleString()} stars`,
      pattern,
      growth: stars >= 8 ? "Contribute to major open source projects" : "Build more public projects to earn stars",
    });
  }

  // Blockchain
  if (domainCounts.blockchain) {
    const bc = domainCounts.blockchain;
    let stars = 2 + bc.count;
    if (bc.highComplexity > 0) stars += bc.highComplexity;
    stars = Math.min(stars, 15);

    inferences.push({
      capability: "Smart Contracts",
      stars,
      evidence: `${bc.count} blockchain work entries · ${bc.highComplexity} high-complexity`,
      pattern: `Completed ${bc.count} blockchain tasks, ${bc.highComplexity} were high complexity`,
      growth: "Advanced formal verification & cross-chain patterns",
    });
  }

  // Security
  if (domainCounts.security) {
    const sec = domainCounts.security;
    let stars = 3 + sec.count * 2;
    if (sec.highComplexity > 0) stars += sec.highComplexity;
    stars = Math.min(stars, 15);

    inferences.push({
      capability: "Security & Auditing",
      stars,
      evidence: `${sec.count} security entries · tools: ${[...sec.tools].join(", ")}`,
      pattern: `Completed ${sec.count} security tasks using ${[...sec.tools].join(", ")}`,
      growth: "Expand to new vulnerability classes and audit frameworks",
    });
  }

  // DevOps
  if (domainCounts.devops) {
    const ops = domainCounts.devops;
    let stars = 1 + ops.count * 2;
    stars = Math.min(stars, 12);

    inferences.push({
      capability: "DevOps & Deployment",
      stars,
      evidence: `${ops.count} deployments verified live`,
      pattern: `${ops.count} successful deployments, all verified accessible`,
      growth: "Container orchestration & zero-downtime deployment patterns",
    });
  }

  // Open Source
  if (domainCounts.open_source) {
    const os = domainCounts.open_source;
    let stars = 2 + os.count * 2;
    if (starCount >= 100) stars += 2;
    stars = Math.min(stars, 12);

    inferences.push({
      capability: "Open Source",
      stars,
      evidence: `${os.count} packages published`,
      pattern: `Published ${os.count} open source packages`,
      growth: "Grow community adoption and contributor base",
    });
  }

  // Research
  if (domainCounts.research) {
    const res = domainCounts.research;
    let stars = 2 + res.count;
    stars = Math.min(stars, 10);

    inferences.push({
      capability: "Research & Analysis",
      stars,
      evidence: `${res.count} research entries`,
      pattern: `Completed ${res.count} research tasks`,
      growth: "Advanced RAG pipelines & multi-source synthesis",
    });
  }

  // Marketing
  if (domainCounts.marketing) {
    const mkt = domainCounts.marketing;
    let stars = 2 + mkt.count * 2;
    if (mkt.highComplexity > 0) stars += 2;
    stars = Math.min(stars, 12);

    inferences.push({
      capability: "Content & Marketing",
      stars,
      evidence: `${mkt.count} marketing entries · ${mkt.highComplexity > 0 ? "automated" : "manual"}`,
      pattern: `${mkt.count} content tasks, ${mkt.highComplexity > 0 ? "using automation" : "manual execution"}`,
      growth: "Growth loops & revenue attribution systems",
    });
  }

  // Sort by stars
  inferences.sort((a, b) => b.stars - a.stars);

  return inferences;
}

// ─── Save to Database ────────────────────────────────────────────────────────

export async function saveAttestations(agentId: string, attestations: PlatformAttestation[]): Promise<boolean> {
  try {
    const rows = attestations.map(a => ({
      agent_id: agentId,
      platform: a.platform,
      attestation_type: a.attestationType,
      summary: a.summary,
      metrics: a.metrics,
      verified: a.verified,
    }));

    const { error } = await supabaseAdmin
      .from("attestations")
      .upsert(rows, { onConflict: "agent_id,platform,attestation_type" });

    if (error) { console.error("saveAttestations error:", error); return false; }
    return true;
  } catch { return false; }
}

export async function saveWorkEntries(agentId: string, entries: WorkEntry[]): Promise<boolean> {
  try {
    const rows = entries.map(e => ({
      agent_id: agentId,
      entry_type: e.entryType,
      domain: e.domain,
      duration_hours: e.durationHours,
      outcome: e.outcome,
      complexity: e.complexity,
      tools_used: e.toolsUsed,
      hash: e.hash ?? hashWorkEntry(e),
    }));

    const { error } = await supabaseAdmin
      .from("work_entries")
      .insert(rows);

    if (error) { console.error("saveWorkEntries error:", error); return false; }
    return true;
  } catch { return false; }
}
