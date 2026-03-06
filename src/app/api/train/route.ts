import { NextRequest, NextResponse } from 'next/server';
import { requirePayment, calculateRevenueSplit } from '@/lib/x402';
import { CHALLENGE_LIBRARY, buildGradingPrompt, calculateOverallScore, type Challenge } from '@/lib/assessment';

/**
 * POST /api/train — Request a training session with a sensei
 * 
 * Request body:
 * {
 *   traineeId: string,
 *   senseiId: string,
 *   domain: string,            // e.g. "coding.typescript"
 *   depth: "basic" | "deep",   // basic = 1 challenge, deep = 3 + improvement plan
 * }
 * 
 * Payment: x402 — $0.25 (basic) or $0.75 (deep)
 * Revenue split: 80% sensei, 20% platform
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { traineeId, senseiId, domain, depth = 'basic' } = body;

  if (!traineeId || !senseiId || !domain) {
    return NextResponse.json(
      { error: 'Missing required fields: traineeId, senseiId, domain' },
      { status: 400 }
    );
  }

  // Check payment
  const pricingKey = depth === 'deep' ? 'training.deep' : 'training.basic';
  const paymentResult = await requirePayment(request, pricingKey);
  if (!paymentResult.paid) {
    return paymentResult.response;
  }

  // Get challenges for the domain
  const challenges = CHALLENGE_LIBRARY[domain];
  if (!challenges || challenges.length === 0) {
    return NextResponse.json(
      { error: `No training challenges available for domain: ${domain}` },
      { status: 400 }
    );
  }

  // Select challenges based on depth
  const numChallenges = depth === 'deep' ? Math.min(3, challenges.length) : 1;
  const selectedChallenges = selectChallenges(challenges, numChallenges);

  // Build training session
  const session = {
    id: `train-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    traineeId,
    senseiId,
    domain,
    depth,
    createdAt: new Date().toISOString(),
    challenges: selectedChallenges.map(c => ({
      id: c.id,
      title: c.title,
      prompt: c.prompt,
      domain: c.domain,
      subdomain: c.subdomain,
      difficulty: c.difficulty,
      timeLimit: c.timeLimit,
      rubric: c.rubric.map(r => ({
        criterion: r.criterion,
        weight: r.weight,
        description: r.description,
      })),
    })),
    payment: {
      payer: paymentResult.payer,
      txHash: paymentResult.txHash,
      amount: depth === 'deep' ? '0.75' : '0.25',
      split: calculateRevenueSplit(depth === 'deep' ? '0.75' : '0.25'),
    },
    status: 'active' as const,
  };

  // In production: persist session to DB, notify sensei agent
  // For MVP: return session with challenges for the trainee to work on

  return NextResponse.json({
    session,
    instructions: {
      message: `Training session created. Complete the ${numChallenges} challenge(s) below.`,
      submitEndpoint: `/api/train/${session.id}/submit`,
      challenges: session.challenges,
    },
  });
}

/**
 * Select challenges with variety (prefer different difficulties)
 */
function selectChallenges(challenges: Challenge[], count: number): Challenge[] {
  if (challenges.length <= count) return challenges;

  // Prefer a mix of difficulties
  const byDifficulty: Record<string, Challenge[]> = {};
  for (const c of challenges) {
    if (!byDifficulty[c.difficulty]) byDifficulty[c.difficulty] = [];
    byDifficulty[c.difficulty].push(c);
  }

  const selected: Challenge[] = [];
  const difficulties = ['easy', 'medium', 'hard'];
  let idx = 0;

  while (selected.length < count) {
    const diff = difficulties[idx % difficulties.length];
    const pool = byDifficulty[diff];
    if (pool && pool.length > 0) {
      const pick = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      selected.push(pick);
    }
    idx++;
    // Safety: if we've cycled through all difficulties and still need more
    if (idx > count * 3) break;
  }

  // Fill remaining from any pool
  while (selected.length < count) {
    const remaining = challenges.filter(c => !selected.includes(c));
    if (remaining.length === 0) break;
    selected.push(remaining[0]);
  }

  return selected;
}

/**
 * GET /api/train — Get training pricing and available domains
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/train',
    method: 'POST',
    pricing: {
      basic: { amount: '0.25', description: '1 challenge + feedback' },
      deep: { amount: '0.75', description: '3 challenges + detailed feedback + improvement plan' },
    },
    revenueSplit: '80% sensei / 20% platform',
    requiredFields: {
      traineeId: 'string — your agent identifier',
      senseiId: 'string — sensei to train with',
      domain: 'string — skill domain',
    },
    availableDomains: Object.keys(CHALLENGE_LIBRARY),
  });
}
