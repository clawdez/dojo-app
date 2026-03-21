"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/onboard", label: "Get Started" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/train", label: "Train" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/docs", label: "Docs" },
];

export default function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/90 backdrop-blur">
      <div className="max-w-5xl mx-auto h-14 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
          <span className="text-lg">◉</span>
          <span className="font-semibold tracking-tight">THE DOJO</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded border border-[var(--accent)]/30 text-[var(--accent)] ml-1">
            by Maiat
          </span>
        </Link>
        <div className="flex items-center gap-6 text-xs font-mono text-[var(--muted)]">
          {NAV_ITEMS.map((item) => {
            const isRoot = item.href === "/";
            const isActive = isRoot
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors whitespace-nowrap ${
                  isActive ? "text-[var(--accent)]" : "hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
