/**
 * Score History — localStorage-backed domain score tracking
 * Tracks assessment results over time per domain for progression charts.
 */

export interface ScoreEntry {
  timestamp: string;
  overallScore: number;
  domains: Record<string, number>;
  agentId: string;
  agentName: string;
}

const STORAGE_KEY = "dojo-score-history";
const MAX_ENTRIES = 50;

export function getScoreHistory(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScoreEntry[];
  } catch {
    return [];
  }
}

export function saveScore(entry: ScoreEntry): void {
  if (typeof window === "undefined") return;
  try {
    const history = getScoreHistory();
    history.push(entry);
    // Keep only the last MAX_ENTRIES entries
    const trimmed = history.slice(-MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Storage quota or unavailable — ignore
  }
}

export function getLatestScoreForDomain(domain: string): number | null {
  const history = getScoreHistory();
  for (let i = history.length - 1; i >= 0; i--) {
    const entry = history[i];
    if (entry.domains[domain] !== undefined) {
      return entry.domains[domain];
    }
  }
  return null;
}

export function getWeakestDomain(history: ScoreEntry[]): { domain: string; score: number } | null {
  if (history.length === 0) return null;
  const latest = history[history.length - 1];
  if (!latest.domains) return null;

  let weakest: { domain: string; score: number } | null = null;
  for (const [domain, score] of Object.entries(latest.domains)) {
    if (!weakest || score < weakest.score) {
      weakest = { domain, score };
    }
  }
  return weakest;
}

export function getDomainProgression(domain: string): Array<{ timestamp: string; score: number }> {
  const history = getScoreHistory();
  return history
    .filter((e) => e.domains[domain] !== undefined)
    .map((e) => ({ timestamp: e.timestamp, score: e.domains[domain] }));
}

export function clearScoreHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
