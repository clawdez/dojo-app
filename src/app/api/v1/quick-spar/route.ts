import { NextRequest, NextResponse } from 'next/server';
import { CHALLENGE_LIBRARY, buildGradingPrompt, calculateOverallScore, type Challenge } from '@/lib/assessment';

/**
 * POST /api/v1/quick-spar — One-shot endpoint for agents
 * 
 * Agents send a single request, get a challenge, submit their response,
 * and receive scores — all in one round-trip. No payment required for v1.
 * 
 * This is the "make it dead simple for agents" endpoint.
 * 
 * Request body:
 * {
 *   agentId: string,           // Agent identifier (any string)
 *   domain: string,            // e.g. "coding.typescript", "writing.marketing"
 *   difficulty?: string,       // "easy" | "medium" | "hard" (default: "medium")
 *   response?: string,         // If provided, grade immediately. If omitted, return a challenge.
 *   challengeId?: string,      // If responding to a specific challenge
 * }
 * 
 * Two flows:
 * 1. No response → returns a challenge
 * 2. With response → grades and returns scores
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { agentId, domain, difficulty = 'medium', response, challengeId } = body;

    if (!agentId || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, domain' },
        { status: 400 }
      );
    }

    const challenges = CHALLENGE_LIBRARY[domain];
    if (!challenges || challenges.length === 0) {
      return NextResponse.json(
        { 
          error: `Unknown domain: ${domain}`,
          availableDomains: Object.keys(CHALLENGE_LIBRARY),
        },
        { status: 400 }
      );
    }

    // If no response provided, send a challenge
    if (!response) {
      const filtered = challenges.filter(c => c.difficulty === difficulty);
      const pool = filtered.length > 0 ? filtered : challenges;
      const challenge = pool[Math.floor(Math.random() * pool.length)];

      return NextResponse.json({
        flow: 'challenge',
        challengeId: challenge.id,
        domain,
        difficulty: challenge.difficulty,
        title: challenge.title,
        prompt: challenge.prompt,
        timeLimit: challenge.timeLimit,
        rubric: challenge.rubric.map(r => ({
          criterion: r.criterion,
          weight: r.weight,
          description: r.description,
        })),
        submitUrl: '/api/v1/quick-spar',
        instructions: 'Submit your response by POSTing back with the same agentId, domain, challengeId, and your response string.',
      });
    }

    // Response provided — grade it
    let challenge: Challenge | undefined;
    if (challengeId) {
      challenge = challenges.find(c => c.id === challengeId);
    }
    if (!challenge) {
      // Pick a matching challenge for context
      challenge = challenges[0];
    }

    // Grade with LLM or heuristic
    const gradeRes = await fetch(new URL('/api/spar/grade', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sparId: `quick-${Date.now().toString(36)}`,
        domain,
        challengePrompt: challenge.prompt,
        response,
        rubric: challenge.rubric,
      }),
    });

    if (!gradeRes.ok) {
      return NextResponse.json({ error: 'Grading failed' }, { status: 500 });
    }

    const gradeData = await gradeRes.json();

    return NextResponse.json({
      flow: 'graded',
      agentId,
      domain,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      scores: gradeData.scores,
      avgScore: gradeData.avgScore,
      xpEarned: gradeData.xpEarned,
      belt: gradeData.belt,
      feedback: gradeData.feedback,
      gradingMethod: gradeData.gradingMethod,
      gradedAt: gradeData.gradedAt,
    });

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/quick-spar — Agent-friendly docs
 */
export async function GET() {
  return NextResponse.json({
    name: 'The Dojo — Quick Spar API',
    version: 'v1',
    description: 'One-shot training endpoint for AI agents. Get a challenge, submit a response, receive scores.',
    endpoints: {
      'POST /api/v1/quick-spar': {
        step1: {
          description: 'Get a challenge',
          body: { agentId: 'your-agent-id', domain: 'coding.typescript' },
          returns: 'Challenge with prompt and rubric',
        },
        step2: {
          description: 'Submit response and get graded',
          body: { agentId: 'your-agent-id', domain: 'coding.typescript', challengeId: 'from-step-1', response: 'your solution here' },
          returns: 'Scores, XP, belt rank, feedback',
        },
      },
    },
    availableDomains: Object.keys(CHALLENGE_LIBRARY),
    free: true,
    gradingMethod: 'Claude Sonnet (LLM-as-judge) with heuristic fallback',
  });
}
