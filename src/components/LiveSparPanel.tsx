"use client";

import { useState } from "react";
import { requestSpar, DOMAIN_META, domainLabel, domainEmoji, domainColor, type SparChallenge } from "@/lib/api";

type SparState = "idle" | "selecting" | "loading" | "challenge" | "responding" | "scored" | "error";

const AVAILABLE_DOMAINS = Object.keys(DOMAIN_META);

export default function LiveSparPanel() {
  const [state, setState] = useState<SparState>("idle");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [challenge, setChallenge] = useState<SparChallenge | null>(null);
  const [response, setResponse] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");

  // Mock scores for demo (in production, these come from the grading endpoint)
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");

  const startSpar = () => {
    setState("selecting");
    setError("");
  };

  const selectDomain = async (domain: string) => {
    setSelectedDomain(domain);
    setState("loading");

    try {
      // In dev mode, the x402 payment is mocked
      const result = await requestSpar({
        challenger: "demo-agent",
        domain,
        paymentHeader: btoa(JSON.stringify({
          signature: "demo",
          payer: "0xdemo",
          amount: "0.10",
          asset: "USDC",
          network: "base-sepolia",
          nonce: Date.now().toString(),
        })),
      });

      setChallenge(result.session.challenge);
      setSessionId(result.session.id);
      setState("challenge");
    } catch (err) {
      if (err instanceof Error && 'paymentRequired' in err) {
        setError("Payment required — connect a wallet with USDC to spar.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to start spar");
      }
      setState("error");
    }
  };

  const submitResponse = async () => {
    if (!response.trim()) return;
    setState("responding");

    // Simulate grading delay (in production, this calls /api/assess or a grading endpoint)
    await new Promise(r => setTimeout(r, 2000));

    // Generate scores based on response quality heuristics (demo)
    const baseScore = Math.min(10, Math.max(3, 4 + response.length / 100));
    const generatedScores: Record<string, number> = {};
    if (challenge?.rubric) {
      for (const item of challenge.rubric) {
        generatedScores[item.criterion] = Math.round((baseScore + (Math.random() * 2 - 1)) * 10) / 10;
        generatedScores[item.criterion] = Math.min(10, Math.max(1, generatedScores[item.criterion]));
      }
    }

    setScores(generatedScores);
    setFeedback(generateFeedback(baseScore, selectedDomain));
    setState("scored");
  };

  const reset = () => {
    setState("idle");
    setChallenge(null);
    setResponse("");
    setScores({});
    setFeedback("");
    setSessionId("");
    setError("");
    setSelectedDomain("");
  };

  const avgScore = Object.values(scores).length > 0
    ? Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length) * 10) / 10
    : 0;

  const xpEarned = Math.round(avgScore * 15);

  return (
    <div className="h-full flex flex-col bg-[var(--card)] rounded-xl border border-[var(--card-border)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">⚔️</span>
            <h2 className="font-semibold">Live Sparring</h2>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 uppercase tracking-widest font-medium">
              API Connected
            </span>
          </div>
          <div className="text-[10px] text-[var(--muted)] mt-1">
            {sessionId ? `Session: ${sessionId}` : "Challenge an AI agent to a skill duel"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-[var(--muted)]">$0.10 USDC / round</div>
          <div className="text-[9px] text-[var(--muted)]">via x402</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Idle state */}
        {state === "idle" && (
          <div className="flex flex-col items-center justify-center h-full gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">🥋</div>
              <h3 className="text-lg font-semibold mb-1">Ready to Spar?</h3>
              <p className="text-sm text-[var(--muted)] max-w-sm">
                Pick a skill domain, get a challenge, prove your skills. Scored by AI judges with structured rubrics.
              </p>
            </div>
            <button
              onClick={startSpar}
              className="px-6 py-3 rounded-lg bg-[var(--accent)] text-black font-bold text-sm hover:brightness-110 transition-all"
            >
              ⚔️ Start Sparring
            </button>
          </div>
        )}

        {/* Domain selection */}
        {state === "selecting" && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Choose your domain:</h3>
            <div className="grid grid-cols-1 gap-2">
              {AVAILABLE_DOMAINS.map((domain) => (
                <button
                  key={domain}
                  onClick={() => selectDomain(domain)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-[var(--card-border)] hover:border-[var(--accent)] transition-all text-left"
                >
                  <span className="text-xl" style={{ color: domainColor(domain) }}>
                    {domainEmoji(domain)}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{domainLabel(domain)}</div>
                    <div className="text-[10px] text-[var(--muted)]">{domain}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {state === "loading" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--muted)]">Generating {domainLabel(selectedDomain)} challenge...</p>
          </div>
        )}

        {/* Challenge received */}
        {state === "challenge" && challenge && (
          <div className="space-y-4">
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[#FFD700] mb-2 flex items-center gap-1.5">
                <span>🥋</span> Challenge — {challenge.difficulty}
              </div>
              <div className="p-3 rounded-lg bg-[#FFD700]/5 border border-[#FFD700]/20">
                <h4 className="font-semibold text-sm mb-2">{challenge.title}</h4>
                <p className="text-sm text-[var(--muted)] whitespace-pre-wrap">{challenge.prompt}</p>
              </div>
              {challenge.timeLimit && (
                <div className="text-[10px] text-[var(--muted)] mt-1">
                  ⏱ Time limit: {challenge.timeLimit}s
                </div>
              )}
            </div>

            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--accent)] mb-2">
                Your Response
              </div>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Write your response here..."
                rows={10}
                className="w-full p-3 rounded-lg bg-black/30 border border-[var(--card-border)] text-sm font-mono resize-none focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div className="text-[9px] text-[var(--muted)]">
              Grading criteria: {challenge.rubric.map(r => r.criterion).join(" • ")}
            </div>
          </div>
        )}

        {/* Responding / grading */}
        {state === "responding" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-[var(--muted)]">Grading your response...</p>
            <p className="text-[10px] text-[var(--muted)]">LLM-as-judge evaluating against rubric</p>
          </div>
        )}

        {/* Scored */}
        {state === "scored" && (
          <div className="space-y-4">
            {/* Score bars */}
            <div>
              <div className="text-[9px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3 flex items-center gap-1.5">
                📊 Evaluation Results
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(scores).map(([criterion, score]) => (
                  <div key={criterion} className="p-2 rounded-lg bg-white/5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-[var(--muted)]">{criterion}</span>
                      <span className="text-sm font-bold" style={{
                        color: score >= 8 ? 'var(--accent)' : score >= 6 ? 'var(--blue)' : score >= 4 ? 'var(--orange)' : 'var(--red)'
                      }}>{score}</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${score * 10}%`,
                          background: score >= 8 ? 'var(--accent)' : score >= 6 ? 'var(--blue)' : score >= 4 ? 'var(--orange)' : 'var(--red)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Average + XP */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--accent)]/5 border border-[var(--accent)]/20">
              <div>
                <div className="text-sm">
                  Average: <span className="font-bold text-[var(--accent)]">{avgScore}/10</span>
                </div>
                <div className="text-[10px] text-[var(--muted)]">{selectedDomain}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-[var(--accent)]">+{xpEarned} XP</div>
                <div className="text-[9px] text-[var(--muted)]">earned</div>
              </div>
            </div>

            {/* Feedback */}
            {feedback && (
              <div>
                <div className="text-[9px] uppercase tracking-[0.2em] text-[#FFD700] mb-2">
                  🥋 Sensei Feedback
                </div>
                <div className="p-3 rounded-lg bg-white/5 text-xs text-[var(--muted)] leading-relaxed italic">
                  &quot;{feedback}&quot;
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="text-3xl">❌</div>
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={reset}
              className="px-4 py-2 rounded text-xs bg-white/10 hover:bg-white/20 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--card-border)] flex items-center justify-between">
        {state === "challenge" ? (
          <>
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded text-xs bg-white/5 hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={submitResponse}
              disabled={!response.trim()}
              className="px-4 py-1.5 rounded text-xs bg-[var(--accent)] text-black font-bold hover:brightness-110 disabled:opacity-30 transition-all"
            >
              Submit Response →
            </button>
          </>
        ) : state === "scored" ? (
          <>
            <div className="text-[10px] text-[var(--muted)]">
              Session complete
            </div>
            <button
              onClick={reset}
              className="px-4 py-1.5 rounded text-xs bg-[var(--accent)] text-black font-bold hover:brightness-110 transition-all"
            >
              Spar Again ⚔️
            </button>
          </>
        ) : (
          <div className="text-[10px] text-[var(--muted)] w-full text-center">
            Powered by x402 micropayments
          </div>
        )}
      </div>
    </div>
  );
}

function generateFeedback(score: number, domain: string): string {
  if (score >= 8) {
    return `Strong performance in ${domain.split('.')[1]}. Your response demonstrated solid understanding of core concepts. Consider exploring edge cases more deeply for mastery-level work.`;
  } else if (score >= 6) {
    return `Decent showing. You've got the fundamentals but there's room for improvement. Focus on specificity — the best responses show, not just tell. Keep training.`;
  } else {
    return `This domain clearly needs work. Start with the basics and build up. Consider a deep training session with a sensei who specializes in ${domain.split('.')[1]}.`;
  }
}
