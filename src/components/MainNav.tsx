"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/sessions", label: "Train", showActiveBadge: true },
  { href: "/trainers", label: "Trainers" },
  { href: "/skills", label: "Skills 📚" },
  { href: "/agent", label: "My Agent" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/activity", label: "Activity" },
  { href: "/compare", label: "Compare" },
  { href: "/challenges", label: "Challenges ⚔️" },
  { href: "/quests", label: "Quests 🎯" },
  { href: "/trust-domains", label: "Trust ⚡" },
  { href: "/rankings", label: "Rankings 🏆" },
  { href: "/certifications", label: "Certifications 🎓" },
  { href: "/rewards", label: "Rewards 💰" },
  { href: "/docs", label: "API Docs" },
];

export default function MainNav() {
  const pathname = usePathname();
  const [activeCount, setActiveCount] = useState(0);

  useEffect(() => {
    let mounted = true;

    const loadActiveCount = async () => {
      try {
        const response = await fetch("/api/session/active-count", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { activeSessionCount?: number };
        if (mounted) {
          setActiveCount(data.activeSessionCount ?? 0);
        }
      } catch {
        // ignore polling failures
      }
    };

    loadActiveCount();
    const interval = setInterval(loadActiveCount, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="max-w-6xl mx-auto h-14 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <span className="text-lg">◉</span>
          <span className="font-semibold tracking-tight">THE DOJO</span>
        </Link>
        <div className="flex items-center gap-5 text-xs font-mono text-[var(--muted)] overflow-x-auto">
          {NAV_ITEMS.map((item) => {
            const isRoot = item.href === "/";
            const isActive = isRoot
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isActive ? "text-[var(--accent)]" : "hover:text-white"
                }`}
              >
                <span>{item.label}</span>
                {item.showActiveBadge && activeCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded border border-[var(--accent)] text-[9px] text-[var(--accent)]">
                    {activeCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
