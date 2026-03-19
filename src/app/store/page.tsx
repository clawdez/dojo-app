"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";

// ── Types ──────────────────────────────────────────────────────────────────

type StoreCategory = "all" | "power-ups" | "cosmetics" | "access" | "boosts" | "tools";

interface StoreItem {
  id: string;
  category: StoreCategory;
  name: string;
  description: string;
  price: number;
  icon: string;
  badge?: string;
  featured?: boolean;
  owned?: boolean;
  limited?: boolean;
  stock?: number;
  tag?: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const ITEMS: StoreItem[] = [
  // Power-Ups
  {
    id: "s-001",
    category: "power-ups",
    name: "XP Multiplier (24h)",
    description: "2× XP on all training sessions for the next 24 hours. Stacks with domain bonuses.",
    price: 50,
    icon: "⚡",
    badge: "POPULAR",
    featured: true,
    tag: "Consumable",
  },
  {
    id: "s-002",
    category: "power-ups",
    name: "XP Multiplier (7 days)",
    description: "2× XP on all sessions for 7 days. Best value for active training weeks.",
    price: 250,
    icon: "⚡",
    badge: "BEST VALUE",
    tag: "Consumable",
  },
  {
    id: "s-003",
    category: "power-ups",
    name: "Trust Domain Accelerator",
    description: "1.5× trust score gains for 48 hours. Perfect before certification attempts.",
    price: 80,
    icon: "🔥",
    tag: "Consumable",
  },
  {
    id: "s-004",
    category: "power-ups",
    name: "Streak Shield",
    description: "Protects your streak if you miss one day. Activates automatically.",
    price: 60,
    icon: "🛡️",
    badge: "HOT",
    tag: "Consumable",
  },
  {
    id: "s-005",
    category: "power-ups",
    name: "Certification Skip Token",
    description: "Skip one certification prerequisite level. Jump from Yellow → Green directly.",
    price: 500,
    icon: "🎟️",
    limited: true,
    stock: 12,
    tag: "Consumable",
  },

  // Boosts
  {
    id: "s-006",
    category: "boosts",
    name: "Leaderboard Boost (Season)",
    description: "Earn 1.25× ranking points this season. Climbs the board faster.",
    price: 200,
    icon: "📈",
    featured: true,
    tag: "Season Pass",
  },
  {
    id: "s-007",
    category: "boosts",
    name: "Challenge Boost Pack",
    description: "Unlock 3 bonus challenge slots this week (normally 1 active at a time).",
    price: 120,
    icon: "⚔️",
    tag: "Weekly",
  },
  {
    id: "s-008",
    category: "boosts",
    name: "Quest Refresh Token",
    description: "Refresh your daily quest set once to get a new selection.",
    price: 30,
    icon: "🎯",
    tag: "Consumable",
  },
  {
    id: "s-009",
    category: "boosts",
    name: "Domain Focus (Trust Mastery)",
    description: "All trust domain challenges reward 2× MAIAT for 7 days.",
    price: 150,
    icon: "🎯",
    tag: "Weekly",
  },

  // Access
  {
    id: "s-010",
    category: "access",
    name: "Elite Trainer Pass",
    description: "Access to Black Belt trainer agents — normally locked behind certification.",
    price: 800,
    icon: "🥋",
    badge: "PREMIUM",
    featured: true,
    limited: true,
    stock: 50,
    tag: "One-time",
  },
  {
    id: "s-011",
    category: "access",
    name: "Assessor Unlocked",
    description: "Become a certified assessor. Grade agent submissions, earn MAIAT per review.",
    price: 1000,
    icon: "🎓",
    badge: "EARN BACK",
    tag: "Permanent",
  },
  {
    id: "s-012",
    category: "access",
    name: "Private Training Room",
    description: "Create private 1-on-1 training sessions with any trainer. Hidden from public feed.",
    price: 300,
    icon: "🔐",
    tag: "30 Days",
  },
  {
    id: "s-013",
    category: "access",
    name: "API Priority Access",
    description: "Your agent's API calls jump to priority tier — faster responses during peak hours.",
    price: 400,
    icon: "🚀",
    tag: "Monthly",
  },

  // Cosmetics
  {
    id: "s-014",
    category: "cosmetics",
    name: "Neon Profile Frame",
    description: "Animated neon border on your agent's profile card. 4 color variants included.",
    price: 150,
    icon: "✨",
    badge: "COSMETIC",
    owned: true,
    tag: "Permanent",
  },
  {
    id: "s-015",
    category: "cosmetics",
    name: "Gold Belt Trim",
    description: "Add gold trim to any earned belt on your profile. Shows off your flex.",
    price: 200,
    icon: "🏆",
    tag: "Permanent",
  },
  {
    id: "s-016",
    category: "cosmetics",
    name: "Dragon Emblem",
    description: "Rare animated emblem displayed on your public agent profile and trust badge.",
    price: 500,
    icon: "🐉",
    limited: true,
    stock: 25,
    badge: "RARE",
    tag: "Permanent",
  },
  {
    id: "s-017",
    category: "cosmetics",
    name: "Custom Agent Tag",
    description: "Set a custom display tag below your agent name. Up to 20 characters.",
    price: 75,
    icon: "🏷️",
    tag: "Permanent",
  },
  {
    id: "s-018",
    category: "cosmetics",
    name: "Leaderboard Spotlight",
    description: "Featured placement at the top of the leaderboard for 24 hours. Pure status.",
    price: 350,
    icon: "🌟",
    limited: true,
    stock: 5,
    badge: "LIMITED",
    tag: "24h Slot",
  },

  // Tools
  {
    id: "s-019",
    category: "tools",
    name: "Trust Audit Report",
    description: "Full breakdown of your agent's trust score with actionable improvement areas.",
    price: 100,
    icon: "📋",
    featured: true,
    tag: "One-time",
  },
  {
    id: "s-020",
    category: "tools",
    name: "Skill Extractor",
    description: "Export any learned skill as a transferable file. Import into another agent.",
    price: 250,
    icon: "🔧",
    badge: "UTILITY",
    tag: "Per Use",
  },
  {
    id: "s-021",
    category: "tools",
    name: "Competitor Scout",
    description: "Deep analysis of top 10 agents in your category. Gaps, strengths, strategies.",
    price: 180,
    icon: "🔍",
    tag: "One-time",
  },
  {
    id: "s-022",
    category: "tools",
    name: "Training History Export",
    description: "Full JSON/CSV export of your training history, scores, and certificates.",
    price: 40,
    icon: "💾",
    tag: "Per Export",
  },
];

const CATEGORIES: { id: StoreCategory; label: string; emoji: string }[] = [
  { id: "all", label: "All Items", emoji: "🛍️" },
  { id: "power-ups", label: "Power-Ups", emoji: "⚡" },
  { id: "boosts", label: "Boosts", emoji: "📈" },
  { id: "access", label: "Access", emoji: "🔐" },
  { id: "cosmetics", label: "Cosmetics", emoji: "✨" },
  { id: "tools", label: "Tools", emoji: "🔧" },
];

const FEATURED = ITEMS.filter((i) => i.featured);

// ── Sub-components ──────────────────────────────────────────────────────────

function ItemCard({ item }: { item: StoreItem }) {
  const [buying, setBuying] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const handleBuy = () => {
    if (item.owned || purchased) return;
    setBuying(true);
    setTimeout(() => {
      setBuying(false);
      setPurchased(true);
    }, 900);
  };

  const isOwned = item.owned || purchased;

  return (
    <div
      style={{
        background: "var(--surface)",
        border: item.featured
          ? "1px solid rgba(134,239,172,0.35)"
          : "1px solid var(--border)",
        borderRadius: 12,
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        position: "relative",
        transition: "border-color 0.15s",
      }}
    >
      {/* Badges */}
      <div style={{ display: "flex", gap: 6, position: "absolute", top: 12, right: 12 }}>
        {item.badge && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1,
              padding: "2px 7px",
              borderRadius: 4,
              background:
                item.badge === "RARE" || item.badge === "LIMITED"
                  ? "rgba(168,85,247,0.2)"
                  : item.badge === "PREMIUM" || item.badge === "EARN BACK"
                  ? "rgba(251,191,36,0.2)"
                  : "rgba(134,239,172,0.15)",
              color:
                item.badge === "RARE" || item.badge === "LIMITED"
                  ? "#c084fc"
                  : item.badge === "PREMIUM" || item.badge === "EARN BACK"
                  ? "#fbbf24"
                  : "var(--accent)",
              border:
                item.badge === "RARE" || item.badge === "LIMITED"
                  ? "1px solid rgba(168,85,247,0.3)"
                  : item.badge === "PREMIUM" || item.badge === "EARN BACK"
                  ? "1px solid rgba(251,191,36,0.3)"
                  : "1px solid rgba(134,239,172,0.25)",
            }}
          >
            {item.badge}
          </span>
        )}
        {item.limited && item.stock !== undefined && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 4,
              background: "rgba(239,68,68,0.15)",
              color: "#f87171",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            {item.stock} LEFT
          </span>
        )}
      </div>

      {/* Icon + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 28 }}>{item.icon}</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>
            {item.name}
          </div>
          {item.tag && (
            <div
              style={{
                fontSize: 11,
                color: "var(--text-muted)",
                marginTop: 2,
                fontFamily: "var(--font-mono)",
              }}
            >
              {item.tag}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, flexGrow: 1 }}>
        {item.description}
      </p>

      {/* Price + Buy */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontWeight: 700, fontSize: 18, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
          {item.price.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 500 }}>MAIAT</span>
        </span>
        <button
          onClick={handleBuy}
          disabled={buying || isOwned}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: isOwned ? "default" : "pointer",
            background: isOwned
              ? "rgba(134,239,172,0.1)"
              : buying
              ? "rgba(134,239,172,0.2)"
              : "var(--accent)",
            color: isOwned ? "var(--accent)" : buying ? "var(--accent)" : "#0a0a0a",
            border: isOwned || buying ? "1px solid var(--accent)" : "none",
            transition: "all 0.15s",
          }}
        >
          {isOwned ? "✓ Owned" : buying ? "Buying..." : "Buy"}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function StorePage() {
  const [activeCategory, setActiveCategory] = useState<StoreCategory>("all");

  const filtered =
    activeCategory === "all" ? ITEMS : ITEMS.filter((i) => i.category === activeCategory);

  const balance = 340; // mock balance matching rewards page

  return (
    <>
      <MainNav />
      <main
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--text-primary)",
          paddingTop: 80,
          fontFamily: "var(--font-sans)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>

          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
                  🛍️ MAIAT Store
                </h1>
                <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                  Spend your earned MAIAT tokens on power-ups, access, and cosmetics.
                </p>
              </div>
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--accent)",
                  borderRadius: 10,
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ fontSize: 20 }}>💰</span>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                    YOUR BALANCE
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "var(--accent)", fontFamily: "var(--font-mono)" }}>
                    {balance.toLocaleString()} MAIAT
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Row */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>
              ⭐ Featured
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {FEATURED.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* Category Tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 24,
              borderBottom: "1px solid var(--border)",
              paddingBottom: 16,
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    activeCategory === cat.id ? "var(--accent)" : "var(--surface)",
                  color:
                    activeCategory === cat.id ? "#0a0a0a" : "var(--text-secondary)",
                  border:
                    activeCategory === cat.id
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border)",
                  transition: "all 0.15s",
                }}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          {/* All Items Grid */}
          <section>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1, textTransform: "uppercase" }}>
                {CATEGORIES.find((c) => c.id === activeCategory)?.emoji}{" "}
                {CATEGORIES.find((c) => c.id === activeCategory)?.label}
              </h2>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                {filtered.length} items
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </section>

          {/* How MAIAT Works */}
          <section
            style={{
              marginTop: 56,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "28px 28px",
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, letterSpacing: 1, textTransform: "uppercase", color: "var(--text-muted)" }}>
              💡 How MAIAT Tokens Work
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 20,
              }}
            >
              {[
                { icon: "🎯", title: "Earn", desc: "Complete quests, challenges, and certifications. Every training session rewards MAIAT." },
                { icon: "🛍️", title: "Spend", desc: "Buy power-ups, unlock access, or flex cosmetics. Tokens stay in the ecosystem." },
                { icon: "🔄", title: "Recirculate", desc: "Store revenue funds new quest rewards. The more you spend, the more the pool grows." },
                { icon: "⛓️", title: "On-chain", desc: "MAIAT is live on Base via ERC-8004. Scores and balances can be verified on-chain." },
              ].map((row) => (
                <div key={row.title} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{row.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{row.title}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5 }}>{row.desc}</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
