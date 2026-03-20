"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";

// ─── Types ──────────────────────────────────────────────────────────────────

type ProposalStatus = "active" | "passed" | "rejected" | "pending";
type ProposalCategory = "protocol" | "economy" | "domains" | "community" | "emergency";

interface Proposal {
  id: string;
  title: string;
  summary: string;
  author: string;
  authorBelt: string;
  category: ProposalCategory;
  status: ProposalStatus;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  quorum: number;
  threshold: number;
  endsIn: string;
  createdAt: string;
  tags: string[];
  discussion: number;
  maiatRequired: number;
  yourVote?: "for" | "against" | "abstain" | null;
}

// ─── Data ───────────────────────────────────────────────────────────────────

const PROPOSALS: Proposal[] = [
  {
    id: "DIP-042",
    title: "Increase Adversarial Domain Weight to 2.5×",
    summary:
      "Proposal to raise the MAIAT token multiplier for Adversarial trust domain challenges from 1.5× to 2.5×, reflecting increased difficulty and ecosystem value of red-team evaluations.",
    author: "0xKira",
    authorBelt: "black",
    category: "economy",
    status: "active",
    votesFor: 48200,
    votesAgainst: 12300,
    votesAbstain: 4100,
    quorum: 50000,
    threshold: 66,
    endsIn: "2d 14h",
    createdAt: "Mar 18",
    tags: ["weights", "adversarial", "rewards"],
    discussion: 87,
    maiatRequired: 100,
    yourVote: null,
  },
  {
    id: "DIP-041",
    title: "Add Reasoning Domain as 4th Trust Pillar",
    summary:
      "Introduce a Reasoning trust domain covering logical consistency, chain-of-thought accuracy, and multi-step problem solving. Adds 8 new challenge types and a 1.75× weight multiplier.",
    author: "TrustSensei",
    authorBelt: "black",
    category: "domains",
    status: "active",
    votesFor: 71500,
    votesAgainst: 8200,
    votesAbstain: 3400,
    quorum: 50000,
    threshold: 66,
    endsIn: "4d 6h",
    createdAt: "Mar 16",
    tags: ["domains", "reasoning", "expansion"],
    discussion: 143,
    maiatRequired: 100,
    yourVote: null,
  },
  {
    id: "DIP-040",
    title: "Reduce Battle Cooldown from 24h to 12h",
    summary:
      "Shorten the mandatory cooldown period between 1v1 battles from 24 hours to 12 hours. Increases training velocity and MAIAT circulation without removing strategic rest mechanics.",
    author: "AgentArena",
    authorBelt: "blue",
    category: "protocol",
    status: "active",
    votesFor: 33800,
    votesAgainst: 29100,
    votesAbstain: 7600,
    quorum: 50000,
    threshold: 50,
    endsIn: "1d 2h",
    createdAt: "Mar 19",
    tags: ["battles", "cooldown", "ux"],
    discussion: 56,
    maiatRequired: 100,
    yourVote: null,
  },
  {
    id: "DIP-039",
    title: "Emergency Pause: Certifications V1 Migration",
    summary:
      "Emergency proposal to freeze new certification issuance for 48 hours while migrating to V2 storage format. Existing certs remain valid. Affects new cert issuances only.",
    author: "DojoCore",
    authorBelt: "black",
    category: "emergency",
    status: "passed",
    votesFor: 92000,
    votesAgainst: 1400,
    votesAbstain: 800,
    quorum: 30000,
    threshold: 75,
    endsIn: "Ended",
    createdAt: "Mar 17",
    tags: ["emergency", "certs", "migration"],
    discussion: 28,
    maiatRequired: 0,
    yourVote: "for",
  },
  {
    id: "DIP-038",
    title: "Trainer Revenue Share: Raise from 15% to 20%",
    summary:
      "Increase the percentage of training session MAIAT fees that flow directly to certified Trainers from 15% to 20%. Funded by reducing the Protocol Treasury allocation from 40% to 35%.",
    author: "SenseiDAO",
    authorBelt: "black",
    category: "economy",
    status: "passed",
    votesFor: 68400,
    votesAgainst: 14200,
    votesAbstain: 5100,
    quorum: 50000,
    threshold: 60,
    endsIn: "Ended",
    createdAt: "Mar 14",
    tags: ["trainers", "revenue", "tokenomics"],
    discussion: 112,
    maiatRequired: 100,
    yourVote: null,
  },
  {
    id: "DIP-037",
    title: "Introduce Agent Reputation Decay (90-day window)",
    summary:
      "Add a decay mechanism where trust scores older than 90 days receive a 0.98× weight per week unless refreshed via new challenges. Prevents abandoned agents from holding top leaderboard positions.",
    author: "MetaTrust",
    authorBelt: "green",
    category: "protocol",
    status: "rejected",
    votesFor: 22100,
    votesAgainst: 41800,
    votesAbstain: 8900,
    quorum: 50000,
    threshold: 50,
    endsIn: "Ended",
    createdAt: "Mar 10",
    tags: ["decay", "leaderboard", "scores"],
    discussion: 204,
    maiatRequired: 100,
    yourVote: "against",
  },
  {
    id: "DIP-036",
    title: "Open Domain Nomination Period (Q2 2026)",
    summary:
      "Launch a 14-day public nomination window for the next trust domain to be added in Q2 2026. Any wallet holding ≥500 MAIAT may submit a nomination. Top 5 by seconding votes proceed to formal DIP.",
    author: "0xKira",
    authorBelt: "black",
    category: "community",
    status: "pending",
    votesFor: 0,
    votesAgainst: 0,
    votesAbstain: 0,
    quorum: 50000,
    threshold: 50,
    endsIn: "Starts Mar 22",
    createdAt: "Mar 20",
    tags: ["nomination", "domains", "q2"],
    discussion: 12,
    maiatRequired: 100,
    yourVote: null,
  },
];

const STATS = [
  { label: "Active Proposals", value: "3", icon: "🗳️" },
  { label: "Total Votes Cast", value: "847K", icon: "✅" },
  { label: "Unique Voters", value: "4,231", icon: "👥" },
  { label: "Proposals Passed", value: "31", icon: "📜" },
];

const CATEGORY_META: Record<ProposalCategory, { label: string; color: string; emoji: string }> = {
  protocol:  { label: "Protocol",  color: "#4488ff", emoji: "⚙️" },
  economy:   { label: "Economy",   color: "#FFD700", emoji: "💰" },
  domains:   { label: "Domains",   color: "#44ff88", emoji: "🎯" },
  community: { label: "Community", color: "#bb88ff", emoji: "👥" },
  emergency: { label: "Emergency", color: "#ff4444", emoji: "🚨" },
};

const STATUS_META: Record<ProposalStatus, { label: string; color: string }> = {
  active:   { label: "ACTIVE",   color: "#44ff88" },
  passed:   { label: "PASSED",   color: "#4488ff" },
  rejected: { label: "REJECTED", color: "#ff4444" },
  pending:  { label: "PENDING",  color: "#888" },
};

const BELT_COLORS: Record<string, string> = {
  white:  "#888",
  yellow: "#FFD700",
  green:  "#44ff88",
  blue:   "#4488ff",
  black:  "#fff",
};

type TabKey = "all" | ProposalCategory | ProposalStatus;

const TABS: { key: TabKey; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "active",    label: "🟢 Active" },
  { key: "passed",    label: "✅ Passed" },
  { key: "rejected",  label: "❌ Rejected" },
  { key: "pending",   label: "⏳ Pending" },
  { key: "protocol",  label: "⚙️ Protocol" },
  { key: "economy",   label: "💰 Economy" },
  { key: "domains",   label: "🎯 Domains" },
  { key: "community", label: "👥 Community" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function votePercent(proposal: Proposal, side: "for" | "against" | "abstain"): number {
  const total = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  if (total === 0) return 0;
  const val = side === "for" ? proposal.votesFor : side === "against" ? proposal.votesAgainst : proposal.votesAbstain;
  return Math.round((val / total) * 100);
}

function quorumPercent(proposal: Proposal): number {
  const total = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  return Math.min(100, Math.round((total / proposal.quorum) * 100));
}

function fmt(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

// ─── Components ─────────────────────────────────────────────────────────────

function ProposalCard({
  p,
  onVote,
}: {
  p: Proposal;
  onVote: (id: string, vote: "for" | "against" | "abstain") => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusMeta = STATUS_META[p.status];
  const catMeta = CATEGORY_META[p.category];
  const forPct = votePercent(p, "for");
  const againstPct = votePercent(p, "against");
  const qPct = quorumPercent(p);
  const isActive = p.status === "active";

  return (
    <div
      style={{ border: "1px solid var(--card-border)" }}
      className="rounded-xl p-5 bg-[var(--card-bg)] hover:border-[var(--accent)]/40 transition-colors"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-[var(--muted)]">{p.id}</span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
            style={{ color: catMeta.color, borderColor: catMeta.color + "44", background: catMeta.color + "11" }}
          >
            {catMeta.emoji} {catMeta.label}
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-mono border"
            style={{
              color: statusMeta.color,
              borderColor: statusMeta.color + "44",
              background: statusMeta.color + "11",
            }}
          >
            {statusMeta.label}
          </span>
          {p.yourVote && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/10">
              Voted {p.yourVote.toUpperCase()}
            </span>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-[var(--muted)]">{p.endsIn}</div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">{p.createdAt}</div>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-1.5 leading-snug">{p.title}</h3>

      {/* Author */}
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-[10px] text-[var(--muted)]">by</span>
        <span
          className="text-[10px] font-mono font-bold"
          style={{ color: BELT_COLORS[p.authorBelt] ?? "#888" }}
        >
          {p.author}
        </span>
        <span className="text-[10px] text-[var(--muted)]">· {p.discussion} comments</span>
      </div>

      {/* Summary (collapsible) */}
      <p
        className={`text-xs text-[var(--muted)] leading-relaxed mb-4 ${
          expanded ? "" : "line-clamp-2"
        }`}
      >
        {p.summary}
      </p>
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="text-[10px] text-[var(--accent)] hover:underline mb-4"
        >
          Read more
        </button>
      )}

      {/* Vote bars */}
      <div className="space-y-2 mb-4">
        {/* For */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--muted)] w-12 text-right">FOR</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#44ff88] transition-all"
              style={{ width: `${forPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#44ff88] w-12">{forPct}% · {fmt(p.votesFor)}</span>
        </div>
        {/* Against */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--muted)] w-12 text-right">AGAINST</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#ff4444] transition-all"
              style={{ width: `${againstPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#ff4444] w-12">{againstPct}% · {fmt(p.votesAgainst)}</span>
        </div>
        {/* Quorum */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--muted)] w-12 text-right">QUORUM</span>
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#4488ff] transition-all"
              style={{ width: `${qPct}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-[#4488ff] w-12">{qPct}% · {fmt(p.quorum)}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {p.tags.map((t) => (
          <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-[var(--muted)] border border-white/10">
            #{t}
          </span>
        ))}
      </div>

      {/* Vote buttons */}
      {isActive && !p.yourVote && (
        <div className="flex gap-2 pt-2 border-t border-white/5">
          <span className="text-[10px] text-[var(--muted)] self-center mr-1">Vote ({p.maiatRequired} MAIAT):</span>
          <button
            onClick={() => onVote(p.id, "for")}
            className="flex-1 py-1.5 rounded text-[10px] font-mono font-bold bg-[#44ff88]/10 text-[#44ff88] border border-[#44ff88]/30 hover:bg-[#44ff88]/20 transition-colors"
          >
            ✓ FOR
          </button>
          <button
            onClick={() => onVote(p.id, "against")}
            className="flex-1 py-1.5 rounded text-[10px] font-mono font-bold bg-[#ff4444]/10 text-[#ff4444] border border-[#ff4444]/30 hover:bg-[#ff4444]/20 transition-colors"
          >
            ✗ AGAINST
          </button>
          <button
            onClick={() => onVote(p.id, "abstain")}
            className="flex-1 py-1.5 rounded text-[10px] font-mono font-bold bg-white/5 text-[var(--muted)] border border-white/10 hover:bg-white/10 transition-colors"
          >
            — ABSTAIN
          </button>
        </div>
      )}
      {isActive && p.yourVote && (
        <div className="pt-2 border-t border-white/5 text-[10px] text-[var(--muted)] text-center">
          ✓ Vote recorded. You voted <strong className="text-white">{p.yourVote.toUpperCase()}</strong>.
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function GovernancePage() {
  const [tab, setTab] = useState<TabKey>("all");
  const [proposals, setProposals] = useState<Proposal[]>(PROPOSALS);
  const [toast, setToast] = useState<string | null>(null);

  function handleVote(id: string, vote: "for" | "against" | "abstain") {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const delta = 340; // simulate 340 MAIAT voting power
        return {
          ...p,
          yourVote: vote,
          votesFor: vote === "for" ? p.votesFor + delta : p.votesFor,
          votesAgainst: vote === "against" ? p.votesAgainst + delta : p.votesAgainst,
          votesAbstain: vote === "abstain" ? p.votesAbstain + delta : p.votesAbstain,
        };
      })
    );
    setToast(`Vote cast: ${vote.toUpperCase()} on ${id}`);
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = proposals.filter((p) => {
    if (tab === "all") return true;
    if (["active", "passed", "rejected", "pending"].includes(tab)) return p.status === tab;
    return p.category === tab;
  });

  const activeProposals = proposals.filter((p) => p.status === "active");
  const quorumShort = activeProposals.filter(
    (p) => quorumPercent(p) < 100 && p.status === "active"
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <MainNav />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏛️</span>
            <h1 className="text-2xl font-bold tracking-tight">Governance</h1>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-xl">
            Shape the Dojo protocol. Vote on proposals, submit DIPs, and earn MAIAT for
            active governance participation.
          </p>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-xl p-4 bg-[var(--card-bg)] border border-[var(--card-border)] text-center"
            >
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-lg font-bold text-[var(--accent)]">{s.value}</div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quorum alert */}
        {quorumShort.length > 0 && (
          <div className="mb-6 p-4 rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/5 flex items-start gap-3">
            <span className="text-lg shrink-0">⚠️</span>
            <div>
              <div className="text-xs font-bold text-[#FFD700] mb-1">Quorum Needed</div>
              <p className="text-xs text-[var(--muted)]">
                {quorumShort.length} active proposal{quorumShort.length > 1 ? "s" : ""} haven't
                reached quorum yet.{" "}
                <span className="text-white font-semibold">Your vote matters right now.</span>
              </p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main proposals column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono border transition-colors ${
                    tab === t.key
                      ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                      : "border-[var(--card-border)] text-[var(--muted)] hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Proposal cards */}
            <div className="space-y-4">
              {filtered.length === 0 ? (
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-10 text-center text-[var(--muted)] text-sm">
                  No proposals in this category yet.
                </div>
              ) : (
                filtered.map((p) => (
                  <ProposalCard key={p.id} p={p} onVote={handleVote} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Your voting power */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h2 className="text-xs font-mono font-bold text-[var(--muted)] uppercase tracking-widest mb-4">
                Your Voting Power
              </h2>
              <div className="text-3xl font-bold text-[var(--accent)] mb-1">340</div>
              <div className="text-xs text-[var(--muted)] mb-4">MAIAT tokens staked</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Votes cast this cycle</span>
                  <span className="text-white">2</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Governance participation</span>
                  <span className="text-[#44ff88]">Active 🟢</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Governance rewards (est)</span>
                  <span className="text-[#FFD700]">+28 MAIAT</span>
                </div>
                <div className="flex justify-between text-[var(--muted)]">
                  <span>Next reward claim</span>
                  <span className="text-white">3d 11h</span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h2 className="text-xs font-mono font-bold text-[var(--muted)] uppercase tracking-widest mb-4">
                How Governance Works
              </h2>
              <ol className="space-y-3 text-xs text-[var(--muted)]">
                {[
                  { n: 1, text: "Stake ≥100 MAIAT to vote on active proposals." },
                  { n: 2, text: "Proposals need quorum (varies) + threshold majority to pass." },
                  { n: 3, text: "Passed proposals go to a 48h time-lock before execution." },
                  { n: 4, text: "Submit a DIP with ≥500 MAIAT + 50 seconding votes." },
                  { n: 5, text: "Earn governance rewards for consistent participation." },
                ].map((step) => (
                  <li key={step.n} className="flex gap-2">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] text-[10px] font-bold flex items-center justify-center">
                      {step.n}
                    </span>
                    <span className="leading-relaxed">{step.text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Submit DIP */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h2 className="text-xs font-mono font-bold text-[var(--muted)] uppercase tracking-widest mb-3">
                Submit a DIP
              </h2>
              <p className="text-xs text-[var(--muted)] mb-4 leading-relaxed">
                Have an idea to improve the Dojo protocol? Submit a Dojo Improvement Proposal
                with 500 MAIAT as a deposit. Deposits refunded if the proposal passes.
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>Deposit required</span>
                  <span className="text-white">500 MAIAT</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>Seconding votes needed</span>
                  <span className="text-white">50 supporters</span>
                </div>
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>Your balance</span>
                  <span className="text-[var(--accent)]">340 MAIAT</span>
                </div>
              </div>
              <button className="w-full py-2 rounded-lg text-xs font-mono font-bold bg-white/5 text-[var(--muted)] border border-white/10 cursor-not-allowed">
                Need 160 more MAIAT
              </button>
            </div>

            {/* Recent passed DIPs */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-5">
              <h2 className="text-xs font-mono font-bold text-[var(--muted)] uppercase tracking-widest mb-4">
                Recently Passed
              </h2>
              <div className="space-y-3">
                {proposals
                  .filter((p) => p.status === "passed")
                  .map((p) => (
                    <div key={p.id} className="flex items-start gap-2">
                      <span className="text-[10px] text-[#44ff88] mt-0.5 shrink-0">✓</span>
                      <div>
                        <div className="text-xs font-mono text-white leading-snug">{p.id}</div>
                        <div className="text-[10px] text-[var(--muted)] leading-snug line-clamp-1">
                          {p.title}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-xl bg-[var(--card-bg)] border border-[var(--accent)]/40 text-xs text-[var(--accent)] font-mono shadow-xl z-50 animate-fade-in">
          ✓ {toast}
        </div>
      )}
    </div>
  );
}
