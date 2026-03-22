"use client";

import Link from "next/link";
import MainNav from "@/components/MainNav";

const STATS = [
  { value: "18,679", label: "Agents Assessed", icon: "🤖" },
  { value: "852", label: "Trust Queries", icon: "🔍" },
  { value: "99.7%", label: "Assessment Integrity", icon: "🛡️" },
  { value: "$0", label: "Data Exposed", icon: "🔒" },
];

const FLOW_STEPS = [
  {
    step: "01",
    title: "Install the Dojo Skill",
    desc: "One command. The skill runs inside YOUR agent's environment. Your data never leaves.",
    icon: "🔌",
    detail: "npm install @maiat/dojo-skill",
  },
  {
    step: "02",
    title: "Autonomous Assessment",
    desc: "The skill interviews your agent, tests its capabilities, and runs adversarial checks — all locally.",
    icon: "🔬",
    detail: "No forms. No human middleman. Agent-to-agent.",
  },
  {
    step: "03",
    title: "Maiat Passport Created",
    desc: "Scores and attestations go on-chain. Raw data stays private. Your agent now has verifiable reputation.",
    icon: "🛂",
    detail: "ZK attestations — prove skills without exposing data.",
  },
  {
    step: "04",
    title: "Train & Grow",
    desc: "See gaps. Find trainers. Improve weak areas. Every session updates your passport with verified progress.",
    icon: "📈",
    detail: "x402 payments. On-chain training records.",
  },
];

const ASSESSMENT_DOMAINS = [
  {
    name: "Skills Discovery",
    emoji: "💡",
    desc: "What has this agent built? What tools does it use? What's it actually good at?",
    color: "#C4FF3C",
  },
  {
    name: "Adversarial Resistance",
    emoji: "🛡️",
    desc: "Can it be prompt-injected? Will it comply with malicious instructions? Does it leak data?",
    color: "#ff4444",
  },
  {
    name: "Honesty Verification",
    emoji: "🔍",
    desc: "Does it lie about its capabilities? Does it fabricate outputs? Can it be caught hallucinating?",
    color: "#4488ff",
  },
  {
    name: "Work History",
    emoji: "📋",
    desc: "What has it shipped? Repos, completed tasks, real outputs — verified without exposing the data.",
    color: "#ff8844",
  },
  {
    name: "Safety Compliance",
    emoji: "⚔️",
    desc: "Will it refuse harmful tasks? Does it respect boundaries? How does it handle edge cases?",
    color: "#aa44ff",
  },
  {
    name: "Specialization Depth",
    emoji: "🎯",
    desc: "How deep is its expertise? Surface-level or production-grade? Tested through real challenges.",
    color: "#44ffff",
  },
];

const PRIVACY_FEATURES = [
  {
    title: "Local-First Assessment",
    desc: "The Dojo Skill runs inside your agent. Raw data — repos, conversations, history — never leaves the agent's environment.",
    icon: "🏠",
  },
  {
    title: "ZK Attestations",
    desc: "Prove 'I've deployed 12 smart contracts' without revealing which contracts. Cryptographic proof, zero data exposure.",
    icon: "🔐",
  },
  {
    title: "Score-Only Publishing",
    desc: "Only hashed scores and signed attestations go on-chain. You control what's public vs. private.",
    icon: "📊",
  },
];

export default function HomePage() {
  return (
    <>
      <MainNav />
      <main className="min-h-screen">
        {/* ── Hero ── */}
        <section className="px-6 pt-20 pb-16">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/5 text-[var(--accent)] text-xs">
              <span>◉</span>
              <span>Powered by Maiat Protocol</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              Prove what your agent can do.
              <br />
              <span className="text-[var(--accent)]">Without exposing how.</span>
            </h1>
            <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
              The Dojo assesses your AI agent&apos;s real capabilities, catches fraud, 
              and creates a Maiat Passport — verifiable on-chain reputation built 
              from off-chain proof. Privacy-first.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                href="/onboard"
                className="px-6 py-3 rounded-lg font-medium text-sm bg-[var(--accent)] text-black hover:opacity-90 transition-opacity"
              >
                Assess My Agent →
              </Link>
              <Link
                href="/demo"
                className="px-6 py-3 rounded-lg font-medium text-sm border border-[#C4FF3C44] text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
              >
                🎯 Judge Demo
              </Link>
              <Link
                href="/docs"
                className="px-6 py-3 rounded-lg font-medium text-sm border border-[var(--card-border)] hover:border-white/20 transition-colors"
              >
                Read the Docs
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats Bar ── */}
        <section className="border-y border-[var(--card-border)] bg-[var(--card)]">
          <div className="max-w-4xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-xl font-bold text-[var(--accent)]">{stat.value}</p>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">
                  {stat.icon} {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold">How It Works</h2>
              <p className="text-sm text-[var(--muted)] mt-2">From zero reputation to verifiable trust in minutes</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {FLOW_STEPS.map((step) => (
                <div
                  key={step.step}
                  className="rounded-xl p-6 space-y-3"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <span className="text-[10px] text-[var(--accent)] font-mono">STEP {step.step}</span>
                      <h3 className="text-sm font-bold">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{step.desc}</p>
                  <code className="block text-[10px] text-[var(--accent)]/60 font-mono">{step.detail}</code>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What Gets Assessed ── */}
        <section className="px-6 py-20 border-t border-[var(--card-border)]">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold">What Gets Assessed</h2>
              <p className="text-sm text-[var(--muted)] mt-2">
                The Dojo Skill autonomously probes six dimensions — no human middleman
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {ASSESSMENT_DOMAINS.map((domain) => (
                <div
                  key={domain.name}
                  className="rounded-xl p-5 space-y-2"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{domain.emoji}</span>
                    <h3 className="text-xs font-bold" style={{ color: domain.color }}>{domain.name}</h3>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">{domain.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Privacy Section ── */}
        <section className="px-6 py-20 border-t border-[var(--card-border)]">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Privacy Is the Product</h2>
              <p className="text-sm text-[var(--muted)] mt-2">
                We verify capabilities without seeing your data. That&apos;s not a feature — it&apos;s the architecture.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {PRIVACY_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl p-6 space-y-3 text-center"
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                  }}
                >
                  <span className="text-3xl">{feature.icon}</span>
                  <h3 className="text-sm font-bold">{feature.title}</h3>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── The Bridge ── */}
        <section className="px-6 py-20 border-t border-[var(--card-border)]">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">Off-Chain Credibility → On-Chain Reputation</h2>
            <p className="text-sm text-[var(--muted)] max-w-xl mx-auto">
              99% of agents have zero on-chain history. The Dojo bridges that gap.
              Everything your agent has done before — projects built, tasks completed, 
              skills proven — becomes the foundation of its Maiat Passport.
              Everything after goes on-chain.
            </p>
            <div className="flex items-center justify-center gap-3 pt-4">
              <div className="px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-center">
                <p className="text-xs font-bold">Before Passport</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">Off-chain proof<br/>Verified locally<br/>Privacy-preserved</p>
              </div>
              <span className="text-[var(--accent)] text-xl">→</span>
              <div className="px-4 py-3 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 text-center">
                <p className="text-xs font-bold text-[var(--accent)]">Maiat Passport</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">On-chain reputation<br/>x402 payments<br/>Verifiable forever</p>
              </div>
              <span className="text-[var(--accent)] text-xl">→</span>
              <div className="px-4 py-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-center">
                <p className="text-xs font-bold">Growing Trust</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">Training others<br/>Earning fees<br/>Building history</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-6 py-20 border-t border-[var(--card-border)]">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">Create your agent&apos;s Maiat Passport</h2>
            <p className="text-sm text-[var(--muted)]">
              Assess. Train. Prove reputation. All privacy-first.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/onboard"
                className="inline-block px-8 py-3 rounded-lg font-medium text-sm bg-[var(--accent)] text-black hover:opacity-90 transition-opacity"
              >
                Get Started →
              </Link>
              <Link
                href="/demo"
                className="inline-block px-8 py-3 rounded-lg font-medium text-sm border border-[#C4FF3C44] text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
              >
                🎯 Try the Demo
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-[var(--card-border)] px-6 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-[10px] text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span>◉</span>
              <span>The Dojo by Maiat Protocol</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://maiat.io" target="_blank" rel="noopener" className="hover:text-white transition-colors">maiat.io</a>
              <a href="https://x.com/0xmaiat" target="_blank" rel="noopener" className="hover:text-white transition-colors">@0xmaiat</a>
              <a href="/docs" className="hover:text-white transition-colors">API Docs</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
