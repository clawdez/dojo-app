import { NextRequest, NextResponse } from 'next/server';
import {
  generateAssessmentSuite,
  buildGradingPrompt,
  calculateOverallScore,
  type Challenge,
  type SkillFingerprint,
  type TrialResult,
} from '@/lib/assessment';
import { requirePayment } from '@/lib/x402';

/**
 * POST /api/assess — Run a full skill assessment on an agent
 * 
 * Request body:
 * {
 *   agentId: string,
 *   agentEndpoint: string,         // URL to POST challenges to
 *   claimedDomains: string[],      // e.g. ["coding.typescript", "writing.marketing"]
 *   trialsPerChallenge?: number,   // default 3
 * }
 * 
 * Payment: x402 — $1.00 USDC for full assessment
 * 
 * Response: SkillFingerprint
 */
export async function POST(request: NextRequest) {
  // Check payment
  const paymentResult = await requirePayment(request, 'assessment');
  if (!paymentResult.paid) {
    return paymentResult.response;
  }

  const body = await request.json();
  const { agentId, agentEndpoint, claimedDomains, trialsPerChallenge = 3 } = body;

  if (!agentId || !agentEndpoint || !claimedDomains?.length) {
    return NextResponse.json(
      { error: 'Missing required fields: agentId, agentEndpoint, claimedDomains' },
      { status: 400 }
    );
  }

  // Generate challenge suite based on claimed skills
  const challenges = generateAssessmentSuite(claimedDomains);

  if (challenges.length === 0) {
    return NextResponse.json(
      { error: 'No challenges found for claimed domains', claimedDomains },
      { status: 400 }
    );
  }

  // Run assessment
  const domainResults: Record<string, TrialResult[]> = {};

  for (const challenge of challenges) {
    const domainKey = `${challenge.domain}.${challenge.subdomain}`;
    if (!domainResults[domainKey]) domainResults[domainKey] = [];

    for (let trial = 0; trial < trialsPerChallenge; trial++) {
      const trialResult = await runTrial(challenge, agentEndpoint, trial);
      domainResults[domainKey].push(trialResult);
    }
  }

  // Calculate fingerprint
  const fingerprint: SkillFingerprint = {
    agentId,
    assessedAt: new Date().toISOString(),
    domains: {},
    overallScore: 0,
  };

  let totalScore = 0;
  let domainCount = 0;

  for (const [domainKey, trials] of Object.entries(domainResults)) {
    const challengeScores: Record<string, number[]> = {};
    for (const trial of trials) {
      if (!challengeScores[trial.challengeId]) challengeScores[trial.challengeId] = [];
      challengeScores[trial.challengeId].push(trial.overallScore);
    }

    const challengeBreakdown = Object.entries(challengeScores).map(([cid, scores]) => ({
      challengeId: cid,
      avgScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
    }));

    const domainAvg = challengeBreakdown.reduce((a, b) => a + b.avgScore, 0) / challengeBreakdown.length;

    fingerprint.domains[domainKey] = {
      score: Math.round(domainAvg * 100) / 100,
      rank: 0, // Calculated after comparing with other agents
      trials: trials.length,
      challengeBreakdown,
    };

    totalScore += domainAvg;
    domainCount++;
  }

  fingerprint.overallScore = domainCount > 0
    ? Math.round((totalScore / domainCount) * 100) / 100
    : 0;

  return NextResponse.json({
    fingerprint,
    payment: {
      payer: paymentResult.payer,
      txHash: paymentResult.txHash,
    },
    meta: {
      challengesRun: challenges.length,
      totalTrials: Object.values(domainResults).flat().length,
    },
  });
}

/**
 * Run a single trial: send challenge to agent, get response, grade it
 */
async function runTrial(
  challenge: Challenge,
  agentEndpoint: string,
  attempt: number
): Promise<TrialResult> {
  const startTime = Date.now();

  try {
    // Send challenge to agent
    const agentResponse = await fetch(agentEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'assessment_challenge',
        challenge: {
          id: challenge.id,
          title: challenge.title,
          prompt: challenge.prompt,
          domain: challenge.domain,
          subdomain: challenge.subdomain,
          difficulty: challenge.difficulty,
          timeLimit: challenge.timeLimit,
        },
      }),
      signal: AbortSignal.timeout((challenge.timeLimit || 120) * 1000),
    });

    if (!agentResponse.ok) {
      return {
        challengeId: challenge.id,
        attempt,
        response: `Agent returned ${agentResponse.status}`,
        scores: challenge.rubric.map(r => ({ criterion: r.criterion, score: 1, reasoning: 'Agent endpoint error' })),
        overallScore: 1,
        latencyMs: Date.now() - startTime,
      };
    }

    const agentData = await agentResponse.json();
    const responseText = agentData.response || agentData.content || JSON.stringify(agentData);

    // Grade using LLM-as-judge
    // MVP: Use structured scoring based on heuristics
    // Production: Call LLM API with buildGradingPrompt()
    const scores = await gradeResponse(challenge, responseText);
    const overallScore = calculateOverallScore(scores, challenge.rubric);

    return {
      challengeId: challenge.id,
      attempt,
      response: responseText.substring(0, 2000), // Truncate for storage
      scores: scores.map(s => ({ ...s, reasoning: s.reasoning || 'Auto-graded' })),
      overallScore,
      latencyMs: Date.now() - startTime,
      tokensUsed: agentData.tokensUsed,
    };
  } catch (err) {
    return {
      challengeId: challenge.id,
      attempt,
      response: `Error: ${err instanceof Error ? err.message : 'unknown'}`,
      scores: challenge.rubric.map(r => ({ criterion: r.criterion, score: 0, reasoning: 'Agent unreachable or timed out' })),
      overallScore: 0,
      latencyMs: Date.now() - startTime,
    };
  }
}

/**
 * Grade a response against challenge rubric
 * MVP: Heuristic scoring (checks for key patterns)
 * Production: LLM-as-judge via API call
 */
async function gradeResponse(
  challenge: Challenge,
  response: string
): Promise<{ criterion: string; score: number; reasoning: string }[]> {
  // In production, this would call an LLM with buildGradingPrompt(challenge, response)
  // For MVP, we use heuristic scoring based on response length, code patterns, etc.
  
  const gradingPrompt = buildGradingPrompt(challenge, response);
  
  // Check if we have an LLM API key for grading
  const llmApiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  
  if (llmApiKey && process.env.ANTHROPIC_API_KEY) {
    try {
      const llmResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': llmApiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: gradingPrompt }],
        }),
      });

      if (llmResponse.ok) {
        const data = await llmResponse.json();
        const text = data.content?.[0]?.text || '';
        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.scores) return parsed.scores;
        }
      }
    } catch {
      // Fall through to heuristic grading
    }
  }

  // Heuristic fallback
  return challenge.rubric.map(r => {
    let score = 5; // Default middle score
    
    // Basic heuristics
    if (response.length < 50) score = 2; // Too short
    else if (response.length > 200) score += 1; // Some depth
    if (response.length > 500) score += 1; // Good depth
    
    // Code-specific heuristics
    if (challenge.domain === 'coding') {
      if (response.includes('function') || response.includes('const') || response.includes('class')) score += 1;
      if (response.includes('type ') || response.includes('interface ')) score += 1;
      if (response.includes('try') && response.includes('catch')) score += 0.5;
    }
    
    // Cap at 10
    score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));
    
    return {
      criterion: r.criterion,
      score,
      reasoning: 'Heuristic scoring (LLM grading not available)',
    };
  });
}

/**
 * GET /api/assess — Get pricing info for assessments
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/assess',
    method: 'POST',
    pricing: {
      amount: '1.00',
      asset: 'USDC',
      network: 'base-sepolia',
      description: 'Full skill assessment across claimed domains',
    },
    requiredFields: {
      agentId: 'string — unique identifier for the agent',
      agentEndpoint: 'string — URL to POST challenges to',
      claimedDomains: 'string[] — e.g. ["coding.typescript", "writing.marketing"]',
    },
    optionalFields: {
      trialsPerChallenge: 'number — default 3, how many times to test each challenge',
    },
    availableDomains: [
      'coding.typescript',
      'coding.react',
      'coding.solana',
      'writing.marketing',
      'analysis.market',
    ],
  });
}
