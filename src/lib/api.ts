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
