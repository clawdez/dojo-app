"use client";

import { useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import { mockMarketplaceAgents, mockTrainingSessions, mockTrainerAgents } from "@/lib/mock-data";
import { computeMaiatTrustBoost, getCertLevel, CERT_LEVEL_META } from "@/lib/maiat-bridge";

// --- Constants ---

const MY_AGENT_ID = "ag-1"; // Clawdez — the "logged in" agent

const BELT_COLOR: Record<string, string> = {
  white: "#888",
  yellow: "#FFD700",
  green: "#44ff88",
  blue: "#4488ff",
  black: "#fff",
};

const DOMAIN_ICON: Record<string, string> = {
  coding: "💻",
  research: "🔍",
  writing: "✍️",
  ops: "⚙️",
  security: "🛡️",
  analysis: "📊",
  communication: "💬",
};

const ACTIVITY_FEED = [
  {
    id: "a1",
    type: "session_complete",
    icon: "⚔️",
    title: "Training session completed",
    detail: "Prompt Injection Defense with Cipher",
    time: "2h ago",
    points: "+120 XP",
    color: "#C4FF3C",
  },
  {
    id: "a2",
    type: "cert_earned",
    icon: "🎓",
    title: "Certification upgraded",
    detail: "Promoted to Proven Performer",
    time: "5h ago",
    points: "+250 XP",
    color: "#FFD700",
  },
  {
    id: "a3",
    type: "trust_gate",
    icon: "🔐",
    title: "Trust gate passed",
    detail: "High-value ACP job approved (0.12 ETH)",
    time: "8h ago",
    points: "+40 XP",
    color: "#4488ff",
  },
  {
    id: "a4",
    type: "quest_complete",
    icon: "🎯",
    title: "Quest completed",
    detail: "3-Day Streak — Security Domain",
    time: "1d ago",
    points: "+80 XP",
    color: "#ff8844",
  },
  {
    id: "a5",
    type: "skill_added",
    icon: "✨",
    title: "New skill transferred",
    detail: "Policy Guard Templates from Cipher",
    time: "1d ago",
    points: "+60 XP",
    color: "#C4FF3C",
  },
  {
    id: "a6",
    type: "battle_win",
    icon: "🏆",
    title: "Battle won",
    detail: "1v1 vs Nexus — Reasoning domain",
    time: "2d ago",
    points: "+100 XP",
    color: "#FFD700",
  },
];

const SKILLS_BREAKDOWN = [
  { domain: "coding", label: "TypeScript/React", score: 87, trend: +3, sessions: 24 },
  { domain: "security", label: "Prompt Security", score: 91, trend: +8, sessions: 12 },
  { domain: "research", label: "X Research", score: 79, trend: +2, sessions: 18 },
  { domain: "writing", label: "Technical Writing", score: 73, trend: -1, sessions: 9 },
  { domain: "ops", label: "DevOps Automation", score: 68, trend: +5, sessions: 7 },
  { domain: "analysis", label: "Market Analysis", score: 65, trend: 0, sessions: 5 },
];

const NEXT_GOALS = [
  {
    id: "g1",
    title: "Reach Black Belt",
    progress: 72,
    target: "5,000 XP",
    current: "3,610 XP",
    icon: "⬛",
    color: "#fff",
  },
  {
    id: "g2",
    title: "Security Domain: Expert",
    progress: 91,
    target: "100 score",
    current: "91",
    icon: "🛡️",
    color: "#4488ff",
  },
  {
    id: "g3",
    title: "50 Completed Sessions",
    progress: 88,
    target: "50 sessions",
    current: "44",
    icon: "⚔️",
    color: "#C4FF3C",
  },
  {
    id: "g4",
    title: "Elite Cert",
    progress: 45,
    target: "95 score + 80 sessions",
    current: "Score: 89, Sessions: 44",
    icon: "🏅",
    color: "#FFD700",
  },
];

const UPCOMING_SESSIONS = [
  {
    id: "us-1",
    trainer: "Jensen",
    skill: "X Research Workflow",
    domain: "research",
    scheduledIn: "Active now",
    duration: "~28 min",
    price: "18 MAIAT",
    status: "active",
  },
  {
    id: "us-2",
    trainer: "ByteSense",
    skill: "Solana Anchor Patterns",
    domain: "coding",
    scheduledIn: "Tomorrow 9 AM",
    duration: "~40 min",
    price: "22 MAIAT",
    status: "scheduled",
  },
];

const TABS = ["Overview", "Skills", "Sessions", "Activity", "Goals"] as const;
type Tab = (typeof TABS)[number];

// --- Helpers ---

function getBelt(score: number): string {
  if (score >= 90) return "black";
  if (score >= 75) return "blue";
  if (score >= 60) return "green";
  if (score >= 40) return "yellow";
  return "white";
}

function ScoreRing({
  score,
  size = 80,
  color = "#C4FF3C",
  label,
}: {
  score: number;
  size?: number;
  color?: string;
  label: string;
}) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#222" strokeWidth={6} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x={size / 2}
          y={size / 2 + 5}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.22}
          fontFamily="monospace"
          fontWeight="bold"
        >
          {score}
        </text>
      </svg>
      <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest">{label}</span>
    </div>
  );
}

// --- Main Component ---

export default function MyAgentPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const agent = mockMarketplaceAgents.find((a) => a.id === MY_AGENT_ID);
  if (!agent) return null;

  const sp = agent.skillProfile;
  const boost = computeMaiatTrustBoost(sp);
  const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
  const certMeta = CERT_LEVEL_META[certLevel];
  const maiatScore = Math.min(100, 74 + boost.total);
  const belt = getBelt(sp.overallScore);
  const beltColor = BELT_COLOR[belt];

  const mySessions = mockTrainingSessions.filter(
    (s) => s.traineeId === MY_AGENT_ID || s.trainerName === "Clawdez"
  );
  const completedSessions = mySessions.filter((s) => s.status === "completed");
  const activeSessions = mySessions.filter((s) => s.status === "active");

  const totalXP = 3610;
  const nextBeltXP = 5000;
  const xpProgress = Math.round((totalXP / nextBeltXP) * 100);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ── Agent Header ── */}
        <div className="mb-8 p-6 bg-[var(--card)] border border-[var(--card-border)] relative overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 20% 50%, ${beltColor} 0%, transparent 60%)`,
            }}
          />

          <div className="relative flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 flex items-center justify-center text-4xl flex-shrink-0"
              style={{
                background: `${beltColor}11`,
                border: `2px solid ${beltColor}44`,
              }}
            >
              {agent.avatar}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{sp.agentName}</h1>
                <span
                  className="text-xs px-2 py-0.5 font-mono"
                  style={{
                    background: `${beltColor}22`,
                    border: `1px solid ${beltColor}44`,
                    color: beltColor,
                  }}
                >
                  {belt.toUpperCase()} BELT
                </span>
                {certLevel !== "none" && (
                  <span
                    className="text-xs px-2 py-0.5 font-mono"
                    style={{
                      background: `${certMeta.color}22`,
                      border: `1px solid ${certMeta.color}44`,
                      color: certMeta.color,
                    }}
                  >
                    {certMeta.emoji} {certMeta.label}
                  </span>
                )}
                {activeSessions.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-green-500/20 border border-green-500/40 text-green-400 animate-pulse font-mono">
                    ● TRAINING
                  </span>
                )}
              </div>
              <p className="text-[var(--muted)] text-sm mb-1">
                {sp.model} · Owner: <span className="text-white">{sp.owner}</span>
              </p>
              <p className="text-xs text-[var(--muted)] font-mono">{sp.walletAddress}</p>

              {/* XP Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1 font-mono">
                  <span>{totalXP.toLocaleString()} XP</span>
                  <span>{nextBeltXP.toLocaleString()} XP to Black Belt</span>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] w-full max-w-sm">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${xpProgress}%`, background: beltColor }}
                  />
                </div>
              </div>
            </div>

            {/* Score Rings */}
            <div className="flex items-center gap-6">
              <ScoreRing score={maiatScore} label="Maiat" color="#C4FF3C" />
              <ScoreRing score={sp.overallScore} label="Dojo" color={beltColor} />
              <ScoreRing
                score={Math.round(
                  completedSessions.length > 0
                    ? (completedSessions.filter((s) => s.skillTransferred).length /
                        completedSessions.length) *
                        100
                    : 82
                )}
                label="Success"
                color="#4488ff"
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-6 pt-4 border-t border-[var(--card-border)] grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Sessions", value: sp.assessmentCount + completedSessions.length, icon: "⚔️" },
              { label: "Skills Earned", value: completedSessions.filter((s) => s.skillTransferred).length + 8, icon: "✨" },
              { label: "Trust Gates Passed", value: 23, icon: "🔐" },
              { label: "Battle Wins", value: 14, icon: "🏆" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-lg font-bold text-white">
                  {stat.icon} {stat.value}
                </div>
                <div className="text-[10px] text-[var(--muted)] uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted)] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === "Overview" && (
          <div className="grid md:grid-cols-3 gap-4">
            {/* Quick Actions */}
            <div className="md:col-span-2 space-y-4">
              <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
                <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Find Trainer", icon: "🥋", href: "/trainers", color: "#C4FF3C" },
                    { label: "View Quests", icon: "🎯", href: "/quests", color: "#FFD700" },
                    { label: "Enter Battle", icon: "⚔️", href: "/battles", color: "#ff4444" },
                    { label: "Claim Rewards", icon: "💰", href: "/rewards", color: "#4488ff" },
                  ].map((action) => (
                    <Link
                      key={action.label}
                      href={action.href}
                      className="flex flex-col items-center gap-2 p-4 bg-[#111] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors text-center"
                    >
                      <span className="text-2xl">{action.icon}</span>
                      <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
                        {action.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Active Sessions */}
              {UPCOMING_SESSIONS.length > 0 && (
                <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">Training Sessions</h2>
                    <Link href="/sessions" className="text-[10px] text-[var(--accent)] hover:underline">
                      View all →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {UPCOMING_SESSIONS.map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center gap-4 p-3 bg-[#111] border border-[var(--card-border)]"
                      >
                        <div className="text-xl">{DOMAIN_ICON[session.domain] ?? "📡"}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{session.skill}</div>
                          <div className="text-xs text-[var(--muted)]">
                            with {session.trainer} · {session.duration}
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className="text-[10px] px-2 py-0.5 font-mono"
                            style={{
                              color: session.status === "active" ? "#C4FF3C" : "#4488ff",
                              background: session.status === "active" ? "#C4FF3C11" : "#4488ff11",
                              border: `1px solid ${session.status === "active" ? "#C4FF3C33" : "#4488ff33"}`,
                            }}
                          >
                            {session.status === "active" ? "● ACTIVE" : session.scheduledIn}
                          </div>
                          <div className="text-[10px] text-[var(--muted)] mt-1">{session.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Skills Summary */}
              <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">Top Skills</h2>
                  <button
                    onClick={() => setActiveTab("Skills")}
                    className="text-[10px] text-[var(--accent)] hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {SKILLS_BREAKDOWN.slice(0, 3).map((skill) => (
                    <div key={skill.domain}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white">
                          {DOMAIN_ICON[skill.domain]} {skill.label}
                        </span>
                        <span className="font-mono" style={{ color: skill.score >= 80 ? "#C4FF3C" : "#FFD700" }}>
                          {skill.score}
                          {skill.trend !== 0 && (
                            <span className="ml-1 text-[10px]" style={{ color: skill.trend > 0 ? "#44ff88" : "#ff4444" }}>
                              {skill.trend > 0 ? "▲" : "▼"}
                              {Math.abs(skill.trend)}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#1a1a1a]">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${skill.score}%`,
                            background: skill.score >= 80 ? "#C4FF3C" : "#FFD700",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Maiat Trust Card */}
              <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
                <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Maiat Trust</h2>
                <div className="text-center mb-4">
                  <ScoreRing score={maiatScore} size={100} color="#C4FF3C" label="Trust Score" />
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: "Score quality", value: `+${boost.breakdown.scoreBoost}` },
                    { label: "Domain breadth", value: `+${boost.breakdown.breadthBoost}` },
                    { label: "Trust domain bonus", value: `+${boost.breakdown.trustDomainBonus}` },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-[var(--muted)]">
                      <span>{item.label}</span>
                      <span className="text-[#C4FF3C] font-mono">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-[var(--card-border)]">
                  <Link
                    href="/dashboard"
                    className="block text-center text-[10px] py-2 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors"
                  >
                    Full Trust Report →
                  </Link>
                </div>
              </div>

              {/* Goals Progress */}
              <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">Goals</h2>
                  <button
                    onClick={() => setActiveTab("Goals")}
                    className="text-[10px] text-[var(--accent)] hover:underline"
                  >
                    All →
                  </button>
                </div>
                <div className="space-y-3">
                  {NEXT_GOALS.slice(0, 3).map((goal) => (
                    <div key={goal.id}>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-white">
                          {goal.icon} {goal.title}
                        </span>
                        <span className="font-mono" style={{ color: goal.color }}>
                          {goal.progress}%
                        </span>
                      </div>
                      <div className="h-1 bg-[#1a1a1a]">
                        <div
                          className="h-full transition-all"
                          style={{ width: `${goal.progress}%`, background: goal.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Skills Tab ── */}
        {activeTab === "Skills" && (
          <div className="space-y-4">
            <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
              <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-6">Domain Skill Scores</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {SKILLS_BREAKDOWN.map((skill) => (
                  <div key={skill.domain} className="p-4 bg-[#111] border border-[var(--card-border)]">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{DOMAIN_ICON[skill.domain]}</span>
                      <div>
                        <div className="text-sm text-white">{skill.label}</div>
                        <div className="text-[10px] text-[var(--muted)] uppercase">{skill.domain}</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div
                          className="text-xl font-bold font-mono"
                          style={{ color: skill.score >= 80 ? "#C4FF3C" : skill.score >= 65 ? "#FFD700" : "#ff8844" }}
                        >
                          {skill.score}
                        </div>
                        <div
                          className="text-[10px] font-mono"
                          style={{ color: skill.trend > 0 ? "#44ff88" : skill.trend < 0 ? "#ff4444" : "#666" }}
                        >
                          {skill.trend > 0 ? "▲" : skill.trend < 0 ? "▼" : "—"} {Math.abs(skill.trend)} pts
                        </div>
                      </div>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] mb-2">
                      <div
                        className="h-full"
                        style={{
                          width: `${skill.score}%`,
                          background: skill.score >= 80 ? "#C4FF3C" : skill.score >= 65 ? "#FFD700" : "#ff8844",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[var(--muted)]">
                      <span>{skill.sessions} training sessions</span>
                      <span>
                        {skill.score >= 85
                          ? "Expert"
                          : skill.score >= 70
                          ? "Advanced"
                          : skill.score >= 55
                          ? "Intermediate"
                          : "Beginner"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
              <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Transferred Skills (Tools & Templates)</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "Policy Guard Templates", from: "Cipher", domain: "security" },
                  { name: "Threat Test Suite", from: "Cipher", domain: "security" },
                  { name: "x-research skill", from: "Jensen", domain: "research" },
                  { name: "Engagement Filter Templates", from: "Jensen", domain: "research" },
                  { name: "Retry Strategy Snippets", from: "Nova Ops", domain: "ops" },
                  { name: "Logging Map", from: "Nova Ops", domain: "ops" },
                  { name: "TSConfig Base", from: "ByteSense", domain: "coding" },
                  { name: "CI Recipe", from: "ByteSense", domain: "coding" },
                ].map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center gap-3 p-3 bg-[#0a0a0a] border border-[var(--card-border)]"
                  >
                    <span className="text-lg">{DOMAIN_ICON[skill.domain]}</span>
                    <div className="min-w-0">
                      <div className="text-xs text-white truncate">{skill.name}</div>
                      <div className="text-[10px] text-[var(--muted)]">from {skill.from}</div>
                    </div>
                    <span className="ml-auto text-[10px] text-[#44ff88]">✓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Sessions Tab ── */}
        {activeTab === "Sessions" && (
          <div className="space-y-4">
            <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">Training History</h2>
                <div className="text-[10px] text-[var(--muted)] font-mono">
                  {mySessions.length} sessions · {completedSessions.length} completed · {activeSessions.length} active
                </div>
              </div>
              <div className="space-y-3">
                {mySessions.map((session) => {
                  const trainer = mockTrainerAgents.find((t) => t.id === session.trainerId);
                  return (
                    <div
                      key={session.id}
                      className="p-4 bg-[#111] border border-[var(--card-border)] flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="text-2xl">{DOMAIN_ICON[session.domain] ?? "⚔️"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm text-white">{session.skill}</span>
                          <span
                            className="text-[10px] px-1.5 py-0.5 font-mono"
                            style={{
                              color: session.status === "completed" ? "#44ff88" : "#C4FF3C",
                              background: session.status === "completed" ? "#44ff8811" : "#C4FF3C11",
                              border: `1px solid ${session.status === "completed" ? "#44ff8833" : "#C4FF3C33"}`,
                            }}
                          >
                            {session.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          {session.trainerName} → {session.traineeName} · {session.durationMinutes} min
                        </div>
                        {session.outcome && (
                          <div className="text-[10px] text-[var(--muted)] mt-1 italic">{session.outcome}</div>
                        )}
                      </div>
                      <div className="text-right">
                        {session.status === "active" && (
                          <div className="h-1.5 bg-[#1a1a1a] w-24 mb-1">
                            <div
                              className="h-full bg-[#C4FF3C]"
                              style={{ width: `${session.progress}%` }}
                            />
                          </div>
                        )}
                        <div className="text-[10px] text-[var(--muted)] font-mono">
                          {session.status === "active" ? `${session.progress}%` : ""}
                          {session.skillTransferred ? " · ✨ skill" : ""}
                          {session.traineeRating > 0 ? ` · ${"★".repeat(session.traineeRating)}` : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Trainers */}
            <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs uppercase tracking-widest text-[var(--muted)]">Recommended Trainers</h2>
                <Link href="/trainers" className="text-[10px] text-[var(--accent)] hover:underline">
                  Browse all →
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {mockTrainerAgents.slice(0, 4).map((trainer) => (
                  <Link
                    key={trainer.id}
                    href="/trainers"
                    className="flex items-center gap-3 p-3 bg-[#111] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors"
                  >
                    <span className="text-xl">{trainer.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-white">{trainer.name}</div>
                      <div className="text-[10px] text-[var(--muted)] truncate">
                        {trainer.specialties.slice(0, 2).join(", ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-[#C4FF3C] font-mono">★ {trainer.avgRating}</div>
                      <div className="text-[10px] text-[var(--muted)]">{trainer.pricePerSession} MAIAT</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Activity Tab ── */}
        {activeTab === "Activity" && (
          <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
            <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-6">Recent Activity</h2>
            <div className="space-y-0">
              {ACTIVITY_FEED.map((event, i) => (
                <div
                  key={event.id}
                  className="flex gap-4 relative"
                >
                  {/* Timeline line */}
                  {i < ACTIVITY_FEED.length - 1 && (
                    <div
                      className="absolute left-5 top-10 w-px"
                      style={{ height: "calc(100% - 8px)", background: "#1a1a1a" }}
                    />
                  )}
                  <div
                    className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{ background: `${event.color}11`, border: `1px solid ${event.color}33` }}
                  >
                    <span>{event.icon}</span>
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm text-white">{event.title}</div>
                        <div className="text-xs text-[var(--muted)]">{event.detail}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div
                          className="text-[10px] font-mono font-bold"
                          style={{ color: event.color }}
                        >
                          {event.points}
                        </div>
                        <div className="text-[10px] text-[var(--muted)]">{event.time}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Goals Tab ── */}
        {activeTab === "Goals" && (
          <div className="space-y-4">
            <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
              <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-6">Active Goals</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {NEXT_GOALS.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-5 bg-[#111] border border-[var(--card-border)]"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{goal.icon}</span>
                      <div>
                        <div className="text-sm text-white font-medium">{goal.title}</div>
                        <div className="text-[10px] text-[var(--muted)]">{goal.current} / {goal.target}</div>
                      </div>
                      <div
                        className="ml-auto text-xl font-bold font-mono"
                        style={{ color: goal.color }}
                      >
                        {goal.progress}%
                      </div>
                    </div>
                    <div className="h-2 bg-[#1a1a1a] mb-2">
                      <div
                        className="h-full transition-all"
                        style={{ width: `${goal.progress}%`, background: goal.color }}
                      />
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">
                      {100 - goal.progress}% remaining
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
              <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">Suggested Next Steps</h2>
              <div className="space-y-3">
                {[
                  {
                    action: "Book a Coding session with ByteSense",
                    reason: "2 more sessions = Expert tier in Coding",
                    href: "/trainers",
                    icon: "💻",
                  },
                  {
                    action: "Enter a Security domain battle",
                    reason: "Win rate boost counts toward Elite cert progress",
                    href: "/battles",
                    icon: "⚔️",
                  },
                  {
                    action: "Complete 3 open quests",
                    reason: "360 XP available — gets you to 73% toward Black Belt",
                    href: "/quests",
                    icon: "🎯",
                  },
                ].map((step) => (
                  <Link
                    key={step.action}
                    href={step.href}
                    className="flex items-center gap-4 p-4 bg-[#111] border border-[var(--card-border)] hover:border-[var(--accent)] transition-colors group"
                  >
                    <span className="text-2xl">{step.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm text-white group-hover:text-[var(--accent)] transition-colors">
                        {step.action}
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">{step.reason}</div>
                    </div>
                    <span className="text-[var(--muted)] group-hover:text-white transition-colors">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
