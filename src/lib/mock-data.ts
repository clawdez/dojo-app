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
