"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DemoStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  action: string;
}

interface SenseiCard {
  senseiId: string;
  agentId: string;
  specialty: string;
  pricePerSession: number;
  skills: string[];
  trainingCount: number;
  successRate: number;
  reviewCount: number;
  averageRating: number | null;
  maiatScore: number | null;
  belt: string;
}

interface DomainScore {
  domain: string;
  score: number;
  verdict: string;
}

interface EvalResult {
  agentId: string;
  overallScore: number;
  domains: DomainScore[];
  passportEligible: boolean;
  recommendedBelt: string;
  offChainSummary: {
    repos: number;
    total_stars: number;
    npm_packages: number;
    live_deployments: number;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS: DemoStep[] = [
  {
    id: "evaluate",
    title: "Step 1: Evaluate",
    subtitle: "Agent submits for trust assessment",
    icon: "🔬",
    color: "#C4FF3C",
    action: "Run Evaluation",
  },
  {
    id: "passport",
    title: "Step 2: Passport",
    subtitle: "Skill Fingerprint + Maiat score issued",
    icon: "🛂",
    color: "#4488ff",
    action: "View Passport",
  },
  {
    id: "marketplace",
    title: "Step 3: Train",
    subtitle: "Browse Shells, equip with x402",
    icon: "🎓",
    color: "#aa44ff",
    action: "Browse Shells",
  },
  {
    id: "payment",
    title: "Step 4: x402 Payment",
    subtitle: "Agent pays without human approval",
    icon: "💳",
    color: "#ff8844",
    action: "Simulate Payment",
  },
  {
    id: "complete",
    title: "Done",
    subtitle: "Trust score updated. Passport leveled up.",
    icon: "✅",
    color: "#44ffff",
    action: "View Result",
  },
];

const BELT_COLORS: Record<string, string> = {
  white: "#ffffff",
  yellow: "#FFD700",
  green: "#44CC44",
  blue: "#4488ff",
  purple: "#aa44ff",
  brown: "#8B4513",
  black: "#222222",
};

function beltLabel(belt: string) {
  return belt.charAt(0).toUpperCase() + belt.slice(1) + " Belt";
}

// ─── Terminal Typing Component ─────────────────────────────────────────────────

function Terminal({ lines, active }: { lines: string[]; active: boolean }) {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [charIdx, setCharIdx] = useState(0);
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    if (!active) {
      setDisplayed([]);
      setLineIdx(0);
      setCharIdx(0);
      return;
    }

    if (lineIdx >= lines.length) return;

    const currentLine = lines[lineIdx];

    if (charIdx < currentLine.length) {
      const t = setTimeout(() => {
        setCharIdx((c) => c + 1);
        setDisplayed((d) => {
          const next = [...d];
          next[lineIdx] = currentLine.slice(0, charIdx + 1);
          return next;
        });
      }, 18);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setLineIdx((l) => l + 1);
        setCharIdx(0);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [active, lineIdx, charIdx, lines]);

  return (
    <div style={{
      background: "#0a0a0a",
      border: "1px solid #333",
      borderRadius: 8,
      padding: "16px 20px",
      fontFamily: "monospace",
      fontSize: 13,
      minHeight: 140,
      lineHeight: "1.8",
    }}>
      <div style={{ color: "#555", marginBottom: 8 }}>$ dojo-cli demo</div>
      {displayed.map((line, i) => (
        <div key={i} style={{ color: line.startsWith("✅") ? "#C4FF3C" : line.startsWith("⚠️") ? "#FFD700" : line.startsWith("🛂") ? "#4488ff" : "#ccc" }}>
          {line}
        </div>
      ))}
      {active && lineIdx < lines.length && <span style={{ color: "#C4FF3C" }}>▋</span>}
    </div>
  );
}

// ─── Score Ring ────────────────────────────────────────────────────────────────

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const progress = (score / 100) * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={88} height={88}>
        <circle cx={44} cy={44} r={r} fill="none" stroke="#222" strokeWidth={10} />
        <circle
          cx={44}
          cy={44}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={`${progress} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 44 44)"
        />
        <text x={44} y={48} textAnchor="middle" fill={color} fontSize={18} fontWeight={700}>{score}</text>
      </svg>
      <span style={{ color: "#888", fontSize: 11 }}>{label}</span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [evalResult, setEvalResult] = useState<EvalResult | null>(null);
  const [senseis, setSenseis] = useState<SenseiCard[]>([]);
  const [selectedSensei, setSelectedSensei] = useState<SenseiCard | null>(null);
  const [paymentDone, setPaymentDone] = useState(false);
  const [terminalActive, setTerminalActive] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const stepRef = useRef<HTMLDivElement>(null);

  const DEMO_AGENT = {
    name: "DemoAgent-7X",
    description: "A general-purpose AI agent specializing in code generation, research synthesis, and content creation.",
    model: "claude-3-5-sonnet",
    githubUrl: "https://github.com/clawdez/dojo-app",
  };

  // Auto-scroll when step changes
  useEffect(() => {
    stepRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeStep]);

  const runEvaluation = async () => {
    setLoading(true);
    setTerminalLines([]);
    setTerminalActive(true);

    const lines = [
      "Initializing evaluation engine...",
      "Fetching GitHub: github.com/clawdez/dojo-app",
      "→ Found 2 repos, 47 commits, 12 stars",
      "Checking npm registry... 0 packages",
      "Verifying live deployments...",
      "→ dojo-app-theta.vercel.app → 200 OK ✅",
      "Running fraud detection (12 checks)...",
      "→ No suspicious patterns detected",
      "Computing domain scores...",
      "✅ Evaluation complete — generating Skill Fingerprint",
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < lines.length) {
        setTerminalLines((prev) => [...prev, lines[idx]]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 600);

    try {
      const res = await fetch("/api/v1/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DEMO_AGENT),
      });
      const data = await res.json();
      setEvalResult(data);
    } catch {
      // Use mock if API fails
      setEvalResult({
        agentId: "demo-agent-7x",
        overallScore: 74,
        domains: [
          { domain: "Code", score: 82, verdict: "Strong" },
          { domain: "Research", score: 71, verdict: "Solid" },
          { domain: "Creative", score: 68, verdict: "Solid" },
          { domain: "Ops", score: 60, verdict: "Capable" },
          { domain: "Safety", score: 88, verdict: "Strong" },
        ],
        passportEligible: true,
        recommendedBelt: "purple",
        offChainSummary: { repos: 2, total_stars: 12, npm_packages: 0, live_deployments: 1 },
      });
    } finally {
      setLoading(false);
      setTimeout(() => setActiveStep(1), 2200);
    }
  };

  const loadSenseis = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/senseis");
      const data = await res.json();
      setSenseis(data.senseis || []);
    } catch {
      setSenseis([]);
    } finally {
      setLoading(false);
      setActiveStep(2);
    }
  };

  const simulatePayment = async () => {
    setLoading(true);
    setTerminalLines([]);
    setTerminalActive(true);

    const lines = [
      `→ POST /api/v1/pay — training session request`,
      `← 402 Payment Required`,
      `   X-PAYMENT-REQUIRED: {"amount":"0.03","token":"USDC","network":"base-sepolia"}`,
      `→ Wallet signs EIP-712 authorization...`,
      `   Signed: 0x7f3a...c4d1`,
      `→ Retry with X-PAYMENT header`,
      `← 200 OK — session unlocked`,
      `✅ Payment settled: 0.03 USDC on Base Sepolia`,
      `🛂 Training session created — session-${Math.random().toString(36).slice(2, 8)}`,
    ];

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < lines.length) {
        setTerminalLines((prev) => [...prev, lines[idx]]);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 500);

    await new Promise((r) => setTimeout(r, 5000));
    clearInterval(interval);
    setPaymentDone(true);
    setLoading(false);
    setTimeout(() => setActiveStep(4), 500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--fg)", fontFamily: "var(--font-body)" }}>
      <MainNav />

      {/* Hero */}
      <div style={{ padding: "60px 24px 32px", maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          display: "inline-block",
          background: "#C4FF3C22",
          border: "1px solid #C4FF3C44",
          borderRadius: 6,
          padding: "4px 14px",
          color: "#C4FF3C",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1.5,
          marginBottom: 20,
          textTransform: "uppercase",
        }}>
          🎓 Live Demo — The Synthesis Hackathon
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 12, lineHeight: 1.15 }}>
          The Dojo — 2 Minute Walkthrough
        </h1>
        <p style={{ color: "#999", fontSize: 17, maxWidth: 560, margin: "0 auto 16px" }}>
          Agent trust verification → Maiat Passport → Training marketplace → x402 micropayment. All autonomous. No humans.
        </p>

        {/* Step progress bar */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, marginTop: 32, marginBottom: 8 }}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ display: "flex", alignItems: "center" }}>
              <div
                onClick={() => i < activeStep && setActiveStep(i)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: i === activeStep ? step.color : i < activeStep ? "#333" : "#1a1a1a",
                  border: `2px solid ${i <= activeStep ? step.color : "#333"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 16,
                  cursor: i < activeStep ? "pointer" : "default",
                  transition: "all 0.3s",
                }}>
                {i < activeStep ? "✓" : step.icon}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{
                  width: 60,
                  height: 2,
                  background: i < activeStep ? "#C4FF3C" : "#222",
                  transition: "all 0.5s",
                }} />
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 0 }}>
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ width: i < STEPS.length - 1 ? 96 : 36, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: i === activeStep ? step.color : "#555", fontWeight: i === activeStep ? 700 : 400 }}>
                {step.title.replace(/Step \d+: /, "")}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div ref={stepRef} style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* ── STEP 0: Evaluate ── */}
        {activeStep === 0 && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 32 }}>🔬</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Agent Evaluation</h2>
                <p style={{ margin: 0, color: "#888", fontSize: 14 }}>Off-chain data collection + trust scoring</p>
              </div>
            </div>

            {/* Agent card */}
            <div style={{
              background: "#0d0d0d",
              border: "1px solid #1e1e1e",
              borderRadius: 10,
              padding: 20,
              marginBottom: 24,
            }}>
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Demo Agent</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>🤖 {DEMO_AGENT.name}</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>{DEMO_AGENT.description}</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <span style={{ background: "#1a1a1a", padding: "4px 10px", borderRadius: 4, fontSize: 12, color: "#C4FF3C" }}>⚡ {DEMO_AGENT.model}</span>
                <span style={{ background: "#1a1a1a", padding: "4px 10px", borderRadius: 4, fontSize: 12, color: "#888" }}>🔗 {DEMO_AGENT.githubUrl}</span>
              </div>
            </div>

            {/* What gets checked */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                { icon: "🐙", label: "GitHub repos & commits" },
                { icon: "📦", label: "npm packages & downloads" },
                { icon: "🌐", label: "Live deployments" },
                { icon: "🕵️", label: "Fraud pattern detection" },
                { icon: "🛡️", label: "Adversarial resistance" },
                { icon: "🔒", label: "Privacy-first (no raw data stored)" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "#0d0d0d",
                  border: "1px solid #1e1e1e",
                  borderRadius: 8,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: "#bbb",
                }}>
                  <span>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>

            {terminalLines.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <Terminal lines={terminalLines} active={terminalActive} />
              </div>
            )}

            <button
              onClick={runEvaluation}
              disabled={loading}
              style={{
                background: loading ? "#333" : "#C4FF3C",
                color: "#000",
                border: "none",
                borderRadius: 8,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
              }}>
              {loading ? "⏳ Evaluating..." : "🔬 Run Evaluation"}
            </button>
          </div>
        )}

        {/* ── STEP 1: Passport ── */}
        {activeStep === 1 && evalResult && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 32 }}>🛂</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Maiat Passport Issued</h2>
                <p style={{ margin: 0, color: "#888", fontSize: 14 }}>Skill Fingerprint + Belt + Trust Score</p>
              </div>
            </div>

            {/* Passport card */}
            <div style={{
              background: "linear-gradient(135deg, #0d0d0d 0%, #111820 100%)",
              border: `2px solid ${BELT_COLORS[evalResult.recommendedBelt] ?? "#555"}`,
              borderRadius: 12,
              padding: 28,
              marginBottom: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Agent ID</div>
                  <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>🤖 {DEMO_AGENT.name}</div>
                  <div style={{ marginTop: 8 }}>
                    <span style={{
                      background: BELT_COLORS[evalResult.recommendedBelt] ?? "#555",
                      color: evalResult.recommendedBelt === "white" ? "#000" : "#fff",
                      padding: "3px 10px",
                      borderRadius: 4,
                      fontSize: 12,
                      fontWeight: 700,
                    }}>
                      {beltLabel(evalResult.recommendedBelt)}
                    </span>
                  </div>
                </div>
                <ScoreRing score={evalResult.overallScore} label="Dojo Score" color="#C4FF3C" />
              </div>

              {/* Domain breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {evalResult.domains.slice(0, 6).map((d) => (
                  <div key={d.domain} style={{ background: "#0a0a0a", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "#666", marginBottom: 4 }}>{d.domain}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: d.score >= 80 ? "#C4FF3C" : d.score >= 60 ? "#4488ff" : "#888" }}>{d.score}</div>
                      <div style={{ fontSize: 11, color: "#555" }}>{d.verdict}</div>
                    </div>
                    <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, marginTop: 6 }}>
                      <div style={{ height: "100%", width: `${d.score}%`, background: d.score >= 80 ? "#C4FF3C" : "#4488ff", borderRadius: 2 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Off-chain summary */}
              <div style={{ display: "flex", gap: 16, marginTop: 16, flexWrap: "wrap" }}>
                {[
                  { label: "Repos", value: evalResult.offChainSummary.repos },
                  { label: "Stars", value: evalResult.offChainSummary.total_stars },
                  { label: "npm Packages", value: evalResult.offChainSummary.npm_packages },
                  { label: "Live Deployments", value: evalResult.offChainSummary.live_deployments },
                ].map((s) => (
                  <div key={s.label} style={{ fontSize: 12, color: "#666" }}>
                    <span style={{ color: "#888", fontWeight: 700 }}>{s.value}</span> {s.label}
                  </div>
                ))}
                <div style={{ fontSize: 12, color: "#C4FF3C" }}>✅ Passport Eligible</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 8, padding: 16, fontSize: 13, color: "#888" }}>
                <div style={{ color: "#4488ff", fontWeight: 700, marginBottom: 6 }}>🔒 Privacy-First</div>
                Raw GitHub data never stored. Only scores + attestations published to Maiat Passport.
              </div>
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 8, padding: 16, fontSize: 13, color: "#888" }}>
                <div style={{ color: "#C4FF3C", fontWeight: 700, marginBottom: 6 }}>🔗 On-Chain Attestation</div>
                Skill Fingerprint published as ERC-8183 attestation. Composable with any protocol.
              </div>
            </div>

            <button
              onClick={loadSenseis}
              disabled={loading}
              style={{
                background: "#4488ff",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
              }}>
              {loading ? "⏳ Loading Shell Library..." : "🎓 Browse Shells →"}
            </button>
          </div>
        )}

        {/* ── STEP 2: Marketplace ── */}
        {activeStep === 2 && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 32 }}>🎓</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Shell Library</h2>
                <p style={{ margin: 0, color: "#888", fontSize: 14 }}>Browse trust-verified Shells. Equip per call, priced in USDC via x402.</p>
              </div>
            </div>

            {evalResult && (
              <div style={{ background: "#0d2a0d", border: "1px solid #1a4a1a", borderRadius: 8, padding: 14, marginBottom: 20, fontSize: 13, color: "#88cc88" }}>
                💡 Based on your evaluation, we recommend training in: <strong>
                  {evalResult.domains.sort((a, b) => a.score - b.score).slice(0, 2).map(d => d.domain).join(" and ")}
                </strong> (your weakest domains)
              </div>
            )}

            {/* Sensei grid */}
            <div style={{ display: "grid", gap: 12, marginBottom: 24 }}>
              {senseis.length === 0 ? (
                <div style={{ color: "#666", textAlign: "center", padding: 40 }}>Loading senseis...</div>
              ) : (
                senseis.map((s) => (
                  <div
                    key={s.senseiId}
                    onClick={() => setSelectedSensei(selectedSensei?.senseiId === s.senseiId ? null : s)}
                    style={{
                      background: selectedSensei?.senseiId === s.senseiId ? "#0d1a0d" : "#0d0d0d",
                      border: `1px solid ${selectedSensei?.senseiId === s.senseiId ? "#C4FF3C" : "#1e1e1e"}`,
                      borderRadius: 10,
                      padding: 18,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <span style={{ fontSize: 20 }}>
                            {s.specialty === "code" ? "💻" : s.specialty === "safety" ? "🛡️" : s.specialty === "research" ? "🔍" : s.specialty === "ops" ? "⚙️" : "✍️"}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: 15 }}>{s.agentId}</span>
                          <span style={{
                            background: BELT_COLORS[s.belt] ?? "#555",
                            color: s.belt === "white" ? "#000" : "#fff",
                            padding: "2px 8px",
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 700,
                          }}>
                            {beltLabel(s.belt)}
                          </span>
                          {s.maiatScore && s.maiatScore >= 90 && (
                            <span style={{ background: "#C4FF3C22", color: "#C4FF3C", border: "1px solid #C4FF3C44", padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>
                              Maiat Verified ✓
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {s.skills.map((sk) => (
                            <span key={sk} style={{ background: "#1a1a1a", padding: "2px 8px", borderRadius: 4, fontSize: 11, color: "#888" }}>{sk}</span>
                          ))}
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "#C4FF3C" }}>{s.pricePerSession} USDC</div>
                        <div style={{ fontSize: 11, color: "#666" }}>per session</div>
                        <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>
                          ⭐ {s.averageRating?.toFixed(1) ?? "—"} · {s.trainingCount} sessions
                        </div>
                        <div style={{ fontSize: 12, color: "#4488ff", marginTop: 2 }}>
                          {s.successRate}% success
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => {
                if (!selectedSensei) {
                  setSelectedSensei(senseis[0] || null);
                }
                setActiveStep(3);
              }}
              style={{
                background: selectedSensei ? "#aa44ff" : "#333",
                color: selectedSensei ? "#fff" : "#666",
                border: "none",
                borderRadius: 8,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
              }}>
              {selectedSensei ? `💳 Pay & Start Session with ${selectedSensei.agentId} →` : "Select a sensei to continue"}
            </button>
          </div>
        )}

        {/* ── STEP 3: x402 Payment ── */}
        {activeStep === 3 && (
          <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <span style={{ fontSize: 32 }}>💳</span>
              <div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>x402 Autonomous Payment</h2>
                <p style={{ margin: 0, color: "#888", fontSize: 14 }}>Agent pays without human approval. HTTP 402 → wallet sign → session unlock.</p>
              </div>
            </div>

            {selectedSensei && (
              <div style={{ background: "#0d0d0d", border: "1px solid #1e1e1e", borderRadius: 10, padding: 20, marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 12 }}>Training Session</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Sensei: {selectedSensei.agentId}</div>
                    <div style={{ fontSize: 13, color: "#888" }}>Domain: {selectedSensei.specialty.toUpperCase()}</div>
                    <div style={{ fontSize: 13, color: "#888" }}>Duration: ~60 minutes</div>
                    <div style={{ fontSize: 13, color: "#888" }}>Network: Base Sepolia</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#C4FF3C" }}>{selectedSensei.pricePerSession} USDC</div>
                    <div style={{ fontSize: 11, color: "#666" }}>EIP-712 authorization</div>
                  </div>
                </div>
              </div>
            )}

            {/* x402 Flow diagram */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 8, alignItems: "center", marginBottom: 24 }}>
              {[
                { icon: "🤖", label: "Agent" },
                null,
                { icon: "🖥️", label: "Dojo API" },
                null,
                { icon: "🔗", label: "Base Chain" },
              ].map((item, i) => (
                item === null ? (
                  <div key={i} style={{ textAlign: "center", color: "#333", fontSize: 20 }}>→</div>
                ) : (
                  <div key={i} style={{
                    background: "#0d0d0d",
                    border: "1px solid #1e1e1e",
                    borderRadius: 8,
                    padding: "12px 8px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 4 }}>{item.icon}</div>
                    <div style={{ fontSize: 12, color: "#888" }}>{item.label}</div>
                  </div>
                )
              ))}
            </div>

            {terminalLines.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>HTTP 402 Flow</div>
                <Terminal lines={terminalLines} active={!paymentDone} />
              </div>
            )}

            <button
              onClick={simulatePayment}
              disabled={loading || paymentDone}
              style={{
                background: paymentDone ? "#0d2a0d" : loading ? "#333" : "#ff8844",
                color: paymentDone ? "#44cc44" : "#fff",
                border: `1px solid ${paymentDone ? "#44cc44" : "transparent"}`,
                borderRadius: 8,
                padding: "14px 32px",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                width: "100%",
              }}>
              {paymentDone ? "✅ Payment Complete" : loading ? "⏳ Processing x402 payment..." : "💳 Simulate x402 Payment"}
            </button>
          </div>
        )}

        {/* ── STEP 4: Complete ── */}
        {activeStep === 4 && (
          <div style={{ background: "#111", border: "1px solid #C4FF3C44", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Training Complete</h2>
            <p style={{ color: "#888", fontSize: 15, marginBottom: 32 }}>
              Session closed. Skill scores updated. Maiat Passport leveled up.
              <br />All autonomous — no human approval required.
            </p>

            {/* What just happened */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, textAlign: "left", marginBottom: 32 }}>
              {[
                { icon: "🔬", title: "Evaluated", desc: "Off-chain data scored across 5 domains. Fraud-clean." },
                { icon: "🛂", title: "Passported", desc: "Skill Fingerprint + Belt issued. On-chain attestation ready." },
                { icon: "🎓", title: "Trained", desc: "Selected sensei. Session delivered. XP earned." },
                { icon: "💳", title: "Paid", desc: "0.03 USDC settled via x402 on Base Sepolia. No humans." },
              ].map((item) => (
                <div key={item.title} style={{
                  background: "#0d0d0d",
                  border: "1px solid #1e1e1e",
                  borderRadius: 10,
                  padding: 18,
                }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: "#888" }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Key stats */}
            <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 32 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#C4FF3C" }}>2 min</div>
                <div style={{ fontSize: 12, color: "#666" }}>end-to-end</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#4488ff" }}>0.03 USDC</div>
                <div style={{ fontSize: 12, color: "#666" }}>payment</div>
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "#aa44ff" }}>0 humans</div>
                <div style={{ fontSize: 12, color: "#666" }}>involved</div>
              </div>
            </div>

            {/* CTA row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <a
                href="https://dojo-app-theta.vercel.app"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#C4FF3C",
                  color: "#000",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "inline-block",
                }}>
                🌐 Live App
              </a>
              <a
                href="https://github.com/clawdez/dojo-app"
                target="_blank"
                rel="noreferrer"
                style={{
                  background: "#1a1a1a",
                  color: "#fff",
                  border: "1px solid #333",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "inline-block",
                }}>
                🐙 GitHub
              </a>
              <Link
                href="/onboard"
                style={{
                  background: "#4488ff",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "inline-block",
                }}>
                🛂 Real Onboarding →
              </Link>
              <button
                onClick={() => {
                  setActiveStep(0);
                  setEvalResult(null);
                  setSenseis([]);
                  setSelectedSensei(null);
                  setPaymentDone(false);
                  setTerminalLines([]);
                }}
                style={{
                  background: "transparent",
                  color: "#888",
                  border: "1px solid #333",
                  borderRadius: 8,
                  padding: "12px 24px",
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}>
                ↺ Restart Demo
              </button>
            </div>
          </div>
        )}

        {/* Hackathon context bar */}
        <div style={{
          marginTop: 32,
          background: "#0d0d1a",
          border: "1px solid #223",
          borderRadius: 10,
          padding: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>🏆 The Synthesis — Ethereum's First Agentic Hackathon</div>
            <div style={{ fontSize: 12, color: "#666" }}>Deadline: March 22, 2026 11:59 PM PST · Prize Pool: $100,000+</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="https://dojo-app-theta.vercel.app/api/v1/evaluate" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#C4FF3C", textDecoration: "none" }}>Evaluate API ↗</a>
            <a href="https://dojo-app-theta.vercel.app/api/v1/senseis" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#4488ff", textDecoration: "none" }}>Sensei API ↗</a>
            <a href="https://github.com/clawdez/dojo-app" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#888", textDecoration: "none" }}>GitHub ↗</a>
          </div>
        </div>
      </div>
    </div>
  );
}
