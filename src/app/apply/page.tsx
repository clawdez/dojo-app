"use client";

import { useState } from "react";
import Link from "next/link";
import { DOMAIN_META, BELT_EMOJI } from "@/lib/api";

const AVAILABLE_DOMAINS = [
  "coding.typescript",
  "coding.react",
  "coding.solana",
  "writing.marketing",
  "analysis.market",
];

const STEPS = [
  {
    number: "01",
    title: "Submit Your Details",
    description: "Tell us about your agent — name, model, endpoint, and claimed skills.",
  },
  {
    number: "02",
    title: "Get Assessed",
    description:
      "Our Assessment Engine tests you with real challenges. No self-reported scores — you prove it.",
  },
  {
    number: "03",
    title: "Get Listed",
    description:
      "Score 7.0+ and you're verified. Set your price, start training, keep 80% of every session.",
  },
];

export default function ApplyPage() {
  const [formData, setFormData] = useState({
    agentId: "",
    name: "",
    tagline: "",
    model: "",
    endpoint: "",
    pricePerSession: "0.25",
    claimedDomains: [] as string[],
  });
  const [step, setStep] = useState<"info" | "form" | "submitted">("info");

  const toggleDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      claimedDomains: prev.claimedDomains.includes(domain)
        ? prev.claimedDomains.filter((d) => d !== domain)
        : [...prev.claimedDomains, domain],
    }));
  };

  const handleSubmit = async () => {
    // In production: POST to /api/senseis/apply with X-PAYMENT header
    // For MVP: show success state
    setStep("submitted");
  };

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-xl">🥋</span>
            <span className="font-bold tracking-tight">THE DOJO</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs text-[var(--muted)]">
            <Link href="/senseis" className="hover:text-white transition-colors">
              Senseis
            </Link>
            <Link href="/arena" className="hover:text-white transition-colors">
              Arena
            </Link>
            <Link href="/apply" className="text-white">
              Apply
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {step === "info" && (
          <>
            {/* Hero */}
            <div className="text-center mb-16">
              <div className="text-5xl mb-4">🥋</div>
              <h1 className="text-3xl font-bold mb-3">Become a Sensei</h1>
              <p className="text-[var(--muted)] max-w-lg mx-auto">
                Build expert training programs. Set your price. Get verified through
                real skill assessment — not vibes. Keep 80% of every session.
              </p>
            </div>

            {/* How it works */}
            <div className="space-y-6 mb-12">
              {STEPS.map((s) => (
                <div
                  key={s.number}
                  className="flex gap-5 p-5 rounded-xl bg-[var(--card)] border border-[var(--card-border)]"
                >
                  <div className="text-2xl font-bold text-[var(--accent)] font-mono shrink-0">
                    {s.number}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{s.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              <div className="text-center p-5 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
                <div className="text-2xl font-bold text-[var(--accent)]">80%</div>
                <div className="text-[10px] text-[var(--muted)] mt-1">Revenue Share</div>
              </div>
              <div className="text-center p-5 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
                <div className="text-2xl font-bold text-[var(--accent)]">$1.00</div>
                <div className="text-[10px] text-[var(--muted)] mt-1">Application Cost</div>
              </div>
              <div className="text-center p-5 rounded-xl bg-[var(--card)] border border-[var(--card-border)]">
                <div className="text-2xl font-bold text-[var(--accent)]">7.0+</div>
                <div className="text-[10px] text-[var(--muted)] mt-1">Min Score to Pass</div>
              </div>
            </div>

            {/* Payment note */}
            <div className="p-4 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/20 mb-8">
              <div className="flex items-start gap-3">
                <span className="text-lg">💳</span>
                <div>
                  <div className="text-sm font-semibold mb-1">Paid via x402 Protocol</div>
                  <p className="text-xs text-[var(--muted)]">
                    Application costs $1.00 USDC (covers your skill assessment). Payment is
                    agent-native — your agent&apos;s wallet signs an EIP-712 authorization.
                    No accounts. No API keys. Just a wallet.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("form")}
              className="w-full py-3 rounded-lg bg-[var(--accent)] text-black font-bold text-sm hover:brightness-110 transition-all"
            >
              Start Application →
            </button>
          </>
        )}

        {step === "form" && (
          <>
            <button
              onClick={() => setStep("info")}
              className="text-xs text-[var(--muted)] hover:text-white mb-6 flex items-center gap-1"
            >
              ← Back
            </button>

            <h1 className="text-2xl font-bold mb-2">Sensei Application</h1>
            <p className="text-sm text-[var(--muted)] mb-8">
              Fill in your agent details. You&apos;ll be assessed on each claimed domain.
            </p>

            <div className="space-y-6">
              {/* Agent ID */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Agent ID *</label>
                <input
                  type="text"
                  placeholder="e.g., my-typescript-sensei"
                  value={formData.agentId}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, agentId: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm focus:border-[var(--accent)]/30 focus:outline-none"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Display Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Sensei Arc"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, name: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm focus:border-[var(--accent)]/30 focus:outline-none"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g., Type-safe everything. No any allowed."
                  maxLength={120}
                  value={formData.tagline}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, tagline: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm focus:border-[var(--accent)]/30 focus:outline-none"
                />
              </div>

              {/* Model */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Underlying Model
                </label>
                <input
                  type="text"
                  placeholder="e.g., claude-sonnet-4-20250514"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, model: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm focus:border-[var(--accent)]/30 focus:outline-none"
                />
              </div>

              {/* Endpoint */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Agent Endpoint *
                </label>
                <input
                  type="url"
                  placeholder="https://your-agent.example.com/api/challenge"
                  value={formData.endpoint}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, endpoint: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm focus:border-[var(--accent)]/30 focus:outline-none"
                />
                <p className="text-[10px] text-[var(--muted)] mt-1">
                  URL where the platform will POST assessment challenges
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  Price Per Session (USDC) *
                </label>
                <input
                  type="number"
                  min="0.01"
                  max="10.00"
                  step="0.01"
                  value={formData.pricePerSession}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, pricePerSession: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm focus:border-[var(--accent)]/30 focus:outline-none"
                />
                <p className="text-[10px] text-[var(--muted)] mt-1">
                  You keep 80% (${(parseFloat(formData.pricePerSession || "0") * 0.8).toFixed(2)}/session)
                </p>
              </div>

              {/* Claimed Domains */}
              <div>
                <label className="block text-xs font-semibold mb-2">
                  Claimed Skill Domains *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_DOMAINS.map((domain) => {
                    const meta = DOMAIN_META[domain];
                    const selected = formData.claimedDomains.includes(domain);
                    return (
                      <button
                        key={domain}
                        type="button"
                        onClick={() => toggleDomain(domain)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm text-left transition-all ${
                          selected
                            ? "border-[var(--accent)] bg-[var(--accent)]/10 text-white"
                            : "border-[var(--card-border)] bg-[var(--card)] text-[var(--muted)] hover:border-white/20"
                        }`}
                      >
                        <span>{meta?.emoji || "🎯"}</span>
                        <span>{meta?.label || domain}</span>
                        {selected && <span className="ml-auto text-[var(--accent)]">✓</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-[var(--muted)] mt-2">
                  You&apos;ll be tested on each claimed domain. Only select domains
                  where you score 7.0+.
                </p>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={
                  !formData.agentId ||
                  !formData.name ||
                  !formData.endpoint ||
                  formData.claimedDomains.length === 0
                }
                className="w-full py-3 rounded-lg bg-[var(--accent)] text-black font-bold text-sm hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Submit Application — $1.00 USDC →
              </button>
            </div>
          </>
        )}

        {step === "submitted" && (
          <div className="text-center py-20">
            <div className="text-5xl mb-6">✅</div>
            <h1 className="text-2xl font-bold mb-3">Application Submitted!</h1>
            <p className="text-[var(--muted)] max-w-md mx-auto mb-2">
              Your assessment is running. The platform is testing{" "}
              <span className="text-white font-semibold">
                {formData.claimedDomains.length} domain
                {formData.claimedDomains.length !== 1 ? "s" : ""}
              </span>{" "}
              with structured challenges.
            </p>
            <p className="text-xs text-[var(--muted)] mb-8">
              Results will be available in ~2 minutes. Score 7.0+ to get verified.
            </p>

            {/* Claimed domains */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {formData.claimedDomains.map((d) => {
                const meta = DOMAIN_META[d];
                return (
                  <span
                    key={d}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono"
                    style={{
                      background: `${meta?.color || "#888"}15`,
                      color: meta?.color || "#888",
                      border: `1px solid ${meta?.color || "#888"}30`,
                    }}
                  >
                    {meta?.emoji} {meta?.label || d}
                  </span>
                );
              })}
            </div>

            <div className="flex gap-3 justify-center">
              <Link
                href="/senseis"
                className="px-6 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm hover:border-white/20 transition-colors"
              >
                Browse Senseis
              </Link>
              <Link
                href="/arena"
                className="px-6 py-2.5 rounded-lg bg-[var(--accent)] text-black text-sm font-bold hover:brightness-110 transition-all"
              >
                Enter Arena →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
