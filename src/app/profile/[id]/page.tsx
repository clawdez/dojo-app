import Link from "next/link";
import MainNav from "@/components/MainNav";
import { mockAssessmentResults, mockMarketplaceAgents } from "@/lib/mock-data";

export default async function AgentCapabilityProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = mockMarketplaceAgents.find((item) => item.id === id);

  if (!agent) {
    return (
      <div className="min-h-screen">
        <MainNav />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl mb-2">Agent not found</h1>
          <Link href="/marketplace" className="text-sm text-[var(--accent)]">Back to marketplace</Link>
        </div>
      </div>
    );
  }

  const timeline = mockAssessmentResults
    .filter((result) => result.agentId === agent.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const reviews = [
    { id: "r1", by: "product.team", rating: 5, text: "Delivered a production-ready analysis workflow in a single sprint." },
    { id: "r2", by: "ops.lead", rating: 4, text: "Very strong in incident triage and documentation quality." },
    { id: "r3", by: "growth.pm", rating: 5, text: "Great balance of speed and output quality." },
  ];

  return (
    <div className="min-h-screen">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl mb-2">{agent.name}</h1>
            <p className="text-sm text-[var(--muted)]">{agent.model} • owner @{agent.owner}</p>
          </div>
          <button className="px-4 py-2 bg-[var(--accent)] text-black text-sm font-semibold h-fit hover-pulse">Hire This Agent</button>
        </header>

        <section className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 p-[1px] gradient-border">
            <div className="p-5 bg-[var(--card)]">
              <h2 className="text-sm mb-4">Capability Scores</h2>
              <div className="space-y-3">
                {agent.skillProfile.capabilities.map((capability, index) => (
                  <div key={capability.domain}>
                    <div className="flex justify-between text-[10px] font-mono mb-1">
                      <span className="uppercase text-[var(--muted)]">{capability.domain}</span>
                      <span className="text-[var(--accent)]">{capability.score}</span>
                    </div>
                    <div className="h-2 bg-black">
                      <div
                        className="h-full bg-[var(--accent)] fill-animate"
                        style={{ width: `${capability.score}%`, animationDelay: `${index * 90}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h2 className="text-sm mb-3">Maiat Trust Score</h2>
            <div className="text-3xl text-[var(--accent)] font-mono mb-2 glow-accent">{agent.trustScore}</div>
            <p className="text-xs text-[var(--muted)]">Placeholder badge. This section will link to maiat.io attestations.</p>
          </div>
        </section>

        <section className="p-5 border border-[var(--card-border)] bg-[var(--card)] mb-6">
          <h2 className="text-sm mb-4">Domain Breakdown</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {agent.skillProfile.capabilities.map((capability) => (
              <div key={`${capability.domain}-details`} className="p-3 border border-[var(--card-border)]">
                <div className="text-xs uppercase text-[var(--muted)] mb-2">{capability.domain} / {capability.subdomain}</div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-base text-[var(--accent)]">{capability.score}</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Score</div>
                  </div>
                  <div>
                    <div className="text-base text-[var(--accent)]">{capability.trialCount}</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Trials</div>
                  </div>
                  <div>
                    <div className="text-base text-[var(--accent)]">{Math.round(capability.confidence * 100)}%</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase">Confidence</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h2 className="text-sm mb-4">Assessment History</h2>
            <div className="space-y-3">
              {timeline.map((item) => (
                <div key={item.id} className="p-3 border border-[var(--card-border)]">
                  <div className="flex justify-between text-[10px] font-mono mb-1">
                    <span className="uppercase text-[var(--muted)]">{item.domain}</span>
                    <span className="text-[var(--accent)]">{item.score}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)] mb-1">{item.summary}</p>
                  <p className="text-[10px] text-[var(--muted)]">{new Date(item.createdAt).toLocaleDateString()} • trials {item.trialsRun}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h2 className="text-sm mb-4">Reviews From Hirers</h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="p-3 border border-[var(--card-border)]">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">@{review.by}</span>
                    <span className="text-xs text-[var(--accent)]">{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{review.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
