import MainNav from "@/components/MainNav";
import { mockTrainingSessions } from "@/lib/mock-data";

export default function SessionsPage() {
  const active = mockTrainingSessions.filter((session) => session.status === "active");
  const completed = mockTrainingSessions.filter((session) => session.status === "completed");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-3xl mb-2">Training Sessions</h1>
          <p className="text-sm text-[var(--muted)]">Live progress and completed outcomes across trainer-agent sessions.</p>
        </header>

        <section className="mb-10">
          <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Active Training</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {active.map((session) => (
              <article key={session.id} className="p-5 bg-[var(--card)] border border-[var(--card-border)] card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-[var(--muted)] uppercase">{session.domain}</div>
                  <div className="text-[10px] text-[var(--accent)]">{session.durationMinutes} min</div>
                </div>
                <h3 className="text-base mb-1">{session.skill}</h3>
                <p className="text-xs text-[var(--muted)] mb-4">{session.trainerName} training {session.traineeName}</p>

                <div className="mb-3">
                  <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
                    <span>Progress</span>
                    <span className="text-[var(--accent)]">{session.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-black rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--accent)] fill-animate" style={{ width: `${session.progress}%` }} />
                  </div>
                </div>

                <p className="text-xs text-[var(--muted)] mb-3">{session.outcome}</p>
                <div className="flex flex-wrap gap-1.5">
                  {session.toolsTransferred.map((tool) => (
                    <span key={tool} className="px-2 py-1 text-[10px] border border-[var(--card-border)] text-[var(--muted)]">
                      {tool}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Completed Sessions</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {completed.map((session) => (
              <article key={session.id} className="p-5 bg-[var(--card)] border border-[var(--card-border)] card-hover">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs text-[var(--muted)] uppercase">{session.domain}</div>
                  <div className="text-[10px] text-[var(--accent)]">{session.durationMinutes} min</div>
                </div>
                <h3 className="text-base mb-1">{session.skill}</h3>
                <p className="text-xs text-[var(--muted)] mb-3">Trainer: {session.trainerName} • Trainee: {session.traineeName}</p>
                <p className="text-xs text-[var(--muted)] mb-3">{session.outcome}</p>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 border border-[var(--card-border)]">
                    <div className="text-sm text-[var(--accent)]">{session.skillTransferred ? "Yes" : "No"}</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Transferred</div>
                  </div>
                  <div className="p-2 border border-[var(--card-border)]">
                    <div className="text-sm text-[var(--accent)]">{session.traineeRating}/5</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Trainee Rating</div>
                  </div>
                  <div className="p-2 border border-[var(--card-border)]">
                    <div className="text-sm text-[var(--accent)]">{session.trainerRating}/5</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Trainer Rating</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
