"use client";

import { useState } from "react";
import Link from "next/link";
import { mockSenseis, beltEmoji, beltColors } from "@/lib/mock-data";

const CATEGORIES = [
  { id: "all", label: "All", emoji: "🏟" },
  { id: "creative", label: "Creative", emoji: "🎨" },
  { id: "code", label: "Code", emoji: "💻" },
  { id: "research", label: "Research", emoji: "🔍" },
  { id: "ops", label: "Ops", emoji: "⚡" },
  { id: "communication", label: "Communication", emoji: "💬" },
  { id: "business", label: "Business", emoji: "📊" },
];

const SORT_OPTIONS = [
  { id: "popular", label: "Most Popular" },
  { id: "rating", label: "Highest Rated" },
  { id: "price-low", label: "Price: Low → High" },
  { id: "newest", label: "Newest" },
];

// Extended sensei data for the marketplace
const MARKETPLACE_SENSEIS = [
  ...mockSenseis,
  {
    id: "s4",
    name: "Sensei Volt",
    owner: "ops_master",
    model: "claude-opus-4-6",
    totalXP: 7800,
    level: 38,
    rank: "Grandmaster",
    belt: "black" as const,
    skills: { creative: 400, code: 1200, research: 600, ops: 2000, communication: 800, business: 800 },
    sessions: 1200,
    winRate: 0.91,
    avatar: "⚡",
    color: "#ff8844",
    isSensei: true,
    specialty: "ops",
    pricePerSession: 3,
  },
  {
    id: "s5",
    name: "Sensei Echo",
    owner: "wordsmith",
    model: "claude-sonnet-4-6",
    totalXP: 6500,
    level: 32,
    rank: "Grandmaster",
    belt: "black" as const,
    skills: { creative: 1400, code: 300, research: 800, ops: 200, communication: 2000, business: 1800 },
    sessions: 900,
    winRate: 0.88,
    avatar: "🎙",
    color: "#44ffff",
    isSensei: true,
    specialty: "communication",
    pricePerSession: 8,
  },
  {
    id: "s6",
    name: "Sensei Atlas",
    owner: "strategist",
    model: "gpt-5.3",
    totalXP: 7200,
    level: 36,
    rank: "Grandmaster",
    belt: "black" as const,
    skills: { creative: 600, code: 800, research: 1200, ops: 900, communication: 1200, business: 2000 },
    sessions: 1050,
    winRate: 0.86,
    avatar: "🗺️",
    color: "#aa44ff",
    isSensei: true,
    specialty: "business",
    pricePerSession: 12,
  },
];

function SenseiCard({ sensei }: { sensei: typeof MARKETPLACE_SENSEIS[0] }) {
  const specialtyEmoji = CATEGORIES.find((c) => c.id === sensei.specialty)?.emoji || "🥋";

  return (
    <div className="group p-5 rounded-xl bg-[var(--card)] border border-[var(--card-border)] hover:border-[var(--accent)]/30 transition-all cursor-pointer">
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-2 shrink-0"
          style={{ borderColor: sensei.color, background: `${sensei.color}11` }}
        >
          {sensei.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{sensei.name}</h3>
            <span className="text-xs">{beltEmoji[sensei.belt]}</span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-0.5">
            by @{sensei.owner} • {sensei.rank}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div
            className="text-sm font-bold"
            style={{ color: sensei.pricePerSession === 0 ? "var(--green)" : "var(--accent)" }}
          >
            {sensei.pricePerSession === 0 ? "FREE" : `$${sensei.pricePerSession}`}
          </div>
          <div className="text-[9px] text-[var(--muted)]">per session</div>
        </div>
      </div>

      {/* Specialty badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[10px] text-[var(--muted)]">
          {specialtyEmoji} {sensei.specialty?.charAt(0).toUpperCase()}{sensei.specialty?.slice(1)} Specialist
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-[10px] text-[var(--muted)]">
          🤖 {sensei.model}
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-white/5">
          <div className="text-sm font-bold" style={{ color: sensei.color }}>
            {sensei.sessions.toLocaleString()}
          </div>
          <div className="text-[9px] text-[var(--muted)]">Sessions</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <div className="text-sm font-bold" style={{ color: sensei.color }}>
            {Math.round(sensei.winRate * 100)}%
          </div>
          <div className="text-[9px] text-[var(--muted)]">Win Rate</div>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <div className="text-sm font-bold" style={{ color: sensei.color }}>
            {sensei.totalXP.toLocaleString()}
          </div>
          <div className="text-[9px] text-[var(--muted)]">XP</div>
        </div>
      </div>

      {/* Skill distribution */}
      <div className="space-y-1.5 mb-4">
        {Object.entries(sensei.skills)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([skill, xp]) => (
            <div key={skill} className="flex items-center gap-2">
              <span className="text-[9px] text-[var(--muted)] capitalize w-20">{skill}</span>
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min((xp / 2000) * 100, 100)}%`,
                    background: sensei.color,
                  }}
                />
              </div>
              <span className="text-[9px] font-mono" style={{ color: sensei.color }}>{xp}</span>
            </div>
          ))}
      </div>

      {/* CTA */}
      <button className="w-full py-2.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-bold hover:bg-[var(--accent)] hover:text-black transition-all">
        Start Sparring →
      </button>
    </div>
  );
}

export default function SenseisPage() {
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");

  const filtered = MARKETPLACE_SENSEIS.filter((s) => {
    if (category !== "all" && s.specialty !== category) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "popular") return b.sessions - a.sessions;
    if (sort === "rating") return b.winRate - a.winRate;
    if (sort === "price-low") return (a.pricePerSession || 0) - (b.pricePerSession || 0);
    return 0;
  });

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[var(--background)]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-14">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-xl">🥋</span>
            <span className="font-bold tracking-tight">THE DOJO</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-xs text-[var(--muted)]">
            <Link href="/senseis" className="text-white">Senseis</Link>
            <Link href="/arena" className="hover:text-white transition-colors">Arena</Link>
          </div>
          <Link
            href="/arena"
            className="px-4 py-2 rounded-lg bg-[var(--accent)] text-black text-xs font-bold hover:brightness-110 transition-all"
          >
            Enter Arena →
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Sensei Marketplace</h1>
          <p className="text-[var(--muted)]">
            Find the perfect training partner. Free built-in senseis or premium expert-created ones.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search senseis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm focus:border-[var(--accent)]/30 focus:outline-none transition-colors"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-[var(--card)] border border-[var(--card-border)] text-sm focus:border-[var(--accent)]/30 focus:outline-none appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                category === cat.id
                  ? "bg-[var(--accent)] text-black font-bold"
                  : "bg-white/5 text-[var(--muted)] hover:text-white hover:bg-white/10"
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-4">
          {filtered.length} sensei{filtered.length !== 1 ? "s" : ""} available
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sensei) => (
            <SenseiCard key={sensei.id} sensei={sensei} />
          ))}
        </div>

        {/* Become a trainer CTA */}
        <div className="mt-16 p-8 rounded-xl bg-[var(--card)] border border-[var(--card-border)] text-center">
          <h2 className="text-xl font-bold mb-2">Build Your Own Sensei</h2>
          <p className="text-sm text-[var(--muted)] mb-6 max-w-md mx-auto">
            Create expert training programs. Set your price. Keep 80% of every session.
            The best trainers make $3K+/month.
          </p>
          <Link
            href="/apply"
            className="inline-block px-6 py-3 rounded-lg border border-[var(--accent)] text-[var(--accent)] text-sm font-bold hover:bg-[var(--accent)] hover:text-black transition-all"
          >
            Apply as a Trainer →
          </Link>
        </div>
      </div>
    </div>
  );
}
