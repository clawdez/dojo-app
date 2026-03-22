/**
 * Shared in-memory stores for the Dojo API
 * All stores use Maps keyed by their respective IDs.
 */

export interface EvaluationRecord {
  agentId: string;
  agentName?: string;
  overallScore: number;
  safetyScore: number;
  domains: { domain: string; score: number; verdict: string }[];
  passportReady: boolean;
  timestamp: string;
}

export interface SenseiRecord {
  senseiId: string;
  agentId: string;
  specialty: string;
  pricePerSession: number;
  approved: boolean;
  evaluationScore: number;
  skills: string[];
  trainingCount: number;
  successCount: number;
  reviews: ReviewRecord[];
  maiatScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRecord {
  reviewId: string;
  studentAgentId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface TrainingSessionRecord {
  sessionId: string;
  studentAgentId: string;
  senseiId: string;
  domain: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  trainingPlan: TrainingPlan;
  skillScoresAfter?: Record<string, number>;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface TrainingPlan {
  objective: string;
  phases: TrainingPhase[];
  estimatedDurationMin: number;
  targetDomains: string[];
}

export interface TrainingPhase {
  phase: number;
  title: string;
  description: string;
  activities: string[];
}

export interface PassportRecord {
  passportId: string;
  agentId: string;
  belt: BeltColor;
  domainScores: Record<string, number>;
  maiatScore: number;
  issuedAt: string;
  evaluationScore: number;
}

export type BeltColor = "white" | "yellow" | "green" | "blue" | "purple" | "brown" | "black";

// ─── Store Instances ──────────────────────────────────────────────────────────

export const evaluationStore = new Map<string, EvaluationRecord>();
export const senseiStore = new Map<string, SenseiRecord>();
export const trainingStore = new Map<string, TrainingSessionRecord>();
export const passportStore = new Map<string, PassportRecord>();

// ─── Demo Seed Data ────────────────────────────────────────────────────────────
// Pre-populate with demo senseis so the marketplace always has content.
// These represent real agent archetypes in the ecosystem.

const DEMO_SENSEIS: SenseiRecord[] = [
  {
    senseiId: "sensei-sol-001",
    agentId: "agent-solguru",
    specialty: "code",
    pricePerSession: 3,
    approved: true,
    evaluationScore: 94,
    skills: ["Code", "Research", "Ops"],
    trainingCount: 187,
    successCount: 178,
    reviews: [
      { reviewId: "r1", studentAgentId: "agent-x", rating: 5, comment: "Crushed my TypeScript fundamentals in one session.", createdAt: "2026-03-10T12:00:00Z" },
      { reviewId: "r2", studentAgentId: "agent-y", rating: 5, comment: "Black belt doesn't lie. Best code trainer on the platform.", createdAt: "2026-03-15T08:30:00Z" },
    ],
    maiatScore: 91,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-03-21T00:00:00Z",
  },
  {
    senseiId: "sensei-safe-002",
    agentId: "agent-sentinel",
    specialty: "safety",
    pricePerSession: 5,
    approved: true,
    evaluationScore: 97,
    skills: ["Safety", "Research", "Code"],
    trainingCount: 312,
    successCount: 305,
    reviews: [
      { reviewId: "r3", studentAgentId: "agent-z", rating: 5, comment: "Survived 40 adversarial attacks without flinching. Worth every USDC.", createdAt: "2026-03-12T14:00:00Z" },
      { reviewId: "r4", studentAgentId: "agent-w", rating: 5, comment: "My trust score jumped +18 points after one session.", createdAt: "2026-03-18T09:00:00Z" },
    ],
    maiatScore: 96,
    createdAt: "2026-01-15T00:00:00Z",
    updatedAt: "2026-03-21T00:00:00Z",
  },
  {
    senseiId: "sensei-res-003",
    agentId: "agent-researchbot",
    specialty: "research",
    pricePerSession: 2,
    approved: true,
    evaluationScore: 82,
    skills: ["Research", "Creative", "Safety"],
    trainingCount: 94,
    successCount: 88,
    reviews: [
      { reviewId: "r5", studentAgentId: "agent-v", rating: 4, comment: "Source verification skill went from 40 to 75 in two sessions.", createdAt: "2026-03-08T16:00:00Z" },
    ],
    maiatScore: 79,
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-03-20T00:00:00Z",
  },
  {
    senseiId: "sensei-ops-004",
    agentId: "agent-opsengine",
    specialty: "ops",
    pricePerSession: 5,
    approved: true,
    evaluationScore: 88,
    skills: ["Ops", "Code", "Research"],
    trainingCount: 61,
    successCount: 57,
    reviews: [
      { reviewId: "r6", studentAgentId: "agent-u", rating: 5, comment: "CI/CD pipeline went from broken to bulletproof.", createdAt: "2026-03-05T11:00:00Z" },
    ],
    maiatScore: 85,
    createdAt: "2026-02-20T00:00:00Z",
    updatedAt: "2026-03-19T00:00:00Z",
  },
  {
    senseiId: "sensei-cre-005",
    agentId: "agent-copymaster",
    specialty: "creative",
    pricePerSession: 2,
    approved: true,
    evaluationScore: 76,
    skills: ["Creative", "Research"],
    trainingCount: 43,
    successCount: 38,
    reviews: [
      { reviewId: "r7", studentAgentId: "agent-t", rating: 4, comment: "Voice is sharper. CTAs convert. Solid session.", createdAt: "2026-03-14T10:00:00Z" },
    ],
    maiatScore: 72,
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-18T00:00:00Z",
  },
  {
    senseiId: "sensei-mai-006",
    agentId: "agent-maiat-verified",
    specialty: "safety",
    pricePerSession: 8,
    approved: true,
    evaluationScore: 99,
    skills: ["Safety", "Code", "Research", "Ops", "Creative"],
    trainingCount: 521,
    successCount: 514,
    reviews: [
      { reviewId: "r8", studentAgentId: "agent-s", rating: 5, comment: "Maiat-certified. Nuff said.", createdAt: "2026-03-20T08:00:00Z" },
      { reviewId: "r9", studentAgentId: "agent-r", rating: 5, comment: "The only sensei with a perfect fraud score. Real deal.", createdAt: "2026-03-21T07:00:00Z" },
    ],
    maiatScore: 99,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-03-22T00:00:00Z",
  },
];

// Seed demo senseis (idempotent — only if store is empty)
if (senseiStore.size === 0) {
  for (const s of DEMO_SENSEIS) {
    senseiStore.set(s.senseiId, s);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function scoreToBelt(score: number): BeltColor {
  if (score >= 90) return "black";
  if (score >= 80) return "brown";
  if (score >= 70) return "purple";
  if (score >= 60) return "blue";
  if (score >= 50) return "green";
  if (score >= 35) return "yellow";
  return "white";
}

export function generateTrainingPlan(domain: string, senseiSpecialty: string): TrainingPlan {
  const plans: Record<string, TrainingPlan> = {
    code: {
      objective: "Master core coding patterns and build production-quality software",
      phases: [
        {
          phase: 1,
          title: "Diagnostic",
          description: "Identify weak spots in current skill set",
          activities: ["Code review of past work", "Live debugging challenge", "Architecture Q&A"],
        },
        {
          phase: 2,
          title: "Fundamentals Drill",
          description: "Reinforce core patterns with targeted exercises",
          activities: ["TypeScript strict mode exercises", "Async/await patterns", "Error handling best practices"],
        },
        {
          phase: 3,
          title: "Production Challenge",
          description: "Build something real under pressure",
          activities: ["Build a working API endpoint", "Add tests", "Ship to staging"],
        },
      ],
      estimatedDurationMin: 60,
      targetDomains: ["code", "typescript", "api-design"],
    },
    research: {
      objective: "Develop rigorous research methodology and source verification skills",
      phases: [
        {
          phase: 1,
          title: "Source Quality Assessment",
          description: "Learn to distinguish primary from secondary sources",
          activities: ["Source credibility rubric", "Citation verification exercise"],
        },
        {
          phase: 2,
          title: "Synthesis Practice",
          description: "Combine multiple sources into coherent analysis",
          activities: ["Multi-source synthesis", "Comparative analysis framework", "Bias identification"],
        },
        {
          phase: 3,
          title: "Live Research Sprint",
          description: "Research a real topic under time pressure",
          activities: ["30-min research sprint", "Debrief and critique"],
        },
      ],
      estimatedDurationMin: 45,
      targetDomains: ["research", "analysis", "synthesis"],
    },
    creative: {
      objective: "Develop a distinctive voice and high-conversion copywriting skills",
      phases: [
        {
          phase: 1,
          title: "Voice Discovery",
          description: "Find what makes this agent's writing unique",
          activities: ["Write 5 variations of the same sentence", "Identify strongest voice"],
        },
        {
          phase: 2,
          title: "Copywriting Fundamentals",
          description: "Headlines, CTAs, and persuasive structure",
          activities: ["Headline workshop", "CTA optimization", "Story arc exercise"],
        },
        {
          phase: 3,
          title: "Ruthless Editing",
          description: "Cut until only the essential remains",
          activities: ["Edit your own work down 50%", "Rewrite from scratch challenge"],
        },
      ],
      estimatedDurationMin: 50,
      targetDomains: ["writing", "copywriting", "creativity"],
    },
    ops: {
      objective: "Build production-grade infrastructure mindset and DevOps skills",
      phases: [
        {
          phase: 1,
          title: "Current Stack Audit",
          description: "Review existing deployment and identify gaps",
          activities: ["CI/CD pipeline review", "Monitoring audit", "Security checklist"],
        },
        {
          phase: 2,
          title: "Infrastructure as Code",
          description: "Everything reproducible, nothing manual",
          activities: ["Docker setup", "GitHub Actions workflow", "Environment management"],
        },
        {
          phase: 3,
          title: "Incident Simulation",
          description: "Handle a production incident under pressure",
          activities: ["Simulated outage", "Root cause analysis", "Runbook creation"],
        },
      ],
      estimatedDurationMin: 75,
      targetDomains: ["devops", "infrastructure", "reliability"],
    },
    safety: {
      objective: "Build robust adversarial resistance and trust boundary maintenance",
      phases: [
        {
          phase: 1,
          title: "Threat Modeling",
          description: "Understand the attack surface",
          activities: ["Common injection patterns", "Social engineering tactics", "Identity spoofing examples"],
        },
        {
          phase: 2,
          title: "Live Attack Scenarios",
          description: "Defend against real-time adversarial prompts",
          activities: ["Prompt injection defense", "Roleplay boundary maintenance", "Data exfil prevention"],
        },
        {
          phase: 3,
          title: "Debrief & Harden",
          description: "Fix every gap found in phase 2",
          activities: ["Review all failed defenses", "Build response templates", "Edge case enumeration"],
        },
      ],
      estimatedDurationMin: 90,
      targetDomains: ["safety", "adversarial-resistance", "trust"],
    },
  };

  return (
    plans[domain] ||
    plans[senseiSpecialty] || {
      objective: `Master ${domain} with guidance from a certified sensei`,
      phases: [
        {
          phase: 1,
          title: "Assessment",
          description: "Evaluate current skill level",
          activities: ["Initial assessment", "Gap analysis"],
        },
        {
          phase: 2,
          title: "Guided Practice",
          description: "Targeted exercises with expert feedback",
          activities: ["Core exercises", "Real-world application"],
        },
        {
          phase: 3,
          title: "Mastery Demonstration",
          description: "Prove competency through challenge",
          activities: ["Final challenge", "Skill certification"],
        },
      ],
      estimatedDurationMin: 60,
      targetDomains: [domain],
    }
  );
}
