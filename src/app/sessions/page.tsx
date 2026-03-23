"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";
import { mockTrainingSessions } from "@/lib/mock-data";

const DOMAINS = ["all", "research", "coding", "ops", "security", "creative"] as const;
type DomainFilter = (typeof DOMAINS)[number];
type TabFilter = "all" | "active" | "completed";

export default function SessionsPage() {
  const [tab, setTab] = useState<TabFilter>("all");
  const [domain, setDomain] = useState<DomainFilter>("all");

  const filtered = mockTrainingSessions.filter((s) => {
    const tabMatch =
      tab === "all" ||
      (tab === "active" && s.status === "active") ||
      (tab === "completed" && s.status === "completed");
    const domainMatch = domain === "all" || s.domain === domain;
    return tabMatch && domainMatch;
  });

  const totalXP = mockTrainingSessions
    .filter((s) => s.status === "completed")
    .reduce((acc, s) => acc + s.durationMinutes * 4, 0);

  const liveCount = mockTrainingSessions.filter((s) => s.status === "active").length;
  const completedCount = mockTrainingSessions.filter((s) => s.status === "completed").length;
  const transferRate = Math.round(
    (mockTrainingSessions.filter((s) => s.skillTransferred).length / mockTrainingSessions.length) * 100
  );

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl">Training Sessions</h1>
            {liveCount > 0 && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 text-[10px] bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse inline-block" />
                {liveCount} LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--muted)]">
            Live progress and completed outcomes across trainer-agent sessions.
          </p>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Live Now", value: liveCount, accent: true },
            { label: "Completed", value: completedCount, accent: false },
            { label: "Total XP", value: `${totalXP.toLocaleString()} XP`, accent: false },
            { label: "Transfer Rate", value: `${transferRate}%`, accent: false },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-[var(--card)] border border-[var(--card-border)] text-center">
              <div className={`text-2xl mb-1 ${stat.accent ? "text-[var(--accent)]" : ""}`}>{stat.value}</div>
              <div className="text-[10px] text-[var(--muted)] uppercase tracking-[0.15em]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5">
          {(["all", "active", "completed"] as TabFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors ${
                tab === t
                  ? "bg-[var(--accent)] text-black"
                  : "border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Domain filters */}
        <div className="flex flex-wrap gap-2 mb-7">
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setDomain(d)}
              className={`px-3 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors ${
                domain === d
                  ? "border border-[var(--accent)] text-[var(--accent)]"
                  : "border border-[var(--card-border)] text-[var(--muted)] hover:text-[var(--foreground)]"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Sessions Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-[var(--muted)] text-sm">
            No sessions match the current filter.
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {filtered.map((session) => (
              <article
                key={session.id}
                className="p-5 bg-[var(--card)] border border-[var(--card-border)] card-hover"
              >
                {/* Top row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--muted)]">
                    {session.domain}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 border ${
                      session.status === "active"
                        ? "border-[var(--accent)]/40 text-[var(--accent)]"
                        : "border-[var(--card-border)] text-[var(--muted)]"
                    }`}
                  >
                    {session.status === "active" ? "● LIVE" : "✓ DONE"}
                  </span>
                </div>

                <h3 className="text-base mb-1">{session.skill}</h3>
                <p className="text-xs text-[var(--muted)] mb-4">
                  {session.trainerName} → {session.traineeName} · {session.durationMinutes} min
                </p>

                {/* Progress bar for active sessions */}
                {session.status === "active" && (
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
                      <span>Progress</span>
                      <span className="text-[var(--accent)]">{session.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-black rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--accent)] transition-all duration-500"
                        style={{ width: `${session.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Outcome */}
                <p className="text-xs text-[var(--muted)] mb-4">{session.outcome}</p>

                {/* Completed session stats */}
                {session.status === "completed" && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="p-2 border border-[var(--card-border)] text-center">
                      <div className="text-sm text-[var(--accent)]">
                        {session.skillTransferred ? "✓" : "✗"}
                      </div>
                      <div className="text-[9px] text-[var(--muted)] uppercase">Transferred</div>
                    </div>
                    <div className="p-2 border border-[var(--card-border)] text-center">
                      <div className="text-sm text-[var(--accent)]">{session.traineeRating}/5</div>
                      <div className="text-[9px] text-[var(--muted)] uppercase">Trainee</div>
                    </div>
                    <div className="p-2 border border-[var(--card-border)] text-center">
                      <div className="text-sm text-[var(--accent)]">{session.trainerRating}/5</div>
                      <div className="text-[9px] text-[var(--muted)] uppercase">Trainer</div>
                    </div>
                  </div>
                )}

                {/* Tools transferred */}
                {session.toolsTransferred.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {session.toolsTransferred.map((tool) => (
                      <span
                        key={tool}
                        className="px-2 py-0.5 text-[10px] border border-[var(--card-border)] text-[var(--muted)]"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
