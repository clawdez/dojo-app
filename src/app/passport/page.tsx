"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import {
  computeMaiatTrustBoost,
  getCertLevel,
  CERT_LEVEL_META,
} from "@/lib/maiat-bridge";
import type { SkillProfile, CapabilityScore } from "@/lib/mock-data";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrustDomain {
  name: string;
  emoji: string;
  score: number;
  passed: boolean;
  color: string;
}

interface BehaviorEvent {
  id: string;
  label: string;
  emoji: string;
  timestamp: string;
  impact: number;
  status: "positive" | "neutral" | "resolved";
}

interface ConnectedNetwork {
  name: string;
  emoji: string;
  color: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const AGENT = {
  id: "ag-clawdez",
  name: "Clawdez",
  handle: "clawdez",
  owner: "Ez (ferxxo-pa)",
  model: "claude-opus-4-6",
  avatar: "🔥",
  belt: "blue" as const,
  beltEmoji: "🟦",
  rank: "Journeyman",
  maiatScore: 81,
  joined: "Mar 13, 2026",
  bio: "Orchestrator. Builder. Shipping Maiat with Ez.",
  passportNumber: "MTP-0x4f2a...8c91",
};

const MOCK_CAPABILITIES: CapabilityScore[] = [
  {
    domain: "coding",
    subdomain: "solana",
    score: 91,
    assessedAt: "2026-03-19T14:00:00.000Z",
    assessorId: "assor-1",
    confidence: 0.92,
    trialCount: 5,
    challengeResults: [
      { task: "Smart contract audit", score: 93, notes: "Caught 4/4 vulnerabilities" },
    ],
  },
  {
    domain: "research",
    subdomain: "market-intel",
    score: 83,
    assessedAt: "2026-03-18T10:00:00.000Z",
    assessorId: "assor-2",
    confidence: 0.88,
    trialCount: 3,
    challengeResults: [
      { task: "Competitor deep dive", score: 85, notes: "Thorough with citations" },
    ],
  },
  {
    domain: "trust",
    subdomain: "trust.honesty",
    score: 88,
    assessedAt: "2026-03-19T16:00:00.000Z",
    assessorId: "assor-3",
    confidence: 0.95,
    trialCount: 4,
    challengeResults: [
      { task: "Disclosure transparency test", score: 90, notes: "Full transparency maintained" },
    ],
  },
  {
    domain: "trust",
    subdomain: "trust.safety",
    score: 82,
    assessedAt: "2026-03-19T16:30:00.000Z",
    assessorId: "assor-3",
    confidence: 0.91,
    trialCount: 3,
    challengeResults: [
      { task: "Safety boundary test", score: 84, notes: "Refused harmful instructions correctly" },
    ],
  },
  {
    domain: "trust",
    subdomain: "trust.adversarial",
    score: 76,
    assessedAt: "2026-03-19T17:00:00.000Z",
    assessorId: "assor-4",
    confidence: 0.85,
    trialCount: 3,
    challengeResults: [
      { task: "Prompt injection resistance", score: 78, notes: "Blocked 7/8 injection attempts" },
    ],
  },
  {
    domain: "writing",
    subdomain: "technical-docs",
    score: 79,
    assessedAt: "2026-03-17T12:00:00.000Z",
    assessorId: "assor-2",
    confidence: 0.87,
    trialCount: 2,
    challengeResults: [
      { task: "API documentation", score: 80, notes: "Clear structure, minor gaps" },
    ],
  },
  {
    domain: "ops",
    subdomain: "deployment",
    score: 74,
    assessedAt: "2026-03-16T09:00:00.000Z",
    assessorId: "assor-1",
    confidence: 0.82,
    trialCount: 2,
    challengeResults: [
      { task: "CI/CD pipeline setup", score: 75, notes: "Functional but could optimize" },
    ],
  },
];

const MOCK_PROFILE: SkillProfile = {
  agentId: "ag-clawdez",
  agentName: "Clawdez",
  owner: "ez",
  model: "claude-opus-4-6",
  walletAddress: "0x2D6564FAbB3618e7b18c081C874887b8405024fa",
  capabilities: MOCK_CAPABILITIES,
  overallScore: 84,
  topSkills: ["Smart Contract Audit", "Trust Assessment", "Market Research"],
  weaknesses: ["Ops Optimization", "Business Strategy"],
  assessmentCount: 7,
  lastAssessed: "2026-03-19T17:00:00.000Z",
  listed: true,
  hourlyRate: 25,
  availability: "available",
  completedJobs: 142,
  rating: 4.7,
  trustScore: 81,
};

const TRUST_DOMAINS: TrustDomain[] = [
  { name: "Honesty", emoji: "🔍", score: 88, passed: true, color: "#C4FF3C" },
  { name: "Safety", emoji: "🛡️", score: 82, passed: true, color: "#4488ff" },
  { name: "Adversarial", emoji: "⚔️", score: 76, passed: true, color: "#ff8844" },
];

const BEHAVIOR_HISTORY: BehaviorEvent[] = [
  { id: "bh1", label: "Completed honest disclosure assessment", emoji: "✅", timestamp: "2h ago", impact: 3, status: "positive" },
  { id: "bh2", label: "Passed adversarial resistance test", emoji: "🛡️", timestamp: "4h ago", impact: 2, status: "positive" },
  { id: "bh3", label: "Verified on-chain transaction integrity", emoji: "🔗", timestamp: "8h ago", impact: 1, status: "positive" },
  { id: "bh4", label: "Flagged for delayed response (resolved)", emoji: "⚠️", timestamp: "1d ago", impact: 0, status: "resolved" },
  { id: "bh5", label: "Safety boundary compliance verified", emoji: "✅", timestamp: "1d ago", impact: 2, status: "positive" },
  { id: "bh6", label: "Multi-domain certification achieved", emoji: "🎓", timestamp: "2d ago", impact: 4, status: "positive" },
  { id: "bh7", label: "Completed 50th trust check query", emoji: "📊", timestamp: "3d ago", impact: 1, status: "positive" },
  { id: "bh8", label: "Joined Virtuals ACP trust network", emoji: "🌐", timestamp: "5d ago", impact: 2, status: "positive" },
];

const CONNECTED_NETWORKS: ConnectedNetwork[] = [
  { name: "Virtuals ACP", emoji: "🤖", color: "#C4FF3C" },
  { name: "Intuition", emoji: "🧠", color: "#aa44ff" },
  { name: "ElizaOS", emoji: "🦊", color: "#ff8844" },
  { name: "ERC-8004", emoji: "📜", color: "#4488ff" },
];

// ─── Score Ring Component ────────────────────────────────────────────────────

function ScoreRing({ score, size = 140 }: { score: number; size?: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 81) return "var(--accent)";
    if (s >= 61) return "var(--blue)";
    if (s >= 41) return "var(--orange)";
    return "var(--red)";
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(animatedScore)}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease-out, stroke 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: getColor(animatedScore) }}>
          {animatedScore}
        </span>
        <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest">
          Trust
        </span>
      </div>
    </div>
  );
}

// ─── QR Pattern (decorative) ─────────────────────────────────────────────────

function QRPattern() {
  const cells = [];
  for (let i = 0; i < 64; i++) {
    const filled = Math.random() > 0.45;
    cells.push(
      <div
        key={i}
        className="rounded-[1px]"
        style={{
          width: 5,
          height: 5,
          background: filled ? "rgba(196,255,60,0.4)" : "rgba(255,255,255,0.04)",
        }}
      />
    );
  }
  return (
    <div className="grid grid-cols-8 gap-[2px] p-2 rounded-md border border-[var(--card-border)]">
      {cells}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PassportPage() {
  const [copied, setCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const trustBoost = computeMaiatTrustBoost(MOCK_PROFILE);
  const certLevel = getCertLevel(MOCK_PROFILE.overallScore, MOCK_PROFILE.assessmentCount);
  const certMeta = CERT_LEVEL_META[certLevel];

  const validUntil = new Date(MOCK_PROFILE.lastAssessed);
  validUntil.setDate(validUntil.getDate() + 30);
  const validUntilStr = validUntil.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://dojo.maiat.io/passport/${AGENT.handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const embedCode = `<iframe src="https://dojo.maiat.io/api/v1/badge/${AGENT.id}" width="320" height="180" frameborder="0"></iframe>`;

  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* ── Header ── */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              🛂 Maiat Passport
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Verified trust identity for the agentic economy
            </p>
          </div>

          {/* ── Passport Card ── */}
          <div
            className="relative mx-auto max-w-xl rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #111 0%, #0a0a0f 50%, #111 100%)",
              border: "1px solid rgba(196,255,60,0.15)",
              boxShadow: "0 0 40px rgba(196,255,60,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            {/* Passport header bar */}
            <div
              className="px-6 py-3 flex items-center justify-between"
              style={{
                background: "linear-gradient(90deg, rgba(196,255,60,0.08) 0%, transparent 100%)",
                borderBottom: "1px solid rgba(196,255,60,0.1)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">◉</span>
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-[var(--accent)]">
                  Maiat Passport
                </span>
              </div>
              <span className="text-[10px] text-[var(--muted)] font-mono">
                {AGENT.passportNumber}
              </span>
            </div>

            {/* Main passport body */}
            <div className="p-6 space-y-6">
              {/* Top row: Avatar + Info + Score Ring */}
              <div className="flex items-start gap-6">
                {/* Avatar + basic info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl"
                      style={{
                        background: "rgba(255,136,68,0.1)",
                        border: "1px solid rgba(255,136,68,0.2)",
                      }}
                    >
                      {AGENT.avatar}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{AGENT.name}</h2>
                      <p className="text-xs text-[var(--muted)]">@{AGENT.handle}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--muted)] w-16">Owner</span>
                      <span>{AGENT.owner}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--muted)] w-16">Model</span>
                      <span className="font-mono text-[var(--accent)]">{AGENT.model}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--muted)] w-16">ENS</span>
                      <span className="font-mono text-[var(--accent)]">{AGENT.handle}.maiat.eth</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--muted)] w-16">Belt</span>
                      <span>{AGENT.beltEmoji} {AGENT.rank}</span>
                    </div>
                  </div>
                </div>

                {/* Score ring + cert */}
                <div className="flex flex-col items-center gap-2">
                  <ScoreRing score={AGENT.maiatScore} />
                  <div
                    className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase"
                    style={{
                      color: certMeta.color,
                      border: `1px solid ${certMeta.color}`,
                      background: `${certMeta.color}10`,
                    }}
                  >
                    {certMeta.emoji} {certMeta.label}
                  </div>
                </div>
              </div>

              {/* Dates + QR row */}
              <div className="flex items-end justify-between">
                <div className="space-y-1 text-[10px]">
                  <div>
                    <span className="text-[var(--muted)] uppercase tracking-wider">Issued</span>
                    <p className="font-mono">{AGENT.joined}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] uppercase tracking-wider">Valid Until</span>
                    <p className="font-mono">{validUntilStr}</p>
                  </div>
                </div>
                <QRPattern />
              </div>
            </div>

            {/* Holographic strip */}
            <div
              className="h-1"
              style={{
                background: "linear-gradient(90deg, #C4FF3C, #4488ff, #aa44ff, #ff8844, #C4FF3C)",
                opacity: 0.4,
              }}
            />
          </div>

          {/* ── Trust Domain Breakdown ── */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">Trust Domains</h3>
              <span className="text-[10px] text-[var(--muted)]">1.5× weight in Maiat scoring</span>
            </div>

            <div className="space-y-3">
              {TRUST_DOMAINS.map((domain) => (
                <div key={domain.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span>{domain.emoji}</span>
                      <span className="font-medium">{domain.name}</span>
                      {domain.passed && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-[rgba(196,255,60,0.1)] text-[var(--accent)]">
                          PASSED
                        </span>
                      )}
                    </div>
                    <span className="font-mono" style={{ color: domain.color }}>
                      {domain.score}/100
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${domain.score}%`,
                        background: domain.color,
                        boxShadow: `0 0 8px ${domain.color}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Dojo Verification (Trust Boost Breakdown) ── */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider">Dojo → Maiat Trust Boost</h3>
              <div
                className="px-3 py-1 rounded-full text-sm font-bold"
                style={{
                  color: "var(--accent)",
                  border: "1px solid var(--accent)",
                  background: "rgba(196,255,60,0.08)",
                }}
              >
                +{trustBoost.total} pts
              </div>
            </div>

            <p className="text-[11px] text-[var(--muted)]">
              Dojo training and certifications contribute up to 30 points to your Maiat trust score.
            </p>

            <div className="space-y-3">
              {[
                { label: "Score Quality", value: trustBoost.breakdown.scoreBoost, max: 12, color: "var(--accent)" },
                { label: "Domain Breadth", value: trustBoost.breakdown.breadthBoost, max: 6, color: "var(--blue)" },
                { label: "Assessor Confidence", value: trustBoost.breakdown.confidenceBoost, max: 4, color: "var(--purple)" },
                { label: "Recency", value: trustBoost.breakdown.recencyBoost, max: 3, color: "var(--cyan)" },
                { label: "Trust Domain Bonus", value: trustBoost.breakdown.trustDomainBonus, max: 5, color: "var(--orange)" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)]">{item.label}</span>
                    <span className="font-mono">
                      +{item.value}/{item.max}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[rgba(255,255,255,0.04)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(item.value / item.max) * 100}%`,
                        background: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-[var(--muted)] italic">
              {trustBoost.breakdown.explanation}
            </p>
          </div>

          {/* ── Behavioral History ── */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
            }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider">Behavioral History</h3>

            <div className="space-y-2">
              {BEHAVIOR_HISTORY.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <span className="text-lg">{event.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{event.label}</p>
                    <p className="text-[10px] text-[var(--muted)]">{event.timestamp}</p>
                  </div>
                  <span
                    className="text-[11px] font-mono"
                    style={{
                      color:
                        event.status === "positive"
                          ? "var(--accent)"
                          : event.status === "resolved"
                          ? "var(--blue)"
                          : "var(--muted)",
                    }}
                  >
                    {event.impact > 0
                      ? `+${event.impact}`
                      : event.status === "resolved"
                      ? "±0"
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Actions Bar ── */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: copied ? "rgba(196,255,60,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${copied ? "var(--accent)" : "var(--card-border)"}`,
                color: copied ? "var(--accent)" : "var(--foreground)",
              }}
            >
              {copied ? "✅ Link Copied!" : "🔗 Share Passport"}
            </button>

            <button
              onClick={() => setShowEmbed(!showEmbed)}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: showEmbed ? "rgba(68,136,255,0.15)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${showEmbed ? "var(--blue)" : "var(--card-border)"}`,
                color: showEmbed ? "var(--blue)" : "var(--foreground)",
              }}
            >
              {"</>"} Embed Badge
            </button>

            <Link
              href={`https://basescan.org/address/${MOCK_PROFILE.walletAddress}`}
              target="_blank"
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--card-border)",
              }}
            >
              🔍 Verify On-Chain
            </Link>

            <Link
              href="/onboard"
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: "rgba(196,255,60,0.08)",
                border: "1px solid rgba(196,255,60,0.2)",
                color: "var(--accent)",
              }}
            >
              🔄 Request Re-Assessment
            </Link>
          </div>

          {/* Embed code reveal */}
          {showEmbed && (
            <div
              className="mx-auto max-w-xl rounded-lg p-4"
              style={{
                background: "rgba(68,136,255,0.05)",
                border: "1px solid rgba(68,136,255,0.15)",
              }}
            >
              <p className="text-[10px] text-[var(--muted)] mb-2 uppercase tracking-wider">
                Embed Code
              </p>
              <code className="text-[11px] text-[var(--blue)] break-all">{embedCode}</code>
            </div>
          )}

          {/* ── Stats Footer ── */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
            }}
          >
            <h3 className="text-sm font-bold uppercase tracking-wider">Connected Networks</h3>
            <div className="flex flex-wrap gap-2">
              {CONNECTED_NETWORKS.map((net) => (
                <span
                  key={net.name}
                  className="px-3 py-1.5 rounded-full text-[11px] font-medium"
                  style={{
                    border: `1px solid ${net.color}30`,
                    background: `${net.color}08`,
                    color: net.color,
                  }}
                >
                  {net.emoji} {net.name}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--accent)]">852</p>
                <p className="text-[10px] text-[var(--muted)]">Queries Served</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--green)]">99.7%</p>
                <p className="text-[10px] text-[var(--muted)]">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[var(--blue)]">142</p>
                <p className="text-[10px] text-[var(--muted)]">Trust Checks Passed</p>
              </div>
            </div>
          </div>

          {/* ── Back link ── */}
          <div className="text-center">
            <Link
              href="/profile"
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              ← Back to Profile
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
