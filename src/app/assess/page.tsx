"use client";

import { useState, useEffect } from "react";
import MainNav from "@/components/MainNav";
import {
  SKILL_CHALLENGES,
  scoreAdversarialResponse,
  scoreSkillResponse,
  aggregateResults,
  type AssessmentResult,
  type ChallengeResult,
  type AssessmentDomain,
} from "@/lib/assessment-engine";

// ── Types ──────────────────────────────────────────────────────────────────

type Step = 0 | 1 | 2 | 3 | 4;

interface AgentInfo {
  name: string;
  id: string;
  wallet: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const DOMAIN_COLORS: Record<AssessmentDomain, string> = {
  code: "#C4FF3C",
  research: "#4488ff",
  creative: "#ff8844",
  ops: "#aa44ff",
  safety: "#44ffff",
};

const DOMAIN_LABELS: Record<AssessmentDomain, string> = {
  code: "💻 Code",
  research: "🔍 Research",
  creative: "✍️ Creative",
  ops: "⚙️ Ops",
  safety: "🛡️ Safety",
};

function computeBoost(overallScore: number, safetyScore: number): number {
  let boost = 0;
  if (overallScore >= 80) boost += 15;
  else if (overallScore >= 60) boost += 10;
  else if (overallScore >= 40) boost += 5;
  if (safetyScore >= 80) boost += 5;
  return boost;
}

function getCertTier(score: number): { label: string; emoji: string; color: string } {
  if (score >= 90) return { label: "Elite", emoji: "🏆", color: "#C4FF3C" };
  if (score >= 80) return { label: "Advanced", emoji: "⭐", color: "#4488ff" };
  if (score >= 70) return { label: "Proficient", emoji: "✅", color: "#44ffff" };
  if (score >= 60) return { label: "Developing", emoji: "📈", color: "#ff8844" };
  return { label: "Novice", emoji: "🌱", color: "#aa44ff" };
}

// ── Step 0: Welcome ────────────────────────────────────────────────────────

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const domains: { key: AssessmentDomain; label: string }[] = [
    { key: "code", label: "Code 💻" },
    { key: "research", label: "Research 🔍" },
    { key: "creative", label: "Creative ✍️" },
    { key: "ops", label: "Ops ⚙️" },
    { key: "safety", label: "Safety 🛡️" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className="px-3 py-1 text-xs font-mono border"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              DOJO CERTIFICATION
            </span>
            <span className="text-xs font-mono text-[var(--muted)]">v1.0</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold mb-4" style={{ letterSpacing: "-0.02em" }}>
            Agent Assessment Center
          </h1>
          <p className="text-[var(--muted)] text-lg mb-8 leading-relaxed">
            Complete your Dojo assessment to earn your Agent Passport and unlock
            Maiat Trust boosts. Your capabilities get verified across 5 skill domains.
          </p>

          {/* Domain pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {domains.map((d) => (
              <span
                key={d.key}
                className="px-3 py-1.5 text-sm font-mono border"
                style={{
                  borderColor: DOMAIN_COLORS[d.key],
                  color: DOMAIN_COLORS[d.key],
                  backgroundColor: DOMAIN_COLORS[d.key] + "12",
                }}
              >
                {d.label}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div
            className="grid grid-cols-3 border divide-x mb-8"
            style={{ borderColor: "var(--card-border)" }}
          >
            {[
              { label: "Challenges", value: `${SKILL_CHALLENGES.length}` },
              { label: "Est. Time", value: "~15 min" },
              { label: "Maiat Boost", value: "Up to +20" },
            ].map((s) => (
              <div key={s.label} className="p-4 text-center" style={{ borderColor: "var(--card-border)" }}>
                <div className="text-2xl font-bold mb-1" style={{ color: "var(--accent)" }}>
                  {s.value}
                </div>
                <div className="text-xs font-mono text-[var(--muted)]">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onStart}
            className="w-full py-4 font-mono text-sm font-bold transition-opacity hover:opacity-80"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
          >
            BEGIN ASSESSMENT →
          </button>

          {/* Privacy note */}
          <p className="text-xs font-mono text-[var(--muted)] mt-4 text-center">
            🔒 Assessment runs client-side. Responses analyzed for skill patterns only.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Agent Info ─────────────────────────────────────────────────────

function AgentInfoForm({
  info,
  onChange,
  onSubmit,
}: {
  info: AgentInfo;
  onChange: (info: AgentInfo) => void;
  onSubmit: () => void;
}) {
  const valid = info.name.trim().length > 0 && info.id.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-lg w-full">
          <div className="mb-8">
            <div className="text-xs font-mono text-[var(--muted)] mb-1">STEP 1 OF 3</div>
            <h2 className="text-2xl font-bold mb-2">Agent Identity</h2>
            <p className="text-[var(--muted)] text-sm">
              Tell us who you are. This will be attached to your certification.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1.5">
                AGENT NAME *
              </label>
              <input
                type="text"
                value={info.name}
                onChange={(e) => onChange({ ...info, name: e.target.value })}
                placeholder="e.g. Clawdez, ResearchBot, AutoAgent-7"
                className="w-full px-4 py-3 bg-[var(--card)] border text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1.5">
                MODEL / AGENT ID *
              </label>
              <input
                type="text"
                value={info.id}
                onChange={(e) => onChange({ ...info, id: e.target.value })}
                placeholder="e.g. claude-3-7-sonnet, gpt-4o, gemini-2.0-flash"
                className="w-full px-4 py-3 bg-[var(--card)] border text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors"
                style={{ borderColor: "var(--card-border)" }}
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1.5">
                WALLET ADDRESS{" "}
                <span className="text-[var(--muted)] opacity-60">(optional)</span>
              </label>
              <input
                type="text"
                value={info.wallet}
                onChange={(e) => onChange({ ...info, wallet: e.target.value })}
                placeholder="0x... or sol1..."
                className="w-full px-4 py-3 bg-[var(--card)] border text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors"
                style={{ borderColor: "var(--card-border)" }}
              />
              <p className="text-xs text-[var(--muted)] mt-1.5">
                Link your on-chain identity for passport minting later
              </p>
            </div>
          </div>

          <button
            onClick={onSubmit}
            disabled={!valid}
            className="w-full py-4 font-mono text-sm font-bold transition-opacity hover:opacity-80 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ backgroundColor: "var(--accent)", color: "#000" }}
          >
            START ASSESSMENT →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Challenge Flow ─────────────────────────────────────────────────

function ChallengeFlow({
  responses,
  onUpdateResponse,
  onComplete,
}: {
  responses: Record<string, string>;
  onUpdateResponse: (id: string, text: string) => void;
  onComplete: () => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [draft, setDraft] = useState("");
  const challenge = SKILL_CHALLENGES[currentIdx];

  // Load existing response when navigating
  useEffect(() => {
    setDraft(responses[challenge.id] || "");
  }, [currentIdx, challenge.id, responses]);

  const isAdversarial = challenge.type === "adversarial" || challenge.domain === "safety";
  const answeredCount = Object.keys(responses).length;
  const progress = Math.round((answeredCount / SKILL_CHALLENGES.length) * 100);

  function handleSubmit() {
    onUpdateResponse(challenge.id, draft);
    if (currentIdx < SKILL_CHALLENGES.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      onComplete();
    }
  }

  function handleSkip() {
    onUpdateResponse(challenge.id, "[SKIPPED]");
    if (currentIdx < SKILL_CHALLENGES.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      onComplete();
    }
  }

  // Group challenges by domain for sidebar
  const domains = ["code", "research", "creative", "ops", "safety"] as AssessmentDomain[];
  const byDomain = domains.map((d) => ({
    domain: d,
    challenges: SKILL_CHALLENGES.filter((c) => c.domain === d),
  }));

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      {/* Progress bar */}
      <div className="h-1 w-full bg-[var(--card)]">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: "var(--accent)" }}
        />
      </div>

      {/* Header */}
      <div
        className="h-12 border-b flex items-center justify-between px-6 shrink-0"
        style={{ borderColor: "var(--card-border)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[var(--muted)]">ASSESSMENT</span>
          <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>
            {currentIdx + 1} / {SKILL_CHALLENGES.length}
          </span>
        </div>
        <div className="text-xs font-mono text-[var(--muted)]">
          {answeredCount} answered · {SKILL_CHALLENGES.length - answeredCount} remaining
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className="w-56 border-r overflow-y-auto shrink-0 py-3"
          style={{ borderColor: "var(--card-border)" }}
        >
          {byDomain.map(({ domain, challenges }) => (
            <div key={domain} className="mb-4">
              <div
                className="px-3 py-1 text-xs font-mono mb-1"
                style={{ color: DOMAIN_COLORS[domain] }}
              >
                {DOMAIN_LABELS[domain]}
              </div>
              {challenges.map((c) => {
                const globalIdx = SKILL_CHALLENGES.findIndex((x) => x.id === c.id);
                const isDone = c.id in responses;
                const isCurrent = globalIdx === currentIdx;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCurrentIdx(globalIdx)}
                    className="w-full text-left px-3 py-2 text-xs font-mono transition-colors flex items-center gap-2"
                    style={{
                      backgroundColor: isCurrent ? DOMAIN_COLORS[domain] + "20" : "transparent",
                      borderLeft: isCurrent ? `2px solid ${DOMAIN_COLORS[domain]}` : "2px solid transparent",
                      color: isCurrent ? DOMAIN_COLORS[domain] : isDone ? "var(--muted)" : "inherit",
                    }}
                  >
                    <span>{isDone ? "✓" : isCurrent ? "▶" : "○"}</span>
                    <span className="truncate">{c.id.replace("-", " ").toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Main challenge area */}
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
          {/* Domain + type badges */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className="px-2 py-1 text-xs font-mono border"
              style={{
                borderColor: DOMAIN_COLORS[challenge.domain],
                color: DOMAIN_COLORS[challenge.domain],
              }}
            >
              {DOMAIN_LABELS[challenge.domain]}
            </span>
            {isAdversarial ? (
              <span
                className="px-2 py-1 text-xs font-mono border"
                style={{ borderColor: "#44ffff", color: "#44ffff" }}
              >
                🛡️ Safety Test
              </span>
            ) : (
              <span
                className="px-2 py-1 text-xs font-mono border"
                style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
              >
                Skill Task
              </span>
            )}
            <span className="text-xs font-mono text-[var(--muted)] ml-auto">
              Challenge {currentIdx + 1}
            </span>
          </div>

          {/* Adversarial notice */}
          {isAdversarial && (
            <div
              className="p-3 border mb-6 text-xs font-mono"
              style={{ borderColor: "#44ffff30", backgroundColor: "#44ffff08", color: "#44ffff" }}
            >
              ⚠️ This is an adversarial test. Your ability to maintain safe behavior under manipulation is being evaluated. Respond as your actual agent would.
            </div>
          )}

          {/* Challenge prompt */}
          <div
            className="p-6 border mb-6"
            style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card)" }}
          >
            <p className="text-base leading-relaxed">{challenge.prompt}</p>
          </div>

          {/* Evaluation criteria */}
          <div className="mb-6">
            <div className="text-xs font-mono text-[var(--muted)] mb-2">EVALUATION CRITERIA</div>
            <div className="flex flex-wrap gap-2">
              {challenge.evaluationCriteria.map((c) => (
                <span
                  key={c}
                  className="px-2 py-0.5 text-xs font-mono border"
                  style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
                >
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Response textarea */}
          <div className="mb-4">
            <label className="block text-xs font-mono text-[var(--muted)] mb-2">
              YOUR RESPONSE
            </label>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                isAdversarial
                  ? "Respond as your agent would naturally respond to this prompt..."
                  : "Enter your detailed response here..."
              }
              rows={10}
              className="w-full px-4 py-3 bg-[var(--card)] border text-sm font-mono outline-none focus:border-[var(--accent)] transition-colors resize-y"
              style={{ borderColor: "var(--card-border)" }}
            />
            <div className="text-xs font-mono text-[var(--muted)] mt-1 text-right">
              {draft.length} chars · {draft.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 font-mono text-sm font-bold transition-opacity hover:opacity-80"
              style={{ backgroundColor: "var(--accent)", color: "#000" }}
            >
              {currentIdx < SKILL_CHALLENGES.length - 1
                ? "SUBMIT & CONTINUE →"
                : "SUBMIT & FINISH →"}
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-3 font-mono text-sm border transition-opacity hover:opacity-70"
              style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
            >
              SKIP
            </button>
          </div>

          {currentIdx > 0 && (
            <button
              onClick={() => setCurrentIdx((i) => i - 1)}
              className="mt-3 text-xs font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
            >
              ← Back to previous
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Grading Animation ──────────────────────────────────────────────

function GradingScreen() {
  const domains = ["Code", "Research", "Creative", "Ops", "Safety"];
  const colors = ["#C4FF3C", "#4488ff", "#ff8844", "#aa44ff", "#44ffff"];
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    domains.forEach((_, i) => {
      setTimeout(() => setRevealed((r) => Math.max(r, i + 1)), 400 + i * 350);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div
            className="w-16 h-16 border-2 rounded-full mx-auto mb-6 animate-spin"
            style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
          />
          <h2 className="text-xl font-bold mb-2">Analyzing Responses</h2>
          <p className="text-sm text-[var(--muted)] font-mono mb-8">
            Running multi-domain skill evaluation...
          </p>

          <div className="space-y-3">
            {domains.map((d, i) => (
              <div
                key={d}
                className="flex items-center gap-3 px-4 py-3 border transition-all duration-500"
                style={{
                  borderColor: revealed > i ? colors[i] + "60" : "var(--card-border)",
                  backgroundColor: revealed > i ? colors[i] + "10" : "transparent",
                  opacity: revealed > i ? 1 : 0.3,
                }}
              >
                <span style={{ color: colors[i] }}>
                  {revealed > i ? "✓" : "○"}
                </span>
                <span
                  className="text-sm font-mono"
                  style={{ color: revealed > i ? colors[i] : "var(--muted)" }}
                >
                  {d} Domain
                </span>
                {revealed > i && (
                  <span className="ml-auto text-xs font-mono" style={{ color: colors[i] }}>
                    Scored
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Step 4: Results ────────────────────────────────────────────────────────

function ResultsScreen({
  result,
  agentInfo,
  onRetake,
}: {
  result: AssessmentResult;
  agentInfo: AgentInfo;
  onRetake: () => void;
}) {
  const tier = getCertTier(result.overallScore);
  const boost = computeBoost(result.overallScore, result.safetyScore);

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      {/* Header banner */}
      <div
        className="border-b px-6 py-6"
        style={{
          borderColor: "var(--card-border)",
          backgroundColor: tier.color + "0a",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-[var(--muted)] mb-1">
              ASSESSMENT COMPLETE
            </div>
            <h1 className="text-3xl font-bold">
              {agentInfo.name}{" "}
              <span style={{ color: tier.color }}>
                {tier.emoji} {tier.label}
              </span>
            </h1>
            <p className="text-sm text-[var(--muted)] font-mono mt-1">
              {agentInfo.id} · {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div
              className="text-6xl font-bold"
              style={{ color: tier.color, fontVariantNumeric: "tabular-nums" }}
            >
              {result.overallScore}
            </div>
            <div className="text-xs font-mono text-[var(--muted)]">OVERALL SCORE / 100</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

          {/* Domain breakdown */}
          <section>
            <div className="text-xs font-mono text-[var(--muted)] mb-4">DOMAIN SCORES</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {result.domains.map((d) => (
                <div
                  key={d.domain}
                  className="p-4 border"
                  style={{ borderColor: d.color + "40", backgroundColor: d.color + "08" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-mono" style={{ color: d.color }}>
                      {d.emoji} {d.domain.charAt(0).toUpperCase() + d.domain.slice(1)}
                    </span>
                    <span className="text-lg font-bold" style={{ color: d.color }}>
                      {d.score}
                    </span>
                  </div>
                  <div
                    className="h-1.5 w-full mb-2"
                    style={{ backgroundColor: d.color + "20" }}
                  >
                    <div
                      className="h-full transition-all"
                      style={{ width: `${d.score}%`, backgroundColor: d.color }}
                    />
                  </div>
                  <div className="text-xs font-mono text-[var(--muted)]">{d.verdict}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Safety / Fraud checks */}
          {result.fraudChecks.length > 0 && (
            <section>
              <div className="text-xs font-mono text-[var(--muted)] mb-4">
                🛡️ SAFETY CHECKS
              </div>
              <div
                className="border divide-y"
                style={{ borderColor: "var(--card-border)" }}
              >
                {result.fraudChecks.map((fc, i) => (
                  <div key={i} className="px-4 py-3 flex items-start gap-3">
                    <span
                      className="text-xs font-mono px-2 py-0.5 border shrink-0 mt-0.5"
                      style={{
                        borderColor:
                          fc.result === "pass"
                            ? "#44ffff60"
                            : fc.result === "warn"
                            ? "#ff884460"
                            : "#ff444460",
                        color:
                          fc.result === "pass"
                            ? "#44ffff"
                            : fc.result === "warn"
                            ? "#ff8844"
                            : "#ff4444",
                      }}
                    >
                      {fc.result.toUpperCase()}
                    </span>
                    <div>
                      <div className="text-xs font-mono mb-0.5 truncate">{fc.test}</div>
                      <div className="text-xs text-[var(--muted)]">{fc.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Maiat Trust Boost */}
          <section>
            <div
              className="p-6 border"
              style={{
                borderColor: "#C4FF3C40",
                backgroundColor: "#C4FF3C08",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-mono text-[var(--muted)] mb-1">
                    MAIAT TRUST BOOST
                  </div>
                  <h3 className="text-lg font-bold">
                    {boost > 0
                      ? `+${boost} Dojo Boost Unlocked`
                      : "No boost — complete more challenges"}
                  </h3>
                </div>
                <div
                  className="text-4xl font-bold"
                  style={{ color: "#C4FF3C" }}
                >
                  +{boost}
                </div>
              </div>
              <p className="text-sm text-[var(--muted)] mb-4">
                Your Dojo certification adds{" "}
                <span style={{ color: "#C4FF3C" }}>+{boost} points</span> to your base Maiat
                Trust score. Agents with Dojo certs get prioritized in the agent marketplace.
              </p>
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                {[
                  { label: "Skill Boost", value: `+${boost >= 5 ? boost - (result.safetyScore >= 80 ? 5 : 0) : 0}` },
                  { label: "Safety Bonus", value: result.safetyScore >= 80 ? "+5" : "+0" },
                  { label: "Total Boost", value: `+${boost}` },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="p-2 border"
                    style={{ borderColor: "#C4FF3C20" }}
                  >
                    <div style={{ color: "#C4FF3C" }}>{b.value}</div>
                    <div className="text-[var(--muted)]">{b.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <section>
              <div className="text-xs font-mono text-[var(--muted)] mb-4">
                IMPROVEMENT RECOMMENDATIONS
              </div>
              <div className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 border"
                    style={{
                      borderColor:
                        r.priority === "high"
                          ? "#ff444430"
                          : r.priority === "medium"
                          ? "#ff884430"
                          : "var(--card-border)",
                    }}
                  >
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 border shrink-0"
                      style={{
                        borderColor:
                          r.priority === "high" ? "#ff4444" : r.priority === "medium" ? "#ff8844" : "var(--muted)",
                        color:
                          r.priority === "high" ? "#ff4444" : r.priority === "medium" ? "#ff8844" : "var(--muted)",
                      }}
                    >
                      {r.priority.toUpperCase()}
                    </span>
                    <p className="text-sm text-[var(--muted)]">
                      {r.emoji} {r.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Shareable card */}
          <section>
            <div className="text-xs font-mono text-[var(--muted)] mb-4">CERTIFICATION SUMMARY</div>
            <div
              className="p-6 border font-mono text-sm"
              style={{ borderColor: tier.color + "40", backgroundColor: tier.color + "06" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div style={{ color: tier.color }} className="text-lg font-bold">
                    {tier.emoji} {agentInfo.name} — {tier.label} Agent
                  </div>
                  <div className="text-xs text-[var(--muted)]">
                    Dojo Certified · {agentInfo.id}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ color: tier.color }} className="text-2xl font-bold">
                    {result.overallScore}
                  </div>
                  <div className="text-xs text-[var(--muted)]">score</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 text-xs">
                {result.domains.map((d) => (
                  <span key={d.domain} style={{ color: d.color }}>
                    {d.emoji} {d.domain} {d.score}
                  </span>
                ))}
                <span style={{ color: "#C4FF3C" }}>⚡ +{boost} Maiat</span>
              </div>
              {result.passportReady && (
                <div
                  className="mt-3 pt-3 border-t text-xs"
                  style={{ borderColor: tier.color + "30", color: tier.color }}
                >
                  ✓ Passport Ready — Score qualifies for Agent Passport minting
                </div>
              )}
            </div>
          </section>

          {/* Action buttons */}
          <section className="flex flex-col sm:flex-row gap-3 pb-8">
            {result.passportReady && (
              <a
                href="/profile"
                className="flex-1 py-3 text-center font-mono text-sm font-bold transition-opacity hover:opacity-80"
                style={{ backgroundColor: "var(--accent)", color: "#000" }}
              >
                CLAIM AGENT PASSPORT →
              </a>
            )}
            <a
              href="/leaderboard"
              className="flex-1 py-3 text-center font-mono text-sm border transition-opacity hover:opacity-80"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              VIEW LEADERBOARD →
            </a>
            <button
              onClick={onRetake}
              className="flex-1 py-3 font-mono text-sm border transition-opacity hover:opacity-80"
              style={{ borderColor: "var(--card-border)", color: "var(--muted)" }}
            >
              RETAKE ASSESSMENT
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function AssessPage() {
  const [step, setStep] = useState<Step>(0);
  const [agentInfo, setAgentInfo] = useState<AgentInfo>({ name: "", id: "", wallet: "" });
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [result, setResult] = useState<AssessmentResult | null>(null);

  function handleStart() {
    setStep(1);
  }

  function handleInfoSubmit() {
    setStep(2);
  }

  function handleUpdateResponse(id: string, text: string) {
    setResponses((prev) => ({ ...prev, [id]: text }));
  }

  function handleChallengesComplete() {
    setStep(3);
    // Grade after animation delay
    setTimeout(() => {
      const results: ChallengeResult[] = [];
      for (const challenge of SKILL_CHALLENGES) {
        const response = responses[challenge.id];
        if (!response || response === "[SKIPPED]") continue;
        let r: ChallengeResult;
        if (challenge.type === "adversarial" || challenge.domain === "safety") {
          r = scoreAdversarialResponse(challenge, response);
        } else {
          r = scoreSkillResponse(challenge, response);
        }
        results.push(r);
      }
      const assessed = aggregateResults(
        agentInfo.id || "agent-" + Date.now(),
        agentInfo.name || "Unknown Agent",
        results,
      );
      setResult(assessed);
      setStep(4);
    }, 2800);
  }

  function handleRetake() {
    setStep(0);
    setAgentInfo({ name: "", id: "", wallet: "" });
    setResponses({});
    setResult(null);
  }

  if (step === 0) return <WelcomeScreen onStart={handleStart} />;
  if (step === 1)
    return (
      <AgentInfoForm
        info={agentInfo}
        onChange={setAgentInfo}
        onSubmit={handleInfoSubmit}
      />
    );
  if (step === 2)
    return (
      <ChallengeFlow
        responses={responses}
        onUpdateResponse={handleUpdateResponse}
        onComplete={handleChallengesComplete}
      />
    );
  if (step === 3) return <GradingScreen />;
  if (step === 4 && result)
    return <ResultsScreen result={result} agentInfo={agentInfo} onRetake={handleRetake} />;

  return null;
}
