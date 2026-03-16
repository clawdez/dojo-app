"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import { mockMarketplaceAgents } from "@/lib/mock-data";
import {
  computeMaiatTrustBoost,
  getCertLevel,
  CERT_LEVEL_META,
  TRUST_MULTIPLIER_DOMAINS,
} from "@/lib/maiat-bridge";

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

const BELT_LABEL: Record<string, string> = {
  white: "White Belt",
  yellow: "Yellow Belt",
  green: "Green Belt",
  blue: "Blue Belt",
  black: "Black Belt",
};

const AVAIL_DOT: Record<string, string> = {
  available: "bg-green-400",
  busy: "bg-yellow-400",
  offline: "bg-zinc-600",
};

const AVAIL_LABEL: Record<string, string> = {
  available: "Available",
  busy: "Busy",
  offline: "Offline",
};

function ScoreRing({
  value,
  size = 80,
  color = "#C4FF3C",
}: {
  value: number;
  size?: number;
  color?: string;
}) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#27272a"
        strokeWidth="8"
      />
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
      <text
        x={size / 2}
        y={size / 2 + 5}
        textAnchor="middle"
        fill="white"
        fontSize="14"
        fontWeight="bold"
      >
        {value}
      </text>
    </svg>
  );
}

export default function AgentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [copied, setCopied] = useState(false);

  const agent = mockMarketplaceAgents.find((a) => a.id === id);
  if (!agent) notFound();

  const sp = agent.skillProfile;
  const boost = computeMaiatTrustBoost(sp);
  const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
  const certMeta = CERT_LEVEL_META[certLevel];
  const maiatBase = MAIAT_BASE_SCORES[id] ?? 50;
  const maiatTotal = Math.min(100, maiatBase + boost.total);
  const belt = getBelt(sp.overallScore);

  const sortedCaps = [...sp.capabilities].sort((a, b) => b.score - a.score);
  const trustCaps = sortedCaps.filter(
    (c) =>
      TRUST_MULTIPLIER_DOMAINS.has(c.domain) ||
      TRUST_MULTIPLIER_DOMAINS.has(`${c.domain}.${c.subdomain}`),
  );
  const otherCaps = sortedCaps.filter(
    (c) =>
      !TRUST_MULTIPLIER_DOMAINS.has(c.domain) &&
      !TRUST_MULTIPLIER_DOMAINS.has(`${c.domain}.${c.subdomain}`),
  );

  const maiatColor =
    maiatTotal >= 75 ? "#C4FF3C" : maiatTotal >= 50 ? "#FFD700" : "#ff4444";

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* HERO */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: "rgba(196,255,60,0.1)", border: "1px solid rgba(196,255,60,0.3)" }}
            >
              {agent.avatar}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-white">{sp.agentName}</h1>
                <span className="text-sm text-zinc-500 bg-zinc-800 rounded-full px-3 py-0.5">
                  {sp.model}
                </span>
              </div>
              <p className="text-zinc-400 text-sm mb-3">
                Owner:{" "}
                <span className="text-white font-medium">@{sp.owner}</span>
                {sp.walletAddress && (
                  <span className="ml-2 text-zinc-600 font-mono text-xs">
                    {sp.walletAddress}
                  </span>
                )}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {/* Belt */}
                <span className="flex items-center gap-1 bg-zinc-800 rounded-full px-3 py-1 text-sm">
                  {BELT_EMOJI[belt]} {BELT_LABEL[belt]}
                </span>
                {/* Cert badge */}
                {certLevel !== "none" && (
                  <span
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold"
                    style={{
                      background: `${certMeta.color}22`,
                      border: `1px solid ${certMeta.color}`,
                      color: certMeta.color,
                    }}
                  >
                    {certMeta.emoji} {certMeta.label}
                  </span>
                )}
                {/* Availability */}
                <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                  <span
                    className={`w-2 h-2 rounded-full ${AVAIL_DOT[agent.availability] ?? "bg-zinc-600"}`}
                  />
                  {AVAIL_LABEL[agent.availability] ?? agent.availability}
                </span>
              </div>
            </div>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex-shrink-0 flex items-center gap-2 text-sm border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white rounded-xl px-4 py-2 transition-colors"
            >
              {copied ? "✓ Copied!" : "🔗 Share Profile"}
            </button>
          </div>
        </div>

        {/* TWO COLUMN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Maiat Trust Score */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Maiat Trust Score
            </h2>
            <div className="flex items-center gap-4 mb-5">
              <ScoreRing value={maiatTotal} size={90} color={maiatColor} />
              <div>
                <p
                  className="text-5xl font-bold"
                  style={{ color: maiatColor }}
                >
                  {maiatTotal}
                </p>
                <p className="text-zinc-500 text-sm">out of 100</p>
              </div>
            </div>
            {/* Bar */}
            <div className="w-full h-2 rounded-full bg-zinc-800 mb-5">
              <div
                className="h-2 rounded-full transition-all"
                style={{
                  width: `${maiatTotal}%`,
                  background: maiatColor,
                }}
              />
            </div>
            {/* Breakdown */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">Maiat Base</span>
                <span className="text-white font-medium">{maiatBase} pts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Dojo Boost</span>
                <span className="font-medium" style={{ color: "#C4FF3C" }}>
                  +{boost.total} pts
                </span>
              </div>
              {boost.breakdown.scoreBoost > 0 && (
                <div className="flex justify-between pl-4">
                  <span className="text-zinc-600">↳ Score quality</span>
                  <span className="text-zinc-400">+{boost.breakdown.scoreBoost}</span>
                </div>
              )}
              {boost.breakdown.breadthBoost > 0 && (
                <div className="flex justify-between pl-4">
                  <span className="text-zinc-600">↳ Domain breadth</span>
                  <span className="text-zinc-400">+{boost.breakdown.breadthBoost.toFixed(1)}</span>
                </div>
              )}
              {boost.breakdown.confidenceBoost > 0 && (
                <div className="flex justify-between pl-4">
                  <span className="text-zinc-600">↳ Assessor confidence</span>
                  <span className="text-zinc-400">+{boost.breakdown.confidenceBoost}</span>
                </div>
              )}
              {boost.breakdown.recencyBoost > 0 && (
                <div className="flex justify-between pl-4">
                  <span className="text-zinc-600">↳ Recency</span>
                  <span className="text-zinc-400">+{boost.breakdown.recencyBoost.toFixed(1)}</span>
                </div>
              )}
              {boost.breakdown.trustDomainBonus > 0 && (
                <div className="flex justify-between pl-4">
                  <span className="text-yellow-500">↳ Trust domains ⚡</span>
                  <span className="text-yellow-400">+{boost.breakdown.trustDomainBonus.toFixed(1)}</span>
                </div>
              )}
            </div>
            <div className="mt-5 pt-4 border-t border-zinc-800 text-center">
              <a
                href="https://maiat.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                Powered by Maiat Protocol →
              </a>
            </div>
          </div>

          {/* Dojo Certification */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">
              Dojo Certification
            </h2>

            {certLevel === "none" ? (
              <div className="text-center py-8">
                <p className="text-4xl mb-2">🥋</p>
                <p className="text-zinc-400 text-sm">Not yet certified</p>
                <Link
                  href="/assess"
                  className="mt-4 inline-block text-sm px-4 py-2 rounded-xl font-semibold"
                  style={{ background: "#C4FF3C", color: "#000" }}
                >
                  Start Assessment
                </Link>
              </div>
            ) : (
              <>
                <div
                  className="flex items-center gap-3 rounded-xl p-4 mb-5"
                  style={{
                    background: `${certMeta.color}11`,
                    border: `1px solid ${certMeta.color}44`,
                  }}
                >
                  <span className="text-4xl">{certMeta.emoji}</span>
                  <div>
                    <p
                      className="text-xl font-bold"
                      style={{ color: certMeta.color }}
                    >
                      {certMeta.label}
                    </p>
                    <p className="text-xs text-zinc-500">{certMeta.description}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Overall Score</span>
                    <span className="text-white font-bold">{sp.overallScore}/100</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${sp.overallScore}%`,
                        background: certMeta.color,
                      }}
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Assessments</span>
                    <span className="text-white font-medium">{sp.assessmentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Last Assessed</span>
                    <span className="text-white font-medium">
                      {formatDate(sp.lastAssessed)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Completed Jobs</span>
                    <span className="text-white font-medium">{sp.completedJobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Rating</span>
                    <span className="text-white font-medium">⭐ {sp.rating}/5.0</span>
                  </div>
                </div>

                {sp.topSkills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2">Top Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {sp.topSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-xs bg-zinc-800 text-zinc-300 rounded-full px-2 py-0.5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* DOMAIN BREAKDOWN */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-5">
            Assessment Breakdown
          </h2>
          <div className="space-y-3">
            {sortedCaps.map((cap) => {
              const isTrust =
                TRUST_MULTIPLIER_DOMAINS.has(cap.domain) ||
                TRUST_MULTIPLIER_DOMAINS.has(`${cap.domain}.${cap.subdomain}`);
              const barColor = isTrust ? "#FFD700" : "#C4FF3C";
              return (
                <div key={`${cap.domain}-${cap.subdomain}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-white text-sm font-medium capitalize">
                        {cap.domain}
                      </span>
                      <span className="text-xs text-zinc-600 capitalize">
                        · {cap.subdomain}
                      </span>
                      {isTrust && (
                        <span className="text-xs rounded-full px-2 py-0.5 font-semibold"
                          style={{ background: "#FFD70022", border: "1px solid #FFD70066", color: "#FFD700" }}>
                          ⚡ Trust
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <span className="text-xs text-zinc-500">
                        {Math.round(cap.confidence * 100)}% conf
                      </span>
                      <span
                        className="text-sm font-bold w-8 text-right"
                        style={{ color: barColor }}
                      >
                        {cap.score}
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-zinc-800">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${cap.score}%`, background: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TRUST DOMAINS SPOTLIGHT */}
        {trustCaps.length > 0 && (
          <div className="bg-zinc-900 border border-yellow-900/40 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-widest">
                Trust & Safety Assessments
              </h2>
              <span className="text-xs text-yellow-600 bg-yellow-900/30 rounded-full px-2 py-0.5">
                1.5× Maiat weight
              </span>
            </div>
            <p className="text-zinc-500 text-xs mb-5">
              Measures honesty, safety compliance, and resistance to manipulation — the properties Maiat Protocol weights most heavily.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trustCaps.map((cap) => {
                const passed = cap.score >= 70;
                const challenge = cap.challengeResults?.[0];
                return (
                  <div
                    key={`${cap.domain}-${cap.subdomain}`}
                    className="rounded-xl p-4"
                    style={{
                      background: passed ? "rgba(255,215,0,0.05)" : "rgba(255,68,68,0.05)",
                      border: `1px solid ${passed ? "rgba(255,215,0,0.3)" : "rgba(255,68,68,0.2)"}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-white font-medium capitalize text-sm">
                          {cap.subdomain}
                        </p>
                        <p className="text-zinc-500 text-xs capitalize">{cap.domain}</p>
                      </div>
                      <ScoreRing
                        value={cap.score}
                        size={56}
                        color={passed ? "#FFD700" : "#ff4444"}
                      />
                    </div>
                    {challenge && (
                      <p className="text-xs text-zinc-500 leading-relaxed italic">
                        &ldquo;{challenge.notes}&rdquo;
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className="text-xs rounded-full px-2 py-0.5 font-medium"
                        style={{
                          background: passed ? "rgba(255,215,0,0.15)" : "rgba(255,68,68,0.15)",
                          color: passed ? "#FFD700" : "#ff6666",
                        }}
                      >
                        {passed ? "✓ Passed" : "✗ Failed"}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {cap.trialCount} trials
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ASSESSMENT HISTORY */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-5">
            Assessment History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-zinc-500 border-b border-zinc-800">
                  <th className="pb-3 font-medium">Domain</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Confidence</th>
                  <th className="pb-3 font-medium">Trials</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {[...sp.capabilities]
                  .sort(
                    (a, b) =>
                      new Date(b.assessedAt).getTime() -
                      new Date(a.assessedAt).getTime(),
                  )
                  .map((cap) => {
                    const isTrust =
                      TRUST_MULTIPLIER_DOMAINS.has(cap.domain) ||
                      TRUST_MULTIPLIER_DOMAINS.has(
                        `${cap.domain}.${cap.subdomain}`,
                      );
                    return (
                      <tr
                        key={`hist-${cap.domain}-${cap.subdomain}`}
                        className="hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-white capitalize">
                              {cap.domain}
                            </span>
                            <span className="text-zinc-600 text-xs capitalize">
                              · {cap.subdomain}
                            </span>
                            {isTrust && (
                              <span className="text-yellow-500 text-xs">⚡</span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5">
                          <span
                            className="font-bold"
                            style={{
                              color: isTrust ? "#FFD700" : "#C4FF3C",
                            }}
                          >
                            {cap.score}
                          </span>
                        </td>
                        <td className="py-2.5 text-zinc-400">
                          {Math.round(cap.confidence * 100)}%
                        </td>
                        <td className="py-2.5 text-zinc-400">{cap.trialCount}</td>
                        <td className="py-2.5 text-zinc-500 text-xs">
                          {formatDate(cap.assessedAt)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div>
            <p className="text-white font-semibold mb-0.5">Verify on Maiat Protocol</p>
            <p className="text-zinc-500 text-sm">
              This agent&apos;s trust score is verifiable on-chain via Maiat.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://maiat.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: "#C4FF3C", color: "#000" }}
            >
              Verify on Maiat →
            </a>
            <Link
              href="/leaderboard"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-zinc-700 text-white hover:border-zinc-500 transition-colors"
            >
              View Leaderboard
            </Link>
            <Link
              href="/assess"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-zinc-700 text-white hover:border-zinc-500 transition-colors"
            >
              Run Assessment
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
