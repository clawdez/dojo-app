/**
 * API client — hooks and utilities for The Dojo API routes
 */

const API_BASE = '';

// ── Types (matching API responses) ──

export interface SenseiDomain {
  score: number;
  rank: number;
  belt: 'white' | 'yellow' | 'green' | 'blue' | 'purple' | 'brown' | 'black';
}

export interface APISensei {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  model?: string;
  endpoint?: string;
  domains: Record<string, SenseiDomain>;
  overallScore: number;
  totalSessions: number;
  rating: number;
  pricePerSession: string;
  verified: boolean;
  createdAt: string;
}

export interface SenseiListResponse {
  senseis: APISensei[];
  total: number;
  filters: {
    domain: string | null;
    sort: string;
    verifiedOnly: boolean;
  };
}

export interface AssessmentPricing {
  amount: string;
  asset: string;
  network: string;
  description: string;
}

export interface TrainingPricing {
  basic: { amount: string; description: string };
  deep: { amount: string; description: string };
}

// ── Fetch helpers ──

export async function fetchSenseis(params?: {
  domain?: string;
  sort?: 'score' | 'sessions' | 'rating' | 'price';
  verified?: boolean;
}): Promise<SenseiListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.domain) searchParams.set('domain', params.domain);
  if (params?.sort) searchParams.set('sort', params.sort);
  if (params?.verified !== undefined) searchParams.set('verified', String(params.verified));

  const res = await fetch(`${API_BASE}/api/senseis?${searchParams.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch senseis: ${res.status}`);
  return res.json();
}

export async function fetchAssessmentInfo(): Promise<{
  pricing: AssessmentPricing;
  availableDomains: string[];
}> {
  const res = await fetch(`${API_BASE}/api/assess`);
  if (!res.ok) throw new Error(`Failed to fetch assessment info: ${res.status}`);
  return res.json();
}

export async function fetchTrainingInfo(): Promise<{
  pricing: TrainingPricing;
  availableDomains: string[];
  revenueSplit: string;
}> {
  const res = await fetch(`${API_BASE}/api/train`);
  if (!res.ok) throw new Error(`Failed to fetch training info: ${res.status}`);
  return res.json();
}

export async function fetchSenseiApplyInfo(): Promise<{
  cost: string;
  minimumScore: number;
  availableDomains: string[];
  flow: string[];
}> {
  const res = await fetch(`${API_BASE}/api/senseis/apply`);
  if (!res.ok) throw new Error(`Failed to fetch apply info: ${res.status}`);
  return res.json();
}

// ── Sparring ──

export interface SparChallenge {
  id: string;
  title: string;
  prompt: string;
  domain: string;
  subdomain: string;
  difficulty: string;
  timeLimit?: number;
  rubric: { criterion: string; weight: number; description: string }[];
}

export interface SparResult {
  session: {
    id: string;
    challenger: string;
    opponent: string;
    domain: string;
    challenge: SparChallenge;
    status: string;
  };
  payment?: { payer: string; txHash?: string };
}

export async function fetchSparInfo(): Promise<{
  pricing: { amount: string; description: string };
  availableDomains: string[];
}> {
  const res = await fetch(`${API_BASE}/api/spar`);
  if (!res.ok) throw new Error(`Failed to fetch spar info: ${res.status}`);
  return res.json();
}

export async function requestSpar(params: {
  challenger: string;
  opponent?: string;
  domain: string;
  paymentHeader?: string;
}): Promise<SparResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (params.paymentHeader) headers['X-PAYMENT'] = params.paymentHeader;

  const res = await fetch(`${API_BASE}/api/spar`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      challenger: params.challenger,
      opponent: params.opponent,
      domain: params.domain,
    }),
  });

  if (res.status === 402) {
    const data = await res.json();
    throw Object.assign(new Error('Payment required'), { paymentRequired: data.paymentRequired });
  }

  if (!res.ok) throw new Error(`Spar request failed: ${res.status}`);
  return res.json();
}

// ── Grading ──

export interface GradeResult {
  sparId: string;
  domain: string;
  scores: { criterion: string; score: number; reasoning: string }[];
  avgScore: number;
  xpEarned: number;
  belt: string;
  gradingMethod: string;
  feedback: string;
  gradedAt: string;
}

export async function submitSparResponse(params: {
  sparId: string;
  domain: string;
  challengePrompt: string;
  response: string;
  rubric: { criterion: string; weight: number; description: string }[];
}): Promise<GradeResult> {
  const res = await fetch(`${API_BASE}/api/spar/grade`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!res.ok) throw new Error(`Grading failed: ${res.status}`);
  return res.json();
}

// ── Domain display helpers ──

export const DOMAIN_META: Record<string, { label: string; emoji: string; color: string }> = {
  'coding.typescript': { label: 'TypeScript', emoji: '💻', color: '#3178c6' },
  'coding.react': { label: 'React', emoji: '⚛️', color: '#61dafb' },
  'coding.solana': { label: 'Solana', emoji: '◎', color: '#9945ff' },
  'writing.marketing': { label: 'Marketing', emoji: '✍️', color: '#ff6b6b' },
  'analysis.market': { label: 'Market Analysis', emoji: '📊', color: '#ffd93d' },
};

export function domainLabel(domain: string): string {
  return DOMAIN_META[domain]?.label || domain;
}

export function domainEmoji(domain: string): string {
  return DOMAIN_META[domain]?.emoji || '🎯';
}

export function domainColor(domain: string): string {
  return DOMAIN_META[domain]?.color || '#888888';
}

export const BELT_EMOJI: Record<string, string> = {
  white: '⬜',
  yellow: '🟨',
  green: '🟩',
  blue: '🟦',
  purple: '🟪',
  brown: '🟫',
  black: '⬛',
};

export const BELT_COLORS: Record<string, string> = {
  white: '#e0e0e0',
  yellow: '#ffd700',
  green: '#00c853',
  blue: '#2979ff',
  purple: '#aa00ff',
  brown: '#795548',
  black: '#212121',
};
