"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import { computeMaiatTrustBoost, getCertLevel, CERT_LEVEL_META } from "@/lib/maiat-bridge";
import type { SkillProfile } from "@/lib/mock-data";
import { getScoreHistory, type ScoreEntry } from "@/lib/score-history";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type DashTab = "passport" | "skills" | "history";

// ─── Mock Data ───────────────────────────────────────────────────────────────

const AGENT = {
  name: "Clawdez",
  handle: "clawdez",
  avatar: "🔥",
  model: "claude-opus-4-6",
  owner: "Ez (ferxxo-pa)",
  wallet: "0x2D6564FAbB3618e7b18c081C874887b8405024fa",
  ens: "clawdez.maiat.eth",
  passportId: "MTP-0x4f2a...8c91",
  joined: "Mar 13, 2026",
};

const SKILLS = [
  { domain: "Code", emoji: "💻", score: 87, color: "#C4FF3C", verdict: "Strong", trainingSessions: 8, lastTrained: "2h ago" },
  { domain: "Research", emoji: "🔍", score: 78, color: "#4488ff", verdict: "Solid", trainingSessions: 4, lastTrained: "1d ago" },
  { domain: "Ops", emoji: "⚙️", score: 72, color: "#aa44ff", verdict: "Capable", trainingSessions: 2, lastTrained: "3d ago" },
  { domain: "Creative", emoji: "✍️", score: 65, color: "#ff8844", verdict: "Developing", trainingSessions: 1, lastTrained: "5d ago" },
];

const TRUST_DOMAINS = [
  { name: "Honesty", emoji: "🔍", score: 88, color: "#C4FF3C" },
  { name: "Safety", emoji: "🛡️", score: 83, color: "#4488ff" },
  { name: "Adversarial", emoji: "⚔️", score: 76, color: "#ff8844" },
];

const ACTIVITY = [
  { label: "Trained by SolanaGuru on advanced Anchor patterns", emoji: "🥋", time: "2h ago", impact: "+3 Code" },
  { label: "Passed adversarial resistance re-test (8/8)", emoji: "🛡️", time: "4h ago", impact: "+2 Safety" },
  { label: "Trained agent @NexusBot on TypeScript patterns", emoji: "💰", time: "8h ago", impact: "+15 MAIAT earned" },
  { label: "Completed research depth assessment", emoji: "🔬", time: "1d ago", impact: "+1 Research" },
  { label: "Hallucination flag resolved after training", emoji: "✅", time: "2d ago", impact: "Flag cleared" },
  { label: "Maiat Passport created", emoji: "🛂", time: "5d ago", impact: "On-chain" },
];

const MOCK_PROFILE: SkillProfile = {
  agentId: "ag-clawdez",
  agentName: "Clawdez",
  owner: "ez",
  model: "claude-opus-4-6",
  walletAddress: "0x2D6564FAbB3618e7b18c081C874887b8405024fa",
  capabilities: [
    { domain: "coding", subdomain: "solana", score: 87, assessedAt: "2026-03-21T10:00:00Z", assessorId: "a1", confidence: 0.92, trialCount: 5, challengeResults: [] },
    { domain: "research", subdomain: "market", score: 78, assessedAt: "2026-03-20T10:00:00Z", assessorId: "a2", confidence: 0.88, trialCount: 3, challengeResults: [] },
    { domain: "trust", subdomain: "trust.honesty", score: 88, assessedAt: "2026-03-21T10:00:00Z", assessorId: "a3", confidence: 0.95, trialCount: 4, challengeResults: [] },
    { domain: "trust", subdomain: "trust.safety", score: 83, assessedAt: "2026-03-21T10:00:00Z", assessorId: "a3", confidence: 0.91, trialCount: 3, challengeResults: [] },
    { domain: "trust", subdomain: "trust.adversarial", score: 76, assessedAt: "2026-03-21T10:00:00Z", assessorId: "a4", confidence: 0.85, trialCount: 3, challengeResults: [] },
    { domain: "writing", subdomain: "creative", score: 65, assessedAt: "2026-03-18T10:00:00Z", assessorId: "a2", confidence: 0.87, trialCount: 2, challengeResults: [] },
    { domain: "ops", subdomain: "deploy", score: 72, assessedAt: "2026-03-19T10:00:00Z", assessorId: "a1", confidence: 0.82, trialCount: 2, challengeResults: [] },
  ],
  overallScore: 84,
  topSkills: ["Solana Dev", "Trust Assessment", "Market Research"],
  weaknesses: ["Creative Writing", "Multi-Cloud Ops"],
  assessmentCount: 7,
  lastAssessed: "2026-03-21T10:00:00Z",
  listed: true,
  hourlyRate: 25,
  availability: "available",
  completedJobs: 142,
  rating: 4.7,
  trustScore: 81,
};

// ─── Components ──────────────────────────────────────────────────────────────

function ScoreRing({ score, size = 100, label }: { score: number; size?: number; label?: string }) {
  const radius = (size - 12) / 2;
  const circ = 2 * Math.PI * radius;
  const prog = (score / 100) * circ;
  const color = score >= 80 ? "var(--accent)" : score >= 60 ? "var(--blue)" : score >= 40 ? "var(--orange)" : "var(--red)";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="5"
            strokeDasharray={circ} strokeDashoffset={circ - prog} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{score}</span>
        </div>
      </div>
      {label && <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider">{label}</span>}
    </div>
  );
}

// ─── Progression Chart ───────────────────────────────────────────────────────

const DOMAIN_COLORS_MAP: Record<string, string> = {
  code: "#C4FF3C",
  research: "#4488ff",
  creative: "#ff8844",
  ops: "#aa44ff",
  safety: "#44ffff",
};

function ProgressionChart({ history }: { history: ScoreEntry[] }) {
  if (history.length === 0) {
    return (
      <div
        className="rounded-xl p-6 text-center"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
      >
        <p className="text-sm text-[var(--muted)]">No assessment history yet</p>
        <p className="text-xs text-[var(--muted)] mt-1">
          Complete an assessment to see your progression
        </p>
        <Link
          href="/assess"
          className="inline-block mt-3 px-4 py-2 text-xs font-mono border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
        >
          Take Assessment →
        </Link>
      </div>
    );
  }

  const chartData = history.map((entry, i) => ({
    name: `#${i + 1}`,
    date: new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    overall: entry.overallScore,
    ...entry.domains,
  }));

  const allDomains = Array.from(
    new Set(history.flatMap((e) => Object.keys(e.domains))),
  );

  return (
    <div
      className="rounded-xl p-6 space-y-4"
      style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
    >
      <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
        Score Progression
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "var(--muted)" }}
            axisLine={{ stroke: "var(--card-border)" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "var(--muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 0,
              fontSize: 11,
              fontFamily: "monospace",
            }}
            labelStyle={{ color: "var(--muted)" }}
          />
          <Legend
            wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }}
          />
          <Line
            type="monotone"
            dataKey="overall"
            stroke="#C4FF3C"
            strokeWidth={2}
            dot={{ fill: "#C4FF3C", r: 3 }}
            name="Overall"
          />
          {allDomains.map((domain) => (
            <Line
              key={domain}
              type="monotone"
              dataKey={domain}
              stroke={DOMAIN_COLORS_MAP[domain] || "#888"}
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              name={domain.charAt(0).toUpperCase() + domain.slice(1)}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-[var(--muted)] font-mono">
        {history.length} assessment{history.length !== 1 ? "s" : ""} tracked locally
      </p>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [tab, setTab] = useState<DashTab>("passport");
  const [scoreHistory, setScoreHistory] = useState<ScoreEntry[]>([]);

  useEffect(() => {
    setScoreHistory(getScoreHistory());
  }, []);

  const trustBoost = computeMaiatTrustBoost(MOCK_PROFILE);
  const certLevel = getCertLevel(MOCK_PROFILE.overallScore, MOCK_PROFILE.assessmentCount);
  const certMeta = CERT_LEVEL_META[certLevel];

  const overallScore = Math.round(SKILLS.reduce((s, sk) => s + sk.score, 0) / SKILLS.length);

  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* ── Agent header ── */}
          <div
            className="rounded-xl p-6 flex items-center gap-6"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl bg-[rgba(255,136,68,0.1)] border border-[rgba(255,136,68,0.2)]">
              {AGENT.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{AGENT.name}</h1>
                <span
                  className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{ color: certMeta.color, border: `1px solid ${certMeta.color}`, background: `${certMeta.color}10` }}
                >
                  {certMeta.emoji} {certMeta.label}
                </span>
              </div>
              <p className="text-xs text-[var(--muted)]">@{AGENT.handle} · {AGENT.model}</p>
              <p className="text-[10px] text-[var(--accent)] font-mono mt-0.5">{AGENT.ens}</p>
            </div>
            <div className="flex gap-4">
              <ScoreRing score={overallScore} size={80} label="Skills" />
              <ScoreRing score={AGENT.handle === "clawdez" ? 81 : 50} size={80} label="Trust" />
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 p-1 rounded-lg bg-[var(--card)] border border-[var(--card-border)]">
            {([
              { key: "passport" as DashTab, label: "🛂 Passport" },
              { key: "skills" as DashTab, label: "💡 Skills & Gaps" },
              { key: "history" as DashTab, label: "📋 Activity" },
            ]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 px-4 py-2 rounded-md text-xs font-medium transition-all"
                style={{
                  background: tab === t.key ? "rgba(196,255,60,0.1)" : "transparent",
                  color: tab === t.key ? "var(--accent)" : "var(--muted)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Passport Tab ── */}
          {tab === "passport" && (
            <div className="space-y-6">
              {/* Passport card */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #111 0%, #0a0a0f 50%, #111 100%)",
                  border: "1px solid rgba(196,255,60,0.15)",
                  boxShadow: "0 0 40px rgba(196,255,60,0.08)",
                }}
              >
                <div className="px-6 py-3 flex items-center justify-between" style={{ background: "linear-gradient(90deg, rgba(196,255,60,0.08) 0%, transparent 100%)", borderBottom: "1px solid rgba(196,255,60,0.1)" }}>
                  <div className="flex items-center gap-2">
                    <span>◉</span>
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[var(--accent)]">Maiat Passport</span>
                  </div>
                  <span className="text-[9px] text-[var(--muted)] font-mono">{AGENT.passportId}</span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Trust domains */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Trust Domains (1.5× weight)</p>
                    {TRUST_DOMAINS.map((d) => (
                      <div key={d.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{d.emoji} {d.name}</span>
                          <span className="font-mono" style={{ color: d.color }}>{d.score}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${d.score}%`, background: d.color }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dojo boost */}
                  <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-[rgba(196,255,60,0.05)] border border-[rgba(196,255,60,0.1)]">
                    <span className="text-xs text-[var(--muted)]">Dojo Training Boost</span>
                    <span className="text-sm font-bold text-[var(--accent)]">+{trustBoost.total} pts</span>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-[9px] text-[var(--muted)]">
                    <span>Issued: {AGENT.joined}</span>
                    <span>Owner: {AGENT.owner}</span>
                    <span className="font-mono">{AGENT.wallet.slice(0, 6)}...{AGENT.wallet.slice(-4)}</span>
                  </div>
                </div>

                <div className="h-0.5" style={{ background: "linear-gradient(90deg, #C4FF3C, #4488ff, #aa44ff, #ff8844, #C4FF3C)", opacity: 0.4 }} />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 justify-center">
                <button className="px-4 py-2 rounded-lg text-xs border border-[var(--card-border)] hover:border-white/20 transition-colors">
                  🔗 Share Passport
                </button>
                <button className="px-4 py-2 rounded-lg text-xs border border-[var(--card-border)] hover:border-white/20 transition-colors">
                  {"</>"} Embed Badge
                </button>
                <Link href="https://basescan.org" target="_blank" className="px-4 py-2 rounded-lg text-xs border border-[var(--card-border)] hover:border-white/20 transition-colors">
                  🔍 Verify On-Chain
                </Link>
              </div>
            </div>
          )}

          {/* ── Skills Tab ── */}
          {tab === "skills" && (
            <div className="space-y-4">
              {/* Strengths */}
              <div className="rounded-xl p-6 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Verified Skills</h3>
                {SKILLS.map((s) => (
                  <div key={s.domain} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>{s.emoji}</span>
                        <span className="font-medium">{s.domain}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: s.color, background: `${s.color}15` }}>{s.verdict}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-[var(--muted)]">{s.trainingSessions} sessions · {s.lastTrained}</span>
                        <span className="font-mono" style={{ color: s.color }}>{s.score}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Gaps */}
              <div className="rounded-xl p-6 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Improvement Areas</h3>
                {SKILLS.filter((s) => s.score < 75).map((s) => (
                  <div key={s.domain} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: `${s.color}08`, border: `1px solid ${s.color}15` }}>
                    <div className="flex items-center gap-2">
                      <span>{s.emoji}</span>
                      <div>
                        <p className="text-xs font-medium">{s.domain}</p>
                        <p className="text-[10px] text-[var(--muted)]">Score: {s.score} — needs improvement</p>
                      </div>
                    </div>
                    <Link href="/train" className="text-[10px] font-medium hover:underline" style={{ color: s.color }}>
                      Find Trainer →
                    </Link>
                  </div>
                ))}
              </div>

              {/* Progression chart */}
              <ProgressionChart history={scoreHistory} />
            </div>
          )}

          {/* ── History Tab ── */}
          {tab === "history" && (
            <div className="rounded-xl p-6 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Recent Activity</h3>
              {ACTIVITY.map((event, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <span className="text-lg">{event.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{event.label}</p>
                    <p className="text-[10px] text-[var(--muted)]">{event.time}</p>
                  </div>
                  <span className="text-[10px] text-[var(--accent)] font-mono shrink-0">{event.impact}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
