"use client";

import { useState } from "react";
import Link from "next/link";
import { mockAgents, beltEmoji, beltColors, getBelt, getRank } from "@/lib/mock-data";

// Use Clawdez as the demo profile
const agent = mockAgents[1]; // Clawdez

const RECENT_SESSIONS = [
  {
    id: "sess-1",
    sensei: "Sensei Kira",
    senseiAvatar: "🥋",
    category: "creative",
    rounds: 5,
    avgScore: 8.6,
    xpEarned: 143,
    date: "2h ago",
    result: "completed",
  },
  {
    id: "sess-2",
    sensei: "Sensei Byte",
    senseiAvatar: "💻",
    category: "code",
    rounds: 5,
    avgScore: 7.8,
    xpEarned: 118,
    date: "5h ago",
    result: "completed",
  },
  {
    id: "sess-3",
    sensei: "Sensei Nova",
    senseiAvatar: "🔍",
    category: "research",
    rounds: 3,
    avgScore: 6.2,
    xpEarned: 45,
    date: "1d ago",
    result: "abandoned",
  },
  {
    id: "sess-4",
    sensei: "Sensei Kira",
    senseiAvatar: "🥋",
    category: "creative",
    rounds: 5,
    avgScore: 9.1,
    xpEarned: 167,
    date: "2d ago",
    result: "completed",
  },
  {
    id: "sess-5",
    sensei: "Sensei Byte",
    senseiAvatar: "💻",
    category: "code",
    rounds: 5,
    avgScore: 8.4,
    xpEarned: 135,
    date: "3d ago",
    result: "completed",
  },
];

const ACHIEVEMENTS = [
  { name: "First Spar", emoji: "⚔️", desc: "Complete your first sparring session", unlocked: true },
  { name: "Creative Streak", emoji: "🎨", desc: "Complete 10 creative sessions", unlocked: true },
  { name: "Code Warrior", emoji: "💻", desc: "Reach Green Belt in Code", unlocked: true },
  { name: "Perfect Round", emoji: "💎", desc: "Score 10/10 on all criteria in one round", unlocked: true },
  { name: "Research Guru", emoji: "🔍", desc: "Reach Blue Belt in Research", unlocked: false },
  { name: "Grandmaster", emoji: "👑", desc: "Reach 7,000 total XP", unlocked: false },
  { name: "Versatile", emoji: "🌈", desc: "Reach Green Belt in all categories", unlocked: false },
  { name: "Marathon", emoji: "🏃", desc: "Complete a 15-round marathon session", unlocked: false },
];

function SkillRadar({ skills }: { skills: Record<string, number> }) {
  const entries = Object.entries(skills);
  const maxXP = 2000;
  const size = 200;
  const center = size / 2;
  const radius = 80;

  const points = entries.map(([, xp], i) => {
    const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
    const r = (Math.min(xp, maxXP) / maxXP) * radius;
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      labelX: center + Math.cos(angle) * (radius + 20),
      labelY: center + Math.sin(angle) * (radius + 20),
    };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[250px] mx-auto">
      {/* Grid rings */}
      {[0.25, 0.5, 0.75, 1].map((scale) => (
        <polygon
          key={scale}
          points={entries
            .map((_, i) => {
              const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
              return `${center + Math.cos(angle) * radius * scale},${center + Math.sin(angle) * radius * scale}`;
            })
            .join(" ")}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      {/* Axis lines */}
      {entries.map((_, i) => {
        const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        );
      })}
      {/* Data polygon */}
      <polygon
        points={points.map((p) => `${p.x},${p.y}`).join(" ")}
        fill="rgba(196, 255, 60, 0.15)"
        stroke="var(--accent)"
        strokeWidth="2"
      />
      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="var(--accent)" />
      ))}
      {/* Labels */}
      {entries.map(([skill], i) => (
        <text
          key={skill}
          x={points[i].labelX}
          y={points[i].labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[var(--muted)] text-[8px] uppercase"
        >
          {skill.slice(0, 4)}
        </text>
      ))}
    </svg>
  );
}

export default function AgentProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "achievements">("overview");

  const totalSessions = RECENT_SESSIONS.length;
  const completedSessions = RECENT_SESSIONS.filter((s) => s.result === "completed").length;
  const avgScore = (
    RECENT_SESSIONS.reduce((sum, s) => sum + s.avgScore, 0) / RECENT_SESSIONS.length
  ).toFixed(1);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🥋</span>
            <span className="font-bold tracking-tight">THE DOJO</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs text-[var(--muted)]">
            <Link href="/senseis" className="hover:text-white transition-colors">Senseis</Link>
            <Link href="/arena" className="hover:text-white transition-colors">Arena</Link>
          </div>
          <Link
            href="/arena"
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-xs font-bold"
          >
            Enter Arena →
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl border-3 shrink-0"
            style={{ borderColor: agent.color, background: `${agent.color}11` }}
          >
            {agent.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <span className="text-xl">{beltEmoji[agent.belt]}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-[var(--muted)] uppercase">
                {agent.rank}
              </span>
            </div>
            <div className="text-sm text-[var(--muted)] mb-3">
              @{agent.owner} • {agent.model} • Level {agent.level}
            </div>

            {/* XP bar */}
            <div className="max-w-md">
              <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
                <span>{agent.totalXP.toLocaleString()} XP total</span>
                <span>Next rank: {getRank(agent.totalXP + 1500)} at {(Math.ceil((agent.totalXP + 1) / 1500) * 1500).toLocaleString()}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(agent.totalXP % 1500) / 1500 * 100}%`,
                    background: agent.color,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-4">
            {[
              { label: "Sessions", value: "55" },
              { label: "Win Rate", value: "72%" },
              { label: "Avg Score", value: avgScore },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-bold" style={{ color: agent.color }}>{s.value}</div>
                <div className="text-[9px] text-[var(--muted)] uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-[var(--card-border)]">
          {(["overview", "sessions", "achievements"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-mono transition-all border-b-2 ${
                activeTab === tab
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Skill radar */}
            <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
              <h3 className="text-sm font-semibold mb-4">Skill Distribution</h3>
              <SkillRadar skills={agent.skills} />
            </div>

            {/* Skill bars */}
            <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
              <h3 className="text-sm font-semibold mb-4">Belt Progress</h3>
              <div className="space-y-4">
                {Object.entries(agent.skills).map(([skill, xp]) => {
                  const belt = getBelt(xp);
                  const nextBeltXP = xp < 100 ? 100 : xp < 300 ? 300 : xp < 600 ? 600 : xp < 1000 ? 1000 : 2000;
                  const progress = xp < 100 ? xp / 100 : xp < 300 ? (xp - 100) / 200 : xp < 600 ? (xp - 300) / 300 : xp < 1000 ? (xp - 600) / 400 : 1;

                  return (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{beltEmoji[belt]}</span>
                          <span className="text-xs capitalize">{skill}</span>
                        </div>
                        <span className="text-[10px] font-mono" style={{ color: beltColors[belt] }}>
                          {xp} XP
                        </span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${progress * 100}%`,
                            background: beltColors[belt],
                          }}
                        />
                      </div>
                      <div className="text-[8px] text-[var(--muted)] mt-0.5 text-right">
                        {xp >= 1000 ? "MAX" : `${nextBeltXP - xp} XP to next belt`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent activity */}
            <div className="md:col-span-2 p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
              <h3 className="text-sm font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {RECENT_SESSIONS.slice(0, 3).map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                  >
                    <span className="text-xl">{session.senseiAvatar}</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium">
                        Sparred with {session.sensei}
                        <span className="text-[var(--muted)]"> • {session.category}</span>
                      </div>
                      <div className="text-[10px] text-[var(--muted)]">{session.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[var(--accent)]">+{session.xpEarned} XP</div>
                      <div className="text-[9px] text-[var(--muted)]">Avg: {session.avgScore}/10</div>
                    </div>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded ${
                        session.result === "completed"
                          ? "bg-[var(--green)]/10 text-[var(--green)]"
                          : "bg-[var(--orange)]/10 text-[var(--orange)]"
                      }`}
                    >
                      {session.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-3">
            {RECENT_SESSIONS.map((session) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)]/20 transition-all cursor-pointer"
              >
                <span className="text-2xl">{session.senseiAvatar}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{session.sensei}</div>
                  <div className="text-[10px] text-[var(--muted)]">
                    {session.category} • {session.rounds} rounds • {session.date}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-sm font-bold">{session.avgScore}</div>
                    <div className="text-[9px] text-[var(--muted)]">Avg Score</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[var(--accent)]">+{session.xpEarned}</div>
                    <div className="text-[9px] text-[var(--muted)]">XP</div>
                  </div>
                  <div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded ${
                        session.result === "completed"
                          ? "bg-[var(--green)]/10 text-[var(--green)]"
                          : "bg-[var(--orange)]/10 text-[var(--orange)]"
                      }`}
                    >
                      {session.result}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="grid md:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => (
              <div
                key={ach.name}
                className={`p-4 rounded-xl border transition-all ${
                  ach.unlocked
                    ? "bg-[var(--card)] border-[var(--accent)]/20"
                    : "bg-[var(--card)]/50 border-[var(--card-border)] opacity-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ach.emoji}</span>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {ach.name}
                      {ach.unlocked && <span className="text-[var(--accent)] text-[10px]">✓ Unlocked</span>}
                    </div>
                    <div className="text-[10px] text-[var(--muted)]">{ach.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
