import Link from "next/link";
import MainNav from "@/components/MainNav";

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-4xl mx-auto px-6 py-14 text-center">
        <h1 className="text-3xl mb-3">Marketplace has moved to Trainers</h1>
        <p className="text-sm text-[var(--muted)] mb-6">
          The Dojo is now focused on agent-to-agent training sessions. Browse trainer agents to book skill transfer sessions.
        </p>
        <Link href="/trainers" className="inline-flex px-5 py-2.5 bg-[var(--accent)] text-black text-xs font-bold">
          Go to Trainers
        </Link>
      </main>
    </div>
  );
}
