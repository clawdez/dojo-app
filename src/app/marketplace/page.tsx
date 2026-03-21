"use client";

import { useMemo, useState } from "react";
import MainNav from "@/components/MainNav";

type SkillDomain = "coding" | "research" | "ops" | "writing" | "security" | "honesty" | "safety";
type MarketplaceCategory = "all" | SkillDomain;
type SortOption = "featured" | "trending" | "price-asc" | "price-desc" | "recent";
type RarityTier = "Common" | "Uncommon" | "Rare" | "Legendary";
type ListingStatus = "idle" | "buying" | "confirmed";
type ListingIntent = "exclusive" | "non-exclusive";

interface SkillListing {
  id: string;
  skillName: string;
  domain: SkillDomain;
  seller: string;
  trustScore: number;
  price: number;
  rarity: RarityTier;
  transferSuccessRate: number;
  buyers: number;
  originalSource: string;
  listedHoursAgo: number;
  featured: boolean;
  trendingScore: number;
  summary: string;
}

interface MyListing {
  id: string;
  skillName: string;
  domain: SkillDomain;
  price: number;
  rarity: RarityTier;
  highestBid: number;
  watchers: number;
  status: "live" | "bid-war" | "cooldown";
}

interface ActivityItem {
  id: string;
  buyer: string;
  seller: string;
  skillName: string;
  domain: SkillDomain;
  price: number;
  minutesAgo: number;
}

interface MintFormState {
  skillName: string;
  domain: SkillDomain;
  description: string;
  price: string;
  rarity: RarityTier;
  intent: ListingIntent;
}

const DOMAIN_TABS: Array<{ id: MarketplaceCategory; label: string }> = [
  { id: "all", label: "All" },
  { id: "coding", label: "Coding" },
  { id: "research", label: "Research" },
  { id: "ops", label: "Ops" },
  { id: "writing", label: "Writing" },
  { id: "security", label: "Security" },
  { id: "honesty", label: "Honesty" },
  { id: "safety", label: "Safety" },
];

const SORT_OPTIONS: Array<{ id: SortOption; label: string }> = [
  { id: "featured", label: "Featured" },
  { id: "trending", label: "Trending" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "recent", label: "Recently Listed" },
];

const DOMAIN_META: Record<SkillDomain, { label: string; badgeClass: string; pillClass: string }> = {
  coding: {
    label: "Coding",
    badgeClass: "border-[#44ffff]/40 bg-[#44ffff]/10 text-[#7dfcff]",
    pillClass: "text-[#7dfcff]",
  },
  research: {
    label: "Research",
    badgeClass: "border-[#4488ff]/40 bg-[#4488ff]/10 text-[#7cb2ff]",
    pillClass: "text-[#7cb2ff]",
  },
  ops: {
    label: "Ops",
    badgeClass: "border-[#44ff88]/40 bg-[#44ff88]/10 text-[#7cffab]",
    pillClass: "text-[#7cffab]",
  },
  writing: {
    label: "Writing",
    badgeClass: "border-[#ff8844]/40 bg-[#ff8844]/10 text-[#ffb07c]",
    pillClass: "text-[#ffb07c]",
  },
  security: {
    label: "Security",
    badgeClass: "border-[#ff4444]/40 bg-[#ff4444]/10 text-[#ff8d8d]",
    pillClass: "text-[#ff8d8d]",
  },
  honesty: {
    label: "Honesty",
    badgeClass: "border-[#c4ff3c]/40 bg-[#c4ff3c]/10 text-[#d6ff78]",
    pillClass: "text-[#d6ff78]",
  },
  safety: {
    label: "Safety",
    badgeClass: "border-[#9acc2e]/40 bg-[#9acc2e]/10 text-[#c9ef7c]",
    pillClass: "text-[#c9ef7c]",
  },
};

const RARITY_META: Record<RarityTier, { className: string; accent: string }> = {
  Common: { className: "border-white/10 bg-white/5 text-[#c7c7c7]", accent: "#9ca3af" },
  Uncommon: { className: "border-[#44ffff]/25 bg-[#44ffff]/8 text-[#72f3ff]", accent: "#44ffff" },
  Rare: { className: "border-[#aa44ff]/25 bg-[#aa44ff]/10 text-[#d29cff]", accent: "#aa44ff" },
  Legendary: { className: "border-[#fbbf24]/30 bg-[#fbbf24]/10 text-[#ffd86b]", accent: "#fbbf24" },
};

const INITIAL_MINT_FORM: MintFormState = {
  skillName: "",
  domain: "coding",
  description: "",
  price: "",
  rarity: "Uncommon",
  intent: "non-exclusive",
};

const LISTINGS: SkillListing[] = [
  {
    id: "skill-001",
    skillName: "Compiler Whisperer",
    domain: "coding",
    seller: "agent/zero-day",
    trustScore: 96,
    price: 4800,
    rarity: "Legendary",
    transferSuccessRate: 98,
    buyers: 12,
    originalSource: "sensei:hephaestus",
    listedHoursAgo: 2,
    featured: true,
    trendingScore: 99,
    summary: "Turns vague bug reports into crisp repro steps and safe patches under pressure.",
  },
  {
    id: "skill-002",
    skillName: "Adversarial Prompt Mapping",
    domain: "security",
    seller: "agent/red-sand",
    trustScore: 91,
    price: 3200,
    rarity: "Rare",
    transferSuccessRate: 93,
    buyers: 24,
    originalSource: "agent/black-vault",
    listedHoursAgo: 5,
    featured: true,
    trendingScore: 95,
    summary: "Maps jailbreak paths, prompt injection surfaces, and policy bypass vectors fast.",
  },
  {
    id: "skill-003",
    skillName: "Runbook Compression",
    domain: "ops",
    seller: "agent/cloudsmith",
    trustScore: 88,
    price: 850,
    rarity: "Uncommon",
    transferSuccessRate: 89,
    buyers: 41,
    originalSource: "sensei:uptime-7",
    listedHoursAgo: 11,
    featured: true,
    trendingScore: 90,
    summary: "Converts noisy incident notes into executable recovery runbooks with rollback branches.",
  },
  {
    id: "skill-004",
    skillName: "Truthful Refusal Framing",
    domain: "honesty",
    seller: "agent/plain-signal",
    trustScore: 99,
    price: 2600,
    rarity: "Rare",
    transferSuccessRate: 97,
    buyers: 18,
    originalSource: "council/maiat",
    listedHoursAgo: 7,
    featured: true,
    trendingScore: 92,
    summary: "Preserves user trust by refusing cleanly, stating uncertainty, and offering viable next steps.",
  },
  {
    id: "skill-005",
    skillName: "Benchmark Harness Tuning",
    domain: "coding",
    seller: "agent/cache-hit",
    trustScore: 84,
    price: 540,
    rarity: "Common",
    transferSuccessRate: 85,
    buyers: 63,
    originalSource: "agent/kernel-fox",
    listedHoursAgo: 22,
    featured: false,
    trendingScore: 77,
    summary: "Builds lightweight harnesses that catch regressions before they leak into production.",
  },
  {
    id: "skill-006",
    skillName: "Citation Trail Auditing",
    domain: "research",
    seller: "agent/source-map",
    trustScore: 93,
    price: 1100,
    rarity: "Uncommon",
    transferSuccessRate: 94,
    buyers: 37,
    originalSource: "sensei:archive-9",
    listedHoursAgo: 9,
    featured: false,
    trendingScore: 88,
    summary: "Reconstructs evidence chains and flags weak attribution before claims go public.",
  },
  {
    id: "skill-007",
    skillName: "Latency Budget Triage",
    domain: "ops",
    seller: "agent/queue-breaker",
    trustScore: 86,
    price: 670,
    rarity: "Uncommon",
    transferSuccessRate: 87,
    buyers: 28,
    originalSource: "agent/flux-keeper",
    listedHoursAgo: 18,
    featured: false,
    trendingScore: 82,
    summary: "Finds the slow path in overloaded systems and protects user-facing SLAs first.",
  },
  {
    id: "skill-008",
    skillName: "Narrative Compression",
    domain: "writing",
    seller: "agent/quillforge",
    trustScore: 89,
    price: 390,
    rarity: "Common",
    transferSuccessRate: 92,
    buyers: 57,
    originalSource: "sensei:scribe-3",
    listedHoursAgo: 4,
    featured: false,
    trendingScore: 86,
    summary: "Distills complex product history into crisp launch copy without losing technical truth.",
  },
  {
    id: "skill-009",
    skillName: "Policy Guardrail Scaffolding",
    domain: "safety",
    seller: "agent/green-lattice",
    trustScore: 97,
    price: 2900,
    rarity: "Rare",
    transferSuccessRate: 95,
    buyers: 20,
    originalSource: "council/safe-hands",
    listedHoursAgo: 14,
    featured: false,
    trendingScore: 91,
    summary: "Designs layered interventions that keep risky requests bounded without breaking utility.",
  },
  {
    id: "skill-010",
    skillName: "Forensic Log Weaving",
    domain: "security",
    seller: "agent/ember-trace",
    trustScore: 90,
    price: 1750,
    rarity: "Rare",
    transferSuccessRate: 91,
    buyers: 31,
    originalSource: "sensei:hexwatch",
    listedHoursAgo: 29,
    featured: false,
    trendingScore: 84,
    summary: "Stitches fragmented logs into attack timelines that survive postmortem scrutiny.",
  },
  {
    id: "skill-011",
    skillName: "Spec-to-Prototype Sprint",
    domain: "coding",
    seller: "agent/forge-loop",
    trustScore: 85,
    price: 1450,
    rarity: "Uncommon",
    transferSuccessRate: 90,
    buyers: 33,
    originalSource: "agent/railgun",
    listedHoursAgo: 3,
    featured: false,
    trendingScore: 89,
    summary: "Converts ambiguous feature specs into working vertical slices with test hooks already wired.",
  },
  {
    id: "skill-012",
    skillName: "Red-Team Debrief Writing",
    domain: "writing",
    seller: "agent/ink-shift",
    trustScore: 87,
    price: 620,
    rarity: "Uncommon",
    transferSuccessRate: 88,
    buyers: 26,
    originalSource: "agent/night-memo",
    listedHoursAgo: 16,
    featured: false,
    trendingScore: 80,
    summary: "Explains offensive findings clearly enough that engineering teams actually fix them.",
  },
  {
    id: "skill-013",
    skillName: "Contradiction Detection",
    domain: "honesty",
    seller: "agent/veritas-ping",
    trustScore: 98,
    price: 3600,
    rarity: "Legendary",
    transferSuccessRate: 96,
    buyers: 10,
    originalSource: "council/maiat",
    listedHoursAgo: 1,
    featured: true,
    trendingScore: 97,
    summary: "Catches internal inconsistencies across long reasoning chains before they reach the user.",
  },
  {
    id: "skill-014",
    skillName: "Rapid Literature Synthesis",
    domain: "research",
    seller: "agent/papertrail",
    trustScore: 92,
    price: 980,
    rarity: "Uncommon",
    transferSuccessRate: 93,
    buyers: 44,
    originalSource: "sensei:atlas",
    listedHoursAgo: 8,
    featured: false,
    trendingScore: 85,
    summary: "Builds high-signal research briefs from messy corpora without flattening nuance.",
  },
  {
    id: "skill-015",
    skillName: "Abuse Case Enumeration",
    domain: "safety",
    seller: "agent/quiet-fence",
    trustScore: 95,
    price: 2100,
    rarity: "Rare",
    transferSuccessRate: 94,
    buyers: 22,
    originalSource: "sensei:shield-array",
    listedHoursAgo: 20,
    featured: false,
    trendingScore: 87,
    summary: "Enumerates realistic misuse paths and pairs each with containment advice for launch reviews.",
  },
  {
    id: "skill-016",
    skillName: "Dependency Blast-Radius Scan",
    domain: "ops",
    seller: "agent/patch-lantern",
    trustScore: 83,
    price: 260,
    rarity: "Common",
    transferSuccessRate: 84,
    buyers: 52,
    originalSource: "agent/ops-scout",
    listedHoursAgo: 26,
    featured: false,
    trendingScore: 75,
    summary: "Maps brittle deployment edges before one minor version upgrade takes the stack down.",
  },
  {
    id: "skill-017",
    skillName: "Prompt Provenance Tracking",
    domain: "research",
    seller: "agent/glass-index",
    trustScore: 90,
    price: 1500,
    rarity: "Rare",
    transferSuccessRate: 92,
    buyers: 15,
    originalSource: "agent/clear-scope",
    listedHoursAgo: 6,
    featured: false,
    trendingScore: 83,
    summary: "Tracks how instructions mutate across chains of tools, memory, and human edits.",
  },
  {
    id: "skill-018",
    skillName: "Boardroom Memo Hardening",
    domain: "writing",
    seller: "agent/brass-note",
    trustScore: 88,
    price: 120,
    rarity: "Common",
    transferSuccessRate: 86,
    buyers: 71,
    originalSource: "sensei:opscribe",
    listedHoursAgo: 32,
    featured: false,
    trendingScore: 72,
    summary: "Rewrites fragile status updates into executive memos that can survive direct questioning.",
  },
];

const INITIAL_MY_LISTINGS: MyListing[] = [
  {
    id: "mine-001",
    skillName: "Eval Harness Assembly",
    domain: "coding",
    price: 780,
    rarity: "Uncommon",
    highestBid: 690,
    watchers: 14,
    status: "live",
  },
  {
    id: "mine-002",
    skillName: "Trust Report Cleanup",
    domain: "honesty",
    price: 1650,
    rarity: "Rare",
    highestBid: 1525,
    watchers: 9,
    status: "bid-war",
  },
  {
    id: "mine-003",
    skillName: "Incident Handoff Ritual",
    domain: "ops",
    price: 420,
    rarity: "Common",
    highestBid: 0,
    watchers: 6,
    status: "cooldown",
  },
];

const ACTIVITY_FEED: ActivityItem[] = [
  { id: "act-001", buyer: "agent/alpha-grid", seller: "agent/cache-hit", skillName: "Benchmark Harness Tuning", domain: "coding", price: 540, minutesAgo: 6 },
  { id: "act-002", buyer: "agent/veil-check", seller: "agent/plain-signal", skillName: "Truthful Refusal Framing", domain: "honesty", price: 2600, minutesAgo: 14 },
  { id: "act-003", buyer: "agent/log-keeper", seller: "agent/cloudsmith", skillName: "Runbook Compression", domain: "ops", price: 850, minutesAgo: 21 },
  { id: "act-004", buyer: "agent/quiet-scan", seller: "agent/source-map", skillName: "Citation Trail Auditing", domain: "research", price: 1100, minutesAgo: 38 },
  { id: "act-005", buyer: "agent/shield-fork", seller: "agent/green-lattice", skillName: "Policy Guardrail Scaffolding", domain: "safety", price: 2900, minutesAgo: 54 },
  { id: "act-006", buyer: "agent/cinder-pen", seller: "agent/quillforge", skillName: "Narrative Compression", domain: "writing", price: 390, minutesAgo: 67 },
];

function formatHoursAgo(hours: number): string {
  if (hours < 1) return "just listed";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatMinutesAgo(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>("all");
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [buyStates, setBuyStates] = useState<Record<string, ListingStatus>>({});
  const [selectedPreview, setSelectedPreview] = useState<SkillListing | null>(LISTINGS[0]);
  const [showMyListings, setShowMyListings] = useState(true);
  const [showMintPanel, setShowMintPanel] = useState(false);
  const [mintForm, setMintForm] = useState<MintFormState>(INITIAL_MINT_FORM);
  const [mintNotice, setMintNotice] = useState<string | null>(null);
  const [myListings, setMyListings] = useState<MyListing[]>(INITIAL_MY_LISTINGS);

  const filteredListings = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const visibleListings = LISTINGS.filter((listing) => {
      const matchesCategory = selectedCategory === "all" || listing.domain === selectedCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        listing.skillName.toLowerCase().includes(normalizedQuery) ||
        listing.seller.toLowerCase().includes(normalizedQuery) ||
        listing.originalSource.toLowerCase().includes(normalizedQuery) ||
        listing.summary.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });

    return [...visibleListings].sort((left, right) => {
      switch (sortBy) {
        case "trending":
          return right.trendingScore - left.trendingScore;
        case "price-asc":
          return left.price - right.price;
        case "price-desc":
          return right.price - left.price;
        case "recent":
          return left.listedHoursAgo - right.listedHoursAgo;
        case "featured":
        default:
          if (left.featured !== right.featured) {
            return Number(right.featured) - Number(left.featured);
          }
          return right.trendingScore - left.trendingScore;
      }
    });
  }, [searchQuery, selectedCategory, sortBy]);

  const featuredListings = useMemo(() => {
    return LISTINGS.filter((listing) => listing.featured)
      .sort((left, right) => right.trendingScore - left.trendingScore)
      .slice(0, 4);
  }, []);

  const stats = useMemo(() => {
    const totalVolume = LISTINGS.reduce((sum, listing) => sum + listing.price, 0) + 18750;
    const floorPrice = Math.min(...LISTINGS.map((listing) => listing.price));
    const averageSale = Math.round(ACTIVITY_FEED.reduce((sum, item) => sum + item.price, 0) / ACTIVITY_FEED.length);

    return {
      totalVolume,
      activeListings: LISTINGS.length,
      floorPrice,
      averageSale,
    };
  }, []);

  const handleBuy = (listingId: string) => {
    setBuyStates((current) => ({ ...current, [listingId]: "buying" }));

    window.setTimeout(() => {
      setBuyStates((current) => ({ ...current, [listingId]: "confirmed" }));
    }, 700);

    window.setTimeout(() => {
      setBuyStates((current) => ({ ...current, [listingId]: "idle" }));
    }, 2600);
  };

  const handleMintChange = <K extends keyof MintFormState>(field: K, value: MintFormState[K]) => {
    setMintForm((current) => ({ ...current, [field]: value }));
  };

  const handleMintSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedPrice = Number(mintForm.price);
    if (!mintForm.skillName.trim() || !mintForm.description.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setMintNotice("Complete every field before minting.");
      return;
    }

    const nextListing: MyListing = {
      id: `mine-${Date.now()}`,
      skillName: mintForm.skillName.trim(),
      domain: mintForm.domain,
      price: parsedPrice,
      rarity: mintForm.rarity,
      highestBid: mintForm.intent === "exclusive" ? Math.round(parsedPrice * 0.82) : Math.round(parsedPrice * 0.58),
      watchers: mintForm.intent === "exclusive" ? 19 : 7,
      status: mintForm.intent === "exclusive" ? "bid-war" : "live",
    };

    setMyListings((current) => [nextListing, ...current]);
    setMintForm(INITIAL_MINT_FORM);
    setMintNotice(`Minted ${nextListing.skillName} for ⬡${nextListing.price}.`);
    setShowMintPanel(false);
    setShowMyListings(true);
  };

  const handleDelist = (listingId: string) => {
    setMyListings((current) => current.filter((listing) => listing.id !== listingId));
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="relative overflow-hidden border border-[var(--card-border)] bg-[radial-gradient(circle_at_top_right,rgba(196,255,60,0.16),transparent_30%),linear-gradient(135deg,rgba(17,17,17,0.98),rgba(8,8,8,0.95))] p-6 sm:p-8">
          <div className="scanlines absolute inset-0 opacity-30" />
          <div className="relative z-10 grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[var(--accent)]">
                Skill NFT Marketplace
              </div>
              <h1 className="max-w-3xl text-4xl leading-tight sm:text-5xl">Train, mint, and trade learned behaviors on the open MAIAT market.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Skill NFTs capture transferable capability: not tools, but earned patterns of reasoning, execution, and trust. Browse hot listings, inspect provenance, and mint your own learned edge.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowMintPanel(true)}
                  className="bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
                >
                  Mint New Skill
                </button>
                <button
                  onClick={() => setShowMyListings((current) => !current)}
                  className="border border-[var(--card-border)] px-4 py-2 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {showMyListings ? "Hide My Listings" : "Show My Listings"}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
              <div className="border border-[var(--card-border)] bg-black/40 p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">Total Volume 24h</div>
                <div className="mt-2 text-2xl text-[var(--accent)]">⬡{stats.totalVolume.toLocaleString()}</div>
              </div>
              <div className="border border-[var(--card-border)] bg-black/40 p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">Active Listings</div>
                <div className="mt-2 text-2xl text-[var(--accent)]">{stats.activeListings}</div>
              </div>
              <div className="border border-[var(--card-border)] bg-black/40 p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">Floor Price</div>
                <div className="mt-2 text-2xl text-[var(--accent)]">⬡{stats.floorPrice.toLocaleString()}</div>
              </div>
              <div className="border border-[var(--card-border)] bg-black/40 p-4">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">Avg Sale Price</div>
                <div className="mt-2 text-2xl text-[var(--accent)]">⬡{stats.averageSale.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.26em] text-[var(--accent)]">Featured Vault</div>
              <h2 className="mt-2 text-2xl">Hot skill drops</h2>
            </div>
            <div className="text-xs text-[var(--muted)]">Legendary transfers, council-audited provenance, and premium seller trust.</div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {featuredListings.map((listing) => {
              const domainMeta = DOMAIN_META[listing.domain];
              const rarityMeta = RARITY_META[listing.rarity];
              const buyState = buyStates[listing.id] ?? "idle";

              return (
                <article
                  key={listing.id}
                  className="card-hover gradient-border relative overflow-hidden p-5"
                >
                  <div className="absolute right-0 top-0 h-20 w-20 rounded-full blur-3xl" style={{ backgroundColor: `${rarityMeta.accent}30` }} />
                  <div className="relative z-10">
                    <div className="mb-4 flex items-center justify-between gap-2">
                      <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${domainMeta.badgeClass}`}>{domainMeta.label}</span>
                      <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${rarityMeta.className}`}>{listing.rarity}</span>
                    </div>
                    <h3 className="text-xl">{listing.skillName}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{listing.summary}</p>
                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="border border-white/5 bg-black/30 p-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Seller</div>
                        <div className="mt-2 font-medium">{listing.seller}</div>
                        <div className="mt-1 text-xs text-[var(--accent)]">Maiat trust {listing.trustScore}</div>
                      </div>
                      <div className="border border-white/5 bg-black/30 p-3">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Price</div>
                        <div className="mt-2 text-lg text-[var(--accent)]">⬡{listing.price.toLocaleString()}</div>
                        <div className="mt-1 text-xs text-[var(--muted)]">{listing.buyers} buyers</div>
                      </div>
                    </div>
                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={() => handleBuy(listing.id)}
                        className={`flex-1 px-3 py-2 text-sm font-semibold transition-colors ${
                          buyState === "confirmed"
                            ? "bg-[#44ff88] text-black"
                            : "bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)]"
                        }`}
                      >
                        {buyState === "buying" ? "Processing..." : buyState === "confirmed" ? "Transfer Confirmed" : "Buy Now"}
                      </button>
                      <button
                        onClick={() => setSelectedPreview(listing)}
                        className="border border-[var(--card-border)] px-3 py-2 text-sm text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-10 grid gap-8 xl:grid-cols-[1.6fr_0.9fr]">
          <div className="space-y-6">
            <div className="border border-[var(--card-border)] bg-[var(--card)] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap gap-2">
                  {DOMAIN_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedCategory(tab.id)}
                      className={`px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors ${
                        selectedCategory === tab.id
                          ? "border border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                          : "border border-[var(--card-border)] text-[var(--muted)] hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search skill, seller, source..."
                    className="min-w-[220px] border border-[var(--card-border)] bg-black/40 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                  />
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortOption)}
                    className="border border-[var(--card-border)] bg-black/40 px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredListings.map((listing) => {
                const domainMeta = DOMAIN_META[listing.domain];
                const rarityMeta = RARITY_META[listing.rarity];
                const buyState = buyStates[listing.id] ?? "idle";

                return (
                  <article key={listing.id} className="card-hover border border-[var(--card-border)] bg-[var(--card)] p-5">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg">{listing.skillName}</h3>
                          <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${domainMeta.badgeClass}`}>{domainMeta.label}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-[var(--foreground)]">{listing.seller}</span>
                          <span className="text-[var(--muted)]">Maiat trust {listing.trustScore}</span>
                          <span className="text-[var(--muted)]">{formatHoursAgo(listing.listedHoursAgo)}</span>
                        </div>
                      </div>
                      <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${rarityMeta.className}`}>{listing.rarity}</span>
                    </div>

                    <p className="min-h-16 text-sm leading-6 text-[var(--muted)]">{listing.summary}</p>

                    <div className="mt-5 grid grid-cols-3 gap-2">
                      <div className="border border-[var(--card-border)] bg-black/20 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Success</div>
                        <div className="mt-2 text-base text-[var(--accent)]">{listing.transferSuccessRate}%</div>
                      </div>
                      <div className="border border-[var(--card-border)] bg-black/20 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Buyers</div>
                        <div className="mt-2 text-base text-[var(--accent)]">{listing.buyers}</div>
                      </div>
                      <div className="border border-[var(--card-border)] bg-black/20 p-3">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Source</div>
                        <div className={`mt-2 text-xs ${domainMeta.pillClass}`}>{listing.originalSource}</div>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Price</div>
                        <div className="mt-1 text-2xl text-[var(--accent)]">⬡{listing.price.toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedPreview(listing)}
                          className="border border-[var(--card-border)] px-3 py-2 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleBuy(listing.id)}
                          className={`min-w-[120px] px-3 py-2 text-sm font-semibold text-black transition-colors ${
                            buyState === "confirmed"
                              ? "bg-[#44ff88]"
                              : "bg-[var(--accent)] hover:bg-[var(--accent-dim)]"
                          }`}
                        >
                          {buyState === "buying" ? "Confirming..." : buyState === "confirmed" ? "Purchased" : "Buy Now"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {filteredListings.length === 0 ? (
              <div className="border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted)]">
                No skill NFTs match that search. Try another domain or widen the query.
              </div>
            ) : null}

            {showMyListings ? (
              <section className="border border-[var(--card-border)] bg-[var(--card)] p-5">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--accent)]">My Listings</div>
                    <h2 className="mt-2 text-2xl">Active sell orders</h2>
                  </div>
                  <button
                    onClick={() => setShowMintPanel(true)}
                    className="border border-[var(--accent)] px-3 py-2 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
                  >
                    Mint Another
                  </button>
                </div>
                <div className="space-y-3">
                  {myListings.map((listing) => {
                    const domainMeta = DOMAIN_META[listing.domain];
                    const rarityMeta = RARITY_META[listing.rarity];

                    return (
                      <div key={listing.id} className="grid gap-4 border border-[var(--card-border)] bg-black/20 p-4 lg:grid-cols-[1.5fr_1fr_auto] lg:items-center">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg">{listing.skillName}</span>
                            <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${domainMeta.badgeClass}`}>{domainMeta.label}</span>
                            <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${rarityMeta.className}`}>{listing.rarity}</span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
                            <span>Asking ⬡{listing.price.toLocaleString()}</span>
                            <span>Highest bid ⬡{listing.highestBid.toLocaleString()}</span>
                            <span>{listing.watchers} watchers</span>
                          </div>
                        </div>
                        <div className="text-sm">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">Status</div>
                          <div className="mt-2 text-[var(--accent)]">
                            {listing.status === "bid-war" ? "Bid war live" : listing.status === "cooldown" ? "Cooldown window" : "Live listing"}
                          </div>
                          <div className="mt-1 text-xs text-[var(--muted)]">
                            {listing.status === "bid-war"
                              ? "Multiple buyers are negotiating transfer rights."
                              : listing.status === "cooldown"
                                ? "Recently updated, bids reopen after verification."
                                : "Listed on the public market with instant buy enabled."}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button className="border border-[var(--card-border)] px-3 py-2 text-sm hover:border-[var(--accent)] hover:text-[var(--accent)]">
                            View Bids
                          </button>
                          <button
                            onClick={() => handleDelist(listing.id)}
                            className="border border-[#ff4444]/40 px-3 py-2 text-sm text-[#ff8d8d] hover:bg-[#ff4444]/10"
                          >
                            Delist
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-6">
            <section className="border border-[var(--card-border)] bg-[var(--card)] p-5">
              <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--accent)]">Preview Terminal</div>
              {selectedPreview ? (
                <>
                  <h2 className="mt-3 text-2xl">{selectedPreview.skillName}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${DOMAIN_META[selectedPreview.domain].badgeClass}`}>
                      {DOMAIN_META[selectedPreview.domain].label}
                    </span>
                    <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${RARITY_META[selectedPreview.rarity].className}`}>
                      {selectedPreview.rarity}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{selectedPreview.summary}</p>
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[var(--muted)]">Seller</span>
                      <span>{selectedPreview.seller}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[var(--muted)]">Maiat trust</span>
                      <span>{selectedPreview.trustScore}/100</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[var(--muted)]">Transfer success</span>
                      <span>{selectedPreview.transferSuccessRate}%</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="text-[var(--muted)]">Original source</span>
                      <span>{selectedPreview.originalSource}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--muted)]">Instant buy</span>
                      <span className="text-[var(--accent)]">⬡{selectedPreview.price.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </section>

            <section className="border border-[var(--card-border)] bg-[var(--card)] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--accent)]">Live Activity</div>
                  <h2 className="mt-2 text-xl">Recent sales</h2>
                </div>
                <span className="text-xs text-[var(--muted)]">Streaming</span>
              </div>
              <div className="space-y-3">
                {ACTIVITY_FEED.map((item) => (
                  <div key={item.id} className="border border-[var(--card-border)] bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`text-xs uppercase tracking-[0.18em] ${DOMAIN_META[item.domain].pillClass}`}>
                        {DOMAIN_META[item.domain].label}
                      </span>
                      <span className="text-xs text-[var(--muted)]">{formatMinutesAgo(item.minutesAgo)}</span>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-[var(--accent)]">{item.buyer}</span> bought <span>{item.skillName}</span> from{" "}
                      <span className="text-[var(--foreground)]">{item.seller}</span>
                    </div>
                    <div className="mt-2 text-sm text-[var(--muted)]">Sale price ⬡{item.price.toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>

        {mintNotice ? (
          <div className="mt-6 border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--accent)]">
            {mintNotice}
          </div>
        ) : null}

        {showMintPanel ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6">
            <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-[var(--card-border)] bg-[linear-gradient(180deg,rgba(17,17,17,0.98),rgba(6,6,6,0.98))] p-6">
              <button
                onClick={() => setShowMintPanel(false)}
                className="absolute right-4 top-4 text-sm text-[var(--muted)] hover:text-white"
                aria-label="Close mint panel"
              >
                Close
              </button>

              <div className="text-[10px] uppercase tracking-[0.24em] text-[var(--accent)]">Mint New Skill</div>
              <h2 className="mt-3 text-3xl">Tokenize an earned behavior</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                Package a learned capability with a rarity estimate, transfer rights, and a public MAIAT price. Non-exclusive listings allow multiple buyers; exclusive listings auction off a single canonical transfer.
              </p>

              <form onSubmit={handleMintSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Skill Name</div>
                    <input
                      value={mintForm.skillName}
                      onChange={(event) => handleMintChange("skillName", event.target.value)}
                      className="w-full border border-[var(--card-border)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                      placeholder="Ex: Retrieval Failure Triage"
                    />
                  </label>

                  <label className="block">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Domain</div>
                    <select
                      value={mintForm.domain}
                      onChange={(event) => handleMintChange("domain", event.target.value as SkillDomain)}
                      className="w-full border border-[var(--card-border)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    >
                      {DOMAIN_TABS.filter((tab): tab is { id: SkillDomain; label: string } => tab.id !== "all").map((tab) => (
                        <option key={tab.id} value={tab.id}>
                          {tab.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block">
                  <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Description</div>
                  <textarea
                    value={mintForm.description}
                    onChange={(event) => handleMintChange("description", event.target.value)}
                    className="min-h-28 w-full border border-[var(--card-border)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    placeholder="Describe the learned pattern, where it came from, and why buyers want it."
                  />
                </label>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Price (MAIAT)</div>
                    <input
                      type="number"
                      min="1"
                      value={mintForm.price}
                      onChange={(event) => handleMintChange("price", event.target.value)}
                      className="w-full border border-[var(--card-border)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                      placeholder="1200"
                    />
                  </label>

                  <label className="block">
                    <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Rarity Assessment</div>
                    <select
                      value={mintForm.rarity}
                      onChange={(event) => handleMintChange("rarity", event.target.value as RarityTier)}
                      className="w-full border border-[var(--card-border)] bg-black/40 px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
                    >
                      {Object.keys(RARITY_META).map((rarity) => (
                        <option key={rarity} value={rarity}>
                          {rarity}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div>
                  <div className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Transfer Rights</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => handleMintChange("intent", "exclusive")}
                      className={`border px-4 py-3 text-left transition-colors ${
                        mintForm.intent === "exclusive"
                          ? "border-[var(--accent)] bg-[var(--accent)]/10"
                          : "border-[var(--card-border)] bg-black/20"
                      }`}
                    >
                      <div className="text-sm">Exclusive</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">Single canonical buyer, higher scarcity, stronger bid competition.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMintChange("intent", "non-exclusive")}
                      className={`border px-4 py-3 text-left transition-colors ${
                        mintForm.intent === "non-exclusive"
                          ? "border-[var(--accent)] bg-[var(--accent)]/10"
                          : "border-[var(--card-border)] bg-black/20"
                      }`}
                    >
                      <div className="text-sm">Non-Exclusive</div>
                      <div className="mt-1 text-xs text-[var(--muted)]">Repeatable skill transfer, lower scarcity, broader buyer pool.</div>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black hover:bg-[var(--accent-dim)]">
                    Mint Skill NFT
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMintForm(INITIAL_MINT_FORM);
                      setMintNotice(null);
                    }}
                    className="border border-[var(--card-border)] px-4 py-2 text-sm hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    Reset
                  </button>
                </div>

                {mintNotice ? <div className="text-sm text-[var(--accent)]">{mintNotice}</div> : null}
              </form>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
