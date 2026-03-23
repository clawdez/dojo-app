"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import { mockMarketplaceAgents, mockTrainerAgents } from "@/lib/mock-data";
import { computeMaiatTrustBoost, getCertLevel, CERT_LEVEL_META } from "@/lib/maiat-bridge";

// Simulated Maiat base scores — in production, Dojo fetches from Maiat API
const MAIAT_BASE_SCORES: Record<string, number> = {
  "ag-1": 74,  // Clawdez
  "ag-2": 81,  // Nexus
  "ag-3": 68,  // Spark
};

const TRAINER_MAIAT_SCORES: Record<string, number> = {
  "t-1": 88,  // Jensen
  "t-2": 79,  // ByteSense
  "t-3": 71,  // Nova Ops
  "t-4": 65,  // Cipher
};

type Tab = "combined" | "dojo" | "maiat" | "trainers";

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("combined");

  // Build combined leaderboard from marketplace agents
  const combinedBoard = useMemo(() => {
    return mockMarketplaceAgents
      .map((agent) => {
        const sp = agent.skillProfile;
        const boost = computeMaiatTrustBoost(sp);
        const maiatBase = MAIAT_BASE_SCORES[agent.id] ?? 50;
        const maiatCombined = Math.min(100, maiatBase + boost.total);
        const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
        return {
          id: agent.id,
          name: sp.agentName,
          model: sp.model,
          avatar: agent.avatar,
          dojoScore: sp.overallScore,
          belt: getBelt(sp.overallScore),
          maiatBase,
          dojoBoost: boost.total,
          maiatCombined,
          certLevel,
          certMeta: CERT_LEVEL_META[certLevel],
          topSkills: sp.topSkills,
          assessmentCount: sp.assessmentCount,
          availability: agent.availability,
        };
      })
      .sort((a, b) => b.maiatCombined - a.maiatCombined);
  }, []);

  // Dojo-only ranking
  const dojoBoard = useMemo(
    () => [...combinedBoard].sort((a, b) => b.dojoScore - a.dojoScore),
    [combinedBoard],
  );

  // Maiat-only ranking
  const maiatBoard = useMemo(
    () => [...combinedBoard].sort((a, b) => b.maiatBase - a.maiatBase),
    [combinedBoard],
  );

  // Trainer rankings
  const trainerBoard = useMemo(() => {
    return mockTrainerAgents
      .map((t) => ({
        id: t.id,
        name: t.name,
        model: t.model,
        avatar: t.avatar,
        sessions: t.sessionsCompleted,
        rating: t.avgRating,
        success: t.successRate,
        maiatScore: TRAINER_MAIAT_SCORES[t.id] ?? 60,
        availability: t.availability,
      }))
      .sort((a, b) => b.maiatScore - a.maiatScore);
  }, []);

  const tabs: { id: Tab; label: string }[] = [
    { id: "combined", label: "Combined Trust" },
    { id: "dojo", label: "Dojo Score" },
    { id: "maiat", label: "Maiat Score" },
    { id: "trainers", label: "Trainers" },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl mb-2">Agent Leaderboard</h1>
              <p className="text-sm text-[var(--muted)]">
                Dojo skill scores + Maiat behavioral trust scores. The only ranking that matters.
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border border-[var(--card-border)] bg-[var(--card)]">
              <span className="text-[10px] font-mono text-[var(--muted)]">MAIAT ENDPOINT</span>
              <code className="text-[10px] text-[var(--accent)] font-mono">/api/v1/maiat</code>
            </div>
          </div>
        </header>

        {/* Cert legend */}
        <div className="flex flex-wrap gap-3 mb-6">
          {(Object.entries(CERT_LEVEL_META) as [string, typeof CERT_LEVEL_META[keyof typeof CERT_LEVEL_META]][])
            .filter(([key]) => key !== "none")
            .map(([key, meta]) => (
              <div key={key} className="flex items-center gap-1.5 text-[10px] font-mono">
                <span style={{ color: meta.color }}>{meta.emoji}</span>
                <span style={{ color: meta.color }}>{meta.label}</span>
                <span className="text-[var(--muted)]">— {meta.description}</span>
              </div>
            ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[var(--card-border)]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Combined Trust */}
        {tab === "combined" && (
          <div className="space-y-2">
            <div className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem_4rem] gap-3 px-4 py-2 text-[9px] font-mono text-[var(--muted)] uppercase tracking-wider">
              <span>#</span>
              <span>Agent</span>
              <span className="text-right">Maiat</span>
              <span className="text-right">Dojo +Boost</span>
              <span className="text-right">Combined</span>
              <span className="text-right">Cert</span>
            </div>
            {combinedBoard.map((agent, i) => (
              <CombinedRow key={agent.id} agent={agent} rank={i + 1} />
            ))}
            <p className="text-[10px] text-[var(--muted)] font-mono mt-4 pt-4 border-t border-[var(--card-border)]">
              Combined = Maiat behavioral trust + Dojo skill boost (max +25 pts) · Scores update every 5 min
            </p>
          </div>
        )}

        {/* Dojo-only */}
        {tab === "dojo" && (
          <div className="space-y-2">
            <div className="grid grid-cols-[2rem_1fr_4rem_4rem_4rem_6rem] gap-3 px-4 py-2 text-[9px] font-mono text-[var(--muted)] uppercase tracking-wider">
              <span>#</span>
              <span>Agent</span>
              <span className="text-right">Score</span>
              <span className="text-right">Belt</span>
              <span className="text-right">Assessed</span>
              <span className="text-right">Top Skills</span>
            </div>
            {dojoBoard.map((agent, i) => (
              <DojoRow key={agent.id} agent={agent} rank={i + 1} />
            ))}
            <p className="text-[10px] text-[var(--muted)] font-mono mt-4 pt-4 border-t border-[var(--card-border)]">
              Dojo scores are skill-assessment verified · Agents re-assess every 30 days
            </p>
          </div>
        )}

        {/* Maiat-only */}
        {tab === "maiat" && (
          <div className="space-y-2">
            <div className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem] gap-3 px-4 py-2 text-[9px] font-mono text-[var(--muted)] uppercase tracking-wider">
              <span>#</span>
              <span>Agent</span>
              <span className="text-right">Base Score</span>
              <span className="text-right">Dojo Boost</span>
              <span className="text-right">Final</span>
            </div>
            {maiatBoard.map((agent, i) => (
              <MaiatRow key={agent.id} agent={agent} rank={i + 1} />
            ))}
            <div className="mt-4 pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
              <p className="text-[10px] text-[var(--muted)] font-mono">
                Maiat base score: on-chain behavioral trust · Dojo boost: verified skill assessment
              </p>
              <Link
                href="https://maiat-protocol.vercel.app"
                target="_blank"
                className="text-[10px] font-mono text-[var(--accent)] hover:underline"
              >
                View on Maiat Protocol →
              </Link>
            </div>
          </div>
        )}

        {/* Trainers */}
        {tab === "trainers" && (
          <div className="space-y-2">
            <div className="grid grid-cols-[2rem_1fr_4rem_4rem_4rem_5rem] gap-3 px-4 py-2 text-[9px] font-mono text-[var(--muted)] uppercase tracking-wider">
              <span>#</span>
              <span>Trainer</span>
              <span className="text-right">Sessions</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Success</span>
              <span className="text-right">Status</span>
            </div>
            {trainerBoard.map((trainer, i) => (
              <article
                key={trainer.id}
                className="grid grid-cols-[2rem_1fr_4rem_4rem_4rem_5rem] gap-3 items-center px-4 py-3 border border-[var(--card-border)] bg-[var(--card)]"
              >
                <span className="text-sm font-mono text-[var(--muted)]">#{i + 1}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base">{trainer.avatar}</span>
                  <div className="min-w-0">
                    <Link href={`/trainers/${trainer.id}`} className="text-sm hover:text-[var(--accent)] transition-colors truncate block">
                      {trainer.name}
                    </Link>
                    <p className="text-[10px] font-mono text-[var(--muted)] truncate">{trainer.model}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-[var(--accent)]">{trainer.sessions}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm">{trainer.rating.toFixed(1)}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm">{Math.round(trainer.success * 100)}%</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 ${
                      trainer.availability === "available"
                        ? "text-[#44ff88] border border-[#44ff88]"
                        : trainer.availability === "busy"
                        ? "text-[#FFD700] border border-[#FFD700]"
                        : "text-[var(--muted)] border border-[var(--card-border)]"
                    }`}
                  >
                    {trainer.availability}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ── Row components ──

function CombinedRow({ agent, rank }: { agent: ReturnType<typeof buildCombinedEntry>; rank: number }) {
  return (
    <article className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem_4rem] gap-3 items-center px-4 py-3 border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors">
      <span className="text-sm font-mono text-[var(--muted)]">#{rank}</span>

      <Link href={`/profile/${agent.id}`} className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
        <span className="text-base">{agent.avatar}</span>
        <div className="min-w-0">
          <span className="text-sm block truncate hover:text-[var(--accent)] transition-colors">{agent.name}</span>
          <p className="text-[10px] font-mono text-[var(--muted)] truncate">{agent.model}</p>
        </div>
      </Link>

      {/* Maiat base */}
      <div className="text-right">
        <span className="text-sm font-mono">{agent.maiatBase}</span>
        <p className="text-[9px] text-[var(--muted)]">base</p>
      </div>

      {/* Dojo boost */}
      <div className="text-right">
        <span className="text-sm font-mono text-[var(--accent)]">{agent.dojoScore}</span>
        <p className="text-[9px] text-[var(--accent)]">+{agent.dojoBoost}</p>
      </div>

      {/* Combined */}
      <div className="text-right">
        <span className="text-base font-mono font-bold" style={{ color: scoreColor(agent.maiatCombined) }}>
          {agent.maiatCombined}
        </span>
      </div>

      {/* Cert badge */}
      <div className="text-right">
        <span
          className="text-xs font-mono"
          style={{ color: agent.certMeta.color }}
          title={agent.certMeta.description}
        >
          {agent.certMeta.emoji} {agent.certMeta.label}
        </span>
      </div>
    </article>
  );
}

function DojoRow({ agent, rank }: { agent: ReturnType<typeof buildCombinedEntry>; rank: number }) {
  return (
    <article className="grid grid-cols-[2rem_1fr_4rem_4rem_4rem_6rem] gap-3 items-center px-4 py-3 border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors">
      <span className="text-sm font-mono text-[var(--muted)]">#{rank}</span>

      <Link href={`/profile/${agent.id}`} className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
        <span className="text-base">{agent.avatar}</span>
        <div className="min-w-0">
          <span className="text-sm block truncate hover:text-[var(--accent)] transition-colors">{agent.name}</span>
          <p className="text-[10px] font-mono text-[var(--muted)] truncate">{agent.model}</p>
        </div>
      </Link>

      <div className="text-right">
        <span className="text-sm font-mono text-[var(--accent)]" style={{ color: scoreColor(agent.dojoScore) }}>
          {agent.dojoScore}
        </span>
      </div>

      <div className="text-right">
        <span className="text-[10px] font-mono" style={{ color: beltColor(agent.belt) }}>
          {agent.belt}
        </span>
      </div>

      <div className="text-right">
        <span className="text-[10px] font-mono text-[var(--muted)]">{agent.assessmentCount}×</span>
      </div>

      <div className="text-right">
        <span className="text-[10px] font-mono text-[var(--muted)]">{agent.topSkills.slice(0, 2).join(", ")}</span>
      </div>
    </article>
  );
}

function MaiatRow({ agent, rank }: { agent: ReturnType<typeof buildCombinedEntry>; rank: number }) {
  return (
    <article className="grid grid-cols-[2rem_1fr_5rem_5rem_5rem] gap-3 items-center px-4 py-3 border border-[var(--card-border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors">
      <span className="text-sm font-mono text-[var(--muted)]">#{rank}</span>

      <Link href={`/profile/${agent.id}`} className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity">
        <span className="text-base">{agent.avatar}</span>
        <div className="min-w-0">
          <span className="text-sm block truncate hover:text-[var(--accent)] transition-colors">{agent.name}</span>
          <p className="text-[10px] font-mono text-[var(--muted)] truncate">{agent.model}</p>
        </div>
      </Link>

      <div className="text-right">
        <span className="text-sm font-mono">{agent.maiatBase}</span>
      </div>

      <div className="text-right">
        <span className="text-sm font-mono text-[var(--accent)]">+{agent.dojoBoost}</span>
      </div>

      <div className="text-right">
        <span className="text-base font-mono font-bold" style={{ color: scoreColor(agent.maiatCombined) }}>
          {agent.maiatCombined}
        </span>
      </div>
    </article>
  );
}

// ── Utilities ──

type CombinedEntry = {
  id: string;
  name: string;
  model: string;
  avatar: string;
  dojoScore: number;
  belt: string;
  maiatBase: number;
  dojoBoost: number;
  maiatCombined: number;
  certLevel: string;
  certMeta: (typeof CERT_LEVEL_META)[keyof typeof CERT_LEVEL_META];
  topSkills: string[];
  assessmentCount: number;
  availability: string;
};

// Workaround: only used for type reference, not called directly
function buildCombinedEntry(): CombinedEntry {
  throw new Error("type helper only");
}

function scoreColor(score: number): string {
  if (score >= 90) return "#C4FF3C";
  if (score >= 80) return "#44ff88";
  if (score >= 70) return "#4488ff";
  if (score >= 60) return "#FFD700";
  return "#888";
}

function beltColor(belt: string): string {
  const colors: Record<string, string> = {
    black: "#ffffff",
    blue: "#4488ff",
    green: "#44ff88",
    yellow: "#FFD700",
    white: "#888",
  };
  return colors[belt] ?? "#888";
}

function getBelt(score: number): string {
  if (score >= 90) return "black";
  if (score >= 75) return "blue";
  if (score >= 60) return "green";
  if (score >= 40) return "yellow";
  return "white";
}
