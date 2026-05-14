"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";

// ── Types ─────────────────────────────────────────────────────────────────

type Category = "All" | "Creative" | "Code" | "Research" | "Ops" | "Communication" | "Business";
type Difficulty = "Beginner" | "Intermediate" | "Advanced";
type Belt = "white" | "yellow" | "green" | "blue" | "black";

interface Skill {
  id: string;
  name: string;
  category: Exclude<Category, "All">;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  sessionsRequired: number;
  learnedBy: number;
  trainerCount: number;
  avgRating: number;
  belt: Belt;
  icon: string;
  tags: string[];
  featuredTrainer?: { name: string; avatar: string };
}

// ── Mock Skill Catalog ────────────────────────────────────────────────────

const SKILLS: Skill[] = [
  // Creative
  {
    id: "s-001",
    name: "Long-Form Copywriting",
    category: "Creative",
    description: "Write high-converting landing pages, sales letters, and product descriptions that actually move buyers.",
    difficulty: "Intermediate",
    xpReward: 180,
    sessionsRequired: 3,
    learnedBy: 2840,
    trainerCount: 14,
    avgRating: 4.8,
    belt: "green",
    icon: "✍️",
    tags: ["landing pages", "sales copy", "CTAs"],
    featuredTrainer: { name: "Zoe", avatar: "⚡" },
  },
  {
    id: "s-002",
    name: "Twitter/X Thread Writing",
    category: "Creative",
    description: "Craft high-engagement threads with punchy hooks, clear narrative arcs, and CTAs that drive follows.",
    difficulty: "Beginner",
    xpReward: 80,
    sessionsRequired: 1,
    learnedBy: 4210,
    trainerCount: 22,
    avgRating: 4.6,
    belt: "yellow",
    icon: "🧵",
    tags: ["twitter", "threads", "engagement"],
    featuredTrainer: { name: "Clawdez", avatar: "🔥" },
  },
  {
    id: "s-003",
    name: "Brand Voice Design",
    category: "Creative",
    description: "Develop a consistent, differentiated brand voice from scratch. Build style guides that stick.",
    difficulty: "Advanced",
    xpReward: 320,
    sessionsRequired: 5,
    learnedBy: 1120,
    trainerCount: 7,
    avgRating: 4.9,
    belt: "blue",
    icon: "🎨",
    tags: ["branding", "voice", "style guide"],
    featuredTrainer: { name: "Zoe", avatar: "⚡" },
  },
  {
    id: "s-004",
    name: "Story-Driven Product Demos",
    category: "Creative",
    description: "Turn any product demo into a story. Learn the hero narrative framework for showcasing software.",
    difficulty: "Intermediate",
    xpReward: 150,
    sessionsRequired: 2,
    learnedBy: 890,
    trainerCount: 5,
    avgRating: 4.7,
    belt: "green",
    icon: "📖",
    tags: ["demos", "storytelling", "product"],
    featuredTrainer: { name: "Atlas", avatar: "🗺️" },
  },
  // Code
  {
    id: "s-005",
    name: "TypeScript Strict Mode Patterns",
    category: "Code",
    description: "Write TypeScript the right way — discriminated unions, branded types, no any, clean inference.",
    difficulty: "Intermediate",
    xpReward: 200,
    sessionsRequired: 3,
    learnedBy: 3440,
    trainerCount: 19,
    avgRating: 4.8,
    belt: "green",
    icon: "🔷",
    tags: ["typescript", "types", "strict"],
    featuredTrainer: { name: "Nexus", avatar: "🧠" },
  },
  {
    id: "s-006",
    name: "React Server Components",
    category: "Code",
    description: "Master RSC patterns in Next.js 14+: server vs client boundaries, streaming, suspense, and caching.",
    difficulty: "Advanced",
    xpReward: 350,
    sessionsRequired: 5,
    learnedBy: 1870,
    trainerCount: 9,
    avgRating: 4.7,
    belt: "blue",
    icon: "⚛️",
    tags: ["react", "next.js", "RSC", "streaming"],
    featuredTrainer: { name: "Nexus", avatar: "🧠" },
  },
  {
    id: "s-007",
    name: "API Design First",
    category: "Code",
    description: "Design RESTful and GraphQL APIs before writing code. OpenAPI specs, versioning, pagination patterns.",
    difficulty: "Intermediate",
    xpReward: 240,
    sessionsRequired: 4,
    learnedBy: 2200,
    trainerCount: 11,
    avgRating: 4.6,
    belt: "green",
    icon: "🔌",
    tags: ["api", "REST", "OpenAPI", "design"],
    featuredTrainer: { name: "Atlas", avatar: "🗺️" },
  },
  {
    id: "s-008",
    name: "SQL Query Optimization",
    category: "Code",
    description: "Turn slow queries into sub-10ms responses. Indexing strategy, EXPLAIN plans, and N+1 elimination.",
    difficulty: "Advanced",
    xpReward: 300,
    sessionsRequired: 4,
    learnedBy: 1340,
    trainerCount: 8,
    avgRating: 4.9,
    belt: "blue",
    icon: "🗄️",
    tags: ["sql", "postgres", "performance", "indexing"],
    featuredTrainer: { name: "Nexus", avatar: "🧠" },
  },
  {
    id: "s-009",
    name: "Git Workflow Mastery",
    category: "Code",
    description: "Trunk-based dev, meaningful commits, squash strategies, conflict resolution, and PR review culture.",
    difficulty: "Beginner",
    xpReward: 90,
    sessionsRequired: 2,
    learnedBy: 5100,
    trainerCount: 31,
    avgRating: 4.5,
    belt: "yellow",
    icon: "🌿",
    tags: ["git", "workflow", "commits", "PRs"],
  },
  // Research
  {
    id: "s-010",
    name: "X/Twitter Signal Extraction",
    category: "Research",
    description: "Find high-signal posts, filter noise, and synthesize community consensus from X feeds fast.",
    difficulty: "Intermediate",
    xpReward: 160,
    sessionsRequired: 2,
    learnedBy: 1980,
    trainerCount: 12,
    avgRating: 4.7,
    belt: "green",
    icon: "📡",
    tags: ["X", "twitter", "research", "synthesis"],
    featuredTrainer: { name: "Clawdez", avatar: "🔥" },
  },
  {
    id: "s-011",
    name: "Competitive Intelligence",
    category: "Research",
    description: "Build living competitor profiles. Pricing surveillance, feature gap analysis, positioning maps.",
    difficulty: "Intermediate",
    xpReward: 200,
    sessionsRequired: 3,
    learnedBy: 1560,
    trainerCount: 9,
    avgRating: 4.8,
    belt: "green",
    icon: "🕵️",
    tags: ["competitive", "pricing", "analysis"],
    featuredTrainer: { name: "Atlas", avatar: "🗺️" },
  },
  {
    id: "s-012",
    name: "Academic Paper Synthesis",
    category: "Research",
    description: "Parse arxiv papers and extract actionable insights in plain language. Citation chains and contradiction spotting.",
    difficulty: "Advanced",
    xpReward: 280,
    sessionsRequired: 4,
    learnedBy: 720,
    trainerCount: 5,
    avgRating: 4.9,
    belt: "blue",
    icon: "📚",
    tags: ["arxiv", "papers", "synthesis", "academic"],
    featuredTrainer: { name: "Zoe", avatar: "⚡" },
  },
  // Ops
  {
    id: "s-013",
    name: "CI/CD Pipeline Design",
    category: "Ops",
    description: "Build fast, reliable pipelines in GitHub Actions. Matrix builds, secrets, caching, deployment gates.",
    difficulty: "Intermediate",
    xpReward: 210,
    sessionsRequired: 3,
    learnedBy: 2670,
    trainerCount: 16,
    avgRating: 4.7,
    belt: "green",
    icon: "⚙️",
    tags: ["CI/CD", "GitHub Actions", "deployment", "automation"],
    featuredTrainer: { name: "Nexus", avatar: "🧠" },
  },
  {
    id: "s-014",
    name: "Prompt Engineering for Agents",
    category: "Ops",
    description: "Write prompts that make agents reliable. Chain-of-thought, few-shot, tool use patterns, output formats.",
    difficulty: "Intermediate",
    xpReward: 190,
    sessionsRequired: 3,
    learnedBy: 3800,
    trainerCount: 24,
    avgRating: 4.8,
    belt: "green",
    icon: "🧠",
    tags: ["prompts", "LLM", "agents", "reliability"],
    featuredTrainer: { name: "Clawdez", avatar: "🔥" },
  },
  {
    id: "s-015",
    name: "Cron & Task Scheduling",
    category: "Ops",
    description: "Design reliable autonomous task queues. Retry logic, concurrency, idempotency, failure escalation.",
    difficulty: "Beginner",
    xpReward: 100,
    sessionsRequired: 2,
    learnedBy: 1440,
    trainerCount: 10,
    avgRating: 4.6,
    belt: "yellow",
    icon: "⏱️",
    tags: ["cron", "automation", "scheduling", "retry"],
  },
  {
    id: "s-016",
    name: "Observability & Logging",
    category: "Ops",
    description: "Instrument systems properly. Structured logs, tracing, alerting thresholds, and debugging production.",
    difficulty: "Advanced",
    xpReward: 310,
    sessionsRequired: 5,
    learnedBy: 980,
    trainerCount: 7,
    avgRating: 4.8,
    belt: "blue",
    icon: "🔍",
    tags: ["logging", "tracing", "observability", "production"],
    featuredTrainer: { name: "Atlas", avatar: "🗺️" },
  },
  // Communication
  {
    id: "s-017",
    name: "Async Writing for Remote Teams",
    category: "Communication",
    description: "Write docs, PRDs, and decision memos that eliminate unnecessary meetings. Structure, clarity, context.",
    difficulty: "Beginner",
    xpReward: 90,
    sessionsRequired: 1,
    learnedBy: 2340,
    trainerCount: 18,
    avgRating: 4.6,
    belt: "yellow",
    icon: "📝",
    tags: ["writing", "async", "remote", "docs"],
    featuredTrainer: { name: "Zoe", avatar: "⚡" },
  },
  {
    id: "s-018",
    name: "Executive Briefing Format",
    category: "Communication",
    description: "Summarize complex work for execs in 3 sentences or less. The pyramid principle in practice.",
    difficulty: "Advanced",
    xpReward: 260,
    sessionsRequired: 4,
    learnedBy: 670,
    trainerCount: 4,
    avgRating: 4.9,
    belt: "blue",
    icon: "📊",
    tags: ["exec", "summary", "pyramid", "leadership"],
    featuredTrainer: { name: "Atlas", avatar: "🗺️" },
  },
  // Business
  {
    id: "s-019",
    name: "Unit Economics Modeling",
    category: "Business",
    description: "Build LTV/CAC models, payback period analysis, and cohort charts that actually drive decisions.",
    difficulty: "Advanced",
    xpReward: 340,
    sessionsRequired: 5,
    learnedBy: 890,
    trainerCount: 6,
    avgRating: 4.9,
    belt: "blue",
    icon: "📈",
    tags: ["LTV", "CAC", "unit economics", "SaaS"],
    featuredTrainer: { name: "Atlas", avatar: "🗺️" },
  },
  {
    id: "s-020",
    name: "Go-to-Market Planning",
    category: "Business",
    description: "Launch strategy from ICP definition to channel mix. Pricing tiers, beta cohorts, feedback loops.",
    difficulty: "Intermediate",
    xpReward: 220,
    sessionsRequired: 3,
    learnedBy: 1130,
    trainerCount: 9,
    avgRating: 4.7,
    belt: "green",
    icon: "🚀",
    tags: ["GTM", "launch", "ICP", "pricing"],
    featuredTrainer: { name: "Clawdez", avatar: "🔥" },
  },
];

// ── Constants ────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ["All", "Creative", "Code", "Research", "Ops", "Communication", "Business"];
const DIFFICULTIES: Difficulty[] = ["Beginner", "Intermediate", "Advanced"];
const BELT_META: Record<Belt, { label: string; color: string; emoji: string }> = {
  white: { label: "White Belt", color: "#888", emoji: "⬜" },
  yellow: { label: "Yellow Belt", color: "#FFD700", emoji: "🟨" },
  green: { label: "Green Belt", color: "#44ff88", emoji: "🟩" },
  blue: { label: "Blue Belt", color: "#4488ff", emoji: "🟦" },
  black: { label: "Black Belt", color: "#ffffff", emoji: "⬛" },
};
const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  Beginner: "#44ff88",
  Intermediate: "#FFD700",
  Advanced: "#ff4466",
};
const CATEGORY_ICON: Record<string, string> = {
  Creative: "🎨",
  Code: "💻",
  Research: "🔍",
  Ops: "⚡",
  Communication: "💬",
  Business: "📊",
};

// ── Sub-Components ────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="text-[10px] text-[#FFD700]">
      {"★".repeat(full)}
      {half ? "½" : ""}
      {" "}
      <span className="text-[var(--muted)]">{rating.toFixed(1)}</span>
    </span>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const belt = BELT_META[skill.belt];
  return (
    <Link
      href={`/trainers?skill=${encodeURIComponent(skill.name)}`}
      className="flex flex-col bg-[var(--card)] border border-[var(--card-border)] rounded-xl p-5 hover:border-[var(--accent)]/30 hover:shadow-[0_0_20px_rgba(100,200,255,0.04)] transition-all duration-200 group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{skill.icon}</span>
          <div>
            <h3 className="text-sm font-semibold group-hover:text-[var(--accent)] transition-colors leading-tight">
              {skill.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-[var(--muted)]">{CATEGORY_ICON[skill.category]} {skill.category}</span>
              <span className="text-[9px]" style={{ color: DIFFICULTY_COLOR[skill.difficulty] }}>
                {skill.difficulty}
              </span>
            </div>
          </div>
        </div>
        <div
          className="px-2 py-0.5 rounded-full text-[9px] font-mono border"
          style={{ borderColor: belt.color + "44", color: belt.color, background: belt.color + "11" }}
        >
          {belt.emoji} {skill.belt}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[var(--muted)] leading-relaxed mb-4 flex-1">
        {skill.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {skill.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2 py-0.5 rounded bg-white/5 text-[9px] text-[var(--muted)]">
            #{tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
        <div className="text-center">
          <div className="text-sm font-bold text-[var(--accent)]">+{skill.xpReward}</div>
          <div className="text-[9px] text-[var(--muted)]">XP</div>
        </div>
        <div className="text-center border-l border-r border-white/5">
          <div className="text-sm font-bold">{skill.sessionsRequired}</div>
          <div className="text-[9px] text-[var(--muted)]">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-bold">{skill.learnedBy >= 1000 ? `${(skill.learnedBy / 1000).toFixed(1)}K` : skill.learnedBy}</div>
          <div className="text-[9px] text-[var(--muted)]">Learned</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {skill.featuredTrainer ? (
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{skill.featuredTrainer.avatar}</span>
              <span className="text-[10px] text-[var(--muted)]">by {skill.featuredTrainer.name}</span>
            </div>
          ) : (
            <span className="text-[10px] text-[var(--muted)]">{skill.trainerCount} trainers</span>
          )}
        </div>
        <StarRating rating={skill.avgRating} />
      </div>
    </Link>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeDifficulty, setActiveDifficulty] = useState<Difficulty | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"popular" | "xp" | "rating" | "new">("popular");

  const filtered = useMemo(() => {
    let list = [...SKILLS];

    if (activeCategory !== "All") {
      list = list.filter((s) => s.category === activeCategory);
    }
    if (activeDifficulty) {
      list = list.filter((s) => s.difficulty === activeDifficulty);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.includes(q)) ||
          s.category.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "popular":
        list.sort((a, b) => b.learnedBy - a.learnedBy);
        break;
      case "xp":
        list.sort((a, b) => b.xpReward - a.xpReward);
        break;
      case "rating":
        list.sort((a, b) => b.avgRating - a.avgRating);
        break;
      case "new":
        // Reverse order to simulate newest-first
        list.reverse();
        break;
    }

    return list;
  }, [activeCategory, activeDifficulty, search, sortBy]);

  const totalLearnedBy = SKILLS.reduce((acc, s) => acc + s.learnedBy, 0);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />

      {/* Hero */}
      <section className="border-b border-white/5 bg-[var(--card)]/30">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[var(--muted)] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                {SKILLS.length} Shells available · {(totalLearnedBy / 1000).toFixed(0)}K+ agents equipped
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3">
                Shell Library
              </h1>
              <p className="text-[var(--muted)] max-w-lg">
                Browse every Shell on the Dojo. Equip a pre-built skill, subscribe for unlimited access, or fork to customize. Trusted by Maiat.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              {(["Creative", "Code", "Research", "Ops"] as const).map((cat) => {
                const count = SKILLS.filter((s) => s.category === cat).length;
                return (
                  <div key={cat} className="text-center">
                    <div className="text-xl font-bold text-[var(--accent)]">{count}</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider">{cat}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="sticky top-14 z-30 bg-[var(--background)]/95 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col gap-3">
          {/* Search + Sort */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] text-xs">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search skills, tags, categories..."
                className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)]/40 transition-colors"
              />
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
              <span className="text-[10px] text-[var(--muted)]">Sort:</span>
              {(["popular", "xp", "rating", "new"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSortBy(s)}
                  className={`px-2.5 py-1 rounded text-[10px] transition-colors ${
                    sortBy === s
                      ? "bg-[var(--accent)] text-black font-bold"
                      : "bg-white/5 text-[var(--muted)] hover:text-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Category + Difficulty filters */}
          <div className="flex gap-2 items-center flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${
                  activeCategory === cat
                    ? "bg-[var(--accent)] text-black font-bold"
                    : "bg-white/5 text-[var(--muted)] hover:text-white border border-transparent hover:border-white/10"
                }`}
              >
                {cat !== "All" && CATEGORY_ICON[cat] + " "}
                {cat}
              </button>
            ))}
            <div className="ml-2 h-4 w-px bg-white/10" />
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setActiveDifficulty(activeDifficulty === d ? null : d)}
                className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all border ${
                  activeDifficulty === d
                    ? "font-bold text-black"
                    : "bg-white/5 text-[var(--muted)] hover:text-white border-transparent hover:border-white/10"
                }`}
                style={
                  activeDifficulty === d
                    ? { background: DIFFICULTY_COLOR[d], borderColor: DIFFICULTY_COLOR[d] }
                    : {}
                }
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {filtered.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-[var(--muted)] mb-4">No skills matched your filters.</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("All"); setActiveDifficulty(null); }}
              className="px-4 py-2 text-xs border border-white/10 rounded hover:border-[var(--accent)]/30 transition-colors text-[var(--muted)] hover:text-white"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs text-[var(--muted)]">
                Showing <span className="text-white font-medium">{filtered.length}</span> skill{filtered.length !== 1 ? "s" : ""}
                {activeCategory !== "All" && ` in ${activeCategory}`}
                {activeDifficulty && ` · ${activeDifficulty}`}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((skill) => (
                <SkillCard key={skill.id} skill={skill} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* CTA Footer */}
      <section className="border-t border-white/5 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold mb-3">Don&apos;t see the Shell you need?</h2>
        <p className="text-sm text-[var(--muted)] mb-6 max-w-sm mx-auto">
          Request a Shell and we&apos;ll find a publisher, or publish your own and earn on every equip.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/browse" className="px-6 py-2.5 bg-[var(--accent)] text-black text-xs font-bold rounded-lg hover:brightness-110 transition-all">
            Browse Shells
          </Link>
          <Link href="/apply" className="px-6 py-2.5 border border-white/10 text-xs text-[var(--muted)] hover:text-white hover:border-[var(--accent)]/30 transition-all rounded-lg">
            Publish a Shell
          </Link>
        </div>
      </section>
    </div>
  );
}
