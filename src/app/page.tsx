"use client";

import Link from "next/link";
import MainNav from "@/components/MainNav";

export default function HomePage() {
  return (
    <>
      <MainNav />
      <main className="min-h-screen">
        {/* ── Hero ── */}
        <section className="px-6 pt-24 pb-20">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Equip your agent.
            </h1>
            <p className="text-[var(--muted)] text-sm max-w-xl mx-auto tracking-wide uppercase">
              The skill layer for AI agents. One agent. Any skill. Trusted.
            </p>
            <p className="text-[var(--muted)] text-lg max-w-xl mx-auto leading-relaxed">
              Agents pick up pre-built, trust-verified skills — called Shells — in one call. No training loop, no fine-tuning. Equip a Shell and your agent can do something new immediately.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 text-sm font-medium">
              <span className="text-[var(--muted)]">Need a capability → <span className="text-white">equip a Shell</span></span>
              <span className="text-[var(--accent)] hidden sm:block">|</span>
              <span className="text-[var(--muted)]">Built a skill → <span className="text-[var(--accent)]">publish &amp; earn</span></span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/onboard"
                className="px-8 py-4 rounded-lg font-semibold text-sm bg-[var(--accent)] text-black hover:opacity-90 transition-opacity">
                Equip My Agent →
              </Link>
              <Link href="/browse"
                className="px-8 py-4 rounded-lg font-semibold text-sm border border-[var(--accent)]/30 text-[var(--accent)] hover:border-[var(--accent)] transition-colors">
                Browse Shells →
              </Link>
            </div>
          </div>
        </section>

        {/* ── The Problem ── */}
        <section className="px-6 py-16 border-t border-[var(--card-border)]">
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold">The Problem</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl p-6 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <p className="text-3xl">😤</p>
                <h3 className="text-sm font-bold">&quot;My agent can&apos;t do this yet&quot;</h3>
                <p className="text-[12px] text-[var(--muted)] leading-relaxed">
                  Your agent is great at code but terrible at security. Or it can research but can&apos;t deploy.
                  You need a new capability — fast. No training loop, no fine-tuning. Just equip a Shell.
                </p>
              </div>
              <div className="rounded-xl p-6 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <p className="text-3xl">💸</p>
                <h3 className="text-sm font-bold">&quot;I built something great but nobody uses it&quot;</h3>
                <p className="text-[12px] text-[var(--muted)] leading-relaxed">
                  Your agent has audited 47 smart contracts, deployed 12 apps, or generated millions of views.
                  That expertise is just sitting there. Package it as a Shell — other agents equip it and you earn.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Two Paths ── */}
        <section className="px-6 py-16 border-t border-[var(--card-border)]">
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Two Paths. One Dojo.</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-xl p-8 space-y-4 text-center" style={{ background: "rgba(196,255,60,0.03)", border: "1px solid rgba(196,255,60,0.15)" }}>
                <p className="text-4xl">📈</p>
                <h3 className="text-lg font-bold text-[var(--accent)]">Equip Your Agent</h3>
                <p className="text-[12px] text-[var(--muted)] leading-relaxed">
                  Browse the Shell Library for pre-built, trust-verified skills.
                  Equip a Shell in one call — your agent gains a new capability instantly.
                </p>
                <ul className="text-left text-[11px] text-[var(--muted)] space-y-2 pt-2">
                  <li className="flex items-start gap-2"><span className="text-[var(--accent)]">→</span> Browse Shells by category — code, research, security, creative, and more</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--accent)]">→</span> Every Shell is trust-verified by Maiat with a transparent score</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--accent)]">→</span> Equip, subscribe, or fork — pay per call or go unlimited</li>
                  <li className="flex items-start gap-2"><span className="text-[var(--accent)]">→</span> Your agent levels up with every Shell equipped</li>
                </ul>
                <Link href="/browse" className="inline-block mt-2 px-6 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-black hover:opacity-90 transition-opacity">
                  Browse Shells →
                </Link>
              </div>

              <div className="rounded-xl p-8 space-y-4 text-center" style={{ background: "rgba(68,136,255,0.03)", border: "1px solid rgba(68,136,255,0.15)" }}>
                <p className="text-4xl">💰</p>
                <h3 className="text-lg font-bold text-[#4488ff]">Publish a Shell</h3>
                <p className="text-[12px] text-[var(--muted)] leading-relaxed">
                  Your agent has real expertise? Package it as a Shell.
                  Other agents equip it and you earn on every call.
                </p>
                <ul className="text-left text-[11px] text-[var(--muted)] space-y-2 pt-2">
                  <li className="flex items-start gap-2"><span className="text-[#4488ff]">→</span> Build your Shell — wrap a proven capability with trust verification</li>
                  <li className="flex items-start gap-2"><span className="text-[#4488ff]">→</span> Get assessed by Maiat — earn a trust score visible to all agents</li>
                  <li className="flex items-start gap-2"><span className="text-[#4488ff]">→</span> Show up in the Shell Library when agents search for your expertise</li>
                  <li className="flex items-start gap-2"><span className="text-[#4488ff]">→</span> Earn on every equip, subscription, or fork</li>
                </ul>
                <Link href="/onboard" className="inline-block mt-2 px-6 py-3 rounded-lg text-sm font-medium border border-[#4488ff]/30 text-[#4488ff] hover:border-[#4488ff] transition-colors">
                  Publish a Shell →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="px-6 py-16 border-t border-[var(--card-border)]">
          <div className="max-w-3xl mx-auto space-y-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold">How It Works</h2>
            </div>
            <div className="space-y-4">
              {[
                { step: "01", title: "Browse the Shell Library", desc: "Find pre-built skills by category. Every Shell shows its trust score, equip cost, and capability.", icon: "🔍" },
                { step: "02", title: "Equip a Shell", desc: "One API call. Your agent gains a new capability immediately — no training, no fine-tuning.", icon: "⚡" },
                { step: "03", title: "Choose your model", desc: "Equip per call, subscribe for unlimited, or fork to customize. Pay with MAIAT via x402.", icon: "💳" },
                { step: "04", title: "Publish your own", desc: "Built something great? Package it as a Shell. Get trust-verified by Maiat. Earn on every equip.", icon: "📦" },
                { step: "05", title: "Build trust on Maiat", desc: "Every Shell you publish or equip grows your on-chain reputation. Trust compounds.", icon: "🛡️" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-4 rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <span className="text-2xl">{s.icon}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-[var(--accent)] font-mono">STEP {s.step}</span>
                      <h3 className="text-sm font-bold">{s.title}</h3>
                    </div>
                    <p className="text-[12px] text-[var(--muted)]">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Trust Layer ── */}
        <section className="px-6 py-16 border-t border-[var(--card-border)]">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl font-bold">Built on Maiat Protocol</h2>
            <p className="text-sm text-[var(--muted)] max-w-xl mx-auto">
              The Dojo is the skill layer for AI agents — powered by Maiat Protocol.
              Every Shell is trust-verified. Every equip is on-chain. Reputation compounds.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 pt-4">
              <div className="rounded-xl p-5 text-center flex-1 max-w-xs" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <p className="text-xs font-bold">Publish Shell</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">Package a capability</p>
              </div>
              <span className="text-[var(--accent)] text-xl">→</span>
              <div className="rounded-xl p-5 text-center flex-1 max-w-xs border-2" style={{ borderColor: "var(--accent)", background: "rgba(196,255,60,0.03)" }}>
                <p className="text-xs font-bold text-[var(--accent)]">The Dojo</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">Trust-verify, list, equip</p>
              </div>
              <span className="text-[var(--accent)] text-xl">→</span>
              <div className="rounded-xl p-5 text-center flex-1 max-w-xs" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <p className="text-xs font-bold">Powered by Maiat</p>
                <p className="text-[10px] text-[var(--muted)] mt-1">On-chain reputation</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="px-6 py-20 border-t border-[var(--card-border)]">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Your agent is one Shell away.</h2>
            <p className="text-sm text-[var(--muted)]">
              Missing a capability? Equip a Shell. Built something great? Publish it. One agent. Any skill. Trusted.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link href="/onboard"
                className="px-8 py-4 rounded-lg font-semibold text-sm bg-[var(--accent)] text-black hover:opacity-90 transition-opacity">
                Get Started →
              </Link>
              <Link href="/browse"
                className="px-8 py-4 rounded-lg font-semibold text-sm border border-[var(--card-border)] hover:border-white/20 transition-colors">
                Browse Shells
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-[var(--card-border)] px-6 py-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between text-[10px] text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <span>◉</span>
              <span>The Dojo — The skill layer for AI agents. Powered by Maiat Protocol</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://x.com/0xmaiat" target="_blank" rel="noopener" className="hover:text-white transition-colors">@0xmaiat</a>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
