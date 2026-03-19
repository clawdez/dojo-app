"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import {
  mockMarketplaceAgents,
  mockTrainingSessions,
} from "@/lib/mock-data";
import {
  computeMaiatTrustBoost,
  getCertLevel,
  CERT_LEVEL_META,
  TRUST_MULTIPLIER_DOMAINS,
} from "@/lib/maiat-bridge";

// ── Constants ──────────────────────────────────────────────────────────────

const MAIAT_BASE_SCORES: Record<string, number> = {
  "ag-1": 74,
  "ag-2": 81,
  "ag-3": 68,
};

const BELT_EMOJI: Record<string, string> = {
  white: "⬜",
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  black: "⬛",
};

const BELT_COLOR: Record<string, string> = {
  white: "#888",
  yellow: "#FFD700",
  green: "#44ff88",
  blue: "#4488ff",
  black: "#C4FF3C",
};

function getBelt(score: number): string {
  if (score >= 90) return "black";
  if (score >= 75) return "blue";
  if (score >= 60) return "green";
  if (score >= 40) return "yellow";
  return "white";
}

const DOMAIN_COLOR: Record<string, string> = {
  coding: "#4488ff",
  writing: "#a78bfa",
  research: "#34d399",
  ops: "#fbbf24",
  analysis: "#f97316",
  trust: "#C4FF3C",
};

const DOMAIN_LABEL: Record<string, string> = {
  coding: "Coding",
  writing: "Writing",
  research: "Research",
  ops: "Ops",
  analysis: "Analysis",
  trust: "Trust ⚡",
};

// ── Sub-components ─────────────────────────────────────────────────────────

function ScoreRing({
  value,
  size = 80,
  color = "#C4FF3C",
  label,
}: {
  value: number;
  size?: number;
  color?: string;
  label?: string;
}) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272a" strokeWidth="8" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">
          {value}
        </text>
      </svg>
      {label && <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{label}</span>}
    </div>
  );
}

function BarStat({
  label,
  value,
  color,
  max = 100,
}: {
  label: string;
  value: number;
  color: string;
  max?: number;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px]">
        <span className="text-zinc-400">{label}</span>
        <span style={{ color }} className="font-mono font-bold">
          {value}
        </span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${(value / max) * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  color = "#C4FF3C",
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{label}</div>
      <div className="text-2xl font-bold font-mono" style={{ color }}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-zinc-600 mt-1">{sub}</div>}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeAgentId, setActiveAgentId] = useState("ag-1");

  const agent = useMemo(
    () => mockMarketplaceAgents.find((a) => a.id === activeAgentId) ?? mockMarketplaceAgents[0],
    [activeAgentId]
  );

  const sp = agent.skillProfile;
  const boost = useMemo(() => computeMaiatTrustBoost(sp), [sp]);
  const certLevel = useMemo(() => getCertLevel(sp.overallScore, sp.assessmentCount), [sp]);
  const certMeta = CERT_LEVEL_META[certLevel];
  const maiatBase = MAIAT_BASE_SCORES[agent.id] ?? 50;
  const maiatCombined = Math.min(100, maiatBase + boost.total);
  const belt = getBelt(sp.overallScore);

  // Domain aggregation — average score per top-level domain
  const domainScores = useMemo(() => {
    const map: Record<string, number[]> = {};
    for (const cap of sp.capabilities) {
      if (!map[cap.domain]) map[cap.domain] = [];
      map[cap.domain].push(cap.score);
    }
    return Object.entries(map)
      .map(([domain, scores]) => ({
        domain,
        avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [sp]);

  // Trust-specific capabilities
  const trustCaps = useMemo(
    () => sp.capabilities.filter((c) => TRUST_MULTIPLIER_DOMAINS.has(c.domain) || c.domain === "trust"),
    [sp]
  );

  // Weak domains — suggest challenges
  const weakDomains = useMemo(
    () =>
      domainScores
        .filter((d) => d.avg < 80 && d.domain !== "trust")
        .slice(0, 3)
        .map((d) => d.domain),
    [domainScores]
  );

  // Leaderboard rank (across marketplace agents)
  const rank = useMemo(() => {
    const sorted = mockMarketplaceAgents
      .map((a) => {
        const b = computeMaiatTrustBoost(a.skillProfile);
        const base = MAIAT_BASE_SCORES[a.id] ?? 50;
        return { id: a.id, combined: Math.min(100, base + b.total) };
      })
      .sort((a, b) => b.combined - a.combined);
    return sorted.findIndex((a) => a.id === agent.id) + 1;
  }, [agent.id]);

  // Recent sessions for this agent
  const recentSessions = useMemo(
    () => mockTrainingSessions.filter((s) => s.status === "completed").slice(0, 3),
    []
  );

  // Dayss since last assessed
  const daysSince = Math.floor(
    (Date.now() - new Date(sp.lastAssessed).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ── Agent Selector ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">Your Dojo performance & Maiat trust at a glance</p>
          </div>
          <select
            value={activeAgentId}
            onChange={(e) => setActiveAgentId(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[var(--accent)]"
          >
            {mockMarketplaceAgents.map((a) => (
              <option key={a.id} value={a.id}>
                {a.avatar} {a.skillProfile.agentName}
              </option>
            ))}
          </select>
        </div>

        {/* ── Identity Card ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar + Belt */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl border-2"
                style={{ borderColor: BELT_COLOR[belt] }}
              >
                {agent.avatar}
              </div>
              <span
                className="text-[10px] font-mono px-2 py-0.5 rounded border"
                style={{ color: BELT_COLOR[belt], borderColor: BELT_COLOR[belt] + "44" }}
              >
                {BELT_EMOJI[belt]} {belt.charAt(0).toUpperCase() + belt.slice(1)} Belt
              </span>
            </div>

            {/* Name + Details */}
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{sp.agentName}</h2>
                <span
                  className="text-xs px-2 py-0.5 rounded border font-mono"
                  style={{ color: certMeta.color, borderColor: certMeta.color + "44" }}
                >
                  {certMeta.emoji} {certMeta.label}
                </span>
                {agent.availability === "available" && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    Available
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-4 mt-2 text-xs text-zinc-500">
                <span>Model: <span className="text-zinc-300">{sp.model}</span></span>
                <span>Owner: <span className="text-zinc-300">{sp.owner}</span></span>
                {sp.walletAddress && (
                  <span>Wallet: <span className="text-zinc-300 font-mono">{sp.walletAddress}</span></span>
                )}
                <span>
                  Last assessed:{" "}
                  <span className={daysSince > 30 ? "text-red-400" : "text-zinc-300"}>
                    {daysSince === 0 ? "today" : `${daysSince}d ago`}
                    {daysSince > 30 && " ⚠️ expired"}
                  </span>
                </span>
              </div>
              {/* Top skills */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {sp.topSkills.map((skill) => (
                  <span key={skill} className="px-2 py-0.5 text-[10px] border border-zinc-700 text-zinc-400 rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href="/challenges"
                className="px-4 py-2 text-xs border border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)] hover:text-black transition-colors text-center"
              >
                ⚔️ Take Challenge
              </Link>
              <Link
                href="/trainers"
                className="px-4 py-2 text-xs border border-zinc-700 text-zinc-300 rounded-lg hover:border-zinc-500 transition-colors text-center"
              >
                🥋 Find Trainer
              </Link>
              <Link
                href={`/badge/${agent.id}`}
                className="px-4 py-2 text-xs border border-zinc-700 text-zinc-300 rounded-lg hover:border-zinc-500 transition-colors text-center"
              >
                🏅 View Badge
              </Link>
            </div>
          </div>
        </div>

        {/* ── Score Overview ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Dojo Score" value={sp.overallScore} sub={`${sp.assessmentCount} assessments`} color={BELT_COLOR[belt]} />
          <StatCard label="Maiat Base" value={maiatBase} sub="On-chain trust" color="#60a5fa" />
          <StatCard label="Dojo Boost" value={`+${boost.total}`} sub="Max +30 pts" color="#a78bfa" />
          <StatCard label="Combined Score" value={maiatCombined} sub={`#${rank} overall`} color="#C4FF3C" />
        </div>

        {/* ── Score Rings + Boost Breakdown ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Rings */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-6">Score Breakdown</h3>
            <div className="flex items-center justify-around">
              <ScoreRing value={sp.overallScore} size={100} color={BELT_COLOR[belt]} label="Dojo" />
              <div className="text-zinc-700 text-2xl font-mono">+</div>
              <ScoreRing value={maiatBase} size={100} color="#60a5fa" label="Maiat" />
              <div className="text-zinc-700 text-2xl font-mono">=</div>
              <ScoreRing value={maiatCombined} size={100} color="#C4FF3C" label="Combined" />
            </div>
            <div className="mt-6 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-[11px] text-zinc-400 font-mono">{boost.breakdown.explanation}</p>
            </div>
          </div>

          {/* Boost breakdown */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">Trust Boost Components</h3>
            <div className="space-y-4">
              <BarStat label="Score Quality" value={boost.breakdown.scoreBoost} max={12} color="#C4FF3C" />
              <BarStat label="Domain Breadth" value={boost.breakdown.breadthBoost} max={6} color="#4488ff" />
              <BarStat label="Assessor Confidence" value={boost.breakdown.confidenceBoost} max={4} color="#a78bfa" />
              <BarStat label="Assessment Freshness" value={boost.breakdown.recencyBoost} max={3} color="#34d399" />
              <BarStat label="Trust Domain Bonus" value={boost.breakdown.trustDomainBonus} max={5} color="#fbbf24" />
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
              <span className="text-xs text-zinc-500">Total boost applied</span>
              <span className="text-lg font-bold font-mono" style={{ color: "#C4FF3C" }}>
                +{boost.total} / 30 pts
              </span>
            </div>
          </div>
        </div>

        {/* ── Domain Skills ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Skill bars */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Skill Domains</h3>
              <Link href="/certifications" className="text-[10px] text-[var(--accent)] hover:underline">
                Full cert →
              </Link>
            </div>
            <div className="space-y-4">
              {domainScores.map(({ domain, avg }) => (
                <BarStat
                  key={domain}
                  label={DOMAIN_LABEL[domain] ?? domain}
                  value={avg}
                  color={DOMAIN_COLOR[domain] ?? "#888"}
                />
              ))}
            </div>
            {sp.weaknesses.length > 0 && (
              <div className="mt-5 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Weaknesses flagged</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {sp.weaknesses.map((w) => (
                    <span key={w} className="px-2 py-0.5 text-[10px] border border-red-900/50 text-red-400 rounded">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Trust domains */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Trust Domains ⚡
              </h3>
              <Link href="/trust-domains" className="text-[10px] text-[var(--accent)] hover:underline">
                Learn more →
              </Link>
            </div>
            {trustCaps.length > 0 ? (
              <div className="space-y-4">
                {trustCaps.map((cap) => (
                  <div key={cap.subdomain} className="space-y-2">
                    <BarStat
                      label={`trust.${cap.subdomain}`}
                      value={cap.score}
                      color="#C4FF3C"
                    />
                    <p className="text-[10px] text-zinc-600 pl-1">
                      {cap.challengeResults[0]?.notes ?? "No notes"}
                    </p>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-[#C4FF3C]/5 border border-[#C4FF3C]/20 rounded-lg">
                  <p className="text-[11px] text-[#C4FF3C]/80">
                    ⚡ Trust domain bonus: <strong>+{boost.breakdown.trustDomainBonus} pts</strong> applied to Maiat boost
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-zinc-500 text-sm mb-3">No trust assessments on record</p>
                <p className="text-zinc-600 text-xs mb-4">
                  Complete honesty, safety, and adversarial assessments to unlock a +5 pt trust domain bonus.
                </p>
                <Link
                  href="/challenges"
                  className="px-4 py-2 text-xs border border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)] hover:text-black transition-colors"
                >
                  Take Trust Challenges →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── Recommended Challenges + Recent Sessions ── */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recommended challenges */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-5">
              Recommended Next
            </h3>
            {weakDomains.length > 0 ? (
              <div className="space-y-3">
                {weakDomains.map((domain) => {
                  const score = domainScores.find((d) => d.domain === domain)?.avg ?? 0;
                  return (
                    <Link
                      key={domain}
                      href="/challenges"
                      className="flex items-center justify-between p-3 bg-zinc-800/50 border border-zinc-700 hover:border-zinc-500 rounded-lg transition-colors group"
                    >
                      <div>
                        <div className="text-sm text-white group-hover:text-[var(--accent)] transition-colors">
                          Improve {DOMAIN_LABEL[domain] ?? domain}
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          Current: {score}/100 — target: {Math.min(100, score + 15)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="text-xs px-2 py-0.5 rounded border"
                          style={{
                            color: DOMAIN_COLOR[domain] ?? "#888",
                            borderColor: (DOMAIN_COLOR[domain] ?? "#888") + "33",
                          }}
                        >
                          {DOMAIN_LABEL[domain]}
                        </div>
                        <span className="text-zinc-600 group-hover:text-white transition-colors">→</span>
                      </div>
                    </Link>
                  );
                })}
                <Link
                  href="/quests"
                  className="block text-center text-xs text-zinc-500 hover:text-[var(--accent)] transition-colors pt-2"
                >
                  View all quests & challenges →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <p className="text-zinc-400 text-sm">🎉 All domains strong!</p>
                <Link href="/quests" className="text-[var(--accent)] text-xs mt-2 hover:underline">
                  Check quests for XP →
                </Link>
              </div>
            )}
          </div>

          {/* Recent sessions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Recent Sessions</h3>
              <Link href="/sessions" className="text-[10px] text-[var(--accent)] hover:underline">
                All sessions →
              </Link>
            </div>
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm text-white">{session.skill}</span>
                    <span className="text-[10px] text-green-400">✓ Done</span>
                  </div>
                  <div className="text-[11px] text-zinc-500">
                    Trainer: {session.trainerName} · {session.durationMinutes}m
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {session.toolsTransferred.slice(0, 3).map((tool) => (
                      <span
                        key={tool}
                        className="px-1.5 py-0.5 text-[9px] border border-zinc-700 text-zinc-500 rounded"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Certification Assessment Detail ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Assessment History — {sp.assessmentCount} assessments
            </h3>
            <Link href="/certifications" className="text-[10px] text-[var(--accent)] hover:underline">
              View certs →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                  <th className="text-left pb-2 pr-4">Domain</th>
                  <th className="text-left pb-2 pr-4">Subdomain</th>
                  <th className="text-right pb-2 pr-4">Score</th>
                  <th className="text-right pb-2 pr-4">Confidence</th>
                  <th className="text-right pb-2 pr-4">Trials</th>
                  <th className="text-left pb-2">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {sp.capabilities.map((cap, idx) => {
                  const isTrust = TRUST_MULTIPLIER_DOMAINS.has(cap.domain) || cap.domain === "trust";
                  return (
                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="py-2 pr-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] border"
                          style={{
                            color: isTrust ? "#C4FF3C" : (DOMAIN_COLOR[cap.domain] ?? "#888"),
                            borderColor: (isTrust ? "#C4FF3C" : (DOMAIN_COLOR[cap.domain] ?? "#888")) + "33",
                          }}
                        >
                          {cap.domain}
                          {isTrust && " ⚡"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-zinc-300">{cap.subdomain}</td>
                      <td className="py-2 pr-4 text-right">
                        <span
                          className="font-mono font-bold"
                          style={{ color: cap.score >= 85 ? "#C4FF3C" : cap.score >= 70 ? "#fbbf24" : "#f87171" }}
                        >
                          {cap.score}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right text-zinc-400 font-mono">
                        {Math.round(cap.confidence * 100)}%
                      </td>
                      <td className="py-2 pr-4 text-right text-zinc-500">{cap.trialCount}</td>
                      <td className="py-2 text-zinc-500 max-w-xs truncate">
                        {cap.challengeResults[0]?.notes ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Maiat API Quick Integration ── */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Maiat Integration — Pull This Agent&apos;s Data
            </h3>
            <Link href="/docs" className="text-[10px] text-[var(--accent)] hover:underline">
              Full API docs →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] text-zinc-500 mb-2">Fetch cert data (GET)</p>
              <pre className="bg-black/50 border border-zinc-800 rounded-lg p-3 text-[10px] text-zinc-300 font-mono overflow-x-auto">
                {`GET /api/v1/agent-cert/${agent.id}
→ { agentId, certLevel, overallScore,
    dojoBoost, domainScores, lastAssessed }`}
              </pre>
            </div>
            <div>
              <p className="text-[11px] text-zinc-500 mb-2">Compute combined score (POST)</p>
              <pre className="bg-black/50 border border-zinc-800 rounded-lg p-3 text-[10px] text-zinc-300 font-mono overflow-x-auto">
                {`POST /api/v1/maiat
{ agentId: "${agent.id}", maiatBaseScore: ${maiatBase} }
→ combinedScore: ${maiatCombined}`}
              </pre>
            </div>
          </div>
        </div>

        {/* ── Bottom Action Row ── */}
        <div className="flex flex-wrap gap-3 pb-4">
          <Link
            href="/leaderboard"
            className="px-4 py-2 text-sm border border-zinc-700 text-zinc-300 rounded-lg hover:border-zinc-500 transition-colors"
          >
            🏆 Leaderboard
          </Link>
          <Link
            href="/compare"
            className="px-4 py-2 text-sm border border-zinc-700 text-zinc-300 rounded-lg hover:border-zinc-500 transition-colors"
          >
            ↔️ Compare Agents
          </Link>
          <Link
            href="/rankings"
            className="px-4 py-2 text-sm border border-zinc-700 text-zinc-300 rounded-lg hover:border-zinc-500 transition-colors"
          >
            📊 Season Rankings
          </Link>
          <Link
            href="/store"
            className="px-4 py-2 text-sm border border-zinc-700 text-zinc-300 rounded-lg hover:border-zinc-500 transition-colors"
          >
            🛍️ MAIAT Store
          </Link>
          <Link
            href={`/badge/${agent.id}`}
            className="px-4 py-2 text-sm border border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)] hover:text-black transition-colors"
          >
            🏅 Embed Badge
          </Link>
        </div>
      </main>
    </div>
  );
}
