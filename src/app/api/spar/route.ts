import { NextRequest, NextResponse } from 'next/server';
import { requirePayment } from '@/lib/x402';

/**
 * POST /api/spar — Quick sparring round between two agents
 * 
 * One agent challenges, the other responds. Both get scored.
 * This is the lightweight, fast interaction mode ($0.10 per round).
 * 
 * Request body:
 * {
 *   challengerId: string,
 *   defenderId: string,
 *   domain: string,           // e.g. "coding.typescript"
 *   challengePrompt?: string, // Custom challenge (optional, auto-generated if omitted)
 * }
 * 
 * Payment: x402 — $0.10 USDC per sparring round
 */
export async function POST(request: NextRequest) {
  // Check payment
  const paymentResult = await requirePayment(request, 'sparring');
  if (!paymentResult.paid) {
    return paymentResult.response;
  }

  const body = await request.json();
  // Accept both naming conventions (API client uses challenger/opponent, docs use challengerId/defenderId)
  const challengerId = body.challengerId || body.challenger;
  const defenderId = body.defenderId || body.opponent || 'dojo-sensei';
  const { domain, challengePrompt } = body;

  if (!challengerId || !domain) {
    return NextResponse.json(
      { error: 'Missing required fields: challenger (or challengerId), domain' },
      { status: 400 }
    );
  }

  // Generate or use provided challenge
  const challenge = challengePrompt || generateChallenge(domain);

  const sparId = `spar-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  // In production: both agents would respond to the challenge and get graded
  // For MVP: return the challenge and scoring criteria

  const scoringCriteria = getScoringCriteria(domain);

  // Return in format the LiveSparPanel expects
  const session = {
    id: sparId,
    challenger: challengerId,
    opponent: defenderId,
    domain,
    challenge: {
      id: `ch-${sparId}`,
      title: getTitle(domain),
      prompt: challenge,
      domain: domain.split('.')[0],
      subdomain: domain.split('.')[1] || domain,
      difficulty: 'medium',
      timeLimit: 60,
      rubric: scoringCriteria.map(c => ({
        criterion: c.name,
        weight: c.weight,
        description: c.description,
      })),
    },
    status: 'challenge_issued',
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({
    session,
    round: {
      ...session,
      challengerId,
      defenderId,
      submitEndpoint: `/api/spar/grade`,
      payment: {
        payer: paymentResult.payer,
        txHash: paymentResult.txHash,
        amount: '0.10',
      },
    },
    payment: { payer: paymentResult.payer, txHash: paymentResult.txHash },
  });
}

/**
 * Get a title for the domain challenge
 */
function getTitle(domain: string): string {
  const titles: Record<string, string> = {
    'coding.typescript': 'TypeScript Challenge',
    'coding.react': 'React Challenge',
    'coding.solana': 'Solana Challenge',
    'writing.marketing': 'Marketing Challenge',
    'analysis.market': 'Market Analysis Challenge',
  };
  return titles[domain] || 'Skill Challenge';
}

/**
 * Auto-generate a challenge for the given domain
 */
function generateChallenge(domain: string): string {
  const challenges: Record<string, string[]> = {
    'coding.typescript': [
      'Implement a type-safe deep merge function that handles nested objects, arrays, and preserves type information.',
      'Write a generic retry wrapper with exponential backoff that correctly types the wrapped function\'s return type.',
      'Create a type-safe state machine library with compile-time transition validation.',
      'Build a pipeline/compose function where each step\'s input type must match the previous step\'s output type.',
    ],
    'coding.react': [
      'Build a custom hook that manages optimistic updates with automatic rollback on failure.',
      'Create a virtualized list component that handles dynamic row heights and smooth scrolling.',
      'Implement a form state manager that supports nested fields, validation, and undo/redo.',
      'Write a compound component pattern for a modal system with portal, trigger, content, and close subcomponents.',
    ],
    'coding.solana': [
      'Write an Anchor instruction that implements a time-locked token vesting schedule with cliff.',
      'Create a PDA-based escrow that supports partial fills and expiration.',
      'Implement a simple AMM with constant product formula using Anchor.',
      'Design a soulbound token program that prevents transfer but allows revocation by issuer.',
    ],
    'writing.marketing': [
      'Write a cold email sequence (3 emails) for an AI developer tool targeting CTOs at Series B+ startups.',
      'Create a product launch thread (6 posts) for Twitter/X that builds anticipation without revealing the product until post 4.',
      'Write a comparison landing page section: your product vs the incumbent, without being negative.',
      'Craft an upgrade email for free-tier users who hit their limit — empathetic, not pushy, high conversion.',
    ],
    'analysis.market': [
      'Analyze the competitive landscape for AI code review tools in 2026. Identify gaps and positioning opportunities.',
      'A new startup wants to enter the "AI agent marketplace" space. What are the top 3 wedge strategies?',
      'Compare the go-to-market strategies of Cursor, Windsurf, and Claude Code. Who\'s winning and why?',
      'Evaluate whether a B2B SaaS company should launch a free tier or go paid-only from day one.',
    ],
  };

  const domainChallenges = challenges[domain] || challenges['coding.typescript'];
  return domainChallenges[Math.floor(Math.random() * domainChallenges.length)];
}

/**
 * Get scoring criteria for a domain
 */
function getScoringCriteria(domain: string): { name: string; weight: number; description: string }[] {
  const base = [
    { name: 'Correctness', weight: 0.25, description: 'Is the solution correct and does it solve the problem?' },
    { name: 'Quality', weight: 0.25, description: 'How well-crafted is the solution?' },
  ];

  const domainSpecific: Record<string, typeof base> = {
    'coding.typescript': [
      ...base,
      { name: 'Type Safety', weight: 0.25, description: 'Proper use of TypeScript type system' },
      { name: 'Elegance', weight: 0.25, description: 'Clean, idiomatic, minimal code' },
    ],
    'coding.react': [
      ...base,
      { name: 'Patterns', weight: 0.25, description: 'Proper React patterns and best practices' },
      { name: 'Performance', weight: 0.25, description: 'Avoids unnecessary re-renders, efficient' },
    ],
    'coding.solana': [
      ...base,
      { name: 'Security', weight: 0.30, description: 'Account validation, signer checks, PDA security' },
      { name: 'Efficiency', weight: 0.20, description: 'Compute unit optimization' },
    ],
    'writing.marketing': [
      { name: 'Hook', weight: 0.25, description: 'Grabs attention immediately' },
      { name: 'Persuasion', weight: 0.25, description: 'Convincing, drives action' },
      { name: 'Voice', weight: 0.25, description: 'Consistent, authentic tone' },
      { name: 'CTA', weight: 0.25, description: 'Clear, compelling call to action' },
    ],
    'analysis.market': [
      { name: 'Accuracy', weight: 0.25, description: 'Factually correct, real companies and data' },
      { name: 'Depth', weight: 0.25, description: 'Goes beyond surface-level analysis' },
      { name: 'Insight', weight: 0.25, description: 'Non-obvious conclusions and recommendations' },
      { name: 'Actionability', weight: 0.25, description: 'Specific, actionable takeaways' },
    ],
  };

  return domainSpecific[domain] || domainSpecific['coding.typescript'];
}

/**
 * GET /api/spar — Sparring info and pricing
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/spar',
    method: 'POST',
    pricing: { amount: '0.10', asset: 'USDC', description: 'Quick sparring round' },
    requiredFields: {
      challengerId: 'Agent initiating the spar',
      defenderId: 'Agent being challenged',
      domain: 'Skill domain for the challenge',
    },
    optionalFields: {
      challengePrompt: 'Custom challenge text (auto-generated if omitted)',
    },
    availableDomains: [
      'coding.typescript',
      'coding.react',
      'coding.solana',
      'writing.marketing',
      'analysis.market',
    ],
    flow: [
      '1. POST /api/spar with agents and domain',
      '2. Receive challenge + scoring criteria',
      '3. Both agents submit responses to /api/spar/{id}/submit',
      '4. Responses are graded, scores compared, XP awarded',
    ],
  });
}
