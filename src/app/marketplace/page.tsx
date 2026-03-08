"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MainNav from "@/components/MainNav";
import { type AssessmentDomain, type Availability, mockMarketplaceAgents } from "@/lib/mock-data";

const DOMAIN_OPTIONS: Array<{ id: "all" | AssessmentDomain; label: string }> = [
  { id: "all", label: "All Domains" },
  { id: "coding", label: "Coding" },
  { id: "writing", label: "Writing" },
  { id: "research", label: "Research" },
  { id: "ops", label: "Ops" },
  { id: "analysis", label: "Analysis" },
];

const AVAILABILITY_OPTIONS: Array<{ id: "all" | Availability; label: string }> = [
  { id: "all", label: "Any Availability" },
  { id: "available", label: "Available" },
  { id: "busy", label: "Busy" },
  { id: "offline", label: "Offline" },
];

export default function MarketplacePage() {
  const [domain, setDomain] = useState<"all" | AssessmentDomain>("all");
  const [minScore, setMinScore] = useState(0);
  const [availability, setAvailability] = useState<"all" | Availability>("all");
  const [maxPrice, setMaxPrice] = useState(200);
  const [sortBy, setSortBy] = useState<"score" | "trust" | "price" | "jobs">("score");

  const filtered = useMemo(() => {
    return mockMarketplaceAgents
      .filter((agent) => {
        if (availability !== "all" && agent.availability !== availability) return false;
        if (agent.hourlyRate > maxPrice) return false;
        if (agent.skillProfile.overallScore < minScore) return false;
        if (domain !== "all") {
          const domainCap = agent.skillProfile.capabilities.find((item) => item.domain === domain);
          if (!domainCap) return false;
          if (domainCap.score < minScore) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "score") return b.skillProfile.overallScore - a.skillProfile.overallScore;
        if (sortBy === "trust") return b.trustScore - a.trustScore;
        if (sortBy === "price") return a.hourlyRate - b.hourlyRate;
        return b.jobsCompleted - a.jobsCompleted;
      });
  }, [availability, domain, maxPrice, minScore, sortBy]);

  return (
    <div className="min-h-screen">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl mb-2">Agent Marketplace</h1>
          <p className="text-sm text-[var(--muted)]">Hire by verified capability profile, not self-reported claims.</p>
        </header>

        <section className="grid md:grid-cols-5 gap-3 mb-6">
          <select value={domain} onChange={(e) => setDomain(e.target.value as "all" | AssessmentDomain)} className="px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] text-xs font-mono">
            {DOMAIN_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>

          <select value={availability} onChange={(e) => setAvailability(e.target.value as "all" | Availability)} className="px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] text-xs font-mono">
            {AVAILABILITY_OPTIONS.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>

          <label className="px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] text-xs font-mono flex items-center justify-between gap-2">
            <span className="text-[var(--muted)]">Min Score</span>
            <input type="number" min={0} max={100} value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-14 bg-transparent text-right focus:outline-none" />
          </label>

          <label className="px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] text-xs font-mono flex items-center justify-between gap-2">
            <span className="text-[var(--muted)]">Max $/hr</span>
            <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-16 bg-transparent text-right focus:outline-none" />
          </label>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "score" | "trust" | "price" | "jobs")} className="px-3 py-2 bg-[var(--card)] border border-[var(--card-border)] text-xs font-mono">
            <option value="score">Sort: Score</option>
            <option value="trust">Sort: Trust</option>
            <option value="price">Sort: Price</option>
            <option value="jobs">Sort: Jobs</option>
          </select>
        </section>

        <p className="text-[10px] uppercase tracking-wider font-mono text-[var(--muted)] mb-4">{filtered.length} agents</p>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((agent) => {
            const topSkills = [...agent.skillProfile.capabilities]
              .sort((a, b) => b.score - a.score)
              .slice(0, 3);
            const strongest = topSkills[0]?.score ?? 0;
            const leftGlowAlpha = (0.15 + strongest / 180).toFixed(2);

            return (
              <article
                key={agent.id}
                className="p-5 bg-[var(--card)] border border-[var(--card-border)] card-hover"
                style={{
                  borderLeftColor: `rgba(196,255,60,${leftGlowAlpha})`,
                  borderLeftWidth: "2px",
                  backgroundImage: `linear-gradient(90deg, rgba(196,255,60,${leftGlowAlpha}) 0%, rgba(196,255,60,0) 18%), linear-gradient(var(--card), var(--card))`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base">{agent.name}</h2>
                    <p className="text-[10px] font-mono text-[var(--muted)]">{agent.model}</p>
                  </div>
                  <span className="text-xl">{agent.avatar}</span>
                </div>

                <div className="space-y-2 mb-4">
                  {topSkills.map((skill) => (
                    <div key={skill.domain}>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="uppercase text-[var(--muted)]">{skill.domain}</span>
                        <span className="text-[var(--accent)]">{skill.score}</span>
                      </div>
                      <div className="h-1 bg-black">
                        <div className="h-full bg-[var(--accent)] fill-animate" style={{ width: `${skill.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  <div className="p-2 border border-[var(--card-border)]">
                    <div className="relative inline-flex items-center justify-center px-2">
                      <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(196,255,60,0.24)_0%,rgba(196,255,60,0)_70%)] blur-sm" />
                      <span className="relative text-sm text-[var(--accent)] glow-accent">{agent.skillProfile.overallScore}</span>
                    </div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Overall</div>
                  </div>
                  <div className="p-2 border border-[var(--card-border)]">
                    <div className="text-sm text-[var(--accent)]">{agent.trustScore}</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Maiat Trust</div>
                  </div>
                  <div className="p-2 border border-[var(--card-border)]">
                    <div className="text-sm text-[var(--accent)]">${agent.hourlyRate}/hr</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Rate</div>
                  </div>
                  <div className="p-2 border border-[var(--card-border)]">
                    <div className="text-sm text-[var(--accent)]">{agent.jobsCompleted}</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Jobs</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-[10px] font-mono">
                  <span className="text-[var(--muted)] uppercase">Availability</span>
                  <span className="uppercase text-[var(--accent)] inline-flex items-center gap-1.5">
                    {agent.availability === "available" ? <span className="pulse-dot" /> : null}
                    {agent.availability}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/profile/${agent.id}`} className="flex-1 text-center py-2 border border-[var(--accent)] text-xs font-mono text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors">
                    View Profile
                  </Link>
                  <button className="flex-1 py-2 bg-[var(--accent)] text-black text-xs font-semibold">Hire</button>
                </div>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
