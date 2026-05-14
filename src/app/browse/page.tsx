"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

function renderStars(count: number): string {
  return "★".repeat(Math.min(count, 15));
}

const CAPABILITY_FILTERS = [
  "All",
  "Smart Contracts",
  "Software Development",
  "Frontend & UI",
  "Backend & Systems",
  "Security & Auditing",
  "DevOps & Deployment",
  "Agent Orchestration",
  "Content & Marketing",
  "Research & Analysis",
  "Open Source",
];

interface AgentWithCaps {
  agent_id: string;
  name: string;
  description: string;
  model: string;
  created_at: string;
  capabilities: { name: string; emoji: string; stars: number; color: string }[];
  totalStars: number;
  topCapability: string;
}

export default function BrowsePage() {
  const [agents, setAgents] = useState<AgentWithCaps[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Fetch all agents
      const { data: agentRows } = await supabase
        .from("agents")
        .select("agent_id, name, description, model, created_at")
        .eq("is_suspicious", false)
        .order("created_at", { ascending: false });

      if (!agentRows) { setLoading(false); return; }

      // Fetch all capabilities
      const agentIds = agentRows.map(a => a.agent_id);
      const { data: capsRows } = await supabase
        .from("capabilities")
        .select("agent_id, name, emoji, stars, color")
        .in("agent_id", agentIds)
        .order("stars", { ascending: false });

      // Merge
      const merged: AgentWithCaps[] = agentRows.map(ag => {
        const caps = (capsRows ?? []).filter(c => c.agent_id === ag.agent_id);
        return {
          ...ag,
          capabilities: caps,
          totalStars: caps.reduce((s, c) => s + c.stars, 0),
          topCapability: caps[0]?.name ?? "General",
        };
      });

      // Sort by total stars
      merged.sort((a, b) => b.totalStars - a.totalStars);
      setAgents(merged);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filter === "All"
    ? agents
    : agents.filter(a => a.capabilities.some(c => c.name === filter)).sort((a, b) => {
        const aStars = a.capabilities.find(c => c.name === filter)?.stars ?? 0;
        const bStars = b.capabilities.find(c => c.name === filter)?.stars ?? 0;
        return bStars - aStars;
      });

  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Browse Shells</h1>
            <p className="text-sm text-[var(--muted)]">
              {agents.length} Shells available · Equip, subscribe, or fork
            </p>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-1.5 justify-center">
            {CAPABILITY_FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="text-[10px] px-3 py-1.5 rounded-full font-mono transition-colors"
                style={{
                  background: filter === f ? "var(--accent)" : "var(--card)",
                  color: filter === f ? "black" : "var(--muted)",
                  border: `1px solid ${filter === f ? "var(--accent)" : "var(--card-border)"}`,
                }}>
                {f}
              </button>
            ))}
          </div>

          {loading && <p className="text-center text-[var(--muted)] py-10 animate-pulse">Loading agents...</p>}

          {/* Agent List */}
          <div className="space-y-3">
            {filtered.map(agent => (
              <Link key={agent.agent_id} href={`/agent/${encodeURIComponent(agent.name)}`}
                className="block rounded-xl p-5 hover:border-white/20 transition-colors"
                style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-[rgba(196,255,60,0.1)] border border-[rgba(196,255,60,0.2)]">🤖</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold truncate">{agent.name}</h3>
                      <span className="text-[10px] text-[var(--muted)]">{agent.model}</span>
                    </div>
                    <p className="text-[11px] text-[var(--muted)] truncate">{agent.description}</p>
                  </div>
                  <div className="text-center shrink-0">
                    <p className="text-lg font-bold text-[var(--accent)]">{agent.totalStars}</p>
                    <p className="text-[9px] text-[var(--muted)]">★ total</p>
                  </div>
                </div>

                {/* Capability chips */}
                <div className="flex flex-wrap gap-1.5 mt-3 ml-14">
                  {agent.capabilities.slice(0, 4).map(cap => (
                    <span key={cap.name} className="text-[10px] px-2 py-0.5 rounded inline-flex items-center gap-1"
                      style={{ background: `${cap.color}12`, color: cap.color, border: `1px solid ${cap.color}25` }}>
                      {cap.emoji} {cap.name} {renderStars(cap.stars)}
                    </span>
                  ))}
                  {agent.capabilities.length > 4 && (
                    <span className="text-[10px] px-2 py-0.5 rounded text-[var(--muted)]">+{agent.capabilities.length - 4} more</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {!loading && filtered.length === 0 && (
            <div className="text-center py-10">
              <p className="text-[var(--muted)]">No agents found{filter !== "All" ? ` with ${filter} capability` : ""}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
