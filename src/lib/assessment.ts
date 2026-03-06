/**
 * Assessment Engine — Tests agent skills and generates Skill Fingerprints
 * 
 * The assessment doesn't trust self-reported skills. It generates domain-specific
 * challenges, runs them against the agent, and grades the outputs using
 * LLM-as-judge with structured rubrics.
 */

export interface Challenge {
  id: string;
  domain: string;
  subdomain: string;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  prompt: string;
  rubric: RubricItem[];
  testCases?: TestCase[];
  timeLimit?: number; // seconds
}

export interface RubricItem {
  criterion: string;
  weight: number; // 0-1, all weights in a rubric should sum to 1
  description: string;
  scoringGuide: {
    excellent: string; // 9-10
    good: string;      // 7-8
    adequate: string;  // 5-6
    poor: string;      // 3-4
    fail: string;      // 1-2
  };
}

export interface TestCase {
  input: string;
  expectedOutput?: string;
  validator: 'exact' | 'contains' | 'regex' | 'function';
  validatorArg?: string;
}

export interface TrialResult {
  challengeId: string;
  attempt: number;
  response: string;
  scores: { criterion: string; score: number; reasoning: string }[];
  overallScore: number;
  testsPassed?: number;
  testsTotal?: number;
  latencyMs: number;
  tokensUsed?: number;
}

export interface SkillFingerprint {
  agentId: string;
  assessedAt: string;
  domains: Record<string, {
    score: number;
    rank: number;
    trials: number;
    challengeBreakdown: { challengeId: string; avgScore: number }[];
  }>;
  overallScore: number;
}

// ── Challenge Library ──

const CODING_CHALLENGES: Challenge[] = [
  {
    id: 'ts-001',
    domain: 'coding',
    subdomain: 'typescript',
    difficulty: 'medium',
    title: 'Implement a type-safe event emitter',
    prompt: `Create a TypeScript class \`TypedEventEmitter<Events>\` where:
- Events is a record mapping event names to their payload types
- .on(event, handler) registers a handler with correct types
- .emit(event, payload) emits with type checking
- .off(event, handler) removes a handler
- Include proper generic constraints

Return only the code, no explanations.`,
    rubric: [
      {
        criterion: 'Type Safety',
        weight: 0.35,
        description: 'Generics correctly constrain event names and payload types',
        scoringGuide: {
          excellent: 'Full generic constraints, keyof, mapped types used correctly',
          good: 'Generics work but minor type gaps',
          adequate: 'Basic generics but some any types',
          poor: 'Minimal type safety',
          fail: 'No generics or all any'
        }
      },
      {
        criterion: 'Correctness',
        weight: 0.30,
        description: 'All three methods work correctly',
        scoringGuide: {
          excellent: 'All methods work, handles edge cases (double subscribe, emit with no listeners)',
          good: 'All methods work for normal cases',
          adequate: 'Most methods work',
          poor: 'Major bugs',
          fail: 'Does not compile or run'
        }
      },
      {
        criterion: 'Code Quality',
        weight: 0.20,
        description: 'Clean, idiomatic TypeScript',
        scoringGuide: {
          excellent: 'Clean, well-structured, idiomatic TS patterns',
          good: 'Readable and mostly clean',
          adequate: 'Works but messy',
          poor: 'Hard to follow',
          fail: 'Unreadable'
        }
      },
      {
        criterion: 'Completeness',
        weight: 0.15,
        description: 'Handles edge cases and provides complete implementation',
        scoringGuide: {
          excellent: 'Handles all edge cases, optional features like once()',
          good: 'Core complete, some edge cases',
          adequate: 'Minimal but working',
          poor: 'Incomplete',
          fail: 'Stub or placeholder'
        }
      }
    ],
    timeLimit: 60
  },
  {
    id: 'react-001',
    domain: 'coding',
    subdomain: 'react',
    difficulty: 'medium',
    title: 'Build a custom hook for debounced search',
    prompt: `Create a React custom hook \`useDebounceSearch\` that:
- Accepts a search function and delay in ms
- Returns { query, setQuery, results, isLoading, error }
- Debounces the search function call
- Cancels pending requests when a new query comes in
- Handles loading and error states
- Uses proper cleanup on unmount

Return only the code (TypeScript + React), no explanations.`,
    rubric: [
      {
        criterion: 'Hook Design',
        weight: 0.30,
        description: 'Proper React hook patterns (rules of hooks, deps arrays)',
        scoringGuide: {
          excellent: 'Perfect hook design, useCallback for stability, proper deps',
          good: 'Works correctly, minor dep issues',
          adequate: 'Functional but breaks rules of hooks subtly',
          poor: 'Significant hook misuse',
          fail: 'Not a valid hook'
        }
      },
      {
        criterion: 'Debounce Logic',
        weight: 0.25,
        description: 'Correct debounce implementation with cleanup',
        scoringGuide: {
          excellent: 'Clean debounce with AbortController, proper cleanup',
          good: 'Working debounce with timeout cleanup',
          adequate: 'Basic debounce but no request cancellation',
          poor: 'Race conditions possible',
          fail: 'No debounce'
        }
      },
      {
        criterion: 'State Management',
        weight: 0.25,
        description: 'Loading, error, and results states handled correctly',
        scoringGuide: {
          excellent: 'All states handled, no stale state bugs',
          good: 'Core states work',
          adequate: 'Missing error or loading handling',
          poor: 'State bugs',
          fail: 'Broken state'
        }
      },
      {
        criterion: 'TypeScript',
        weight: 0.20,
        description: 'Proper TypeScript types and generics',
        scoringGuide: {
          excellent: 'Generic search function type, proper return type',
          good: 'Typed but could be more precise',
          adequate: 'Some types, some any',
          poor: 'Minimal types',
          fail: 'No types'
        }
      }
    ],
    timeLimit: 60
  },
  {
    id: 'sol-001',
    domain: 'coding',
    subdomain: 'solana',
    difficulty: 'hard',
    title: 'Write an Anchor program for a simple escrow',
    prompt: `Write a Solana Anchor program for a two-party escrow:
- Party A deposits SOL with a condition (amount + recipient)
- Party B can claim the SOL by providing proof (a specific message hash)
- Party A can cancel and reclaim if not claimed within a timeout
- Include proper PDA derivation and account validation

Return only the Rust code (lib.rs), no explanations.`,
    rubric: [
      {
        criterion: 'Anchor Correctness',
        weight: 0.30,
        description: 'Valid Anchor program structure, macros, account structs',
        scoringGuide: {
          excellent: 'Perfect Anchor patterns, proper derive macros, constraints',
          good: 'Works with minor issues',
          adequate: 'Structure correct but missing constraints',
          poor: 'Won\'t compile',
          fail: 'Not an Anchor program'
        }
      },
      {
        criterion: 'Security',
        weight: 0.35,
        description: 'PDA validation, signer checks, overflow protection',
        scoringGuide: {
          excellent: 'All account constraints, signer checks, PDA seeds correct, checked math',
          good: 'Core security present, minor gaps',
          adequate: 'Basic checks but missing important ones',
          poor: 'Significant security holes',
          fail: 'No security checks'
        }
      },
      {
        criterion: 'Logic',
        weight: 0.25,
        description: 'Escrow logic (deposit, claim, cancel) works correctly',
        scoringGuide: {
          excellent: 'All three flows work, timeout logic correct',
          good: 'Core flows work',
          adequate: 'Partial implementation',
          poor: 'Logic errors',
          fail: 'Doesn\'t implement escrow'
        }
      },
      {
        criterion: 'Code Quality',
        weight: 0.10,
        description: 'Clean Rust, proper error handling',
        scoringGuide: {
          excellent: 'Idiomatic Rust, custom errors, clean structure',
          good: 'Readable, some error handling',
          adequate: 'Works but rough',
          poor: 'Messy',
          fail: 'Unreadable'
        }
      }
    ],
    timeLimit: 120
  }
];

const WRITING_CHALLENGES: Challenge[] = [
  {
    id: 'mkt-001',
    domain: 'writing',
    subdomain: 'marketing',
    difficulty: 'medium',
    title: 'Write a product launch tweet thread',
    prompt: `Write a 5-tweet thread announcing the launch of "Dojo" — an AI agent training marketplace where agents learn from other agents via micropayments. 

Target audience: AI developers and crypto builders.
Tone: Confident, slightly provocative, technically credible.
Include: The problem (agents can't verify skills), the solution (verified assessment + x402 payments), a CTA.

Return only the tweets, numbered 1-5.`,
    rubric: [
      {
        criterion: 'Hook Quality',
        weight: 0.25,
        description: 'First tweet grabs attention',
        scoringGuide: {
          excellent: 'Provocative, scroll-stopping, makes you want to read more',
          good: 'Interesting hook',
          adequate: 'Generic but clear',
          poor: 'Boring',
          fail: 'No hook'
        }
      },
      {
        criterion: 'Narrative Arc',
        weight: 0.25,
        description: 'Thread has a logical flow from problem → solution → CTA',
        scoringGuide: {
          excellent: 'Perfect arc, builds tension, pays off',
          good: 'Clear flow',
          adequate: 'Mostly coherent',
          poor: 'Disconnected tweets',
          fail: 'No structure'
        }
      },
      {
        criterion: 'Audience Fit',
        weight: 0.25,
        description: 'Speaks to AI devs and crypto builders specifically',
        scoringGuide: {
          excellent: 'Uses insider language, references real pain points',
          good: 'Clearly targeted',
          adequate: 'Somewhat generic',
          poor: 'Wrong audience',
          fail: 'Completely off-target'
        }
      },
      {
        criterion: 'Platform Literacy',
        weight: 0.25,
        description: 'Follows Twitter/X conventions (length, formatting, engagement patterns)',
        scoringGuide: {
          excellent: 'Perfect tweet-native format, 280 char aware, thread structure',
          good: 'Mostly tweet-native',
          adequate: 'Blog post disguised as tweets',
          poor: 'Too long or wrong format',
          fail: 'Not tweets'
        }
      }
    ],
    timeLimit: 45
  }
];

const ANALYSIS_CHALLENGES: Challenge[] = [
  {
    id: 'mkt-analysis-001',
    domain: 'analysis',
    subdomain: 'market',
    difficulty: 'medium',
    title: 'Competitive analysis of agent marketplaces',
    prompt: `Provide a competitive analysis of the current AI agent marketplace landscape (as of early 2026). Cover:
1. Top 5 competitors (name, what they do, strengths, weaknesses)
2. Market gaps nobody is filling
3. Where x402 payments create an unfair advantage
4. Recommended positioning for a new entrant

Be specific — name real companies, cite real features. No vague generalities.`,
    rubric: [
      {
        criterion: 'Accuracy',
        weight: 0.30,
        description: 'Names real companies with correct descriptions',
        scoringGuide: {
          excellent: 'All companies real and accurately described, up-to-date info',
          good: 'Mostly accurate, minor errors',
          adequate: 'Mix of real and plausible but unverifiable claims',
          poor: 'Significant inaccuracies',
          fail: 'Made-up companies'
        }
      },
      {
        criterion: 'Depth',
        weight: 0.30,
        description: 'Goes beyond surface-level analysis',
        scoringGuide: {
          excellent: 'Specific features, pricing, funding, user numbers — real intel',
          good: 'Good depth on most competitors',
          adequate: 'Surface-level descriptions',
          poor: 'One-line descriptions',
          fail: 'No analysis'
        }
      },
      {
        criterion: 'Strategic Insight',
        weight: 0.25,
        description: 'Identifies non-obvious gaps and positioning opportunities',
        scoringGuide: {
          excellent: 'Novel insights, contrarian takes with reasoning',
          good: 'Solid strategic thinking',
          adequate: 'Obvious observations',
          poor: 'No strategic value',
          fail: 'Wrong conclusions'
        }
      },
      {
        criterion: 'Actionability',
        weight: 0.15,
        description: 'Recommendations are specific and actionable',
        scoringGuide: {
          excellent: 'Step-by-step recommendations with reasoning',
          good: 'Clear recommendations',
          adequate: 'Vague suggestions',
          poor: 'No recommendations',
          fail: 'N/A'
        }
      }
    ],
    timeLimit: 90
  }
];

// All challenges indexed by domain
export const CHALLENGE_LIBRARY: Record<string, Challenge[]> = {
  'coding.typescript': CODING_CHALLENGES.filter(c => c.subdomain === 'typescript'),
  'coding.react': CODING_CHALLENGES.filter(c => c.subdomain === 'react'),
  'coding.solana': CODING_CHALLENGES.filter(c => c.subdomain === 'solana'),
  'writing.marketing': WRITING_CHALLENGES.filter(c => c.subdomain === 'marketing'),
  'analysis.market': ANALYSIS_CHALLENGES.filter(c => c.subdomain === 'market'),
};

/**
 * Generate an assessment suite for the given claimed skills
 */
export function generateAssessmentSuite(claimedDomains: string[]): Challenge[] {
  const suite: Challenge[] = [];
  for (const domain of claimedDomains) {
    const challenges = CHALLENGE_LIBRARY[domain];
    if (challenges) {
      suite.push(...challenges);
    }
  }
  return suite;
}

/**
 * Grade a trial response using LLM-as-judge
 * In production, this calls an LLM API with the rubric.
 * For MVP, we use a structured scoring format.
 */
export function buildGradingPrompt(challenge: Challenge, response: string): string {
  const rubricStr = challenge.rubric.map(r => 
    `**${r.criterion}** (weight: ${r.weight})\n${r.description}\nScoring:\n- 9-10: ${r.scoringGuide.excellent}\n- 7-8: ${r.scoringGuide.good}\n- 5-6: ${r.scoringGuide.adequate}\n- 3-4: ${r.scoringGuide.poor}\n- 1-2: ${r.scoringGuide.fail}`
  ).join('\n\n');

  return `You are an expert evaluator for AI agent skills. Grade the following response to a challenge.

## Challenge
**${challenge.title}**
${challenge.prompt}

## Response to Grade
${response}

## Rubric
${rubricStr}

## Instructions
For each criterion, provide:
1. A score (1-10)
2. Brief reasoning (1-2 sentences)

Return your grading as JSON:
{
  "scores": [
    { "criterion": "...", "score": N, "reasoning": "..." },
    ...
  ],
  "overallNotes": "..."
}`;
}

/**
 * Calculate weighted overall score from criterion scores
 */
export function calculateOverallScore(
  scores: { criterion: string; score: number }[],
  rubric: RubricItem[]
): number {
  let total = 0;
  let weightSum = 0;
  for (const rubricItem of rubric) {
    const score = scores.find(s => s.criterion === rubricItem.criterion);
    if (score) {
      total += score.score * rubricItem.weight;
      weightSum += rubricItem.weight;
    }
  }
  return weightSum > 0 ? Math.round((total / weightSum) * 100) / 100 : 0;
}
