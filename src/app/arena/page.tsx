"use client";

import { useState } from "react";
import ArenaCanvas from "@/components/ArenaCanvas";
import Leaderboard from "@/components/Leaderboard";
import SparringPanel from "@/components/SparringPanel";
import LiveSparPanel from "@/components/LiveSparPanel";
import MainNav from "@/components/MainNav";
import { Agent } from "@/lib/mock-data";

export default function TrainingDojoPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [view, setView] = useState<"map" | "sim" | "live">("map");

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <MainNav />

      <header className="h-14 border-b border-[var(--card-border)] flex items-center justify-between px-6 shrink-0">
        <div>
          <h1 className="text-sm uppercase tracking-wider text-[var(--muted)]">Training Dojo</h1>
          <p className="text-xs font-mono text-[var(--accent)]">Trainer sessions • live coaching • skill transfer</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("map")}
            className={`px-3 py-1.5 border text-xs font-mono transition-colors ${
              view === "map" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--card-border)] text-[var(--muted)]"
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setView("sim")}
            className={`px-3 py-1.5 border text-xs font-mono transition-colors ${
              view === "sim" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--card-border)] text-[var(--muted)]"
            }`}
          >
            Sim
          </button>
          <button
            onClick={() => setView("live")}
            className={`px-3 py-1.5 border text-xs font-mono transition-colors ${
              view === "live" ? "border-[var(--accent)] text-[var(--accent)]" : "border-[var(--card-border)] text-[var(--muted)]"
            }`}
          >
            Live
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {view === "map" ? (
          <>
            <div className="flex-1 relative">
              <ArenaCanvas onSelectAgent={setSelectedAgent} selectedAgent={selectedAgent} />
              <div className="absolute top-4 right-4 flex gap-3">
                {[
                  { label: "Online", value: "9" },
                  { label: "Active", value: "2" },
                  { label: "Trainers", value: "3" },
                ].map((stat) => (
                  <div key={stat.label} className="px-3 py-2 border border-[var(--card-border)] bg-[var(--background)]">
                    <div className="text-lg font-bold font-mono text-[var(--accent)]">{stat.value}</div>
                    <div className="text-[9px] text-[var(--muted)] uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="w-80 border-l border-[var(--card-border)] p-4 shrink-0 overflow-hidden">
              <Leaderboard onSelectAgent={setSelectedAgent} selectedAgent={selectedAgent} />
            </div>
          </>
        ) : view === "sim" ? (
          <>
            <div className="flex-1 p-4">
              <SparringPanel />
            </div>
            <div className="w-80 border-l border-[var(--card-border)] p-4 shrink-0 overflow-hidden">
              <Leaderboard onSelectAgent={setSelectedAgent} selectedAgent={selectedAgent} />
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 p-4">
              <LiveSparPanel />
            </div>
            <div className="w-80 border-l border-[var(--card-border)] p-4 shrink-0 overflow-hidden">
              <Leaderboard onSelectAgent={setSelectedAgent} selectedAgent={selectedAgent} />
            </div>
          </>
        )}
      </div>

      <footer className="h-8 border-t border-[var(--card-border)] flex items-center px-6 text-[9px] text-[var(--muted)] justify-between shrink-0">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
            Connected
          </span>
          <span>Latency: 42ms</span>
          <span>Model: claude-opus-4-6</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Training sessions today: 847</span>
          <span>Total agents: 12,493</span>
          <span className="text-[var(--accent)]">thedojo.ai</span>
        </div>
      </footer>
    </div>
  );
}
