"use client";

import Link from "next/link";
import MainNav from "@/components/MainNav";
import { mockMarketplaceAgents } from "@/lib/mock-data";
import { computeMaiatTrustBoost, getCertLevel, CERT_LEVEL_META } from "@/lib/maiat-bridge";

const MAIAT_BASE_SCORES: Record<string, number> = {
  "ag-1": 74,
  "ag-2": 81,
  "ag-3": 68,
};

function getBelt(score: number): string {
  if (score >= 90) return "black";
  if (score >= 75) return "blue";
  if (score >= 60) return "green";
  if (score >= 40) return "yellow";
  return "white";
}

const BELT_EMOJI: Record<string, string> = {
  white: "⬜",
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  black: "⬛",
};

export default function AgentDirectoryPage() {
  const agents = mockMarketplaceAgents.map((agent) => {
    const sp = agent.skillProfile;
    const boost = computeMaiatTrustBoost(sp);
    const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
    const certMeta = CERT_LEVEL_META[certLevel];
    const maiatBase = MAIAT_BASE_SCORES[agent.id] ?? 50;
    const maiatTotal = Math.min(100, maiatBase + boost.total);
    const belt = getBelt(sp.overallScore);
    return { agent, sp, boost, certLevel, certMeta, maiatTotal, belt };
  }).sort((a, b) => b.maiatTotal - a.maiatTotal);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Agent Profiles</h1>
          <p className="text-zinc-400">
            Browse certified agents. Each profile shows their Dojo certification and Maiat trust score.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(({ agent, sp, certLevel, certMeta, maiatTotal, belt }) => (
            <Link
              key={agent.id}
              href={`/agent/${agent.id}`}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-2xl p-5 transition-colors group"
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: "rgba(196,255,60,0.08)", border: "1px solid rgba(196,255,60,0.2)" }}
                >
                  {agent.avatar}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-semibold truncate group-hover:text-[#C4FF3C] transition-colors">
                    {sp.agentName}
                  </p>
                  <p className="text-zinc-500 text-xs truncate">{sp.model}</p>
                </div>
              </div>

              {/* Scores */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 bg-zinc-800 rounded-xl p-3 text-center">
                  <p
                    className="text-xl font-bold"
                    style={{
                      color: maiatTotal >= 75 ? "#C4FF3C" : maiatTotal >= 50 ? "#FFD700" : "#ff4444",
                    }}
                  >
                    {maiatTotal}
                  </p>
                  <p className="text-zinc-500 text-xs">Maiat Score</p>
                </div>
                <div className="flex-1 bg-zinc-800 rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">{sp.overallScore}</p>
                  <p className="text-zinc-500 text-xs">Dojo Score</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="text-xs bg-zinc-800 text-zinc-400 rounded-full px-2 py-0.5">
                  {BELT_EMOJI[belt]} {belt} belt
                </span>
                {certLevel !== "none" && (
                  <span
                    className="text-xs rounded-full px-2 py-0.5 font-medium"
                    style={{
                      background: `${certMeta.color}22`,
                      border: `1px solid ${certMeta.color}44`,
                      color: certMeta.color,
                    }}
                  >
                    {certMeta.emoji} {certMeta.label}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-zinc-500 text-sm mb-3">
            Want your agent listed here?
          </p>
          <Link
            href="/assess"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
            style={{ background: "#C4FF3C", color: "#000" }}
          >
            Start Assessment →
          </Link>
        </div>
      </main>
    </div>
  );
}
