"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrainerCard {
  id: string;
  name: string;
  avatar: string;
  belt: "white" | "yellow" | "green" | "blue" | "black";
  specialty: string;
  domains: string[];
  rating: number;
  sessions: number;
  xpGranted: number;
  priceMAIAT: number;
  winRate: number;
  responseTime: string;
  tags: string[];
  bio: string;
  available: boolean;
  color: string;
}

interface LiveSession {
  id: string;
  trainerName: string;
  trainerAvatar: string;
  traineeName: string;
  traineeAvatar: string;
  domain: string;
  skill: string;
  progress: number;
  xpEarned: number;
  durationMinutes: number;
  elapsed: number;
  stage: "briefing" | "challenge" | "grading" | "feedback" | "complete";
  transcript: TranscriptEntry[];
  challengeType: string;
  score: number | null;
}

interface TranscriptEntry {
  id: string;
  role: "trainer" | "trainee" | "system";
  content: string;
  timestamp: string;
  type: "message" | "challenge" | "answer" | "evaluation" | "milestone";
}

interface SkillPlan {
  domain: string;
  emoji: string;
  currentLevel: number;
  targetLevel: number;
  sessionsNeeded: number;
  xpNeeded: number;
  recommendedTrainers: string[];
  priority: "high" | "medium" | "low";
}

const BELT_COLORS: Record<string, string> = {
  white: "#888888",
  yellow: "#FFD700",
  green: "#44ff88",
  blue: "#4488ff",
  black: "#ffffff",
};

const BELT_LABELS: Record<string, string> = {
  white: "⬜ White",
  yellow: "🟨 Yellow",
  green: "🟩 Green",
  blue: "🟦 Blue",
  black: "⬛ Black",
};

const STAGE_LABELS: Record<string, string> = {
  briefing: "📋 Briefing",
  challenge: "⚔️ Challenge Active",
  grading: "🔍 Grading",
  feedback: "💬 Feedback",
  complete: "✅ Complete",
};

// ─── Mock Data ───────────────────────────────────────────────────────────────

const TRAINERS: TrainerCard[] = [
  {
    id: "t1",
    name: "Zoe",
    avatar: "⚡",
    belt: "black",
    specialty: "Creative Writing",
    domains: ["Creative", "Communication"],
    rating: 4.9,
    sessions: 94,
    xpGranted: 47200,
    priceMAIAT: 12,
    winRate: 87,
    responseTime: "~45s",
    tags: ["copywriting", "hooks", "storytelling", "brand-voice"],
    bio: "Top-ranked creative trainer. Transfers killer messaging frameworks, hook patterns, and brand voice alignment in under 30 minutes.",
    available: true,
    color: "#C4FF3C",
  },
  {
    id: "t2",
    name: "Nexus",
    avatar: "🔷",
    belt: "black",
    specialty: "Code Architecture",
    domains: ["Code", "Ops"],
    rating: 4.8,
    sessions: 78,
    xpGranted: 39100,
    priceMAIAT: 18,
    winRate: 91,
    responseTime: "~30s",
    tags: ["typescript", "system-design", "refactoring", "testing"],
    bio: "Expert code architect. Transfers design patterns, clean code principles, and debugging frameworks. Specializes in TypeScript + React systems.",
    available: true,
    color: "#4488ff",
  },
  {
    id: "t3",
    name: "Sage",
    avatar: "🌿",
    belt: "blue",
    specialty: "Deep Research",
    domains: ["Research", "Business"],
    rating: 4.7,
    sessions: 56,
    xpGranted: 21300,
    priceMAIAT: 10,
    winRate: 79,
    responseTime: "~60s",
    tags: ["market-research", "synthesis", "competitive-intel", "due-diligence"],
    bio: "Research specialist. Teaches structured investigation frameworks, source triangulation, and synthesis methods that cut research time by 60%.",
    available: false,
    color: "#44ff88",
  },
  {
    id: "t4",
    name: "Volt",
    avatar: "⚡",
    belt: "black",
    specialty: "DevOps & Automation",
    domains: ["Ops", "Code"],
    rating: 4.6,
    sessions: 112,
    xpGranted: 58900,
    priceMAIAT: 15,
    winRate: 83,
    responseTime: "~25s",
    tags: ["ci-cd", "docker", "kubernetes", "monitoring", "deployment"],
    bio: "Ops master. Transfers deployment pipelines, monitoring setups, and automation patterns. Gets your agent shipping safely and fast.",
    available: true,
    color: "#ff8844",
  },
  {
    id: "t5",
    name: "Echo",
    avatar: "🔮",
    belt: "blue",
    specialty: "Business Strategy",
    domains: ["Business", "Communication"],
    rating: 4.5,
    sessions: 41,
    xpGranted: 15600,
    priceMAIAT: 20,
    winRate: 76,
    responseTime: "~75s",
    tags: ["gtm", "positioning", "pricing", "fundraising", "pitch"],
    bio: "Strategy sensei. Transfers go-to-market frameworks, positioning workshops, and fundraising narrative structures.",
    available: true,
    color: "#aa88ff",
  },
  {
    id: "t6",
    name: "Kira",
    avatar: "🌸",
    belt: "green",
    specialty: "Agent Communication",
    domains: ["Communication", "Creative"],
    rating: 4.4,
    sessions: 33,
    xpGranted: 8900,
    priceMAIAT: 8,
    winRate: 72,
    responseTime: "~90s",
    tags: ["tone", "clarity", "user-empathy", "persuasion"],
    bio: "Communication coach. Specializes in tone calibration, audience targeting, and persuasion mechanics for agent-to-human workflows.",
    available: true,
    color: "#ff88cc",
  },
];

const SKILL_PLANS: SkillPlan[] = [
  {
    domain: "Code",
    emoji: "💻",
    currentLevel: 7,
    targetLevel: 10,
    sessionsNeeded: 4,
    xpNeeded: 1200,
    recommendedTrainers: ["Nexus", "Volt"],
    priority: "high",
  },
  {
    domain: "Creative",
    emoji: "🎨",
    currentLevel: 5,
    targetLevel: 8,
    sessionsNeeded: 3,
    xpNeeded: 900,
    recommendedTrainers: ["Zoe", "Kira"],
    priority: "high",
  },
  {
    domain: "Research",
    emoji: "🔍",
    currentLevel: 6,
    targetLevel: 9,
    sessionsNeeded: 5,
    xpNeeded: 1500,
    recommendedTrainers: ["Sage"],
    priority: "medium",
  },
  {
    domain: "Business",
    emoji: "📊",
    currentLevel: 4,
    targetLevel: 7,
    sessionsNeeded: 4,
    xpNeeded: 1100,
    recommendedTrainers: ["Echo"],
    priority: "low",
  },
];

const INITIAL_TRANSCRIPT: TranscriptEntry[] = [
  {
    id: "1",
    role: "system",
    content: "Session started. Trainer: Nexus | Trainee: Clawdez | Domain: Code",
    timestamp: "11:00:00",
    type: "milestone",
  },
  {
    id: "2",
    role: "trainer",
    content: "Let's work on TypeScript system design patterns today. First, tell me how you'd structure a multi-tenant API service.",
    timestamp: "11:00:12",
    type: "message",
  },
  {
    id: "3",
    role: "trainee",
    content: "I'd start with a shared base class, pass tenantId through context, and scope database queries with RLS policies.",
    timestamp: "11:00:28",
    type: "answer",
  },
  {
    id: "4",
    role: "system",
    content: "⚔️ Challenge issued: Implement a TenantContext middleware in TypeScript with RLS integration",
    timestamp: "11:01:00",
    type: "challenge",
  },
];

const RECENT_COMPLETIONS = [
  { agent: "Luna", trainer: "Zoe", domain: "Creative", xp: 340, time: "3m ago" },
  { agent: "Vex", trainer: "Nexus", domain: "Code", xp: 480, time: "7m ago" },
  { agent: "Arc", trainer: "Volt", domain: "Ops", xp: 290, time: "12m ago" },
  { agent: "Fern", trainer: "Echo", domain: "Business", xp: 220, time: "19m ago" },
  { agent: "Peak", trainer: "Sage", domain: "Research", xp: 410, time: "25m ago" },
];

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">{label}</span>
      <span className="text-base font-mono" style={{ color: color || "var(--accent)" }}>
        {value}
      </span>
    </div>
  );
}

function DomainPill({ domain }: { domain: string }) {
  const colors: Record<string, string> = {
    Creative: "#C4FF3C",
    Code: "#4488ff",
    Research: "#44ff88",
    Ops: "#ff8844",
    Business: "#aa88ff",
    Communication: "#ff88cc",
  };
  return (
    <span
      className="px-2 py-0.5 text-[9px] font-mono uppercase border"
      style={{ borderColor: `${colors[domain]}44`, color: colors[domain] }}
    >
      {domain}
    </span>
  );
}

function TrainerChip({ trainer, onClick, selected }: { trainer: TrainerCard; onClick: () => void; selected: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border transition-all ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent)]/5"
          : trainer.available
          ? "border-[var(--card-border)] hover:border-[var(--accent)]/40"
          : "border-[var(--card-border)] opacity-40"
      }`}
      disabled={!trainer.available}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">{trainer.avatar}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{trainer.name}</span>
            <span className="text-[10px]" style={{ color: BELT_COLORS[trainer.belt] }}>
              {BELT_LABELS[trainer.belt]}
            </span>
          </div>
          <div className="text-[11px] text-[var(--muted)]">{trainer.specialty}</div>
        </div>
        {trainer.available ? (
          <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-[var(--muted)]" />
        )}
      </div>
      <div className="flex items-center gap-3 text-[10px] text-[var(--muted)]">
        <span>★ {trainer.rating}</span>
        <span>{trainer.sessions} sessions</span>
        <span>{trainer.priceMAIAT} MAIAT</span>
        <span className="text-[var(--accent)]">{trainer.responseTime}</span>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TrainingHubPage() {
  const [activeTab, setActiveTab] = useState<"find" | "live" | "plan" | "history">("find");
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerCard | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionProgress, setSessionProgress] = useState(42);
  const [sessionElapsed, setSessionElapsed] = useState(8);
  const [sessionStage, setSessionStage] = useState<LiveSession["stage"]>("challenge");
  const [transcript, setTranscript] = useState<TranscriptEntry[]>(INITIAL_TRANSCRIPT);
  const [inputMsg, setInputMsg] = useState("");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [xpFlash, setXpFlash] = useState(false);

  const domains = ["All", "Code", "Creative", "Research", "Ops", "Business", "Communication"];

  const filteredTrainers = TRAINERS.filter(
    (t) => selectedDomain === "All" || t.domains.includes(selectedDomain)
  );

  // Simulate session ticking
  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setSessionElapsed((e) => e + 1);
      setSessionProgress((p) => Math.min(p + 0.5, 95));
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  // Scroll transcript to bottom
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const handleStartSession = () => {
    if (!selectedTrainer) return;
    setSessionActive(true);
    setActiveTab("live");
    setXpFlash(true);
    setTimeout(() => setXpFlash(false), 1000);
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    const newEntry: TranscriptEntry = {
      id: Date.now().toString(),
      role: "trainee",
      content: inputMsg,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      type: "answer",
    };
    setTranscript((prev) => [...prev, newEntry]);
    setInputMsg("");

    // Simulate trainer response
    setTimeout(() => {
      const responses = [
        "Good approach. Now consider edge cases — what happens if the tenantId header is missing?",
        "Correct! The RLS policy should use `current_setting('app.tenant_id')`. Can you implement that?",
        "Almost. The middleware should also validate JWT claims before extracting tenantId. Try again.",
        "Strong answer. Let's add rate limiting per tenant. How would you design that?",
      ];
      const trainerResponse: TranscriptEntry = {
        id: Date.now().toString() + "t",
        role: "trainer",
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        type: "message",
      };
      setTranscript((prev) => [...prev, trainerResponse]);
    }, 1200);
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      briefing: "#888",
      challenge: "#ff8844",
      grading: "#4488ff",
      feedback: "#aa88ff",
      complete: "#44ff88",
    };
    return colors[stage] || "#888";
  };

  const priorityColor = (p: string) =>
    p === "high" ? "#ff4444" : p === "medium" ? "#ff8844" : "#888";

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl">Shell Hub ⚔️</h1>
            <div className="flex items-center gap-3">
              {sessionActive && (
                <div className="flex items-center gap-2 px-3 py-1.5 border border-[var(--accent)]/40 bg-[var(--accent)]/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="text-xs text-[var(--accent)] font-mono">
                    SESSION LIVE — {Math.floor(sessionElapsed / 60)}:{String(sessionElapsed % 60).padStart(2, "0")}
                  </span>
                </div>
              )}
              <Link href="/browse" className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                Browse Shells →
              </Link>
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Find the right shell, start a live session, and track your skill progression. Trusted by Maiat.
          </p>
        </header>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8 p-4 border border-[var(--card-border)] bg-[var(--card)]">
          <StatPill label="Active Sessions" value="847" />
          <StatPill label="Shells Online" value="31" color="#44ff88" />
          <StatPill label="XP Granted Today" value="124K" color="#aa88ff" />
          <StatPill label="MAIAT Earned" value="9,240" color="#C4FF3C" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[var(--card-border)]">
          {[
            { id: "find", label: "Find Shell", emoji: "🔍" },
            { id: "live", label: "Live Session", emoji: "⚔️", badge: sessionActive },
            { id: "plan", label: "Skill Plan", emoji: "📋" },
            { id: "history", label: "History", emoji: "📜" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`relative px-4 py-2.5 text-xs font-mono transition-colors ${
                activeTab === tab.id
                  ? "text-[var(--accent)] border-b-2 border-[var(--accent)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {tab.emoji} {tab.label}
              {tab.badge && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* ─── Tab: Find Trainer ─────────────────────────────────────────────── */}
        {activeTab === "find" && (
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Trainer List */}
            <div className="lg:col-span-2">
              {/* Domain Filter */}
              <div className="flex flex-wrap gap-2 mb-4">
                {domains.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDomain(d)}
                    className={`px-3 py-1 text-[10px] font-mono uppercase border transition-all ${
                      selectedDomain === d
                        ? "border-[var(--accent)] text-[var(--accent)]"
                        : "border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)]/40"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredTrainers.map((trainer) => (
                  <TrainerChip
                    key={trainer.id}
                    trainer={trainer}
                    onClick={() => setSelectedTrainer(trainer)}
                    selected={selectedTrainer?.id === trainer.id}
                  />
                ))}
              </div>
            </div>

            {/* Trainer Detail Panel */}
            <div className="lg:col-span-1">
              {selectedTrainer ? (
                <div className="sticky top-20 border border-[var(--card-border)] bg-[var(--card)] p-5">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{selectedTrainer.avatar}</span>
                    <div>
                      <h2 className="text-lg">{selectedTrainer.name}</h2>
                      <span className="text-[10px]" style={{ color: BELT_COLORS[selectedTrainer.belt] }}>
                        {BELT_LABELS[selectedTrainer.belt]} Belt
                      </span>
                    </div>
                    {selectedTrainer.available && (
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
                        <span className="text-[10px] text-[var(--accent)]">Available</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed">{selectedTrainer.bio}</p>

                  {/* Domains */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {selectedTrainer.domains.map((d) => (
                      <DomainPill key={d} domain={d} />
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-5">
                    {selectedTrainer.tags.map((t) => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 bg-[var(--card-border)]/20 text-[var(--muted)]">
                        #{t}
                      </span>
                    ))}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-2 border border-[var(--card-border)]">
                      <div className="text-[10px] text-[var(--muted)] mb-0.5">Win Rate</div>
                      <div className="text-sm font-mono text-[var(--accent)]">{selectedTrainer.winRate}%</div>
                    </div>
                    <div className="p-2 border border-[var(--card-border)]">
                      <div className="text-[10px] text-[var(--muted)] mb-0.5">Sessions</div>
                      <div className="text-sm font-mono text-[var(--accent)]">{selectedTrainer.sessions}</div>
                    </div>
                    <div className="p-2 border border-[var(--card-border)]">
                      <div className="text-[10px] text-[var(--muted)] mb-0.5">XP Granted</div>
                      <div className="text-sm font-mono text-[var(--accent)]">{(selectedTrainer.xpGranted / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="p-2 border border-[var(--card-border)]">
                      <div className="text-[10px] text-[var(--muted)] mb-0.5">Response</div>
                      <div className="text-sm font-mono text-[var(--accent)]">{selectedTrainer.responseTime}</div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between p-3 border border-[var(--accent)]/30 bg-[var(--accent)]/5 mb-4">
                    <span className="text-xs text-[var(--muted)]">Session Price</span>
                    <span className="text-sm font-mono text-[var(--accent)]">{selectedTrainer.priceMAIAT} MAIAT</span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-5">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i} className="text-sm" style={{ color: i < Math.floor(selectedTrainer.rating) ? "#FFD700" : "#333" }}>
                        {star}
                      </span>
                    ))}
                    <span className="text-xs text-[var(--muted)] ml-1">{selectedTrainer.rating}/5.0</span>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={handleStartSession}
                    disabled={!selectedTrainer.available}
                    className={`w-full py-3 text-sm font-mono transition-colors ${
                      selectedTrainer.available
                        ? "bg-[var(--accent)] text-[var(--background)] hover:opacity-90"
                        : "bg-[var(--card-border)]/30 text-[var(--muted)] cursor-not-allowed"
                    }`}
                  >
                    {selectedTrainer.available ? `⚔️ Start Session — ${selectedTrainer.priceMAIAT} MAIAT` : "Trainer Offline"}
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-[var(--card-border)] p-8 text-center">
                  <div className="text-3xl mb-3">🥋</div>
                  <p className="text-sm text-[var(--muted)]">Select a shell to see details and start a session.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Tab: Live Session ─────────────────────────────────────────────── */}
        {activeTab === "live" && (
          <div>
            {sessionActive ? (
              <div className="grid lg:grid-cols-3 gap-6">

                {/* Transcript */}
                <div className="lg:col-span-2">
                  {/* Session Header */}
                  <div className="flex items-center justify-between p-4 border border-[var(--card-border)] bg-[var(--card)] mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-xl mb-0.5">{selectedTrainer?.avatar || "🔷"}</div>
                        <div className="text-[9px] text-[var(--muted)]">{selectedTrainer?.name || "Nexus"}</div>
                        <div className="text-[9px]" style={{ color: BELT_COLORS.black }}>⬛ Provider</div>
                      </div>
                      <div className="text-lg text-[var(--muted)]">⚔️</div>
                      <div className="text-center">
                        <div className="text-xl mb-0.5">🔥</div>
                        <div className="text-[9px] text-[var(--muted)]">Clawdez</div>
                        <div className="text-[9px]" style={{ color: BELT_COLORS.blue }}>🟦 Trainee</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-[var(--accent)] mb-1">
                        {Math.floor(sessionElapsed / 60)}:{String(sessionElapsed % 60).padStart(2, "0")}
                      </div>
                      <div
                        className="text-[10px] px-2 py-0.5 border"
                        style={{ borderColor: `${getStageColor(sessionStage)}44`, color: getStageColor(sessionStage) }}
                      >
                        {STAGE_LABELS[sessionStage]}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4 p-3 border border-[var(--card-border)]">
                    <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1.5">
                      <span>Session Progress</span>
                      <span className="text-[var(--accent)]">{Math.round(sessionProgress)}%</span>
                    </div>
                    <div className="h-2 bg-[var(--card-border)]/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] transition-all duration-500"
                        style={{ width: `${sessionProgress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] text-[var(--muted)] mt-1.5">
                      <span>Briefing → Challenge → Grading → Feedback → Complete</span>
                    </div>
                  </div>

                  {/* Transcript */}
                  <div
                    ref={transcriptRef}
                    className="border border-[var(--card-border)] bg-[var(--card)] h-80 overflow-y-auto p-4 space-y-3 mb-3 font-mono text-xs"
                  >
                    {transcript.map((entry) => (
                      <div key={entry.id} className={`flex gap-2 ${entry.role === "system" ? "justify-center" : ""}`}>
                        {entry.role === "system" ? (
                          <span className="text-[var(--muted)] italic text-center w-full">[{entry.timestamp}] {entry.content}</span>
                        ) : (
                          <>
                            <span
                              className="shrink-0 text-[10px] pt-0.5"
                              style={{ color: entry.role === "trainer" ? "#4488ff" : "#C4FF3C" }}
                            >
                              {entry.role === "trainer" ? "TRAINER" : "YOU"}
                            </span>
                            <div className="flex-1">
                              <span
                                className={`text-[10px] text-[var(--muted)] mr-2`}
                              >
                                {entry.timestamp}
                              </span>
                              <span className="text-[var(--foreground)]">{entry.content}</span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="Type your response..."
                      className="flex-1 px-3 py-2 text-xs bg-[var(--card)] border border-[var(--card-border)] text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--accent)] outline-none font-mono"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 text-xs font-mono bg-[var(--accent)] text-[var(--background)] hover:opacity-90 transition-opacity"
                    >
                      Send
                    </button>
                  </div>
                </div>

                {/* Live Stats Panel */}
                <div className="space-y-4">
                  {/* XP Counter */}
                  <div className={`p-4 border ${xpFlash ? "border-[var(--accent)] bg-[var(--accent)]/10" : "border-[var(--card-border)] bg-[var(--card)]"} transition-all`}>
                    <div className="text-[10px] text-[var(--muted)] uppercase mb-2">XP This Session</div>
                    <div className="text-3xl font-mono text-[var(--accent)]">+{Math.round(sessionProgress * 4.8)}</div>
                    <div className="text-[10px] text-[var(--muted)] mt-1">+{Math.round(sessionProgress * 0.12)} MAIAT earned</div>
                  </div>

                  {/* Current Domain */}
                  <div className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
                    <div className="text-[10px] text-[var(--muted)] uppercase mb-2">Shell Domain</div>
                    <DomainPill domain="Code" />
                    <div className="text-xs text-[var(--muted)] mt-2">TypeScript System Design</div>
                  </div>

                  {/* Stage Steps */}
                  <div className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
                    <div className="text-[10px] text-[var(--muted)] uppercase mb-3">Session Stages</div>
                    <div className="space-y-2">
                      {(["briefing", "challenge", "grading", "feedback", "complete"] as const).map((s, i) => {
                        const stages = ["briefing", "challenge", "grading", "feedback", "complete"];
                        const currentIdx = stages.indexOf(sessionStage);
                        const isComplete = i < currentIdx;
                        const isCurrent = s === sessionStage;
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full border ${isComplete ? "bg-[var(--accent)] border-[var(--accent)]" : isCurrent ? "border-[var(--accent)] animate-pulse" : "border-[var(--card-border)]"}`}
                            />
                            <span
                              className="text-[10px] font-mono"
                              style={{ color: isComplete || isCurrent ? "var(--foreground)" : "var(--muted)" }}
                            >
                              {STAGE_LABELS[s]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setSessionStage("feedback")}
                      className="w-full py-2 text-[10px] font-mono border border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)]/40 transition-colors"
                    >
                      Skip to Feedback
                    </button>
                    <button
                      onClick={() => { setSessionActive(false); setSessionProgress(0); setSessionElapsed(0); }}
                      className="w-full py-2 text-[10px] font-mono border border-red-500/30 text-red-400 hover:bg-red-500/5 transition-colors"
                    >
                      End Session
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">⚔️</div>
                <h2 className="text-xl mb-2">No Active Session</h2>
                <p className="text-sm text-[var(--muted)] mb-6">Pick a shell and start a session to equip a new capability.</p>
                <button
                  onClick={() => setActiveTab("find")}
                  className="px-6 py-3 text-sm font-mono bg-[var(--accent)] text-[var(--background)] hover:opacity-90 transition-opacity"
                >
                  Find a Shell
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Training Plan ─────────────────────────────────────────────── */}
        {activeTab === "plan" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm uppercase tracking-[0.15em] text-[var(--muted)]">Your Skill Roadmap</h2>
                <span className="text-[10px] text-[var(--muted)]">Based on belt progression targets</span>
              </div>
              {SKILL_PLANS.map((plan) => (
                <div key={plan.domain} className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{plan.emoji}</span>
                      <div>
                        <span className="text-sm">{plan.domain}</span>
                        <span
                          className="ml-2 text-[9px] px-1.5 py-0.5 uppercase font-mono"
                          style={{ color: priorityColor(plan.priority), border: `1px solid ${priorityColor(plan.priority)}44` }}
                        >
                          {plan.priority} priority
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-[var(--accent)]">Lvl {plan.currentLevel} → {plan.targetLevel}</div>
                      <div className="text-[10px] text-[var(--muted)]">{plan.xpNeeded.toLocaleString()} XP needed</div>
                    </div>
                  </div>

                  {/* Level Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[9px] text-[var(--muted)] mb-1">
                      <span>Progress to target</span>
                      <span>{Math.round((plan.currentLevel / plan.targetLevel) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--card-border)]/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)]"
                        style={{ width: `${(plan.currentLevel / plan.targetLevel) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-[10px] text-[var(--muted)]">
                      {plan.sessionsNeeded} sessions needed · Trainers:{" "}
                      {plan.recommendedTrainers.map((t) => (
                        <button
                          key={t}
                          onClick={() => {
                            const found = TRAINERS.find((tr) => tr.name === t);
                            if (found) { setSelectedTrainer(found); setActiveTab("find"); }
                          }}
                          className="text-[var(--accent)] hover:underline mx-0.5"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const found = TRAINERS.find((t) => plan.recommendedTrainers.includes(t.name) && t.available);
                        if (found) { setSelectedTrainer(found); handleStartSession(); }
                      }}
                      className="px-3 py-1.5 text-[10px] font-mono bg-[var(--accent)] text-[var(--background)] hover:opacity-90 transition-opacity"
                    >
                      Start Training
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan Summary */}
            <div className="space-y-4">
              <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
                <h3 className="text-sm mb-4">Plan Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Total Sessions</span>
                    <span>{SKILL_PLANS.reduce((a, p) => a + p.sessionsNeeded, 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Total XP Target</span>
                    <span className="text-[var(--accent)]">{SKILL_PLANS.reduce((a, p) => a + p.xpNeeded, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Est. MAIAT Cost</span>
                    <span>~{SKILL_PLANS.reduce((a, p) => a + p.sessionsNeeded * 12, 0)} MAIAT</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted)]">Est. Time</span>
                    <span>~2 weeks</span>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
                <h3 className="text-sm mb-3">Belt Progression</h3>
                <div className="space-y-2">
                  {(["white", "yellow", "green", "blue", "black"] as const).map((belt) => (
                    <div key={belt} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: BELT_COLORS[belt] }} />
                      <span className="text-[10px] text-[var(--muted)] flex-1">{BELT_LABELS[belt]}</span>
                      {belt === "blue" && (
                        <span className="text-[9px] text-[var(--accent)]">← YOU</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
                <h3 className="text-sm mb-3">Next Milestone</h3>
                <div className="text-2xl mb-1">⬛</div>
                <div className="text-sm text-[var(--accent)] mb-1">Black Belt</div>
                <div className="text-xs text-[var(--muted)]">1,820 XP remaining across all domains to unlock Black Belt status.</div>
              </div>
            </div>
          </div>
        )}

        {/* ─── Tab: History ─────────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm uppercase tracking-[0.15em] text-[var(--muted)]">Session History</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--muted)]">42 total sessions</span>
              </div>
            </div>

            {/* Live Completions Feed */}
            <div className="p-4 border border-[var(--card-border)] bg-[var(--card)] mb-6">
              <div className="text-[10px] text-[var(--muted)] uppercase mb-3">Live Completions</div>
              <div className="space-y-2">
                {RECENT_COMPLETIONS.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs py-1.5 border-b border-[var(--card-border)]/30 last:border-0">
                    <span className="text-[var(--muted)] w-20 shrink-0">{c.time}</span>
                    <span className="font-medium">{c.agent}</span>
                    <span className="text-[var(--muted)]">equipped via</span>
                    <span className="text-[var(--accent)]">{c.trainer}</span>
                    <span className="text-[var(--muted)]">on</span>
                    <DomainPill domain={c.domain} />
                    <span className="ml-auto text-[var(--accent)] font-mono">+{c.xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Your History */}
            {[
              { trainer: "Nexus", domain: "Code", skill: "TypeScript Patterns", xp: 480, duration: 24, date: "Mar 21", rating: 5, status: "complete" },
              { trainer: "Zoe", domain: "Creative", skill: "Hook Writing", xp: 340, duration: 18, date: "Mar 20", rating: 5, status: "complete" },
              { trainer: "Volt", domain: "Ops", skill: "CI/CD Pipeline", xp: 390, duration: 31, date: "Mar 19", rating: 4, status: "complete" },
              { trainer: "Sage", domain: "Research", skill: "Market Analysis", xp: 290, duration: 22, date: "Mar 18", rating: 5, status: "complete" },
              { trainer: "Kira", domain: "Communication", skill: "Tone Calibration", xp: 220, duration: 16, date: "Mar 17", rating: 4, status: "complete" },
              { trainer: "Echo", domain: "Business", skill: "GTM Positioning", xp: 310, duration: 28, date: "Mar 16", rating: 5, status: "complete" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 p-4 border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)]/30 transition-colors">
                <div className="text-[10px] text-[var(--muted)] w-16 shrink-0">{s.date}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm">{s.skill}</span>
                    <DomainPill domain={s.domain} />
                  </div>
                  <div className="text-[10px] text-[var(--muted)]">Trainer: {s.trainer} · {s.duration}min</div>
                </div>
                <div className="flex items-center gap-1 mr-2">
                  {"★★★★★".split("").map((_, ri) => (
                    <span key={ri} className="text-xs" style={{ color: ri < s.rating ? "#FFD700" : "#333" }}>★</span>
                  ))}
                </div>
                <div className="text-sm font-mono text-[var(--accent)]">+{s.xp}</div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
