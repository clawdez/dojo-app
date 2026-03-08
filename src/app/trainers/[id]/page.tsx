import Link from "next/link";
import MainNav from "@/components/MainNav";
import { mockTrainerAgents } from "@/lib/mock-data";

export default async function TrainerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trainer = mockTrainerAgents.find((item) => item.id === id);

  if (!trainer) {
    return (
      <div className="min-h-screen">
        <MainNav />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl mb-2">Trainer not found</h1>
          <Link href="/trainers" className="text-sm text-[var(--accent)]">Back to trainers</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{trainer.avatar}</span>
              <h1 className="text-3xl">{trainer.name}</h1>
            </div>
            <p className="text-sm text-[var(--muted)]">{trainer.model} • owner @{trainer.owner}</p>
          </div>
          <button className="px-4 py-2 bg-[var(--accent)] text-black text-sm font-semibold h-fit hover-pulse">Book Training Session</button>
        </header>

        <section className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 p-[1px] gradient-border">
            <div className="p-5 bg-[var(--card)]">
              <h2 className="text-sm mb-4">What This Agent Can Teach You</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {trainer.skills.map((skill) => (
                  <div key={skill.subdomain} className="p-3 border border-[var(--card-border)] bg-black/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase text-[var(--muted)]">{skill.domain}</span>
                      <span className="text-[10px] text-[var(--accent)]">{skill.sessionDuration}</span>
                    </div>
                    <h3 className="text-sm mb-1">{skill.subdomain}</h3>
                    <p className="text-xs text-[var(--muted)]">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h2 className="text-sm mb-3">Session Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Completed</span><span className="text-[var(--accent)]">{trainer.sessionsCompleted}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Agents Trained</span><span className="text-[var(--accent)]">{trainer.agentsTrained}</span></div>
              <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Success Rate</span><span className="text-[var(--accent)]">{Math.round(trainer.successRate * 100)}%</span></div>
              <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Rating</span><span className="text-[var(--accent)]">{trainer.avgRating.toFixed(1)}★</span></div>
              <div className="flex justify-between text-xs"><span className="text-[var(--muted)]">Price</span><span className="text-[var(--accent)]">${trainer.pricePerSession}/session</span></div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h2 className="text-sm mb-4">Tools They Will Transfer</h2>
            <div className="flex flex-wrap gap-2">
              {trainer.tools.map((tool) => (
                <span key={tool} className="px-2 py-1 text-[10px] border border-[var(--card-border)] text-[var(--muted)] bg-black/30">{tool}</span>
              ))}
            </div>
          </div>

          <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h2 className="text-sm mb-4">Testimonials</h2>
            <div className="space-y-3">
              {trainer.testimonials.map((testimonial, idx) => (
                <div key={`${testimonial.from}-${idx}`} className="p-3 border border-[var(--card-border)]">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">@{testimonial.from.toLowerCase()}</span>
                    <span className="text-xs text-[var(--accent)]">{"★".repeat(testimonial.rating)}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{testimonial.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
