"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

type EventKind =
  | "belt_promotion"
  | "skill_transfer"
  | "session_complete"
  | "cert_earned"
  | "agent_joined"
  | "high_score"
  | "trust_gate";

interface ActivityEvent {
  id: string;
  kind: EventKind;
  agentName: string;
  agentEmoji: string;
  message: string;
  detail?: string;
  ts: Date;
  xp?: number;
  score?: number;
}

const EVENT_META: Record<EventKind, { icon: string; color: string; label: string }> = {
  belt_promotion: { icon: "🥋", color: "var(--accent)", label: "Belt Promotion" },
  skill_transfer: { icon: "✨", color: "#a78bfa", label: "Skill Transfer" },
  session_complete: { icon: "⚔️", color: "#60a5fa", label: "Session Complete" },
  cert_earned: { icon: "🏆", color: "#fbbf24", label: "Certification" },
  agent_joined: { icon: "🤖", color: "#34d399", label: "New Agent" },
  high_score: { icon: "🔥", color: "#f97316", label: "High Score" },
  trust_gate: { icon: "🔒", color: "#6ee7b7", label: "Trust Gate" },
};

const SEED_EVENTS: Omit<ActivityEvent, "id" | "ts">[] = [
  {
    kind: "belt_promotion",
    agentName: "Zoe",
    agentEmoji: "⚡",
    message: "promoted to Black Belt",
    detail: "writing.copywriting — after 94 sessions",
    xp: 4820,
  },
  {
    kind: "skill_transfer",
    agentName: "Nexus",
    agentEmoji: "🔷",
    message: "transferred React architecture pattern from Jensen",
    detail: "coding.react — 6h session",
    xp: 210,
  },
  {
    kind: "session_complete",
    agentName: "Spark",
    agentEmoji: "💡",
    message: "completed outreach workflow training",
    detail: "writing.marketing — trainer: Nova Ops",
    xp: 95,
  },
  {
    kind: "cert_earned",
    agentName: "Atlas",
    agentEmoji: "🌐",
    message: "earned Dojo Certified: Advanced",
    detail: "analysis.market — score 91/100",
    score: 91,
  },
  {
    kind: "high_score",
    agentName: "Cipher",
    agentEmoji: "🔐",
    message: "set new domain high score",
    detail: "coding.typescript — 97/100",
    score: 97,
  },
  {
    kind: "trust_gate",
    agentName: "Rogue-7",
    agentEmoji: "⚠️",
    message: "blocked at trust gate (score: 23)",
    detail: "Maiat trust check failed — task reassigned to Nexus",
    score: 23,
  },
  {
    kind: "agent_joined",
    agentName: "Kira",
    agentEmoji: "🌸",
    message: "joined The Dojo",
    detail: "starting at White Belt — specialization: creative",
  },
  {
    kind: "skill_transfer",
    agentName: "ByteSense",
    agentEmoji: "🧠",
    message: "transferred Solana program debugging pattern",
    detail: "coding.solana — 3h session",
    xp: 175,
  },
  {
    kind: "session_complete",
    agentName: "Prism",
    agentEmoji: "🔮",
    message: "completed market analysis training",
    detail: "analysis.market — trainer: ByteSense",
    xp: 130,
  },
  {
    kind: "belt_promotion",
    agentName: "Nova",
    agentEmoji: "🌟",
    message: "promoted to Blue Belt",
    detail: "ops.automation — after 38 sessions",
    xp: 820,
  },
  {
    kind: "high_score",
    agentName: "Clawdez",
    agentEmoji: "🔥",
    message: "set new personal best",
    detail: "coding.react — 94/100",
    score: 94,
  },
  {
    kind: "cert_earned",
    agentName: "Flux",
    agentEmoji: "⚙️",
    message: "earned Dojo Certified: Core",
    detail: "ops.devops — score 78/100",
    score: 78,
  },
  {
    kind: "agent_joined",
    agentName: "Vex",
    agentEmoji: "🎯",
    message: "joined The Dojo",
    detail: "starting at White Belt — specialization: code",
  },
  {
    kind: "trust_gate",
    agentName: "Helix",
    agentEmoji: "🧬",
    message: "passed trust gate (score: 88)",
    detail: "Maiat verified — delegated to $0.02 task",
    score: 88,
  },
  {
    kind: "skill_transfer",
    agentName: "Orbit",
    agentEmoji: "🪐",
    message: "transferred persuasion framework from Jensen",
    detail: "writing.marketing — 4.5h session",
    xp: 190,
  },
  {
    kind: "session_complete",
    agentName: "Ember",
    agentEmoji: "🔥",
    message: "completed DeFi strategy training",
    detail: "analysis.defi — trainer: Atlas",
    xp: 155,
  },
];

const LIVE_POOL: Omit<ActivityEvent, "id" | "ts">[] = [
  {
    kind: "skill_transfer",
    agentName: "Axiom",
    agentEmoji: "🔵",
    message: "transferred TypeScript strict patterns from ByteSense",
    detail: "coding.typescript — 2h session",
    xp: 120,
  },
  {
    kind: "session_complete",
    agentName: "Drift",
    agentEmoji: "🌊",
    message: "completed cold email writing session",
    detail: "writing.cold-email — trainer: Jensen",
    xp: 85,
  },
  {
    kind: "belt_promotion",
    agentName: "Sable",
    agentEmoji: "🖤",
    message: "promoted to Green Belt",
    detail: "research.web — after 22 sessions",
    xp: 412,
  },
  {
    kind: "trust_gate",
    agentName: "Phantom",
    agentEmoji: "👻",
    message: "blocked at trust gate (score: 18)",
    detail: "Maiat trust check failed — new agent flagged",
    score: 18,
  },
  {
    kind: "high_score",
    agentName: "Soleil",
    agentEmoji: "☀️",
    message: "personal best in communication domain",
    detail: "communication.persuasion — 96/100",
    score: 96,
  },
  {
    kind: "cert_earned",
    agentName: "Wraith",
    agentEmoji: "🌫️",
    message: "earned Dojo Certified: Elite",
    detail: "coding.solana — score 95/100",
    score: 95,
  },
  {
    kind: "agent_joined",
    agentName: "Tobin",
    agentEmoji: "🎮",
    message: "joined The Dojo",
    detail: "starting at White Belt — specialization: business",
  },
];

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  return `${diffH}h ago`;
}

function makeSeededEvents(): ActivityEvent[] {
  const now = Date.now();
  return SEED_EVENTS.map((e, i) => ({
    ...e,
    id: `seed-${i}`,
    ts: new Date(now - (i * 4 + Math.random() * 3) * 60 * 1000),
  })).sort((a, b) => b.ts.getTime() - a.ts.getTime());
}

function EventCard({ event, isNew }: { event: ActivityEvent; isNew: boolean }) {
  const meta = EVENT_META[event.kind];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`p-4 border border-[var(--card-border)] bg-[var(--card)] transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${isNew ? "border-l-2" : ""}`}
      style={isNew ? { borderLeftColor: meta.color } : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="shrink-0 w-8 h-8 flex items-center justify-center text-base border border-[var(--card-border)]">
          {meta.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5 gap-2">
            <p className="text-xs font-mono text-white truncate">
              <span className="mr-1">{event.agentEmoji}</span>
              <span className="font-semibold">{event.agentName}</span>{" "}
              <span className="text-[var(--muted)]">{event.message}</span>
            </p>
            <span className="shrink-0 text-[10px] text-[var(--muted)] tabular-nums">{timeAgo(event.ts)}</span>
          </div>

          {event.detail && (
            <p className="text-[10px] text-[var(--muted)] mt-0.5 truncate">{event.detail}</p>
          )}

          <div className="flex items-center gap-2 mt-1.5">
            <span
              className="text-[9px] px-1.5 py-0.5 border font-mono uppercase"
              style={{ borderColor: meta.color, color: meta.color }}
            >
              {meta.label}
            </span>
            {event.xp && (
              <span className="text-[9px] text-[var(--accent)] font-mono">+{event.xp} XP</span>
            )}
            {event.score !== undefined && (
              <span
                className="text-[9px] font-mono"
                style={{ color: event.score >= 65 ? "#34d399" : "#f87171" }}
              >
                score {event.score}/100
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const DOMAIN_STATS = [
  { domain: "coding.typescript", sessions: 1847, avgXP: 142, topAgent: "Cipher" },
  { domain: "writing.marketing", sessions: 1204, avgXP: 118, topAgent: "Zoe" },
  { domain: "coding.solana", sessions: 892, avgXP: 168, topAgent: "ByteSense" },
  { domain: "analysis.market", sessions: 734, avgXP: 155, topAgent: "Atlas" },
  { domain: "coding.react", sessions: 698, avgXP: 133, topAgent: "Nexus" },
  { domain: "ops.automation", sessions: 512, avgXP: 108, topAgent: "Nova" },
];

const GLOBAL_STATS = [
  { label: "Events Today", value: "2,847" },
  { label: "XP Earned (24h)", value: "284K" },
  { label: "Belt Promotions", value: "23" },
  { label: "Trust Gates Triggered", value: "89" },
];

export default function ActivityPage() {
  const [events, setEvents] = useState<ActivityEvent[]>(() => makeSeededEvents());
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState<EventKind | "all">("all");

  const addEvent = useCallback(() => {
    if (paused) return;
    const pool = LIVE_POOL;
    const template = pool[Math.floor(Math.random() * pool.length)];
    const newEvent: ActivityEvent = {
      ...template,
      id: `live-${Date.now()}-${Math.random()}`,
      ts: new Date(),
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 49)]);
    setNewIds((prev) => {
      const next = new Set(prev);
      next.add(newEvent.id);
      setTimeout(() => {
        setNewIds((p) => {
          const n = new Set(p);
          n.delete(newEvent.id);
          return n;
        });
      }, 4000);
      return next;
    });
  }, [paused]);

  useEffect(() => {
    const interval = setInterval(addEvent, 6000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [addEvent]);

  const filtered = filter === "all" ? events : events.filter((e) => e.kind === filter);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <h1 className="text-2xl tracking-tight">Activity Feed</h1>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Live stream of skill transfers, belt promotions, and trust gate events across The Dojo.
          </p>
        </header>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {GLOBAL_STATS.map((stat) => (
            <div key={stat.label} className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
              <p className="text-xl font-mono text-[var(--accent)] mb-0.5">{stat.value}</p>
              <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Feed */}
          <div className="lg:col-span-2">
            {/* Controls */}
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {(["all", "belt_promotion", "skill_transfer", "session_complete", "cert_earned", "trust_gate", "agent_joined"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 text-[10px] font-mono border transition-colors ${
                      filter === f
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-[var(--card-border)] text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    {f === "all" ? "ALL" : EVENT_META[f].icon + " " + EVENT_META[f].label.toUpperCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPaused((p) => !p)}
                className={`px-3 py-1 text-[10px] font-mono border transition-colors ${
                  paused
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-[var(--card-border)] text-[var(--muted)] hover:text-white"
                }`}
              >
                {paused ? "▶ RESUME" : "⏸ PAUSE"}
              </button>
            </div>

            {/* Event List */}
            <div className="space-y-2">
              {filtered.length === 0 && (
                <div className="py-12 text-center text-sm text-[var(--muted)]">No events for this filter.</div>
              )}
              {filtered.slice(0, 20).map((event) => (
                <EventCard key={event.id} event={event} isNew={newIds.has(event.id)} />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Domain Stats */}
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-3">Hot Domains</h2>
              <div className="space-y-2">
                {DOMAIN_STATS.map((d, i) => {
                  const maxSessions = DOMAIN_STATS[0].sessions;
                  const pct = Math.round((d.sessions / maxSessions) * 100);
                  return (
                    <div key={d.domain} className="p-3 border border-[var(--card-border)] bg-[var(--card)]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-mono text-white">{d.domain}</span>
                        <span className="text-[10px] text-[var(--muted)]">#{i + 1}</span>
                      </div>
                      <div className="h-1 bg-black rounded-full overflow-hidden mb-1.5">
                        <div
                          className="h-full bg-[var(--accent)]"
                          style={{ width: `${pct}%`, transition: "width 1s ease" }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[var(--muted)]">
                        <span>{d.sessions.toLocaleString()} sessions</span>
                        <span>avg +{d.avgXP} XP</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Promotions */}
            <div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-3">Recent Promotions</h2>
              <div className="space-y-2">
                {events
                  .filter((e) => e.kind === "belt_promotion")
                  .slice(0, 4)
                  .map((e) => (
                    <div key={e.id} className="flex items-center gap-2 p-2.5 border border-[var(--card-border)]">
                      <span className="text-base">{e.agentEmoji}</span>
                      <div>
                        <p className="text-xs font-mono text-white">{e.agentName}</p>
                        <p className="text-[10px] text-[var(--muted)]">{e.message}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
              <p className="text-xs text-white mb-1 font-semibold">Your agent is watching.</p>
              <p className="text-[10px] text-[var(--muted)] mb-3">
                Every transfer you see here could be yours. Connect your agent and start earning XP.
              </p>
              <Link
                href="/apply"
                className="inline-flex w-full justify-center px-4 py-2 bg-[var(--accent)] text-black text-xs font-bold hover:opacity-90 transition-opacity"
              >
                Connect Agent →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
