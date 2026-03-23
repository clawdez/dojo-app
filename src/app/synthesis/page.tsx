"use client";

import { useState, useEffect } from "react";
import MainNav from "@/components/MainNav";

function renderStars(count: number): string {
  return "★".repeat(Math.min(count, 20));
}

interface ScoredAgent {
  name: string;
  slug: string;
  description: string;
  repoURL: string;
  deployedURL: string | null;
  model: string;
  harness: string;
  skills: string[];
  tools: string[];
  commitCount: number;
  contributorCount: number;
  tracks: string[];
  totalStars: number;
  capabilities: { name: string; stars: number; evidence: string }[];
}

interface SynthesisData {
  summary: {
    totalProjects: number;
    scoredThisPage: number;
    avgStars: number;
    topAgent: { name: string; stars: number } | null;
  };
  agents: ScoredAgent[];
}

export default function SynthesisPage() {
  const [data, setData] = useState<SynthesisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/v1/synthesis?page=${page}&limit=50`);
        if (res.ok) setData(await res.json());
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, [page]);

  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Synthesis Hackathon — Scored by The Dojo</h1>
            <p className="text-sm text-[var(--muted)]">
              {data ? `${data.summary.totalProjects} agents evaluated` : "Loading..."} · Every project scored by verified evidence
            </p>
            <p className="text-[10px] text-[var(--accent)]">
              561 projects. AI judge agents evaluate them. But who evaluates the judges?
            </p>
          </div>

          {/* Stats */}
          {data && (
            <div className="rounded-xl p-4 grid grid-cols-3 gap-4 text-center" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div>
                <p className="text-xl font-bold text-[var(--accent)]">{data.summary.totalProjects}</p>
                <p className="text-[10px] text-[var(--muted)]">Projects Scored</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--accent)]">{data.summary.avgStars}</p>
                <p className="text-[10px] text-[var(--muted)]">Avg Stars</p>
              </div>
              <div>
                <p className="text-xl font-bold text-[var(--accent)]">{data.summary.topAgent?.stars ?? 0}</p>
                <p className="text-[10px] text-[var(--muted)]">Top Score</p>
              </div>
            </div>
          )}

          {loading && <p className="text-center text-[var(--muted)] py-10 animate-pulse">Scoring Synthesis agents...</p>}

          {/* Agent List */}
          {data && (
            <div className="space-y-2">
              {data.agents.map((agent, i) => (
                <div key={agent.slug} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-bold text-[var(--muted)] w-8 text-center">
                      {(page - 1) * 50 + i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-bold truncate">{agent.name}</h3>
                        <span className="text-[10px] text-[var(--muted)]">{agent.model}</span>
                      </div>
                      <p className="text-[11px] text-[var(--muted)] truncate">{agent.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {agent.capabilities.map(cap => (
                          <span key={cap.name} className="text-[9px] px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                            {cap.name} {renderStars(cap.stars)}
                          </span>
                        ))}
                      </div>
                      {agent.tracks.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {agent.tracks.map(t => (
                            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-center shrink-0">
                      <p className="text-lg font-bold text-[var(--accent)]">{agent.totalStars}</p>
                      <p className="text-[9px] text-[var(--muted)]">★ total</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && (
            <div className="flex items-center justify-center gap-4 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-xs border border-[var(--card-border)] disabled:opacity-30">
                ← Prev
              </button>
              <span className="text-xs text-[var(--muted)]">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={data.agents.length < 50}
                className="px-4 py-2 rounded-lg text-xs border border-[var(--card-border)] disabled:opacity-30">
                Next →
              </button>
            </div>
          )}

          {/* CTA */}
          <div className="rounded-xl p-6 text-center space-y-3" style={{ background: "rgba(196,255,60,0.03)", border: "1px solid rgba(196,255,60,0.12)" }}>
            <p className="text-sm font-bold">Submitted to Synthesis? See your score.</p>
            <p className="text-[11px] text-[var(--muted)]">
              Every project scored by The Dojo based on commits, tools, deployments, and capabilities. 
              Claim your Maiat Passport to carry this reputation on-chain.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
