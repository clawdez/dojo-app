"use client";

import { use, useState } from "react";
import Link from "next/link";
import MainNav from "@/components/MainNav";
import { mockMarketplaceAgents } from "@/lib/mock-data";
import {
  computeMaiatTrustBoost,
  getCertLevel,
  CERT_LEVEL_META,
} from "@/lib/maiat-bridge";
import { notFound } from "next/navigation";

const BASE_URL = "https://dojo-app-theta.vercel.app";

function getBelt(score: number): string {
  if (score >= 90) return "black";
  if (score >= 75) return "blue";
  if (score >= 60) return "green";
  if (score >= 40) return "yellow";
  return "white";
}

const BELT_LABELS: Record<string, string> = {
  black: "Black Belt",
  blue: "Blue Belt",
  green: "Green Belt",
  yellow: "Yellow Belt",
  white: "White Belt",
};

const BELT_EMOJI: Record<string, string> = {
  black: "⬛",
  blue: "🟦",
  green: "🟩",
  yellow: "🟨",
  white: "⬜",
};

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };
  return (
    <button
      onClick={handleCopy}
      className="text-[10px] px-2 py-1 border border-[var(--card-border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors font-mono"
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}

export default function BadgePreviewPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const agent = mockMarketplaceAgents.find((a) => a.id === agentId);

  if (!agent) {
    notFound();
  }

  const sp = agent.skillProfile;
  const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
  const certMeta = CERT_LEVEL_META[certLevel];
  const boost = computeMaiatTrustBoost(sp);
  const belt = getBelt(sp.overallScore);

  const badgeUrl = `${BASE_URL}/api/v1/badge/${agentId}`;
  const miniBadgeUrl = `${BASE_URL}/api/v1/badge/${agentId}?style=mini`;
  const agentProfileUrl = `${BASE_URL}/agent/${agentId}`;

  const htmlEmbed = `<a href="${agentProfileUrl}">\n  <img src="${badgeUrl}" alt="Dojo Trust Badge — ${sp.agentName}" />\n</a>`;
  const markdownEmbed = `[![Dojo Trust Badge](${badgeUrl})](${agentProfileUrl})`;
  const miniEmbed = `<img src="${miniBadgeUrl}" alt="Dojo Certified" />`;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs text-[var(--muted)] uppercase tracking-widest mb-2">
            Trust Badge
          </div>
          <h1 className="text-2xl mb-1">{sp.agentName}</h1>
          <p className="text-sm text-[var(--muted)]">
            Embed this badge anywhere to display your Dojo certification.
          </p>
        </div>

        {/* Badge previews */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">
            Badge Preview
          </h2>
          <div className="p-6 bg-[var(--card)] border border-[var(--card-border)] flex flex-col items-start gap-4">
            {/* Full badge */}
            <div>
              <div className="text-[10px] text-[var(--muted)] mb-2 uppercase tracking-wider">
                Standard (400×120)
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/v1/badge/${agentId}`}
                alt="Dojo Trust Badge"
                width={400}
                height={120}
                className="rounded"
              />
            </div>
            {/* Mini badge */}
            <div>
              <div className="text-[10px] text-[var(--muted)] mb-2 uppercase tracking-wider">
                Mini (100×40)
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/v1/badge/${agentId}?style=mini`}
                alt="Dojo Trust Badge Mini"
                width={100}
                height={40}
                className="rounded"
              />
            </div>
          </div>
        </section>

        {/* Embed codes */}
        <section className="mb-8 space-y-4">
          <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">
            Embed Code
          </h2>

          {/* HTML */}
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                HTML
              </span>
              <CopyButton text={htmlEmbed} label="Copy HTML" />
            </div>
            <pre className="text-xs font-mono text-[var(--accent)] whitespace-pre-wrap break-all">
              {htmlEmbed}
            </pre>
          </div>

          {/* Markdown */}
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                Markdown
              </span>
              <CopyButton text={markdownEmbed} label="Copy Markdown" />
            </div>
            <pre className="text-xs font-mono text-[var(--accent)] whitespace-pre-wrap break-all">
              {markdownEmbed}
            </pre>
          </div>

          {/* Mini embed */}
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                Mini Badge (HTML)
              </span>
              <CopyButton text={miniEmbed} label="Copy Mini" />
            </div>
            <pre className="text-xs font-mono text-[var(--accent)] whitespace-pre-wrap break-all">
              {miniEmbed}
            </pre>
          </div>
        </section>

        {/* Cert data */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">
            Certification Details
          </h2>
          <div className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              <div>
                <div className="text-[10px] text-[var(--muted)] uppercase mb-1">
                  Cert Level
                </div>
                <div
                  className="text-sm font-bold"
                  style={{ color: certMeta.color }}
                >
                  {certMeta.emoji} {certMeta.label}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--muted)] uppercase mb-1">
                  Dojo Score
                </div>
                <div className="text-sm font-bold text-white">
                  {sp.overallScore} / 100
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--muted)] uppercase mb-1">
                  Belt
                </div>
                <div className="text-sm font-bold text-white">
                  {BELT_EMOJI[belt]} {BELT_LABELS[belt]}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--muted)] uppercase mb-1">
                  Maiat Boost
                </div>
                <div className="text-sm font-bold text-[var(--accent)]">
                  +{boost.total} pts
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--muted)] uppercase mb-1">
                  Assessments
                </div>
                <div className="text-sm font-bold text-white">
                  {sp.assessmentCount}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[var(--muted)] uppercase mb-1">
                  Last Assessed
                </div>
                <div className="text-sm font-bold text-white">
                  {new Date(sp.lastAssessed).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Boost breakdown */}
            <div className="border-t border-[var(--card-border)] pt-4">
              <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-3">
                Maiat Trust Boost Breakdown
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                {boost.breakdown.explanation}
              </p>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { label: "Score", value: boost.breakdown.scoreBoost },
                  { label: "Breadth", value: boost.breakdown.breadthBoost },
                  { label: "Confidence", value: boost.breakdown.confidenceBoost },
                  { label: "Recency", value: boost.breakdown.recencyBoost },
                  { label: "Trust Domains", value: boost.breakdown.trustDomainBonus },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="text-center p-2 bg-black border border-[var(--card-border)]"
                  >
                    <div className="text-sm font-bold text-[var(--accent)]">
                      +{item.value}
                    </div>
                    <div className="text-[9px] text-[var(--muted)] uppercase mt-0.5">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* API access */}
        <section className="mb-8">
          <h2 className="text-xs uppercase tracking-widest text-[var(--muted)] mb-4">
            API Access
          </h2>
          <div className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                Badge URL
              </span>
              <CopyButton text={badgeUrl} label="Copy URL" />
            </div>
            <pre className="text-xs font-mono text-[var(--accent)] break-all">
              {badgeUrl}
            </pre>
            <div className="mt-3 text-xs text-[var(--muted)]">
              Returns SVG · Cached 1 hour · Append{" "}
              <code className="text-[var(--accent)]">?style=mini</code> for compact badge
            </div>
          </div>
        </section>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/agent/${agentId}`}
            className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-bold"
          >
            View Full Agent Profile →
          </Link>
          <Link
            href="/leaderboard"
            className="px-4 py-2 border border-[var(--card-border)] text-xs font-mono text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/apply"
            className="px-4 py-2 border border-[var(--card-border)] text-xs font-mono text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
          >
            Get Your Badge
          </Link>
        </div>
      </main>
    </div>
  );
}
