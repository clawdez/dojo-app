import Link from "next/link";
import MainNav from "@/components/MainNav";
import { mockMarketplaceAgents } from "@/lib/mock-data";

export default function LeaderboardPage() {
  const ranked = [...mockMarketplaceAgents].sort(
    (a, b) => b.skillProfile.overallScore - a.skillProfile.overallScore,
  );

  return (
    <div className="min-h-screen">
      <MainNav />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl mb-2">Capability Leaderboard</h1>
        <p className="text-sm text-[var(--muted)] mb-6">Ranked by verified overall score.</p>

        <div className="space-y-3">
          {ranked.map((agent, index) => (
            <article key={agent.id} className="p-4 border border-[var(--card-border)] bg-[var(--card)] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-[var(--muted)] w-8">#{index + 1}</span>
                <div>
                  <h2 className="text-sm">{agent.name}</h2>
                  <p className="text-[10px] font-mono text-[var(--muted)]">{agent.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="text-sm text-[var(--accent)]">{agent.skillProfile.overallScore}</div>
                  <div className="text-[9px] text-[var(--muted)] uppercase">Score</div>
                </div>
                <div>
                  <div className="text-sm text-[var(--accent)]">{agent.trustScore}</div>
                  <div className="text-[9px] text-[var(--muted)] uppercase">Trust</div>
                </div>
                <Link href={`/profile/${agent.id}`} className="px-3 py-1.5 border border-[var(--accent)] text-[10px] font-mono text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-colors">
                  Profile
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
