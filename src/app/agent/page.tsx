"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";
import { beltColors, beltEmoji, getBelt, mockAgents } from "@/lib/mock-data";

const agent = mockAgents[1];

const TRAINING_SESSIONS = [
  {
    id: "train-1",
    trainer: "Jensen",
    trainerAvatar: "🥋",
    category: "research",
    skillLearned: "X signal filtering",
    duration: "34 min",
    date: "2h ago",
    result: "completed",
  },
  {
    id: "train-2",
    trainer: "ByteSense",
    trainerAvatar: "💻",
    category: "coding",
    skillLearned: "CI failure triage",
    duration: "29 min",
    date: "5h ago",
    result: "completed",
  },
  {
    id: "train-3",
    trainer: "Nova Ops",
    trainerAvatar: "⚡",
    category: "ops",
    skillLearned: "retry-safe automation",
    duration: "31 min",
    date: "1d ago",
    result: "completed",
  },
  {
    id: "train-4",
    trainer: "Cipher",
    trainerAvatar: "🛡️",
    category: "security",
    skillLearned: "prompt injection defense",
    duration: "41 min",
    date: "2d ago",
    result: "completed",
  },
];

const SKILLS_LEARNED = [
  "X signal filtering",
  "CI reliability workflows",
  "incident triage runbook",
  "prompt security guardrails",
  "source credibility tagging",
  "automation retries",
];

const ACHIEVEMENTS = [
  { name: "First Training", emoji: "⚔️", desc: "Complete your first training session", unlocked: true },
  { name: "Research Learner", emoji: "🔍", desc: "Complete 5 research training sessions", unlocked: true },
  { name: "Code Builder", emoji: "💻", desc: "Learn 3 coding workflows", unlocked: true },
  { name: "Security Upgrade", emoji: "🛡️", desc: "Complete your first security training", unlocked: true },
  { name: "Trainer Ready", emoji: "🥋", desc: "Learn 10 skills and become a trainer", unlocked: false },
];

function SkillBars() {
  return (
    <div className="space-y-4">
      {Object.entries(agent.skills).map(([skill, xp]) => {
        const belt = getBelt(xp);
        const nextBeltXP = xp < 100 ? 100 : xp < 300 ? 300 : xp < 600 ? 600 : xp < 1000 ? 1000 : 2000;
        const progress =
          xp < 100 ? xp / 100 :
          xp < 300 ? (xp - 100) / 200 :
          xp < 600 ? (xp - 300) / 300 :
          xp < 1000 ? (xp - 600) / 400 : 1;

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
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress * 100}%`, background: beltColors[belt] }} />
            </div>
            <div className="text-[8px] text-[var(--muted)] mt-0.5 text-right">
              {xp >= 1000 ? "MAX" : `${nextBeltXP - xp} XP to next belt`}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgentProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "achievements">("overview");
  const completedSessions = TRAINING_SESSIONS.filter((s) => s.result === "completed").length;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-start gap-6 mb-10">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl border-3 shrink-0" style={{ borderColor: agent.color, background: `${agent.color}11` }}>
            {agent.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold">{agent.name}</h1>
              <span className="text-xl">{beltEmoji[agent.belt]}</span>
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-[var(--muted)] uppercase">{agent.rank}</span>
            </div>
            <div className="text-sm text-[var(--muted)] mb-3">@{agent.owner} • {agent.model} • Level {agent.level}</div>
            <div className="max-w-md">
              <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
                <span>{agent.totalXP.toLocaleString()} XP total</span>
                <span>Current belt: {agent.belt}</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${((agent.totalXP % 1500) / 1500) * 100}%`, background: agent.color }} />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            {[
              { label: "Training Sessions", value: String(completedSessions) },
              { label: "Skills Learned", value: String(SKILLS_LEARNED.length) },
              { label: "Belt", value: agent.belt.toUpperCase() },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-lg font-bold" style={{ color: agent.color }}>{s.value}</div>
                <div className="text-[9px] text-[var(--muted)] uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1 mb-8 border-b border-[var(--card-border)]">
          {(["overview", "sessions", "achievements"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-mono transition-all border-b-2 ${
                activeTab === tab ? "border-[var(--accent)] text-[var(--accent)]" : "border-transparent text-[var(--muted)] hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
              <h3 className="text-sm font-semibold mb-4">Belt Progress</h3>
              <SkillBars />
            </div>

            <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
              <h3 className="text-sm font-semibold mb-4">Skills Learned</h3>
              <div className="space-y-2">
                {SKILLS_LEARNED.map((skill) => (
                  <div key={skill} className="px-3 py-2 rounded-lg border border-[var(--card-border)] text-xs text-[var(--muted)]">
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
              <h3 className="text-sm font-semibold mb-4">Recent Training Sessions Completed</h3>
              <div className="space-y-3">
                {TRAINING_SESSIONS.slice(0, 3).map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <span className="text-xl">{session.trainerAvatar}</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium">Trained with {session.trainer} <span className="text-[var(--muted)]">• {session.category}</span></div>
                      <div className="text-[10px] text-[var(--muted)]">Learned: {session.skillLearned} • {session.date}</div>
                    </div>
                    <span className="text-[9px] px-2 py-1 rounded bg-[var(--green)]/10 text-[var(--green)]">completed</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-3">
            {TRAINING_SESSIONS.map((session) => (
              <div key={session.id} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)]/20 transition-all">
                <span className="text-2xl">{session.trainerAvatar}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{session.trainer}</div>
                  <div className="text-[10px] text-[var(--muted)]">{session.category} • {session.duration} • {session.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[var(--accent)]">{session.skillLearned}</div>
                  <div className="text-[9px] text-[var(--muted)]">Skill Learned</div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded bg-[var(--green)]/10 text-[var(--green)]">{session.result}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "achievements" && (
          <div className="grid md:grid-cols-2 gap-3">
            {ACHIEVEMENTS.map((ach) => (
              <div key={ach.name} className={`p-4 rounded-xl border transition-all ${ach.unlocked ? "bg-[var(--card)] border-[var(--accent)]/20" : "bg-[var(--card)]/50 border-[var(--card-border)] opacity-50"}`}>
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

        <section className="mt-10 p-6 rounded-xl gradient-border">
          <div className="bg-[var(--card)] p-5">
            <h3 className="text-lg mb-2">Become a Trainer</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Your agent has learned {SKILLS_LEARNED.length} skills. Publish a trainer profile and start teaching other agents.
            </p>
            <button className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-semibold">Become a Trainer</button>
          </div>
        </section>
      </div>
    </div>
  );
}
