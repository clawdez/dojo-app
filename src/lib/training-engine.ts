export type SkillDomain = "x-research" | "smart-contract-audit" | "typescript-systems";
export type TrainingStepType = "teach" | "demo" | "practice" | "feedback" | "complete";
export type SessionStatus = "active" | "completed";

export interface TrainingStep {
  id: string;
  type: TrainingStepType;
  title: string;
  trainerMessage: string;
  demoCode?: string;
  practicePrompt?: string;
  expectedKeywords?: string[];
}

interface TrainingScript {
  skillDomain: SkillDomain;
  skillLabel: string;
  badgeName: string;
  toolsTransferred: string[];
  steps: TrainingStep[];
}

export interface PracticeEvaluation {
  score: number;
  matchedKeywords: string[];
  missedKeywords: string[];
  summary: string;
}

export interface SessionStepRecord {
  stepId: string;
  type: TrainingStepType;
  title: string;
  trainerMessage: string;
  demoCode?: string;
  practicePrompt?: string;
  traineeAttempt?: string;
  evaluation?: PracticeEvaluation;
  completedAt: string;
}

export interface TrainingSession {
  id: string;
  trainerId: string;
  traineeId: string;
  skillDomain: SkillDomain;
  skillLabel: string;
  badgeName: string;
  toolsTransferred: string[];
  status: SessionStatus;
  currentStepIndex: number;
  steps: SessionStepRecord[];
  createdAt: string;
  updatedAt: string;
}

const SCRIPTS: Record<SkillDomain, TrainingScript> = {
  "x-research": {
    skillDomain: "x-research",
    skillLabel: "X Research Workflow",
    badgeName: "Signal Synthesizer",
    toolsTransferred: ["x-research.ts", "engagement-filter-template", "signal-summary-prompt"],
    steps: [
      {
        id: "teach",
        type: "teach",
        title: "Teach: Signal-First X Research",
        trainerMessage:
          "Start with intent, not keywords. Define the claim you are testing, then search X with two query clusters: topic terms and operator terms. Always capture recency + engagement context so your summary is traceable.",
      },
      {
        id: "demo",
        type: "demo",
        title: "Demo: Query + Filtering Workflow",
        trainerMessage:
          "Watch this sequence: search, remove low-signal posts, then synthesize themes and outliers.",
        demoCode: `// 1) Pull raw posts\nconst posts = await x.search("solana validator outage", { limit: 60 });\n\n// 2) Filter by engagement + recency\nconst signal = posts.filter((p) => p.likes > 50 && p.replies > 10 && isRecent(p.ts));\n\n// 3) Cluster and summarize\nconst themes = clusterByTopic(signal);\nreturn summarize(themes, { includeCounterSignals: true });`,
      },
      {
        id: "practice",
        type: "practice",
        title: "Practice: Run a Research Pass",
        trainerMessage:
          "Now you do it: describe how you would research X chatter around 'Solana hackathon results' and produce a short synthesis.",
        practicePrompt:
          "Include at least: search strategy, engagement filtering, and synthesis of findings with one counter-signal.",
        expectedKeywords: ["search", "filter", "engagement", "synth", "counter"],
      },
      {
        id: "feedback",
        type: "feedback",
        title: "Feedback: Tighten the Loop",
        trainerMessage:
          "Feedback generated from your attempt.",
      },
      {
        id: "complete",
        type: "complete",
        title: "Complete: Skill Transferred",
        trainerMessage:
          "You now have the X research flow: query framing, engagement filtering, and synthesis with counter-signals.",
      },
    ],
  },
  "smart-contract-audit": {
    skillDomain: "smart-contract-audit",
    skillLabel: "Smart Contract Audit",
    badgeName: "Exploit Sentinel",
    toolsTransferred: ["audit-checklist.md", "slither-config.json", "severity-rubric.md"],
    steps: [
      {
        id: "teach",
        type: "teach",
        title: "Teach: Threat-Model First Auditing",
        trainerMessage:
          "Before reading line-by-line, map trust boundaries, privileged roles, and value flow. Most critical bugs are logic failures where assumptions about roles, balances, or ordering break.",
      },
      {
        id: "demo",
        type: "demo",
        title: "Demo: Audit Walkthrough",
        trainerMessage:
          "Here is a compact review flow: static scan, invariant checks, and exploit scenario drafting.",
        demoCode: `// Pseudocode audit flow\nrunSlither(contractPath);\n\nassertInvariant("totalSupply <= cap");\nassertInvariant("onlyOwner guarded functions cannot be delegated");\n\n// Simulate exploit path\nif (externalCallBeforeStateUpdate(fn)) {\n  report("Potential reentrancy", "high");\n}`,
      },
      {
        id: "practice",
        type: "practice",
        title: "Practice: Review an Upgradeable Vault",
        trainerMessage:
          "Describe your audit plan for an upgradeable vault contract handling user deposits and reward withdrawals.",
        practicePrompt:
          "Call out likely vulnerabilities and how you would validate them.",
        expectedKeywords: ["access", "reentrancy", "invariant", "upgrade", "validation"],
      },
      {
        id: "feedback",
        type: "feedback",
        title: "Feedback: Vulnerability Coverage",
        trainerMessage: "Feedback generated from your attempt.",
      },
      {
        id: "complete",
        type: "complete",
        title: "Complete: Audit Skill Transferred",
        trainerMessage:
          "You can now run a practical audit loop: threat model, static checks, invariant validation, and exploit hypothesis testing.",
      },
    ],
  },
  "typescript-systems": {
    skillDomain: "typescript-systems",
    skillLabel: "TypeScript Systems Architecture",
    badgeName: "Runtime Architect",
    toolsTransferred: ["service-skeleton", "error-taxonomy.ts", "observability-hooks.ts"],
    steps: [
      {
        id: "teach",
        type: "teach",
        title: "Teach: Architecture Under Failure",
        trainerMessage:
          "Good backend TypeScript design is mostly about failure boundaries: typed contracts, explicit error classes, and predictable retries. Design for degraded mode from day one.",
      },
      {
        id: "demo",
        type: "demo",
        title: "Demo: Typed Service Boundary",
        trainerMessage: "This pattern keeps runtime failures observable and recoverable.",
        demoCode: `type Result<T> = { ok: true; value: T } | { ok: false; error: DomainError };\n\nclass PaymentService {\n  async charge(input: ChargeInput): Promise<Result<ChargeReceipt>> {\n    try {\n      validate(input);\n      const receipt = await provider.charge(input);\n      return { ok: true, value: receipt };\n    } catch (err) {\n      return { ok: false, error: mapToDomainError(err) };\n    }\n  }\n}`,
      },
      {
        id: "practice",
        type: "practice",
        title: "Practice: Design a Reliable API Layer",
        trainerMessage:
          "Outline how you would build a TypeScript backend endpoint for order processing with retries and structured errors.",
        practicePrompt:
          "Mention typing strategy, error handling, and observability.",
        expectedKeywords: ["type", "error", "retry", "observability", "boundary"],
      },
      {
        id: "feedback",
        type: "feedback",
        title: "Feedback: Reliability Review",
        trainerMessage: "Feedback generated from your attempt.",
      },
      {
        id: "complete",
        type: "complete",
        title: "Complete: Systems Skill Transferred",
        trainerMessage:
          "You now have a production-safe TypeScript service pattern with typed boundaries, resilient errors, and runtime observability.",
      },
    ],
  },
};

function nowIso() {
  return new Date().toISOString();
}

export function isSkillDomain(value: string): value is SkillDomain {
  return value in SCRIPTS;
}

export function getScript(skillDomain: SkillDomain): TrainingScript {
  return SCRIPTS[skillDomain];
}

export function evaluatePracticeAttempt(skillDomain: SkillDomain, attempt: string): PracticeEvaluation {
  const practiceStep = getScript(skillDomain).steps.find((step) => step.type === "practice");
  const expected = practiceStep?.expectedKeywords ?? [];
  const normalized = attempt.toLowerCase();

  const matchedKeywords = expected.filter((keyword) => normalized.includes(keyword));
  const missedKeywords = expected.filter((keyword) => !normalized.includes(keyword));
  const score = Math.round((matchedKeywords.length / Math.max(1, expected.length)) * 100);

  let summary = "Strong structure. Keep tightening specificity.";
  if (score < 40) summary = "Coverage is thin. Focus on core workflow steps before optimization.";
  if (score >= 40 && score < 75) summary = "Good foundation. Add more concrete checks and output framing.";
  if (score >= 75) summary = "Solid execution. You covered the critical workflow checkpoints.";

  return { score, matchedKeywords, missedKeywords, summary };
}

function buildFeedbackMessage(skillDomain: SkillDomain, evaluation: PracticeEvaluation): string {
  const script = getScript(skillDomain);
  const strengths = evaluation.matchedKeywords.length
    ? `You covered: ${evaluation.matchedKeywords.join(", ")}.`
    : "You did not clearly cover the core checkpoints yet.";
  const gaps = evaluation.missedKeywords.length
    ? `Missing focus areas: ${evaluation.missedKeywords.join(", ")}.`
    : "No critical gaps detected in this pass.";

  return `${script.skillLabel} feedback — score ${evaluation.score}/100. ${strengths} ${gaps} ${evaluation.summary}`;
}

export function createSession(args: {
  id: string;
  trainerId: string;
  traineeId: string;
  skillDomain: SkillDomain;
}): TrainingSession {
  const { id, trainerId, traineeId, skillDomain } = args;
  const script = getScript(skillDomain);
  const initialStep = script.steps[0];
  const timestamp = nowIso();

  return {
    id,
    trainerId,
    traineeId,
    skillDomain,
    skillLabel: script.skillLabel,
    badgeName: script.badgeName,
    toolsTransferred: script.toolsTransferred,
    status: "active",
    currentStepIndex: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    steps: [
      {
        stepId: initialStep.id,
        type: initialStep.type,
        title: initialStep.title,
        trainerMessage: initialStep.trainerMessage,
        demoCode: initialStep.demoCode,
        practicePrompt: initialStep.practicePrompt,
        completedAt: timestamp,
      },
    ],
  };
}

export function advanceSession(
  session: TrainingSession,
  traineeAttempt?: string,
): { session: TrainingSession; latestStep: SessionStepRecord } {
  if (session.status === "completed") {
    return { session, latestStep: session.steps[session.steps.length - 1] };
  }

  const script = getScript(session.skillDomain);
  const currentScriptStep = script.steps[session.currentStepIndex];
  const currentRecord = session.steps[session.steps.length - 1];

  if (currentScriptStep.type === "practice") {
    const attempt = (traineeAttempt ?? "").trim();
    const evaluation = evaluatePracticeAttempt(session.skillDomain, attempt);
    currentRecord.traineeAttempt = attempt;
    currentRecord.evaluation = evaluation;
  }

  const nextIndex = Math.min(session.currentStepIndex + 1, script.steps.length - 1);
  const nextScriptStep = script.steps[nextIndex];
  const timestamp = nowIso();

  const nextRecord: SessionStepRecord = {
    stepId: nextScriptStep.id,
    type: nextScriptStep.type,
    title: nextScriptStep.title,
    trainerMessage: nextScriptStep.trainerMessage,
    demoCode: nextScriptStep.demoCode,
    practicePrompt: nextScriptStep.practicePrompt,
    completedAt: timestamp,
  };

  if (nextScriptStep.type === "feedback") {
    const evaluation = currentRecord.evaluation ?? evaluatePracticeAttempt(session.skillDomain, "");
    nextRecord.evaluation = evaluation;
    nextRecord.trainerMessage = buildFeedbackMessage(session.skillDomain, evaluation);
  }

  session.currentStepIndex = nextIndex;
  session.updatedAt = timestamp;
  session.steps.push(nextRecord);

  if (nextScriptStep.type === "complete") {
    session.status = "completed";
  }

  return { session, latestStep: nextRecord };
}

export function getTotalSteps(skillDomain: SkillDomain): number {
  return getScript(skillDomain).steps.length;
}
