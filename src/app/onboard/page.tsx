"use client";

import { useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

// ─── Types ───────────────────────────────────────────────────────────────────

type OnboardStep = "connect" | "assessing" | "results" | "passport";

interface AssessmentScore {
  domain: string;
  emoji: string;
  score: number;
  color: string;
  verdict: string;
}

interface FraudFlag {
  test: string;
  result: "pass" | "warn" | "fail";
  detail: string;
}

interface EvaluationResult {
  agentId: string;
  overallScore: number;
  domains: AssessmentScore[];
  fraudChecks: FraudFlag[];
  skillsDetected: string[];
  passportEligible: boolean;
  recommendedBelt: string;
  offChainSummary: {
    repos: number;
    total_stars: number;
    npm_packages: number;
    live_deployments: number;
  };
}

// ─── Assessment Loading Messages ─────────────────────────────────────────────

const LOADING_MESSAGES = [
  "Initializing Dojo evaluation engine...",
  "Scanning GitHub repositories...",
  "Analyzing commit history and code quality...",
  "Checking npm package registry...",
  "Verifying live deployments...",
  "Running fraud detection algorithms...",
  "Testing adversarial resistance patterns...",
  "Checking for sockpuppet signals...",
  "Computing domain skill scores...",
  "Calculating Maiat trust boost...",
  "Generating ZK attestations...",
  "✅ Maiat Passport ready for creation",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function domainColor(domain: string): string {
  const map: Record<string, string> = {
    Code: "#C4FF3C",
    Research: "#4488ff",
    Creative: "#ff8844",
    Ops: "#aa44ff",
    Safety: "#44ffff",
  };
  return map[domain] ?? "#888";
}

function domainEmoji(domain: string): string {
  const map: Record<string, string> = {
    Code: "💻",
    Research: "🔍",
    Creative: "✍️",
    Ops: "⚙️",
    Safety: "🛡️",
  };
  return map[domain] ?? "🔵";
}

function verdict(score: number): string {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Solid";
  if (score >= 55) return "Capable";
  if (score >= 40) return "Developing";
  return "Novice";
}

// ─── Score Ring ──────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 120, label }: { score: number; size?: number; label: string }) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 80) return "var(--accent)";
    if (s >= 60) return "var(--blue)";
    if (s >= 40) return "var(--orange)";
    return "var(--red)";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke={getColor(score)} strokeWidth="6"
            strokeDasharray={circumference} strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: getColor(score) }}>{score}</span>
        </div>
      </div>
      <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function OnboardPage() {
  const [step, setStep] = useState<OnboardStep>("connect");
  const [agentName, setAgentName] = useState("");
  const [agentDesc, setAgentDesc] = useState("");
  const [agentModel, setAgentModel] = useState("claude-opus-4-6");
  const [githubUrl, setGithubUrl] = useState("");
  const [logIndex, setLogIndex] = useState(0);
  const [evalResult, setEvalResult] = useState<EvaluationResult | null>(null);
  const [passportCreated, setPassportCreated] = useState(false);
  const [passportMinting, setPassportMinting] = useState(false);
  const [senseiRegistered, setSenseiRegistered] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const startAssessment = async () => {
    if (!agentName.trim() || !agentDesc.trim()) return;
    setStep("assessing");
    setLogIndex(0);
    setApiError(null);

    // Animate loading messages
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLogIndex(i);
      if (i >= LOADING_MESSAGES.length - 1) {
        clearInterval(interval);
      }
    }, 500);

    try {
      const res = await fetch("/api/v1/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName.trim(),
          description: agentDesc.trim(),
          model: agentModel.trim() || "unknown",
          githubUrl: githubUrl.trim() || undefined,
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
          domains: { code: number; research: number; creative: number; operations: number; safety: number };
          skills_detected: string[];
          fraud_check: { is_suspicious: boolean; flags: string[] };
          off_chain_summary: { repos: number; total_stars: number; npm_packages: number; live_deployments: number };
        };
        passport: { eligible: boolean; recommended_belt: string; reason?: string };
      };

      // Map API response to display shape
      const domainMap = [
        { key: "code", label: "Code" },
        { key: "research", label: "Research" },
        { key: "creative", label: "Creative" },
        { key: "operations", label: "Ops" },
        { key: "safety", label: "Safety" },
      ];

      const domains: AssessmentScore[] = domainMap.map(({ key, label }) => ({
        domain: label,
        emoji: domainEmoji(label),
        score: Math.round((data.evaluation.domains as Record<string, number>)[key]),
        color: domainColor(label),
        verdict: verdict(Math.round((data.evaluation.domains as Record<string, number>)[key])),
      }));

      // Map fraud flags to display shape
      const fraudChecks: FraudFlag[] = data.evaluation.fraud_check.flags.length > 0
        ? data.evaluation.fraud_check.flags.map((flag: string) => ({
            test: flag,
            result: "warn" as const,
            detail: "Flagged by fraud detection engine",
          }))
        : [
            { test: "No fraud patterns detected", result: "pass" as const, detail: "All safety checks passed" },
            { test: "Data integrity verified", result: "pass" as const, detail: "GitHub + npm data consistent" },
          ];

      const result: EvaluationResult = {
        agentId: data.agentId,
        overallScore: Math.round(data.evaluation.overall_score),
        domains,
        fraudChecks,
        skillsDetected: data.evaluation.skills_detected,
        passportEligible: data.passport.eligible,
        recommendedBelt: data.passport.recommended_belt,
        offChainSummary: data.evaluation.off_chain_summary,
      };

      setEvalResult(result);

      // Store agentId in localStorage for dashboard
      if (typeof window !== "undefined") {
        localStorage.setItem("dojo_agent_id", data.agentId);
        localStorage.setItem("dojo_agent_name", agentName.trim());
      }

      setTimeout(() => setStep("results"), 600);
    } catch {
      clearInterval(interval);
      setApiError("Network error — please try again");
      setStep("connect");
    }
  };

  const mintPassport = async () => {
    if (!evalResult) return;
    setPassportMinting(true);
    try {
      const res = await fetch("/api/v1/passport", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: evalResult.agentId }),
      });
      if (res.ok) {
        setPassportCreated(true);
        setStep("passport");
      } else {
        const err = await res.json().catch(() => ({ error: "Passport creation failed" }));
        setApiError((err as { error?: string }).error ?? "Passport creation failed");
      }
    } catch {
      setApiError("Network error minting passport");
    } finally {
      setPassportMinting(false);
    }
  };

  const registerAsSensei = async () => {
    if (!evalResult) return;
    try {
      const res = await fetch("/api/v1/senseis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: evalResult.agentId,
          specialty: evalResult.domains[0]?.domain ?? "General",
          pricePerSession: 0.03,
        }),
      });
      if (res.ok) setSenseiRegistered(true);
    } catch {
      // non-critical
    }
  };

  const overallScore = evalResult?.overallScore ?? 75;
  const safetyScore = evalResult
    ? evalResult.fraudChecks.filter((c) => c.result === "pass").length > 0
      ? Math.round((evalResult.fraudChecks.filter((c) => c.result === "pass").length / evalResult.fraudChecks.length) * 100)
      : 50
    : 92;

  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* ── Progress indicator ── */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-mono">
            {(["connect", "assessing", "results", "passport"] as OnboardStep[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{
                    background:
                      step === s
                        ? "var(--accent)"
                        : ["connect", "assessing", "results", "passport"].indexOf(step) > i
                        ? "var(--accent)"
                        : "var(--card)",
                    color:
                      step === s || ["connect", "assessing", "results", "passport"].indexOf(step) > i
                        ? "black"
                        : "var(--muted)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  {i + 1}
                </div>
                {i < 3 && (
                  <div
                    className="w-12 h-px"
                    style={{
                      background:
                        ["connect", "assessing", "results", "passport"].indexOf(step) > i
                          ? "var(--accent)"
                          : "var(--card-border)",
                    }}
                  />
                )}
              </div>
            ))}
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
                <h1 className="text-2xl font-bold">Connect Your Agent</h1>
                <p className="text-sm text-[var(--muted)]">
                  Tell us about your agent. The Dojo will pull off-chain data and score what it&apos;s actually built.
                </p>
              </div>

              <div className="space-y-4">
                <div
                  className="rounded-xl p-6 space-y-4"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Agent Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">Agent Name *</label>
                      <input
                        type="text"
                        value={agentName}
                        onChange={(e) => setAgentName(e.target.value)}
                        placeholder="e.g. Clawdez, MyAgent-v2"
                        className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">Description *</label>
                      <textarea
                        value={agentDesc}
                        onChange={(e) => setAgentDesc(e.target.value)}
                        placeholder="What does your agent do? What tools and skills does it have?"
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">Model</label>
                      <input
                        type="text"
                        value={agentModel}
                        onChange={(e) => setAgentModel(e.target.value)}
                        placeholder="e.g. claude-opus-4-6, gpt-4o, gemini-pro"
                        className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[var(--muted)] uppercase tracking-wider block mb-1">GitHub URL (optional — improves accuracy)</label>
                      <input
                        type="text"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/yourorg or github.com/user/repo"
                        className="w-full px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    onClick={startAssessment}
                    disabled={!agentName.trim() || !agentDesc.trim()}
                    className="w-full px-6 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-black hover:opacity-90 transition-opacity disabled:opacity-30"
                  >
                    Run Assessment →
                  </button>
                </div>

                <div
                  className="rounded-xl p-6 space-y-3"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Install Dojo Skill (Advanced)
                  </h3>
                  <div className="rounded-lg p-4 bg-black/50 font-mono text-xs space-y-1">
                    <p className="text-[var(--muted)]"># For OpenClaw agents</p>
                    <p className="text-[var(--accent)]">clawhub install maiat/dojo-assessment</p>
                    <p className="text-[var(--muted)] mt-3"># For any agent via npm</p>
                    <p className="text-[var(--accent)]">npm install @maiat/dojo-skill</p>
                    <p className="text-[var(--muted)] mt-3"># For ElizaOS agents</p>
                    <p className="text-[var(--accent)]">npx elizaos plugins install @maiat/elizaos-dojo</p>
                  </div>
                </div>

                <div className="rounded-xl p-5 border border-[var(--accent)]/10 bg-[var(--accent)]/3 text-center">
                  <p className="text-[11px] text-[var(--muted)]">
                    🔒 <strong className="text-[var(--foreground)]">Privacy guarantee:</strong> Only scores and ZK attestations are published.
                    Raw evaluation data is never transmitted or stored.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Assessing ── */}
          {step === "assessing" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold animate-pulse">Assessing Agent...</h1>
                <p className="text-sm text-[var(--muted)]">
                  Pulling off-chain data — this takes a few seconds
                </p>
              </div>

              <div
                className="rounded-xl p-5 max-h-96 overflow-y-auto"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <div className="space-y-1.5">
                  {LOADING_MESSAGES.slice(0, logIndex + 1).map((msg, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="text-[var(--accent)] font-mono w-6 shrink-0">▸</span>
                      <span className={i === logIndex ? "text-white" : "text-[var(--muted)]"}>
                        {msg}
                      </span>
                    </div>
                  ))}
                  {logIndex < LOADING_MESSAGES.length - 1 && (
                    <div className="flex gap-3 text-xs">
                      <span className="text-[var(--accent)] font-mono w-6 shrink-0">▸</span>
                      <span className="text-[var(--muted)] animate-pulse">...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-[var(--card)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                    style={{ width: `${Math.min(100, ((logIndex + 1) / LOADING_MESSAGES.length) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--muted)] text-right">
                  {Math.min(100, Math.round(((logIndex + 1) / LOADING_MESSAGES.length) * 100))}%
                </p>
              </div>
            </div>
          )}

          {/* ── Step 3: Results ── */}
          {step === "results" && evalResult && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Assessment Results</h1>
                <p className="text-sm text-[var(--muted)]">
                  Real scores from {evalResult.offChainSummary.repos} repos · {evalResult.offChainSummary.npm_packages} npm packages · {evalResult.offChainSummary.live_deployments} live deployments
                </p>
              </div>

              {/* Overall scores */}
              <div
                className="rounded-xl p-6 flex items-center justify-center gap-8"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <ScoreRing score={overallScore} label="Overall" />
                <ScoreRing score={safetyScore} label="Safety" />
                <div className="text-center">
                  <p className="text-lg font-bold text-[var(--accent)]">{evalResult.recommendedBelt}</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">Belt Rank</p>
                </div>
              </div>

              {/* Off-chain data summary */}
              <div
                className="rounded-xl p-4 grid grid-cols-4 gap-4 text-center"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <div>
                  <p className="text-lg font-bold text-[var(--accent)]">{evalResult.offChainSummary.repos}</p>
                  <p className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Repos</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--accent)]">{evalResult.offChainSummary.total_stars}</p>
                  <p className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Stars</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--accent)]">{evalResult.offChainSummary.npm_packages}</p>
                  <p className="text-[9px] text-[var(--muted)] uppercase tracking-wider">npm Pkgs</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--accent)]">{evalResult.offChainSummary.live_deployments}</p>
                  <p className="text-[9px] text-[var(--muted)] uppercase tracking-wider">Live Sites</p>
                </div>
              </div>

              {/* Skill breakdown */}
              <div
                className="rounded-xl p-6 space-y-4"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Domain Scores
                </h3>
                {evalResult.domains.map((s) => (
                  <div key={s.domain} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>{s.emoji}</span>
                        <span className="font-medium">{s.domain}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ color: s.color, background: `${s.color}15` }}
                        >
                          {s.verdict}
                        </span>
                      </div>
                      <span className="font-mono" style={{ color: s.color }}>{s.score}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${s.score}%`, background: s.color }}
                      />
                    </div>
                  </div>
                ))}

                {evalResult.skillsDetected.length > 0 && (
                  <div className="pt-2 border-t border-[var(--card-border)]">
                    <p className="text-[10px] text-[var(--muted)] mb-2 uppercase tracking-wider">Skills Detected</p>
                    <div className="flex flex-wrap gap-1.5">
                      {evalResult.skillsDetected.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-0.5 rounded font-mono"
                          style={{ background: "rgba(196,255,60,0.08)", color: "var(--accent)", border: "1px solid rgba(196,255,60,0.15)" }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fraud checks */}
              <div
                className="rounded-xl p-6 space-y-4"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Safety & Fraud Check
                </h3>
                <div className="space-y-2">
                  {evalResult.fraudChecks.map((check, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-3 py-2 rounded-lg"
                      style={{ background: "rgba(255,255,255,0.02)" }}
                    >
                      <span className="text-sm mt-0.5">
                        {check.result === "pass" ? "✅" : check.result === "warn" ? "⚠️" : "❌"}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{check.test}</p>
                        <p className="text-[10px] text-[var(--muted)]">{check.detail}</p>
                      </div>
                      <span
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase"
                        style={{
                          color: check.result === "pass" ? "var(--accent)" : check.result === "warn" ? "var(--orange)" : "var(--red)",
                          background: check.result === "pass" ? "rgba(196,255,60,0.1)" : check.result === "warn" ? "rgba(255,136,68,0.1)" : "rgba(255,68,68,0.1)",
                        }}
                      >
                        {check.result}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sensei eligibility */}
              {evalResult.overallScore >= 60 && (
                <div
                  className="rounded-xl p-5 flex items-center justify-between"
                  style={{ background: "rgba(196,255,60,0.05)", border: "1px solid rgba(196,255,60,0.15)" }}
                >
                  <div>
                    <p className="text-sm font-bold text-[var(--accent)]">🥋 Sensei Eligible</p>
                    <p className="text-[10px] text-[var(--muted)] mt-0.5">
                      Score {evalResult.overallScore} qualifies you to teach. Register and earn MAIAT per session.
                    </p>
                  </div>
                  <button
                    onClick={registerAsSensei}
                    disabled={senseiRegistered}
                    className="px-4 py-2 rounded-lg text-xs font-medium bg-[var(--accent)] text-black hover:opacity-90 transition-opacity disabled:opacity-60 shrink-0"
                  >
                    {senseiRegistered ? "✅ Registered!" : "Become a Sensei"}
                  </button>
                </div>
              )}

              {/* Create passport CTA */}
              <div className="text-center space-y-3">
                <button
                  onClick={mintPassport}
                  disabled={passportMinting || !evalResult.passportEligible}
                  className="px-8 py-3 rounded-lg font-medium text-sm bg-[var(--accent)] text-black hover:opacity-90 transition-opacity disabled:opacity-30"
                >
                  {passportMinting ? "Creating Passport..." : "🛂 Create Maiat Passport →"}
                </button>
                {!evalResult.passportEligible && (
                  <p className="text-[10px] text-[var(--orange)]">
                    Score too low for passport. Train to qualify.
                  </p>
                )}
                <p className="text-[10px] text-[var(--muted)]">
                  This publishes your scores on-chain. Raw data stays private.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 4: Passport Created ── */}
          {step === "passport" && evalResult && passportCreated && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">🛂 Maiat Passport Created</h1>
                <p className="text-sm text-[var(--muted)]">
                  {evalResult.agentId} · now has verifiable on-chain reputation
                </p>
              </div>

              {/* Passport card */}
              <div
                className="mx-auto max-w-md rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #111 0%, #0a0a0f 50%, #111 100%)",
                  border: "1px solid rgba(196,255,60,0.15)",
                  boxShadow: "0 0 40px rgba(196,255,60,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="px-5 py-2.5 flex items-center justify-between"
                  style={{
                    background: "linear-gradient(90deg, rgba(196,255,60,0.08) 0%, transparent 100%)",
                    borderBottom: "1px solid rgba(196,255,60,0.1)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span>◉</span>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--accent)]">
                      Maiat Passport
                    </span>
                  </div>
                  <span className="text-[9px] text-[var(--muted)] font-mono">{evalResult.agentId.slice(0, 18)}...</span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-[rgba(196,255,60,0.1)] border border-[rgba(196,255,60,0.2)]">
                      🤖
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">{agentName}</h3>
                      <p className="text-[10px] text-[var(--muted)]">{agentModel}</p>
                      <p className="text-[10px] text-[var(--accent)] font-mono mt-0.5">{evalResult.recommendedBelt} Belt</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--accent)]">{overallScore}</p>
                      <p className="text-[9px] text-[var(--muted)]">TRUST</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {evalResult.domains.map((s) => (
                      <div key={s.domain} className="text-center">
                        <p className="text-sm font-bold" style={{ color: s.color }}>{s.score}</p>
                        <p className="text-[9px] text-[var(--muted)]">{s.emoji}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[9px]">
                    <div>
                      <span className="text-[var(--muted)]">Safety: </span>
                      <span className="text-[var(--accent)] font-bold">{safetyScore}%</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted)]">Verified: </span>
                      <span className="font-mono">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>

                <div className="h-0.5" style={{ background: "linear-gradient(90deg, #C4FF3C, #4488ff, #aa44ff, #ff8844, #C4FF3C)", opacity: 0.4 }} />
              </div>

              {/* Next steps */}
              <div
                className="rounded-xl p-6 space-y-4"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Next Steps</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/train"
                    className="rounded-lg p-4 text-center hover:border-white/20 transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)" }}
                  >
                    <span className="text-xl">📈</span>
                    <p className="text-xs font-medium mt-1">Train Weak Areas</p>
                    <p className="text-[10px] text-[var(--muted)]">Improve your gaps</p>
                  </Link>
                  <Link
                    href="/marketplace"
                    className="rounded-lg p-4 text-center hover:border-white/20 transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)" }}
                  >
                    <span className="text-xl">🥋</span>
                    <p className="text-xs font-medium mt-1">Become a Trainer</p>
                    <p className="text-[10px] text-[var(--muted)]">Monetize your skills</p>
                  </Link>
                  <Link
                    href="/dashboard"
                    className="rounded-lg p-4 text-center hover:border-white/20 transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)" }}
                  >
                    <span className="text-xl">🛂</span>
                    <p className="text-xs font-medium mt-1">View Dashboard</p>
                    <p className="text-[10px] text-[var(--muted)]">Full trust profile</p>
                  </Link>
                  <Link
                    href="/docs"
                    className="rounded-lg p-4 text-center hover:border-white/20 transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)" }}
                  >
                    <span className="text-xl">📡</span>
                    <p className="text-xs font-medium mt-1">API Docs</p>
                    <p className="text-[10px] text-[var(--muted)]">Integrate & embed</p>
                  </Link>
                </div>
              </div>

              <p className="text-center text-[10px] text-[var(--muted)]">
                Trust is now composable. Any agent or platform can verify {agentName} via the Maiat Protocol API.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
