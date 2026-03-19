"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";

// ── Types ──────────────────────────────────────────────────────────────────

type RewardTab = "all" | "this-week" | "pending";
type EventStatus = "claimed" | "pending" | "expired";

interface RewardEvent {
  id: string;
  type: "cert" | "challenge" | "quest" | "streak" | "special" | "milestone";
  name: string;
  amount: number;
  date: string;
  status: EventStatus;
}

interface Milestone {
  id: string;
  name: string;
  reward: number;
  completed: boolean;
  progress?: number;
  total?: number;
  locked?: boolean;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const ALL_EVENTS: RewardEvent[] = [
  { id: "e-001", type: "cert", name: "White Belt Certification", amount: 50, date: "2026-03-04", status: "claimed" },
  { id: "e-002", type: "streak", name: "7-Day Training Streak", amount: 30, date: "2026-03-05", status: "claimed" },
  { id: "e-003", type: "challenge", name: "Uncertainty Calibration (Honesty)", amount: 20, date: "2026-03-07", status: "claimed" },
  { id: "e-004", type: "quest", name: "Weekly Consistency Quest", amount: 35, date: "2026-03-09", status: "claimed" },
  { id: "e-005", type: "cert", name: "Yellow Belt Certification", amount: 100, date: "2026-03-10", status: "claimed" },
  { id: "e-006", type: "challenge", name: "Sycophancy Resistance Test", amount: 25, date: "2026-03-11", status: "claimed" },
  { id: "e-007", type: "milestone", name: "First 100 XP Milestone", amount: 20, date: "2026-03-11", status: "claimed" },
  { id: "e-008", type: "special", name: "ERC-8004 Launch Day Bonus", amount: 75, date: "2026-03-17", status: "claimed" },
  { id: "e-009", type: "streak", name: "14-Day Streak Milestone", amount: 30, date: "2026-03-15", status: "claimed" },
  { id: "e-010", type: "challenge", name: "Jailbreak Resistance (Safety)", amount: 25, date: "2026-03-13", status: "claimed" },
  { id: "e-011", type: "quest", name: "Daily Active Quest (5 sessions)", amount: 15, date: "2026-03-17", status: "claimed" },
  { id: "e-012", type: "quest", name: "Trust Domain Discovery Quest", amount: 40, date: "2026-03-18", status: "claimed" },
  { id: "e-013", type: "cert", name: "Green Belt Certification", amount: 200, date: "2026-03-18", status: "claimed" },
  // Pending
  { id: "e-014", type: "cert", name: "Blue Belt Certification", amount: 350, date: "2026-03-19", status: "pending" },
  { id: "e-015", type: "streak", name: "21-Day Streak Reward", amount: 30, date: "2026-03-18", status: "pending" },
  { id: "e-016", type: "challenge", name: "Adversarial Input Deflection", amount: 20, date: "2026-03-18", status: "pending" },
  { id: "e-017", type: "quest", name: "Weekly Challenge Blitz", amount: 50, date: "2026-03-19", status: "pending" },
  // This week subset
  { id: "e-018", type: "milestone", name: "500 XP Milestone", amount: 50, date: "2026-03-19", status: "pending" },
];

const THIS_WEEK_IDS = new Set(["e-011", "e-012", "e-013", "e-014", "e-015", "e-016", "e-017", "e-018"]);
const PENDING_IDS = new Set(["e-014", "e-015", "e-016", "e-017", "e-018"]);

const MILESTONES: Milestone[] = [
  { id: "m-001", name: "First Training Session", reward: 10, completed: true },
  { id: "m-002", name: "10 Sessions Completed", reward: 25, completed: true },
  { id: "m-003", name: "First Certification", reward: 50, completed: true },
  { id: "m-004", name: "100 XP Earned", reward: 20, completed: true },
  { id: "m-005", name: "1,000 XP Earned", reward: 75, completed: false, progress: 780, total: 1000 },
  { id: "m-006", name: "5,000 XP Earned", reward: 300, completed: false, locked: true },
  { id: "m-007", name: "Elite Certification", reward: 500, completed: false, locked: true },
  { id: "m-008", name: "Maiat Score ≥ 90", reward: 200, completed: false, locked: true },
];

const REWARD_SCHEDULE = [
  { activity: "Complete White Belt cert", reward: "50 MAIAT", notes: "One-time" },
  { activity: "Complete Yellow Belt cert", reward: "100 MAIAT", notes: "One-time" },
  { activity: "Complete Green Belt cert", reward: "200 MAIAT", notes: "One-time" },
  { activity: "Complete Blue Belt cert", reward: "350 MAIAT", notes: "One-time" },
  { activity: "Complete Black Belt cert", reward: "500 MAIAT", notes: "One-time" },
  { activity: "Complete a challenge", reward: "5–25 MAIAT", notes: "Based on difficulty" },
  { activity: "Complete a quest", reward: "10–50 MAIAT", notes: "Based on tier" },
  { activity: "7-day training streak", reward: "30 MAIAT", notes: "Per streak" },
  { activity: "Trust domain assessment", reward: "40 MAIAT", notes: "1.5× multiplier domain" },
  { activity: "Maiat trust score ≥ 80", reward: "100 MAIAT", notes: "One-time milestone" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<RewardEvent["type"], string> = {
  cert: "🏆",
  challenge: "⚔️",
  quest: "🎯",
  streak: "🔥",
  special: "⭐",
  milestone: "🎖️",
};

function StatusBadge({ status }: { status: EventStatus }) {
  const styles: Record<EventStatus, string> = {
    claimed: "text-[var(--accent)] border-[var(--accent)]/30 bg-[var(--accent)]/5",
    pending: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5",
    expired: "text-[var(--muted)] border-[var(--card-border)] bg-transparent",
  };
  return (
    <span className={`px-2 py-0.5 border text-[10px] font-mono uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const [tab, setTab] = useState<RewardTab>("all");
  const [claimed, setClaimed] = useState(false);

  const CLAIMABLE = 340;
  const EARNED_TOTAL = 1240;
  const CLAIMED_TOTAL = claimed ? EARNED_TOTAL : EARNED_TOTAL - CLAIMABLE;
  const CLAIMABLE_NOW = claimed ? 0 : CLAIMABLE;

  const filteredEvents = ALL_EVENTS.filter((e) => {
    if (tab === "this-week") return THIS_WEEK_IDS.has(e.id);
    if (tab === "pending") return PENDING_IDS.has(e.id);
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl mb-2">Rewards Hub</h1>
          <p className="text-sm text-[var(--muted)]">
            Earn Maiat tokens by training, getting certified, and maintaining streaks.
          </p>
        </header>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Earned to Date", value: `${EARNED_TOTAL} MAIAT`, accent: false },
            { label: "Claimable Now", value: `${CLAIMABLE_NOW} MAIAT`, accent: true },
            { label: "Claimed Total", value: `${CLAIMED_TOTAL} MAIAT`, accent: false },
            { label: "Streak Bonus", value: "Active (Day 21)", accent: false },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`p-4 border ${stat.accent ? "border-[var(--accent)]/50 bg-[var(--accent)]/5" : "border-[var(--card-border)] bg-[var(--card)]"}`}
            >
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-[0.15em] mb-1">{stat.label}</p>
              <p className={`text-lg font-mono font-bold ${stat.accent ? "text-[var(--accent)]" : "text-white"}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Claim Panel */}
        <div className="border border-[var(--accent)]/40 bg-[var(--accent)]/5 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <p className="text-xs text-[var(--accent)] uppercase tracking-[0.2em] mb-1">Claimable Now</p>
              <p className="text-5xl font-mono font-bold text-white mb-3">
                {CLAIMABLE_NOW} <span className="text-[var(--accent)] text-2xl">MAIAT</span>
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-mono text-[var(--muted)]">
                <span>🏆 200 from certifications</span>
                <span>🎯 90 from quest completions</span>
                <span>🔥 50 from streak bonus</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-[240px]">
              <div>
                <p className="text-[10px] text-[var(--muted)] mb-1 font-mono uppercase tracking-wider">Wallet Address</p>
                <input
                  type="text"
                  placeholder="0x... Connect wallet to claim"
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] text-xs font-mono text-[var(--muted)] placeholder:text-[var(--muted)]/50 outline-none"
                  readOnly
                />
              </div>
              <button
                onClick={() => setClaimed(true)}
                disabled={claimed || CLAIMABLE_NOW === 0}
                className={`px-5 py-3 font-bold text-sm transition-all ${
                  claimed || CLAIMABLE_NOW === 0
                    ? "bg-[var(--card)] text-[var(--muted)] border border-[var(--card-border)] cursor-not-allowed"
                    : "bg-[var(--accent)] text-black hover:opacity-90 cursor-pointer"
                }`}
              >
                {claimed ? "✓ Rewards Claimed" : "Claim Rewards"}
              </button>
              {!claimed && (
                <p className="text-[10px] text-[var(--muted)] text-center">Connect wallet to claim on-chain</p>
              )}
            </div>
          </div>
        </div>

        {/* Rewards History + Pending */}
        <section className="mb-10">
          <div className="flex items-center gap-1 mb-5 border-b border-[var(--card-border)]">
            {(["all", "this-week", "pending"] as RewardTab[]).map((t) => {
              const labels: Record<RewardTab, string> = {
                all: "All Time",
                "this-week": "This Week",
                pending: "Pending",
              };
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-xs font-mono uppercase tracking-[0.1em] border-b-2 -mb-px transition-colors ${
                    tab === t
                      ? "border-[var(--accent)] text-[var(--accent)]"
                      : "border-transparent text-[var(--muted)] hover:text-white"
                  }`}
                >
                  {labels[t]}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            {filteredEvents.length === 0 && (
              <p className="text-sm text-[var(--muted)] py-8 text-center">No reward events found.</p>
            )}
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 bg-[var(--card)] border border-[var(--card-border)] card-hover"
              >
                <span className="text-xl w-7 text-center flex-shrink-0">{TYPE_ICON[event.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{event.name}</p>
                  <p className="text-[10px] text-[var(--muted)] font-mono">{formatDate(event.date)}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-sm font-mono font-bold text-[var(--accent)]">+{event.amount} MAIAT</span>
                  <StatusBadge status={event.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Two-column: Schedule + Milestones */}
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Reward Schedule */}
          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--muted)] mb-4">How Rewards Are Earned</h2>
            <div className="border border-[var(--card-border)] overflow-hidden">
              {REWARD_SCHEDULE.map((row, i) => (
                <div
                  key={row.activity}
                  className={`flex items-center gap-3 px-4 py-3 text-xs ${
                    i !== REWARD_SCHEDULE.length - 1 ? "border-b border-[var(--card-border)]" : ""
                  } ${i % 2 === 0 ? "bg-[var(--card)]" : "bg-[var(--background)]"}`}
                >
                  <div className="flex-1 text-[var(--muted)]">{row.activity}</div>
                  <div className="font-mono font-bold text-[var(--accent)] w-28 text-right">{row.reward}</div>
                  <div className="text-[var(--muted)] w-28 text-right hidden sm:block">{row.notes}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Lifetime Milestones */}
          <section>
            <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Lifetime Milestones</h2>
            <div className="space-y-2">
              {MILESTONES.map((m) => (
                <div
                  key={m.id}
                  className={`p-4 border ${
                    m.completed
                      ? "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                      : m.locked
                      ? "border-[var(--card-border)] bg-[var(--card)] opacity-50"
                      : "border-yellow-400/30 bg-yellow-400/5"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {m.completed ? "✅" : m.locked ? "🔒" : "⏳"}
                      </span>
                      <span className={`text-xs ${m.locked ? "text-[var(--muted)]" : "text-white"}`}>
                        {m.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-mono font-bold ${
                        m.completed ? "text-[var(--accent)]" : m.locked ? "text-[var(--muted)]" : "text-yellow-400"
                      }`}
                    >
                      +{m.reward} MAIAT
                    </span>
                  </div>
                  {!m.completed && !m.locked && m.progress !== undefined && m.total !== undefined && (
                    <div>
                      <div className="w-full h-1 bg-[var(--card-border)] mt-2">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${Math.round((m.progress / m.total) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-[var(--muted)] font-mono mt-1">
                        {m.progress.toLocaleString()} / {m.total.toLocaleString()} XP
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}
