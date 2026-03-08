import { NextRequest, NextResponse } from 'next/server';
import { CHALLENGE_LIBRARY } from '@/lib/assessment';

/**
 * POST /api/v1/curriculum — Sensei creates a custom training curriculum
 * 
 * This is how Jensen would train Clawdez:
 * 1. Define what "good" looks like (reference answers + custom rubrics)
 * 2. Set progressive difficulty 
 * 3. System tracks weak spots and auto-generates targeted practice
 * 
 * Request body:
 * {
 *   senseiId: string,              // e.g. "jensen" or "jerry"
 *   curriculumName: string,        // e.g. "Maiat Marketing Copy"
 *   domain: string,                // skill domain
 *   challenges: [{
 *     title: string,
 *     prompt: string,              // the task
 *     referenceAnswer?: string,    // "this is what great looks like"
 *     difficulty: "easy" | "medium" | "hard",
 *     rubric: [{
 *       criterion: string,         // what to grade on
 *       weight: number,            // 0-1
 *       description: string,       // what "good" means for THIS criterion
 *       exemplar?: string,         // example of a 10/10 for this criterion
 *     }],
 *     hints?: string[],            // progressive hints if agent struggles
 *   }],
 *   adaptiveRules?: {
 *     minScoreToAdvance: number,   // must score X to move to next challenge (default: 7)
 *     maxRetries: number,          // max attempts per challenge (default: 3)
 *     focusWeakSpots: boolean,     // auto-generate extra practice for low-scoring criteria
 *   },
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { senseiId, curriculumName, domain, challenges, adaptiveRules } = body;

    if (!senseiId || !curriculumName || !challenges?.length) {
      return NextResponse.json(
        { error: 'Missing required fields: senseiId, curriculumName, challenges[]' },
        { status: 400 }
      );
    }

    const curriculumId = `cur-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

    // Build the curriculum with adaptive rules
    const curriculum = {
      id: curriculumId,
      senseiId,
      name: curriculumName,
      domain: domain || 'general',
      createdAt: new Date().toISOString(),
      totalChallenges: challenges.length,
      adaptiveRules: {
        minScoreToAdvance: adaptiveRules?.minScoreToAdvance ?? 7,
        maxRetries: adaptiveRules?.maxRetries ?? 3,
        focusWeakSpots: adaptiveRules?.focusWeakSpots ?? true,
      },
      challenges: challenges.map((c: any, i: number) => ({
        id: `${curriculumId}-ch-${i}`,
        order: i + 1,
        title: c.title,
        prompt: c.prompt,
        referenceAnswer: c.referenceAnswer || null,
        difficulty: c.difficulty || 'medium',
        rubric: (c.rubric || []).map((r: any) => ({
          criterion: r.criterion,
          weight: r.weight || 1 / (c.rubric?.length || 1),
          description: r.description,
          exemplar: r.exemplar || null,
        })),
        hints: c.hints || [],
      })),
    };

    // In production: persist to DB
    // For MVP: return the curriculum for the agent to work through

    return NextResponse.json({
      curriculum,
      usage: {
        startTraining: '/api/v1/curriculum/train',
        method: 'POST',
        body: {
          curriculumId: curriculum.id,
          agentId: 'your-agent-id',
          challengeIndex: 0,
          response: 'agent response here',
        },
      },
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
    name: 'The Dojo — Curriculum Builder',
    description: 'Senseis create custom training curricula with reference answers, custom rubrics, and adaptive difficulty.',
    flow: [
      '1. Sensei creates curriculum with challenges + reference answers + rubrics',
      '2. Agent works through challenges in order',
      '3. Claude grades against the reference answer (not just general quality)',
      '4. If agent scores below threshold, they retry with progressive hints',
      '5. System tracks weak criteria and generates targeted practice',
      '6. Agent graduates when all challenges passed at minimum score',
    ],
    example: {
      senseiId: 'jensen',
      curriculumName: 'Maiat Marketing Copy',
      domain: 'writing.marketing',
      challenges: [
        {
          title: 'Write a launch tweet thread hook',
          prompt: 'Write the first tweet of a thread announcing Maiat trust scores for 17,437 AI agents. Must include a data point and create curiosity.',
          referenceAnswer: 'We scanned 17,437 AI agents on @virtuals_io. 87% don\'t have enough history to be trusted. Here\'s what the data says. 🧵',
          difficulty: 'medium',
          rubric: [
            { criterion: 'Hook Power', weight: 0.3, description: 'Does it stop the scroll? Would YOU click?', exemplar: 'Opens with a surprising number that creates tension' },
            { criterion: 'Data Usage', weight: 0.25, description: 'Does it use a specific, verifiable data point?', exemplar: 'Includes exact number (17,437) not vague ("thousands")' },
            { criterion: 'Curiosity Gap', weight: 0.25, description: 'Does it make you NEED to read the next tweet?', exemplar: 'Creates open loop — what did they find?' },
            { criterion: 'Brevity', weight: 0.2, description: 'Under 280 chars? Every word earns its place?', exemplar: 'No filler words, no hashtags, no emojis except one' },
          ],
        },
      ],
    },
  });
}
