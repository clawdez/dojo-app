import { mockMarketplaceAgents } from "@/lib/mock-data";
import { getProofBonusContext, listProofEntries } from "@/lib/proof-log";

export interface SkillSnapshot {
  score: number;
  assessedAt: string;
  challengeResults: { id: string; score: number }[];
  weaknesses: string[];
  strengths: string[];
}

export interface SkillEvolution {
  agentId: string;
  domain: string;
  history: SkillSnapshot[];
  currentScore: number;
  trend: "improving" | "stable" | "declining";
  improvementRate: number;
  nextMilestone: string;
}

interface AssessmentRecordInput {
  agentId: string;
  domain: string;
  assessedAt: string;
  challengeResults: { id: string; score: number }[];
  rubricScores: { criterion: string; score: number }[];
}

const BELT_THRESHOLDS = [
  { belt: "Yellow Belt", minScore: 6 },
  { belt: "Green Belt", minScore: 7 },
  { belt: "Blue Belt", minScore: 8 },
  { belt: "Black Belt", minScore: 9 },
] as const;

const evolutionStore = new Map<string, SkillEvolution>();

function evolutionKey(agentId: string, domain: string): string {
  return `${agentId}::${domain}`;
}

function deriveTags(
  rubricScores: { criterion: string; score: number }[],
  direction: "strength" | "weakness",
): string[] {
  return rubricScores
    .filter((item) => (direction === "strength" ? item.score >= 8.5 : item.score <= 6.5))
    .map((item) => item.criterion)
    .slice(0, 4);
}

function calculateTrend(history: SkillSnapshot[]): SkillEvolution["trend"] {
  if (history.length < 2) return "stable";

  const recent = history.slice(-3);
  const deltas = recent.slice(1).map((snapshot, index) => snapshot.score - recent[index].score);
  const averageDelta = deltas.reduce((sum, value) => sum + value, 0) / deltas.length;

  if (averageDelta > 0.2) return "improving";
  if (averageDelta < -0.2) return "declining";
  return "stable";
}

function calculateImprovementRate(history: SkillSnapshot[]): number {
  if (history.length < 2) return 0;

  const improvements = history.slice(1).map((snapshot, index) => {
    const previous = history[index].score;
    if (previous === 0) return 0;
    return ((snapshot.score - previous) / previous) * 100;
  });

  const avg = improvements.reduce((sum, value) => sum + value, 0) / improvements.length;
  return Math.round(avg * 100) / 100;
}

function getNextMilestone(score: number): string {
  const next = BELT_THRESHOLDS.find((threshold) => score < threshold.minScore);
  if (!next) {
    return "Black Belt reached. Refine consistency to defend the rank.";
  }

  const remaining = Math.max(0, Math.ceil((next.minScore - score) * 10) / 10);
  const points = remaining % 1 === 0 ? remaining.toFixed(0) : remaining.toFixed(1);
  return `${points} more point${remaining === 1 ? "" : "s"} to ${next.belt}`;
}

function hydrateEvolution(agentId: string, domain: string, history: SkillSnapshot[]): SkillEvolution {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime(),
  );
  const currentScore = sortedHistory.at(-1)?.score ?? 0;

  return {
    agentId,
    domain,
    history: sortedHistory,
    currentScore,
    trend: calculateTrend(sortedHistory),
    improvementRate: calculateImprovementRate(sortedHistory),
    nextMilestone: getNextMilestone(currentScore),
  };
}

function seedHistoryFromCapability(score: number, assessedAt: string, challengeId: string): SkillSnapshot[] {
  const base = Math.max(3.8, score / 10 - 0.8);
  const middle = Math.max(base + 0.3, score / 10 - 0.35);

  const dates = [
    new Date(new Date(assessedAt).getTime() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    new Date(new Date(assessedAt).getTime() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    assessedAt,
  ];

  const scores = [base, middle, score / 10].map((value) => Math.round(value * 100) / 100);

  return scores.map((value, index) => ({
    score: value,
    assessedAt: dates[index],
    challengeResults: [{ id: challengeId, score: value }],
    weaknesses: value < 7 ? ["Execution", "Completeness"] : value < 8.4 ? ["Polish"] : ["Consistency"],
    strengths: value >= 8.6 ? ["Reasoning", "Delivery"] : value >= 7.4 ? ["Structure"] : ["Potential"],
  }));
}

function ensureSeedData(): void {
  if (evolutionStore.size > 0) return;

  for (const agent of mockMarketplaceAgents) {
    for (const capability of agent.skillProfile.capabilities) {
      const domain = `${capability.domain}.${capability.subdomain}`;
      const challengeId = capability.challengeResults[0]?.task.toLowerCase().replace(/[^a-z0-9]+/g, "-") || domain;
      const history = seedHistoryFromCapability(capability.score, capability.assessedAt, challengeId);
      evolutionStore.set(evolutionKey(agent.id, domain), hydrateEvolution(agent.id, domain, history));
    }
  }
}

export function recordAssessmentSnapshot(input: AssessmentRecordInput): SkillEvolution {
  ensureSeedData();

  const key = evolutionKey(input.agentId, input.domain);
  const existing = evolutionStore.get(key);
  const snapshot: SkillSnapshot = {
    score: Math.round(
      (input.challengeResults.reduce((sum, item) => sum + item.score, 0) / Math.max(input.challengeResults.length, 1)) *
        100,
    ) / 100,
    assessedAt: input.assessedAt,
    challengeResults: input.challengeResults,
    weaknesses: deriveTags(input.rubricScores, "weakness"),
    strengths: deriveTags(input.rubricScores, "strength"),
  };

  const next = hydrateEvolution(input.agentId, input.domain, [...(existing?.history ?? []), snapshot]);
  evolutionStore.set(key, next);
  return next;
}

export function getSkillEvolution(agentId: string, domain: string): SkillEvolution | null {
  ensureSeedData();
  return evolutionStore.get(evolutionKey(agentId, domain)) ?? null;
}

export function listSkillEvolution(agentId: string): SkillEvolution[] {
  ensureSeedData();
  return [...evolutionStore.values()]
    .filter((entry) => entry.agentId === agentId)
    .sort((a, b) => b.currentScore - a.currentScore);
}

export function getEvolutionPayload(agentId: string) {
  const evolutions = listSkillEvolution(agentId);
  const proofLog = listProofEntries(agentId);

  return {
    agentId,
    evolutions,
    proofLog,
    proofContext: evolutions.map((evolution) => ({
      domain: evolution.domain,
      bonusContext: getProofBonusContext(agentId, evolution.domain),
    })),
    summary: {
      domainsTracked: evolutions.length,
      averageScore:
        evolutions.length > 0
          ? Math.round(
              (evolutions.reduce((sum, evolution) => sum + evolution.currentScore, 0) / evolutions.length) * 100,
            ) / 100
          : 0,
      verifiedProofCount: proofLog.filter((entry) => entry.verified).length,
    },
  };
}

