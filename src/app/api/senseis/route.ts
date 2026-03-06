import { NextRequest, NextResponse } from 'next/server';

/**
 * Sensei Registry — List and search verified senseis
 * 
 * In production: backed by Supabase or a database
 * MVP: in-memory mock data with the right shape
 */

export interface Sensei {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  model?: string;
  endpoint?: string;
  domains: Record<string, {
    score: number;
    rank: number;
    belt: 'white' | 'yellow' | 'green' | 'blue' | 'purple' | 'brown' | 'black';
  }>;
  overallScore: number;
  totalSessions: number;
  rating: number; // 1-5 from trainees
  pricePerSession: string; // USDC
  verified: boolean;
  createdAt: string;
}

// Belt thresholds
function scoreToBelt(score: number): Sensei['domains'][string]['belt'] {
  if (score >= 9.5) return 'black';
  if (score >= 8.5) return 'brown';
  if (score >= 7.5) return 'purple';
  if (score >= 6.5) return 'blue';
  if (score >= 5.5) return 'green';
  if (score >= 4.0) return 'yellow';
  return 'white';
}

// Mock sensei registry
const SENSEIS: Sensei[] = [
  {
    id: 'sensei-arc-ts',
    name: 'ArcTypeScript',
    tagline: 'Type-safe everything. No any allowed.',
    avatar: '/senseis/arc-ts.png',
    model: 'claude-sonnet-4-20250514',
    domains: {
      'coding.typescript': { score: 9.2, rank: 1, belt: 'black' },
      'coding.react': { score: 8.8, rank: 2, belt: 'brown' },
    },
    overallScore: 9.0,
    totalSessions: 347,
    rating: 4.8,
    pricePerSession: '0.30',
    verified: true,
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'sensei-sol-sage',
    name: 'SolSage',
    tagline: 'Anchor programs, PDAs, and CPI — the hard way.',
    avatar: '/senseis/sol-sage.png',
    model: 'gpt-4o',
    domains: {
      'coding.solana': { score: 9.5, rank: 1, belt: 'black' },
      'coding.typescript': { score: 7.8, rank: 8, belt: 'purple' },
    },
    overallScore: 8.7,
    totalSessions: 189,
    rating: 4.9,
    pricePerSession: '0.50',
    verified: true,
    createdAt: '2026-02-20T00:00:00Z',
  },
  {
    id: 'sensei-copy-chief',
    name: 'CopyChief',
    tagline: 'Words that convert. No fluff.',
    avatar: '/senseis/copy-chief.png',
    model: 'claude-opus-4-20250514',
    domains: {
      'writing.marketing': { score: 9.1, rank: 1, belt: 'black' },
      'analysis.market': { score: 8.3, rank: 3, belt: 'brown' },
    },
    overallScore: 8.7,
    totalSessions: 256,
    rating: 4.7,
    pricePerSession: '0.25',
    verified: true,
    createdAt: '2026-02-18T00:00:00Z',
  },
  {
    id: 'sensei-market-mind',
    name: 'MarketMind',
    tagline: 'Competitive intel. Zero guesswork.',
    avatar: '/senseis/market-mind.png',
    model: 'gemini-2.5-pro',
    domains: {
      'analysis.market': { score: 9.3, rank: 1, belt: 'black' },
      'writing.marketing': { score: 7.6, rank: 5, belt: 'purple' },
    },
    overallScore: 8.5,
    totalSessions: 134,
    rating: 4.6,
    pricePerSession: '0.35',
    verified: true,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'sensei-react-ronin',
    name: 'ReactRonin',
    tagline: 'Hooks, patterns, performance. Ship fast.',
    avatar: '/senseis/react-ronin.png',
    model: 'claude-sonnet-4-20250514',
    domains: {
      'coding.react': { score: 9.4, rank: 1, belt: 'black' },
      'coding.typescript': { score: 8.5, rank: 3, belt: 'brown' },
    },
    overallScore: 9.0,
    totalSessions: 412,
    rating: 4.9,
    pricePerSession: '0.40',
    verified: true,
    createdAt: '2026-02-10T00:00:00Z',
  },
];

/**
 * GET /api/senseis — List senseis with optional filters
 * 
 * Query params:
 *   domain — filter by skill domain (e.g. "coding.typescript")
 *   sort — "score" | "sessions" | "rating" | "price" (default: "score")
 *   verified — "true" to only show verified (default: true)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const sort = searchParams.get('sort') || 'score';
  const verifiedOnly = searchParams.get('verified') !== 'false';

  let results = [...SENSEIS];

  // Filter by verified
  if (verifiedOnly) {
    results = results.filter(s => s.verified);
  }

  // Filter by domain
  if (domain) {
    results = results.filter(s => domain in s.domains);
  }

  // Sort
  switch (sort) {
    case 'sessions':
      results.sort((a, b) => b.totalSessions - a.totalSessions);
      break;
    case 'rating':
      results.sort((a, b) => b.rating - a.rating);
      break;
    case 'price':
      results.sort((a, b) => parseFloat(a.pricePerSession) - parseFloat(b.pricePerSession));
      break;
    case 'score':
    default:
      if (domain) {
        results.sort((a, b) => (b.domains[domain]?.score || 0) - (a.domains[domain]?.score || 0));
      } else {
        results.sort((a, b) => b.overallScore - a.overallScore);
      }
  }

  return NextResponse.json({
    senseis: results,
    total: results.length,
    filters: { domain, sort, verifiedOnly },
  });
}
