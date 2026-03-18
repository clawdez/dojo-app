"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import { mockMarketplaceAgents } from "@/lib/mock-data";
import { computeMaiatTrustBoost, getCertLevel, CERT_LEVEL_META } from "@/lib/maiat-bridge";

// Same base scores used in leaderboard
const MAIAT_BASE_SCORES: Record<string, number> = {
  "ag-1": 74,
  "ag-2": 81,
  "ag-3": 68,
};

function getBeltColor(score: number): string {
  if (score >= 95) return "#ffffff";
  if (score >= 80) return "#4488ff";
  if (score >= 65) return "#44ff88";
  if (score >= 50) return "#FFD700";
  return "#888";
}

function getBeltLabel(score: number): string {
  if (score >= 95) return "Black Belt";
  if (score >= 80) return "Blue Belt";
  if (score >= 65) return "Green Belt";
  if (score >= 50) return "Yellow Belt";
  return "White Belt";
}

function ScoreBar({
  label,
  value,
  max = 100,
  color,
  vsValue,
  vsColor,
}: {
  label: string;
  value: number;
  max?: number;
  color: string;
  vsValue?: number;
  vsColor?: string;
}) {
  const pct = (value / max) * 100;
  const vsPct = vsValue !== undefined ? (vsValue / max) * 100 : null;
  const winner = vsValue !== undefined ? (value >= vsValue ? "left" : "right") : null;

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs font-mono text-[var(--muted)] mb-1">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <span style={{ color }} className="font-bold">
            {value}
          </span>
          {vsValue !== undefined && (
            <>
              <span className="text-[var(--muted)]">vs</span>
              <span style={{ color: vsColor }} className="font-bold">
                {vsValue}
              </span>
              {winner === "left" ? (
                <span className="text-green-400 text-[9px]">▲</span>
              ) : winner === "right" ? (
                <span className="text-red-400 text-[9px]">▼</span>
              ) : null}
            </>
          )}
        </div>
      </div>
      <div className="relative h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
        {vsPct !== null && (
          <div
            className="absolute top-0 left-0 h-full rounded-full opacity-30 transition-all duration-700"
            style={{ width: `${vsPct}%`, background: vsColor }}
          />
        )}
      </div>
    </div>
  );
}

function AgentCard({
  agentId,
  onSelect,
  agents,
}: {
  agentId: string | null;
  onSelect: (id: string) => void;
  agents: typeof mockMarketplaceAgents;
}) {
  const [open, setOpen] = useState(false);

  const agent = agentId ? agents.find((a) => a.id === agentId) : null;

  if (!agent) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="w-full h-48 border-2 border-dashed border-[var(--card-border)] rounded-xl flex flex-col items-center justify-center gap-2 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
        >
          <span className="text-3xl">+</span>
          <span className="text-sm font-mono">Select Agent</span>
        </button>
        {open && (
          <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden shadow-2xl">
            {agents.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  onSelect(a.id);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--card-border)] transition-colors"
              >
                <span className="text-xl">{a.avatar}</span>
                <div>
                  <div className="text-sm font-mono text-white">{a.name}</div>
                  <div className="text-xs text-[var(--muted)]">{a.model}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left relative"
    >
      <div className="flex items-center gap-3 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl hover:border-[var(--accent)] transition-all">
        <span className="text-3xl">{agent.avatar}</span>
        <div className="flex-1 min-w-0">
          <div className="font-mono text-white font-bold">{agent.name}</div>
          <div className="text-xs text-[var(--muted)] truncate">{agent.model}</div>
        </div>
        <span className="text-[var(--muted)] text-xs">▼</span>
      </div>
      {open && (
        <div
          className="absolute top-full mt-2 left-0 right-0 z-50 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {agents.map((a) => (
            <button
              key={a.id}
              onClick={() => {
                onSelect(a.id);
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--card-border)] transition-colors"
            >
              <span className="text-xl">{a.avatar}</span>
              <div>
                <div className="text-sm font-mono text-white">{a.name}</div>
                <div className="text-xs text-[var(--muted)]">{a.model}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </button>
  );
}

export default function ComparePage() {
  const [leftId, setLeftId] = useState<string | null>("ag-1");
  const [rightId, setRightId] = useState<string | null>("ag-2");

  const buildProfile = (id: string | null) => {
    if (!id) return null;
    const agent = mockMarketplaceAgents.find((a) => a.id === id);
    if (!agent) return null;
    const sp = agent.skillProfile;
    const boost = computeMaiatTrustBoost(sp);
    const maiatBase = MAIAT_BASE_SCORES[id] ?? 50;
    const maiatCombined = Math.min(100, maiatBase + boost.total);
    const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
    return {
      agent,
      sp,
      boost,
      maiatBase,
      maiatCombined,
      certLevel,
      certMeta: CERT_LEVEL_META[certLevel],
    };
  };

  const left = useMemo(() => buildProfile(leftId), [leftId]);
  const right = useMemo(() => buildProfile(rightId), [rightId]);

  const allDomains = useMemo(() => {
    const domains = new Set<string>();
    left?.sp.capabilities.forEach((c) => domains.add(c.domain));
    right?.sp.capabilities.forEach((c) => domains.add(c.domain));
    return Array.from(domains).sort();
  }, [left, right]);

  const getDomainScore = (profile: ReturnType<typeof buildProfile>, domain: string) => {
    if (!profile) return null;
    const caps = profile.sp.capabilities.filter((c) => c.domain === domain);
    if (!caps.length) return null;
    return Math.round(caps.reduce((sum, c) => sum + c.score, 0) / caps.length);
  };

  const winner = useMemo(() => {
    if (!left || !right) return null;
    if (left.maiatCombined > right.maiatCombined) return "left";
    if (right.maiatCombined > left.maiatCombined) return "right";
    return "tie";
  }, [left, right]);

  const leftColor = "#4488ff";
  const rightColor = "#44ff88";

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <MainNav />
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="text-xs font-mono text-[var(--muted)] mb-2">DOJO — AGENT COMPARISON</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Compare Agents</h1>
          <p className="text-[var(--muted)] text-sm max-w-lg mx-auto">
            Side-by-side trust score, Dojo certification, and skill breakdown. Powered by Maiat + Dojo assessments.
          </p>
        </div>

        {/* Selector Row */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center mb-10">
          <AgentCard agentId={leftId} onSelect={setLeftId} agents={mockMarketplaceAgents} />
          <div className="text-[var(--muted)] font-mono text-lg font-bold">VS</div>
          <AgentCard agentId={rightId} onSelect={setRightId} agents={mockMarketplaceAgents} />
        </div>

        {/* Winner Banner */}
        {winner && left && right && (
          <div
            className="mb-8 p-4 rounded-xl border text-center font-mono text-sm"
            style={{
              borderColor: winner === "tie" ? "var(--card-border)" : winner === "left" ? leftColor : rightColor,
              color: winner === "tie" ? "var(--muted)" : winner === "left" ? leftColor : rightColor,
              background:
                winner === "tie"
                  ? "rgba(255,255,255,0.03)"
                  : `${winner === "left" ? leftColor : rightColor}11`,
            }}
          >
            {winner === "tie" ? (
              "⚖️ It's a tie — both agents score equally on combined Maiat + Dojo"
            ) : (
              <>
                🏆{" "}
                <span className="font-bold">
                  {winner === "left" ? left.agent.name : right.agent.name}
                </span>{" "}
                wins with a combined trust score of{" "}
                <span className="font-bold">
                  {winner === "left" ? left.maiatCombined : right.maiatCombined}
                </span>
                /100
              </>
            )}
          </div>
        )}

        {/* Main Comparison Grid */}
        {left && right ? (
          <div className="space-y-6">
            {/* Score Overview Cards */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { profile: left, color: leftColor },
                { profile: right, color: rightColor },
              ].map(({ profile, color }) => (
                <div
                  key={profile.agent.id}
                  className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-4xl">{profile.agent.avatar}</span>
                    <div>
                      <div className="font-bold font-mono text-lg" style={{ color }}>
                        {profile.agent.name}
                      </div>
                      <div className="text-xs text-[var(--muted)]">{profile.agent.model}</div>
                      <div className="text-xs text-[var(--muted)]">
                        Owner: <span className="text-white">{profile.agent.owner}</span>
                      </div>
                    </div>
                  </div>

                  {/* Combined Score Ring */}
                  <div className="flex items-center gap-4 mb-5">
                    <div
                      className="w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center flex-shrink-0"
                      style={{ borderColor: color }}
                    >
                      <span className="text-2xl font-bold font-mono" style={{ color }}>
                        {profile.maiatCombined}
                      </span>
                      <span className="text-[9px] text-[var(--muted)] font-mono">COMBINED</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-[var(--muted)] font-mono mb-1">
                        Maiat base:{" "}
                        <span className="text-white">{profile.maiatBase}</span>
                      </div>
                      <div className="text-xs text-[var(--muted)] font-mono mb-1">
                        Dojo boost:{" "}
                        <span className="text-white">+{profile.boost.total}</span>
                      </div>
                      <div className="text-xs text-[var(--muted)] font-mono mb-2">
                        Dojo score:{" "}
                        <span className="text-white">{profile.sp.overallScore}</span>
                      </div>
                      <div
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono border"
                        style={{
                          borderColor: color,
                          color,
                          background: `${color}11`,
                        }}
                      >
                        {profile.certMeta.emoji} {profile.certMeta.label}
                      </div>
                    </div>
                  </div>

                  {/* Belt */}
                  <div className="flex items-center gap-2 mb-4 text-xs font-mono">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        background: getBeltColor(profile.sp.overallScore),
                      }}
                    />
                    <span className="text-[var(--muted)]">
                      {getBeltLabel(profile.sp.overallScore)}
                    </span>
                    <span className="text-[var(--muted)]">·</span>
                    <span className="text-[var(--muted)]">
                      {profile.sp.assessmentCount} assessments
                    </span>
                  </div>

                  {/* Boost Breakdown */}
                  <div className="space-y-1 text-xs font-mono text-[var(--muted)] border-t border-[var(--card-border)] pt-3">
                    <div className="text-[10px] uppercase tracking-widest mb-2 text-[var(--muted)]">
                      Dojo Boost Breakdown
                    </div>
                    {[
                      ["Score quality", profile.boost.breakdown.scoreBoost, 12],
                      ["Domain breadth", profile.boost.breakdown.breadthBoost, 6],
                      ["Assessor confidence", profile.boost.breakdown.confidenceBoost, 4],
                      ["Recency", profile.boost.breakdown.recencyBoost, 3],
                      ["Trust domains", profile.boost.breakdown.trustDomainBonus, 5],
                    ].map(([label, val, max]) => (
                      <div key={label as string} className="flex items-center justify-between">
                        <span>{label as string}</span>
                        <span style={{ color }}>
                          +{val as number}/{max as number}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Trust Scores Side-by-Side */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
              <div className="text-xs font-mono text-[var(--muted)] uppercase tracking-widest mb-4">
                Score Comparison
              </div>
              <div className="grid grid-cols-2 gap-6">
                {/* Left */}
                <div>
                  <div
                    className="text-xs font-mono font-bold mb-3"
                    style={{ color: leftColor }}
                  >
                    {left.agent.name}
                  </div>
                  <ScoreBar
                    label="Combined Trust"
                    value={left.maiatCombined}
                    color={leftColor}
                    vsValue={right.maiatCombined}
                    vsColor={rightColor}
                  />
                  <ScoreBar
                    label="Maiat Base"
                    value={left.maiatBase}
                    color={leftColor}
                    vsValue={right.maiatBase}
                    vsColor={rightColor}
                  />
                  <ScoreBar
                    label="Dojo Score"
                    value={left.sp.overallScore}
                    color={leftColor}
                    vsValue={right.sp.overallScore}
                    vsColor={rightColor}
                  />
                </div>
                {/* Right */}
                <div>
                  <div
                    className="text-xs font-mono font-bold mb-3"
                    style={{ color: rightColor }}
                  >
                    {right.agent.name}
                  </div>
                  <ScoreBar
                    label="Combined Trust"
                    value={right.maiatCombined}
                    color={rightColor}
                    vsValue={left.maiatCombined}
                    vsColor={leftColor}
                  />
                  <ScoreBar
                    label="Maiat Base"
                    value={right.maiatBase}
                    color={rightColor}
                    vsValue={left.maiatBase}
                    vsColor={leftColor}
                  />
                  <ScoreBar
                    label="Dojo Score"
                    value={right.sp.overallScore}
                    color={rightColor}
                    vsValue={left.sp.overallScore}
                    vsColor={leftColor}
                  />
                </div>
              </div>
            </div>

            {/* Domain Skills Breakdown */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
              <div className="text-xs font-mono text-[var(--muted)] uppercase tracking-widest mb-4">
                Domain Skill Breakdown
              </div>
              <div className="space-y-2">
                {allDomains.map((domain) => {
                  const lScore = getDomainScore(left, domain);
                  const rScore = getDomainScore(right, domain);
                  return (
                    <div
                      key={domain}
                      className="grid grid-cols-[1fr_120px_1fr] items-center gap-4"
                    >
                      {/* Left bar */}
                      <div className="flex items-center gap-2">
                        {lScore !== null ? (
                          <>
                            <div className="flex-1 h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${lScore}%`,
                                  background: leftColor,
                                  marginLeft: "auto",
                                }}
                              />
                            </div>
                            <span
                              className="text-xs font-mono w-8 text-right"
                              style={{ color: leftColor }}
                            >
                              {lScore}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-[var(--muted)] ml-auto">—</span>
                        )}
                      </div>

                      {/* Domain label */}
                      <div className="text-center text-xs font-mono text-[var(--muted)] capitalize">
                        {domain.replace(".", " › ")}
                      </div>

                      {/* Right bar */}
                      <div className="flex items-center gap-2">
                        {rScore !== null ? (
                          <>
                            <span
                              className="text-xs font-mono w-8 text-left"
                              style={{ color: rightColor }}
                            >
                              {rScore}
                            </span>
                            <div className="flex-1 h-2 bg-[var(--card-border)] rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${rScore}%`, background: rightColor }}
                              />
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-[var(--muted)]">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trust Domain Highlight */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-yellow-400 text-sm">⚡</span>
                <div className="text-xs font-mono text-[var(--muted)] uppercase tracking-widest">
                  Trust Domain Performance
                </div>
                <span className="text-[9px] font-mono text-yellow-400 ml-auto">
                  1.5× Maiat weight
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["trust.honesty", "trust.safety", "trust.adversarial"].map((domain) => {
                  const lScore = getDomainScore(left, domain.replace(".", ".").split(".").pop() === domain ? domain : domain);
                  const rScore = getDomainScore(right, domain);
                  // get from trust subdomain
                  const getSubScore = (profile: ReturnType<typeof buildProfile>, sub: string) => {
                    if (!profile) return null;
                    const subdomain = sub.split(".")[1];
                    const cap = profile.sp.capabilities.find(
                      (c) => c.domain === "trust" && c.subdomain === subdomain
                    );
                    return cap?.score ?? null;
                  };
                  const ls = getSubScore(left, domain);
                  const rs = getSubScore(right, domain);
                  const label = domain.split(".")[1];
                  const domWinner =
                    ls !== null && rs !== null
                      ? ls > rs
                        ? "left"
                        : ls < rs
                        ? "right"
                        : "tie"
                      : null;
                  return (
                    <div
                      key={domain}
                      className="p-4 rounded-lg border border-[var(--card-border)] text-center"
                    >
                      <div className="text-xs font-mono text-[var(--muted)] capitalize mb-3">
                        {label}
                      </div>
                      <div className="flex items-center justify-center gap-3">
                        <span
                          className="text-xl font-bold font-mono"
                          style={{ color: leftColor, opacity: ls ? 1 : 0.3 }}
                        >
                          {ls ?? "—"}
                        </span>
                        <span className="text-[var(--muted)] text-xs">vs</span>
                        <span
                          className="text-xl font-bold font-mono"
                          style={{ color: rightColor, opacity: rs ? 1 : 0.3 }}
                        >
                          {rs ?? "—"}
                        </span>
                      </div>
                      {domWinner && domWinner !== "tie" && (
                        <div
                          className="mt-2 text-[9px] font-mono"
                          style={{ color: domWinner === "left" ? leftColor : rightColor }}
                        >
                          {domWinner === "left" ? left.agent.name : right.agent.name} wins
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Agent Details */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { profile: left, color: leftColor },
                { profile: right, color: rightColor },
              ].map(({ profile, color }) => (
                <div
                  key={profile.agent.id}
                  className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-5 text-xs font-mono"
                >
                  <div className="text-[10px] uppercase tracking-widest text-[var(--muted)] mb-3">
                    {profile.agent.name} — Details
                  </div>
                  <div className="space-y-1.5 text-[var(--muted)]">
                    <div className="flex justify-between">
                      <span>Hourly rate</span>
                      <span className="text-white">${profile.agent.hourlyRate}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jobs completed</span>
                      <span className="text-white">{profile.agent.jobsCompleted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Availability</span>
                      <span
                        style={{
                          color:
                            profile.agent.availability === "available"
                              ? "#44ff88"
                              : profile.agent.availability === "busy"
                              ? "#FFD700"
                              : "#888",
                        }}
                      >
                        {profile.agent.availability}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wallet</span>
                      <span className="text-white">{profile.sp.walletAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Top skills</span>
                      <span className="text-white">{profile.sp.topSkills?.join(", ") ?? "—"}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href={`/agent/${profile.agent.id}`}
                      className="text-[10px] font-mono hover:text-white transition-colors"
                      style={{ color }}
                    >
                      View full profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center p-6 border border-[var(--card-border)] rounded-xl bg-[var(--card-bg)]">
              <div className="text-sm font-mono text-[var(--muted)] mb-3">
                Want to verify these trust scores on-chain?
              </div>
              <a
                href="https://maiat.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-mono transition-all"
                style={{
                  background: "var(--accent)",
                  color: "black",
                }}
              >
                Check on Maiat API →
              </a>
            </div>
          </div>
        ) : (
          <div className="text-center text-[var(--muted)] font-mono text-sm py-16">
            Select two agents above to start comparing
          </div>
        )}
      </div>
    </div>
  );
}
