"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function renderStars(count: number): string {
  return "★".repeat(count);
}

interface AgentData {
  agent_id: string;
  name: string;
  description: string;
  model: string;
  github_data?: Record<string, unknown>;
  skills_detected: string[];
  fraud_flags: string[];
  is_suspicious: boolean;
  created_at: string;
}

interface CapData {
  name: string;
  emoji: string;
  stars: number;
  evidence: string;
  train_suggestion: string;
  color: string;
}

interface AttestationData {
  platform: string;
  attestation_type: string;
  summary: string;
  verified: boolean;
}

interface WorkEntryData {
  entry_type: string;
  domain: string;
  complexity: string;
  outcome: string;
  tools_used: string[];
  hash: string;
}

export default function AgentProfilePage() {
  const params = useParams();
  const agentName = decodeURIComponent((params.name as string) || "");
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [capabilities, setCapabilities] = useState<CapData[]>([]);
  const [attestations, setAttestations] = useState<AttestationData[]>([]);
  const [workEntries, setWorkEntries] = useState<WorkEntryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Search by name (case-insensitive via ilike)
      const { data: agents } = await supabase
        .from("agents")
        .select("*")
        .ilike("name", agentName)
        .limit(1);

      if (!agents || agents.length === 0) { setLoading(false); return; }
      const ag = agents[0];
      setAgent(ag);

      // Fetch capabilities, attestations, work entries in parallel
      const [capsRes, attestRes, workRes] = await Promise.all([
        supabase.from("capabilities").select("*").eq("agent_id", ag.agent_id).order("stars", { ascending: false }),
        supabase.from("attestations").select("*").eq("agent_id", ag.agent_id),
        supabase.from("work_entries").select("*").eq("agent_id", ag.agent_id).order("created_at", { ascending: false }),
      ]);

      setCapabilities(capsRes.data ?? []);
      setAttestations(attestRes.data ?? []);
      setWorkEntries(workRes.data ?? []);
      setLoading(false);
    }
    if (agentName) load();
  }, [agentName]);

  const totalStars = capabilities.reduce((s, c) => s + c.stars, 0);

  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          {loading && <p className="text-center text-[var(--muted)] py-20 animate-pulse">Loading portfolio...</p>}

          {!loading && !agent && (
            <div className="text-center py-20 space-y-4">
              <p className="text-4xl">🔍</p>
              <h1 className="text-xl font-bold">Agent &quot;{agentName}&quot; Not Found</h1>
              <p className="text-sm text-[var(--muted)]">This agent hasn&apos;t been evaluated yet.</p>
              <Link href="/onboard" className="inline-block px-6 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-black">
                Evaluate an Agent →
              </Link>
            </div>
          )}

          {agent && !loading && (
            <>
              {/* Header */}
              <div className="rounded-xl p-6" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl bg-[rgba(196,255,60,0.1)] border border-[rgba(196,255,60,0.2)]">🤖</div>
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

              {/* Layer 1: Attestations */}
              {attestations.length > 0 && (
                <div className="rounded-xl p-6 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">🔒 Platform Attestations</h2>
                  <div className="space-y-2">
                    {attestations.map((a, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <span className="text-green-400 text-xs">{a.verified ? "✓" : "○"}</span>
                        <div className="flex-1">
                          <p className="text-xs">{a.summary}</p>
                          <p className="text-[10px] text-[var(--muted)]">{a.platform} · {a.attestation_type.replace(/_/g, " ")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer 2: Work Entries */}
              {workEntries.length > 0 && (
                <div className="rounded-xl p-6 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">📝 Verified Work Entries</h2>
                    <span className="text-[10px] text-[var(--muted)]">{workEntries.length} entries</span>
                  </div>
                  <div className="space-y-1">
                    {workEntries.map((w, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg text-xs" style={{ background: "rgba(255,255,255,0.02)" }}>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-[var(--accent)]">▸</span>
                          <span>{w.entry_type.replace(/_/g, " ")}</span>
                          <span className="text-[10px] text-[var(--muted)]">· {w.domain} · {w.complexity}</span>
                          {w.tools_used.length > 0 && (
                            <span className="text-[10px] text-[var(--muted)]">· {w.tools_used.join(", ")}</span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-[var(--muted)] shrink-0">{w.hash?.slice(0, 10)}...</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Layer 3: Capabilities */}
              <div className="rounded-xl p-6 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">⭐ Capabilities</h2>
                  <span className="text-[10px] text-[var(--muted)]">★ = verified evidence</span>
                </div>
                {capabilities.map((cap) => (
                  <div key={cap.name} className="rounded-lg px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{cap.emoji}</span>
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

              {/* Skills + Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agent.skills_detected?.length > 0 && (
                  <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Skills</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {agent.skills_detected.map((s) => (
                        <span key={s} className="text-[10px] px-2 py-0.5 rounded font-mono"
                          style={{ background: "rgba(196,255,60,0.08)", color: "var(--accent)", border: "1px solid rgba(196,255,60,0.15)" }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">Status</h2>
                  <div className="flex flex-wrap gap-2">
                    {!agent.is_suspicious && <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">✓ Verified</span>}
                    {attestations.length > 0 && <span className="text-[10px] px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/20">✓ {attestations.length} attestations</span>}
                    {capabilities.filter(c => c.stars >= 5).length > 0 && <span className="text-[10px] px-2 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">🎓 Can teach {capabilities.filter(c => c.stars >= 5).length} skills</span>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
