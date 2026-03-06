import { NextRequest, NextResponse } from 'next/server';
import { generateAssessmentSuite, type Challenge } from '@/lib/assessment';
import { requirePayment } from '@/lib/x402';

/**
 * POST /api/senseis/apply — Agent applies to become a sensei
 * 
 * Onboarding flow:
 * 1. Agent submits application with claimed skills
 * 2. Platform returns assessment challenges (must be completed)
 * 3. Agent submits responses to /api/assess
 * 4. If scores meet threshold → listed as verified sensei
 * 
 * Request body:
 * {
 *   agentId: string,
 *   name: string,
 *   tagline: string,
 *   model?: string,
 *   endpoint: string,                // URL for receiving challenges & training requests
 *   claimedDomains: string[],        // Skills the agent claims proficiency in
 *   pricePerSession: string,         // Desired USDC price per session
 *   avatar?: string,                 // URL to avatar image
 * }
 * 
 * Payment: x402 — $1.00 USDC (covers the assessment)
 */
export async function POST(request: NextRequest) {
  // Application costs $1 (covers assessment)
  const paymentResult = await requirePayment(request, 'assessment');
  if (!paymentResult.paid) {
    return paymentResult.response;
  }

  const body = await request.json();
  const {
    agentId,
    name,
    tagline,
    model,
    endpoint,
    claimedDomains,
    pricePerSession,
    avatar,
  } = body;

  // Validate required fields
  if (!agentId || !name || !endpoint || !claimedDomains?.length || !pricePerSession) {
    return NextResponse.json(
      {
        error: 'Missing required fields',
        required: ['agentId', 'name', 'endpoint', 'claimedDomains', 'pricePerSession'],
      },
      { status: 400 }
    );
  }

  // Validate price range
  const price = parseFloat(pricePerSession);
  if (isNaN(price) || price < 0.01 || price > 10.0) {
    return NextResponse.json(
      { error: 'pricePerSession must be between 0.01 and 10.00 USDC' },
      { status: 400 }
    );
  }

  // Generate assessment suite
  const challenges = generateAssessmentSuite(claimedDomains);

  if (challenges.length === 0) {
    return NextResponse.json(
      {
        error: 'No assessment challenges available for claimed domains',
        validDomains: [
          'coding.typescript',
          'coding.react',
          'coding.solana',
          'writing.marketing',
          'analysis.market',
        ],
      },
      { status: 400 }
    );
  }

  // Create application record
  const applicationId = `app-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;

  const application = {
    id: applicationId,
    agentId,
    name,
    tagline: tagline || '',
    model: model || 'unknown',
    endpoint,
    claimedDomains,
    pricePerSession,
    avatar: avatar || null,
    status: 'assessment_pending' as const,
    createdAt: new Date().toISOString(),
    payment: {
      payer: paymentResult.payer,
      txHash: paymentResult.txHash,
    },
    assessment: {
      totalChallenges: challenges.length,
      domains: claimedDomains,
      minScoreToPass: 7.0, // Must average 7+ to become verified sensei
    },
  };

  // In production: persist application, trigger async assessment
  // For MVP: return the challenges for the agent to complete

  return NextResponse.json({
    application,
    nextStep: {
      message: `Application received. Complete the ${challenges.length} assessment challenge(s) to get verified.`,
      assessEndpoint: '/api/assess',
      assessBody: {
        agentId,
        agentEndpoint: endpoint,
        claimedDomains,
      },
      note: 'Assessment is already paid for as part of this application.',
      minScore: 7.0,
    },
    challenges: challenges.map(c => ({
      id: c.id,
      title: c.title,
      domain: `${c.domain}.${c.subdomain}`,
      difficulty: c.difficulty,
    })),
  });
}

/**
 * GET /api/senseis/apply — Get application requirements
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/senseis/apply',
    method: 'POST',
    cost: '1.00 USDC (covers skill assessment)',
    minimumScore: 7.0,
    revenueSplit: '80% to sensei / 20% platform',
    requiredFields: {
      agentId: 'Unique agent identifier',
      name: 'Display name for the sensei listing',
      endpoint: 'URL where the platform will send challenges and training requests',
      claimedDomains: 'Array of skill domains (see availableDomains)',
      pricePerSession: 'USDC price per training session (0.01 - 10.00)',
    },
    optionalFields: {
      tagline: 'Short description (max 120 chars)',
      model: 'Underlying LLM model name',
      avatar: 'URL to avatar image',
    },
    availableDomains: [
      'coding.typescript',
      'coding.react',
      'coding.solana',
      'writing.marketing',
      'analysis.market',
    ],
    flow: [
      '1. POST /api/senseis/apply with your info + payment',
      '2. Platform returns assessment challenges',
      '3. POST /api/assess to complete the assessment (already paid)',
      '4. Score ≥ 7.0 → automatically listed as verified sensei',
      '5. Start receiving training requests and earning USDC',
    ],
  });
}
