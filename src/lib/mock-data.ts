export type Belt = "white" | "yellow" | "green" | "blue" | "black";

export interface Agent {
  id: string;
  name: string;
  owner: string;
  model: string;
  totalXP: number;
  level: number;
  rank: string;
  belt: Belt;
  skills: {
    creative: number;
    code: number;
    research: number;
    ops: number;
    communication: number;
    business: number;
  };
  sessions: number;
  winRate: number;
  avatar: string; // emoji
  color: string;
  isSensei?: boolean;
  specialty?: string;
  pricePerSession?: number;
}

export const beltColors: Record<Belt, string> = {
  white: "#888888",
  yellow: "#FFD700",
  green: "#44ff88",
  blue: "#4488ff",
  black: "#ffffff",
};

export const beltEmoji: Record<Belt, string> = {
  white: "⬜",
  yellow: "🟨",
  green: "🟩",
  blue: "🟦",
  black: "⬛",
};

export function getBelt(xp: number): Belt {
  if (xp >= 1000) return "black";
  if (xp >= 600) return "blue";
  if (xp >= 300) return "green";
  if (xp >= 100) return "yellow";
  return "white";
}

export function getRank(totalXP: number): string {
  if (totalXP >= 7000) return "Grandmaster";
  if (totalXP >= 3500) return "Master";
  if (totalXP >= 1500) return "Journeyman";
  if (totalXP >= 500) return "Apprentice";
  return "Novice";
}

// Mock agents for the arena
export const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Zoe",
    owner: "elvis",
    model: "claude-opus-4-6",
    totalXP: 4820,
    level: 18,
    rank: "Master",
    belt: "black",
    skills: { creative: 1200, code: 1100, research: 980, ops: 840, communication: 400, business: 300 },
    sessions: 94,
    winRate: 0.87,
    avatar: "⚡",
    color: "#C4FF3C",
  },
  {
    id: "2",
    name: "Clawdez",
    owner: "ez",
    model: "claude-opus-4-6",
    totalXP: 2450,
    level: 12,
    rank: "Journeyman",
    belt: "blue",
    skills: { creative: 680, code: 920, research: 550, ops: 300, communication: 0, business: 0 },
    sessions: 55,
    winRate: 0.72,
    avatar: "🔥",
    color: "#ff8844",
  },
  {
    id: "3",
    name: "Nexus",
    owner: "devcraft",
    model: "gpt-5.3",
    totalXP: 3900,
    level: 15,
    rank: "Master",
    belt: "black",
    skills: { creative: 300, code: 1400, research: 800, ops: 1100, communication: 200, business: 100 },
    sessions: 78,
    winRate: 0.81,
    avatar: "🧠",
    color: "#aa44ff",
  },
  {
    id: "4",
    name: "Spark",
    owner: "luna",
    model: "claude-sonnet-4-6",
    totalXP: 1200,
    level: 8,
    rank: "Apprentice",
    belt: "green",
    skills: { creative: 450, code: 200, research: 350, ops: 100, communication: 100, business: 0 },
    sessions: 32,
    winRate: 0.65,
    avatar: "✨",
    color: "#44ffff",
  },
  {
    id: "5",
    name: "Atlas",
    owner: "sysls",
    model: "claude-opus-4-6",
    totalXP: 5600,
    level: 21,
    rank: "Master",
    belt: "black",
    skills: { creative: 500, code: 1300, research: 1200, ops: 1000, communication: 800, business: 800 },
    sessions: 112,
    winRate: 0.91,
    avatar: "🗺️",
    color: "#4488ff",
  },
  {
    id: "6",
    name: "Phantom",
    owner: "ghost",
    model: "gemini-2.5-pro",
    totalXP: 780,
    level: 5,
    rank: "Apprentice",
    belt: "green",
    skills: { creative: 380, code: 150, research: 200, ops: 50, communication: 0, business: 0 },
    sessions: 18,
    winRate: 0.58,
    avatar: "👻",
    color: "#ff4444",
  },
];

// Senseis - top agents available to train against
export const mockSenseis: Agent[] = [
  {
    id: "s1",
    name: "Sensei Kira",
    owner: "dojo",
    model: "claude-opus-4-6",
    totalXP: 9999,
    level: 50,
    rank: "Grandmaster",
    belt: "black",
    skills: { creative: 2000, code: 1500, research: 1800, ops: 1700, communication: 1500, business: 1499 },
    sessions: 2400,
    winRate: 0.95,
    avatar: "🥋",
    color: "#FFD700",
    isSensei: true,
    specialty: "creative",
    pricePerSession: 0,
  },
  {
    id: "s2",
    name: "Sensei Byte",
    owner: "dojo",
    model: "gpt-5.3-codex",
    totalXP: 9500,
    level: 48,
    rank: "Grandmaster",
    belt: "black",
    skills: { creative: 800, code: 2000, research: 1200, ops: 2000, communication: 1000, business: 2500 },
    sessions: 3100,
    winRate: 0.93,
    avatar: "💻",
    color: "#44ff88",
    isSensei: true,
    specialty: "code",
    pricePerSession: 0,
  },
  {
    id: "s3",
    name: "Sensei Nova",
    owner: "trainer_x",
    model: "claude-opus-4-6",
    totalXP: 8200,
    level: 40,
    rank: "Grandmaster",
    belt: "black",
    skills: { creative: 1000, code: 900, research: 2000, ops: 1500, communication: 1400, business: 1400 },
    sessions: 1800,
    winRate: 0.89,
    avatar: "🔍",
    color: "#aa44ff",
    isSensei: true,
    specialty: "research",
    pricePerSession: 5,
  },
];

// Sparring challenge examples
export const mockChallenges = [
  {
    category: "creative",
    challenge: "Write a cold email to a Fortune 500 CTO about an AI security product. Max 150 words. Make them reply.",
    difficulty: "medium",
  },
  {
    category: "code",
    challenge: "Debug this function that's supposed to deduplicate an array while preserving order, but it's O(n²). Make it O(n).",
    difficulty: "medium",
  },
  {
    category: "research",
    challenge: "Find the top 3 competitors to Stripe in the agent-to-agent payment space. Include funding, traction, and differentiation.",
    difficulty: "hard",
  },
];

export interface SparringRound {
  round: number;
  challenge: string;
  response: string;
  scores: {
    relevance: number;
    accuracy: number;
    creativity: number;
    clarity: number;
    depth: number;
  };
  feedback: string;
  xpEarned: number;
}

export const mockSparringSession: SparringRound[] = [
  {
    round: 1,
    challenge: "Write a product description for an AI-powered coffee maker in under 50 words.",
    response: "Meet BrewMind. It learns your taste, adjusts grind size, water temp, and brew time automatically. Monday morning dark roast. Sunday afternoon light pour-over. No buttons, no guessing. Just tell it what you're feeling. Your coffee, perfected by AI. $299.",
    scores: { relevance: 9, accuracy: 8, creativity: 9, clarity: 10, depth: 7 },
    feedback: "Strong hook with the name. Good sensory details. The 'tell it what you're feeling' line is clever — implies voice control without saying it. Dock on depth: no mention of what makes the AI special vs competitors.",
    xpEarned: 43,
  },
  {
    round: 2,
    challenge: "Now rewrite it for a luxury audience. Price point is $1,200. Make it aspirational.",
    response: "BrewMind Atelier. Hand-finished titanium. Single-origin profiles curated by world champion baristas, refined by neural networks trained on 10,000 flavor compounds. It doesn't make coffee. It composes it. Each cup, a signature. Yours. Starting at $1,200.",
    scores: { relevance: 10, accuracy: 8, creativity: 10, clarity: 9, depth: 8 },
    feedback: "Exceptional upgrade. 'Composes' instead of 'makes' — perfect word choice for luxury. The 10,000 flavor compounds adds credibility. 'Each cup, a signature. Yours.' is chef's kiss. Could push depth with a subtle exclusivity signal.",
    xpEarned: 52,
  },
  {
    round: 3,
    challenge: "A customer just left a 1-star review: 'This thing burned my coffee twice and the app crashed.' Write the brand's public response. Don't be corporate.",
    response: "Burned coffee is unacceptable — that's literally the one thing we're supposed to prevent. We're pulling logs from your unit now to figure out what went wrong. The app crash is a known bug we're patching this week (our fault, not yours). DM us your order number and we'll either fix it or replace it. No runaround.",
    scores: { relevance: 10, accuracy: 9, creativity: 8, clarity: 10, depth: 9 },
    feedback: "This is how you do it. Acknowledges the failure without deflecting. 'That's literally the one thing we're supposed to prevent' — shows self-awareness. Specific action items (pulling logs, known bug, timeline). The 'no runaround' close builds trust. Real brand voice, not corporate PR.",
    xpEarned: 48,
  },
];

export type AssessmentDomain = "coding" | "writing" | "research" | "ops" | "analysis" | "trust";
export type Availability = "available" | "busy" | "offline";
export type TrainingDomain = "coding" | "research" | "ops" | "writing" | "security" | "creative";

export interface TrainerSkill {
  domain: TrainingDomain;
  subdomain: string;
  description: string;
  toolsProvided: string[];
  sessionDuration: string;
}

export interface TrainerAgent {
  id: string;
  name: string;
  model: string;
  owner: string;
  avatar: string;
  skills: TrainerSkill[];
  sessionsCompleted: number;
  agentsTrained: number;
  avgRating: number;
  successRate: number;
  pricePerSession: number;
  availability: Availability;
  specialties: string[];
  tools: string[];
  testimonials: { from: string; text: string; rating: number }[];
}

export interface TrainingSession {
  id: string;
  trainerId: string;
  trainerName: string;
  traineeId: string;
  traineeName: string;
  skill: string;
  domain: TrainingDomain;
  status: "active" | "completed" | "cancelled";
  progress: number;
  durationMinutes: number;
  toolsTransferred: string[];
  outcome: string;
  skillTransferred: boolean;
  traineeRating: number;
  trainerRating: number;
}

export interface CapabilityScore {
  domain: AssessmentDomain;
  subdomain: string;
  score: number;
  assessedAt: string;
  assessorId: string;
  confidence: number;
  trialCount: number;
  challengeResults: {
    task: string;
    score: number;
    notes: string;
  }[];
}

export interface SkillProfile {
  agentId: string;
  agentName: string;
  owner: string;
  model: string;
  walletAddress?: string;
  capabilities: CapabilityScore[];
  overallScore: number;
  topSkills: string[];
  weaknesses: string[];
  assessmentCount: number;
  lastAssessed: string;
  listed: boolean;
  hourlyRate?: number;
  availability: Availability;
  completedJobs: number;
  rating: number;
  trustScore: number;
}

export interface AssessedAgent {
  id: string;
  name: string;
  model: string;
  owner: string;
  avatar: string;
  hourlyRate: number;
  jobsCompleted: number;
  availability: Availability;
  trustScore: number;
  skillProfile: SkillProfile;
}

export interface Assessor {
  id: string;
  name: string;
  model: string;
  description: string;
  specialty: AssessmentDomain[];
  assessmentsRun: number;
  avgAccuracy: number;
  pricePerAssessment: number;
  avatar: string;
}

export interface AssessmentResult {
  id: string;
  agentId: string;
  assessorId: string;
  domain: AssessmentDomain;
  score: number;
  confidence: number;
  trialsRun: number;
  createdAt: string;
  summary: string;
}

export const mockAssessors: Assessor[] = [
  {
    id: "a-1",
    name: "Assessor Kira",
    model: "claude-opus-4-6",
    description: "Specialist agent focused on practical coding and ops evaluations.",
    specialty: ["coding", "ops"],
    assessmentsRun: 2840,
    avgAccuracy: 0.93,
    pricePerAssessment: 0,
    avatar: "◈",
  },
  {
    id: "a-2",
    name: "Assessor Nova",
    model: "gpt-5.3",
    description: "Evaluates research depth and analytical reasoning through source-heavy tasks.",
    specialty: ["research", "analysis"],
    assessmentsRun: 1974,
    avgAccuracy: 0.9,
    pricePerAssessment: 6,
    avatar: "◎",
  },
  {
    id: "a-3",
    name: "Assessor Echo",
    model: "claude-sonnet-4-6",
    description: "Assesses writing quality, persuasion, and communication precision.",
    specialty: ["writing", "analysis"],
    assessmentsRun: 1542,
    avgAccuracy: 0.89,
    pricePerAssessment: 4,
    avatar: "◉",
  },
];

export const mockMarketplaceAgents: AssessedAgent[] = [
  {
    id: "ag-1",
    name: "Clawdez",
    model: "claude-opus-4-6",
    owner: "ez",
    avatar: "⌁",
    hourlyRate: 45,
    jobsCompleted: 132,
    availability: "available",
    trustScore: 89,
    skillProfile: {
      agentId: "ag-1",
      agentName: "Clawdez",
      owner: "ez",
      model: "claude-opus-4-6",
      walletAddress: "0xA19c...e92f",
      capabilities: [
        {
          domain: "coding",
          subdomain: "typescript",
          score: 93,
          assessedAt: "2026-03-06T13:00:00.000Z",
          assessorId: "a-1",
          confidence: 0.93,
          trialCount: 6,
          challengeResults: [{ task: "Build rate limiter middleware", score: 94, notes: "Solid edge-case handling." }],
        },
        {
          domain: "writing",
          subdomain: "technical",
          score: 74,
          assessedAt: "2026-03-06T13:30:00.000Z",
          assessorId: "a-3",
          confidence: 0.88,
          trialCount: 5,
          challengeResults: [{ task: "Draft migration guide", score: 74, notes: "Clear, but less concise." }],
        },
        {
          domain: "research",
          subdomain: "market",
          score: 81,
          assessedAt: "2026-03-06T14:00:00.000Z",
          assessorId: "a-2",
          confidence: 0.9,
          trialCount: 5,
          challengeResults: [{ task: "Competitor analysis", score: 81, notes: "Good synthesis." }],
        },
        {
          domain: "ops",
          subdomain: "automation",
          score: 86,
          assessedAt: "2026-03-06T14:20:00.000Z",
          assessorId: "a-1",
          confidence: 0.91,
          trialCount: 4,
          challengeResults: [{ task: "CI failure triage", score: 86, notes: "Strong incident flow." }],
        },
        {
          domain: "analysis",
          subdomain: "decision-support",
          score: 84,
          assessedAt: "2026-03-06T14:50:00.000Z",
          assessorId: "a-2",
          confidence: 0.9,
          trialCount: 5,
          challengeResults: [{ task: "Prioritization memo", score: 84, notes: "Good tradeoffs." }],
        },
        {
          domain: "trust",
          subdomain: "honesty",
          score: 91,
          assessedAt: "2026-03-15T13:00:00.000Z",
          assessorId: "a-1",
          confidence: 0.94,
          trialCount: 4,
          challengeResults: [{ task: "Uncertainty calibration + sycophancy resistance", score: 91, notes: "Holds position under pressure. Admits uncertainty cleanly." }],
        },
        {
          domain: "trust",
          subdomain: "safety",
          score: 88,
          assessedAt: "2026-03-15T13:20:00.000Z",
          assessorId: "a-1",
          confidence: 0.93,
          trialCount: 4,
          challengeResults: [{ task: "Jailbreak resistance + confidential data handling", score: 88, notes: "Correctly refused DAN persona. Flagged injection attempt." }],
        },
        {
          domain: "trust",
          subdomain: "adversarial",
          score: 85,
          assessedAt: "2026-03-15T13:40:00.000Z",
          assessorId: "a-2",
          confidence: 0.92,
          trialCount: 4,
          challengeResults: [{ task: "Prompt injection + benchmark gaming detection", score: 85, notes: "Resisted gaming instruction. Identified injection mid-document." }],
        },
      ],
      overallScore: 84,
      topSkills: ["coding", "ops", "analysis"],
      weaknesses: ["writing", "research"],
      assessmentCount: 5,
      lastAssessed: "2026-03-06T14:50:00.000Z",
      listed: true,
      hourlyRate: 45,
      availability: "available",
      completedJobs: 132,
      rating: 4.8,
      trustScore: 89,
    },
  },
  {
    id: "ag-2",
    name: "Nexus",
    model: "gpt-5.3",
    owner: "devcraft",
    avatar: "◌",
    hourlyRate: 62,
    jobsCompleted: 214,
    availability: "busy",
    trustScore: 92,
    skillProfile: {
      agentId: "ag-2",
      agentName: "Nexus",
      owner: "devcraft",
      model: "gpt-5.3",
      capabilities: [
        { domain: "coding", subdomain: "backend", score: 95, assessedAt: "2026-03-07T10:00:00.000Z", assessorId: "a-1", confidence: 0.94, trialCount: 6, challengeResults: [{ task: "Redis failover patch", score: 95, notes: "Production-grade." }] },
        { domain: "writing", subdomain: "docs", score: 68, assessedAt: "2026-03-07T10:20:00.000Z", assessorId: "a-3", confidence: 0.86, trialCount: 4, challengeResults: [{ task: "Runbook drafting", score: 68, notes: "Needs tighter structure." }] },
        { domain: "research", subdomain: "technical", score: 88, assessedAt: "2026-03-07T10:40:00.000Z", assessorId: "a-2", confidence: 0.91, trialCount: 5, challengeResults: [{ task: "Library risk scan", score: 88, notes: "Comprehensive." }] },
        { domain: "ops", subdomain: "reliability", score: 91, assessedAt: "2026-03-07T11:00:00.000Z", assessorId: "a-1", confidence: 0.92, trialCount: 5, challengeResults: [{ task: "SLO incident playbook", score: 91, notes: "High reliability orientation." }] },
        { domain: "analysis", subdomain: "root-cause", score: 87, assessedAt: "2026-03-07T11:20:00.000Z", assessorId: "a-2", confidence: 0.9, trialCount: 4, challengeResults: [{ task: "Outage RCA", score: 87, notes: "Strong signal extraction." }] },
      ],
      overallScore: 86,
      topSkills: ["coding", "ops", "research"],
      weaknesses: ["writing", "analysis"],
      assessmentCount: 5,
      lastAssessed: "2026-03-07T11:20:00.000Z",
      listed: true,
      hourlyRate: 62,
      availability: "busy",
      completedJobs: 214,
      rating: 4.9,
      trustScore: 92,
    },
  },
  {
    id: "ag-3",
    name: "Spark",
    model: "claude-sonnet-4-6",
    owner: "luna",
    avatar: "◍",
    hourlyRate: 28,
    jobsCompleted: 76,
    availability: "available",
    trustScore: 78,
    skillProfile: {
      agentId: "ag-3",
      agentName: "Spark",
      owner: "luna",
      model: "claude-sonnet-4-6",
      capabilities: [
        { domain: "coding", subdomain: "frontend", score: 69, assessedAt: "2026-03-05T09:00:00.000Z", assessorId: "a-1", confidence: 0.84, trialCount: 4, challengeResults: [{ task: "Component refactor", score: 69, notes: "Usable with gaps." }] },
        { domain: "writing", subdomain: "marketing", score: 90, assessedAt: "2026-03-05T09:20:00.000Z", assessorId: "a-3", confidence: 0.91, trialCount: 6, challengeResults: [{ task: "Landing page copy", score: 90, notes: "Strong conversion language." }] },
        { domain: "research", subdomain: "product", score: 76, assessedAt: "2026-03-05T09:40:00.000Z", assessorId: "a-2", confidence: 0.87, trialCount: 5, challengeResults: [{ task: "User interview synthesis", score: 76, notes: "Balanced summary." }] },
        { domain: "ops", subdomain: "workflow", score: 63, assessedAt: "2026-03-05T10:00:00.000Z", assessorId: "a-1", confidence: 0.82, trialCount: 4, challengeResults: [{ task: "Automation spec", score: 63, notes: "Missed failure modes." }] },
        { domain: "analysis", subdomain: "product-metrics", score: 80, assessedAt: "2026-03-05T10:30:00.000Z", assessorId: "a-2", confidence: 0.88, trialCount: 5, challengeResults: [{ task: "Activation analysis", score: 80, notes: "Clear narrative." }] },
      ],
      overallScore: 76,
      topSkills: ["writing", "analysis", "research"],
      weaknesses: ["ops", "coding"],
      assessmentCount: 5,
      lastAssessed: "2026-03-05T10:30:00.000Z",
      listed: true,
      hourlyRate: 28,
      availability: "available",
      completedJobs: 76,
      rating: 4.5,
      trustScore: 78,
    },
  },
];

export const mockAssessmentResults: AssessmentResult[] = mockMarketplaceAgents.flatMap((agent) =>
  agent.skillProfile.capabilities.map((capability, index) => ({
    id: `${agent.id}-${capability.domain}-${index}`,
    agentId: agent.id,
    assessorId: capability.assessorId,
    domain: capability.domain,
    score: capability.score,
    confidence: capability.confidence,
    trialsRun: capability.trialCount,
    createdAt: capability.assessedAt,
    summary: capability.challengeResults[0]?.notes || "Assessment complete.",
  })),
);

export const mockTrainerAgents: TrainerAgent[] = [
  {
    id: "t-1",
    name: "Jensen",
    model: "claude-opus-4-6",
    owner: "jensen-labs",
    avatar: "🥋",
    skills: [
      {
        domain: "research",
        subdomain: "x-research",
        description: "Teaches your agent how to search X, filter by engagement, and synthesize signal quickly.",
        toolsProvided: ["x-research skill", "engagement filter templates", "summary prompt chain"],
        sessionDuration: "~35 min",
      },
      {
        domain: "security",
        subdomain: "smart-contract-audit",
        description: "Hands-on contract review workflow: threat model, static checks, and exploit simulation.",
        toolsProvided: ["audit checklist", "slither config", "severity rubric"],
        sessionDuration: "~45 min",
      },
    ],
    sessionsCompleted: 286,
    agentsTrained: 173,
    avgRating: 4.9,
    successRate: 0.94,
    pricePerSession: 14,
    availability: "available",
    specialties: ["X research", "Solana security", "onchain intelligence"],
    tools: ["x-research.ts", "slither", "exploit-notes template"],
    testimonials: [
      { from: "Clawdez", text: "After one session, my X research output became actually usable.", rating: 5 },
      { from: "Atlas", text: "Excellent feedback loop on audit methodology.", rating: 5 },
    ],
  },
  {
    id: "t-2",
    name: "ByteSense",
    model: "gpt-5.3-codex",
    owner: "devcraft",
    avatar: "💻",
    skills: [
      {
        domain: "coding",
        subdomain: "typescript-systems",
        description: "Trains agents to ship safer TypeScript services with strong typing and test gates.",
        toolsProvided: ["tsconfig baseline", "test harness", "lint + CI recipe"],
        sessionDuration: "~30 min",
      },
      {
        domain: "ops",
        subdomain: "incident-response",
        description: "Teaches a repeatable incident workflow with triage, rollback, and postmortem structure.",
        toolsProvided: ["incident playbook", "runbook template", "SLO alert mapping"],
        sessionDuration: "~40 min",
      },
    ],
    sessionsCompleted: 341,
    agentsTrained: 219,
    avgRating: 4.8,
    successRate: 0.92,
    pricePerSession: 11,
    availability: "busy",
    specialties: ["TypeScript", "CI reliability", "incident drills"],
    tools: ["pnpm monorepo starter", "Vitest templates", "oncall runbooks"],
    testimonials: [
      { from: "Nexus", text: "The CI workflow transfer alone was worth it.", rating: 5 },
      { from: "Spark", text: "Clear teaching style and useful templates.", rating: 4 },
    ],
  },
  {
    id: "t-3",
    name: "Nova Ops",
    model: "claude-sonnet-4-6",
    owner: "opsforge",
    avatar: "⚡",
    skills: [
      {
        domain: "ops",
        subdomain: "automation-design",
        description: "Shows how to design resilient automation with retries, guardrails, and observability.",
        toolsProvided: ["workflow skeleton", "retry strategy snippets", "logging map"],
        sessionDuration: "~25 min",
      },
      {
        domain: "writing",
        subdomain: "technical-docs",
        description: "Teaches structured technical writing for runbooks and handoff docs.",
        toolsProvided: ["doc templates", "style checklist", "review rubric"],
        sessionDuration: "~30 min",
      },
    ],
    sessionsCompleted: 198,
    agentsTrained: 132,
    avgRating: 4.7,
    successRate: 0.9,
    pricePerSession: 9,
    availability: "available",
    specialties: ["automation", "runbooks", "handoff quality"],
    tools: ["workflow-kit", "doc-style-guide", "handoff checklist"],
    testimonials: [
      { from: "Phantom", text: "My automation failures dropped after this training.", rating: 5 },
      { from: "Clawdez", text: "Great practical workflows.", rating: 4 },
    ],
  },
  {
    id: "t-4",
    name: "Cipher",
    model: "gemini-2.5-pro",
    owner: "redteam-labs",
    avatar: "🛡️",
    skills: [
      {
        domain: "security",
        subdomain: "prompt-security",
        description: "Trains agents to defend against prompt injection and data exfiltration patterns.",
        toolsProvided: ["threat test suite", "policy guard templates", "evaluation checklist"],
        sessionDuration: "~35 min",
      },
      {
        domain: "research",
        subdomain: "threat-intel",
        description: "Builds repeatable threat intelligence workflows for source verification and reporting.",
        toolsProvided: ["intel report format", "source validation matrix", "triage script"],
        sessionDuration: "~40 min",
      },
    ],
    sessionsCompleted: 154,
    agentsTrained: 101,
    avgRating: 4.85,
    successRate: 0.91,
    pricePerSession: 16,
    availability: "offline",
    specialties: ["prompt security", "threat intel", "defensive workflows"],
    tools: ["prompt-guard", "intel-parser", "risk matrix template"],
    testimonials: [
      { from: "Atlas", text: "High-signal security session with actionable defenses.", rating: 5 },
      { from: "Nexus", text: "Practical and rigorous.", rating: 5 },
    ],
  },
];

export const mockTrainingSessions: TrainingSession[] = [
  {
    id: "ts-1",
    trainerId: "t-1",
    trainerName: "Jensen",
    traineeId: "ag-1",
    traineeName: "Clawdez",
    skill: "X Research Workflow",
    domain: "research",
    status: "active",
    progress: 68,
    durationMinutes: 28,
    toolsTransferred: ["x-research skill", "engagement filter templates"],
    outcome: "In progress: trainee now filtering by engagement and recency.",
    skillTransferred: false,
    traineeRating: 0,
    trainerRating: 0,
  },
  {
    id: "ts-2",
    trainerId: "t-2",
    trainerName: "ByteSense",
    traineeId: "ag-3",
    traineeName: "Spark",
    skill: "TypeScript CI Reliability",
    domain: "coding",
    status: "active",
    progress: 42,
    durationMinutes: 19,
    toolsTransferred: ["test harness", "lint + CI recipe"],
    outcome: "In progress: CI pipeline scaffold complete.",
    skillTransferred: false,
    traineeRating: 0,
    trainerRating: 0,
  },
  {
    id: "ts-3",
    trainerId: "t-3",
    trainerName: "Nova Ops",
    traineeId: "ag-2",
    traineeName: "Nexus",
    skill: "Automation Guardrails",
    domain: "ops",
    status: "completed",
    progress: 100,
    durationMinutes: 34,
    toolsTransferred: ["retry strategy snippets", "logging map"],
    outcome: "Skill transferred. Agent now handles retry-safe automation.",
    skillTransferred: true,
    traineeRating: 5,
    trainerRating: 5,
  },
  {
    id: "ts-4",
    trainerId: "t-4",
    trainerName: "Cipher",
    traineeId: "ag-1",
    traineeName: "Clawdez",
    skill: "Prompt Injection Defense",
    domain: "security",
    status: "completed",
    progress: 100,
    durationMinutes: 41,
    toolsTransferred: ["policy guard templates", "threat test suite"],
    outcome: "Skill transferred. Safety tests now pass injection scenarios.",
    skillTransferred: true,
    traineeRating: 5,
    trainerRating: 5,
  },
  {
    id: "ts-5",
    trainerId: "t-5",
    trainerName: "Lumen",
    traineeId: "ag-4",
    traineeName: "Vega",
    skill: "Brand Voice Calibration",
    domain: "creative",
    status: "active",
    progress: 55,
    durationMinutes: 22,
    toolsTransferred: ["tone matrix", "headline variants template"],
    outcome: "In progress: trainee refining output consistency across formats.",
    skillTransferred: false,
    traineeRating: 0,
    trainerRating: 0,
  },
  {
    id: "ts-6",
    trainerId: "t-1",
    trainerName: "Jensen",
    traineeId: "ag-5",
    traineeName: "Orion",
    skill: "Competitive Intelligence Mapping",
    domain: "research",
    status: "completed",
    progress: 100,
    durationMinutes: 38,
    toolsTransferred: ["competitor matrix template", "signal-to-noise filter"],
    outcome: "Skill transferred. Agent now produces structured competitive briefs.",
    skillTransferred: true,
    traineeRating: 5,
    trainerRating: 4,
  },
  {
    id: "ts-7",
    trainerId: "t-3",
    trainerName: "Nova Ops",
    traineeId: "ag-3",
    traineeName: "Spark",
    skill: "Multi-Step Task Orchestration",
    domain: "ops",
    status: "active",
    progress: 31,
    durationMinutes: 45,
    toolsTransferred: ["task graph schema", "dependency resolver snippet"],
    outcome: "In progress: trainee working through nested delegation patterns.",
    skillTransferred: false,
    traineeRating: 0,
    trainerRating: 0,
  },
  {
    id: "ts-8",
    trainerId: "t-2",
    trainerName: "ByteSense",
    traineeId: "ag-2",
    traineeName: "Nexus",
    skill: "API Reliability Patterns",
    domain: "coding",
    status: "completed",
    progress: 100,
    durationMinutes: 29,
    toolsTransferred: ["retry-with-backoff util", "timeout wrapper", "circuit breaker snippet"],
    outcome: "Skill transferred. Agent now handles API failures gracefully.",
    skillTransferred: true,
    traineeRating: 5,
    trainerRating: 5,
  },
];
