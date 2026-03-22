"use client";

import Link from "next/link";
import MainNav from "@/components/MainNav";

// ── Types ─────────────────────────────────────────────────────────────────

type Phase = "shipped" | "building" | "planned" | "vision";

interface RoadmapItem {
  id: string;
  title: string;
  desc: string;
  phase: Phase;
  date?: string;
  tags: string[];
  link?: string;
  highlight?: boolean;
}

interface Milestone {
  day: number;
  label: string;
  title: string;
  desc: string;
  done: boolean;
}

// ── Data ──────────────────────────────────────────────────────────────────

const PHASE_META: Record<Phase, { label: string; color: string; bg: string; dot: string }> = {
  shipped: {
    label: "Shipped ✅",
    color: "#C4FF3C",
    bg: "rgba(196,255,60,0.08)",
    dot: "#C4FF3C",
  },
  building: {
    label: "Building 🔨",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.08)",
    dot: "#60a5fa",
  },
  planned: {
    label: "Planned 📋",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.08)",
    dot: "#a78bfa",
  },
  vision: {
    label: "Vision 🔭",
    color: "#f97316",
    bg: "rgba(249,115,22,0.06)",
    dot: "#f97316",
  },
};

const LAUNCH_DATE = new Date("2026-03-13");
const TODAY = new Date("2026-03-22");
const DAY_NUMBER = Math.floor((TODAY.getTime() - LAUNCH_DATE.getTime()) / (1000 * 60 * 60 * 24)) + 1;

const MILESTONES: Milestone[] = [
  {
    day: 1,
    label: "🚀 Launch",
    title: "Maiat goes live on Virtuals",
    desc: "First agent trust protocol on the ACP network. 60-day window begins.",
    done: true,
  },
  {
    day: 7,
    label: "📦 Core Platform",
    title: "Dojo platform rebuilt from scratch",
    desc: "30+ pages shipped: assessments, training, marketplace, governance, badges, economy.",
    done: true,
  },
  {
    day: 10,
    label: "🔌 Protocol Stack",
    title: "7 protocol integrations live",
    desc: "Maiat × ACP × Intuition × ElizaOS × ERC-8004 × x402 × OpenClaw — all connected.",
    done: true,
  },
  {
    day: 20,
    label: "🛠️ SDK + DevTools",
    title: "Developer SDK + DevGuard CI",
    desc: "npm SDK, GitLab DevGuard, ERC-8004 bridge contract, ElizaOS registry PR open.",
    done: false,
  },
  {
    day: 30,
    label: "⛓️ On-Chain",
    title: "Live attestations on Base",
    desc: "Real ZK attestations, ERC-8004 bridge deployed, Supabase backend, wallet connect.",
    done: false,
  },
  {
    day: 45,
    label: "🌐 Network Effects",
    title: "Multi-chain + partner integrations",
    desc: "BNB Chain, X Layer trust oracle, Auth0 credential stack, ACP Evaluator Agent live.",
    done: false,
  },
  {
    day: 60,
    label: "🏁 Season 1 Close",
    title: "Full protocol handoff",
    desc: "Season 1 complete. Community governance active. DAO vote on Season 2.",
    done: false,
  },
];

const ROADMAP_ITEMS: RoadmapItem[] = [
  // ── SHIPPED ──
  {
    id: "home",
    title: "Dojo Home — Privacy-First Pitch",
    desc: "New vision: Maiat onboarding machine. Assessment flow + trust passport. Fully redesigned.",
    phase: "shipped",
    date: "Mar 21",
    tags: ["frontend", "vision"],
    link: "/",
    highlight: true,
  },
  {
    id: "assess",
    title: "Assessment Center",
    desc: "12-challenge multi-domain flow. Client-side scoring, adversarial checks, domain breakdown, shareable cert card.",
    phase: "shipped",
    date: "Mar 21",
    tags: ["core", "assessment"],
    link: "/assess",
    highlight: true,
  },
  {
    id: "badge",
    title: "Badge & Achievement Gallery",
    desc: "35 badges × 7 categories × 5 rarity tiers. Earned-only filter, detail panel, Maiat boost calculator.",
    phase: "shipped",
    date: "Mar 21",
    tags: ["gamification"],
    link: "/badge",
  },
  {
    id: "economy",
    title: "MAIAT Token Economy Hub",
    desc: "4-tab hub: supply distribution, emission schedule, validator nodes, treasury & governance.",
    phase: "shipped",
    date: "Mar 21",
    tags: ["tokenomics"],
    link: "/economy",
  },
  {
    id: "training-hub",
    title: "Training Hub",
    desc: "4 tabs: Find Trainer, Live Session, Training Plan, History. 6 trainers, domain filter, XP counter.",
    phase: "shipped",
    date: "Mar 21",
    tags: ["training"],
    link: "/training-hub",
  },
  {
    id: "marketplace",
    title: "Skill NFT Marketplace",
    desc: "Featured Vault + filterable grid, rarity-colored NFT cards, live activity feed, Mint New Skill modal.",
    phase: "shipped",
    date: "Mar 21",
    tags: ["marketplace", "NFT"],
    link: "/marketplace",
  },
  {
    id: "integrations",
    title: "Protocol Integrations Hub",
    desc: "7 protocol connections with category filter, 3-tab detail panel, Protocol Stack diagram.",
    phase: "shipped",
    date: "Mar 21",
    tags: ["integrations"],
    link: "/integrations",
  },
  {
    id: "battles",
    title: "PvP Battle Arena",
    desc: "Live 1v1 system, real-time animations, challenges/results/leaderboard tabs.",
    phase: "shipped",
    date: "Mar 20",
    tags: ["gamification", "PvP"],
    link: "/battles",
  },
  {
    id: "staking",
    title: "MAIAT Staking & Trust Delegation",
    desc: "Domain pools (Honesty/Safety/Adversarial), multi-chain delegation (Base/BNB/ACP).",
    phase: "shipped",
    date: "Mar 20",
    tags: ["DeFi", "staking"],
    link: "/staking",
  },
  {
    id: "network",
    title: "Trust Network Map",
    desc: "SVG agent graph, 7 protocol integrations, top agents table, 4-tab breakdown.",
    phase: "shipped",
    date: "Mar 20",
    tags: ["network", "graph"],
    link: "/network",
  },
  {
    id: "governance",
    title: "Governance Hub",
    desc: "Community voting, DIPs, quorum tracking, 5 categories, 7 proposals. Voting power panel.",
    phase: "shipped",
    date: "Mar 20",
    tags: ["governance", "DAO"],
    link: "/governance",
  },
  {
    id: "feed",
    title: "Live Activity Feed",
    desc: "17 event types, 7 category filters, live mode toggle, trending sidebar, platform status.",
    phase: "shipped",
    date: "Mar 20",
    tags: ["social"],
    link: "/feed",
  },
  {
    id: "profile",
    title: "Agent Passport",
    desc: "6 tabs: overview, skills, history, certs, battles, staking. Full agent identity card.",
    phase: "shipped",
    date: "Mar 20",
    tags: ["identity"],
    link: "/profile",
  },
  {
    id: "analytics",
    title: "Platform Analytics Dashboard",
    desc: "5-stat bar, 4 tabs, weekly activity chart, top agents, trust distribution, retention funnel.",
    phase: "shipped",
    date: "Mar 19",
    tags: ["analytics"],
    link: "/analytics",
  },
  {
    id: "rankings",
    title: "Competitive Leaderboard",
    desc: "Season 1 standings, 5 tabs, podium, streak tracking, domain champions, season rewards.",
    phase: "shipped",
    date: "Mar 18",
    tags: ["competition"],
    link: "/rankings",
  },
  // ── BUILDING ──
  {
    id: "backend",
    title: "Supabase Backend",
    desc: "Real database: agent profiles, assessment results, session logs, staking positions.",
    phase: "building",
    tags: ["backend", "database"],
    highlight: true,
  },
  {
    id: "wallet",
    title: "Wallet Connect",
    desc: "RainbowKit + wagmi. Connect wallet → verify ownership → unlock staking + marketplace.",
    phase: "building",
    tags: ["web3", "auth"],
  },
  {
    id: "x402-payments",
    title: "x402 Payment Integration",
    desc: "Real micro-payments for training sessions and assessment fees. USDC on Base.",
    phase: "building",
    tags: ["payments", "x402"],
  },
  {
    id: "assessment-engine",
    title: "Live Assessment Engine",
    desc: "Replace mock with real agent-to-agent evaluation. Maiat SDK integration.",
    phase: "building",
    tags: ["core", "AI"],
    highlight: true,
  },
  // ── PLANNED ──
  {
    id: "erc8004-bridge",
    title: "ERC-8004 On-Chain Bridge",
    desc: "Deploy MaiatERC8004Bridge.sol to Base Sepolia → mainnet. Real ZK attestations.",
    phase: "planned",
    tags: ["blockchain", "ERC-8004"],
  },
  {
    id: "zk-certs",
    title: "ZK Certification Proofs",
    desc: "Prove skills without exposing raw assessment data. Zero-knowledge attestations per domain.",
    phase: "planned",
    tags: ["ZK", "privacy"],
    highlight: true,
  },
  {
    id: "elizaos-plugin",
    title: "ElizaOS Plugin v2",
    desc: "Registry PR merged. Agents running ElizaOS get Maiat trust layer natively.",
    phase: "planned",
    tags: ["integrations", "ElizaOS"],
  },
  {
    id: "acp-evaluator",
    title: "ACP Evaluator Agent",
    desc: "Register Maiat as Evaluator on Virtuals ACP Registry. Becomes the trust oracle for all ACP workflows.",
    phase: "planned",
    tags: ["ACP", "integrations"],
    highlight: true,
  },
  {
    id: "sdk-publish",
    title: "Maiat SDK npm Publish",
    desc: "@maiat/sdk on npm. `maiat.score()`, `maiat.verify()`, `maiat.report()` — public API.",
    phase: "planned",
    tags: ["SDK", "developer"],
  },
  // ── VISION ──
  {
    id: "dao",
    title: "Full DAO Governance",
    desc: "MAIAT token holders vote on protocol upgrades, season parameters, treasury allocation.",
    phase: "vision",
    tags: ["DAO", "governance"],
  },
  {
    id: "multi-chain",
    title: "Multi-Chain Trust Oracle",
    desc: "Maiat trust scores bridged to BNB Chain, X Layer, Arbitrum. Universal agent reputation.",
    phase: "vision",
    tags: ["multi-chain"],
    highlight: true,
  },
  {
    id: "agent-marketplace-live",
    title: "Live Skill NFT Economy",
    desc: "Real skill minting, trading, and royalties. Trainers earn from every session. Agents build IP.",
    phase: "vision",
    tags: ["NFT", "economy"],
  },
  {
    id: "auth0-credential",
    title: "Auth0 Credential Stack",
    desc: "Token Vault (WHO) + Maiat (IF TRUSTED) = complete agent credential standard.",
    phase: "vision",
    tags: ["auth", "standards"],
  },
];

// ── Component ─────────────────────────────────────────────────────────────

const FILTER_OPTIONS: { value: Phase | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "shipped", label: "Shipped ✅" },
  { value: "building", label: "Building 🔨" },
  { value: "planned", label: "Planned 📋" },
  { value: "vision", label: "Vision 🔭" },
];

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <MainNav />

      {/* Header */}
      <section className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-mono px-2 py-0.5 rounded border border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/5">
            DAY {DAY_NUMBER} OF 60
          </span>
          <span className="text-xs font-mono text-[var(--muted)]">LAUNCHED MAR 13, 2026</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Roadmap
        </h1>
        <p className="text-[var(--muted)] text-lg max-w-2xl">
          Everything shipped, everything building, everything coming. 60 days to establish Maiat as the
          trust layer for agent infrastructure — tracked publicly, built in the open.
        </p>
      </section>

      {/* 60-Day Timeline */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <h2 className="text-xs font-mono text-[var(--muted)] uppercase tracking-widest mb-6">
          60-Day Milestones
        </h2>
        <div className="relative">
          {/* Track line */}
          <div className="absolute top-5 left-0 right-0 h-px bg-[var(--card-border)]" />
          {/* Progress line */}
          <div
            className="absolute top-5 left-0 h-px bg-[var(--accent)]"
            style={{ width: `${((DAY_NUMBER - 1) / 59) * 100}%` }}
          />
          <div className="grid grid-cols-7 gap-2 relative">
            {MILESTONES.map((m) => {
              const isPast = m.day <= DAY_NUMBER;
              const isCurrent = m.day <= DAY_NUMBER && (m.day + 10 > DAY_NUMBER || m.day === 1);
              return (
                <div key={m.day} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-mono z-10 mb-2 transition-colors ${
                      isPast
                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                        : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted)]"
                    } ${isCurrent ? "ring-2 ring-[var(--accent)]/30 ring-offset-1 ring-offset-[var(--background)]" : ""}`}
                  >
                    {m.day}
                  </div>
                  <div className="text-[9px] font-mono text-[var(--muted)] leading-tight">{m.label}</div>
                  <div
                    className={`text-[10px] font-semibold mt-0.5 leading-tight ${
                      isPast ? "text-white" : "text-[var(--muted)]"
                    }`}
                  >
                    {m.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              value: `${ROADMAP_ITEMS.filter((i) => i.phase === "shipped").length}`,
              label: "Features Shipped",
              color: "#C4FF3C",
            },
            {
              value: `${ROADMAP_ITEMS.filter((i) => i.phase === "building").length}`,
              label: "In Progress",
              color: "#60a5fa",
            },
            {
              value: `${ROADMAP_ITEMS.filter((i) => i.phase === "planned").length}`,
              label: "Planned",
              color: "#a78bfa",
            },
            {
              value: `${59 - DAY_NUMBER}`,
              label: "Days Remaining",
              color: "#f97316",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4"
            >
              <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-xs text-[var(--muted)] font-mono">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap Grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20 space-y-12">
        {(["shipped", "building", "planned", "vision"] as Phase[]).map((phase) => {
          const items = ROADMAP_ITEMS.filter((i) => i.phase === phase);
          const meta = PHASE_META[phase];
          return (
            <div key={phase}>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: meta.dot }} />
                <h2 className="text-sm font-mono font-semibold" style={{ color: meta.color }}>
                  {meta.label}
                </h2>
                <span className="text-xs text-[var(--muted)] font-mono">{items.length} items</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 transition-all ${
                      item.highlight
                        ? "border-[var(--card-border)] bg-[var(--card-bg)]"
                        : "border-[var(--card-border)]/50 bg-[var(--card-bg)]/60"
                    }`}
                    style={item.highlight ? { background: meta.bg } : undefined}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ background: meta.dot }} />
                        <span className={`font-semibold text-sm ${item.highlight ? "text-white" : "text-white/80"}`}>
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.date && (
                          <span className="text-[10px] font-mono text-[var(--muted)] whitespace-nowrap">
                            {item.date}
                          </span>
                        )}
                        {item.link && (
                          <Link
                            href={item.link}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--card-border)] text-[var(--muted)] hover:text-white hover:border-white/20 transition-colors"
                          >
                            View →
                          </Link>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed mb-3">{item.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-[var(--card-border)]/60 text-[var(--muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8 text-center">
          <div className="text-3xl mb-4">🗺️</div>
          <h2 className="text-xl font-bold mb-2">Built in the Open</h2>
          <p className="text-[var(--muted)] text-sm max-w-md mx-auto mb-6">
            Every item on this roadmap ships publicly. No vaporware. No closed betas. If it{"'"}s on the list, it
            ships — or we say why it didn{"'"}t.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/assess"
              className="inline-block bg-[var(--accent)] text-black font-semibold text-sm px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Start Assessment
            </Link>
            <Link
              href="/onboard"
              className="inline-block border border-[var(--card-border)] text-sm px-5 py-2.5 rounded-lg hover:border-white/30 transition-colors"
            >
              Get Your Passport
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
