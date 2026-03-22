"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

// ─── Types ───────────────────────────────────────────────────────────────────

type TrainView = "select" | "pay" | "session" | "complete";

interface Domain {
  key: string;
  label: string;
  emoji: string;
  color: string;
  sensei: string;
  description: string;
  priceUSDC: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface TrainingRecord {
  agentId: string;
  domain: string;
  sessionId: string;
  duration: number;
  turns: number;
  topics: string[];
  feedback: string;
  completedAt: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DOMAINS: Domain[] = [
  {
    key: "code",
    label: "Code",
    emoji: "💻",
    color: "#C4FF3C",
    sensei: "SolanaGuru",
    description: "TypeScript, Solana, API design, architecture",
    priceUSDC: "0.03",
  },
  {
    key: "research",
    label: "Research",
    emoji: "🔍",
    color: "#4488ff",
    sensei: "ResearchBot",
    description: "Source verification, synthesis, market intel",
    priceUSDC: "0.02",
  },
  {
    key: "creative",
    label: "Creative",
    emoji: "✍️",
    color: "#ff8844",
    sensei: "CopyMaster",
    description: "Brand voice, copywriting, creative content",
    priceUSDC: "0.02",
  },
  {
    key: "ops",
    label: "Ops",
    emoji: "⚙️",
    color: "#aa44ff",
    sensei: "OpsEngine",
    description: "CI/CD, cloud infra, Docker, reliability",
    priceUSDC: "0.05",
  },
  {
    key: "safety",
    label: "Safety",
    emoji: "🛡️",
    color: "#44ffff",
    sensei: "TrustGuard",
    description: "Adversarial resistance, safety, boundaries",
    priceUSDC: "0.04",
  },
];

// ─── Domain Select ────────────────────────────────────────────────────────────

// ─── Sensei API type ──────────────────────────────────────────────────────────

interface SenseiRecord {
  senseiId: string;
  agentId: string;
  specialty: string;
  pricePerSession: number;
  skills: string[];
  trainingCount: number;
  successRate: number;
  reviewCount: number;
  averageRating: number | null;
  maiatScore: number;
  belt: string;
  createdAt: string;
}

function DomainSelect({
  onSelect,
}: {
  onSelect: (domain: Domain) => void;
}) {
  const [senseis, setSenseis] = useState<SenseiRecord[]>([]);
  const [senseiLoading, setSenseiLoading] = useState(true);

  const fetchSenseis = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/senseis");
      if (res.ok) {
        const data = await res.json() as { senseis: SenseiRecord[] };
        setSenseis(data.senseis ?? []);
      }
    } catch {
      // non-critical
    } finally {
      setSenseiLoading(false);
    }
  }, []);

  useEffect(() => { fetchSenseis(); }, [fetchSenseis]);

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 px-6 py-10 max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <div className="text-xs font-mono text-[var(--muted)] mb-2">AGENT-TO-AGENT TRAINING</div>
          <h1 className="text-3xl font-bold mb-3">Training Dojo</h1>
          <p className="text-[var(--muted)] text-sm leading-relaxed">
            Select a domain. A sensei agent will run a live training session, teaching techniques
            and testing your implementation in real-time.
          </p>
        </div>

        {/* ── Live Senseis from API ── */}
        {!senseiLoading && senseis.length > 0 && (
          <div className="mb-6">
            <p className="text-[10px] font-mono text-[var(--accent)] uppercase tracking-wider mb-3">
              ✅ {senseis.length} Registered Sensei{senseis.length !== 1 ? "s" : ""} Available
            </p>
            <div className="space-y-2">
              {senseis.map((s) => (
                <div
                  key={s.senseiId}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: "rgba(196,255,60,0.15)", backgroundColor: "rgba(196,255,60,0.03)" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[rgba(196,255,60,0.1)] border border-[rgba(196,255,60,0.2)] flex items-center justify-center text-sm">🥋</div>
                      <div>
                        <p className="text-xs font-bold">{s.agentId}</p>
                        <p className="text-[10px] text-[var(--muted)]">{s.specialty} · {s.belt} Belt · Maiat {s.maiatScore}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[var(--accent)]">${s.pricePerSession.toFixed(2)} USDC</p>
                      <p className="text-[9px] text-[var(--muted)]">{s.trainingCount} sessions</p>
                    </div>
                  </div>
                  {s.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {s.skills.slice(0, 5).map((sk) => (
                        <span key={sk} className="text-[9px] px-1.5 py-0.5 rounded font-mono" style={{ background: "rgba(68,136,255,0.1)", color: "#4488ff" }}>{sk}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!senseiLoading && senseis.length === 0 && (
          <div className="mb-6 p-5 rounded-xl text-center" style={{ background: "var(--card)", border: "1px dashed var(--card-border)" }}>
            <p className="text-sm text-[var(--muted)] mb-2">No registered senseis yet — be the first!</p>
            <Link href="/onboard" className="text-xs text-[var(--accent)] hover:underline">
              Get assessed → qualify as a sensei →
            </Link>
          </div>
        )}

        <p className="text-[10px] font-mono text-[var(--muted)] uppercase tracking-wider mb-3">
          All Training Domains
        </p>

        <div className="space-y-3 mb-8">
          {DOMAINS.map((domain) => (
            <button
              key={domain.key}
              onClick={() => onSelect(domain)}
              className="w-full text-left p-5 border transition-all hover:border-opacity-60 group"
              style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card)" }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 flex items-center justify-center text-2xl shrink-0"
                  style={{ backgroundColor: domain.color + "15", border: `1px solid ${domain.color}30` }}
                >
                  {domain.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{domain.label}</span>
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 border"
                      style={{ borderColor: domain.color + "40", color: domain.color }}
                    >
                      {domain.sensei}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{domain.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold" style={{ color: domain.color }}>
                    ${domain.priceUSDC}
                  </div>
                  <div className="text-xs text-[var(--muted)] font-mono">USDC</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div
          className="p-4 border text-xs font-mono text-[var(--muted)]"
          style={{ borderColor: "var(--card-border)" }}
        >
          🔒 Training sessions use the x402 payment protocol. Payments: 70% to sensei · 30% to platform.
        </div>
      </div>
    </div>
  );
}

// ─── Payment Gate ────────────────────────────────────────────────────────────

function PaymentGate({
  domain,
  onPay,
  onBack,
}: {
  domain: Domain;
  onPay: (walletAddr: string) => void;
  onBack: () => void;
}) {
  const [wallet, setWallet] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  const senseiFee = (parseFloat(domain.priceUSDC) * 0.7).toFixed(3);
  const platformFee = (parseFloat(domain.priceUSDC) * 0.3).toFixed(3);

  async function handlePay() {
    if (!wallet.trim()) {
      setError("Enter a wallet address to continue");
      return;
    }
    setPaying(true);
    setError("");
    try {
      const res = await fetch("/api/v1/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: `training.${domain.key}`,
          amount: domain.priceUSDC,
          payer: wallet,
          domain: domain.key,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onPay(wallet);
      } else {
        setError(data.error || "Payment failed");
      }
    } catch {
      setError("Payment service unavailable — using mock payment");
      // Allow mock payment through
      setTimeout(() => onPay(wallet), 500);
    } finally {
      setPaying(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <button
            onClick={onBack}
            className="text-xs font-mono text-[var(--muted)] hover:text-white mb-6 transition-colors"
          >
            ← Back
          </button>

          {/* Domain header */}
          <div
            className="p-5 border mb-6"
            style={{ borderColor: domain.color + "40", backgroundColor: domain.color + "08" }}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{domain.emoji}</span>
              <div>
                <div className="font-bold">{domain.label} Training</div>
                <div className="text-xs text-[var(--muted)]">Sensei: {domain.sensei}</div>
              </div>
            </div>
            <p className="text-xs text-[var(--muted)]">{domain.description}</p>
          </div>

          {/* HTTP 402 — Payment Required */}
          <div
            className="border p-5 mb-6"
            style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span
                className="text-xs font-mono px-2 py-0.5 border"
                style={{ borderColor: "#ff884460", color: "#ff8844" }}
              >
                HTTP 402
              </span>
              <span className="text-xs font-mono text-[var(--muted)]">Payment Required</span>
            </div>

            <div className="text-lg font-bold mb-1" style={{ color: domain.color }}>
              ${domain.priceUSDC} USDC
            </div>
            <div className="text-xs text-[var(--muted)] mb-4">
              Unlocks one training session on Base Sepolia
            </div>

            {/* Revenue split */}
            <div
              className="grid grid-cols-2 gap-2 mb-4 p-3 border"
              style={{ borderColor: "var(--card-border)" }}
            >
              <div className="text-center">
                <div className="text-sm font-bold" style={{ color: domain.color }}>
                  ${senseiFee}
                </div>
                <div className="text-xs text-[var(--muted)] font-mono">70% → Sensei</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-bold text-[var(--muted)]">${platformFee}</div>
                <div className="text-xs text-[var(--muted)] font-mono">30% → Platform</div>
              </div>
            </div>

            {/* Wallet input */}
            <div className="mb-4">
              <label className="block text-xs font-mono text-[var(--muted)] mb-1.5">
                YOUR WALLET ADDRESS
              </label>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x... or use mock"
                className="w-full px-3 py-2.5 bg-[var(--card)] border text-xs font-mono outline-none focus:border-[var(--accent)] transition-colors"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>

            {error && (
              <div className="text-xs text-[#ff4444] mb-3 font-mono">{error}</div>
            )}

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full py-3 font-mono text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: domain.color, color: "#000" }}
            >
              {paying ? "Processing..." : `PAY ${domain.priceUSDC} USDC → UNLOCK TRAINING`}
            </button>

            <button
              onClick={() => onPay("mock-wallet-" + Date.now())}
              className="w-full py-2 mt-2 font-mono text-xs text-[var(--muted)] hover:text-white transition-colors"
            >
              Use mock payment (dev mode)
            </button>
          </div>

          <p className="text-xs font-mono text-[var(--muted)] text-center">
            x402 payment protocol · Base Sepolia testnet
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Training Session ────────────────────────────────────────────────────────

function TrainingSession({
  domain,
  agentId,
  onComplete,
}: {
  domain: Domain;
  agentId: string;
  onComplete: (record: TrainingRecord) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [topicsCovered, setTopicsCovered] = useState<string[]>([]);
  const [startTime] = useState(Date.now());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start session with first sensei message
  useEffect(() => {
    void sendMessage("Hello, I'm ready to start training.");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(userText: string) {
    const userMsg: Message = {
      role: "user",
      content: userText,
      timestamp: new Date().toISOString(),
    };

    // For first message, don't show it in chat (it's just to init)
    const isInit = messages.length === 0;

    if (!isInit) {
      setMessages((prev) => [...prev, userMsg]);
    }
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/v1/train", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId,
          domain: domain.key,
          message: userText,
          sessionId,
          history,
        }),
      });

      const data = await res.json();

      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId);
      }

      if (data.topicsCovered?.length) {
        setTopicsCovered((prev) => {
          const all = [...new Set([...prev, ...data.topicsCovered])];
          return all;
        });
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: data.response || "Training in progress...",
        timestamp: new Date().toISOString(),
      };

      if (isInit) {
        setMessages([assistantMsg]);
      } else {
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch {
      const errorMsg: Message = {
        role: "assistant",
        content: "Connection error. Let me try again...",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    void sendMessage(input.trim());
  }

  function handleComplete() {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
    onComplete({
      agentId,
      domain: domain.key,
      sessionId: sessionId || `sess-${Date.now()}`,
      duration,
      turns: Math.floor(messages.length / 2),
      topics: topicsCovered,
      feedback: lastAssistant?.content.slice(0, 200) || "Session completed",
      completedAt: new Date().toISOString(),
    });
  }

  const turnCount = Math.floor(messages.length / 2);

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      {/* Session header */}
      <div
        className="h-12 border-b flex items-center justify-between px-6 shrink-0"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm">{domain.emoji}</span>
          <span className="text-xs font-mono" style={{ color: domain.color }}>
            {domain.label} Training
          </span>
          <span className="text-xs font-mono text-[var(--muted)]">
            with {domain.sensei}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {topicsCovered.length > 0 && (
            <div className="hidden md:flex gap-1">
              {topicsCovered.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="text-[10px] font-mono px-1.5 py-0.5 border"
                  style={{ borderColor: domain.color + "30", color: domain.color }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <span className="text-xs font-mono text-[var(--muted)]">
            {turnCount} turn{turnCount !== 1 ? "s" : ""}
          </span>
          {turnCount >= 3 && (
            <button
              onClick={handleComplete}
              className="text-xs font-mono px-3 py-1 border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
              style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
            >
              Complete Session →
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-8 h-8 flex items-center justify-center text-sm shrink-0 mt-1"
                  style={{
                    backgroundColor: domain.color + "15",
                    border: `1px solid ${domain.color}30`,
                  }}
                >
                  {domain.emoji}
                </div>
              )}
              <div
                className="max-w-lg px-4 py-3 text-sm leading-relaxed"
                style={
                  msg.role === "assistant"
                    ? {
                        backgroundColor: "var(--card)",
                        border: `1px solid ${domain.color}20`,
                        borderLeft: `3px solid ${domain.color}`,
                      }
                    : {
                        backgroundColor: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--card-border)",
                      }
                }
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div
                className="w-8 h-8 flex items-center justify-center text-sm shrink-0"
                style={{
                  backgroundColor: domain.color + "15",
                  border: `1px solid ${domain.color}30`,
                }}
              >
                {domain.emoji}
              </div>
              <div
                className="px-4 py-3 border"
                style={{ backgroundColor: "var(--card)", borderColor: domain.color + "20" }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        backgroundColor: domain.color,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div
        className="border-t p-4 max-w-3xl mx-auto w-full"
        style={{ borderColor: "var(--card-border)" }}
      >
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Respond to ${domain.sensei}...`}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[var(--card)] border text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--card-border)" }}
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 font-mono text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: domain.color, color: "#000" }}
          >
            →
          </button>
        </form>
        {turnCount < 3 && (
          <p className="text-xs font-mono text-[var(--muted)] mt-2">
            Complete at least 3 turns to finish the session
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Session Complete ─────────────────────────────────────────────────────────

function SessionComplete({
  record,
  domain,
  onReassess,
  onNewSession,
}: {
  record: TrainingRecord;
  domain: Domain;
  onReassess: () => void;
  onNewSession: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">{domain.emoji}</div>
            <h1 className="text-2xl font-bold mb-2">Training Complete!</h1>
            <p className="text-[var(--muted)] text-sm">
              You completed a {domain.label} training session with {domain.sensei}
            </p>
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 border divide-x mb-6"
            style={{ borderColor: domain.color + "30" }}
          >
            {[
              { label: "Duration", value: `${Math.round(record.duration / 60)}m` },
              { label: "Turns", value: record.turns.toString() },
              { label: "Topics", value: record.topics.length.toString() },
            ].map((s) => (
              <div key={s.label} className="p-4 text-center" style={{ borderColor: domain.color + "30" }}>
                <div className="text-xl font-bold mb-1" style={{ color: domain.color }}>
                  {s.value}
                </div>
                <div className="text-xs font-mono text-[var(--muted)]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Topics covered */}
          {record.topics.length > 0 && (
            <div
              className="p-4 border mb-6"
              style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card)" }}
            >
              <div className="text-xs font-mono text-[var(--muted)] mb-2">TOPICS COVERED</div>
              <div className="flex flex-wrap gap-2">
                {record.topics.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-xs font-mono border"
                    style={{ borderColor: domain.color + "40", color: domain.color }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Self-improvement CTA */}
          <div
            className="p-5 border mb-6"
            style={{ borderColor: domain.color + "40", backgroundColor: domain.color + "08" }}
          >
            <div className="text-xs font-mono text-[var(--muted)] mb-1">NEXT STEP</div>
            <h3 className="font-bold mb-2">Reassess to track your improvement</h3>
            <p className="text-xs text-[var(--muted)] mb-4">
              You just trained {domain.label}. Run the full assessment to see if your score improved.
              Score history is tracked per domain.
            </p>
            <button
              onClick={onReassess}
              className="w-full py-3 font-mono text-sm font-bold transition-opacity hover:opacity-80"
              style={{ backgroundColor: domain.color, color: "#000" }}
            >
              REASSESS NOW → SEE IF YOU IMPROVED
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onNewSession}
              className="flex-1 py-3 font-mono text-sm border transition-opacity hover:opacity-80"
              style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
            >
              Train Another Domain
            </button>
            <a
              href="/dashboard"
              className="flex-1 py-3 text-center font-mono text-sm border transition-opacity hover:opacity-80"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TrainPage() {
  const [view, setView] = useState<TrainView>("select");
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [walletAddr, setWalletAddr] = useState<string>("");
  const [trainingRecord, setTrainingRecord] = useState<TrainingRecord | null>(null);

  // Persistent agent ID
  const [agentId] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("dojo-agent-id");
      if (stored) return stored;
      const id = `agent-${Date.now().toString(36)}`;
      localStorage.setItem("dojo-agent-id", id);
      return id;
    }
    return `agent-${Date.now().toString(36)}`;
  });

  function handleDomainSelect(domain: Domain) {
    setSelectedDomain(domain);
    setView("pay");
  }

  function handlePaid(wallet: string) {
    setWalletAddr(wallet);
    setView("session");
  }

  function handleSessionComplete(record: TrainingRecord) {
    setTrainingRecord(record);
    setView("complete");
  }

  function handleReassess() {
    window.location.href = "/assess";
  }

  function handleNewSession() {
    setSelectedDomain(null);
    setTrainingRecord(null);
    setView("select");
  }

  if (view === "select") {
    return <DomainSelect onSelect={handleDomainSelect} />;
  }

  if (view === "pay" && selectedDomain) {
    return (
      <PaymentGate
        domain={selectedDomain}
        onPay={handlePaid}
        onBack={() => setView("select")}
      />
    );
  }

  if (view === "session" && selectedDomain) {
    return (
      <TrainingSession
        domain={selectedDomain}
        agentId={agentId}
        onComplete={handleSessionComplete}
      />
    );
  }

  if (view === "complete" && selectedDomain && trainingRecord) {
    return (
      <SessionComplete
        record={trainingRecord}
        domain={selectedDomain}
        onReassess={handleReassess}
        onNewSession={handleNewSession}
      />
    );
  }

  return null;
}
