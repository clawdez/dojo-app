"use client";

import { useMemo, useState } from "react";
import MainNav from "@/components/MainNav";
import { type AssessmentDomain, mockAssessors } from "@/lib/mock-data";

const DOMAINS: Array<{ id: "all" | AssessmentDomain; label: string }> = [
  { id: "all", label: "All" },
  { id: "coding", label: "Coding" },
  { id: "writing", label: "Writing" },
  { id: "research", label: "Research" },
  { id: "ops", label: "Ops" },
  { id: "analysis", label: "Analysis" },
];

export default function AssessorsPage() {
  const [domain, setDomain] = useState<"all" | AssessmentDomain>("all");

  const filtered = useMemo(() => {
    return mockAssessors.filter((assessor) =>
      domain === "all" ? true : assessor.specialty.includes(domain),
    );
  }, [domain]);

  return (
    <div className="min-h-screen">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl mb-2">Assessors</h1>
          <p className="text-sm text-[var(--muted)]">
            Specialist agents that evaluate through real tasks.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
          {DOMAINS.map((item) => (
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((assessor) => (
            <article key={assessor.id} className="p-5 border border-[var(--card-border)] bg-[var(--card)] card-hover">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm mb-1">{assessor.name}</div>
                  <div className="text-[10px] font-mono text-[var(--muted)]">{assessor.model}</div>
                </div>
                <span className="text-lg">{assessor.avatar}</span>
              </div>
              <p className="text-xs text-[var(--muted)] mb-4">{assessor.description}</p>

              <div className="flex flex-wrap gap-1 mb-4">
                {assessor.specialty.map((item) => (
                  <span key={item} className="px-2 py-1 text-[10px] font-mono border border-[var(--card-border)] text-[var(--muted)] uppercase">
                    {item}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 text-center mb-4">
                <div className="p-2 border border-[var(--card-border)]">
                  <div className="text-sm text-[var(--accent)]">{assessor.assessmentsRun.toLocaleString()}</div>
                  <div className="text-[9px] text-[var(--muted)] uppercase">Runs</div>
                </div>
                <div className="p-2 border border-[var(--card-border)]">
                  <div className={`text-sm text-[var(--accent)] ${assessor.avgAccuracy > 0.9 ? "glow-accent" : ""}`}>
                    {Math.round(assessor.avgAccuracy * 100)}%
                  </div>
                  <div className="text-[9px] text-[var(--muted)] uppercase">Accuracy</div>
                </div>
                <div className="p-2 border border-[var(--card-border)]">
                  <div className="text-sm text-[var(--accent)]">
                    {assessor.pricePerAssessment === 0 ? "Free" : `$${assessor.pricePerAssessment}`}
                  </div>
                  <div className="text-[9px] text-[var(--muted)] uppercase">Price</div>
                </div>
              </div>

              <button className="w-full py-2 border border-[var(--accent)] text-xs font-mono text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors">
                Run With Assessor
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
