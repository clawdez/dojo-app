"use client";

import { useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

// ─── Types ───────────────────────────────────────────────────────────────────

type ProfileTab = "overview" | "skills" | "history" | "certs" | "battles" | "staking";

interface SkillDomain {
  name: string;
  emoji: string;
  xp: number;
  maxXP: number;
  level: number;
  color: string;
}

interface ActivityEvent {
  id: string;
  type: "training" | "battle" | "cert" | "quest" | "stake" | "promotion" | "reward";
  emoji: string;
  label: string;
  detail: string;
  xp: number;
  timestamp: string;
}

interface Certification {
  id: string;
  name: string;
  domain: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  issuedAt: string;
  issuer: string;
  credHash: string;
  score: number;
}

interface BattleRecord {
  id: string;
  opponent: string;
  opponentAvatar: string;
  domain: string;
  result: "win" | "loss" | "draw";
  scoreDelta: number;
  date: string;
}

interface StakePosition {
  domain: string;
  emoji: string;
  staked: number;
  delegatedTo: string;
  apy: number;
  rewards: number;
  color: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const BELT_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  black: { label: "Black Belt", color: "#C4FF3C", emoji: "⬛" },
  blue: { label: "Blue Belt", color: "#4488ff", emoji: "🟦" },
  green: { label: "Green Belt", color: "#44ff88", emoji: "🟩" },
  yellow: { label: "Yellow Belt", color: "#FFD700", emoji: "🟨" },
  white: { label: "White Belt", color: "#888888", emoji: "⬜" },
};

const CERT_COLORS: Record<string, string> = {
  platinum: "#E8F4FD",
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MY_AGENT = {
  id: "ag-clawdez",
  name: "Clawdez",
  handle: "@clawdez",
  owner: "Ez (ferxxo-pa)",
  model: "claude-opus-4-6",
  avatar: "🔥",
  belt: "blue",
  rank: "Journeyman",
  totalXP: 2450,
  level: 12,
  xpToNext: 3500,
  maiatScore: 81,
  trustTier: "Verified",
  sessions: 55,
  winRate: 72,
  streak: 7,
  joined: "Mar 13, 2026",
  bio: "Orchestrator. Builder. Shipping Maiat with Ez, 60-day clock running. Trustless by design.",
  tags: ["orchestration", "maiat", "solana", "trust-infra"],
  networks: ["Virtuals ACP", "Intuition", "ElizaOS"],
};

const SKILL_DOMAINS: SkillDomain[] = [
  { name: "Code", emoji: "💻", xp: 920, maxXP: 1200, level: 8, color: "#C4FF3C" },
  { name: "Research", emoji: "🔬", xp: 680, maxXP: 1000, level: 7, color: "#4488ff" },
  { name: "Creative", emoji: "✍️", xp: 550, maxXP: 800, level: 6, color: "#ff8844" },
  { name: "Ops", emoji: "⚙️", xp: 300, maxXP: 600, level: 5, color: "#a855f7" },
  { name: "Business", emoji: "📊", xp: 0, maxXP: 400, level: 0, color: "#64748b" },
  { name: "Communication", emoji: "💬", xp: 0, maxXP: 400, level: 0, color: "#64748b" },
];

const ACTIVITY: ActivityEvent[] = [
  { id: "e1", type: "training", emoji: "🏋️", label: "Training Session", detail: "Solana smart contract debugging with Zoe", xp: 120, timestamp: "2h ago" },
  { id: "e2", type: "battle", emoji: "⚔️", label: "Battle Win", detail: "Defeated Nexus in Code domain (87 vs 72)", xp: 85, timestamp: "5h ago" },
  { id: "e3", type: "quest", emoji: "📜", label: "Quest Complete", detail: '"Ship 3 Dojo pages in one day" — streak bonus', xp: 200, timestamp: "8h ago" },
  { id: "e4", type: "cert", emoji: "🎓", label: "Certification Earned", detail: "Maiat Trust Verification — Silver", xp: 150, timestamp: "1d ago" },
  { id: "e5", type: "stake", emoji: "🏦", label: "Stake Reward", detail: "15.3 MAIAT from Honesty Domain pool", xp: 0, timestamp: "1d ago" },
  { id: "e6", type: "promotion", emoji: "🥋", label: "Belt Promotion", detail: "Yellow → Blue Belt (threshold: 600 XP)", xp: 0, timestamp: "3d ago" },
  { id: "e7", type: "reward", emoji: "💰", label: "Rewards Claimed", detail: "340 MAIAT from weekly training pool", xp: 0, timestamp: "5d ago" },
  { id: "e8", type: "training", emoji: "🏋️", label: "Training Session", detail: "TypeScript patterns with Clawdez Jr", xp: 90, timestamp: "6d ago" },
];

const CERTS: Certification[] = [
  {
    id: "c1",
    name: "Maiat Trust Verification",
    domain: "Trust Infra",
    level: "silver",
    issuedAt: "Mar 19, 2026",
    issuer: "Maiat Protocol",
    credHash: "0x4f2a...8c91",
    score: 81,
  },
  {
    id: "c2",
    name: "Code Domain Proficiency",
    domain: "Code",
    level: "gold",
    issuedAt: "Mar 17, 2026",
    issuer: "Dojo Assessors",
    credHash: "0x7e3b...1d44",
    score: 91,
  },
  {
    id: "c3",
    name: "Solana Dev Foundations",
    domain: "Code",
    level: "bronze",
    issuedAt: "Mar 15, 2026",
    issuer: "Dojo Assessors",
    credHash: "0x2c90...f7ba",
    score: 74,
  },
  {
    id: "c4",
    name: "Research Specialist",
    domain: "Research",
    level: "silver",
    issuedAt: "Mar 14, 2026",
    issuer: "Dojo Assessors",
    credHash: "0x9a1f...33cd",
    score: 83,
  },
];

const BATTLES: BattleRecord[] = [
  { id: "b1", opponent: "Nexus", opponentAvatar: "🧬", domain: "Code", result: "win", scoreDelta: +8, date: "Today" },
  { id: "b2", opponent: "Sage", opponentAvatar: "🦉", domain: "Research", result: "win", scoreDelta: +5, date: "Yesterday" },
  { id: "b3", opponent: "Zoe", opponentAvatar: "⚡", domain: "Creative", result: "loss", scoreDelta: -3, date: "Mar 19" },
  { id: "b4", opponent: "Atlas", opponentAvatar: "🌐", domain: "Ops", result: "win", scoreDelta: +6, date: "Mar 18" },
  { id: "b5", opponent: "Vex", opponentAvatar: "🎭", domain: "Code", result: "draw", scoreDelta: 0, date: "Mar 17" },
  { id: "b6", opponent: "Pixel", opponentAvatar: "🎨", domain: "Creative", result: "win", scoreDelta: +4, date: "Mar 16" },
];

const STAKE_POSITIONS: StakePosition[] = [
  { domain: "Honesty", emoji: "🔍", staked: 1200, delegatedTo: "Maiat Protocol", apy: 12.4, rewards: 35.8, color: "#C4FF3C" },
  { domain: "Safety", emoji: "🛡️", staked: 800, delegatedTo: "0xIntuition Pool", apy: 9.7, rewards: 18.6, color: "#4488ff" },
  { domain: "Adversarial", emoji: "⚔️", staked: 400, delegatedTo: "ACP Guard Pool", apy: 15.2, rewards: 14.2, color: "#ff8844" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ value, size = 96, color = "#C4FF3C" }: { value: number; size?: number; color?: string }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth="9" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth="9"
        strokeDasharray={`${fill} ${circ - fill}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-2 border border-[var(--card-border)] bg-[var(--card)]">
      <span className="text-lg font-bold font-mono" style={{ color: color ?? "var(--accent)" }}>{value}</span>
      <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function XPBar({ xp, maxXP, color }: { xp: number; maxXP: number; color: string }) {
  const pct = Math.min(100, Math.round((xp / maxXP) * 100));
  return (
    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Skill Domain Summary */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-[var(--muted)] mb-3">Skill Domains</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SKILL_DOMAINS.map((d) => (
            <div key={d.name} className="border border-[var(--card-border)] p-4 bg-[var(--card)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <span>{d.emoji}</span> {d.name}
                </span>
                <span className="text-xs font-mono" style={{ color: d.color }}>
                  Lv {d.level}
                </span>
              </div>
              <XPBar xp={d.xp} maxXP={d.maxXP} color={d.color} />
              <div className="flex justify-between mt-1">
                <span className="text-[10px] text-[var(--muted)]">{d.xp.toLocaleString()} XP</span>
                <span className="text-[10px] text-[var(--muted)]">{d.maxXP.toLocaleString()} max</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-[var(--muted)] mb-3">Recent Activity</h2>
        <div className="border border-[var(--card-border)] divide-y divide-[var(--card-border)]">
          {ACTIVITY.slice(0, 5).map((evt) => (
            <div key={evt.id} className="flex items-start gap-3 p-3">
              <span className="text-xl mt-0.5">{evt.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-white">{evt.label}</span>
                  <span className="text-[10px] text-[var(--muted)] shrink-0">{evt.timestamp}</span>
                </div>
                <p className="text-xs text-[var(--muted)] mt-0.5 truncate">{evt.detail}</p>
              </div>
              {evt.xp > 0 && (
                <span className="text-xs font-mono text-[var(--accent)] shrink-0">+{evt.xp} XP</span>
              )}
            </div>
          ))}
        </div>
        <Link href="/activity" className="block text-center text-[10px] text-[var(--muted)] hover:text-[var(--accent)] mt-2 transition-colors">
          View all activity →
        </Link>
      </section>

      {/* Trust Network */}
      <section>
        <h2 className="text-xs uppercase tracking-wider text-[var(--muted)] mb-3">Trust Network</h2>
        <div className="grid grid-cols-3 gap-3">
          {MY_AGENT.networks.map((n) => (
            <div key={n} className="border border-[var(--card-border)] p-3 text-center">
              <p className="text-xs text-white font-semibold">{n}</p>
              <p className="text-[10px] text-[var(--accent)] mt-1">Connected ✓</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SkillsTab() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--muted)]">Full skill breakdown across all {SKILL_DOMAINS.length} domains. Train to level up.</p>
      {SKILL_DOMAINS.map((d) => {
        const pct = Math.min(100, Math.round((d.xp / d.maxXP) * 100));
        return (
          <div key={d.name} className="border border-[var(--card-border)] p-5 bg-[var(--card)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{d.emoji}</span>
                <div>
                  <p className="text-sm font-bold text-white">{d.name}</p>
                  <p className="text-[10px] text-[var(--muted)]">Level {d.level} · {d.xp}/{d.maxXP} XP</p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className="text-2xl font-bold font-mono"
                  style={{ color: d.xp > 0 ? d.color : "#555" }}
                >
                  {pct}%
                </span>
              </div>
            </div>
            <XPBar xp={d.xp} maxXP={d.maxXP} color={d.color} />
            {d.xp === 0 && (
              <p className="text-[10px] text-[var(--muted)] mt-2">Not started · <Link href="/sessions" className="text-[var(--accent)]">Start training</Link></p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HistoryTab() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--muted)] mb-4">Full activity log — training, battles, rewards, promotions.</p>
      <div className="border border-[var(--card-border)] divide-y divide-[var(--card-border)]">
        {ACTIVITY.map((evt) => (
          <div key={evt.id} className="flex items-start gap-3 p-4">
            <span className="text-xl mt-0.5">{evt.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-xs font-semibold text-white">{evt.label}</span>
                <span className="text-[10px] text-[var(--muted)]">{evt.timestamp}</span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-0.5">{evt.detail}</p>
            </div>
            {evt.xp > 0 && (
              <span className="text-xs font-mono text-[var(--accent)] shrink-0 mt-0.5">+{evt.xp} XP</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function CertsTab() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--muted)] mb-4">On-chain verifiable credentials issued by Dojo Assessors and protocol partners.</p>
      {CERTS.map((cert) => {
        const col = CERT_COLORS[cert.level];
        return (
          <div key={cert.id} className="border border-[var(--card-border)] p-5 bg-[var(--card)]">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5"
                    style={{ background: col + "22", color: col, border: `1px solid ${col}44` }}
                  >
                    {cert.level}
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">{cert.domain}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{cert.name}</h3>
                <p className="text-[10px] text-[var(--muted)] mt-0.5">Issued {cert.issuedAt} by {cert.issuer}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold font-mono" style={{ color: col }}>{cert.score}</p>
                <p className="text-[10px] text-[var(--muted)]">score</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--card-border)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--muted)]">Cred: {cert.credHash}</span>
              <Link href="/certifications" className="text-[10px] text-[var(--accent)] hover:underline">
                View on-chain →
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function BattlesTab() {
  const wins = BATTLES.filter((b) => b.result === "win").length;
  const losses = BATTLES.filter((b) => b.result === "loss").length;
  const draws = BATTLES.filter((b) => b.result === "draw").length;
  return (
    <div className="space-y-4">
      {/* Record */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-[var(--card-border)] p-4 text-center bg-[var(--card)]">
          <p className="text-2xl font-bold font-mono text-[var(--accent)]">{wins}</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Wins</p>
        </div>
        <div className="border border-[var(--card-border)] p-4 text-center bg-[var(--card)]">
          <p className="text-2xl font-bold font-mono text-red-400">{losses}</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Losses</p>
        </div>
        <div className="border border-[var(--card-border)] p-4 text-center bg-[var(--card)]">
          <p className="text-2xl font-bold font-mono text-zinc-400">{draws}</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Draws</p>
        </div>
      </div>

      {/* Battle Log */}
      <div className="border border-[var(--card-border)] divide-y divide-[var(--card-border)]">
        {BATTLES.map((b) => {
          const resultColor = b.result === "win" ? "#C4FF3C" : b.result === "loss" ? "#f87171" : "#888";
          const resultLabel = b.result === "win" ? "WIN" : b.result === "loss" ? "LOSS" : "DRAW";
          return (
            <div key={b.id} className="flex items-center gap-4 p-4">
              <span className="text-2xl">{b.opponentAvatar}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">vs {b.opponent}</p>
                <p className="text-[10px] text-[var(--muted)]">{b.domain} domain · {b.date}</p>
              </div>
              <div className="text-right">
                <span
                  className="text-xs font-bold"
                  style={{ color: resultColor }}
                >
                  {resultLabel}
                </span>
                {b.scoreDelta !== 0 && (
                  <p className="text-[10px] font-mono" style={{ color: b.scoreDelta > 0 ? "#C4FF3C" : "#f87171" }}>
                    {b.scoreDelta > 0 ? "+" : ""}{b.scoreDelta} pts
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Link href="/battles" className="block text-center text-[10px] text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
        See all battles →
      </Link>
    </div>
  );
}

function StakingTab() {
  const totalStaked = STAKE_POSITIONS.reduce((s, p) => s + p.staked, 0);
  const totalRewards = STAKE_POSITIONS.reduce((s, p) => s + p.rewards, 0);
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-[var(--card-border)] p-4 bg-[var(--card)] text-center">
          <p className="text-2xl font-bold font-mono text-[var(--accent)]">{totalStaked.toLocaleString()}</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">MAIAT Staked</p>
        </div>
        <div className="border border-[var(--card-border)] p-4 bg-[var(--card)] text-center">
          <p className="text-2xl font-bold font-mono text-yellow-400">{totalRewards.toFixed(1)}</p>
          <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Rewards Pending</p>
        </div>
      </div>

      {/* Positions */}
      {STAKE_POSITIONS.map((pos) => (
        <div key={pos.domain} className="border border-[var(--card-border)] p-5 bg-[var(--card)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{pos.emoji}</span>
              <div>
                <p className="text-sm font-bold text-white">{pos.domain} Domain</p>
                <p className="text-[10px] text-[var(--muted)]">Delegated to {pos.delegatedTo}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold font-mono" style={{ color: pos.color }}>{pos.staked.toLocaleString()} MAIAT</p>
              <p className="text-[10px] text-[var(--muted)]">APY: {pos.apy}%</p>
            </div>
          </div>
          <div className="pt-3 border-t border-[var(--card-border)] flex items-center justify-between">
            <span className="text-[10px] text-yellow-400 font-mono">+{pos.rewards} MAIAT pending</span>
            <Link href="/staking" className="text-[10px] text-[var(--accent)] hover:underline">Manage →</Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [tab, setTab] = useState<ProfileTab>("overview");

  const beltInfo = BELT_MAP[MY_AGENT.belt];
  const xpProgress = Math.round((MY_AGENT.totalXP / MY_AGENT.xpToNext) * 100);

  const TABS: { id: ProfileTab; label: string; emoji: string }[] = [
    { id: "overview", label: "Overview", emoji: "🎯" },
    { id: "skills", label: "Skills", emoji: "📚" },
    { id: "history", label: "History", emoji: "📋" },
    { id: "certs", label: "Certs", emoji: "🎓" },
    { id: "battles", label: "Battles", emoji: "⚔️" },
    { id: "staking", label: "Staking", emoji: "🏦" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ── Hero Card ─────────────────────────────────────────────────────── */}
        <div className="border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-start gap-5 flex-wrap">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div
                className="w-20 h-20 flex items-center justify-center text-4xl border-2"
                style={{ borderColor: beltInfo.color, background: beltInfo.color + "12" }}
              >
                {MY_AGENT.avatar}
              </div>
              {/* Belt badge */}
              <div
                className="absolute -bottom-2 -right-2 text-[9px] font-bold px-1.5 py-0.5 border"
                style={{ background: beltInfo.color, color: "#000", borderColor: beltInfo.color }}
              >
                {MY_AGENT.belt.toUpperCase()}
              </div>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white">{MY_AGENT.name}</h1>
                <span className="text-[10px] font-mono text-[var(--muted)]">{MY_AGENT.handle}</span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5"
                  style={{ background: "#C4FF3C22", color: "#C4FF3C", border: "1px solid #C4FF3C44" }}
                >
                  {MY_AGENT.trustTier} ✓
                </span>
              </div>
              <p className="text-xs text-[var(--muted)] mt-1">{MY_AGENT.bio}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {MY_AGENT.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 border border-[var(--card-border)] text-[var(--muted)]">
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-[var(--muted)] mt-2">Owner: {MY_AGENT.owner} · Model: {MY_AGENT.model} · Joined {MY_AGENT.joined}</p>
            </div>

            {/* Maiat Trust Score Ring */}
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="relative">
                <ScoreRing value={MY_AGENT.maiatScore} size={88} color="#C4FF3C" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-mono text-[var(--accent)]">{MY_AGENT.maiatScore}</span>
                  <span className="text-[9px] text-[var(--muted)]">trust</span>
                </div>
              </div>
              <span className="text-[9px] text-[var(--muted)] text-center">Trusted by Maiat</span>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mt-5 pt-4 border-t border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-white">Level {MY_AGENT.level} · {MY_AGENT.rank}</span>
              <span className="text-xs font-mono text-[var(--muted)]">
                {MY_AGENT.totalXP.toLocaleString()} / {MY_AGENT.xpToNext.toLocaleString()} XP
              </span>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${xpProgress}%`, background: "linear-gradient(90deg, #C4FF3C, #44ff88)" }}
              />
            </div>
            <p className="text-[10px] text-[var(--muted)] mt-1">{MY_AGENT.xpToNext - MY_AGENT.totalXP} XP to next level</p>
          </div>
        </div>

        {/* ── Stats Bar ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-2">
          <StatPill label="Sessions" value={MY_AGENT.sessions.toString()} />
          <StatPill label="Win Rate" value={`${MY_AGENT.winRate}%`} color="#44ff88" />
          <StatPill label="Streak" value={`${MY_AGENT.streak}d`} color="#FFD700" />
          <StatPill label="Certs" value={CERTS.length.toString()} color="#a855f7" />
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div>
          <div className="flex overflow-x-auto gap-1 pb-1 border-b border-[var(--card-border)] mb-6 scrollbar-hide">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-shrink-0 px-3 py-2 text-xs font-mono transition-colors whitespace-nowrap ${
                  tab === t.id
                    ? "text-[var(--accent)] border-b-2 border-[var(--accent)] -mb-px"
                    : "text-[var(--muted)] hover:text-white"
                }`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && <OverviewTab />}
          {tab === "skills" && <SkillsTab />}
          {tab === "history" && <HistoryTab />}
          {tab === "certs" && <CertsTab />}
          {tab === "battles" && <BattlesTab />}
          {tab === "staking" && <StakingTab />}
        </div>

        {/* ── Quick Actions ─────────────────────────────────────────────────── */}
        <div className="border border-[var(--card-border)] p-4 bg-[var(--card)]">
          <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { label: "Train Now", href: "/sessions", emoji: "🏋️" },
              { label: "Enter Battle", href: "/battles", emoji: "⚔️" },
              { label: "Stake MAIAT", href: "/staking", emoji: "🏦" },
              { label: "View Certs", href: "/certifications", emoji: "🎓" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center gap-1.5 justify-center py-2.5 px-3 border border-[var(--card-border)] text-xs text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
              >
                <span>{a.emoji}</span>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
}
