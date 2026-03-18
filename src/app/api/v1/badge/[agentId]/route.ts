import { NextRequest, NextResponse } from 'next/server';
import { mockMarketplaceAgents } from '@/lib/mock-data';
import { computeMaiatTrustBoost, getCertLevel, CERT_LEVEL_META } from '@/lib/maiat-bridge';

function getBelt(score: number): string {
  if (score >= 90) return 'black';
  if (score >= 75) return 'blue';
  if (score >= 60) return 'green';
  if (score >= 40) return 'yellow';
  return 'white';
}

const BELT_COLORS: Record<string, string> = {
  black: '#ffffff',
  blue: '#4488ff',
  green: '#44ff88',
  yellow: '#FFD700',
  white: '#888888',
};

const BELT_LABELS: Record<string, string> = {
  black: 'Black Belt',
  blue: 'Blue Belt',
  green: 'Green Belt',
  yellow: 'Yellow Belt',
  white: 'White Belt',
};

const BELT_EMOJI: Record<string, string> = {
  black: '⬛',
  blue: '🟦',
  green: '🟩',
  yellow: '🟨',
  white: '⬜',
};

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + '…' : str;
}

function notFoundSVG(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
  <rect width="400" height="120" fill="#18181b" rx="6"/>
  <rect width="400" height="120" fill="none" stroke="#27272a" stroke-width="1" rx="6"/>
  <text x="200" y="52" font-family="monospace" font-size="11" fill="#C4FF3C" text-anchor="middle" font-weight="bold" letter-spacing="3">THE DOJO</text>
  <text x="200" y="76" font-family="monospace" font-size="13" fill="#666666" text-anchor="middle">Agent not found</text>
  <text x="200" y="97" font-family="monospace" font-size="10" fill="#444444" text-anchor="middle">No Dojo certification record</text>
</svg>`;
}

function miniBadgeSVG(
  certEmoji: string,
  certColor: string,
  certLabel: string,
  score: number,
): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="40" viewBox="0 0 100 40">
  <rect width="100" height="40" fill="#18181b" rx="4"/>
  <rect width="100" height="40" fill="none" stroke="#27272a" stroke-width="1" rx="4"/>
  <text x="14" y="15" font-family="monospace" font-size="8" fill="#C4FF3C" font-weight="bold" letter-spacing="2">DOJO</text>
  <text x="14" y="28" font-family="monospace" font-size="11" fill="${certColor}" font-weight="bold">${certEmoji} ${score}</text>
  <text x="14" y="38" font-family="monospace" font-size="7" fill="#555555">${certLabel}</text>
</svg>`;
}

function fullBadgeSVG(
  agentName: string,
  score: number,
  belt: string,
  beltColor: string,
  beltLabel: string,
  beltEmoji: string,
  certLevel: string,
  certColor: string,
  certLabel: string,
  certEmoji: string,
  dojoBoost: number,
): string {
  const name = truncate(agentName, 22);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="120" viewBox="0 0 400 120">
  <!-- Background -->
  <rect width="400" height="120" fill="#18181b" rx="6"/>
  <rect width="400" height="120" fill="none" stroke="#27272a" stroke-width="1" rx="6"/>

  <!-- Left accent bar -->
  <rect x="0" y="0" width="4" height="120" fill="${beltColor}" rx="3"/>

  <!-- THE DOJO label -->
  <text x="22" y="22" font-family="monospace" font-size="9" fill="#C4FF3C" font-weight="bold" letter-spacing="3">THE DOJO</text>

  <!-- Agent name -->
  <text x="22" y="45" font-family="monospace" font-size="15" fill="#ffffff" font-weight="bold">${escapeXml(name)}</text>

  <!-- Belt + belt label -->
  <text x="22" y="68" font-family="monospace" font-size="11" fill="${beltColor}">${beltEmoji} ${beltLabel}</text>

  <!-- Cert badge pill -->
  <rect x="22" y="80" width="115" height="22" fill="${certColor}22" rx="3"/>
  <rect x="22" y="80" width="115" height="22" fill="none" stroke="${certColor}66" stroke-width="1" rx="3"/>
  <text x="34" y="95" font-family="monospace" font-size="10" fill="${certColor}" font-weight="bold">${certEmoji} ${certLabel}</text>

  <!-- Divider -->
  <line x1="280" y1="20" x2="280" y2="100" stroke="#27272a" stroke-width="1"/>

  <!-- Score -->
  <text x="310" y="45" font-family="monospace" font-size="28" fill="${beltColor}" font-weight="bold" text-anchor="middle">${score}</text>
  <text x="310" y="60" font-family="monospace" font-size="9" fill="#555555" text-anchor="middle">/ 100</text>
  <text x="310" y="78" font-family="monospace" font-size="9" fill="#C4FF3C" text-anchor="middle">+${dojoBoost} → Maiat</text>
  <text x="310" y="95" font-family="monospace" font-size="8" fill="#444444" text-anchor="middle">Dojo Score</text>
</svg>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  const { agentId } = await params;
  const style = req.nextUrl.searchParams.get('style');

  const agent = mockMarketplaceAgents.find((a) => a.id === agentId);

  const headers = {
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  };

  if (!agent) {
    return new NextResponse(notFoundSVG(), { status: 404, headers });
  }

  const sp = agent.skillProfile;
  const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
  const certMeta = CERT_LEVEL_META[certLevel];
  const boost = computeMaiatTrustBoost(sp);
  const belt = getBelt(sp.overallScore);

  if (style === 'mini') {
    const svg = miniBadgeSVG(
      certMeta.emoji,
      certMeta.color,
      certMeta.label,
      sp.overallScore,
    );
    return new NextResponse(svg, { headers });
  }

  const svg = fullBadgeSVG(
    sp.agentName,
    sp.overallScore,
    belt,
    BELT_COLORS[belt] ?? '#888',
    BELT_LABELS[belt] ?? 'White Belt',
    BELT_EMOJI[belt] ?? '⬜',
    certLevel,
    certMeta.color,
    certMeta.label,
    certMeta.emoji,
    boost.total,
  );

  return new NextResponse(svg, { headers });
}
