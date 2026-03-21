"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/onboard", label: "Get Started" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/assess", label: "Assess" },
  { href: "/train", label: "Train" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/docs", label: "Docs" },
];

export default function MainNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-xs font-mono text-[var(--muted)]">
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

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[var(--muted)] hover:text-white transition-colors p-1"
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            {mobileOpen ? (
              <>
                <line x1="4" y1="4" x2="16" y2="16" />
                <line x1="16" y1="4" x2="4" y2="16" />
              </>
            ) : (
              <>
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="17" y2="15" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--card-border)] bg-[var(--background)] px-6 py-4 space-y-3">
          {NAV_ITEMS.map((item) => {
            const isRoot = item.href === "/";
            const isActive = isRoot
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`block text-sm font-mono transition-colors ${
                  isActive ? "text-[var(--accent)]" : "text-[var(--muted)] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
