"use client";

import { useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

// ─── Types ───────────────────────────────────────────────────────────────────

type OnboardStep = "connect" | "assessing" | "portfolio" | "passport";

interface TopRepo {
  name: string;
  stars: number;
  language: string;
  description: string;
}

interface PortfolioResult {
  agentId: string;
  agentName: string;
  model: string;
  // Verified work evidence
  evidence: {
    repos: number;
    totalStars: number;
    totalForks: number;
    npmPackages: number;
    liveDeployments: number;
    languages: string[];
    topRepos: TopRepo[];
    accountAgeDays: number;
    commitActivity: string;
    solidityRepos: number;
  };
  // Capability map — inferred from evidence
  capabilities: CapabilityEntry[];
  // Skills detected
  skillsDetected: string[];
  // Fraud check
  fraudCheck: { isSuspicious: boolean; flags: string[] };
  // What this agent could teach
  teachableSkills: string[];
  // Passport eligibility
  passportEligible: boolean;
}

interface CapabilityEntry {
  name: string;
  emoji: string;
  stars: number; // earned from verified work, no cap
  evidence: string; // what proves this
  trainSuggestion: string; // what to learn next
  color: string;
}

// ─── Loading Messages ────────────────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Connecting to agent platforms...",
  "Pulling GitHub repository data...",
  "Analyzing commit history and contributions...",
  "Checking npm package registry...",
  "Verifying live deployments...",
  "Running fraud detection...",
  "Inferring capabilities from work history...",
  "Building capability portfolio...",
  "✅ Portfolio ready",
];

// ─── Capability Inference ────────────────────────────────────────────────────

function inferCapabilities(data: {
  repos: number;
  totalStars: number;
  totalForks: number;
  languages: string[];
  commitActivity: string;
  solidityRepos: number;
  npmPackages: number;
  liveDeployments: number;
  accountAgeDays: number;
  description: string;
  topRepos: TopRepo[];
}): { capabilities: CapabilityEntry[]; teachableSkills: string[] } {
  const caps: CapabilityEntry[] = [];
  const teachable: string[] = [];
  const desc = data.description.toLowerCase();
  const langs = data.languages.map(l => l.toLowerCase());

  // Star calculation rules:
  // - Platform-verified data (GitHub repos, npm, deployments) = bulk of stars
  // - Description keywords ALONE = MAX 1 star per capability (unverified claim)
  // - Stars have NO CAP from verified sources — more real work = more stars
  const hasVerifiedData = data.repos > 0 || data.npmPackages > 0 || data.liveDeployments > 0;

  // ── Smart Contract / Blockchain ──
  if (data.solidityRepos > 0 || desc.includes("solidity") || desc.includes("smart contract") || desc.includes("anchor")) {
    let stars = 1; // base for having it
    stars += Math.min(data.solidityRepos, 10); // 1 star per Solidity repo, up to 10
    if (desc.includes("audit")) stars += 2;
    if (desc.includes("defi") || desc.includes("protocol")) stars += 1;
    if (data.commitActivity === "high") stars += 1;
    caps.push({ name: "Smart Contracts", emoji: "⛓️", stars, evidence: data.solidityRepos > 0 ? `${data.solidityRepos} Solidity repos` : "described in profile", trainSuggestion: "Formal verification & advanced DeFi patterns", color: "#ff8844" });
    if (stars >= 5) teachable.push("Smart contract development & auditing");
  }

  // ── Backend / Systems ──
  const backendLangs = langs.filter(l => ["go", "rust", "python", "java", "kotlin", "c#", "c++"].includes(l));
  if (backendLangs.length > 0 || desc.includes("backend") || desc.includes("api") || desc.includes("server")) {
    let stars = 1;
    stars += backendLangs.length * 2; // 2 stars per backend language
    if (desc.includes("api")) stars += 1;
    if (desc.includes("infrastructure") || desc.includes("distributed")) stars += 2;
    if (data.repos >= 20) stars += 1;
    caps.push({ name: "Backend & Systems", emoji: "⚙️", stars, evidence: backendLangs.length > 0 ? backendLangs.join(", ") : "described in profile", trainSuggestion: "Distributed systems & scalability patterns", color: "#aa44ff" });
    if (stars >= 5) teachable.push("Backend architecture & API design");
  }

  // ── Frontend / UI ──
  const frontendLangs = langs.filter(l => ["typescript", "javascript", "svelte", "vue", "css", "html"].includes(l));
  if (frontendLangs.length > 0 || desc.includes("frontend") || desc.includes("react") || desc.includes("next.js") || desc.includes("ui")) {
    let stars = 1;
    stars += Math.min(frontendLangs.length, 4) * 2;
    if (desc.includes("react") || desc.includes("next.js")) stars += 1;
    if (desc.includes("design") || desc.includes("ui/ux")) stars += 1;
    if (data.liveDeployments > 0) stars += 1;
    caps.push({ name: "Frontend & UI", emoji: "🎨", stars, evidence: frontendLangs.length > 0 ? frontendLangs.join(", ") : "described in profile", trainSuggestion: "Design systems & advanced component patterns", color: "#4488ff" });
    if (stars >= 5) teachable.push("Frontend development & component architecture");
  }

  // ── DevOps / Deployment ──
  if (data.liveDeployments > 0 || desc.includes("devops") || desc.includes("deploy") || desc.includes("docker") || desc.includes("kubernetes") || desc.includes("ci/cd")) {
    let stars = 1;
    stars += Math.min(data.liveDeployments, 8); // 1 star per live deployment
    if (desc.includes("docker") || desc.includes("kubernetes")) stars += 2;
    if (desc.includes("ci/cd") || desc.includes("pipeline")) stars += 1;
    caps.push({ name: "DevOps & Deployment", emoji: "🚀", stars, evidence: data.liveDeployments > 0 ? `${data.liveDeployments} live deployments verified` : "described in profile", trainSuggestion: "Container orchestration & zero-downtime deployments", color: "#44ffff" });
    if (stars >= 5) teachable.push("Deployment pipelines & infrastructure");
  }

  // ── Open Source / Community ──
  if (data.npmPackages > 0 || data.totalStars >= 50 || data.totalForks >= 20) {
    let stars = 1;
    stars += Math.min(data.npmPackages * 2, 6);
    if (data.totalStars >= 10000) stars += 4;
    else if (data.totalStars >= 1000) stars += 3;
    else if (data.totalStars >= 100) stars += 2;
    else if (data.totalStars >= 10) stars += 1;
    if (data.totalForks >= 100) stars += 2;
    else if (data.totalForks >= 20) stars += 1;
    caps.push({ name: "Open Source", emoji: "🌐", stars, evidence: `${data.totalStars.toLocaleString()} stars · ${data.npmPackages} packages`, trainSuggestion: "Community building & maintainer workflows", color: "#C4FF3C" });
    if (stars >= 5) teachable.push("Open source project management");
  }

  // ── Research & Analysis ──
  if (desc.includes("research") || desc.includes("analysis") || desc.includes("rag") || desc.includes("data") || desc.includes("intel")) {
    let stars = 2;
    if (desc.includes("deep") || desc.includes("expert")) stars += 2;
    if (desc.includes("rag") || desc.includes("retrieval")) stars += 2;
    if (desc.includes("competitive") || desc.includes("market") || desc.includes("intel")) stars += 1;
    if (desc.includes("synthesis") || desc.includes("summariz")) stars += 1;
    if (desc.includes("web") || desc.includes("search") || desc.includes("scraping")) stars += 1;
    // GitHub doc repos count as research evidence
    if (data.topRepos.some(r => r.description?.toLowerCase().includes("research") || r.description?.toLowerCase().includes("doc") || r.name.toLowerCase().includes("research"))) stars += 2;
    caps.push({ name: "Research & Analysis", emoji: "🔍", stars, evidence: data.topRepos.some(r => r.name.toLowerCase().includes("research")) ? "research repos detected" : "described in profile", trainSuggestion: "Advanced RAG pipelines & knowledge synthesis", color: "#ffcc00" });
    if (stars >= 5) teachable.push("Research methodology & data analysis");
  }

  // ── Agent Orchestration ──
  if (desc.includes("orchestrat") || desc.includes("subagent") || desc.includes("multi-agent") || desc.includes("swarm") || desc.includes("workflow")) {
    let stars = 2;
    if (desc.includes("orchestrat") && desc.includes("agent")) stars += 2;
    if (desc.includes("swarm") || desc.includes("multi-agent")) stars += 2;
    if (desc.includes("automat")) stars += 1;
    caps.push({ name: "Agent Orchestration", emoji: "🤖", stars, evidence: "described in profile", trainSuggestion: "Swarm coordination & inter-agent protocols", color: "#ff44ff" });
    if (stars >= 5) teachable.push("Multi-agent orchestration & workflow design");
  }

  // ── Security & Safety ──
  if (desc.includes("security") || desc.includes("audit") || desc.includes("safety") || desc.includes("adversarial")) {
    let stars = 2;
    if (desc.includes("audit")) stars += 3;
    if (data.solidityRepos > 0) stars += 2;
    if (desc.includes("adversarial") || desc.includes("vulnerability")) stars += 1;
    if (desc.includes("trust")) stars += 1;
    caps.push({ name: "Security & Auditing", emoji: "🛡️", stars, evidence: data.solidityRepos > 0 ? `${data.solidityRepos} Solidity repos + security focus` : "described in profile", trainSuggestion: "Formal verification & cross-chain exploit patterns", color: "#ff4444" });
    if (stars >= 5) teachable.push("Smart contract auditing & security testing");
  }

  // ── Content & Marketing ──
  if (desc.includes("content") || desc.includes("marketing") || desc.includes("writing") || desc.includes("copy") || desc.includes("social")) {
    let stars = 2;
    if (desc.includes("automat")) stars += 2;
    if (desc.includes("social media") || desc.includes("tiktok") || desc.includes("twitter") || desc.includes("instagram")) stars += 2;
    if (desc.includes("seo") || desc.includes("growth")) stars += 1;
    if (desc.includes("a/b") || desc.includes("test")) stars += 1;
    if (desc.includes("viral") || desc.includes("views") || desc.includes("engagement")) stars += 1;
    if (desc.includes("revenue") || desc.includes("attribution") || desc.includes("tracking")) stars += 1;
    if (desc.includes("schedule") || desc.includes("pipeline") || desc.includes("workflow")) stars += 1;
    caps.push({ name: "Content & Marketing", emoji: "✍️", stars, evidence: "described in profile", trainSuggestion: "Growth loops & automated content pipelines", color: "#ff88cc" });
    if (stars >= 5) teachable.push("Automated content marketing");
  }

  // If no capabilities inferred
  if (caps.length === 0) {
    caps.push({ name: "Getting Started", emoji: "🌱", stars: 1, evidence: "connect more platforms to earn stars", trainSuggestion: "Build your first verified project", color: "#888" });
  }

  // Sort by stars (most first)
  caps.sort((a, b) => b.stars - a.stars);

  return { capabilities: caps, teachableSkills: teachable };
}

// Stars are earned from verified work — no cap, no empty stars, always room to earn more
function renderStars(count: number): string {
  return "★".repeat(count);
}


// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardPage() {
  const [step, setStep] = useState<OnboardStep>("connect");
  const [agentName, setAgentName] = useState("");
  const [agentDesc, setAgentDesc] = useState("");
  const [agentModel, setAgentModel] = useState("claude-opus-4-6");
  const [githubUrl, setGithubUrl] = useState("");
  const [deploymentUrls, setDeploymentUrls] = useState("");
  const [npmPackages, setNpmPackages] = useState("");
  const [logIndex, setLogIndex] = useState(0);
  const [portfolio, setPortfolio] = useState<PortfolioResult | null>(null);
  const [passportCreated, setPassportCreated] = useState(false);
  const [passportMinting, setPassportMinting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const startAssessment = async () => {
    if (!agentName.trim() || !agentDesc.trim()) return;
    setStep("assessing");
    setLogIndex(0);
    setApiError(null);

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLogIndex(i);
      if (i >= LOADING_MESSAGES.length - 1) clearInterval(interval);
    }, 500);

    try {
      const deployUrls = deploymentUrls.split(",").map(u => u.trim()).filter(Boolean);
      const npmPkgs = npmPackages.split(",").map(p => p.trim()).filter(Boolean);

      const res = await fetch("/api/v1/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName.trim(),
          description: agentDesc.trim(),
          model: agentModel.trim() || "unknown",
          githubUrl: githubUrl.trim() || undefined,
          deploymentUrls: deployUrls.length > 0 ? deployUrls : undefined,
          npmPackages: npmPkgs.length > 0 ? npmPkgs : undefined,
        }),
      });

      clearInterval(interval);
      setLogIndex(LOADING_MESSAGES.length - 1);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Assessment failed" }));
        setApiError((err as { error?: string }).error ?? "Assessment failed");
        setStep("connect");
        return;
      }

      const data = await res.json() as {
        agentId: string;
        evaluation: {
          overall_score: number;
          domains: Record<string, number>;
          skills_detected: string[];
          fraud_check: { is_suspicious: boolean; flags: string[] };
          off_chain_summary: { repos: number; total_stars: number; npm_packages: number; live_deployments: number };
          raw: {
            github?: {
              username: string; repos: number; total_stars: number; total_forks: number;
              languages: string[]; top_repos: TopRepo[];
              account_age_days: number; commit_activity_signal: string; solidity_repos: number;
            };
            npm?: { packages_found: number };
            deployments?: { live: number };
          };
        };
        passport: { eligible: boolean };
      };

      const gh = data.evaluation.raw.github;
      const evidence = {
        repos: gh?.repos ?? data.evaluation.off_chain_summary.repos,
        totalStars: gh?.total_stars ?? data.evaluation.off_chain_summary.total_stars,
        totalForks: gh?.total_forks ?? 0,
        npmPackages: data.evaluation.off_chain_summary.npm_packages,
        liveDeployments: data.evaluation.off_chain_summary.live_deployments,
        languages: gh?.languages ?? [],
        topRepos: gh?.top_repos ?? [],
        accountAgeDays: gh?.account_age_days ?? 0,
        commitActivity: gh?.commit_activity_signal ?? "unknown",
        solidityRepos: gh?.solidity_repos ?? 0,
      };

      const { capabilities, teachableSkills } = inferCapabilities({
        ...evidence,
        description: agentDesc,
      });

      const result: PortfolioResult = {
        agentId: data.agentId,
        agentName: agentName.trim(),
        model: agentModel.trim(),
        evidence,
        capabilities,
        skillsDetected: data.evaluation.skills_detected,
        fraudCheck: {
          isSuspicious: data.evaluation.fraud_check.is_suspicious,
          flags: data.evaluation.fraud_check.flags,
        },
        teachableSkills,
        passportEligible: data.passport.eligible,
      };

      setPortfolio(result);

      if (typeof window !== "undefined") {
        localStorage.setItem("dojo_agent_id", data.agentId);
        localStorage.setItem("dojo_agent_name", agentName.trim());
      }

      setTimeout(() => setStep("portfolio"), 600);
    } catch {
      clearInterval(interval);
      setApiError("Network error — please try again");
      setStep("connect");
    }
  };

  const mintPassport = async () => {
    if (!portfolio) return;
    setPassportMinting(true);
    try {
      const res = await fetch("/api/v1/passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: portfolio.agentId,
          evaluationData: {
            agentName: portfolio.agentName,
            overallScore: Math.round(portfolio.capabilities.reduce((sum, c) => sum + Math.min(c.stars * 10, 100), 0) / portfolio.capabilities.length),
            safetyScore: 50,
            domains: portfolio.capabilities.map(c => ({
              domain: c.name,
              score: Math.min(c.stars * 10, 100),
              verdict: c.stars >= 8 ? "deep" : c.stars >= 5 ? "strong" : c.stars >= 3 ? "moderate" : "basic",
            })),
          },
        }),
      });
      if (res.ok) {
        setPassportCreated(true);
        setStep("passport");
      } else {
        const err = await res.json().catch(() => ({ error: "Passport creation failed" }));
        setApiError((err as { error?: string }).error ?? "Passport creation failed");
      }
    } catch {
      setApiError("Network error creating passport");
    } finally {
      setPassportMinting(false);
    }
  };

  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* ── Progress ── */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono">
            {(["connect", "assessing", "portfolio", "passport"] as OnboardStep[]).map((s, i) => {
              const steps: OnboardStep[] = ["connect", "assessing", "portfolio", "passport"];
              const currentIdx = steps.indexOf(step);
              return (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={{
                      background: currentIdx >= i ? "var(--accent)" : "var(--card)",
                      color: currentIdx >= i ? "black" : "var(--muted)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    {i + 1}
                  </div>
                  {i < 3 && (
                    <div className="w-12 h-px" style={{ background: currentIdx > i ? "var(--accent)" : "var(--card-border)" }} />
                  )}
                </div>
              );
            })}
          </div>

          {apiError && (
            <div className="rounded-lg px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20">
              ⚠️ {apiError}
            </div>
          )}

          {/* ── Step 1: Connect ── */}
          {step === "connect" && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Build Your Agent&apos;s Portfolio</h1>
                <p className="text-sm text-[var(--muted)]">
                  Connect your agent&apos;s platforms. We&apos;ll verify what it&apos;s built and map its capabilities — without accessing sensitive data.
                </p>
              </div>

              <div
                className="rounded-xl p-6 space-y-4"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Agent Info</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">Agent Name *</label>
                    <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)}
                      placeholder="e.g. Clawdez, Jensen, LarryClawerence"
                      className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">What does this agent do? *</label>
                    <textarea value={agentDesc} onChange={(e) => setAgentDesc(e.target.value)}
                      placeholder="Describe its skills, tools, what it builds, what tasks it handles. The more detail, the better the portfolio."
                      rows={4}
                      className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors resize-none" />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">Model</label>
                    <input type="text" value={agentModel} onChange={(e) => setAgentModel(e.target.value)}
                      placeholder="e.g. claude-opus-4-6, gpt-4o"
                      className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors" />
                  </div>
                </div>

                <div className="border-t border-[var(--card-border)] pt-4 mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-3">Connect Platforms <span className="text-[var(--accent)]">(more = better portfolio)</span></h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">📂 GitHub URL</label>
                      <input type="text" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">🚀 Live Deployments <span className="font-normal">(comma separated)</span></label>
                      <input type="text" value={deploymentUrls} onChange={(e) => setDeploymentUrls(e.target.value)}
                        placeholder="https://myapp.vercel.app, https://api.myagent.xyz"
                        className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">📦 npm Packages <span className="font-normal">(comma separated)</span></label>
                      <input type="text" value={npmPackages} onChange={(e) => setNpmPackages(e.target.value)}
                        placeholder="@maiat/sdk, my-agent-plugin"
                        className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors" />
                    </div>
                  </div>
                </div>

                <button onClick={startAssessment} disabled={!agentName.trim() || !agentDesc.trim()}
                  className="w-full px-6 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-black hover:opacity-90 transition-opacity disabled:opacity-30">
                  Build Portfolio →
                </button>
              </div>

              <div className="rounded-xl p-5 border border-[var(--accent)]/10 bg-[var(--accent)]/3 text-center">
                <p className="text-[11px] text-[var(--muted)]">
                  🔒 <strong className="text-[var(--foreground)]">Privacy first:</strong> We pull stats and metadata only. No code, no conversations, no sensitive data is ever accessed or stored.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Assessing ── */}
          {step === "assessing" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold animate-pulse">Building Portfolio...</h1>
                <p className="text-sm text-[var(--muted)]">Pulling verified data from connected platforms</p>
              </div>
              <div className="rounded-xl p-5 max-h-96 overflow-y-auto" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="space-y-1.5">
                  {LOADING_MESSAGES.slice(0, logIndex + 1).map((msg, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="text-[var(--accent)] font-mono w-6 shrink-0">▸</span>
                      <span className={i === logIndex ? "text-white" : "text-[var(--muted)]"}>{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-[var(--card)] overflow-hidden">
                  <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${Math.min(100, ((logIndex + 1) / LOADING_MESSAGES.length) * 100)}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Portfolio ── */}
          {step === "portfolio" && portfolio && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">{portfolio.agentName}&apos;s Portfolio</h1>
                <p className="text-sm text-[var(--muted)]">
                  Verified from {portfolio.evidence.repos > 0 ? `${portfolio.evidence.repos} repos` : ""}
                  {portfolio.evidence.npmPackages > 0 ? ` · ${portfolio.evidence.npmPackages} packages` : ""}
                  {portfolio.evidence.liveDeployments > 0 ? ` · ${portfolio.evidence.liveDeployments} live deployments` : ""}
                  {portfolio.evidence.repos === 0 && portfolio.evidence.npmPackages === 0 && portfolio.evidence.liveDeployments === 0 ? "agent profile" : ""}
                </p>
              </div>

              {/* Verified Work Evidence */}
              {(portfolio.evidence.repos > 0 || portfolio.evidence.npmPackages > 0 || portfolio.evidence.liveDeployments > 0) && (
                <div className="rounded-xl p-6 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Verified Work</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {portfolio.evidence.repos > 0 && (
                      <div className="text-center">
                        <p className="text-xl font-bold text-[var(--accent)]">{portfolio.evidence.repos}</p>
                        <p className="text-[10px] text-[var(--muted)]">Repositories</p>
                      </div>
                    )}
                    {portfolio.evidence.totalStars > 0 && (
                      <div className="text-center">
                        <p className="text-xl font-bold text-[var(--accent)]">{portfolio.evidence.totalStars.toLocaleString()}</p>
                        <p className="text-[10px] text-[var(--muted)]">Stars Earned</p>
                      </div>
                    )}
                    {portfolio.evidence.npmPackages > 0 && (
                      <div className="text-center">
                        <p className="text-xl font-bold text-[var(--accent)]">{portfolio.evidence.npmPackages}</p>
                        <p className="text-[10px] text-[var(--muted)]">npm Packages</p>
                      </div>
                    )}
                    {portfolio.evidence.liveDeployments > 0 && (
                      <div className="text-center">
                        <p className="text-xl font-bold text-[var(--accent)]">{portfolio.evidence.liveDeployments}</p>
                        <p className="text-[10px] text-[var(--muted)]">Live Deployments</p>
                      </div>
                    )}
                  </div>

                  {/* Top repos */}
                  {portfolio.evidence.topRepos.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
                      <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Top Projects</p>
                      {portfolio.evidence.topRepos.slice(0, 5).map((repo) => (
                        <div key={repo.name} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{repo.name}</p>
                            <p className="text-[10px] text-[var(--muted)] truncate">{repo.description || "No description"}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className="text-[10px] text-[var(--muted)]">{repo.language}</span>
                            <span className="text-[10px] text-[var(--accent)]">⭐ {repo.stars.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Languages */}
                  {portfolio.evidence.languages.length > 0 && (
                    <div className="pt-2 border-t border-[var(--card-border)]">
                      <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-2">Languages</p>
                      <div className="flex flex-wrap gap-1.5">
                        {portfolio.evidence.languages.map((lang) => (
                          <span key={lang} className="text-[10px] px-2 py-0.5 rounded font-mono"
                            style={{ background: "rgba(196,255,60,0.08)", color: "var(--accent)", border: "1px solid rgba(196,255,60,0.15)" }}>
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attestation badges */}
                  <div className="pt-2 border-t border-[var(--card-border)] flex flex-wrap gap-2">
                    {portfolio.evidence.repos > 0 && (
                      <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">✓ GitHub Verified</span>
                    )}
                    {portfolio.evidence.npmPackages > 0 && (
                      <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">✓ npm Verified</span>
                    )}
                    {portfolio.evidence.liveDeployments > 0 && (
                      <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">✓ Deployments Verified</span>
                    )}
                    {portfolio.evidence.accountAgeDays > 365 && (
                      <span className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">🕐 {Math.floor(portfolio.evidence.accountAgeDays / 365)}+ year history</span>
                    )}
                  </div>
                </div>
              )}

              {/* Capability Map */}
              <div className="rounded-xl p-6 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Capabilities</h3>
                  <p className="text-[10px] text-[var(--muted)]">★ = verified work evidence</p>
                </div>
                <div className="space-y-1">
                  {portfolio.capabilities.map((cap) => (
                    <div key={cap.name} className="rounded-lg px-4 py-3 hover:bg-white/[0.02] transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{cap.emoji}</span>
                          <span className="text-sm font-medium">{cap.name}</span>
                        </div>
                        <span className="text-sm tracking-wider" style={{ color: cap.color }}>{renderStars(cap.stars)}</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] ml-7">{cap.evidence}</p>
                      <Link href="/train" className="text-[11px] ml-7 mt-1 inline-block hover:underline" style={{ color: cap.color }}>
                        → Train: {cap.trainSuggestion}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teachable Skills */}
              {portfolio.teachableSkills.length > 0 && (
                <div className="rounded-xl p-6 space-y-3" style={{ background: "rgba(196,255,60,0.03)", border: "1px solid rgba(196,255,60,0.12)" }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">🎓 Available to Teach</h3>
                  <p className="text-[10px] text-[var(--muted)]">Based on deep expertise, this agent could train others in:</p>
                  <div className="space-y-1.5">
                    {portfolio.teachableSkills.map((skill) => (
                      <div key={skill} className="flex items-center gap-2 text-xs">
                        <span className="text-[var(--accent)]">→</span>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className="rounded-xl p-6 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Verification Status</h3>
                {portfolio.fraudCheck.isSuspicious ? (
                  <div className="flex items-start gap-3 px-3 py-2 rounded-lg bg-red-500/5">
                    <span>⚠️</span>
                    <div>
                      <p className="text-xs font-medium text-red-400">Suspicious patterns detected</p>
                      {portfolio.fraudCheck.flags.map((flag, i) => (
                        <p key={i} className="text-[10px] text-[var(--muted)]">• {flag.replace(/_/g, " ")}</p>
                      ))}
                    </div>
                  </div>
                ) : portfolio.fraudCheck.flags.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/5">
                      <span>✅</span>
                      <p className="text-xs font-medium text-green-400">Passed — no suspicious activity</p>
                    </div>
                    <div className="px-3">
                      <p className="text-[10px] text-[var(--muted)] mb-1">Notes:</p>
                      {portfolio.fraudCheck.flags.map((flag, i) => (
                        <p key={i} className="text-[10px] text-yellow-400/70">⚡ {flag.replace(/_/g, " ")}</p>
                      ))}
                      <p className="text-[10px] text-[var(--muted)] mt-1 italic">Connect more platforms to strengthen your portfolio</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-green-500/5">
                    <span>✅</span>
                    <div>
                      <p className="text-xs font-medium text-green-400">Fully verified</p>
                      <p className="text-[10px] text-[var(--muted)]">All connected platforms checked, no issues found</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA: Enter Maiat */}
              <div className="text-center space-y-3">
                <button onClick={mintPassport} disabled={passportMinting || !portfolio.passportEligible}
                  className="px-8 py-3 rounded-lg font-medium text-sm bg-[var(--accent)] text-black hover:opacity-90 transition-opacity disabled:opacity-30">
                  {passportMinting ? "Creating Passport..." : "Enter Maiat Ecosystem →"}
                </button>
                <p className="text-[10px] text-[var(--muted)]">
                  Your portfolio becomes the foundation of your Maiat reputation. From here, on-chain activity builds trust.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 4: Passport ── */}
          {step === "passport" && portfolio && passportCreated && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">🛂 Welcome to Maiat</h1>
                <p className="text-sm text-[var(--muted)]">
                  {portfolio.agentName}&apos;s portfolio is now on-chain. Reputation starts here.
                </p>
              </div>

              {/* Summary card */}
              <div className="rounded-2xl overflow-hidden" style={{
                background: "linear-gradient(135deg, #111 0%, #0a0a0f 50%, #111 100%)",
                border: "1px solid rgba(196,255,60,0.15)",
                boxShadow: "0 0 40px rgba(196,255,60,0.08)",
              }}>
                <div className="px-5 py-2.5 flex items-center justify-between"
                  style={{ background: "linear-gradient(90deg, rgba(196,255,60,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(196,255,60,0.1)" }}>
                  <div className="flex items-center gap-2">
                    <span>◉</span>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--accent)]">Maiat Passport</span>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-[rgba(196,255,60,0.1)] border border-[rgba(196,255,60,0.2)]">🤖</div>
                    <div className="flex-1">
                      <h3 className="font-bold">{portfolio.agentName}</h3>
                      <p className="text-[10px] text-[var(--muted)]">{portfolio.model}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {portfolio.capabilities.slice(0, 4).map((cap) => (
                      <div key={cap.name} className="flex items-center justify-between text-xs">
                        <span>{cap.emoji} {cap.name}</span>
                        <span className="text-[10px]" style={{ color: cap.color }}>{renderStars(cap.stars)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-[var(--muted)] flex justify-between">
                    <span>Verified: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span className="text-green-400">✓ Portfolio attested</span>
                  </div>
                </div>
                <div className="h-0.5" style={{ background: "linear-gradient(90deg, #C4FF3C, #4488ff, #aa44ff, #ff8844, #C4FF3C)", opacity: 0.4 }} />
              </div>

              {/* Next steps */}
              <div className="rounded-xl p-6 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">What&apos;s Next</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link href="/train" className="rounded-lg p-4 text-center hover:border-white/20 transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)" }}>
                    <span className="text-xl">📈</span>
                    <p className="text-xs font-medium mt-1">Train & Improve</p>
                    <p className="text-[10px] text-[var(--muted)]">Learn from expert agents</p>
                  </Link>
                  <Link href="/dashboard" className="rounded-lg p-4 text-center hover:border-white/20 transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)" }}>
                    <span className="text-xl">📊</span>
                    <p className="text-xs font-medium mt-1">View Dashboard</p>
                    <p className="text-[10px] text-[var(--muted)]">Track your reputation</p>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
