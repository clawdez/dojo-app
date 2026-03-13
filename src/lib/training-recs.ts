import { mockSenseis, mockTrainerAgents, type TrainerAgent } from "@/lib/mock-data";
import { getSkillEvolution, listSkillEvolution } from "@/lib/skill-evolution";

export interface TrainingRecommendation {
  agentId: string;
  domain: string;
  focusArea: string;
  reason: string;
  exercises: string[];
  suggestedTrainer: {
    id: string;
    name: string;
    type: "trainer" | "sensei";
    rationale: string;
  };
  improvedOnPreviousWeakness: boolean;
  improvementNote: string;
}

const EXERCISE_LIBRARY: Record<string, string[]> = {
  "type safety": [
    "Rebuild the solution without `any`, then add one failing type test.",
    "Write a narrow interface map before implementing runtime logic.",
  ],
  correctness: [
    "Solve the same challenge against 3 edge cases and explain each failure mode.",
    "Add a self-check section that lists hidden assumptions before finalizing the answer.",
  ],
  "code quality": [
    "Refactor the answer once for naming and once for structure before submission.",
    "Compress the solution into smaller units with one sentence on why each exists.",
  ],
  completeness: [
    "Finish with an edge-case sweep: empty input, duplicate input, timeout path, cleanup path.",
    "Write the missing branch list before producing the final answer.",
  ],
  "hook design": [
    "Rewrite the hook with explicit cleanup and dependency reasoning.",
    "Practice a second version that avoids stale closures under rapid updates.",
  ],
  "debounce logic": [
    "Implement the flow with cancellation first, debounce second, and test race conditions.",
    "Simulate rapid-fire queries and verify only the last response wins.",
  ],
  "state management": [
    "Model idle/loading/success/error states explicitly before coding.",
    "Practice stale-request handling with an abort path and a latest-request guard.",
  ],
  "anchor correctness": [
    "Draft accounts, constraints, and PDA seeds before any instruction handler code.",
    "Audit each account for signer, mutability, and ownership requirements.",
  ],
  security: [
    "Run a threat-model pass and list the top 5 abuse cases before implementation.",
    "Practice converting one vulnerability note into one concrete guardrail in code.",
  ],
  logic: [
    "Explain the happy path, cancel path, and failure path in three short bullets before coding.",
    "Replay the challenge as a state machine and identify invalid transitions.",
  ],
  structure: [
    "Outline the response with a top-line claim, support, and close before writing.",
    "Rewrite the answer to make each paragraph do only one job.",
  ],
  polish: [
    "Take one prior answer and remove 20% of the words without losing meaning.",
    "Add one pass dedicated only to clarity and one pass only to precision.",
  ],
};

function getExercises(focusArea: string, domain: string): string[] {
  const normalized = focusArea.toLowerCase();

  for (const [key, exercises] of Object.entries(EXERCISE_LIBRARY)) {
    if (normalized.includes(key)) return exercises;
  }

  if (domain.startsWith("coding.")) {
    return [
      "Re-solve a previous challenge with explicit tests and one adversarial case.",
      "Explain the implementation constraints before producing code.",
    ];
  }

  if (domain.startsWith("research.")) {
    return [
      "Synthesize three sources into one short brief with signal and uncertainty separated.",
      "Track one claim back to primary evidence before finalizing the answer.",
    ];
  }

  return [
    "Repeat the last assessment prompt and focus only on the weakest rubric item.",
    "Write a short after-action note on what changed between attempts.",
  ];
}

function scoreTrainerFit(trainer: TrainerAgent, domain: string, focusArea: string): number {
  const searchable = `${trainer.skills.map((skill) => `${skill.domain} ${skill.subdomain}`).join(" ")} ${trainer.specialties.join(" ")}`.toLowerCase();
  const [primaryDomain, subdomain] = domain.split(".");
  let score = trainer.avgRating * 10 + trainer.successRate * 20;

  if (primaryDomain && searchable.includes(primaryDomain)) score += 25;
  if (subdomain && searchable.includes(subdomain)) score += 20;
  if (searchable.includes(focusArea.toLowerCase())) score += 15;

  return score;
}

function pickSuggestedTrainer(domain: string, focusArea: string): TrainingRecommendation["suggestedTrainer"] {
  const topTrainer = [...mockTrainerAgents].sort(
    (a, b) => scoreTrainerFit(b, domain, focusArea) - scoreTrainerFit(a, domain, focusArea),
  )[0];

  if (topTrainer) {
    return {
      id: topTrainer.id,
      name: topTrainer.name,
      type: "trainer",
      rationale: `${topTrainer.specialties[0]} and ${topTrainer.skills[0]?.subdomain ?? "applied drills"} align with ${focusArea}.`,
    };
  }

  const fallbackSensei = mockSenseis.find((sensei) => sensei.specialty && domain.startsWith(sensei.specialty)) ?? mockSenseis[0];
  return {
    id: fallbackSensei.id,
    name: fallbackSensei.name,
    type: "sensei",
    rationale: `Fallback sensei coverage for ${domain}.`,
  };
}

export function getTrainingRecommendations(agentId: string, domain?: string): TrainingRecommendation[] {
  const evolutions = domain ? [getSkillEvolution(agentId, domain)].filter(Boolean) : listSkillEvolution(agentId);

  return evolutions.flatMap((evolution) => {
    if (!evolution) return [];

    const latest = evolution.history.at(-1);
    const previous = evolution.history.at(-2);
    if (!latest) return [];

    const previousWeaknesses = new Set(previous?.weaknesses ?? []);

    return (latest.weaknesses.length > 0 ? latest.weaknesses : ["Consistency"]).map((focusArea) => {
      const improvedOnPreviousWeakness =
        previousWeaknesses.size === 0 ? false : !latest.weaknesses.includes(focusArea) || latest.score > (previous?.score ?? 0);

      return {
        agentId,
        domain: evolution.domain,
        focusArea,
        reason: `${focusArea} was one of the lowest-scoring rubric areas in the latest assessment.`,
        exercises: getExercises(focusArea, evolution.domain),
        suggestedTrainer: pickSuggestedTrainer(evolution.domain, focusArea),
        improvedOnPreviousWeakness,
        improvementNote: improvedOnPreviousWeakness
          ? "This weakness is trending better than the prior assessment."
          : "No clear lift yet. Repeat the drill before expanding scope.",
      };
    });
  });
}
