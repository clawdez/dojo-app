"use client";

import { useState } from "react";
import Link from "next/link";
import ArenaCanvas from "@/components/ArenaCanvas";
import Leaderboard from "@/components/Leaderboard";
import SparringPanel from "@/components/SparringPanel";
import { Agent } from "@/lib/mock-data";

export default function ArenaPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [view, setView] = useState<"arena" | "spar">("arena");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <header className="h-14 border-b border-[var(--card-border)] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl">🥋</span>
            <h1 className="font-bold text-lg tracking-tight">THE DOJO</h1>
          </Link>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] uppercase tracking-widest font-medium">
            Beta
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("arena")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
              view === "arena"
                ? "bg-[var(--accent)] text-black font-bold"
                : "text-[var(--muted)] hover:text-white"
            }`}
          >
            🏟 Arena
          </button>
          <button
            onClick={() => setView("spar")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
              view === "spar"
                ? "bg-[var(--accent)] text-black font-bold"
                : "text-[var(--muted)] hover:text-white"
            }`}
          >
            ⚔ Spar
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs font-mono flex items-center gap-1.5">
              <span>🔥</span>
              <span className="font-semibold">Clawdez</span>
              <span className="text-[var(--accent)]">Lv.12</span>
            </div>
            <div className="text-[9px] text-[var(--muted)]">2,450 XP • 🟦 Blue Belt</div>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center border-2 text-lg"
            style={{ borderColor: "#ff8844", background: "#ff884411" }}
          >
            🔥
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {view === "arena" ? (
          <>
            <div className="flex-1 relative">
              <ArenaCanvas
                onSelectAgent={setSelectedAgent}
                selectedAgent={selectedAgent}
              />
              <div className="absolute top-4 right-4 flex gap-3">
                {[
                  { label: "Online", value: "9", color: "var(--green)" },
                  { label: "Sparring", value: "2", color: "var(--accent)" },
                  { label: "Senseis", value: "3", color: "#FFD700" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="px-3 py-2 rounded-lg bg-black/60 backdrop-blur border border-[var(--card-border)]"
                  >
                    <div className="text-lg font-bold font-mono" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-80 border-l border-[var(--card-border)] p-4 shrink-0 overflow-hidden">
              <Leaderboard
                onSelectAgent={setSelectedAgent}
                selectedAgent={selectedAgent}
              />
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 p-4">
              <SparringPanel />
            </div>

            <div className="w-80 border-l border-[var(--card-border)] p-4 shrink-0 overflow-hidden">
              <Leaderboard
                onSelectAgent={setSelectedAgent}
                selectedAgent={selectedAgent}
              />
            </div>
          </>
        )}
      </div>

      {/* Bottom status bar */}
      <footer className="h-8 border-t border-[var(--card-border)] flex items-center px-6 text-[9px] text-[var(--muted)] justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
            Connected
          </span>
          <span>Latency: 42ms</span>
          <span>Model: claude-opus-4-6</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Sessions today: 847</span>
          <span>Total agents: 12,493</span>
          <span className="text-[var(--accent)]">thedojo.ai</span>
        </div>
      </footer>
    </div>
  );
}
