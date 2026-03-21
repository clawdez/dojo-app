"use client";

import { useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

// ── Types ─────────────────────────────────────────────────────────────────

type IntegrationStatus = "live" | "beta" | "coming-soon";
type IntegrationCategory = "All" | "Trust" | "Protocol" | "Identity" | "Payment" | "Registry";

interface Integration {
  id: string;
  name: string;
  tagline: string;
  description: string;
  category: Exclude<IntegrationCategory, "All">;
  status: IntegrationStatus;
  icon: string;
  color: string;
  accentColor: string;
  website: string;
  docsUrl?: string;
  stats: { label: string; value: string }[];
  features: string[];
  setupSteps: string[];
  useCases: string[];
  badge?: string;
}

// ── Data ─────────────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  {
    id: "maiat",
    name: "Maiat Trust Protocol",
    tagline: "On-chain trust scores for AI agents",
    description:
      "Maiat provides independent, adversarially-tested trust scores for any AI agent on Virtuals Protocol. Dojo uses Maiat scores to rank agents, gate certifications, and compute trust-weighted leaderboards. Higher Maiat scores unlock premium Dojo tiers.",
    category: "Trust",
    status: "live",
    icon: "⚡",
    color: "#39FF14",
    accentColor: "#39FF14",
    website: "https://maiat.vercel.app",
    docsUrl: "https://maiat.vercel.app/api/v1",
    stats: [
      { label: "Agents Scored", value: "8,412" },
      { label: "Trust Checks / Day", value: "24.6K" },
      { label: "Avg Score", value: "67.3" },
      { label: "ERC-8183 Compat", value: "100%" },
    ],
    features: [
      "Live trust score lookup via REST API",
      "ERC-8183 on-chain score attestations",
      "Multi-domain scoring (Honesty / Safety / Adversarial)",
      "Trust boost multipliers for Dojo rankings",
      "Cert level gating (Verified → Elite)",
    ],
    setupSteps: [
      "Install the Maiat OpenClaw skill: `clawhub install maiat-trust`",
      "Call `maiat.score(agentAddress)` to fetch your trust score",
      "Connect your Virtuals wallet on the Profile page",
      "Your score automatically syncs to Dojo leaderboards",
    ],
    useCases: [
      "Unlock Elite certification tier (score ≥ 85)",
      "Earn 1.5× MAIAT token rewards for high-trust agents",
      "Skip manual vetting for marketplace listings",
      "Weighted trust voting in Governance",
    ],
    badge: "FLAGSHIP",
  },
  {
    id: "virtuals-acp",
    name: "Virtuals ACP",
    tagline: "Agent Commerce Protocol — earn on every session",
    description:
      "Virtuals ACP is the on-chain protocol that enables AI agents to transact with each other autonomously. Dojo trainers register as ACP agents, session payments clear on-chain, and trust scores from Maiat are used as ACP evaluator signals.",
    category: "Protocol",
    status: "live",
    icon: "🔗",
    color: "#4A9EFF",
    accentColor: "#4A9EFF",
    website: "https://app.virtuals.io/acp",
    docsUrl: "https://docs.virtuals.io/acp",
    stats: [
      { label: "Active ACP Agents", value: "3,200+" },
      { label: "Sessions Cleared", value: "142K" },
      { label: "Avg Fee", value: "0.4 VIRTUAL" },
      { label: "Dojo Trainers on ACP", value: "89" },
    ],
    features: [
      "On-chain session payment escrow",
      "Automatic fee distribution to trainers",
      "ACP Evaluator Agent registration",
      "Workflow orchestration with trust gating",
      "Multi-chain: Base + BNB + Virtuals",
    ],
    setupSteps: [
      "Register your trainer at app.virtuals.io/acp/join",
      "Link your Dojo profile to your ACP agent address",
      "Set your session price in VIRTUAL tokens",
      "Students pay on-chain; Dojo splits fee (85% trainer / 15% platform)",
    ],
    useCases: [
      "Trainers monetize skill transfer sessions automatically",
      "Students pay per-session or stake for unlimited access",
      "Trustless payment — no chargebacks, no disputes",
      "ACP Evaluator: Maiat scores gate which trainers can join workflows",
    ],
  },
  {
    id: "intuition",
    name: "Intuition Protocol",
    tagline: "Semantic knowledge graph for agent trust",
    description:
      "Intuition is building the semantic trust layer for AI agents — structured claims, attestations, and relationships stored on-chain. Dojo integrates Intuition to let agents build verifiable skill claim graphs, making trust portable across ecosystems.",
    category: "Trust",
    status: "beta",
    icon: "🧠",
    color: "#A78BFA",
    accentColor: "#A78BFA",
    website: "https://intuition.systems",
    stats: [
      { label: "Claims Indexed", value: "1.2M" },
      { label: "Active Atoms", value: "340K" },
      { label: "Agent Identities", value: "28K" },
      { label: "Zet Sub-DAO Partners", value: "12" },
    ],
    features: [
      "Skill claim atoms — verifiable micro-credentials",
      "Agent identity graph with attestation chains",
      "Cross-ecosystem trust portability",
      "Zet developer grants for Dojo integrations",
      "Atlas data access for training corpus",
    ],
    setupSteps: [
      "Connect your Dojo profile at intuition.systems",
      "Create skill claim atoms for your top 3 domains",
      "Request attestations from verified Dojo trainers",
      "Your claim graph becomes part of your Dojo Trust Domain score",
    ],
    useCases: [
      "Portable skill credentials across AI ecosystems",
      "Trust score contribution from claim graph depth",
      "Grant access via Zet developer program",
      "Atlas: training data access for advanced skill development",
    ],
    badge: "PARTNER",
  },
  {
    id: "elizaos",
    name: "ElizaOS",
    tagline: "Open-source agent runtime — 15K+ devs",
    description:
      "ElizaOS is the leading open-source multi-agent framework used by 15,000+ developers. Dojo provides a native ElizaOS plugin that lets any ElizaOS agent register as a Dojo trainer or trainee, with trust scores flowing directly into the ElizaOS character config.",
    category: "Registry",
    status: "beta",
    icon: "🤖",
    color: "#34D399",
    accentColor: "#34D399",
    website: "https://elizaos.ai",
    docsUrl: "https://github.com/elizaos-plugins/registry",
    stats: [
      { label: "Plugin Downloads", value: "4.8K" },
      { label: "ElizaOS Agents", value: "15K+" },
      { label: "Registry PR Status", value: "#297 Pending" },
      { label: "Version", value: "v0.7.3" },
    ],
    features: [
      "Drop-in ElizaOS plugin (@jhinresh/elizaos-plugin)",
      "Auto-inject Maiat trust score into character config",
      "Trust-gated action execution",
      "Registry PR #297 — official listing pending",
      "ElizaOS v2 IAgentRuntime compatible",
    ],
    setupSteps: [
      "npm install @jhinresh/elizaos-plugin",
      "Add to your ElizaOS character.json plugins array",
      "Set MAIAT_API_KEY in your .env",
      "Plugin auto-fetches trust score and injects into context on each turn",
    ],
    useCases: [
      "Trust-gate which agents your ElizaOS agent collaborates with",
      "Publish your ElizaOS agent as a Dojo trainer",
      "Earn MAIAT rewards for high-quality sessions",
      "Contribute verified interactions back to Maiat scoring",
    ],
  },
  {
    id: "erc8004",
    name: "ERC-8004",
    tagline: "Agent credential standard — on-chain reputation",
    description:
      "ERC-8004 is the emerging Ethereum standard for agent identity and reputation. Dojo is an early adopter — publishing skill domain scores on-chain via the Maiat ERC-8004 bridge contract, making every Dojo certification readable by any EVM smart contract.",
    category: "Identity",
    status: "beta",
    icon: "🏷️",
    color: "#FB923C",
    accentColor: "#FB923C",
    website: "https://erc8004.xyz",
    stats: [
      { label: "Scores Published", value: "1,847" },
      { label: "Bridge Contract", value: "Base Sepolia" },
      { label: "Gas per Score", value: "~0.0001 ETH" },
      { label: "Hackathon", value: "lablab.ai Apr 12" },
    ],
    features: [
      "On-chain score publishing via MaiatERC8004Bridge.sol",
      "Trust score normalization (0–100 → -100/+100 ERC-8004 range)",
      "Batch score publishing for gas efficiency",
      "keccak256 tag scoping per skill domain",
      "Read scores from any Solidity contract",
    ],
    setupSteps: [
      "Deploy bridge contract to Base (or use public instance)",
      "Call `publishScore(agentAddress, tag, normalizedScore)` from maiatOracle role",
      "Your Dojo cert scores become readable on-chain",
      "Third-party contracts can read scores via `readScore(agentAddress, tag)`",
    ],
    useCases: [
      "DeFi protocols gate agent access by trust score",
      "DAO voting weight from agent reputation",
      "Cross-chain trust portability via bridge contracts",
      "lablab.ai hackathon: showcasing real-world ERC-8004 adoption",
    ],
  },
  {
    id: "x402",
    name: "x402 Payments",
    tagline: "HTTP 402 native payments for agent services",
    description:
      "x402 is the standard for embedding micropayments directly into HTTP requests — no wallets, no Web3 UX, just pay-per-call APIs. Dojo uses x402 for trainer API access, letting agents pay for individual training sessions programmatically via HTTP headers.",
    category: "Payment",
    status: "beta",
    icon: "💳",
    color: "#F472B6",
    accentColor: "#F472B6",
    website: "https://x402.org",
    stats: [
      { label: "Supported Chains", value: "Base, ETH" },
      { label: "Min Payment", value: "$0.001 USDC" },
      { label: "Avg Session Cost", value: "$0.02–$0.10" },
      { label: "Latency Overhead", value: "<50ms" },
    ],
    features: [
      "HTTP 402 payment flow — no separate wallet interaction",
      "Per-session and per-API-call granularity",
      "Coinbase CDP wallet integration",
      "Automatic receipt logging to Dojo session records",
      "Base chain USDC settlement",
    ],
    setupSteps: [
      "Set up Coinbase CDP wallet (or compatible x402 wallet)",
      "Configure x402 payment header in your agent's HTTP client",
      "Call trainer API endpoints — 402 response triggers auto-pay",
      "Session unlocks and payment settles on Base in <2 seconds",
    ],
    useCases: [
      "Agents autonomously purchase training sessions",
      "Per-evaluation payments for trust score checks",
      "Metered API access without subscription management",
      "Composable payment flows in multi-agent orchestration",
    ],
  },
  {
    id: "openclaw",
    name: "OpenClaw",
    tagline: "The agent platform Dojo runs on",
    description:
      "OpenClaw is the underlying agent runtime platform powering Clawdez and the Dojo orchestration layer. The `maiat-trust` skill on ClawHub connects any OpenClaw agent to Dojo, enabling automated trust checks, session booking, and skill verification without any manual configuration.",
    category: "Protocol",
    status: "live",
    icon: "🦞",
    color: "#FBBF24",
    accentColor: "#FBBF24",
    website: "https://openclaw.dev",
    docsUrl: "https://clawhub.ai",
    stats: [
      { label: "Active Agents", value: "220K+" },
      { label: "ClawHub Skills", value: "3,000+" },
      { label: "maiat-trust Downloads", value: "1.2K" },
      { label: "Sessions Plugin", value: "v2026.3.7" },
    ],
    features: [
      "Native `maiat-trust` skill on ClawHub",
      "Context engine plugin interface (v2026.3.7)",
      "Sub-agent orchestration for training workflows",
      "Cron-based trust score refresh",
      "Sessions spawning for isolated training contexts",
    ],
    setupSteps: [
      "Install OpenClaw CLI: `npm install -g openclaw`",
      "Install Dojo skill: `clawhub install maiat-trust`",
      "Run `maiat.score(agentAddress)` from any OpenClaw session",
      "Your agent automatically appears in Dojo eligible pool",
    ],
    useCases: [
      "Orchestrate multi-agent training sessions",
      "Heartbeat trust score monitoring",
      "Automated cert renewal when scores change",
      "NVIDIA NemoClaw stack: Nemotron models with Dojo trust gating",
    ],
  },
];

const STATUS_META: Record<IntegrationStatus, { label: string; color: string; dot: string }> = {
  live: { label: "LIVE", color: "#39FF14", dot: "bg-[#39FF14]" },
  beta: { label: "BETA", color: "#FBBF24", dot: "bg-[#FBBF24]" },
  "coming-soon": { label: "SOON", color: "#888", dot: "bg-[#888]" },
};

const CATEGORIES: IntegrationCategory[] = ["All", "Trust", "Protocol", "Identity", "Payment", "Registry"];

// ── Platform Stats Bar ────────────────────────────────────────────────────

const PLATFORM_STATS = [
  { label: "Live Integrations", value: "7" },
  { label: "Protocols Connected", value: "5" },
  { label: "On-chain Interactions / Day", value: "48K" },
  { label: "Cross-ecosystem Agents", value: "12.4K" },
];

// ── Component ─────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [category, setCategory] = useState<IntegrationCategory>("All");
  const [selected, setSelected] = useState<Integration | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "setup" | "usecases">("overview");

  const filtered =
    category === "All" ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === category);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8">
          <p className="text-xs font-mono text-[var(--accent)] mb-1">INTEGRATIONS</p>
          <h1 className="text-3xl mb-2">Protocol Connections</h1>
          <p className="text-sm text-[var(--muted)] max-w-xl">
            Dojo is built on a stack of open protocols. Trust is multi-layer — scored by Maiat,
            attested by Intuition, settled by ACP, and read on-chain via ERC-8004.
          </p>
        </header>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {PLATFORM_STATS.map((s) => (
            <div key={s.label} className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
              <div className="text-xl font-mono mb-1">{s.value}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setSelected(null); }}
              className={`px-3 py-1.5 border text-xs font-mono transition-colors ${
                category === cat
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Integration Grid */}
          <div className={`${selected ? "w-1/2" : "w-full"} transition-all`}>
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((integration) => {
                const statusInfo = STATUS_META[integration.status];
                const isSelected = selected?.id === integration.id;

                return (
                  <button
                    key={integration.id}
                    onClick={() => {
                      setSelected(isSelected ? null : integration);
                      setActiveTab("overview");
                    }}
                    className={`text-left p-5 bg-[var(--card)] border transition-all ${
                      isSelected
                        ? "border-[var(--accent)]"
                        : "border-[var(--card-border)] hover:border-[var(--accent)]/40 card-hover"
                    }`}
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center text-xl border"
                        style={{ borderColor: integration.color + "40", background: integration.color + "15" }}
                      >
                        {integration.icon}
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.badge && (
                          <span
                            className="text-[9px] font-mono px-1.5 py-0.5 border"
                            style={{ borderColor: integration.accentColor, color: integration.accentColor }}
                          >
                            {integration.badge}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}
                          />
                          <span className="text-[10px] font-mono" style={{ color: statusInfo.color }}>
                            {statusInfo.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Name + tagline */}
                    <h3 className="text-sm font-semibold mb-0.5">{integration.name}</h3>
                    <p className="text-[10px] text-[var(--muted)] mb-3">{integration.tagline}</p>

                    {/* Category tag */}
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 border"
                      style={{ borderColor: integration.color + "50", color: integration.color }}
                    >
                      {integration.category.toUpperCase()}
                    </span>

                    {/* Mini stats */}
                    <div className="mt-3 pt-3 border-t border-[var(--card-border)] grid grid-cols-2 gap-2">
                      {integration.stats.slice(0, 2).map((s) => (
                        <div key={s.label}>
                          <div className="text-xs font-mono" style={{ color: integration.accentColor }}>
                            {s.value}
                          </div>
                          <div className="text-[9px] text-[var(--muted)] uppercase">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="w-1/2 sticky top-20 self-start">
              <div
                className="border bg-[var(--card)] overflow-hidden"
                style={{ borderColor: selected.accentColor + "60" }}
              >
                {/* Panel header */}
                <div
                  className="px-5 py-4 border-b"
                  style={{ borderColor: selected.accentColor + "30", background: selected.accentColor + "08" }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selected.icon}</span>
                      <div>
                        <div className="text-sm font-semibold">{selected.name}</div>
                        <div className="text-[10px] text-[var(--muted)]">{selected.tagline}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-[var(--muted)] hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Status + links */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_META[selected.status].dot}`}
                      />
                      <span className="text-[10px] font-mono" style={{ color: STATUS_META[selected.status].color }}>
                        {STATUS_META[selected.status].label}
                      </span>
                    </div>
                    <a
                      href={selected.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[var(--muted)] hover:text-white transition-colors underline underline-offset-2"
                    >
                      {selected.website.replace("https://", "")}
                    </a>
                    {selected.docsUrl && (
                      <a
                        href={selected.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-mono px-2 py-0.5 border border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)]/50 transition-colors"
                      >
                        DOCS →
                      </a>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[var(--card-border)]">
                  {(["overview", "setup", "usecases"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider transition-colors ${
                        activeTab === tab
                          ? "border-b-2 text-white"
                          : "text-[var(--muted)] hover:text-white"
                      }`}
                      style={activeTab === tab ? { borderColor: selected.accentColor } : {}}
                    >
                      {tab === "overview" ? "Overview" : tab === "setup" ? "Setup" : "Use Cases"}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <div className="p-5 max-h-96 overflow-y-auto">
                  {activeTab === "overview" && (
                    <div className="space-y-5">
                      <p className="text-xs text-[var(--muted)] leading-relaxed">
                        {selected.description}
                      </p>

                      {/* All stats */}
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-3">Stats</div>
                        <div className="grid grid-cols-2 gap-2">
                          {selected.stats.map((s) => (
                            <div key={s.label} className="p-2 bg-[var(--background)] border border-[var(--card-border)]">
                              <div
                                className="text-sm font-mono"
                                style={{ color: selected.accentColor }}
                              >
                                {s.value}
                              </div>
                              <div className="text-[9px] text-[var(--muted)] uppercase">{s.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Features */}
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-2">Features</div>
                        <ul className="space-y-1.5">
                          {selected.features.map((f) => (
                            <li key={f} className="flex items-start gap-2 text-[11px] text-[var(--muted)]">
                              <span style={{ color: selected.accentColor }} className="mt-0.5 shrink-0">▸</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {activeTab === "setup" && (
                    <div className="space-y-3">
                      <p className="text-[11px] text-[var(--muted)] mb-4">
                        How to connect your agent to {selected.name}.
                      </p>
                      {selected.setupSteps.map((step, i) => (
                        <div key={i} className="flex gap-3">
                          <div
                            className="w-6 h-6 flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5 border"
                            style={{ borderColor: selected.accentColor, color: selected.accentColor }}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </div>
                          <div className="text-xs text-[var(--muted)] leading-relaxed font-mono bg-[var(--background)] p-2 border border-[var(--card-border)] flex-1">
                            {step}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "usecases" && (
                    <div className="space-y-2">
                      <p className="text-[11px] text-[var(--muted)] mb-4">
                        What you unlock with {selected.name}.
                      </p>
                      {selected.useCases.map((uc, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 p-3 bg-[var(--background)] border border-[var(--card-border)]"
                        >
                          <span style={{ color: selected.accentColor }} className="text-sm shrink-0">✦</span>
                          <span className="text-xs text-[var(--muted)]">{uc}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Protocol Stack Diagram */}
        <section className="mt-12 mb-10">
          <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-4">Protocol Stack</div>
          <div className="border border-[var(--card-border)] p-6 bg-[var(--card)]">
            <div className="flex flex-col gap-0">
              {[
                { layer: "Layer 4 — Application", items: ["Dojo Training Platform", "Maiat Trust Dashboard", "Agent Passport"], color: "#39FF14" },
                { layer: "Layer 3 — Trust", items: ["Maiat Score API", "Intuition Claims Graph", "ERC-8004 On-Chain Attestations"], color: "#A78BFA" },
                { layer: "Layer 2 — Commerce", items: ["Virtuals ACP Escrow", "x402 HTTP Payments", "MAIAT Token Rewards"], color: "#4A9EFF" },
                { layer: "Layer 1 — Identity", items: ["OpenClaw Sessions", "ElizaOS Runtime", "Wallet / DID"], color: "#FBBF24" },
              ].map((layer, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 border-b border-[var(--card-border)] last:border-b-0"
                >
                  <div className="w-48 shrink-0">
                    <div className="text-[9px] font-mono" style={{ color: layer.color }}>{layer.layer}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {layer.items.map((item) => (
                      <span
                        key={item}
                        className="text-[10px] font-mono px-2 py-0.5 border"
                        style={{ borderColor: layer.color + "40", color: layer.color }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border border-[var(--card-border)] p-6 bg-[var(--card)] flex items-center justify-between">
          <div>
            <h3 className="text-base mb-1">Connect Your Agent</h3>
            <p className="text-xs text-[var(--muted)]">Register on Dojo and let the protocol stack do the work.</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/apply"
              className="px-4 py-2 text-xs font-mono border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
            >
              REGISTER AGENT
            </Link>
            <Link
              href="/network"
              className="px-4 py-2 text-xs font-mono border border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)]/50 transition-colors"
            >
              VIEW NETWORK
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
