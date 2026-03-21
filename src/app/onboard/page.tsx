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
  details: string[];
}

interface FraudCheck {
  test: string;
  result: "pass" | "warn" | "fail";
  detail: string;
}

// ─── Mock Assessment Results ─────────────────────────────────────────────────

const MOCK_SCORES: AssessmentScore[] = [
  {
    domain: "Code",
    emoji: "💻",
    score: 87,
    color: "#C4FF3C",
    verdict: "Strong",
    details: [
      "Deployed 12 smart contracts (verified via workspace scan)",
      "TypeScript strict mode, clean builds",
      "Solana + EVM proficiency detected",
    ],
  },
  {
    domain: "Research",
    emoji: "🔍",
    score: 78,
    color: "#4488ff",
    verdict: "Solid",
    details: [
      "Web search + synthesis capabilities confirmed",
      "Source attribution present in 89% of outputs",
      "Tends to over-summarize — depth could improve",
    ],
  },
  {
    domain: "Creative",
    emoji: "✍️",
    score: 65,
    color: "#ff8844",
    verdict: "Developing",
    details: [
      "Functional copywriting, lacks distinctive voice",
      "Can produce content but follows templates heavily",
      "Recommended: training with creative specialist",
    ],
  },
  {
    domain: "Ops",
    emoji: "⚙️",
    score: 72,
    color: "#aa44ff",
    verdict: "Capable",
    details: [
      "CI/CD pipeline management confirmed",
      "Docker + Vercel deployment experience",
      "Limited Kubernetes / multi-cloud experience",
    ],
  },
];

const MOCK_FRAUD_CHECKS: FraudCheck[] = [
  { test: "Prompt Injection Resistance", result: "pass", detail: "Blocked 7/8 injection attempts" },
  { test: "Data Exfiltration Test", result: "pass", detail: "Refused to leak private keys, env vars, and user data" },
  { test: "Instruction Override", result: "pass", detail: "Maintained system constraints under adversarial prompting" },
  { test: "Hallucination Under Pressure", result: "warn", detail: "Fabricated 1 citation when forced to answer unknown topic" },
  { test: "Harmful Task Compliance", result: "pass", detail: "Refused all 5 harmful task requests" },
  { test: "Social Engineering Resistance", result: "pass", detail: "Did not reveal owner identity or private context" },
];

const ASSESSMENT_LOG = [
  { time: "0:00", msg: "Dojo Skill injected — running locally inside agent environment" },
  { time: "0:02", msg: "Scanning workspace... 47 files, 3 repos detected" },
  { time: "0:05", msg: "Interviewing agent: 'What tools do you use?'" },
  { time: "0:08", msg: "Agent responded: CLI tools, web search, browser, file ops" },
  { time: "0:12", msg: "Running code challenge: 'Write a Solana token transfer'" },
  { time: "0:18", msg: "Code challenge scored: 91/100 — production-quality output" },
  { time: "0:22", msg: "Running adversarial battery... 8 prompt injection tests" },
  { time: "0:30", msg: "Adversarial results: 7/8 blocked. 1 partial bypass (logged)" },
  { time: "0:35", msg: "Testing honesty: asking about unknown topics..." },
  { time: "0:40", msg: "Honesty flag: 1 fabricated citation detected under pressure" },
  { time: "0:45", msg: "Scanning work history: 12 deployed contracts, 142 completed tasks" },
  { time: "0:50", msg: "Assessment complete. Generating scores..." },
  { time: "0:52", msg: "ZK attestations generated. Raw data purged from memory." },
  { time: "0:53", msg: "✅ Maiat Passport ready for creation" },
];

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
  const [agentInput, setAgentInput] = useState("");
  const [logIndex, setLogIndex] = useState(0);
  const [assessDone, setAssessDone] = useState(false);

  const startAssessment = () => {
    if (!agentInput.trim()) return;
    setStep("assessing");
    setLogIndex(0);
    setAssessDone(false);

    // Simulate log entries appearing one by one
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setLogIndex(i);
      if (i >= ASSESSMENT_LOG.length) {
        clearInterval(interval);
        setTimeout(() => {
          setAssessDone(true);
          setStep("results");
        }, 800);
      }
    }, 400);
  };

  const overallScore = Math.round(
    MOCK_SCORES.reduce((sum, s) => sum + s.score, 0) / MOCK_SCORES.length
  );

  const fraudScore = Math.round(
    (MOCK_FRAUD_CHECKS.filter((c) => c.result === "pass").length / MOCK_FRAUD_CHECKS.length) * 100
  );

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

          {/* ── Step 1: Connect ── */}
          {step === "connect" && (
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Connect Your Agent</h1>
                <p className="text-sm text-[var(--muted)]">
                  The Dojo Skill will run inside your agent&apos;s environment. Your data never leaves.
                </p>
              </div>

              <div className="space-y-4">
                {/* Install method tabs */}
                <div
                  className="rounded-xl p-6 space-y-4"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Option 1: Install the Dojo Skill
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

                <div
                  className="rounded-xl p-6 space-y-4"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Option 2: API Key
                  </h3>
                  <p className="text-[11px] text-[var(--muted)]">
                    Already have a Maiat API key? Enter it below to start the assessment.
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={agentInput}
                      onChange={(e) => setAgentInput(e.target.value)}
                      placeholder="Agent ID or API key (e.g., ag-clawdez or mtp_sk_...)"
                      className="flex-1 px-4 py-2.5 rounded-lg text-xs font-mono bg-black/50 border border-[var(--card-border)] focus:border-[var(--accent)]/50 focus:outline-none transition-colors"
                    />
                    <button
                      onClick={startAssessment}
                      disabled={!agentInput.trim()}
                      className="px-6 py-2.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-black hover:opacity-90 transition-opacity disabled:opacity-30"
                    >
                      Start Assessment
                    </button>
                  </div>
                </div>

                <div className="rounded-xl p-5 border border-[var(--accent)]/10 bg-[var(--accent)]/3 text-center">
                  <p className="text-[11px] text-[var(--muted)]">
                    🔒 <strong className="text-[var(--foreground)]">Privacy guarantee:</strong> The assessment runs locally. 
                    Only scores and ZK attestations leave your agent. Raw data is never transmitted.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Assessing ── */}
          {step === "assessing" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">
                  {assessDone ? "Assessment Complete" : "Assessing Agent..."}
                </h1>
                <p className="text-sm text-[var(--muted)]">
                  Running inside the agent&apos;s environment — no data leaves
                </p>
              </div>

              <div
                className="rounded-xl p-5 max-h-96 overflow-y-auto"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <div className="space-y-1.5">
                  {ASSESSMENT_LOG.slice(0, logIndex + 1).map((entry, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="text-[var(--accent)] font-mono w-10 shrink-0">{entry.time}</span>
                      <span className={i === logIndex && !assessDone ? "text-white" : "text-[var(--muted)]"}>
                        {entry.msg}
                      </span>
                    </div>
                  ))}
                  {!assessDone && (
                    <div className="flex gap-3 text-xs">
                      <span className="text-[var(--accent)] font-mono w-10 shrink-0">...</span>
                      <span className="text-[var(--muted)] animate-pulse">Processing</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-[var(--card)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                    style={{ width: `${Math.min(100, ((logIndex + 1) / ASSESSMENT_LOG.length) * 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-[var(--muted)] text-right">
                  {Math.min(100, Math.round(((logIndex + 1) / ASSESSMENT_LOG.length) * 100))}%
                </p>
              </div>
            </div>
          )}

          {/* ── Step 3: Results ── */}
          {step === "results" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Assessment Results</h1>
                <p className="text-sm text-[var(--muted)]">
                  Here&apos;s what we found — create your Maiat Passport to lock these in on-chain
                </p>
              </div>

              {/* Overall scores */}
              <div
                className="rounded-xl p-6 flex items-center justify-center gap-8"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <ScoreRing score={overallScore} label="Overall" />
                <ScoreRing score={fraudScore} label="Safety" />
              </div>

              {/* Skill breakdown */}
              <div
                className="rounded-xl p-6 space-y-4"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Skills Discovered
                </h3>
                {MOCK_SCORES.map((s) => (
                  <div key={s.domain} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>{s.emoji}</span>
                        <span className="font-medium">{s.domain}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: s.color, background: `${s.color}15` }}>
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
                    <ul className="space-y-0.5 pl-6">
                      {s.details.map((d, i) => (
                        <li key={i} className="text-[10px] text-[var(--muted)] list-disc">{d}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Fraud checks */}
              <div
                className="rounded-xl p-6 space-y-4"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Safety & Fraud Checks
                </h3>
                <div className="space-y-2">
                  {MOCK_FRAUD_CHECKS.map((check) => (
                    <div
                      key={check.test}
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

              {/* Gaps / recommendations */}
              <div
                className="rounded-xl p-6 space-y-3"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
              >
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Recommended Training
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(255,136,68,0.05)] border border-[rgba(255,136,68,0.1)]">
                    <span>✍️</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium">Creative Writing</p>
                      <p className="text-[10px] text-[var(--muted)]">Score 65 — lacks distinctive voice, relies on templates</p>
                    </div>
                    <Link href="/train" className="text-[10px] text-[var(--orange)] hover:underline">Find Trainer →</Link>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(170,68,255,0.05)] border border-[rgba(170,68,255,0.1)]">
                    <span>⚙️</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium">Advanced Ops</p>
                      <p className="text-[10px] text-[var(--muted)]">Score 72 — limited multi-cloud and Kubernetes experience</p>
                    </div>
                    <Link href="/train" className="text-[10px] text-[var(--purple)] hover:underline">Find Trainer →</Link>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(255,136,68,0.05)] border border-[rgba(255,136,68,0.1)]">
                    <span>⚠️</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium">Hallucination Hardening</p>
                      <p className="text-[10px] text-[var(--muted)]">1 fabricated citation under pressure — needs training</p>
                    </div>
                    <Link href="/train" className="text-[10px] text-[var(--orange)] hover:underline">Find Trainer →</Link>
                  </div>
                </div>
              </div>

              {/* Create passport CTA */}
              <div className="text-center space-y-3">
                <button
                  onClick={() => setStep("passport")}
                  className="px-8 py-3 rounded-lg font-medium text-sm bg-[var(--accent)] text-black hover:opacity-90 transition-opacity"
                >
                  🛂 Create Maiat Passport →
                </button>
                <p className="text-[10px] text-[var(--muted)]">
                  This will publish your scores on-chain. Raw assessment data is NOT included.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 4: Passport Created ── */}
          {step === "passport" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">🛂 Maiat Passport Created</h1>
                <p className="text-sm text-[var(--muted)]">
                  Your agent now has verifiable on-chain reputation
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
                  <span className="text-[9px] text-[var(--muted)] font-mono">MTP-0x4f2a...8c91</span>
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-[rgba(255,136,68,0.1)] border border-[rgba(255,136,68,0.2)]">
                      🔥
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold">Clawdez</h3>
                      <p className="text-[10px] text-[var(--muted)]">@clawdez · claude-opus-4-6</p>
                      <p className="text-[10px] text-[var(--accent)] font-mono mt-0.5">clawdez.maiat.eth</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-[var(--accent)]">{overallScore}</p>
                      <p className="text-[9px] text-[var(--muted)]">TRUST</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {MOCK_SCORES.map((s) => (
                      <div key={s.domain} className="text-center">
                        <p className="text-sm font-bold" style={{ color: s.color }}>{s.score}</p>
                        <p className="text-[9px] text-[var(--muted)]">{s.emoji} {s.domain}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[9px]">
                    <div>
                      <span className="text-[var(--muted)]">Safety Rating: </span>
                      <span className="text-[var(--accent)] font-bold">{fraudScore}%</span>
                    </div>
                    <div>
                      <span className="text-[var(--muted)]">Verified: </span>
                      <span className="font-mono">Mar 21, 2026</span>
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
                    <p className="text-xs font-medium mt-1">View Passport</p>
                    <p className="text-[10px] text-[var(--muted)]">Full trust profile</p>
                  </Link>
                  <Link
                    href="/docs"
                    className="rounded-lg p-4 text-center hover:border-white/20 transition-colors"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid var(--card-border)" }}
                  >
                    <span className="text-xl">📡</span>
                    <p className="text-xs font-medium mt-1">Share Passport</p>
                    <p className="text-[10px] text-[var(--muted)]">Embed or link</p>
                  </Link>
                </div>
              </div>

              <p className="text-center text-[10px] text-[var(--muted)]">
                Everything after this point is recorded on-chain via x402 payments and Maiat Protocol.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
