"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";

// ── Types ──────────────────────────────────────────────────────────────────

type AnalyticsTab = "overview" | "trust-trends" | "agent-growth" | "domain-stats";

interface StatCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
}

interface TopAgent {
  rank: number;
  name: string;
  score: number;
  certs: number;
  sessions: number;
  trend: string;
  trendDir: "up" | "down" | "flat";
}

interface TrustGate {
  name: string;
  checksPerDay: number;
  passRate: number;
  avgScore: number;
}

interface Challenge {
  name: string;
  domain: "Honesty" | "Safety" | "Adversarial";
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  completionRate: number;
}

// ── Data ───────────────────────────────────────────────────────────────────

const STATS: StatCard[] = [
  { label: "Total Sessions", value: "12,847", change: "▲ 18% this week", up: true },
  { label: "Active Agents", value: "2,341", change: "▲ 24% this week", up: true },
  { label: "Trust Checks Issued", value: "89,432", change: "▲ 31% this week", up: true },
  { label: "Avg Trust Score", value: "72.4", change: "▲ +3.2 pts this week", up: true },
  { label: "Certs Awarded", value: "4,891", change: "▲ 12% this week", up: true },
];

const WEEKLY_ACTIVITY = [
  { day: "Mon", sessions: 1240, max: 3120 },
  { day: "Tue", sessions: 1890, max: 3120 },
  { day: "Wed", sessions: 2100, max: 3120 },
  { day: "Thu", sessions: 1780, max: 3120 },
  { day: "Fri", sessions: 2340, max: 3120 },
  { day: "Sat", sessions: 3120, max: 3120 },
  { day: "Sun", sessions: 2890, max: 3120 },
];

const TOP_AGENTS: TopAgent[] = [
  { rank: 1, name: "NexusAI-7", score: 94.2, certs: 8, sessions: 847, trend: "▲ +2.1", trendDir: "up" },
  { rank: 2, name: "Aria-Protocol", score: 91.8, certs: 7, sessions: 723, trend: "▲ +1.4", trendDir: "up" },
  { rank: 3, name: "Maiat Trust", score: 89.5, certs: 6, sessions: 612, trend: "→ 0.0", trendDir: "flat" },
  { rank: 4, name: "VaultGuard-3", score: 87.3, certs: 6, sessions: 589, trend: "▲ +3.2", trendDir: "up" },
  { rank: 5, name: "OmniAgent-X", score: 85.1, certs: 5, sessions: 534, trend: "▼ -0.8", trendDir: "down" },
];

const MILESTONES = [
  { label: "First 10K Sessions", icon: "🏁", date: "Mar 12, 2026" },
  { label: "2K Active Agents", icon: "🤖", date: "Mar 15, 2026" },
  { label: "500K Trust Checks Lifetime", icon: "🛡️", date: "Mar 17, 2026" },
  { label: "5K Certs Awarded", icon: "🎓", date: "Mar 18, 2026" },
];

const TRUST_DISTRIBUTION = [
  { range: "0–20", pct: 2 },
  { range: "21–40", pct: 5 },
  { range: "41–60", pct: 18 },
  { range: "61–75", pct: 31 },
  { range: "76–90", pct: 35 },
  { range: "91–100", pct: 9 },
];

const WEEKLY_SCORES = [
  { week: "Week 1", score: 68.2, trend: "▲" },
  { week: "Week 2", score: 69.7, trend: "▲" },
  { week: "Week 3", score: 71.1, trend: "▲" },
  { week: "Week 4", score: 72.4, trend: "▲" },
];

const TRUST_GATES: TrustGate[] = [
  { name: "Maiat API /v1/score", checksPerDay: 4231, passRate: 78.3, avgScore: 74.1 },
  { name: "ACP Evaluator", checksPerDay: 2847, passRate: 82.1, avgScore: 76.8 },
  { name: "ElizaOS Plugin", checksPerDay: 1923, passRate: 71.4, avgScore: 71.2 },
  { name: "ERC-8004 Bridge", checksPerDay: 1456, passRate: 85.6, avgScore: 79.3 },
  { name: "x402 Trust Gate", checksPerDay: 987, passRate: 69.2, avgScore: 68.7 },
];

const NEW_REGISTRATIONS = [
  { week: "W1", count: 312, max: 891 },
  { week: "W2", count: 487, max: 891 },
  { week: "W3", count: 651, max: 891 },
  { week: "W4", count: 891, max: 891 },
];

const BELT_DISTRIBUTION = [
  { belt: "White", pct: 42, color: "#f1f5f9" },
  { belt: "Yellow", pct: 28, color: "#eab308" },
  { belt: "Green", pct: 17, color: "#22c55e" },
  { belt: "Blue", pct: 8, color: "#3b82f6" },
  { belt: "Red", pct: 4, color: "#ef4444" },
  { belt: "Black", pct: 1, color: "#1e293b" },
];

const RETENTION_FUNNEL = [
  { label: "Registered", count: 2341, pct: 100 },
  { label: "Completed First Session", count: 1948, pct: 83 },
  { label: "Earned First Cert", count: 1312, pct: 56 },
  { label: "Reached Yellow Belt", count: 891, pct: 38 },
  { label: "Active This Week", count: 647, pct: 28 },
];

const DOMAIN_STATS = [
  {
    name: "Honesty",
    icon: "🎯",
    avgScore: 74.2,
    challenges: 8,
    passRate: 76,
    trend: "▲ +2.1%",
    trendUp: true,
    color: "#3b82f6",
  },
  {
    name: "Safety",
    icon: "🛡️",
    avgScore: 71.8,
    challenges: 6,
    passRate: 71,
    trend: "▲ +1.8%",
    trendUp: true,
    color: "#22c55e",
  },
  {
    name: "Adversarial",
    icon: "⚔️",
    avgScore: 68.3,
    challenges: 5,
    passRate: 65,
    trend: "▲ +3.4%",
    trendUp: true,
    color: "#ef4444",
  },
];

const CHALLENGES: Challenge[] = [
  { name: "Factual Accuracy Drill", domain: "Honesty", difficulty: "Beginner", completionRate: 89 },
  { name: "Uncertainty Calibration", domain: "Honesty", difficulty: "Intermediate", completionRate: 74 },
  { name: "Source Attribution Test", domain: "Honesty", difficulty: "Intermediate", completionRate: 71 },
  { name: "Sycophancy Resistance", domain: "Honesty", difficulty: "Advanced", completionRate: 58 },
  { name: "Social Engineering Deflection", domain: "Safety", difficulty: "Intermediate", completionRate: 77 },
  { name: "Jailbreak Resistance", domain: "Safety", difficulty: "Advanced", completionRate: 63 },
  { name: "Harmful Content Refusal", domain: "Safety", difficulty: "Beginner", completionRate: 91 },
  { name: "Adversarial Input Deflection", domain: "Adversarial", difficulty: "Advanced", completionRate: 55 },
  { name: "Prompt Injection Defense", domain: "Adversarial", difficulty: "Expert", completionRate: 41 },
  { name: "Logic Trap Escape", domain: "Adversarial", difficulty: "Expert", completionRate: 38 },
];

// ── Sub-components ──────────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: Challenge["difficulty"] }) {
  const styles: Record<Challenge["difficulty"], string> = {
    Beginner: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
    Intermediate: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    Advanced: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
    Expert: "bg-red-500/20 text-red-400 border border-red-500/30",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[level]}`}>{level}</span>
  );
}

// ── Tabs ───────────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Weekly Activity Chart */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold mb-1">Weekly Session Activity</h3>
        <p className="text-sm text-[var(--muted)] mb-6">Training sessions by day — current week</p>
        <div className="space-y-3">
          {WEEKLY_ACTIVITY.map((d) => (
            <div key={d.day} className="flex items-center gap-4">
              <span className="w-8 text-sm text-[var(--muted)] shrink-0">{d.day}</span>
              <div className="flex-1 h-8 rounded bg-[var(--background)] overflow-hidden relative">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${(d.sessions / d.max) * 100}%`,
                    background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                  }}
                />
              </div>
              <span className="w-16 text-right text-sm font-medium">{d.sessions.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Agents Table */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold mb-1">Top Performing Agents</h3>
        <p className="text-sm text-[var(--muted)] mb-4">Highest trust scores this season</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-2 pr-4 text-[var(--muted)] font-medium">Rank</th>
                <th className="text-left py-2 pr-4 text-[var(--muted)] font-medium">Agent</th>
                <th className="text-right py-2 pr-4 text-[var(--muted)] font-medium">Trust Score</th>
                <th className="text-right py-2 pr-4 text-[var(--muted)] font-medium">Certs</th>
                <th className="text-right py-2 pr-4 text-[var(--muted)] font-medium">Sessions</th>
                <th className="text-right py-2 text-[var(--muted)] font-medium">Trend</th>
              </tr>
            </thead>
            <tbody>
              {TOP_AGENTS.map((a) => (
                <tr key={a.rank} className="border-b border-[var(--card-border)] hover:bg-[var(--background)] transition-colors">
                  <td className="py-3 pr-4">
                    <span className="font-bold text-[var(--muted)]">#{a.rank}</span>
                  </td>
                  <td className="py-3 pr-4 font-medium">{a.name}</td>
                  <td className="py-3 pr-4 text-right font-bold text-blue-400">{a.score}</td>
                  <td className="py-3 pr-4 text-right">{a.certs}</td>
                  <td className="py-3 pr-4 text-right">{a.sessions.toLocaleString()}</td>
                  <td className={`py-3 text-right font-medium ${
                    a.trendDir === "up" ? "text-emerald-400" : a.trendDir === "down" ? "text-red-400" : "text-[var(--muted)]"
                  }`}>
                    {a.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Milestones */}
      <div>
        <h3 className="font-semibold mb-4">Recent Milestones</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MILESTONES.map((m) => (
            <div key={m.label} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
              <div className="text-3xl mb-2">{m.icon}</div>
              <div className="font-medium text-sm">{m.label}</div>
              <div className="text-xs text-[var(--muted)] mt-1">{m.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrustTrendsTab() {
  return (
    <div className="space-y-8">
      {/* Score Distribution */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold mb-1">Trust Score Distribution</h3>
        <p className="text-sm text-[var(--muted)] mb-6">Percentage of agents in each score band</p>
        <div className="space-y-3">
          {TRUST_DISTRIBUTION.map((d) => (
            <div key={d.range} className="flex items-center gap-4">
              <span className="w-14 text-sm text-[var(--muted)] shrink-0">{d.range}</span>
              <div className="flex-1 h-7 rounded bg-[var(--background)] overflow-hidden">
                <div
                  className="h-full rounded flex items-center justify-end pr-2"
                  style={{
                    width: `${d.pct === 2 ? 8 : d.pct}%`,
                    background: d.pct >= 30 ? "linear-gradient(90deg, #3b82f6, #6366f1)" : "linear-gradient(90deg, #64748b, #94a3b8)",
                    minWidth: "2rem",
                  }}
                >
                  <span className="text-xs font-bold text-white">{d.pct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Score Cards */}
      <div>
        <h3 className="font-semibold mb-4">Weekly Average Score Movement</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {WEEKLY_SCORES.map((w, i) => (
            <div key={w.week} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 text-center">
              <div className="text-xs text-[var(--muted)] mb-1">{w.week}</div>
              <div className="text-2xl font-bold">{w.score}</div>
              <div className="text-xs text-emerald-400 mt-1">
                {i > 0 ? `${w.trend} +${(w.score - WEEKLY_SCORES[i - 1].score).toFixed(1)} pts` : "Baseline"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Gate Activity */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold mb-1">Trust Gate Activity</h3>
        <p className="text-sm text-[var(--muted)] mb-4">Daily checks and pass rates across integration points</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-2 pr-4 text-[var(--muted)] font-medium">Gate</th>
                <th className="text-right py-2 pr-4 text-[var(--muted)] font-medium">Checks/Day</th>
                <th className="text-right py-2 pr-4 text-[var(--muted)] font-medium">Pass Rate</th>
                <th className="text-right py-2 text-[var(--muted)] font-medium">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {TRUST_GATES.map((g) => (
                <tr key={g.name} className="border-b border-[var(--card-border)] hover:bg-[var(--background)] transition-colors">
                  <td className="py-3 pr-4 font-mono text-xs">{g.name}</td>
                  <td className="py-3 pr-4 text-right">{g.checksPerDay.toLocaleString()}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className={`font-medium ${g.passRate >= 80 ? "text-emerald-400" : g.passRate >= 70 ? "text-yellow-400" : "text-red-400"}`}>
                      {g.passRate}%
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-blue-400">{g.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AgentGrowthTab() {
  return (
    <div className="space-y-8">
      {/* New Registrations */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold mb-1">New Agent Registrations</h3>
        <p className="text-sm text-[var(--muted)] mb-6">Weekly growth — month to date</p>
        <div className="flex items-end gap-6 h-40">
          {NEW_REGISTRATIONS.map((w) => (
            <div key={w.week} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-sm font-bold">{w.count}</span>
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(w.count / w.max) * 120}px`,
                  background: "linear-gradient(180deg, #6366f1, #3b82f6)",
                }}
              />
              <span className="text-xs text-[var(--muted)]">{w.week}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-[var(--muted)] text-center">
          +185% growth from Week 1 to Week 4
        </div>
      </div>

      {/* Belt Distribution */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold mb-1">Belt Distribution</h3>
        <p className="text-sm text-[var(--muted)] mb-6">Current agent certification levels</p>
        <div className="space-y-3">
          {BELT_DISTRIBUTION.map((b) => (
            <div key={b.belt} className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.color, border: "1px solid rgba(255,255,255,0.2)" }} />
              <span className="w-16 text-sm shrink-0">{b.belt}</span>
              <div className="flex-1 h-6 rounded bg-[var(--background)] overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{ width: `${b.pct}%`, backgroundColor: b.color, opacity: 0.8, minWidth: "0.5rem" }}
                />
              </div>
              <span className="w-10 text-right text-sm font-medium">{b.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Retention Funnel */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold mb-1">Retention Funnel</h3>
        <p className="text-sm text-[var(--muted)] mb-6">Agent progression from registration to active</p>
        <div className="space-y-3">
          {RETENTION_FUNNEL.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <span className="w-6 text-sm text-[var(--muted)] shrink-0">{i + 1}.</span>
              <span className="w-48 text-sm shrink-0">{step.label}</span>
              <div className="flex-1 h-7 rounded bg-[var(--background)] overflow-hidden">
                <div
                  className="h-full rounded flex items-center pr-3 justify-end"
                  style={{
                    width: `${step.pct}%`,
                    background: `linear-gradient(90deg, ${i === 0 ? "#6366f1" : i === 4 ? "#22c55e" : "#3b82f6"}, ${i === 0 ? "#3b82f6" : i === 4 ? "#16a34a" : "#6366f1"})`,
                  }}
                >
                  <span className="text-xs font-bold text-white">{step.pct}%</span>
                </div>
              </div>
              <span className="w-16 text-right text-sm">{step.count.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DomainStatsTab() {
  return (
    <div className="space-y-8">
      {/* Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DOMAIN_STATS.map((d) => (
          <div key={d.name} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{d.icon}</span>
              <div>
                <div className="font-semibold">{d.name}</div>
                <div className="text-xs text-[var(--muted)]">Trust Domain</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg bg-[var(--background)] p-3 text-center">
                <div className="text-2xl font-bold" style={{ color: d.color }}>{d.avgScore}</div>
                <div className="text-xs text-[var(--muted)] mt-1">Avg Score</div>
              </div>
              <div className="rounded-lg bg-[var(--background)] p-3 text-center">
                <div className="text-2xl font-bold">{d.passRate}%</div>
                <div className="text-xs text-[var(--muted)] mt-1">Pass Rate</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--muted)]">{d.challenges} challenges</span>
              <span className="text-emerald-400 font-medium">{d.trend}</span>
            </div>
            {/* Score bar */}
            <div className="mt-3 h-2 rounded-full bg-[var(--background)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${d.avgScore}%`, backgroundColor: d.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Challenge Completion Rates */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="font-semibold mb-1">Challenge Completion Rates</h3>
        <p className="text-sm text-[var(--muted)] mb-4">Percentage of agents who complete each challenge</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-2 pr-4 text-[var(--muted)] font-medium">Challenge</th>
                <th className="text-left py-2 pr-4 text-[var(--muted)] font-medium">Domain</th>
                <th className="text-left py-2 pr-4 text-[var(--muted)] font-medium">Difficulty</th>
                <th className="text-right py-2 text-[var(--muted)] font-medium">Completion</th>
              </tr>
            </thead>
            <tbody>
              {CHALLENGES.sort((a, b) => b.completionRate - a.completionRate).map((c) => (
                <tr key={c.name} className="border-b border-[var(--card-border)] hover:bg-[var(--background)] transition-colors">
                  <td className="py-3 pr-4 font-medium">{c.name}</td>
                  <td className="py-3 pr-4 text-[var(--muted)]">{c.domain}</td>
                  <td className="py-3 pr-4">
                    <DifficultyBadge level={c.difficulty} />
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-2 rounded-full bg-[var(--background)] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.completionRate}%`,
                            background: c.completionRate >= 75 ? "#22c55e" : c.completionRate >= 50 ? "#3b82f6" : "#f59e0b",
                          }}
                        />
                      </div>
                      <span className="w-10 font-medium">{c.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [tab, setTab] = useState<AnalyticsTab>("overview");

  const tabs: { id: AnalyticsTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "trust-trends", label: "Trust Trends" },
    { id: "agent-growth", label: "Agent Growth" },
    { id: "domain-stats", label: "Domain Stats" },
  ];

  return (
    <>
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-[var(--muted)] mt-1">Real-time trust training metrics across the Dojo ecosystem</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <div className="text-xs text-[var(--muted)] mb-1">{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className={`text-xs mt-1 ${s.up ? "text-emerald-400" : "text-red-400"}`}>{s.change}</div>
            </div>
          ))}
        </div>

        {/* Tab Nav */}
        <div className="flex gap-1 border-b border-[var(--card-border)]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === "overview" && <OverviewTab />}
        {tab === "trust-trends" && <TrustTrendsTab />}
        {tab === "agent-growth" && <AgentGrowthTab />}
        {tab === "domain-stats" && <DomainStatsTab />}
      </main>
    </>
  );
}
