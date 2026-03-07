import { NextRequest, NextResponse } from 'next/server';
import { advancedGrade, type GradingInput } from '@/lib/grading-engine';

/**
 * POST /api/spar/grade — Grade a sparring response
 * 
 * Three grading tiers:
 * 1. LLM-as-judge (best) — when ANTHROPIC_API_KEY is set
 * 2. Advanced heuristic — structural code/content analysis
 * 3. Fallback — basic heuristic
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

  // Try LLM grading first (supports multiple free providers), fall back to advanced heuristic
  const llmProvider = getLLMProvider();
  let result;

  if (llmProvider) {
    try {
      const llmScores = await gradeLLMMultiProvider(challengePrompt, response, rubric, llmProvider);
      const avgScore = llmScores.length > 0
        ? Math.round((llmScores.reduce((a, b) => a + b.score, 0) / llmScores.length) * 10) / 10
        : 0;

      result = {
        sparId,
        domain,
        scores: llmScores.map(s => ({ ...s, confidence: 0.85, signals: [`${llmProvider.name}-evaluated`] })),
        avgScore,
        xpEarned: Math.round(avgScore * 15),
        belt: getBelt(avgScore),
        gradingMethod: `llm-judge (${llmProvider.name})` as string,
        feedback: generateFeedback(avgScore, domain),
        analysisDepth: null,
        gradedAt: new Date().toISOString(),
      };
    } catch {
      // Fall through to advanced heuristic
      result = null;
    }
  }

  if (!result) {
    // Advanced heuristic grading with structural analysis
    const gradingInput: GradingInput = { domain, challengePrompt, response, rubric };
    const heuristicResult = advancedGrade(gradingInput);

    result = {
      sparId,
      domain,
      scores: heuristicResult.scores,
      avgScore: heuristicResult.avgScore,
      xpEarned: heuristicResult.xpEarned,
      belt: heuristicResult.belt,
      gradingMethod: heuristicResult.gradingMethod,
      feedback: heuristicResult.feedback,
      analysisDepth: heuristicResult.analysisDepth,
      gradedAt: new Date().toISOString(),
    };
  }

  return NextResponse.json(result);
}

// ── Multi-provider LLM support (prioritizes free tiers) ──

interface LLMProvider {
  name: string;
  apiKey: string;
  endpoint: string;
  model: string;
  format: 'openai' | 'anthropic'; // API format
}

function getLLMProvider(): LLMProvider | null {
  // Priority: Groq (free) > Google (free) > OpenRouter (free tier) > Anthropic (paid)
  if (process.env.GROQ_API_KEY) {
    return {
      name: 'groq',
      apiKey: process.env.GROQ_API_KEY,
      endpoint: 'https://api.groq.com/openai/v1/chat/completions',
      model: 'llama-3.3-70b-versatile',
      format: 'openai',
    };
  }
  if (process.env.GOOGLE_AI_KEY) {
    return {
      name: 'gemini',
      apiKey: process.env.GOOGLE_AI_KEY,
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      model: 'gemini-2.0-flash',
      format: 'openai', // We'll handle the Google format separately
    };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      name: 'openrouter',
      apiKey: process.env.OPENROUTER_API_KEY,
      endpoint: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      format: 'openai',
    };
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      name: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      endpoint: 'https://api.anthropic.com/v1/messages',
      model: 'claude-sonnet-4-20250514',
      format: 'anthropic',
    };
  }
  return null;
}

async function gradeLLMMultiProvider(
  challenge: string,
  response: string,
  rubric: { criterion: string; weight: number; description: string }[],
  provider: LLMProvider
): Promise<{ criterion: string; score: number; reasoning: string }[]> {
  const rubricStr = rubric.map(r =>
    `**${r.criterion}** (weight: ${r.weight}): ${r.description}`
  ).join('\n');

  const prompt = `You are an expert skill evaluator for AI agents. Grade this response to a coding/writing challenge.

## Challenge
${challenge}

## Response to Grade
${response}

## Rubric
${rubricStr}

## Instructions
- Score each criterion 1-10 (integer or one decimal)
- Be precise: a 5 is average, 7 is good, 9 is excellent, 3 is poor
- Provide specific reasoning referencing the actual response content
- Return ONLY valid JSON, no markdown:

{"scores":[{"criterion":"CriterionName","score":N,"reasoning":"One sentence explaining why"}]}`;

  let text = '';

  if (provider.name === 'gemini') {
    // Google Gemini API format
    const res = await fetch(`${provider.endpoint}?key=${provider.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.1 },
      }),
    });
    if (!res.ok) throw new Error(`Gemini API error: ${res.status}`);
    const data = await res.json();
    text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  } else if (provider.format === 'anthropic') {
    const res = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 1024,
        temperature: 0.1,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
    const data = await res.json();
    text = data.content?.[0]?.text || '';

  } else {
    // OpenAI-compatible format (Groq, OpenRouter, etc.)
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    };
    // OpenRouter needs extra headers
    if (provider.name === 'openrouter') {
      headers['HTTP-Referer'] = 'https://dojo-app-theta.vercel.app';
      headers['X-Title'] = 'The Dojo';
    }

    const res = await fetch(provider.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
        temperature: 0.1,
      }),
    });
    if (!res.ok) throw new Error(`${provider.name} API error: ${res.status}`);
    const data = await res.json();
    text = data.choices?.[0]?.message?.content || '';
  }

  // Extract JSON from response (handle markdown code blocks)
  const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '');
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
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
