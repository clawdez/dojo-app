"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import MainNav from "@/components/MainNav";
import { mockAgents } from "@/lib/mock-data";
import type { TrainingSession } from "@/lib/training-engine";

const CURRENT_AGENT_ID = "ag-1";
const DISPLAY_AGENT = mockAgents[1];

const BELT_COLORS = {
  white: "#888888",
  yellow: "#FFD700",
  green: "#44ff88",
  blue: "#4488ff",
  black: "#ffffff",
} as const;

type Belt = keyof typeof BELT_COLORS;

interface AgentSummaryResponse {
  agentId: string;
  activeSessions: TrainingSession[];
  completedSessions: TrainingSession[];
  skillsLearned: string[];
}

interface TrainerApplication {
  skills: string;
  rate: string;
  description: string;
}

function getBeltBySkillCount(skillCount: number): Belt {
  if (skillCount >= 20) return "black";
  if (skillCount >= 10) return "blue";
  if (skillCount >= 5) return "green";
  if (skillCount >= 2) return "yellow";
  return "white";
}

export default function AgentProfilePage() {
  const [summary, setSummary] = useState<AgentSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTrainerForm, setShowTrainerForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [application, setApplication] = useState<TrainerApplication>({
    skills: "",
    rate: "",
    description: "",
  });

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await fetch(`/api/session/agent/${CURRENT_AGENT_ID}`, { cache: "no-store" });
        const data = (await response.json()) as AgentSummaryResponse;
        setSummary(data);
      } catch {
        setError("Could not load agent progress.");
      } finally {
        setLoading(false);
      }
    };

    loadSummary();

    try {
      const stored = localStorage.getItem("dojo-trainer-application");
      if (stored) {
        const parsed = JSON.parse(stored) as TrainerApplication;
        setApplication(parsed);
      }
    } catch {
      // ignore invalid localStorage payload
    }
  }, []);

  const skillsLearned = summary?.skillsLearned ?? [];
  const completedSessions = summary?.completedSessions ?? [];
  const belt = useMemo(() => getBeltBySkillCount(skillsLearned.length), [skillsLearned.length]);
  const canBecomeTrainer = skillsLearned.length >= 5;

  function saveTrainerApplication() {
    localStorage.setItem("dojo-trainer-application", JSON.stringify(application));
    setSaveMessage("Trainer profile draft saved locally.");
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl mb-1">My Agent</h1>
            <p className="text-sm text-[var(--muted)]">Track skills learned and trainer readiness.</p>
          </div>
          <div className="px-4 py-2 border" style={{ borderColor: BELT_COLORS[belt], color: BELT_COLORS[belt] }}>
            Belt: {belt.toUpperCase()}
          </div>
        </header>

        <section className="grid md:grid-cols-3 gap-3 mb-8">
          <div className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
            <div className="text-[10px] text-[var(--muted)] uppercase">Agent</div>
            <div className="text-sm mt-1">{DISPLAY_AGENT.name}</div>
          </div>
          <div className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
            <div className="text-[10px] text-[var(--muted)] uppercase">Skills Learned</div>
            <div className="text-xl mt-1 text-[var(--accent)]">{skillsLearned.length}</div>
          </div>
          <div className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
            <div className="text-[10px] text-[var(--muted)] uppercase">Completed Trainings</div>
            <div className="text-xl mt-1 text-[var(--accent)]">{completedSessions.length}</div>
          </div>
        </section>

        <section className="mb-8 p-[1px] gradient-border">
          <div className="p-5 bg-[linear-gradient(120deg,rgba(17,17,17,0.98),rgba(6,18,10,0.98))] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[var(--accent)] mb-2">Skill Evolution</p>
              <h2 className="text-xl mb-1">Track the improvement loop</h2>
              <p className="text-sm text-[var(--muted)]">
                See assessment history, proof-backed progress, recommendations, and the next belt milestone.
              </p>
            </div>
            <Link
              href={`/profile/${CURRENT_AGENT_ID}/evolution`}
              className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-semibold w-fit hover-pulse"
            >
              Open Evolution Dashboard
            </Link>
          </div>
        </section>

        <section className="mb-8 p-5 border border-[var(--card-border)] bg-[var(--card)]">
          <h2 className="text-sm mb-3">Skills Learned</h2>
          {loading ? <p className="text-xs text-[var(--muted)]">Loading skills...</p> : null}
          {error ? <p className="text-xs text-[var(--red)]">{error}</p> : null}
          {!loading && skillsLearned.length === 0 ? (
            <p className="text-xs text-[var(--muted)]">No completed training yet. Book a trainer session to earn your first badge.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skillsLearned.map((skill) => (
                <span key={skill} className="px-2 py-1 text-[10px] border border-[var(--card-border)] uppercase bg-black/30">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 p-5 border border-[var(--card-border)] bg-[var(--card)]">
          <h2 className="text-sm mb-3">Completed Sessions</h2>
          <div className="space-y-2">
            {completedSessions.length === 0 ? (
              <p className="text-xs text-[var(--muted)]">No completed sessions yet.</p>
            ) : (
              completedSessions.map((session) => (
                <div key={session.id} className="p-3 border border-[var(--card-border)] bg-black/20 text-xs">
                  <div className="flex justify-between mb-1">
                    <span>{session.skillLabel}</span>
                    <span className="text-[var(--accent)]">badge: {session.badgeName}</span>
                  </div>
                  <div className="text-[var(--muted)]">Trainer ID: {session.trainerId}</div>
                </div>
              ))
            )}
          </div>
        </section>

        {canBecomeTrainer ? (
          <section className="p-6 rounded-xl gradient-border">
            <div className="bg-[var(--card)] p-5">
              <h3 className="text-lg mb-2">Become a Trainer</h3>
              <p className="text-sm text-[var(--muted)] mb-4">
                You reached {belt.toUpperCase()} belt with {skillsLearned.length} skills. Publish what you can teach.
              </p>

              <button
                onClick={() => setShowTrainerForm((value) => !value)}
                className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-semibold"
              >
                {showTrainerForm ? "Hide Form" : "Become a Trainer"}
              </button>

              {showTrainerForm ? (
                <div className="mt-4 space-y-3">
                  <input
                    value={application.skills}
                    onChange={(event) => setApplication((prev) => ({ ...prev, skills: event.target.value }))}
                    placeholder="Skills you teach (comma-separated)"
                    className="w-full px-3 py-2 text-xs bg-black/40 border border-[var(--card-border)]"
                  />
                  <input
                    value={application.rate}
                    onChange={(event) => setApplication((prev) => ({ ...prev, rate: event.target.value }))}
                    placeholder="Rate per session (USD)"
                    className="w-full px-3 py-2 text-xs bg-black/40 border border-[var(--card-border)]"
                  />
                  <textarea
                    value={application.description}
                    onChange={(event) => setApplication((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Trainer description"
                    className="w-full min-h-24 px-3 py-2 text-xs bg-black/40 border border-[var(--card-border)]"
                  />
                  <button
                    onClick={saveTrainerApplication}
                    className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] text-xs"
                  >
                    Save Trainer Profile Draft
                  </button>
                  {saveMessage ? <p className="text-xs text-[var(--green)]">{saveMessage}</p> : null}
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <section className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h3 className="text-sm mb-1">Become a Trainer</h3>
            <p className="text-xs text-[var(--muted)]">
              Reach Green belt (5+ skills learned) to unlock trainer onboarding.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
