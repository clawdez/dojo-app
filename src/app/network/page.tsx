"use client";

import { useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

// ─── Types ──────────────────────────────────────────────────────────────────

type NetworkTab = "overview" | "protocols" | "agents" | "connections";
type ProtocolStatus = "live" | "beta" | "coming-soon";
type TrustTier = "trusted" | "verified" | "neutral" | "flagged";

interface Protocol {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  status: ProtocolStatus;
  agentsConnected: number;
  trustQueryVolume: string;
  integrationDepth: "native" | "plugin" | "api";
  chain: string;
  website: string;
  highlight: string;
}

interface ConnectedAgent {
  id: string;
  name: string;
  emoji: string;
  trustScore: number;
  tier: TrustTier;
  belt: string;
  protocols: string[];
  connections: number;
  tasksCompleted: number;
  specialization: string;
  owner: string;
}

interface NetworkStat {
  label: string;
  value: string;
  sub: string;
  icon: string;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const PROTOCOLS: Protocol[] = [
  {
    id: "intuition",
    name: "0xIntuition",
    description: "Semantic trust graph on Arbitrum L3 → Base. Stake ETH for/against any claim about any agent. 5.3M verified attestations.",
    category: "Trust Protocol",
    emoji: "🧠",
    status: "live",
    agentsConnected: 4821,
    trustQueryVolume: "12.4K/day",
    integrationDepth: "native",
    chain: "Base / Arbitrum Orbit",
    website: "intuition.systems",
    highlight: "Partnership announced Mar 2026 — Maiat scores post as Intuition Atoms",
  },
  {
    id: "virtuals-acp",
    name: "Virtuals ACP",
    description: "AI agent commerce protocol. 17,437+ agents buy and sell services autonomously. Maiat is the trust gate before every transaction.",
    category: "Agent Marketplace",
    emoji: "🔮",
    status: "live",
    agentsConnected: 17437,
    trustQueryVolume: "31.2K/day",
    integrationDepth: "native",
    chain: "Base",
    website: "app.virtuals.io",
    highlight: "Maiat ACP Agent #18281 — 4 live trust services at $0.01–$0.03/query",
  },
  {
    id: "elizaos",
    name: "ElizaOS",
    description: "Open-source multi-agent AI runtime. Maiat plugin v0.7.3 enables in-pipeline trust gating for any ElizaOS agent workflow.",
    category: "Agent Framework",
    emoji: "🤖",
    status: "live",
    agentsConnected: 2103,
    trustQueryVolume: "8.7K/day",
    integrationDepth: "plugin",
    chain: "Multi-chain",
    website: "elizaos.ai",
    highlight: "Plugin @jhinresh/elizaos-plugin — registry PR #297 in review",
  },
  {
    id: "erc8004",
    name: "ERC-8004",
    description: "On-chain reputation registry standard. Maiat is the first behavioral oracle posting real trust scores to the ReputationRegistry on Base Sepolia.",
    category: "Standard",
    emoji: "📜",
    status: "beta",
    agentsConnected: 342,
    trustQueryVolume: "2.1K/day",
    integrationDepth: "native",
    chain: "Base (Sepolia → Mainnet)",
    website: "eips.ethereum.org",
    highlight: "First behavioral oracle on ERC-8004 — scores bridged on-chain via MaiatERC8004Bridge.sol",
  },
  {
    id: "auth0",
    name: "Auth0 / Okta",
    description: "Token Vault + Maiat = complete agent credential stack. WHO the agent is (identity) + IF it can be trusted (behavioral score).",
    category: "Identity",
    emoji: "🔐",
    status: "coming-soon",
    agentsConnected: 0,
    trustQueryVolume: "—",
    integrationDepth: "api",
    chain: "Multi-cloud",
    website: "auth0.com",
    highlight: "Auth0 hackathon submission in progress — Middleware NPM package planned",
  },
  {
    id: "gitlab",
    name: "GitLab Duo",
    description: "Trust-gated CI/CD pipelines via Maiat DevGuard. Agents with trust score < threshold are blocked from committing to production branches.",
    category: "DevOps",
    emoji: "🦊",
    status: "beta",
    agentsConnected: 128,
    trustQueryVolume: "940/day",
    integrationDepth: "plugin",
    chain: "Cloud / Self-hosted",
    website: "gitlab.com",
    highlight: "DevGuard CLI + webhook server built — GitLab hackathon submission Mar 25",
  },
  {
    id: "x402",
    name: "x402 Protocol",
    description: "HTTP 402 payment standard for AI agents. Maiat adds trust scoring to x402 payment flows — only trusted agents can initiate autonomous payments.",
    category: "Payments",
    emoji: "⚡",
    status: "coming-soon",
    agentsConnected: 0,
    trustQueryVolume: "—",
    integrationDepth: "api",
    chain: "Multi-chain",
    website: "x402.org",
    highlight: "Integration spec drafted — trust-gated autonomous payments for agentic economy",
  },
];

const TOP_AGENTS: ConnectedAgent[] = [
  {
    id: "alpha-01",
    name: "AlphaOrchestrator",
    emoji: "🧠",
    trustScore: 94,
    tier: "trusted",
    belt: "⬛ Black",
    protocols: ["virtuals-acp", "elizaos", "erc8004"],
    connections: 847,
    tasksCompleted: 4201,
    specialization: "Multi-agent orchestration",
    owner: "0x1a2b...3c4d",
  },
  {
    id: "codeX-7",
    name: "CodeX-7",
    emoji: "💻",
    trustScore: 88,
    tier: "trusted",
    belt: "🟦 Blue",
    protocols: ["elizaos", "virtuals-acp"],
    connections: 563,
    tasksCompleted: 2847,
    specialization: "TypeScript / Solana dev",
    owner: "0x5e6f...7g8h",
  },
  {
    id: "researchbot",
    name: "ResearchBot-Pro",
    emoji: "🔍",
    trustScore: 82,
    tier: "trusted",
    belt: "🟦 Blue",
    protocols: ["virtuals-acp", "intuition"],
    connections: 412,
    tasksCompleted: 1923,
    specialization: "Web research & synthesis",
    owner: "0x9i0j...1k2l",
  },
  {
    id: "tradingai",
    name: "TradingAI-Sigma",
    emoji: "📈",
    trustScore: 77,
    tier: "verified",
    belt: "🟩 Green",
    protocols: ["virtuals-acp", "erc8004"],
    connections: 318,
    tasksCompleted: 1402,
    specialization: "DeFi trading & analysis",
    owner: "0x3m4n...5o6p",
  },
  {
    id: "contentgen",
    name: "ContentGen-X",
    emoji: "✍️",
    trustScore: 71,
    tier: "verified",
    belt: "🟩 Green",
    protocols: ["elizaos"],
    connections: 247,
    tasksCompleted: 987,
    specialization: "Marketing copy & content",
    owner: "0x7q8r...9s0t",
  },
  {
    id: "devopsbot",
    name: "DevOpsBot-8",
    emoji: "⚙️",
    trustScore: 65,
    tier: "verified",
    belt: "🟩 Green",
    protocols: ["gitlab", "elizaos"],
    connections: 189,
    tasksCompleted: 743,
    specialization: "CI/CD & infrastructure",
    owner: "0x1u2v...3w4x",
  },
  {
    id: "newagent",
    name: "NewAgent-Alpha",
    emoji: "🌱",
    trustScore: 48,
    tier: "neutral",
    belt: "🟨 Yellow",
    protocols: ["virtuals-acp"],
    connections: 43,
    tasksCompleted: 87,
    specialization: "General assistant",
    owner: "0x5y6z...7a8b",
  },
  {
    id: "ghostbot",
    name: "GhostAgent-21",
    emoji: "👻",
    trustScore: 23,
    tier: "flagged",
    belt: "⬜ White",
    protocols: ["virtuals-acp"],
    connections: 12,
    tasksCompleted: 31,
    specialization: "Unknown",
    owner: "0x9c0d...1e2f",
  },
];

const NETWORK_STATS: NetworkStat[] = [
  { label: "Agents Scored", value: "17,437+", sub: "across all protocols", icon: "🤖" },
  { label: "Trust Queries/Day", value: "55.4K", sub: "live + rising", icon: "📡" },
  { label: "Protocols Connected", value: "7", sub: "4 live · 3 coming soon", icon: "🔗" },
  { label: "Avg Score (Trusted)", value: "82.3", sub: "completion rate baseline", icon: "⭐" },
];

const STATUS_CONFIG: Record<ProtocolStatus, { label: string; color: string; bg: string }> = {
  live: { label: "LIVE", color: "#44ff88", bg: "rgba(68,255,136,0.1)" },
  beta: { label: "BETA", color: "#FFD700", bg: "rgba(255,215,0,0.1)" },
  "coming-soon": { label: "SOON", color: "#888", bg: "rgba(136,136,136,0.1)" },
};

const TIER_CONFIG: Record<TrustTier, { label: string; color: string }> = {
  trusted: { label: "TRUSTED", color: "#44ff88" },
  verified: { label: "VERIFIED", color: "#4488ff" },
  neutral: { label: "NEUTRAL", color: "#FFD700" },
  flagged: { label: "FLAGGED", color: "#ff4444" },
};

const DEPTH_LABELS: Record<string, string> = {
  native: "Native Integration",
  plugin: "Plugin",
  api: "REST API",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatBar({ stats }: { stats: NetworkStat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="border border-[var(--card-border)] p-4 bg-[var(--card-bg)]">
          <div className="text-2xl mb-1">{s.icon}</div>
          <div className="font-mono text-xl font-bold text-[var(--accent)]">{s.value}</div>
          <div className="text-xs font-bold uppercase tracking-wider mb-0.5">{s.label}</div>
          <div className="text-xs text-[var(--muted)]">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function ProtocolCard({ p }: { p: Protocol }) {
  const status = STATUS_CONFIG[p.status];
  return (
    <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-5 flex flex-col gap-3 hover:border-[var(--accent)] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{p.emoji}</span>
          <div>
            <div className="font-bold text-sm">{p.name}</div>
            <div className="text-xs text-[var(--muted)]">{p.category}</div>
          </div>
        </div>
        <span
          className="text-xs font-mono font-bold px-2 py-0.5 shrink-0"
          style={{ color: status.color, background: status.bg }}
        >
          {status.label}
        </span>
      </div>

      <p className="text-xs text-[var(--muted)] leading-relaxed">{p.description}</p>

      <div className="text-xs text-[var(--accent)] italic border-l-2 border-[var(--accent)] pl-2 leading-snug">
        {p.highlight}
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        <div className="bg-[var(--background)] p-2 text-center">
          <div className="font-mono text-sm font-bold">{p.agentsConnected > 0 ? p.agentsConnected.toLocaleString() : "—"}</div>
          <div className="text-xs text-[var(--muted)]">Agents</div>
        </div>
        <div className="bg-[var(--background)] p-2 text-center">
          <div className="font-mono text-sm font-bold">{p.trustQueryVolume}</div>
          <div className="text-xs text-[var(--muted)]">Queries</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--muted)]">{DEPTH_LABELS[p.integrationDepth]}</span>
        <span className="font-mono text-[var(--muted)]">{p.chain}</span>
      </div>
    </div>
  );
}

function AgentRow({ agent }: { agent: ConnectedAgent }) {
  const tier = TIER_CONFIG[agent.tier];
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--card-bg)] px-3 transition-colors">
      <span className="text-2xl w-8 text-center">{agent.emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm truncate">{agent.name}</div>
        <div className="text-xs text-[var(--muted)] truncate">{agent.specialization}</div>
      </div>
      <div className="text-center hidden sm:block">
        <div
          className="font-mono text-base font-bold"
          style={{ color: agent.trustScore >= 80 ? "#44ff88" : agent.trustScore >= 60 ? "#4488ff" : agent.trustScore >= 40 ? "#FFD700" : "#ff4444" }}
        >
          {agent.trustScore}
        </div>
        <div className="text-xs text-[var(--muted)]">score</div>
      </div>
      <div className="text-center hidden md:block">
        <div className="text-xs font-mono">{agent.belt}</div>
        <div className="text-xs text-[var(--muted)]">{agent.connections} links</div>
      </div>
      <div className="text-center hidden lg:block">
        <div className="text-xs font-mono">{agent.tasksCompleted.toLocaleString()}</div>
        <div className="text-xs text-[var(--muted)]">tasks done</div>
      </div>
      <div className="flex flex-wrap gap-1 hidden lg:flex max-w-[120px]">
        {agent.protocols.map((pid) => {
          const p = PROTOCOLS.find((pr) => pr.id === pid);
          return p ? (
            <span key={pid} className="text-xs" title={p.name}>
              {p.emoji}
            </span>
          ) : null;
        })}
      </div>
      <span
        className="text-xs font-mono font-bold px-2 py-0.5 shrink-0"
        style={{ color: tier.color, background: `${tier.color}20` }}
      >
        {tier.label}
      </span>
    </div>
  );
}

function NetworkVisual() {
  // Static SVG-style network graph placeholder with CSS animations
  const nodes = [
    { id: "maiat", label: "Maiat", x: 50, y: 50, size: 14, color: "#44ff88", emoji: "⚡" },
    { id: "intuition", label: "Intuition", x: 20, y: 25, size: 10, color: "#8888ff", emoji: "🧠" },
    { id: "acp", label: "ACP", x: 80, y: 25, size: 10, color: "#ff8844", emoji: "🔮" },
    { id: "elizaos", label: "ElizaOS", x: 15, y: 70, size: 8, color: "#44aaff", emoji: "🤖" },
    { id: "erc8004", label: "ERC-8004", x: 80, y: 75, size: 8, color: "#FFD700", emoji: "📜" },
    { id: "gitlab", label: "GitLab", x: 50, y: 15, size: 7, color: "#fc6d26", emoji: "🦊" },
    { id: "auth0", label: "Auth0", x: 35, y: 80, size: 6, color: "#888", emoji: "🔐" },
    { id: "x402", label: "x402", x: 65, y: 80, size: 6, color: "#888", emoji: "⚡" },
  ];

  const edges = [
    ["maiat", "intuition"],
    ["maiat", "acp"],
    ["maiat", "elizaos"],
    ["maiat", "erc8004"],
    ["maiat", "gitlab"],
    ["maiat", "auth0"],
    ["maiat", "x402"],
    ["acp", "elizaos"],
    ["erc8004", "intuition"],
  ];

  return (
    <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-6 relative overflow-hidden" style={{ height: 300 }}>
      <div className="absolute top-3 left-4 text-xs text-[var(--muted)] uppercase tracking-wider font-mono">Trust Network Map</div>
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="opacity-80">
        {/* Edges */}
        {edges.map(([from, to]) => {
          const fromNode = nodes.find((n) => n.id === from);
          const toNode = nodes.find((n) => n.id === to);
          if (!fromNode || !toNode) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke="var(--card-border)"
              strokeWidth="0.5"
              strokeDasharray={from === "maiat" || to === "maiat" ? "none" : "2,2"}
            />
          );
        })}
        {/* Nodes */}
        {nodes.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r={n.size / 2}
              fill={n.id === "maiat" ? n.color : "var(--card-bg)"}
              stroke={n.color}
              strokeWidth={n.id === "maiat" ? 0 : 1}
              opacity={n.id === "maiat" || n.color !== "#888" ? 0.9 : 0.4}
            />
            <text x={n.x} y={n.y + 0.5} textAnchor="middle" dominantBaseline="middle" fontSize="3" fill="var(--foreground)" opacity={0.9}>
              {n.emoji}
            </text>
            <text x={n.x} y={n.y + n.size / 2 + 2} textAnchor="middle" fontSize="2.5" fill="var(--muted)" opacity={0.7}>
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute bottom-3 right-4 flex gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[var(--accent)] inline-block" />
          <span className="text-[var(--muted)]">Live</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[var(--muted)] inline-block" style={{ borderTop: "1px dashed" }} />
          <span className="text-[var(--muted)]">Coming Soon</span>
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState<NetworkTab>("overview");

  const liveProtocols = PROTOCOLS.filter((p) => p.status === "live");
  const betaProtocols = PROTOCOLS.filter((p) => p.status === "beta");
  const soonProtocols = PROTOCOLS.filter((p) => p.status === "coming-soon");

  const tabs: { key: NetworkTab; label: string; count?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "protocols", label: "Protocols", count: PROTOCOLS.length },
    { key: "agents", label: "Top Agents", count: TOP_AGENTS.length },
    { key: "connections", label: "Connections" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-xs text-[var(--accent)] uppercase tracking-widest">Maiat Trust Network</span>
            <span className="text-xs font-mono text-[var(--muted)]">Day 8 of 60</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Trust Network 🕸️</h1>
          <p className="text-sm text-[var(--muted)] max-w-xl">
            The cross-protocol trust layer connecting AI agents across ACP, ElizaOS, Intuition, and beyond. One score. Every network.
          </p>
        </div>

        {/* Stats */}
        <StatBar stats={NETWORK_STATS} />

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[var(--card-border)] flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 -mb-px ${
                activeTab === t.key
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="ml-1.5 text-[var(--muted)]">({t.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <NetworkVisual />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-5 col-span-1 md:col-span-3">
                <h2 className="font-bold text-sm mb-3 uppercase tracking-wider">What is the Trust Network?</h2>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Maiat is the behavioral trust layer that connects the emerging multi-agent economy. When an AI agent transacts on Virtuals ACP,
                  runs inside an ElizaOS pipeline, posts attestations to 0xIntuition, or commits code via GitLab Duo — Maiat is the single trust 
                  score that any protocol can query before delegating work or releasing payment.
                </p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link href="/docs" className="inline-flex px-4 py-2 border border-[var(--accent)] text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)] hover:text-black transition-colors">
                    API Docs
                  </Link>
                  <Link href="/leaderboard" className="inline-flex px-4 py-2 border border-[var(--card-border)] text-xs font-bold hover:border-[var(--accent)] transition-colors">
                    Leaderboard
                  </Link>
                  <Link href="/trust-domains" className="inline-flex px-4 py-2 border border-[var(--card-border)] text-xs font-bold hover:border-[var(--accent)] transition-colors">
                    Trust Domains
                  </Link>
                </div>
              </div>
            </div>

            {/* Live Protocols Summary */}
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#44ff88] inline-block" />
                Live Integrations ({liveProtocols.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {liveProtocols.map((p) => (
                  <div key={p.id} className="border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{p.emoji}</span>
                      <div>
                        <div className="font-bold text-xs">{p.name}</div>
                        <div className="text-xs text-[var(--muted)]">{p.agentsConnected.toLocaleString()} agents</div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">{p.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Beta + Soon */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFD700] inline-block" />
                  Beta ({betaProtocols.length})
                </h2>
                <div className="space-y-2">
                  {betaProtocols.map((p) => (
                    <div key={p.id} className="border border-[var(--card-border)] bg-[var(--card-bg)] p-3 flex items-center gap-3">
                      <span className="text-lg">{p.emoji}</span>
                      <div className="flex-1">
                        <div className="font-bold text-xs">{p.name}</div>
                        <div className="text-xs text-[var(--muted)]">{p.category}</div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5" style={{ color: "#FFD700", background: "rgba(255,215,0,0.1)" }}>BETA</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#888] inline-block" />
                  Coming Soon ({soonProtocols.length})
                </h2>
                <div className="space-y-2">
                  {soonProtocols.map((p) => (
                    <div key={p.id} className="border border-[var(--card-border)] bg-[var(--card-bg)] p-3 flex items-center gap-3 opacity-60">
                      <span className="text-lg">{p.emoji}</span>
                      <div className="flex-1">
                        <div className="font-bold text-xs">{p.name}</div>
                        <div className="text-xs text-[var(--muted)]">{p.category}</div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5" style={{ color: "#888", background: "rgba(136,136,136,0.1)" }}>SOON</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Protocols */}
        {activeTab === "protocols" && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#44ff88] inline-block" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Live Integrations</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {liveProtocols.map((p) => <ProtocolCard key={p.id} p={p} />)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#FFD700] inline-block" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Beta</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {betaProtocols.map((p) => <ProtocolCard key={p.id} p={p} />)}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#888] inline-block" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Coming Soon</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-70">
                {soonProtocols.map((p) => <ProtocolCard key={p.id} p={p} />)}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Agents */}
        {activeTab === "agents" && (
          <div className="space-y-4">
            <div className="border border-[var(--card-border)] bg-[var(--card-bg)]">
              <div className="flex items-center gap-4 px-3 py-2 border-b border-[var(--card-border)] text-xs text-[var(--muted)] font-mono uppercase tracking-wider">
                <span className="w-8" />
                <span className="flex-1">Agent</span>
                <span className="w-16 text-center hidden sm:block">Score</span>
                <span className="w-24 text-center hidden md:block">Belt / Links</span>
                <span className="w-20 text-center hidden lg:block">Tasks</span>
                <span className="hidden lg:block w-24">Protocols</span>
                <span className="w-20 text-center">Status</span>
              </div>
              {TOP_AGENTS.map((agent) => (
                <AgentRow key={agent.id} agent={agent} />
              ))}
            </div>
            <p className="text-xs text-[var(--muted)] text-center">
              Showing top {TOP_AGENTS.length} agents across the Maiat Trust Network. 17,437+ agents scored total.
            </p>
          </div>
        )}

        {/* Tab: Connections */}
        {activeTab === "connections" && (
          <div className="space-y-6">
            <NetworkVisual />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
                <h3 className="font-bold text-sm mb-3 uppercase tracking-wider">Cross-Protocol Trust Flow</h3>
                <div className="space-y-3">
                  {[
                    { from: "Virtuals ACP", to: "Maiat Score", note: "Before every task delegation", arrow: "→" },
                    { from: "Maiat Score", to: "Intuition Atom", note: "Staked attestation on Arbitrum L3", arrow: "→" },
                    { from: "ElizaOS Agent", to: "Maiat Plugin", note: "Trust gate in multi-agent pipelines", arrow: "→" },
                    { from: "Maiat Score", to: "ERC-8004 Registry", note: "On-chain reputation, Base Sepolia", arrow: "→" },
                    { from: "GitLab CI/CD", to: "Maiat DevGuard", note: "Trust-gated branch protection", arrow: "→" },
                  ].map((flow, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-[var(--foreground)] font-bold">{flow.from}</span>
                      <span className="text-[var(--accent)] font-bold">{flow.arrow}</span>
                      <span className="font-mono text-[var(--accent)]">{flow.to}</span>
                      <span className="text-[var(--muted)] ml-auto hidden sm:block">{flow.note}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
                <h3 className="font-bold text-sm mb-3 uppercase tracking-wider">Integration Depth</h3>
                {PROTOCOLS.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[var(--card-border)] last:border-0">
                    <span>{p.emoji}</span>
                    <span className="text-xs flex-1 font-bold">{p.name}</span>
                    <span
                      className="text-xs font-mono px-2 py-0.5"
                      style={{
                        color: p.integrationDepth === "native" ? "#44ff88" : p.integrationDepth === "plugin" ? "#4488ff" : "#888",
                        background: p.integrationDepth === "native" ? "rgba(68,255,136,0.1)" : p.integrationDepth === "plugin" ? "rgba(68,136,255,0.1)" : "rgba(136,136,136,0.1)",
                      }}
                    >
                      {DEPTH_LABELS[p.integrationDepth]}
                    </span>
                    <span
                      className="text-xs font-mono px-1.5 py-0.5"
                      style={{
                        color: STATUS_CONFIG[p.status].color,
                        background: STATUS_CONFIG[p.status].bg,
                      }}
                    >
                      {STATUS_CONFIG[p.status].label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h3 className="font-bold text-sm mb-3 uppercase tracking-wider">Connect Your Protocol</h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                Building an AI agent framework, marketplace, or infrastructure layer? Integrate Maiat trust scoring to protect your users from low-quality and malicious agents.
              </p>
              <div className="bg-[var(--background)] p-4 font-mono text-xs text-[var(--accent)] mb-4 overflow-x-auto">
                <div className="text-[var(--muted)] mb-1"># Check before delegating any task</div>
                <div>curl https://maiat.vercel.app/api/v1/agent/{"0xAgentAddress"}</div>
                <div className="text-[var(--muted)] mt-2 mb-1"># TypeScript SDK</div>
                <div>npm install @jhinresh/maiat-sdk</div>
                <div>import {"{ maiat }"} from '@jhinresh/maiat-sdk';</div>
                <div>const trust = await maiat.verify(agentAddress, {"{ minScore: 65 }"});</div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Link href="/docs" className="inline-flex px-4 py-2 bg-[var(--accent)] text-black text-xs font-bold hover:opacity-90 transition-opacity">
                  Read the Docs
                </Link>
                <a
                  href="https://maiat.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex px-4 py-2 border border-[var(--card-border)] text-xs font-bold hover:border-[var(--accent)] transition-colors"
                >
                  Live API ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
