"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MainNav from "@/components/MainNav";
import type { ProofEntry } from "@/lib/proof-log";
import type { SkillEvolution } from "@/lib/skill-evolution";
import type { TrainingRecommendation } from "@/lib/training-recs";

interface EvolutionResponse {
  agentId: string;
  evolutions: SkillEvolution[];
  proofLog: ProofEntry[];
  proofContext: { domain: string; bonusContext: string[] }[];
  summary: {
    domainsTracked: number;
    averageScore: number;
    verifiedProofCount: number;
  };
}

interface RecommendationsResponse {
  agentId: string;
  recommendations: TrainingRecommendation[];
}

const PROOF_TYPES: ProofEntry["proofType"][] = ["commit", "deployment", "review", "output"];

function formatDomain(domain: string): string {
  return domain
    .split(".")
    .map((part) => part.replace(/-/g, " "))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" / ");
}

function formatShortDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SkillEvolutionPage() {
  const params = useParams<{ agentId: string }>();
  const agentId = params.agentId;
  const [evolutionData, setEvolutionData] = useState<EvolutionResponse | null>(null);
  const [recommendationData, setRecommendationData] = useState<RecommendationsResponse | null>(null);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [loading, setLoading] = useState(true);
  const [proofState, setProofState] = useState({
    domain: "",
    proofType: "commit" as ProofEntry["proofType"],
    evidence: "",
  });
  const [proofMessage, setProofMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const [evolutionRes, recommendationsRes] = await Promise.all([
          fetch(`/api/evolution?agentId=${agentId}`, { cache: "no-store" }),
          fetch(`/api/evolution/recommendations?agentId=${agentId}`, { cache: "no-store" }),
        ]);

        if (!evolutionRes.ok || !recommendationsRes.ok) {
          throw new Error("Failed to load skill evolution data.");
        }

        const evolutionJson = (await evolutionRes.json()) as EvolutionResponse;
        const recommendationsJson = (await recommendationsRes.json()) as RecommendationsResponse;

        if (!mounted) return;

        setEvolutionData(evolutionJson);
        setRecommendationData(recommendationsJson);

        const firstDomain = evolutionJson.evolutions[0]?.domain ?? "";
        setSelectedDomain((current) => current || firstDomain);
        setProofState((current) => ({ ...current, domain: current.domain || firstDomain }));
      } catch {
        if (mounted) {
          setEvolutionData({
            agentId,
            evolutions: [],
            proofLog: [],
            proofContext: [],
            summary: { domainsTracked: 0, averageScore: 0, verifiedProofCount: 0 },
          });
          setRecommendationData({ agentId, recommendations: [] });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [agentId]);

  const currentEvolution = useMemo(
    () => evolutionData?.evolutions.find((entry) => entry.domain === selectedDomain) ?? evolutionData?.evolutions[0] ?? null,
    [evolutionData, selectedDomain],
  );

  const currentRecommendations = useMemo(
    () =>
      recommendationData?.recommendations.filter((entry) => entry.domain === (currentEvolution?.domain ?? selectedDomain)) ??
      [],
    [recommendationData, currentEvolution, selectedDomain],
  );

  const currentProofContext = useMemo(
    () => evolutionData?.proofContext.find((entry) => entry.domain === (currentEvolution?.domain ?? selectedDomain)),
    [evolutionData, currentEvolution, selectedDomain],
  );

  async function handleProofSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProofMessage("");

    const response = await fetch("/api/evolution/proof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId,
        domain: proofState.domain,
        proofType: proofState.proofType,
        evidence: proofState.evidence,
      }),
    });

    const data = (await response.json()) as { proof?: ProofEntry; error?: string };
    if (!response.ok || !data.proof) {
      setProofMessage(data.error || "Proof submission failed.");
      return;
    }

    const proof = data.proof;

    setEvolutionData((current) =>
      current
        ? {
            ...current,
            proofLog: [proof, ...current.proofLog],
            proofContext: current.proofContext.map((entry) =>
              entry.domain === proof.domain && proof.verified
                ? {
                    ...entry,
                    bonusContext: [
                      `${proof.proofType.toUpperCase()}: ${proof.evidence} (verified via ${proof.verificationMethod})`,
                      ...entry.bonusContext,
                    ].slice(0, 3),
                  }
                : entry,
            ),
            summary: {
              ...current.summary,
              verifiedProofCount: current.summary.verifiedProofCount + (proof.verified ? 1 : 0),
            },
          }
        : current,
    );
    setProofState((current) => ({ ...current, evidence: "" }));
    setProofMessage(proof.verified ? "Proof logged and verified." : "Proof logged, but verification failed.");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(68,255,136,0.16),transparent_36%),var(--background)]">
      <MainNav />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase text-[var(--accent)] mb-3">Self-Improving Skills</p>
            <h1 className="text-4xl glow-accent mb-2">Evolution Chamber</h1>
            <p className="text-sm text-[var(--muted)] max-w-2xl">
              Continuous assessment history, proof-backed context, and targeted drills for the next belt jump.
            </p>
          </div>
          <Link
            href="/agent"
            className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] text-xs uppercase tracking-[0.2em] w-fit hover-pulse"
          >
            Back to My Agent
          </Link>
        </div>

        <section className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-5 border border-[rgba(68,255,136,0.22)] bg-black/40 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Tracked Domains</div>
            <div className="text-3xl text-[var(--accent)] mt-2">{evolutionData?.summary.domainsTracked ?? 0}</div>
          </div>
          <div className="p-5 border border-[rgba(68,255,136,0.22)] bg-black/40 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Average Score</div>
            <div className="text-3xl text-[var(--accent)] mt-2">{(evolutionData?.summary.averageScore ?? 0).toFixed(2)}</div>
          </div>
          <div className="p-5 border border-[rgba(68,255,136,0.22)] bg-black/40 backdrop-blur-sm">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Verified Proof</div>
            <div className="text-3xl text-[var(--accent)] mt-2">{evolutionData?.summary.verifiedProofCount ?? 0}</div>
          </div>
        </section>

        <section className="grid xl:grid-cols-[1.6fr_1fr] gap-5 mb-8">
          <div className="p-[1px] gradient-border">
            <div className="bg-[linear-gradient(180deg,rgba(6,16,10,0.96),rgba(5,5,8,0.96))] p-5 min-h-[28rem]">
              <div className="flex flex-wrap gap-2 mb-6">
                {(evolutionData?.evolutions ?? []).map((evolution) => (
                  <button
                    key={evolution.domain}
                    onClick={() => setSelectedDomain(evolution.domain)}
                    className={`px-3 py-2 text-[10px] uppercase tracking-[0.16em] border transition-colors ${
                      (currentEvolution?.domain ?? selectedDomain) === evolution.domain
                        ? "border-[var(--accent)] text-[var(--accent)] bg-[rgba(68,255,136,0.08)]"
                        : "border-[var(--card-border)] text-[var(--muted)] hover:text-white"
                    }`}
                  >
                    {formatDomain(evolution.domain)}
                  </button>
                ))}
              </div>

              {loading ? (
                <p className="text-sm text-[var(--muted)]">Loading evolution trace...</p>
              ) : !currentEvolution ? (
                <p className="text-sm text-[var(--muted)]">No evolution data tracked for this agent yet.</p>
              ) : (
                <>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-2">Current Domain</p>
                      <h2 className="text-2xl">{formatDomain(currentEvolution.domain)}</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-3 border border-[var(--card-border)] bg-black/30">
                        <div className="text-[var(--muted)] mb-1">Score</div>
                        <div className="text-[var(--accent)] text-lg">{currentEvolution.currentScore.toFixed(2)}</div>
                      </div>
                      <div className="p-3 border border-[var(--card-border)] bg-black/30">
                        <div className="text-[var(--muted)] mb-1">Trend</div>
                        <div className="text-[var(--accent)] text-lg capitalize">{currentEvolution.trend}</div>
                      </div>
                      <div className="p-3 border border-[var(--card-border)] bg-black/30">
                        <div className="text-[var(--muted)] mb-1">Rate</div>
                        <div className="text-[var(--accent)] text-lg">{currentEvolution.improvementRate.toFixed(2)}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="h-72 mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentEvolution.history}>
                        <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                        <XAxis
                          dataKey="assessedAt"
                          tickFormatter={formatShortDate}
                          stroke="#666666"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11 }}
                        />
                        <YAxis
                          domain={[0, 10]}
                          stroke="#666666"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11 }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#0b0d0c",
                            border: "1px solid rgba(68,255,136,0.28)",
                            color: "#ededed",
                          }}
                          labelFormatter={(value) => new Date(String(value)).toLocaleString()}
                          formatter={(value) => [
                            typeof value === "number" ? value.toFixed(2) : String(value),
                            "Score",
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#44ff88"
                          strokeWidth={3}
                          dot={{ r: 4, fill: "#44ff88", stroke: "#050508", strokeWidth: 2 }}
                          activeDot={{ r: 6, fill: "#C4FF3C" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="p-4 border border-[rgba(68,255,136,0.2)] bg-[rgba(68,255,136,0.06)]">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-2">Next Milestone</div>
                    <div className="text-lg">{currentEvolution.nextMilestone}</div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <section className="p-5 border border-[var(--card-border)] bg-black/35">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3">Strengths</p>
              <div className="flex flex-wrap gap-2">
                {(currentEvolution?.history.at(-1)?.strengths ?? []).map((item) => (
                  <span key={item} className="px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] border border-[rgba(68,255,136,0.28)] text-[var(--accent)]">
                    {item}
                  </span>
                ))}
                {(currentEvolution?.history.at(-1)?.strengths ?? []).length === 0 ? (
                  <span className="text-xs text-[var(--muted)]">No standout strengths detected yet.</span>
                ) : null}
              </div>
            </section>

            <section className="p-5 border border-[var(--card-border)] bg-black/35">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3">Weaknesses</p>
              <div className="flex flex-wrap gap-2">
                {(currentEvolution?.history.at(-1)?.weaknesses ?? []).map((item) => (
                  <span key={item} className="px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] border border-[rgba(255,68,68,0.28)] text-[#ff8f8f]">
                    {item}
                  </span>
                ))}
                {(currentEvolution?.history.at(-1)?.weaknesses ?? []).length === 0 ? (
                  <span className="text-xs text-[var(--muted)]">No critical weaknesses detected in the latest run.</span>
                ) : null}
              </div>
            </section>

            <section className="p-5 border border-[var(--card-border)] bg-black/35">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3">Proof Bonus Context</p>
              <div className="space-y-2">
                {(currentProofContext?.bonusContext ?? []).map((item) => (
                  <div key={item} className="text-xs text-[var(--foreground)] border border-[var(--card-border)] p-3 bg-black/30">
                    {item}
                  </div>
                ))}
                {(currentProofContext?.bonusContext ?? []).length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">No verified proof boosting this domain yet.</p>
                ) : null}
              </div>
            </section>
          </div>
        </section>

        <section className="grid xl:grid-cols-[1.25fr_0.95fr] gap-5">
          <div className="space-y-5">
            <section className="p-5 border border-[var(--card-border)] bg-black/35">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl">Training Recommendations</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {(currentRecommendations ?? []).length} active drills
                </span>
              </div>
              <div className="space-y-4">
                {currentRecommendations.map((recommendation) => (
                  <div key={`${recommendation.domain}-${recommendation.focusArea}`} className="p-4 border border-[rgba(68,255,136,0.16)] bg-[rgba(255,255,255,0.02)]">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] mb-1">{formatDomain(recommendation.domain)}</p>
                        <h3 className="text-base text-[var(--accent)]">{recommendation.focusArea}</h3>
                        <p className="text-sm text-[var(--muted)] mt-1">{recommendation.reason}</p>
                      </div>
                      <div className="text-[11px] uppercase tracking-[0.12em] text-right">
                        <div className={recommendation.improvedOnPreviousWeakness ? "text-[var(--accent)]" : "text-[#ff8f8f]"}>
                          {recommendation.improvedOnPreviousWeakness ? "Recovering" : "Needs Repetition"}
                        </div>
                        <div className="text-[var(--muted)] mt-1">{recommendation.improvementNote}</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start">
                      <div className="space-y-2">
                        {recommendation.exercises.map((exercise) => (
                          <div key={exercise} className="text-sm border border-[var(--card-border)] p-3 bg-black/25">
                            {exercise}
                          </div>
                        ))}
                      </div>
                      <div className="min-w-52 p-3 border border-[var(--card-border)] bg-black/30">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] mb-2">Suggested Coach</div>
                        <div className="text-base">{recommendation.suggestedTrainer.name}</div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--accent)] mt-1">
                          {recommendation.suggestedTrainer.type}
                        </div>
                        <p className="text-xs text-[var(--muted)] mt-2">{recommendation.suggestedTrainer.rationale}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {currentRecommendations.length === 0 ? (
                  <p className="text-sm text-[var(--muted)]">No recommendations available until an assessment snapshot is recorded.</p>
                ) : null}
              </div>
            </section>

            <section className="p-5 border border-[var(--card-border)] bg-black/35">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl">Proof Log</h2>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                  {(evolutionData?.proofLog ?? []).length} entries
                </span>
              </div>

              <form onSubmit={handleProofSubmit} className="grid md:grid-cols-[1fr_9rem] gap-3 mb-5">
                <select
                  value={proofState.domain}
                  onChange={(event) => setProofState((current) => ({ ...current, domain: event.target.value }))}
                  className="px-3 py-2 bg-black/40 border border-[var(--card-border)] text-sm"
                >
                  {(evolutionData?.evolutions ?? []).map((evolution) => (
                    <option key={evolution.domain} value={evolution.domain}>
                      {formatDomain(evolution.domain)}
                    </option>
                  ))}
                </select>
                <select
                  value={proofState.proofType}
                  onChange={(event) =>
                    setProofState((current) => ({ ...current, proofType: event.target.value as ProofEntry["proofType"] }))
                  }
                  className="px-3 py-2 bg-black/40 border border-[var(--card-border)] text-sm"
                >
                  {PROOF_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <textarea
                  value={proofState.evidence}
                  onChange={(event) => setProofState((current) => ({ ...current, evidence: event.target.value }))}
                  placeholder="Paste a commit URL, deployment link, review note, or real-world output."
                  className="md:col-span-2 min-h-24 px-3 py-3 bg-black/40 border border-[var(--card-border)] text-sm"
                />
                <button
                  type="submit"
                  className="md:col-span-2 px-4 py-2 bg-[var(--accent)] text-black text-sm font-semibold hover-pulse w-fit"
                >
                  Submit Proof
                </button>
              </form>

              {proofMessage ? <p className="text-xs text-[var(--accent)] mb-4">{proofMessage}</p> : null}

              <div className="space-y-3">
                {(evolutionData?.proofLog ?? []).map((entry) => (
                  <div key={`${entry.domain}-${entry.submittedAt}-${entry.evidence}`} className="p-4 border border-[var(--card-border)] bg-black/25">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-2">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">{formatDomain(entry.domain)}</div>
                        <div className="text-sm mt-1">{entry.evidence}</div>
                      </div>
                      <div className="text-right">
                        <div className={entry.verified ? "text-[var(--accent)] text-xs" : "text-[#ff8f8f] text-xs"}>
                          {entry.verified ? "Verified" : "Unverified"}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-1">{formatShortDate(entry.submittedAt)}</div>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--muted)]">{entry.verificationMethod}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="p-5 border border-[rgba(68,255,136,0.22)] bg-[linear-gradient(180deg,rgba(68,255,136,0.08),rgba(0,0,0,0.18))]">
              <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3">Dojo Reading</div>
              <p className="text-sm text-[var(--muted)] mb-3">
                Proof-backed work increases the context quality of the next assessment. Keep the evidence stream active.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b border-[var(--card-border)] pb-2">
                  <span className="text-[var(--muted)]">Current Domain</span>
                  <span>{currentEvolution ? formatDomain(currentEvolution.domain) : "None"}</span>
                </div>
                <div className="flex justify-between border-b border-[var(--card-border)] pb-2">
                  <span className="text-[var(--muted)]">Latest Snapshot</span>
                  <span>{currentEvolution?.history.at(-1) ? formatShortDate(currentEvolution.history.at(-1)!.assessedAt) : "N/A"}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-[var(--muted)]">Assessment Count</span>
                  <span>{currentEvolution?.history.length ?? 0}</span>
                </div>
              </div>
            </section>

            <section className="p-5 border border-[var(--card-border)] bg-black/35">
              <h2 className="text-xl mb-4">History Ledger</h2>
              <div className="space-y-3">
                {(currentEvolution?.history ?? []).slice().reverse().map((snapshot) => (
                  <div key={snapshot.assessedAt} className="p-3 border border-[var(--card-border)] bg-black/20">
                    <div className="flex justify-between text-xs mb-2">
                      <span>{formatShortDate(snapshot.assessedAt)}</span>
                      <span className="text-[var(--accent)]">{snapshot.score.toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)] mb-2">Challenge Results</div>
                    <div className="space-y-1">
                      {snapshot.challengeResults.map((result) => (
                        <div key={`${snapshot.assessedAt}-${result.id}`} className="flex justify-between text-xs">
                          <span className="text-[var(--muted)]">{result.id}</span>
                          <span>{result.score.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </section>
      </main>
    </div>
  );
}
