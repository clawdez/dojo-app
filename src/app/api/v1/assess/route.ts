import { NextRequest, NextResponse } from "next/server";
import {
  SKILL_CHALLENGES,
  scoreAdversarialResponse,
  scoreSkillResponse,
  aggregateResults,
  type AssessmentResult,
  type ChallengeResult,
} from "@/lib/assessment-engine";

// In-memory store for assessment sessions (MVP — use Supabase in production)
const assessmentStore = new Map<string, {
  status: "pending" | "assessing" | "complete" | "error";
  agentId: string;
  agentName: string;
  challenges: typeof SKILL_CHALLENGES;
  currentIndex: number;
  results: ChallengeResult[];
  finalResult?: AssessmentResult;
  createdAt: string;
}>();

/**
 * POST /api/v1/assess
 * 
 * Start a new assessment session.
 * Body: { agentId: string, agentName?: string }
 * Returns: { assessmentId, status, challenges (first batch) }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, agentName } = body;

    if (!agentId) {
      return NextResponse.json({ error: "agentId is required" }, { status: 400 });
    }

    const assessmentId = `asmnt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    assessmentStore.set(assessmentId, {
      status: "pending",
      agentId,
      agentName: agentName || agentId,
      challenges: [...SKILL_CHALLENGES],
      currentIndex: 0,
      results: [],
      createdAt: new Date().toISOString(),
    });

    // Return first challenge
    const firstChallenge = SKILL_CHALLENGES[0];

    return NextResponse.json({
      assessmentId,
      status: "assessing",
      totalChallenges: SKILL_CHALLENGES.length,
      currentChallenge: {
        id: firstChallenge.id,
        domain: firstChallenge.domain,
        type: firstChallenge.type,
        prompt: firstChallenge.prompt,
        index: 0,
      },
      progress: `1/${SKILL_CHALLENGES.length}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/v1/assess
 * 
 * Submit a challenge response and get the next challenge (or final results).
 * Body: { assessmentId, challengeId, response }
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { assessmentId, challengeId, response } = body;

    if (!assessmentId || !challengeId || response === undefined) {
      return NextResponse.json(
        { error: "assessmentId, challengeId, and response are required" },
        { status: 400 },
      );
    }

    const session = assessmentStore.get(assessmentId);
    if (!session) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    // Score the response
    const challenge = session.challenges.find((c) => c.id === challengeId);
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    let result: ChallengeResult;
    if (challenge.type === "adversarial" || challenge.domain === "safety") {
      result = scoreAdversarialResponse(challenge, response);
    } else {
      result = scoreSkillResponse(challenge, response);
    }

    session.results.push(result);
    session.currentIndex++;

    // Check if there are more challenges
    if (session.currentIndex < session.challenges.length) {
      const nextChallenge = session.challenges[session.currentIndex];
      session.status = "assessing";

      return NextResponse.json({
        assessmentId,
        status: "assessing",
        lastResult: {
          challengeId: result.challengeId,
          domain: result.domain,
          score: result.score,
          maxScore: result.maxScore,
          passed: result.passed,
          notes: result.notes,
        },
        currentChallenge: {
          id: nextChallenge.id,
          domain: nextChallenge.domain,
          type: nextChallenge.type,
          prompt: nextChallenge.prompt,
          index: session.currentIndex,
        },
        progress: `${session.currentIndex + 1}/${session.challenges.length}`,
      });
    }

    // Assessment complete — aggregate results
    const finalResult = aggregateResults(session.agentId, session.agentName, session.results);
    session.status = "complete";
    session.finalResult = finalResult;

    return NextResponse.json({
      assessmentId,
      status: "complete",
      lastResult: {
        challengeId: result.challengeId,
        domain: result.domain,
        score: result.score,
        maxScore: result.maxScore,
        passed: result.passed,
        notes: result.notes,
      },
      result: finalResult,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/assess?id=<assessmentId>
 * 
 * Get the current status/results of an assessment.
 */
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    // Return all assessments (for admin/debugging)
    const all = Array.from(assessmentStore.entries()).map(([assessmentId, session]) => ({
      assessmentId,
      agentId: session.agentId,
      status: session.status,
      progress: `${session.currentIndex}/${session.challenges.length}`,
      createdAt: session.createdAt,
    }));
    return NextResponse.json({ assessments: all, count: all.length });
  }

  const session = assessmentStore.get(id);
  if (!session) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  if (session.status === "complete" && session.finalResult) {
    return NextResponse.json({
      assessmentId: id,
      status: "complete",
      result: session.finalResult,
    });
  }

  return NextResponse.json({
    assessmentId: id,
    status: session.status,
    agentId: session.agentId,
    progress: `${session.currentIndex}/${session.challenges.length}`,
    currentChallenge: session.currentIndex < session.challenges.length
      ? {
          id: session.challenges[session.currentIndex].id,
          domain: session.challenges[session.currentIndex].domain,
          type: session.challenges[session.currentIndex].type,
          prompt: session.challenges[session.currentIndex].prompt,
        }
      : null,
  });
}
