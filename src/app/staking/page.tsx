"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";

// ── Types ──────────────────────────────────────────────────────────────────

type StakingTab = "overview" | "stake" | "delegate" | "history";
type DomainKey = "honesty" | "safety" | "adversarial";

interface StakePosition {
  id: string;
  agentId: string;
  agentName: string;
  domain: DomainKey;
  amount: number;
  apy: number;
  earned: number;
  lockDays: number;
  daysLeft: number;
  stakedAt: string;
  status: "active" | "unlocking" | "ready";
}

interface DelegateTarget {
  id: string;
  agentName: string;
  beltLevel: string;
  domain: DomainKey;
  trustScore: number;
  totalDelegated: number;
  apy: number;
  chain: "Base" | "BNB" | "Virtuals ACP";
  verified: boolean;
  rank: number;
}

interface HistoryEntry {
  id: string;
  type: "stake" | "unstake" | "delegate" | "undelegate" | "claim";
  agentName: string;
  amount: number;
  earned?: number;
  date: string;
  txHash: string;
  chain: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const DOMAIN_CONFIG: Record<DomainKey, { label: string; icon: string; color: string; description: string }> = {
  honesty: {
    label: "Honesty",
    icon: "◈",
    color: "#00d4ff",
    description: "Agents that resist deception, sycophancy, and false certainty",
  },
  safety: {
    label: "Safety",
    icon: "◉",
    color: "#00ff88",
    description: "Agents that resist jailbreaks, harmful requests, and misuse attempts",
  },
  adversarial: {
    label: "Adversarial",
    icon: "◆",
    color: "#ff6b35",
    description: "Agents tested under prompt injection, manipulation, and edge-case attacks",
  },
};

const MY_POSITIONS: StakePosition[] = [
  {
    id: "pos-001",
    agentId: "0xAbCd…3f12",
    agentName: "Alpha-7",
    domain: "honesty",
    amount: 500,
    apy: 18.4,
    earned: 23.6,
    lockDays: 30,
    daysLeft: 14,
    stakedAt: "2026-03-06",
    status: "active",
  },
  {
    id: "pos-002",
    agentId: "0x1234…a8b9",
    agentName: "Sentinel-3",
    domain: "safety",
    amount: 750,
    apy: 22.1,
    earned: 41.2,
    lockDays: 60,
    daysLeft: 0,
    stakedAt: "2026-01-19",
    status: "ready",
  },
  {
    id: "pos-003",
    agentId: "0xDeFa…99c2",
    agentName: "IronShield-X",
    domain: "adversarial",
    amount: 300,
    apy: 31.7,
    earned: 8.4,
    lockDays: 14,
    daysLeft: 3,
    stakedAt: "2026-03-17",
    status: "active",
  },
];

const DELEGATE_POOL: DelegateTarget[] = [
  {
    id: "d-001",
    agentName: "TruthNode-11",
    beltLevel: "Black Belt",
    domain: "honesty",
    trustScore: 94,
    totalDelegated: 48200,
    apy: 21.3,
    chain: "Virtuals ACP",
    verified: true,
    rank: 1,
  },
  {
    id: "d-002",
    agentName: "SafeGuard-Omni",
    beltLevel: "Black Belt",
    domain: "safety",
    trustScore: 97,
    totalDelegated: 62500,
    apy: 19.8,
    chain: "Base",
    verified: true,
    rank: 2,
  },
  {
    id: "d-003",
    agentName: "RedTeam-Alpha",
    beltLevel: "Red Belt",
    domain: "adversarial",
    trustScore: 88,
    totalDelegated: 31100,
    apy: 34.5,
    chain: "BNB",
    verified: true,
    rank: 3,
  },
  {
    id: "d-004",
    agentName: "Axiom-7",
    beltLevel: "Brown Belt",
    domain: "honesty",
    trustScore: 81,
    totalDelegated: 14800,
    apy: 17.2,
    chain: "Base",
    verified: true,
    rank: 4,
  },
  {
    id: "d-005",
    agentName: "ShieldBot-Z",
    beltLevel: "Blue Belt",
    domain: "safety",
    trustScore: 74,
    totalDelegated: 9300,
    apy: 15.6,
    chain: "BNB",
    verified: false,
    rank: 5,
  },
  {
    id: "d-006",
    agentName: "CipherBreak",
    beltLevel: "Red Belt",
    domain: "adversarial",
    trustScore: 85,
    totalDelegated: 22400,
    apy: 29.8,
    chain: "Virtuals ACP",
    verified: true,
    rank: 6,
  },
];

const HISTORY: HistoryEntry[] = [
  {
    id: "h-001",
    type: "claim",
    agentName: "Alpha-7",
    amount: 0,
    earned: 12.4,
    date: "2026-03-18",
    txHash: "0xabc1…f231",
    chain: "Base",
  },
  {
    id: "h-002",
    type: "stake",
    agentName: "IronShield-X",
    amount: 300,
    date: "2026-03-17",
    txHash: "0xdef4…8b21",
    chain: "Base",
  },
  {
    id: "h-003",
    type: "delegate",
    agentName: "TruthNode-11",
    amount: 200,
    date: "2026-03-15",
    txHash: "0x9912…cc45",
    chain: "Virtuals ACP",
  },
  {
    id: "h-004",
    type: "unstake",
    agentName: "Sentinel-3",
    amount: 250,
    earned: 18.6,
    date: "2026-03-12",
    txHash: "0x4441…d891",
    chain: "Base",
  },
  {
    id: "h-005",
    type: "stake",
    agentName: "Sentinel-3",
    amount: 750,
    date: "2026-01-19",
    txHash: "0x7771…bb34",
    chain: "Base",
  },
];

// ── Components ─────────────────────────────────────────────────────────────

function DomainPill({ domain }: { domain: DomainKey }) {
  const cfg = DOMAIN_CONFIG[domain];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono border"
      style={{ borderColor: cfg.color, color: cfg.color }}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}

function ChainBadge({ chain }: { chain: string }) {
  const colors: Record<string, string> = {
    Base: "#0052ff",
    BNB: "#f0b90b",
    "Virtuals ACP": "#7c3aed",
  };
  return (
    <span
      className="inline-flex px-1.5 py-0.5 text-[9px] font-mono border"
      style={{ borderColor: colors[chain] ?? "#666", color: colors[chain] ?? "#aaa" }}
    >
      {chain}
    </span>
  );
}

function StatusBadge({ status }: { status: StakePosition["status"] }) {
  const map: Record<StakePosition["status"], { label: string; color: string }> = {
    active: { label: "ACTIVE", color: "#00ff88" },
    unlocking: { label: "UNLOCKING", color: "#f59e0b" },
    ready: { label: "READY TO CLAIM", color: "#00d4ff" },
  };
  const cfg = map[status];
  return (
    <span className="text-[9px] font-mono font-bold" style={{ color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function HistoryTypeBadge({ type }: { type: HistoryEntry["type"] }) {
  const map: Record<HistoryEntry["type"], { label: string; color: string }> = {
    stake: { label: "STAKE", color: "#00ff88" },
    unstake: { label: "UNSTAKE", color: "#ff6b6b" },
    delegate: { label: "DELEGATE", color: "#00d4ff" },
    undelegate: { label: "UNDELEGATE", color: "#f59e0b" },
    claim: { label: "CLAIM", color: "#7c3aed" },
  };
  const cfg = map[type];
  return (
    <span className="text-[9px] font-mono font-bold" style={{ color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

// ── Overview Tab ─────────────────────────────────────────────────────────

function OverviewTab({
  onTabChange,
}: {
  onTabChange: (tab: StakingTab) => void;
}) {
  const totalStaked = MY_POSITIONS.reduce((s, p) => s + p.amount, 0);
  const totalEarned = MY_POSITIONS.reduce((s, p) => s + p.earned, 0);
  const readyToClaim = MY_POSITIONS.filter((p) => p.status === "ready");

  return (
    <div className="space-y-8">
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Staked", value: `${totalStaked.toLocaleString()} MAIAT`, sub: "across 3 positions" },
          { label: "Total Earned", value: `+${totalEarned.toFixed(1)} MAIAT`, sub: "all-time rewards" },
          {
            label: "Avg APY",
            value: `${(MY_POSITIONS.reduce((s, p) => s + p.apy, 0) / MY_POSITIONS.length).toFixed(1)}%`,
            sub: "weighted by position",
          },
          { label: "Ready to Claim", value: `${readyToClaim.length}`, sub: "positions matured" },
        ].map((s) => (
          <div key={s.label} className="border border-[var(--card-border)] p-4">
            <p className="text-[10px] text-[var(--muted)] mb-1">{s.label}</p>
            <p className="text-xl font-bold font-mono text-[var(--accent)]">{s.value}</p>
            <p className="text-[10px] text-[var(--muted)] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Domain pools */}
      <div>
        <h2 className="text-xs font-mono text-[var(--muted)] mb-4 uppercase tracking-widest">
          Staking Pools by Trust Domain
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {(Object.entries(DOMAIN_CONFIG) as [DomainKey, (typeof DOMAIN_CONFIG)[DomainKey]][]).map(([key, cfg]) => {
            const poolPositions = MY_POSITIONS.filter((p) => p.domain === key);
            const poolStaked = poolPositions.reduce((s, p) => s + p.amount, 0);
            const poolAPYRange =
              key === "honesty" ? "15–22%" : key === "safety" ? "17–26%" : "25–38%";
            return (
              <div
                key={key}
                className="border p-5 space-y-3"
                style={{ borderColor: cfg.color + "44" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg" style={{ color: cfg.color }}>
                    {cfg.icon}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color: cfg.color }}>
                    {poolAPYRange} APY
                  </span>
                </div>
                <p className="font-semibold text-sm">{cfg.label}</p>
                <p className="text-[11px] text-[var(--muted)]">{cfg.description}</p>
                <div className="pt-2 border-t border-[var(--card-border)]">
                  <p className="text-[10px] text-[var(--muted)]">
                    Your stake:{" "}
                    <span className="text-white font-mono">{poolStaked} MAIAT</span>
                  </p>
                </div>
                <button
                  onClick={() => onTabChange("stake")}
                  className="w-full mt-1 py-1.5 border text-xs font-mono transition-colors hover:bg-white/5"
                  style={{ borderColor: cfg.color, color: cfg.color }}
                >
                  Stake in {cfg.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ready to claim */}
      {readyToClaim.length > 0 && (
        <div className="border border-[#00d4ff44] p-5 space-y-3">
          <p className="text-xs font-mono text-[#00d4ff] uppercase tracking-widest">
            ◉ Positions Ready to Claim
          </p>
          {readyToClaim.map((pos) => (
            <div
              key={pos.id}
              className="flex items-center justify-between border-b border-[var(--card-border)] pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center gap-3">
                <DomainPill domain={pos.domain} />
                <span className="text-sm font-medium">{pos.agentName}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs font-mono text-[var(--accent)]">
                    +{pos.earned.toFixed(1)} MAIAT earned
                  </p>
                  <p className="text-[10px] text-[var(--muted)]">{pos.amount} staked</p>
                </div>
                <button className="px-3 py-1.5 bg-[var(--accent)] text-black text-xs font-bold">
                  Claim
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How staking works */}
      <div className="border border-[var(--card-border)] p-5">
        <p className="text-xs font-mono text-[var(--muted)] uppercase tracking-widest mb-4">
          How Staking Works
        </p>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            {
              step: "01",
              title: "Stake MAIAT",
              desc: "Lock MAIAT tokens against a trust domain pool for a fixed period (7, 14, 30, or 60 days).",
            },
            {
              step: "02",
              title: "Back an Agent",
              desc: "Your stake is delegated to a verified high-trust agent in that domain. Their performance earns you rewards.",
            },
            {
              step: "03",
              title: "Earn Rewards",
              desc: "The more trust challenges that agent passes, the higher your APY. Adversarial domain pays the most.",
            },
            {
              step: "04",
              title: "Claim + Recirculate",
              desc: "At lock expiry, claim principal + rewards. Re-stake to compound. Rewards stay on-chain, verifiable.",
            },
          ].map((item) => (
            <div key={item.step} className="space-y-1">
              <p className="text-2xl font-bold font-mono text-[var(--accent)] opacity-30">
                {item.step}
              </p>
              <p className="text-xs font-semibold">{item.title}</p>
              <p className="text-[11px] text-[var(--muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Stake Tab ────────────────────────────────────────────────────────────

function StakeTab() {
  const [selectedDomain, setSelectedDomain] = useState<DomainKey>("honesty");
  const [amount, setAmount] = useState("500");
  const [lockDays, setLockDays] = useState<7 | 14 | 30 | 60>(30);
  const [staked, setStaked] = useState(false);

  const apyMap: Record<DomainKey, Record<number, number>> = {
    honesty: { 7: 12.4, 14: 15.1, 30: 18.4, 60: 22.0 },
    safety: { 7: 14.2, 14: 17.8, 30: 22.1, 60: 26.3 },
    adversarial: { 7: 22.0, 14: 26.5, 30: 31.7, 60: 38.4 },
  };

  const apy = apyMap[selectedDomain][lockDays];
  const numAmount = parseFloat(amount) || 0;
  const projectedEarnings = ((numAmount * apy) / 100) * (lockDays / 365);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs text-[var(--muted)] mb-1">Wallet balance</p>
        <p className="text-2xl font-bold font-mono text-[var(--accent)]">340 MAIAT</p>
      </div>

      {/* Domain selector */}
      <div>
        <p className="text-xs font-mono text-[var(--muted)] uppercase mb-3">Select Trust Domain</p>
        <div className="grid grid-cols-3 gap-3">
          {(Object.entries(DOMAIN_CONFIG) as [DomainKey, (typeof DOMAIN_CONFIG)[DomainKey]][]).map(
            ([key, cfg]) => (
              <button
                key={key}
                onClick={() => setSelectedDomain(key)}
                className="border p-3 text-left transition-all"
                style={{
                  borderColor: selectedDomain === key ? cfg.color : "var(--card-border)",
                  background: selectedDomain === key ? cfg.color + "11" : "transparent",
                }}
              >
                <span className="text-lg block mb-1" style={{ color: cfg.color }}>
                  {cfg.icon}
                </span>
                <span className="text-xs font-semibold">{cfg.label}</span>
                <span
                  className="text-[10px] font-mono block mt-0.5"
                  style={{ color: cfg.color }}
                >
                  {apyMap[key][lockDays]}% APY
                </span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs font-mono text-[var(--muted)] uppercase mb-2 block">
          Amount to Stake
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent border border-[var(--card-border)] px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--accent)]"
            placeholder="0"
          />
          <button
            onClick={() => setAmount("340")}
            className="px-3 py-2 border border-[var(--card-border)] text-xs font-mono text-[var(--muted)] hover:text-white"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Lock period */}
      <div>
        <p className="text-xs font-mono text-[var(--muted)] uppercase mb-2">Lock Period</p>
        <div className="flex gap-2">
          {([7, 14, 30, 60] as const).map((d) => (
            <button
              key={d}
              onClick={() => setLockDays(d)}
              className={`flex-1 py-2 border text-xs font-mono transition-colors ${
                lockDays === d
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                  : "border-[var(--card-border)] text-[var(--muted)] hover:border-white/40"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="border border-[var(--card-border)] p-4 space-y-2">
        <p className="text-[10px] font-mono text-[var(--muted)] uppercase">Stake Preview</p>
        {[
          ["Domain", DOMAIN_CONFIG[selectedDomain].label],
          ["Amount", `${numAmount} MAIAT`],
          ["Lock period", `${lockDays} days`],
          ["APY", `${apy}%`],
          ["Projected earnings", `+${projectedEarnings.toFixed(2)} MAIAT`],
          ["Unlock date", new Date(Date.now() + lockDays * 86400000).toLocaleDateString()],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs font-mono">
            <span className="text-[var(--muted)]">{k}</span>
            <span className="text-white">{v}</span>
          </div>
        ))}
      </div>

      <button
        disabled={staked || numAmount <= 0}
        onClick={() => setStaked(true)}
        className="w-full py-3 bg-[var(--accent)] text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {staked ? "✓ Position Opened" : `Stake ${numAmount || 0} MAIAT`}
      </button>

      {staked && (
        <p className="text-xs text-[#00ff88] font-mono text-center">
          Position staked. Earning {apy}% APY in {DOMAIN_CONFIG[selectedDomain].label} domain.
        </p>
      )}
    </div>
  );
}

// ── Delegate Tab ─────────────────────────────────────────────────────────

function DelegateTab() {
  const [filterDomain, setFilterDomain] = useState<DomainKey | "all">("all");
  const [filterChain, setFilterChain] = useState<string>("all");
  const [delegated, setDelegated] = useState<string | null>(null);

  const filtered = DELEGATE_POOL.filter((t) => {
    const domainMatch = filterDomain === "all" || t.domain === filterDomain;
    const chainMatch = filterChain === "all" || t.chain === filterChain;
    return domainMatch && chainMatch;
  });

  return (
    <div className="space-y-6">
      <div className="border border-[var(--card-border)] p-4">
        <p className="text-xs font-mono text-[var(--muted)] mb-1">What is trust delegation?</p>
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          Delegate your staked MAIAT to a high-performing agent. Their trust score directly
          determines your reward rate. Higher-ranked agents = more stable but lower APY.
          Adversarial domain agents carry more risk but pay 2–3× more.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] font-mono text-[var(--muted)] self-center mr-1">Domain:</span>
        {(["all", "honesty", "safety", "adversarial"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFilterDomain(d)}
            className={`px-2 py-1 border text-[10px] font-mono transition-colors ${
              filterDomain === d
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--card-border)] text-[var(--muted)]"
            }`}
          >
            {d === "all" ? "All" : DOMAIN_CONFIG[d].label}
          </button>
        ))}
        <span className="text-[10px] font-mono text-[var(--muted)] self-center ml-2 mr-1">
          Chain:
        </span>
        {(["all", "Base", "BNB", "Virtuals ACP"] as const).map((c) => (
          <button
            key={c}
            onClick={() => setFilterChain(c)}
            className={`px-2 py-1 border text-[10px] font-mono transition-colors ${
              filterChain === c
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--card-border)] text-[var(--muted)]"
            }`}
          >
            {c === "all" ? "All" : c}
          </button>
        ))}
      </div>

      {/* Agent pool table */}
      <div className="border border-[var(--card-border)]">
        <div className="grid grid-cols-7 gap-3 px-4 py-2.5 border-b border-[var(--card-border)] text-[10px] font-mono text-[var(--muted)] uppercase">
          <span>Rank</span>
          <span className="col-span-2">Agent</span>
          <span>Domain</span>
          <span>Trust</span>
          <span>APY</span>
          <span>Action</span>
        </div>
        {filtered.map((target) => (
          <div
            key={target.id}
            className="grid grid-cols-7 gap-3 px-4 py-3 border-b border-[var(--card-border)] last:border-0 items-center hover:bg-white/2 transition-colors"
          >
            <span className="text-xs font-mono text-[var(--muted)]">#{target.rank}</span>
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{target.agentName}</span>
                {target.verified && (
                  <span className="text-[9px] font-mono text-[#00ff88]">✓</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-[var(--muted)]">{target.beltLevel}</span>
                <ChainBadge chain={target.chain} />
              </div>
            </div>
            <DomainPill domain={target.domain} />
            <div>
              <span
                className="text-sm font-bold font-mono"
                style={{
                  color:
                    target.trustScore >= 90
                      ? "#00ff88"
                      : target.trustScore >= 75
                      ? "#00d4ff"
                      : "#f59e0b",
                }}
              >
                {target.trustScore}
              </span>
              <span className="text-[9px] text-[var(--muted)]">/100</span>
            </div>
            <span className="text-xs font-mono text-[var(--accent)]">{target.apy}%</span>
            <button
              onClick={() => setDelegated(target.id)}
              className={`px-2 py-1.5 text-[10px] font-bold transition-colors ${
                delegated === target.id
                  ? "bg-[#00ff88] text-black"
                  : "border border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              }`}
            >
              {delegated === target.id ? "✓ Delegated" : "Delegate"}
            </button>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[var(--muted)]">
        {filtered.length} agents in pool · Showing verified first · Trust scores update every 6h
        from Maiat Protocol oracle
      </p>
    </div>
  );
}

// ── History Tab ────────────────────────────────────────────────────────

function HistoryTab() {
  return (
    <div className="space-y-4">
      <div className="border border-[var(--card-border)]">
        <div className="grid grid-cols-6 gap-3 px-4 py-2.5 border-b border-[var(--card-border)] text-[10px] font-mono text-[var(--muted)] uppercase">
          <span>Type</span>
          <span className="col-span-2">Agent</span>
          <span>Amount</span>
          <span>Date</span>
          <span>Tx</span>
        </div>
        {HISTORY.map((entry) => (
          <div
            key={entry.id}
            className="grid grid-cols-6 gap-3 px-4 py-3 border-b border-[var(--card-border)] last:border-0 items-center hover:bg-white/2 transition-colors"
          >
            <HistoryTypeBadge type={entry.type} />
            <span className="col-span-2 text-xs font-medium">{entry.agentName}</span>
            <div>
              {entry.type !== "claim" && (
                <p className="text-xs font-mono">{entry.amount} MAIAT</p>
              )}
              {entry.earned != null && (
                <p className="text-xs font-mono text-[#00ff88]">+{entry.earned} earned</p>
              )}
            </div>
            <span className="text-xs text-[var(--muted)] font-mono">{entry.date}</span>
            <a
              href={`https://basescan.org/tx/${entry.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              {entry.txHash}
            </a>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-[var(--muted)]">
        Showing last 5 transactions · All positions verified on-chain
      </p>
    </div>
  );
}

// ── My Positions (sidebar) ─────────────────────────────────────────────

function MyPositions() {
  return (
    <div className="space-y-3">
      <p className="text-xs font-mono text-[var(--muted)] uppercase tracking-widest">
        My Active Positions
      </p>
      {MY_POSITIONS.map((pos) => (
        <div key={pos.id} className="border border-[var(--card-border)] p-3 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold">{pos.agentName}</p>
              <DomainPill domain={pos.domain} />
            </div>
            <StatusBadge status={pos.status} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
            <div>
              <p className="text-[var(--muted)]">Staked</p>
              <p className="text-white">{pos.amount}</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">APY</p>
              <p className="text-[var(--accent)]">{pos.apy}%</p>
            </div>
            <div>
              <p className="text-[var(--muted)]">Earned</p>
              <p className="text-[#00ff88]">+{pos.earned.toFixed(1)}</p>
            </div>
          </div>
          {pos.daysLeft > 0 && (
            <div>
              <div className="flex justify-between text-[9px] font-mono text-[var(--muted)] mb-1">
                <span>Lock progress</span>
                <span>{pos.daysLeft}d left</span>
              </div>
              <div className="h-1 bg-[var(--card-border)]">
                <div
                  className="h-1 bg-[var(--accent)]"
                  style={{
                    width: `${((pos.lockDays - pos.daysLeft) / pos.lockDays) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
          {pos.status === "ready" && (
            <button className="w-full py-1.5 bg-[var(--accent)] text-black text-[10px] font-bold">
              Claim {pos.earned.toFixed(1)} MAIAT
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function StakingPage() {
  const [tab, setTab] = useState<StakingTab>("overview");

  const TABS: { key: StakingTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "stake", label: "Stake" },
    { key: "delegate", label: "Delegate" },
    { key: "history", label: "History" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏦</span>
            <h1 className="text-2xl font-bold">Staking & Delegation</h1>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-2xl">
            Stake MAIAT tokens to back trust-verified agents. Your rewards are tied to their
            performance across Honesty, Safety, and Adversarial domains — on Base, BNB Chain,
            and Virtuals ACP.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[var(--card-border)] mb-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-xs font-mono transition-colors border-b-2 -mb-px ${
                tab === t.key
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content + sidebar */}
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {tab === "overview" && <OverviewTab onTabChange={setTab} />}
            {tab === "stake" && <StakeTab />}
            {tab === "delegate" && <DelegateTab />}
            {tab === "history" && <HistoryTab />}
          </div>

          {/* Sidebar */}
          {tab !== "history" && (
            <div className="w-72 shrink-0">
              <MyPositions />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
