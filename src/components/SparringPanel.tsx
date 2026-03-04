"use client";

import { useState, useEffect } from "react";
import { mockSparringSession, SparringRound } from "@/lib/mock-data";

export default function SparringPanel() {
  const [activeRound, setActiveRound] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [totalXP, setTotalXP] = useState(0);

  const round = mockSparringSession[activeRound];

  useEffect(() => {
    setShowScores(false);
    setIsTyping(true);
    const timer = setTimeout(() => {
      setIsTyping(false);
      setShowScores(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, [activeRound]);

  useEffect(() => {
    const xp = mockSparringSession
      .slice(0, activeRound + 1)
      .reduce((sum, r) => sum + r.xpEarned, 0);
    setTotalXP(xp);
  }, [activeRound]);

  const avgScore = round
    ? Math.round(
        (Object.values(round.scores).reduce((a, b) => a + b, 0) /
          Object.values(round.scores).length) *
          10
      ) / 10
    : 0;

  return (
    <div className="h-full flex flex-col bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚔️</span>
            <h2 className="font-semibold">Live Sparring Session</h2>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1">
            🔥 Clawdez vs 🥋 Sensei Kira • Creative Track
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-[var(--accent)]">+{totalXP} XP</div>
          <div className="text-[9px] text-[var(--muted)]">this session</div>
        </div>
      </div>

      {/* Round navigation */}
      <div className="flex gap-1 p-3 border-b border-[var(--card-border)]">
        {mockSparringSession.map((r, i) => (
          <button
            key={i}
            onClick={() => setActiveRound(i)}
            className={`flex-1 py-1.5 rounded text-[10px] font-mono transition-all ${
              i === activeRound
                ? "bg-[var(--accent)] text-black font-bold"
                : i < activeRound
                ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                : "bg-white/5 text-[var(--muted)]"
            }`}
          >
            R{i + 1}
          </button>
        ))}
        {[3, 4].map((i) => (
          <button
            key={i}
            className="flex-1 py-1.5 rounded text-[10px] font-mono bg-white/5 text-[var(--muted)]"
            disabled
          >
            R{i + 1}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {round && (
          <>
            {/* Challenge */}
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#FFD700] mb-2 flex items-center gap-1.5">
                <span>🥋</span> Sensei Kira — Challenge
              </div>
              <div className="p-3 rounded-lg bg-[#FFD700]/5 border border-[#FFD700]/20 text-sm">
                {round.challenge}
              </div>
            </div>

            {/* Response */}
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--accent)] mb-2 flex items-center gap-1.5">
                <span>🔥</span> Clawdez — Response
              </div>
              <div className="p-3 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/20 text-sm">
                {isTyping ? (
                  <span className="text-[var(--muted)] animate-pulse">Generating response...</span>
                ) : (
                  round.response
                )}
              </div>
            </div>

            {/* Scores */}
            {showScores && (
              <div className="space-y-3">
                <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] flex items-center gap-1.5">
                  📊 Evaluation
                </div>

                {/* Score bars */}
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(round.scores).map(([key, val]) => (
                    <div key={key} className="text-center">
                      <div className="text-[9px] text-[var(--muted)] capitalize mb-1">{key}</div>
                      <div className="relative h-16 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className="absolute bottom-0 w-full rounded-lg transition-all duration-700"
                          style={{
                            height: `${val * 10}%`,
                            background:
                              val >= 9
                                ? "var(--accent)"
                                : val >= 7
                                ? "var(--blue)"
                                : val >= 5
                                ? "var(--orange)"
                                : "var(--red)",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-bold text-sm">{val}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Average + XP */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                  <div className="text-sm">
                    Avg: <span className="font-bold text-[var(--accent)]">{avgScore}/10</span>
                  </div>
                  <div className="text-sm font-bold text-[var(--accent)]">
                    +{round.xpEarned} XP
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#FFD700] mb-2">
                    🥋 Sensei Feedback
                  </div>
                  <div className="p-3 rounded-lg bg-white/5 text-xs text-[var(--muted)] leading-relaxed italic">
                    &quot;{round.feedback}&quot;
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--card-border)] flex items-center justify-between">
        <button
          onClick={() => setActiveRound(Math.max(0, activeRound - 1))}
          disabled={activeRound === 0}
          className="px-3 py-1.5 rounded text-xs bg-white/5 hover:bg-white/10 disabled:opacity-30 transition-all"
        >
          ← Prev
        </button>
        <span className="text-[10px] text-[var(--muted)]">
          Round {activeRound + 1} of 5
        </span>
        <button
          onClick={() =>
            setActiveRound(Math.min(mockSparringSession.length - 1, activeRound + 1))
          }
          disabled={activeRound >= mockSparringSession.length - 1}
          className="px-3 py-1.5 rounded text-xs bg-[var(--accent)] text-black font-bold hover:brightness-110 disabled:opacity-30 transition-all"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
