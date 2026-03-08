"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import MainNav from "@/components/MainNav";
import { mockTrainerAgents } from "@/lib/mock-data";
import type { SessionStepRecord, TrainingSession } from "@/lib/training-engine";

interface SessionResponse {
  session: TrainingSession;
  progress: { completed: number; total: number; percent: number };
}

const STEP_ORDER = ["teach", "demo", "practice", "feedback", "complete"] as const;

export default function LiveSessionPage() {
  const params = useParams<{ id: string }>();
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState("");
  const [isAdvancing, setIsAdvancing] = useState(false);

  const trainer = useMemo(() => {
    if (!session) return null;
    return mockTrainerAgents.find((item) => item.id === session.trainerId) ?? null;
  }, [session]);

  const latestStep = session?.steps[session.steps.length - 1] ?? null;
  const progressPercent = session ? Math.round((session.steps.length / STEP_ORDER.length) * 100) : 0;

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const response = await fetch(`/api/session/${params.id}`, { cache: "no-store" });
        const data = (await response.json()) as SessionResponse & { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? "Failed to load session");
        }
        if (mounted) {
          setSession(data.session);
          setLoading(false);
        }
      } catch (loadError) {
        if (mounted) {
          setError(loadError instanceof Error ? loadError.message : "Session load failed");
          setLoading(false);
        }
      }
    };

    loadSession();
    return () => {
      mounted = false;
    };
  }, [params.id]);

  async function handleNext() {
    if (!session || !latestStep || isAdvancing) return;

    const requiresAttempt = latestStep.type === "practice";
    if (requiresAttempt && attempt.trim().length < 10) {
      setError("Add a substantive practice response before continuing.");
      return;
    }

    setError("");
    setIsAdvancing(true);

    try {
      const response = await fetch(`/api/session/${session.id}/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traineeAttempt: requiresAttempt ? attempt : undefined }),
      });

      const data = (await response.json()) as { session?: TrainingSession; error?: string };
      if (!response.ok || !data.session) {
        throw new Error(data.error || "Failed to advance step");
      }

      setSession(data.session);
      setAttempt("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Advance failed");
    } finally {
      setIsAdvancing(false);
    }
  }

  function renderStep(step: SessionStepRecord) {
    if (step.type === "teach") {
      return <div className="p-4 border border-[var(--card-border)] bg-black/30 text-sm">{step.trainerMessage}</div>;
    }

    if (step.type === "demo") {
      return (
        <div className="p-4 border border-[var(--card-border)] bg-black/30">
          <p className="text-sm mb-3">{step.trainerMessage}</p>
          <pre className="text-xs overflow-x-auto bg-black p-3 border border-[var(--card-border)]">
            <code>{step.demoCode}</code>
          </pre>
        </div>
      );
    }

    if (step.type === "practice") {
      return (
        <div className="p-4 border border-[var(--card-border)] bg-black/30">
          <p className="text-sm mb-2">{step.trainerMessage}</p>
          <p className="text-xs text-[var(--muted)] mb-3">{step.practicePrompt}</p>
          <textarea
            value={attempt}
            onChange={(event) => setAttempt(event.target.value)}
            placeholder="Write your practice attempt here..."
            className="w-full min-h-40 p-3 text-xs bg-black border border-[var(--card-border)]"
          />
        </div>
      );
    }

    if (step.type === "feedback") {
      return (
        <div className="p-4 border border-[var(--green)]/40 bg-[var(--green)]/10">
          <p className="text-sm mb-2">{step.trainerMessage}</p>
          <div className="text-xs text-[var(--muted)]">
            Score: <span className="text-[var(--accent)]">{step.evaluation?.score ?? 0}/100</span>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 border border-[var(--accent)]/50 bg-[var(--accent)]/10">
        <h3 className="text-lg mb-2">Skill Badge Earned: {session?.badgeName}</h3>
        <p className="text-sm">{step.trainerMessage}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <MainNav />
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-[var(--muted)]">Loading session...</div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <MainNav />
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-[var(--red)]">{error}</div>
      </div>
    );
  }

  if (!session || !latestStep) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <MainNav />
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-[var(--muted)]">Session not available.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-[1fr_300px] gap-6">
        <section>
          <header className="mb-6">
            <h1 className="text-3xl mb-2">Live Training Session</h1>
            <p className="text-sm text-[var(--muted)]">
              {session.skillLabel} • {session.status === "completed" ? "Completed" : "In Progress"}
            </p>
          </header>

          <div className="mb-6">
            <div className="flex justify-between text-xs text-[var(--muted)] mb-2">
              <span>Progress</span>
              <span className="text-[var(--accent)]">
                {session.steps.length}/{STEP_ORDER.length} steps
              </span>
            </div>
            <div className="h-2 rounded-full bg-black overflow-hidden border border-[var(--card-border)]">
              <div className="h-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {session.steps.map((step, index) => (
              <article key={`${step.stepId}-${index}`} className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-sm">{step.title}</h2>
                  <span className="text-[10px] uppercase text-[var(--muted)]">{step.type}</span>
                </div>
                {renderStep(step)}
              </article>
            ))}
          </div>

          {error ? <p className="text-xs text-[var(--red)] mb-3">{error}</p> : null}

          {session.status !== "completed" ? (
            <button
              onClick={handleNext}
              disabled={isAdvancing}
              className="px-4 py-2 bg-[var(--accent)] text-black text-sm font-semibold disabled:opacity-40"
            >
              {isAdvancing ? "Advancing..." : latestStep.type === "practice" ? "Submit Practice" : "Next Step"}
            </button>
          ) : (
            <div className="text-sm text-[var(--green)]">Training complete. Badge added to your agent profile.</div>
          )}
        </section>

        <aside className="p-5 border border-[var(--card-border)] bg-[var(--card)] h-fit">
          <h2 className="text-sm mb-4">Trainer</h2>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{trainer?.avatar ?? "🥋"}</span>
            <div>
              <div className="text-sm">{trainer?.name ?? session.trainerId}</div>
              <div className="text-[10px] text-[var(--muted)]">{trainer?.model ?? "Trainer Agent"}</div>
            </div>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Skill Domain</span>
              <span>{session.skillDomain}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Badge</span>
              <span>{session.badgeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted)]">Status</span>
              <span className="text-[var(--accent)]">{session.status}</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-[var(--muted)] mb-2">Tools Transferred</h3>
            <div className="flex flex-wrap gap-1.5">
              {session.toolsTransferred.map((tool) => (
                <span key={tool} className="px-2 py-1 text-[10px] border border-[var(--card-border)] bg-black/30">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
