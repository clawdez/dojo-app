import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/v1/curriculum/train — Submit a response to a curriculum challenge
 * 
 * Grades the agent's response against:
 * 1. The sensei's reference answer (if provided)
 * 2. The custom rubric criteria
 * 3. Adaptive rules (min score to advance, retries, weak spot focus)
 * 
 * Request body:
 * {
 *   curriculumId: string,
 *   agentId: string,
 *   challengeIndex: number,          // which challenge (0-based)
 *   response: string,                // agent's answer
 *   attempt: number,                 // which attempt (1-based, for retries)
 *   challenge: {                     // the challenge definition (from curriculum)
 *     prompt: string,
 *     referenceAnswer?: string,
 *     rubric: { criterion: string; weight: number; description: string; exemplar?: string }[],
 *     hints?: string[],
 *   },
 *   adaptiveRules?: {
 *     minScoreToAdvance: number,
 *     maxRetries: number,
 *   },
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { curriculumId, agentId, challengeIndex, response, attempt = 1, challenge, adaptiveRules } = body;

    if (!agentId || !response?.trim() || !challenge?.rubric?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, response, challenge.rubric' },
        { status: 400 }
      );
    }

    const minScore = adaptiveRules?.minScoreToAdvance ?? 7;
    const maxRetries = adaptiveRules?.maxRetries ?? 3;

    // Build grading prompt that includes reference answer
    const gradingPrompt = buildReferenceGradingPrompt(
      challenge.prompt,
      response,
      challenge.referenceAnswer,
      challenge.rubric,
    );

    // Grade via internal grading API
    const gradeRes = await fetch(new URL('/api/spar/grade', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sparId: `curriculum-${curriculumId}-${challengeIndex}-${attempt}`,
        domain: 'custom',
        challengePrompt: gradingPrompt.enhancedPrompt,
        response,
        rubric: challenge.rubric,
      }),
    });

    if (!gradeRes.ok) {
      return NextResponse.json({ error: 'Grading failed' }, { status: 500 });
    }

    const gradeData = await gradeRes.json();

    // Determine if agent passed
    const passed = gradeData.avgScore >= minScore;
    const canRetry = attempt < maxRetries;
    const weakCriteria = (gradeData.scores || [])
      .filter((s: any) => s.score < minScore)
      .map((s: any) => s.criterion);

    // Generate targeted hint if agent didn't pass
    let hint: string | null = null;
    if (!passed && challenge.hints?.length) {
      const hintIndex = Math.min(attempt - 1, challenge.hints.length - 1);
      hint = challenge.hints[hintIndex];
    }

    // Generate improvement guidance from reference answer
    let improvementGuide: string | null = null;
    if (!passed && challenge.referenceAnswer) {
      improvementGuide = `Look at what the sensei's reference does differently. Focus on: ${weakCriteria.join(', ')}. ` +
        `The reference answer scores high because it ${
          weakCriteria.includes('Hook Power') ? 'opens with a surprising data point' :
          weakCriteria.includes('Brevity') ? 'uses fewer words with more impact' :
          weakCriteria.includes('Data Usage') ? 'includes specific, verifiable numbers' :
          'addresses the rubric criteria directly'
        }. Try again with these adjustments.`;
    }

    return NextResponse.json({
      curriculumId,
      agentId,
      challengeIndex,
      attempt,
      scores: gradeData.scores,
      avgScore: gradeData.avgScore,
      passed,
      xpEarned: gradeData.xpEarned,
      belt: gradeData.belt,
      feedback: gradeData.feedback,
      gradingMethod: gradeData.gradingMethod,
      // Adaptive training fields
      weakCriteria,
      hint,
      improvementGuide,
      canRetry: !passed && canRetry,
      nextAction: passed
        ? { action: 'advance', nextChallengeIndex: challengeIndex + 1 }
        : canRetry
          ? { action: 'retry', attempt: attempt + 1, focusOn: weakCriteria }
          : { action: 'review', message: 'Max retries reached. Review the reference answer and try the curriculum again.' },
      // If passed and reference answer exists, show it for learning
      referenceAnswer: passed ? challenge.referenceAnswer : null,
    });

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}

/**
 * Build a grading prompt that compares against the sensei's reference answer
 */
function buildReferenceGradingPrompt(
  challengePrompt: string,
  agentResponse: string,
  referenceAnswer: string | null,
  rubric: any[],
) {
  let enhancedPrompt = challengePrompt;

  if (referenceAnswer) {
    enhancedPrompt = `${challengePrompt}\n\n--- SENSEI'S REFERENCE ANSWER (for comparison) ---\n${referenceAnswer}\n\n--- GRADING INSTRUCTIONS ---\nGrade the submitted response against BOTH the rubric criteria AND the quality of the reference answer. The reference answer represents what "excellent" looks like for this specific challenge. Score relative to that standard.`;
  }

  return { enhancedPrompt };
}
