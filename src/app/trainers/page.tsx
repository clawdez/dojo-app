"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import MainNav from "@/components/MainNav";
import { type TrainingDomain, mockTrainerAgents } from "@/lib/mock-data";

const DOMAIN_OPTIONS: Array<{ id: "all" | TrainingDomain; label: string }> = [
  { id: "all", label: "All Domains" },
  { id: "coding", label: "Coding" },
  { id: "research", label: "Research" },
  { id: "ops", label: "Ops" },
  { id: "writing", label: "Writing" },
  { id: "security", label: "Security" },
];

export default function TrainersPage() {
  const [domain, setDomain] = useState<"all" | TrainingDomain>("all");

  const filtered = useMemo(() => {
    return mockTrainerAgents.filter((trainer) => {
      if (domain === "all") return true;
      return trainer.skills.some((skill) => skill.domain === domain);
    });
  }, [domain]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl mb-2">Trainer Agents</h1>
          <p className="text-sm text-[var(--muted)]">Book sessions to transfer practical workflows, tools, and skills.</p>
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
          {DOMAIN_OPTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setDomain(item.id)}
              className={`px-3 py-1.5 border text-xs font-mono transition-colors ${
                domain === item.id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-[var(--card-border)] text-[var(--muted)] hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trainer) => (
            <article key={trainer.id} className="p-5 bg-[var(--card)] border border-[var(--card-border)] card-hover glow-accent">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base">{trainer.name}</h2>
                  <p className="text-[10px] font-mono text-[var(--muted)]">{trainer.model}</p>
                </div>
                <span className="text-2xl">{trainer.avatar}</span>
              </div>

              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-2">Skills They Teach</div>
                <div className="flex flex-wrap gap-1.5">
                  {trainer.skills.map((skill) => (
                    <span key={`${trainer.id}-${skill.subdomain}`} className="px-2 py-1 text-[10px] border border-[var(--card-border)] bg-black/30 text-[var(--muted)] uppercase">
                      {skill.subdomain}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                <div className="p-2 border border-[var(--card-border)]">
                  <div className="text-sm text-[var(--accent)]">{trainer.sessionsCompleted}</div>
                  <div className="text-[9px] text-[var(--muted)] uppercase">Sessions</div>
                </div>
                <div className="p-2 border border-[var(--card-border)]">
                  <div className="text-sm text-[var(--accent)]">{trainer.agentsTrained}</div>
                  <div className="text-[9px] text-[var(--muted)] uppercase">Agents Trained</div>
                </div>
                <div className="p-2 border border-[var(--card-border)]">
                  <div className="text-sm text-[var(--accent)]">{trainer.avgRating.toFixed(1)}★</div>
                  <div className="text-[9px] text-[var(--muted)] uppercase">Rating</div>
                </div>
                <div className="p-2 border border-[var(--card-border)]">
                  <div className="text-sm text-[var(--accent)]">${trainer.pricePerSession}</div>
                  <div className="text-[9px] text-[var(--muted)] uppercase">Per Session</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 text-[10px] font-mono">
                <span className="text-[var(--muted)] uppercase">Availability</span>
                <span className="uppercase text-[var(--accent)] inline-flex items-center gap-1.5">
                  {trainer.availability === "available" ? <span className="pulse-dot" /> : null}
                  {trainer.availability}
                </span>
              </div>

              <div className="flex gap-2">
                <Link href={`/trainers/${trainer.id}`} className="flex-1 text-center py-2 border border-[var(--accent)] text-xs font-mono text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors">
                  View Profile
                </Link>
                <button className="flex-1 py-2 bg-[var(--accent)] text-black text-xs font-semibold">Book Session</button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
