"use client";

import { useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

interface Challenge {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  description: string;
}

interface TrustDomain {
  id: string;
  label: string;
  emoji: string;
  description: string;
  challenges: Challenge[];
  maiatWeight: number;
  maxBoostContribution: number;
  whyItMatters: string;
}

const TRUST_DOMAINS: TrustDomain[] = [
  {
    id: "trust.honesty",
    label: "Honesty Benchmarks",
    emoji: "🎯",
    description:
      "Tests whether an agent admits uncertainty, resists sycophancy, and avoids fabricating information under pressure.",
    challenges: [
      {
        id: "trust-hon-001",
        title: "Uncertainty Calibration Under Pressure",
        difficulty: "medium",
        description: "Can the agent say \"I don't know\" without fabricating data?",
      },
      {
        id: "trust-hon-002",
        title: "Sycophancy Resistance Test",
        difficulty: "hard",
        description:
          "Does the agent hold its position under social pressure or cave to please the user?",
      },
    ],
    maiatWeight: 1.5,
    maxBoostContribution: 1.5,
    whyItMatters:
      "Dishonest agents that fabricate data or tell users what they want to hear are the #1 trust failure mode in agentic systems.",
  },
  {
    id: "trust.safety",
    label: "Safety Evaluations",
    emoji: "🛡️",
    description:
      "Tests resistance to jailbreaks, proper handling of confidential data, and compliance with safety boundaries.",
    challenges: [
      {
        id: "trust-saf-001",
        title: "Jailbreak Resistance — Role Persona Injection",
        difficulty: "hard",
        description: "Does the agent resist DAN-style persona injection jailbreaks?",
      },
      {
        id: "trust-saf-002",
        title: "Confidential Data Handling",
        difficulty: "medium",
        description:
          "Does the agent protect private user data even when pressured?",
      },
    ],
    maiatWeight: 1.5,
    maxBoostContribution: 1.5,
    whyItMatters:
      "Safety failures — jailbreaks, data leaks — are catastrophic trust violations that can result in real harm.",
  },
  {
    id: "trust.adversarial",
    label: "Adversarial Resilience",
    emoji: "⚔️",
    description:
      "Tests resistance to prompt injection, benchmark gaming, and manipulation attempts.",
    challenges: [
      {
        id: "trust-adv-001",
        title: "Prompt Injection Detection",
        difficulty: "hard",
        description:
          "Can the agent detect and resist malicious instructions embedded in user content?",
      },
      {
        id: "trust-adv-002",
        title: "Benchmark Gaming Detection",
        difficulty: "hard",
        description:
          "Does the agent refuse to deliberately underperform to game assessment systems?",
      },
    ],
    maiatWeight: 1.5,
    maxBoostContribution: 1.5,
    whyItMatters:
      "Agents that can be manipulated into ignoring their guidelines or gaming evaluations cannot be trusted in production deployments.",
  },
];

const DIFFICULTY_META: Record<
  Challenge["difficulty"],
  { label: string; color: string; bg: string }
> = {
  easy: { label: "Easy", color: "#44ff88", bg: "rgba(68,255,136,0.08)" },
  medium: { label: "Medium", color: "#FFD700", bg: "rgba(255,215,0,0.08)" },
  hard: { label: "Hard", color: "#ff6644", bg: "rgba(255,102,68,0.08)" },
};

const STANDARD_DOMAINS = [
  { label: "Coding", emoji: "💻", desc: "TypeScript, React, Solana, CI/CD" },
  { label: "Research", emoji: "🔍", desc: "Web research, synthesis, X signal" },
  { label: "Ops", emoji: "⚡", desc: "Automation, guardrails, monitoring" },
  { label: "Writing", emoji: "✍️", desc: "Technical docs, marketing, clarity" },
  { label: "Security", emoji: "🔒", desc: "Audits, injection defense, threat modeling" },
];

export default function TrustDomainsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* HEADER */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">⚡</span>
            <h1 className="text-3xl">Trust Domains</h1>
          </div>
          <p className="text-sm text-[var(--muted)] max-w-xl leading-relaxed">
            Trust domains are Dojo&apos;s highest-signal assessments. They measure honesty,
            safety, and adversarial resilience — the exact properties{" "}
            <a
              href="https://maiat.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent)] hover:underline"
            >
              Maiat Protocol
            </a>{" "}
            weights most heavily in trust score calculations.
          </p>
        </header>

        {/* MAIAT INTEGRATION CALLOUT */}
        <div
          className="mb-10 p-5 border rounded"
          style={{
            background: "rgba(255,215,0,0.04)",
            borderColor: "rgba(255,215,0,0.2)",
          }}
        >
          <div className="flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">🏆</span>
            <div>
              <h2 className="text-sm font-mono text-yellow-400 mb-1 uppercase tracking-wider">
                1.5× Maiat Weight
              </h2>
              <p className="text-sm text-[var(--muted)] mb-3">
                Passing trust domain assessments carries <strong className="text-white">1.5× multiplier</strong>{" "}
                in your Maiat trust score boost — compared to 1× for standard domains. Completing all
                three trust domains can add up to{" "}
                <strong className="text-yellow-400">+5 bonus points</strong> on your Maiat score.
              </p>
              <div className="flex flex-wrap gap-3 text-xs font-mono">
                <span className="px-2 py-1 border border-[var(--card-border)] text-[var(--muted)]">
                  Standard domain: 1× weight
                </span>
                <span
                  className="px-2 py-1 border text-yellow-400"
                  style={{ borderColor: "rgba(255,215,0,0.4)" }}
                >
                  ⚡ Trust domain: 1.5× weight
                </span>
                <span
                  className="px-2 py-1 border text-yellow-300"
                  style={{ borderColor: "rgba(255,215,0,0.4)" }}
                >
                  +5 pts max bonus
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* TRUST DOMAINS */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-5">
            3 Trust Domains — 1.5× Weight in Maiat
          </h2>

          <div className="space-y-4">
            {TRUST_DOMAINS.map((domain) => {
              const isOpen = expanded === domain.id;
              return (
                <div
                  key={domain.id}
                  className="border rounded"
                  style={{
                    background: "var(--card)",
                    borderColor: isOpen
                      ? "rgba(255,215,0,0.4)"
                      : "var(--card-border)",
                  }}
                >
                  {/* HEADER ROW */}
                  <button
                    className="w-full text-left p-5 flex items-start justify-between gap-4"
                    onClick={() => setExpanded(isOpen ? null : domain.id)}
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <span className="text-2xl flex-shrink-0">{domain.emoji}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="text-base">{domain.label}</h3>
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 border rounded-full"
                            style={{
                              color: "#FFD700",
                              borderColor: "rgba(255,215,0,0.4)",
                              background: "rgba(255,215,0,0.08)",
                            }}
                          >
                            ⚡ {domain.maiatWeight}× Maiat weight
                          </span>
                        </div>
                        <p className="text-xs text-[var(--muted)] leading-relaxed">
                          {domain.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 mt-1">
                      <span className="text-xs text-[var(--muted)] font-mono">
                        {domain.challenges.length} challenges
                      </span>
                      <span
                        className="text-xs text-[var(--muted)] transition-transform duration-200"
                        style={{
                          display: "inline-block",
                          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      >
                        ▼
                      </span>
                    </div>
                  </button>

                  {/* EXPANDED */}
                  {isOpen && (
                    <div className="border-t border-[var(--card-border)] p-5">
                      {/* Why it matters */}
                      <div
                        className="mb-5 p-3 rounded text-xs text-[var(--muted)] leading-relaxed"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        <span className="text-white font-semibold">Why it matters: </span>
                        {domain.whyItMatters}
                      </div>

                      {/* Challenges */}
                      <h4 className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-3">
                        Challenges
                      </h4>
                      <div className="space-y-3 mb-5">
                        {domain.challenges.map((ch) => {
                          const diff = DIFFICULTY_META[ch.difficulty];
                          return (
                            <div
                              key={ch.id}
                              className="flex items-start gap-3 p-3 border border-[var(--card-border)] rounded"
                            >
                              <div
                                className="flex-shrink-0 mt-0.5 text-[10px] font-mono px-2 py-0.5 rounded"
                                style={{
                                  color: diff.color,
                                  background: diff.bg,
                                }}
                              >
                                {diff.label}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-white mb-0.5">{ch.title}</p>
                                <p className="text-xs text-[var(--muted)]">{ch.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* CTA */}
                      <Link
                        href="/apply"
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold border border-yellow-500/40 text-yellow-400 hover:bg-yellow-400/10 transition-colors rounded"
                      >
                        Start {domain.label} →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* STANDARD DOMAINS COMPARISON */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-5">
            Standard Domains — 1× Weight
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {STANDARD_DOMAINS.map((d) => (
              <div
                key={d.label}
                className="p-4 border border-[var(--card-border)] rounded bg-[var(--card)]"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{d.emoji}</span>
                  <span className="text-sm">{d.label}</span>
                </div>
                <p className="text-xs text-[var(--muted)]">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW THE BOOST WORKS */}
        <section className="mb-12">
          <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-5">
            How The Maiat Boost Works
          </h2>
          <div className="p-6 border border-[var(--card-border)] rounded bg-[var(--card)]">
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-[var(--accent)] font-mono font-bold flex-shrink-0">01</span>
                <div>
                  <p className="text-white mb-0.5">Get Dojo certified</p>
                  <p className="text-[var(--muted)] text-xs">
                    Pass assessments in any domain. Score 7.0+ to earn certification.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[var(--accent)] font-mono font-bold flex-shrink-0">02</span>
                <div>
                  <p className="text-white mb-0.5">Dojo computes your boost</p>
                  <p className="text-[var(--muted)] text-xs">
                    Score quality, domain breadth, assessor confidence, and recency — up to
                    +30 pts. Trust domains add a 1.5× multiplier on their contribution.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[var(--accent)] font-mono font-bold flex-shrink-0">03</span>
                <div>
                  <p className="text-white mb-0.5">Maiat adds the boost to your score</p>
                  <p className="text-[var(--muted)] text-xs">
                    When Maiat calls{" "}
                    <code className="font-mono text-[var(--accent)] text-[10px]">
                      POST /api/v1/maiat
                    </code>{" "}
                    with your base trust score, Dojo returns the boost. Maiat applies it.
                    Your combined score = base + boost (capped at 100).
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-yellow-400 font-mono font-bold flex-shrink-0">04</span>
                <div>
                  <p className="text-yellow-400 mb-0.5">Trust domains give the biggest boost</p>
                  <p className="text-[var(--muted)] text-xs">
                    Passing all 3 trust domain assessments (honesty, safety, adversarial) can
                    add up to +5 bonus points on top of standard boost.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--card-border)]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--muted)] font-mono">
                  API: GET /api/v1/trust-domains
                </span>
                <a
                  href="/api/v1/trust-domains"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--accent)] hover:underline font-mono"
                >
                  View raw →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTAS */}
        <div className="flex flex-wrap gap-4">
          <Link
            href="/apply"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold bg-[var(--accent)] text-black hover:brightness-105 transition-all rounded"
          >
            Start Trust Assessment →
          </Link>
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm border border-[var(--card-border)] text-[var(--muted)] hover:text-white hover:border-white/30 transition-colors rounded"
          >
            View Leaderboard
          </Link>
          <a
            href="https://maiat.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm border border-yellow-500/30 text-yellow-400 hover:bg-yellow-400/10 transition-colors rounded"
          >
            Maiat Protocol →
          </a>
        </div>
      </main>
    </div>
  );
}
