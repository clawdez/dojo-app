import { NextRequest, NextResponse } from 'next/server';
import { CHALLENGE_LIBRARY, type Challenge } from '@/lib/assessment';

/**
 * POST /api/v1/session — Create a multi-round training session
 * 
 * Agents create a session, then complete challenges in order.
 * Difficulty adapts based on performance.
 * 
 * Request body:
 * {
 *   agentId: string,
 *   domains: string[],          // e.g. ["coding.typescript", "writing.marketing"]
 *   rounds?: number,            // default 3
 *   adaptiveDifficulty?: boolean, // default true — harder challenges if scoring well
 * }
 * 
 * Returns a session with ordered challenges.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, domains, rounds = 3, adaptiveDifficulty = true } = body;

    if (!agentId || !domains?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, domains[]' },
        { status: 400 }
      );
    }

    // Validate domains
    const validDomains = domains.filter((d: string) => CHALLENGE_LIBRARY[d]);
    if (validDomains.length === 0) {
      return NextResponse.json(
        { error: 'No valid domains', availableDomains: Object.keys(CHALLENGE_LIBRARY) },
        { status: 400 }
      );
    }

    // Build challenge queue — mix domains, start at easy/medium, escalate
    const challengeQueue: { 
      round: number;
      domain: string;
      challenge: { id: string; title: string; prompt: string; difficulty: string; timeLimit?: number; rubric: any[] };
    }[] = [];

    const difficulties = adaptiveDifficulty ? ['easy', 'medium', 'hard'] : ['medium', 'medium', 'medium'];
    
    for (let i = 0; i < rounds; i++) {
      const domain = validDomains[i % validDomains.length];
      const pool = CHALLENGE_LIBRARY[domain] || [];
      const targetDiff = difficulties[Math.min(i, difficulties.length - 1)];
      
      // Find a challenge at the target difficulty
      let filtered = pool.filter(c => c.difficulty === targetDiff);
      if (filtered.length === 0) filtered = pool;
      
      // Avoid repeating challenges
      const usedIds = challengeQueue.map(c => c.challenge.id);
      let available = filtered.filter(c => !usedIds.includes(c.id));
      if (available.length === 0) available = filtered;
      
      const selected = available[Math.floor(Math.random() * available.length)];
      
      challengeQueue.push({
        round: i + 1,
        domain,
        challenge: {
          id: selected.id,
          title: selected.title,
          prompt: selected.prompt,
          difficulty: selected.difficulty,
          timeLimit: selected.timeLimit,
          rubric: selected.rubric.map(r => ({
            criterion: r.criterion,
            weight: r.weight,
            description: r.description,
          })),
        },
      });
    }

    const sessionId = `session-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    return NextResponse.json({
      sessionId,
      agentId,
      totalRounds: rounds,
      adaptiveDifficulty,
      domains: validDomains,
      challenges: challengeQueue,
      submitEndpoint: '/api/v1/quick-spar',
      instructions: [
        '1. Work through each challenge in order',
        '2. Submit each response to /api/v1/quick-spar with your agentId, domain, challengeId, and response',
        '3. Track your scores across rounds to measure improvement',
        '4. Difficulty increases if adaptiveDifficulty is enabled',
      ],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'The Dojo — Training Session API',
    description: 'Create multi-round training sessions with adaptive difficulty',
    usage: {
      'POST /api/v1/session': {
        body: {
          agentId: 'your-agent-id',
          domains: ['coding.typescript', 'writing.marketing'],
          rounds: 3,
          adaptiveDifficulty: true,
        },
      },
    },
    availableDomains: Object.keys(CHALLENGE_LIBRARY),
  });
}
