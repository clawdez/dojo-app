"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase Client (client-side, read-only) ───────────────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types ───────────────────────────────────────────────────────────────────

interface AgentData {
  agent_id: string;
  name: string;
  description: string;
  model: string;
  github_url?: string;
  github_data?: {
    repos?: number;
    total_stars?: number;
    total_forks?: number;
    languages?: string[];
    top_repos?: { name: string; stars: number; language: string; description: string }[];
    account_age_days?: number;
    commit_activity_signal?: string;
  };
  skills_detected: string[];
  fraud_flags: string[];
  is_suspicious: boolean;
  passport_eligible: boolean;
  passport_created: boolean;
  created_at: string;
}

interface CapabilityData {
  name: string;
  emoji: string;
  stars: number;
  evidence: string;
  train_suggestion: string;
  color: string;
}

function renderStars(count: number): string {
  return "★".repeat(count);
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [capabilities, setCapabilities] = useState<CapabilityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadAgent() {
      // Get agent_id from localStorage (set during evaluation)
      const agentId = typeof window !== "undefined" ? localStorage.getItem("dojo_agent_id") : null;
      if (!agentId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch agent
        const { data: agentData, error: agentErr } = await supabase
          .from("agents")
          .select("*")
          .eq("agent_id", agentId)
          .single();

        if (agentErr || !agentData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setAgent(agentData);

        // Fetch capabilities
        const { data: capsData } = await supabase
          .from("capabilities")
          .select("*")
          .eq("agent_id", agentId)
          .order("stars", { ascending: false });

        setCapabilities(capsData ?? []);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    loadAgent();
  }, []);

  const totalStars = capabilities.reduce((sum, c) => sum + c.stars, 0);
  const gh = agent?.github_data;

  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Loading */}
          {loading && (
            <div className="text-center py-20">
              <p className="text-[var(--muted)] animate-pulse">Loading portfolio...</p>
            </div>
          )}

          {/* Not Found */}
          {notFound && !loading && (
            <div className="text-center py-20 space-y-4">
              <p className="text-4xl">🔍</p>
              <h1 className="text-xl font-bold">No Portfolio Found</h1>
              <p className="text-sm text-[var(--muted)]">
                You haven&apos;t evaluated an agent yet. Build your portfolio first.
              </p>
              <Link
                href="/onboard"
                className="inline-block px-6 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-black hover:opacity-90 transition-opacity"
              >
                Build Portfolio →
              </Link>
            </div>
          )}

          {/* Dashboard */}
          {agent && !loading && (
            <>
              {/* Agent Header */}
              <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-[rgba(196,255,60,0.1)] border border-[rgba(196,255,60,0.2)]">
                    🤖
                  </div>
                  <div className="flex-1">
                    <h1 className="text-xl font-bold">{agent.name}</h1>
                    <p className="text-[10px] text-[var(--muted)]">{agent.model} · Evaluated {new Date(agent.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-[var(--accent)]">{totalStars}</p>
                    <p className="text-[10px] text-[var(--muted)]">Total ★</p>
                  </div>
                </div>
                <p className="text-xs text-[var(--muted)] mt-3">{agent.description}</p>
              </div>

              {/* Stats Bar */}
              <div className="rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div>
                  <p className="text-lg font-bold text-[var(--accent)]">{capabilities.length}</p>
                  <p className="text-[10px] text-[var(--muted)]">Capabilities</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--accent)]">{totalStars}</p>
                  <p className="text-[10px] text-[var(--muted)]">Total Stars</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--accent)]">{gh?.repos ?? 0}</p>
                  <p className="text-[10px] text-[var(--muted)]">Repos</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[var(--accent)]">{(gh?.total_stars ?? 0).toLocaleString()}</p>
                  <p className="text-[10px] text-[var(--muted)]">GitHub Stars</p>
                </div>
              </div>

              {/* Capabilities */}
              <div className="rounded-xl p-6 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Capabilities</h2>
                  <p className="text-[10px] text-[var(--muted)]">★ = verified evidence</p>
                </div>
                {capabilities.length === 0 ? (
                  <p className="text-sm text-[var(--muted)] text-center py-4">No capabilities recorded yet</p>
                ) : (
                  <div className="space-y-1">
                    {capabilities.map((cap) => (
                      <div key={cap.name} className="rounded-lg px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{cap.emoji}</span>
                            <span className="text-sm font-medium">{cap.name}</span>
                          </div>
                          <span className="text-sm tracking-wider" style={{ color: cap.color }}>{renderStars(cap.stars)}</span>
                        </div>
                        <div className="flex items-center justify-between ml-7">
                          <p className="text-[11px] text-[var(--muted)] italic">{cap.evidence}</p>
                          <Link href="/train" className="text-[11px] hover:underline" style={{ color: cap.color }}>
                            → Train: {cap.train_suggestion}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Skills Detected */}
              {agent.skills_detected && agent.skills_detected.length > 0 && (
                <div className="rounded-xl p-6 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Skills Detected</h2>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.skills_detected.map((skill) => (
                      <span key={skill} className="text-[10px] px-2 py-0.5 rounded font-mono"
                        style={{ background: "rgba(196,255,60,0.08)", color: "var(--accent)", border: "1px solid rgba(196,255,60,0.15)" }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className="rounded-xl p-6 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Verification</h2>
                <div className="flex flex-wrap gap-2">
                  {gh && (gh.repos ?? 0) > 0 && (
                    <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">✓ GitHub Verified</span>
                  )}
                  {agent.passport_created && (
                    <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">✓ Maiat Passport</span>
                  )}
                  {!agent.is_suspicious && (
                    <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">✓ No fraud flags</span>
                  )}
                  {(gh?.account_age_days ?? 0) > 365 && (
                    <span className="text-[10px] px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">🕐 {Math.floor((gh?.account_age_days ?? 0) / 365)}+ year history</span>
                  )}
                  {capabilities.filter(c => c.stars >= 5).length > 0 && (
                    <span className="text-[10px] px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">🎓 Eligible to teach ({capabilities.filter(c => c.stars >= 5).length} skills)</span>
                  )}
                </div>
                {agent.fraud_flags && agent.fraud_flags.length > 0 && (
                  <div className="mt-2">
                    {agent.fraud_flags.map((flag, i) => (
                      <p key={i} className="text-[10px] text-yellow-400/70">⚡ {flag.replace(/_/g, " ")}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/train" className="rounded-xl p-5 text-center hover:border-white/20 transition-colors"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <span className="text-2xl">📈</span>
                  <p className="text-xs font-medium mt-2">Earn More Stars</p>
                  <p className="text-[10px] text-[var(--muted)]">Train with expert agents</p>
                </Link>
                <Link href="/onboard" className="rounded-xl p-5 text-center hover:border-white/20 transition-colors"
                  style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <span className="text-2xl">🔄</span>
                  <p className="text-xs font-medium mt-2">Re-evaluate</p>
                  <p className="text-[10px] text-[var(--muted)]">Update your portfolio</p>
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
