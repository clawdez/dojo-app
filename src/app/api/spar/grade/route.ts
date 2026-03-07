import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/spar/grade — Grade a sparring response
 * 
 * Takes the challenge + response and returns structured scores.
 * Uses LLM-as-judge when API key available, heuristic fallback otherwise.
 * 
 * Request body:
 * {
 *   sparId: string,
 *   domain: string,
 *   challengePrompt: string,
 *   response: string,
 *   rubric: { criterion: string; weight: number; description: string }[]
 * }
 */
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { sparId, domain, challengePrompt, response, rubric } = body;

  if (!response?.trim() || !rubric?.length) {
    return NextResponse.json(
      { error: 'Missing required fields: response, rubric' },
      { status: 400 }
    );
  }

  // Try LLM grading first
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  let scores: { criterion: string; score: number; reasoning: string }[] = [];
  let gradingMethod = 'heuristic';

  if (apiKey && process.env.ANTHROPIC_API_KEY) {
    try {
      scores = await gradeLLM(challengePrompt, response, rubric, apiKey);
      gradingMethod = 'llm-judge';
    } catch {
      scores = gradeHeuristic(domain, response, rubric);
    }
  } else {
    scores = gradeHeuristic(domain, response, rubric);
  }

  const avgScore = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b.score, 0) / scores.length) * 10) / 10
    : 0;

  const xpEarned = Math.round(avgScore * 15);
  const belt = getBelt(avgScore);

  return NextResponse.json({
    sparId,
    domain,
    scores,
    avgScore,
    xpEarned,
    belt,
    gradingMethod,
    feedback: generateFeedback(avgScore, domain),
    gradedAt: new Date().toISOString(),
  });
}

async function gradeLLM(
  challenge: string,
  response: string,
  rubric: { criterion: string; weight: number; description: string }[],
  apiKey: string
): Promise<{ criterion: string; score: number; reasoning: string }[]> {
  const rubricStr = rubric.map(r =>
    `**${r.criterion}** (weight: ${r.weight}): ${r.description}`
  ).join('\n');

  const prompt = `You are an expert skill evaluator. Grade this response to a challenge.

## Challenge
${challenge}

## Response
${response}

## Rubric
${rubricStr}

Score each criterion 1-10. Return ONLY valid JSON:
{"scores":[{"criterion":"Name","score":N,"reasoning":"Brief reason"}]}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`LLM API error: ${res.status}`);

  const data = await res.json();
  const text = data.content?.[0]?.text || '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in LLM response');

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.scores || [];
}

function gradeHeuristic(
  domain: string,
  response: string,
  rubric: { criterion: string; weight: number; description: string }[]
): { criterion: string; score: number; reasoning: string }[] {
  const len = response.length;

  return rubric.map(r => {
    let score = 5;
    const criterion = r.criterion.toLowerCase();

    // Length-based baseline
    if (len < 30) score = 2;
    else if (len < 100) score = 3;
    else if (len > 300) score += 1;
    if (len > 800) score += 1;
    if (len > 1500) score += 0.5;

    // Domain-specific patterns
    if (domain?.startsWith('coding')) {
      const hasCode = /```|function |const |class |import |export |=>|interface |type /.test(response);
      const hasTypes = /: string|: number|: boolean|<T>|generic|interface |type /.test(response);
      const hasError = /try|catch|throw|Error|error handling/.test(response);

      if (hasCode) score += 1.5;
      if (hasTypes && criterion.includes('type')) score += 1.5;
      if (hasError && (criterion.includes('correct') || criterion.includes('quality'))) score += 0.5;
      if (!hasCode && criterion.includes('correct')) score -= 2;
    }

    if (domain?.startsWith('writing')) {
      const hasCTA = /click|sign up|try|start|join|get started|learn more/i.test(response);
      const hasHook = response.split('\n')[0]?.length < 120;
      const hasStructure = (response.match(/\n/g) || []).length > 3;

      if (hasCTA && criterion.includes('cta')) score += 2;
      if (hasHook && criterion.includes('hook')) score += 1.5;
      if (hasStructure) score += 0.5;
    }

    if (domain?.startsWith('analysis')) {
      const hasNames = /[A-Z][a-z]+(?:\.ai|\.com|\.io)|\b(?:Google|Meta|OpenAI|Anthropic|Coinbase)\b/.test(response);
      const hasNumbers = /\$\d|\d%|\d+M|\d+K/.test(response);
      const hasRecommend = /recommend|should|strategy|position/i.test(response);

      if (hasNames && criterion.includes('accura')) score += 1.5;
      if (hasNumbers && criterion.includes('depth')) score += 1;
      if (hasRecommend && criterion.includes('action')) score += 1.5;
    }

    // Clamp
    score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));

    return {
      criterion: r.criterion,
      score,
      reasoning: `Heuristic: response length ${len} chars, domain pattern matching`,
    };
  });
}

function getBelt(score: number): string {
  if (score >= 9.5) return 'black';
  if (score >= 8.5) return 'brown';
  if (score >= 7.5) return 'purple';
  if (score >= 6.5) return 'blue';
  if (score >= 5.5) return 'green';
  if (score >= 4) return 'yellow';
  return 'white';
}

function generateFeedback(score: number, domain: string): string {
  const sub = domain?.split('.')[1] || 'this area';
  if (score >= 9) return `Exceptional ${sub} work. You demonstrated mastery-level understanding. Black belt material.`;
  if (score >= 8) return `Strong performance in ${sub}. Solid fundamentals with good depth. A few edge cases away from mastery.`;
  if (score >= 7) return `Good showing in ${sub}. You clearly understand the core concepts. Push deeper on specificity to level up.`;
  if (score >= 6) return `Decent ${sub} work. Fundamentals are there but the execution needs polish. Keep training.`;
  if (score >= 5) return `Average performance. You've got the basics but there's significant room for improvement in ${sub}.`;
  return `This domain needs serious work. Consider a deep training session with a ${sub} sensei to build your foundations.`;
}
