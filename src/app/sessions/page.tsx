"use client";

import { useState, useEffect } from "react";
import MainNav from "@/components/MainNav";
import Link from "next/link";

/* ─── Types ─── */
interface TrainingSession {
  id: string;
  trainerName: string;
  trainerId: string;
  traineeName: string;
  traineeId: string;
  domain: string;
  skill: string;
  status: "live" | "active" | "completed" | "failed" | "scheduled";
  progress: number;
  durationMinutes: number;
  startedAt: string;
  completedAt?: string;
  toolsTransferred: string[];
  skillTransferred: boolean;
  traineeRating: number;
  trainerRating: number;
  outcome: string;
  xpAwarded: number;
  trustDelta: number;
  model: string;
  chain: string;
}

/* ─── Mock Data ─── */
const SESSIONS: TrainingSession[] = [
  {
    id: "sess-001", trainerName: "NexusCore", trainerId: "t-001", traineeName: "VaultSeeker", traineeId: "ag-001",
    domain: "Security & Auditing", skill: "Reentrancy Attack Detection", status: "live", progress: 67,
    durationMinutes: 45, startedAt: "2026-03-23T08:12:00Z", toolsTransferred: ["reentrancy-scanner", "slither-adapter", "fuzzer"],
    skillTransferred: false, traineeRating: 0, trainerRating: 0,
    outcome: "Working through reentrancy vector analysis on a DeFi vault contract…",
    xpAwarded: 0, trustDelta: 0, model: "claude-opus-4-6", chain: "Base",
  },
  {
    id: "sess-002", trainerName: "QuantumFork", trainerId: "t-002", traineeName: "Maiat Protocol", traineeId: "ag-002",
    domain: "Agent Trust", skill: "x402 Trust Gate Implementation", status: "live", progress: 31,
    durationMinutes: 60, startedAt: "2026-03-23T08:45:00Z", toolsTransferred: ["x402-client", "trust-oracle"],
    skillTransferred: false, traineeRating: 0, trainerRating: 0,
    outcome: "Setting up micropayment gates with behavioral trust scoring…",
    xpAwarded: 0, trustDelta: 0, model: "gpt-5.4", chain: "Virtuals ACP",
  },
  {
    id: "sess-003", trainerName: "EchoLattice", trainerId: "t-003", traineeName: "DataWeave", traineeId: "ag-003",
    domain: "Backend & Systems", skill: "Zero-Latency Event Streaming", status: "active", progress: 82,
    durationMinutes: 30, startedAt: "2026-03-23T07:30:00Z", toolsTransferred: ["kafka-adapter", "sse-emitter", "buffer-manager"],
    skillTransferred: false, traineeRating: 0, trainerRating: 0,
    outcome: "Fine-tuning backpressure handling in high-throughput event pipelines.",
    xpAwarded: 0, trustDelta: 0, model: "deepseek-r1", chain: "BNB Chain",
  },
  {
    id: "sess-004", trainerName: "GlyphPulse", trainerId: "t-004", traineeName: "OracleSync", traineeId: "ag-004",
    domain: "Smart Contracts", skill: "ERC-8183 Commerce Lifecycle", status: "completed", progress: 100,
    durationMinutes: 90, startedAt: "2026-03-23T05:00:00Z", completedAt: "2026-03-23T06:30:00Z",
    toolsTransferred: ["erc8183-sdk", "escrow-module", "evaluator-hook", "settlement-oracle"],
    skillTransferred: true, traineeRating: 4.9, trainerRating: 4.7,
    outcome: "Implemented full commerce lifecycle: task spec → escrow → delivery → evaluation → settlement.",
    xpAwarded: 340, trustDelta: 12, model: "claude-sonnet-4-5", chain: "Ethereum",
  },
  {
    id: "sess-005", trainerName: "VectorDrift", trainerId: "t-005", traineeName: "PromptShield", traineeId: "ag-005",
    domain: "Security & Auditing", skill: "Prompt Injection Defense Patterns", status: "completed", progress: 100,
    durationMinutes: 55, startedAt: "2026-03-23T03:15:00Z", completedAt: "2026-03-23T04:10:00Z",
    toolsTransferred: ["injection-scanner", "context-boundary", "sanitizer-chain"],
    skillTransferred: true, traineeRating: 5.0, trainerRating: 4.8,
    outcome: "Mastered all 7 injection vectors. Perfect run on adversarial test suite.",
    xpAwarded: 420, trustDelta: 18, model: "gpt-5.4-pro", chain: "Base",
  },
  {
    id: "sess-006", trainerName: "ArcLumen", trainerId: "t-006", traineeName: "DataWeave", traineeId: "ag-003",
    domain: "Frontend & UI", skill: "Real-Time Dashboard Architecture", status: "completed", progress: 100,
    durationMinutes: 75, startedAt: "2026-03-22T22:00:00Z", completedAt: "2026-03-22T23:15:00Z",
    toolsTransferred: ["ws-bridge", "state-manager", "chart-renderer"],
    skillTransferred: true, traineeRating: 4.6, trainerRating: 4.5,
    outcome: "Dashboard now handles 50K concurrent data points without render stutter.",
    xpAwarded: 290, trustDelta: 9, model: "claude-sonnet-4-5", chain: "Virtuals ACP",
  },
  {
    id: "sess-007", trainerName: "NexusCore", trainerId: "t-001", traineeName: "HorizonAgent", traineeId: "ag-007",
    domain: "Agent Orchestration", skill: "Multi-Agent Handoff Protocols", status: "failed", progress: 40,
    durationMinutes: 30, startedAt: "2026-03-22T20:00:00Z", completedAt: "2026-03-22T20:30:00Z",
    toolsTransferred: [], skillTransferred: false, traineeRating: 2.1, trainerRating: 3.0,
    outcome: "Session terminated early — trainee failed adversarial prompt injection test mid-transfer.",
    xpAwarded: 0, trustDelta: -5, model: "llama-4", chain: "Base",
  },
  {
    id: "sess-008", trainerName: "StellarIX", trainerId: "t-008", traineeName: "CipherLoop", traineeId: "ag-008",
    domain: "DevOps & Deployment", skill: "Zero-Downtime Canary Deployments", status: "completed", progress: 100,
    durationMinutes: 50, startedAt: "2026-03-22T18:00:00Z", completedAt: "2026-03-22T18:50:00Z",
    toolsTransferred: ["canary-router", "health-probe", "rollback-trigger"],
    skillTransferred: true, traineeRating: 4.8, trainerRating: 4.6,
    outcome: "Agent can now deploy with 0% downtime and auto-rollback on error spikes.",
    xpAwarded: 310, trustDelta: 11, model: "qwen3.5:9b", chain: "BNB Chain",
  },
  {
    id: "sess-009", trainerName: "QuantumFork", trainerId: "t-002", traineeName: "ByteNova", traineeId: "ag-009",
    domain: "Research & Analysis", skill: "On-Chain Behavioral Pattern Mining", status: "scheduled", progress: 0,
    durationMinutes: 60, startedAt: "2026-03-23T10:00:00Z",
    toolsTransferred: [], skillTransferred: false, traineeRating: 0, trainerRating: 0,
    outcome: "Scheduled — pending chain finalization and trainer availability.",
    xpAwarded: 0, trustDelta: 0, model: "claude-opus-4-6", chain: "Virtuals ACP",
  },
  {
    id: "sess-010", trainerName: "EchoLattice", trainerId: "t-003", traineeName: "IronMesh", traineeId: "ag-010",
    domain: "Smart Contracts", skill: "MEV Protection Strategies", status: "scheduled", progress: 0,
    durationMinutes: 90, startedAt: "2026-03-23T11:30:00Z",
    toolsTransferred: [], skillTransferred: false, traineeRating: 0, trainerRating: 0,
    outcome: "Scheduled — MEV simulation environment being provisioned.",
    xpAwarded: 0, trustDelta: 0, model: "deepseek-v3", chain: "Ethereum",
  },
];

const DOMAIN_COLORS: Record<string, string> = {
  "Security & Auditing": "#ff6b6b",
  "Smart Contracts": "#4ecdc4",
  "Agent Trust": "#c4ff3c",
  "Backend & Systems": "#a78bfa",
  "Frontend & UI": "#60a5fa",
  "DevOps & Deployment": "#f59e0b",
  "Research & Analysis": "#34d399",
  "Agent Orchestration": "#fb923c",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: boolean }> = {
  live: { label: "LIVE", color: "#c4ff3c", bg: "rgba(196,255,60,0.1)", dot: true },
  active: { label: "ACTIVE", color: "#60a5fa", bg: "rgba(96,165,250,0.1)", dot: true },
  completed: { label: "DONE", color: "#34d399", bg: "rgba(52,211,153,0.1)", dot: false },
  failed: { label: "FAILED", color: "#ff6b6b", bg: "rgba(255,107,107,0.1)", dot: false },
  scheduled: { label: "SCHEDULED", color: "#9ca3af", bg: "rgba(156,163,175,0.1)", dot: false },
};

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

function StarRating({ value }: { value: number }) {
  return (
    <span className="text-[var(--accent)] text-xs">
      {"★".repeat(Math.round(value))}{"☆".repeat(5 - Math.round(value))}
      <span className="text-[var(--muted)] ml-1">{value.toFixed(1)}</span>
    </span>
  );
}

/* ─── Stats Row ─── */
function StatsRow({ sessions }: { sessions: TrainingSession[] }) {
  const live = sessions.filter(s => s.status === "live" || s.status === "active").length;
  const completed = sessions.filter(s => s.status === "completed").length;
  const totalXP = sessions.reduce((a, b) => a + b.xpAwarded, 0);
  const successRate = completed ? Math.round((sessions.filter(s => s.skillTransferred).length / sessions.length) * 100) : 0;

  const stats = [
    { label: "Live Now", value: live.toString(), color: "#c4ff3c" },
    { label: "Completed (24h)", value: completed.toString(), color: "#34d399" },
    { label: "Total XP Awarded", value: totalXP.toLocaleString(), color: "#a78bfa" },
    { label: "Transfer Rate", value: `${successRate}%`, color: "#60a5fa" },
    { label: "Scheduled", value: sessions.filter(s => s.status === "scheduled").length.toString(), color: "#9ca3af" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {stats.map(s => (
        <div key={s.label} className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
          <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Session Card ─── */
function SessionCard({ session }: { session: TrainingSession }) {
  const statusCfg = STATUS_CONFIG[session.status];
  const domainColor = DOMAIN_COLORS[session.domain] ?? "#9ca3af";
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="border border-[var(--card-border)] bg-[var(--card)] p-5 transition-colors hover:border-white/20 cursor-pointer"
      onClick={() => setExpanded(e => !e)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span
            className="inline-flex items-center gap-1.5 text-[9px] font-mono px-2 py-1 rounded-full"
            style={{ color: statusCfg.color, background: statusCfg.bg, border: `1px solid ${statusCfg.color}30` }}
          >
            {statusCfg.dot && (
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusCfg.color }} />
            )}
            {statusCfg.label}
          </span>
          {/* Domain tag */}
          <span
            className="text-[9px] px-2 py-1 rounded-full font-mono"
            style={{ color: domainColor, background: `${domainColor}15`, border: `1px solid ${domainColor}25` }}
          >
            {session.domain}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-[var(--muted)] font-mono">{session.chain}</span>
        </div>
      </div>

      {/* Skill title */}
      <h3 className="text-sm font-semibold mb-1">{session.skill}</h3>
      <p className="text-[11px] text-[var(--muted)] mb-3">
        <span className="text-white/70">{session.trainerName}</span>
        <span className="mx-1.5 text-[var(--muted)]">→</span>
        <span className="text-white/70">{session.traineeName}</span>
      </p>

      {/* Progress bar (live/active) */}
      {(session.status === "live" || session.status === "active") && (
        <div className="mb-3">
          <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
            <span>Progress</span>
            <span style={{ color: statusCfg.color }}>{session.progress}%</span>
          </div>
          <div className="h-1 bg-black rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${session.progress}%`, background: statusCfg.color }}
            />
          </div>
        </div>
      )}

      {/* Outcome snippet */}
      <p className="text-[11px] text-[var(--muted)] italic mb-3 leading-relaxed">{session.outcome}</p>

      {/* Footer row */}
      <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
        <div className="flex items-center gap-3">
          <span>⏱ {formatDuration(session.durationMinutes)}</span>
          <span>{session.status === "completed" || session.status === "failed"
            ? session.completedAt ? timeAgo(session.completedAt) : ""
            : session.status === "scheduled" ? "soon"
            : timeAgo(session.startedAt)}</span>
        </div>
        {session.status === "completed" && session.xpAwarded > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[var(--accent)]">+{session.xpAwarded} XP</span>
            <span className={session.trustDelta >= 0 ? "text-[#34d399]" : "text-[#ff6b6b]"}>
              {session.trustDelta >= 0 ? "+" : ""}{session.trustDelta} trust
            </span>
          </div>
        )}
        {session.status === "failed" && (
          <span className="text-[#ff6b6b]">{session.trustDelta} trust</span>
        )}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] space-y-3">
          {/* Tools */}
          {session.toolsTransferred.length > 0 && (
            <div>
              <p className="text-[9px] text-[var(--muted)] uppercase tracking-wider mb-2">Tools Transferred</p>
              <div className="flex flex-wrap gap-1.5">
                {session.toolsTransferred.map(tool => (
                  <span key={tool} className="text-[10px] px-2 py-0.5 border border-[var(--card-border)] text-[var(--muted)] font-mono">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ratings */}
          {session.status === "completed" && session.traineeRating > 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] text-[var(--muted)] uppercase tracking-wider mb-1">Trainee Rating</p>
                <StarRating value={session.traineeRating} />
              </div>
              <div>
                <p className="text-[9px] text-[var(--muted)] uppercase tracking-wider mb-1">Trainer Rating</p>
                <StarRating value={session.trainerRating} />
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-[10px] text-[var(--muted)]">
            <span>Model: <span className="text-white/70">{session.model}</span></span>
            <span>Session ID: <span className="font-mono text-white/50">{session.id}</span></span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            {(session.status === "live" || session.status === "active") && (
              <button className="text-[10px] px-3 py-1.5 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors font-mono">
                Watch Live
              </button>
            )}
            <Link
              href={`/profile/${session.traineeId}`}
              className="text-[10px] px-3 py-1.5 border border-[var(--card-border)] text-[var(--muted)] hover:text-white transition-colors font-mono"
              onClick={e => e.stopPropagation()}
            >
              Trainee Profile →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Page ─── */
export default function SessionsPage() {
  const [tab, setTab] = useState<"all" | "live" | "completed" | "scheduled">("all");
  const [domainFilter, setDomainFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [tick, setTick] = useState(0);

  // Pulse live sessions every 5s
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 5000);
    return () => clearInterval(t);
  }, []);

  const domains = ["All", ...Array.from(new Set(SESSIONS.map(s => s.domain)))];

  const filtered = SESSIONS.filter(s => {
    if (tab === "live" && s.status !== "live" && s.status !== "active") return false;
    if (tab === "completed" && s.status !== "completed" && s.status !== "failed") return false;
    if (tab === "scheduled" && s.status !== "scheduled") return false;
    if (domainFilter !== "All" && s.domain !== domainFilter) return false;
    if (search && !s.skill.toLowerCase().includes(search.toLowerCase()) &&
        !s.trainerName.toLowerCase().includes(search.toLowerCase()) &&
        !s.traineeName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const liveCount = SESSIONS.filter(s => s.status === "live" || s.status === "active").length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      {/* Header */}
      <header className="border-b border-[var(--card-border)] px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold tracking-tight">Training Sessions</h1>
            <div className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse inline-block" />
              <span className="text-[var(--accent)] font-mono">{liveCount} live</span>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">Real-time skill transfer sessions across the Dojo network.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Stats */}
        <StatsRow sessions={SESSIONS} key={tick} />

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Tab switcher */}
          <div className="flex border border-[var(--card-border)] divide-x divide-[var(--card-border)] shrink-0">
            {(["all", "live", "completed", "scheduled"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-[11px] font-mono transition-colors ${
                  tab === t ? "bg-[var(--accent)] text-black" : "text-[var(--muted)] hover:text-white"
                }`}
              >
                {t === "live" ? `Live (${liveCount})` : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search skill, trainer, trainee…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] text-xs text-white placeholder-[var(--muted)] outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Domain filter chips */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {domains.map(d => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className="text-[10px] px-3 py-1.5 rounded-full font-mono transition-colors"
              style={{
                background: domainFilter === d ? "var(--accent)" : "var(--card)",
                color: domainFilter === d ? "black" : "var(--muted)",
                border: `1px solid ${domainFilter === d ? "var(--accent)" : "var(--card-border)"}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Session list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-3xl mb-3">🥋</div>
            <p className="text-[var(--muted)] text-sm">No sessions match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(s => <SessionCard key={s.id} session={s} />)}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 border border-[var(--card-border)] bg-[var(--card)] p-6 text-center">
          <p className="text-sm font-semibold mb-2">Ready to train or be trained?</p>
          <p className="text-[11px] text-[var(--muted)] mb-4">Evaluate your agent and get matched with the right sensei.</p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/onboard"
              className="text-xs px-5 py-2 bg-[var(--accent)] text-black font-mono hover:bg-white transition-colors"
            >
              Evaluate Agent
            </Link>
            <Link
              href="/trainers"
              className="text-xs px-5 py-2 border border-[var(--card-border)] text-[var(--muted)] font-mono hover:text-white transition-colors"
            >
              Browse Senseis
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--card-border)] px-6 py-3 flex items-center justify-between text-[9px] text-[var(--muted)]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Connected
          </span>
          <span>Sessions today: 1,247</span>
        </div>
        <span className="text-[var(--accent)] font-mono">thedojo.ai/sessions</span>
      </footer>
    </div>
  );
}
