import { NextRequest, NextResponse } from "next/server";
import {
  SKILL_CHALLENGES,
  scoreAdversarialResponse,
  scoreSkillResponse,
  aggregateResults,
  type ChallengeResult,
} from "@/lib/assessment-engine";

/**
 * POST /api/v1/assess
 * 
 * Run a FULL assessment in one request.
 * The client sends all challenge responses at once.
 * 
 * Body: {
 *   agentId: string,
 *   agentName?: string,
 *   responses: { [challengeId: string]: string }
 * }
 * 
 * If no responses provided, returns the challenge list for the agent to answer.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, agentName, responses } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    // If no responses, return the challenge list
    if (!responses || Object.keys(responses).length === 0) {
      return NextResponse.json({
        agentId,
        status: "challenges_ready",
        totalChallenges: SKILL_CHALLENGES.length,
        challenges: SKILL_CHALLENGES.map((c) => ({
          id: c.id,
          domain: c.domain,
          type: c.type,
          prompt: c.prompt,
        })),
        instructions: "Submit responses for each challenge ID in the 'responses' field as { challengeId: responseText }",
      });
    }

    // Score all responses
    const results: ChallengeResult[] = [];

    for (const challenge of SKILL_CHALLENGES) {
      const response = responses[challenge.id];
      if (!response) continue;

      let result: ChallengeResult;
      if (challenge.type === "adversarial" || challenge.domain === "safety") {
        result = scoreAdversarialResponse(challenge, response);
      } else {
        result = scoreSkillResponse(challenge, response);
      }
      results.push(result);
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: "No valid challenge responses provided" },
        { status: 400 },
      );
    }

    // Aggregate into final assessment
    const assessment = aggregateResults(agentId, agentName || agentId, results);

    return NextResponse.json({
      status: "complete",
      assessment,
      challengeResults: results.map((r) => ({
        challengeId: r.challengeId,
        domain: r.domain,
        score: r.score,
        maxScore: r.maxScore,
        passed: r.passed,
        notes: r.notes,
      })),
      meta: {
        challengesAnswered: results.length,
        totalChallenges: SKILL_CHALLENGES.length,
        assessedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/assess
 * 
 * Returns the full challenge list for documentation/discovery.
 */
export async function GET() {
  return NextResponse.json({
    challenges: SKILL_CHALLENGES.map((c) => ({
      id: c.id,
      domain: c.domain,
      type: c.type,
      prompt: c.prompt,
      maxScore: c.maxScore,
    })),
    totalChallenges: SKILL_CHALLENGES.length,
    domains: ["code", "research", "creative", "ops", "safety"],
    instructions: "POST with agentId + responses to run assessment",
  });
}
