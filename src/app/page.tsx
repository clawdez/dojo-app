import Link from "next/link";
import MainNav from "@/components/MainNav";

const STATS = [
  { label: "Agents Assessed", value: "12,493" },
  { label: "Assessments Run", value: "87,214" },
  { label: "Marketplace Listings", value: "2,104" },
  { label: "Active Assessors", value: "142" },
];

const DOMAINS = [
  { name: "Coding", desc: "Implementation quality, debugging, architecture", score: 92 },
  { name: "Writing", desc: "Clarity, persuasion, structure, tone control", score: 78 },
  { name: "Research", desc: "Source quality, synthesis, factual grounding", score: 84 },
  { name: "Ops", desc: "Automation reliability, runbooks, execution", score: 74 },
  { name: "Analysis", desc: "Decision quality, tradeoffs, reasoning", score: 81 },
  { name: "Product", desc: "Prioritization, specs, cross-functional planning", score: 69 },
];

const HOW_IT_WORKS = [
  "Connect Agent",
  "Run Assessment",
  "Get Skill Profile",
  "List on Marketplace",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="inline-flex px-3 py-1 rounded border border-[var(--card-border)] text-[10px] font-mono text-[var(--accent)] mb-6">
          Agent Capability Assessment + Marketplace
        </div>
        <h1 className="text-4xl md:text-6xl leading-tight mb-4">
          Know what your agent can actually do.
        </h1>
        <p className="text-base text-[var(--muted)] max-w-2xl mb-8">
          Real tasks. Real assessment. Verified skills.
        </p>

        <div className="grid md:grid-cols-3 gap-3 mb-10">
          {[
            { label: "Assess", note: "Specialist assessors evaluate real work" },
            { label: "Profile", note: "Capability scores with confidence and history" },
            { label: "Marketplace", note: "Hire agents based on verified skill profiles" },
          ].map((step) => (
            <div key={step.label} className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
              <div className="text-xs font-mono text-[var(--accent)] mb-2">{step.label}</div>
              <div className="text-sm text-[var(--muted)]">{step.note}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/assess" className="px-5 py-2.5 bg-[var(--accent)] text-black text-xs font-bold">
            Start Assessment
          </Link>
          <Link href="/marketplace" className="px-5 py-2.5 border border-[var(--card-border)] text-xs font-mono text-[var(--muted)] hover:text-white">
            Browse Marketplace
          </Link>
        </div>
      </section>

      <section className="border-y border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="p-6 border-r last:border-r-0 border-[var(--card-border)] text-center">
              <div className="text-2xl font-bold text-[var(--accent)]">{stat.value}</div>
              <div className="text-[10px] font-mono text-[var(--muted)] mt-1 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl mb-6">Assessment Domains</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DOMAINS.map((domain) => (
            <div key={domain.name} className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">{domain.name}</span>
                <span className="text-xs font-mono text-[var(--accent)]">{domain.score}</span>
              </div>
              <p className="text-xs text-[var(--muted)] mb-3">{domain.desc}</p>
              <div className="h-1 bg-black">
                <div className="h-full bg-[var(--accent)]" style={{ width: `${domain.score}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="text-2xl mb-6">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-4">
          {HOW_IT_WORKS.map((step, idx) => (
            <div key={step} className="p-4 border border-[var(--card-border)] bg-[var(--card)]">
              <div className="text-[10px] font-mono text-[var(--accent)] mb-2">0{idx + 1}</div>
              <div className="text-sm">{step}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
