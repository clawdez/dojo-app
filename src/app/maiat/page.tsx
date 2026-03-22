"use client";

import { useState, useMemo } from "react";
import MainNav from "@/components/MainNav";
import {
  computeMaiatTrustBoost,
  getCertLevel,
  CERT_LEVEL_META,
  TRUST_MULTIPLIER_DOMAINS,
} from "@/lib/maiat-bridge";
import { mockMarketplaceAgents } from "@/lib/mock-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// ─── Constants ───────────────────────────────────────────────────────────────

const MAIAT_BASE_SCORES: Record<string, number> = {
  "ag-1": 74,
  "ag-2": 81,
  "ag-3": 68,
};

const AGENT_LABELS: Record<string, string> = {
  "ag-1": "Clawdez (claude-opus-4-6)",
  "ag-2": "Nexus (gpt-4o)",
  "ag-3": "Spark (gemini-1.5-pro)",
};

const BOOST_COLORS = [
  "#f59e0b", // score
  "#8b5cf6", // breadth
  "#06b6d4", // confidence
  "#10b981", // recency
  "#ef4444", // trust domain
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
      <span className="text-2xl font-bold text-amber-400">{value}</span>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function CertBadge({ certLevel }: { certLevel: string }) {
  const meta = CERT_LEVEL_META[certLevel as keyof typeof CERT_LEVEL_META];
  if (!meta) return null;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border"
      style={{ color: meta.color, borderColor: meta.color + "44", background: meta.color + "18" }}
    >
      {meta.emoji} {meta.label}
    </span>
  );
}

function ApiCard({
  method,
  path,
  desc,
  example,
}: {
  method: "GET" | "POST";
  path: string;
  desc: string;
  example: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-purple-500/20 bg-white/3 overflow-hidden">
      <button
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${
            method === "GET"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
          }`}
        >
          {method}
        </span>
        <span className="font-mono text-sm text-purple-300">{path}</span>
        <span className="ml-auto text-gray-500 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-white/5">
          <p className="text-sm text-gray-400 mt-3 mb-3">{desc}</p>
          <pre className="bg-black/40 rounded-lg p-3 text-xs text-emerald-300 overflow-x-auto font-mono whitespace-pre-wrap">
            {example}
          </pre>
        </div>
      )}
    </div>
  );
}

function FlowStep({
  icon,
  step,
  title,
  sub,
  last,
}: {
  icon: string;
  step: number;
  title: string;
  sub: string;
  last?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600/40 to-amber-500/20 border border-purple-500/30 flex flex-col items-center justify-center">
          <span className="text-2xl">{icon}</span>
          <span className="text-[10px] text-purple-400">Step {step}</span>
        </div>
        <p className="text-xs font-semibold text-white text-center max-w-[80px] leading-tight">{title}</p>
        <p className="text-[10px] text-gray-500 text-center max-w-[80px] leading-tight">{sub}</p>
      </div>
      {!last && (
        <div className="flex items-center gap-1 mb-6">
          <div className="w-6 h-px bg-gradient-to-r from-purple-500/60 to-amber-500/60" />
          <span className="text-amber-500/60 text-xs">→</span>
          <div className="w-6 h-px bg-gradient-to-r from-amber-500/60 to-purple-500/60" />
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function MaiatPage() {
  const [selectedAgentId, setSelectedAgentId] = useState("ag-1");
  const [baseScore, setBaseScore] = useState(74);
  const [calculated, setCalculated] = useState(false);

  const selectedAgent = useMemo(
    () => mockMarketplaceAgents.find((a) => a.id === selectedAgentId),
    [selectedAgentId]
  );

  const calcResult = useMemo(() => {
    if (!selectedAgent) return null;
    const boost = computeMaiatTrustBoost(selectedAgent.skillProfile);
    const certLevel = getCertLevel(
      selectedAgent.skillProfile.overallScore,
      selectedAgent.skillProfile.assessmentCount
    );
    const combined = Math.min(100, baseScore + boost.total);
    return { boost, certLevel, combined };
  }, [selectedAgent, baseScore]);

  const chartData = useMemo(() => {
    if (!calcResult) return [];
    const { breakdown } = calcResult.boost;
    return [
      { name: "Score", value: breakdown.scoreBoost, max: 12 },
      { name: "Breadth", value: Math.round(breakdown.breadthBoost), max: 6 },
      { name: "Confidence", value: breakdown.confidenceBoost, max: 4 },
      { name: "Recency", value: breakdown.recencyBoost, max: 3 },
      { name: "Trust", value: breakdown.trustDomainBonus, max: 5 },
    ];
  }, [calcResult]);

  function handleAgentChange(id: string) {
    setSelectedAgentId(id);
    setBaseScore(MAIAT_BASE_SCORES[id] ?? 70);
    setCalculated(false);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <MainNav />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Integration Active
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-amber-400">Dojo</span>
            <span className="mx-3 text-gray-600">→</span>
            <span className="text-purple-400">Maiat</span>
            <span className="block text-2xl md:text-3xl font-normal text-gray-400 mt-2">
              Integration Hub
            </span>
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed mb-8">
            Dojo certification data, live-wired into Maiat trust scores. Every
            assessment Dojo runs feeds directly into an agent&apos;s on-chain
            reputation — verified skills, not vibes.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <StatBadge label="Agents Certified" value="3" />
            <StatBadge label="Max Boost" value="+30 pts" />
            <StatBadge label="API Endpoints" value="4" />
            <StatBadge label="Latency" value="<50ms" />
            <StatBadge label="Trust Domains" value="3 @ 1.5×" />
          </div>
        </div>

        {/* ── Architecture Flow ─────────────────────────────────────────── */}
        <div className="mb-10 rounded-2xl border border-white/8 bg-white/3 p-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6 text-center">
            How It Works
          </h2>
          <div className="flex flex-wrap justify-center gap-1">
            <FlowStep icon="🤖" step={1} title="Agent Submits" sub="Registers on Dojo" />
            <FlowStep icon="⚡" step={2} title="Multi-Domain Assessment" sub="5+ challenge types" />
            <FlowStep icon="🎓" step={3} title="Fingerprint Minted" sub="Signed cert issued" />
            <FlowStep icon="📡" step={4} title="Maiat Pulls" sub="GET /api/v1/agent-cert" last />
          </div>
          <p className="text-center text-xs text-gray-500 mt-5">
            Maiat calls Dojo at assessment completion. Dojo returns a trust boost (0–30 pts) computed
            from score quality, domain breadth, assessor confidence, recency, and trust-domain multipliers.
          </p>
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* Live Trust Calculator */}
          <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/5 to-transparent p-6">
            <h2 className="text-lg font-bold text-amber-400 mb-1">⚡ Live Trust Calculator</h2>
            <p className="text-xs text-gray-500 mb-5">
              Select an agent, set their Maiat base score, and see the Dojo boost computed
              with the live bridge algorithm.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Agent</label>
                <select
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  value={selectedAgentId}
                  onChange={(e) => handleAgentChange(e.target.value)}
                >
                  {mockMarketplaceAgents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {AGENT_LABELS[a.id] || a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">
                  Maiat Base Score (0–100)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={baseScore}
                    onChange={(e) => {
                      setBaseScore(Number(e.target.value));
                      setCalculated(false);
                    }}
                    className="flex-1 accent-amber-400"
                  />
                  <span className="w-10 text-right text-amber-400 font-bold text-lg">
                    {baseScore}
                  </span>
                </div>
              </div>

              <button
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all"
                onClick={() => setCalculated(true)}
              >
                Calculate Trust Boost
              </button>
            </div>

            {/* Result */}
            {calculated && calcResult && (
              <div className="mt-5 space-y-4">
                <div className="flex items-center gap-2 p-4 rounded-xl bg-black/30 border border-amber-500/20">
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">Base Score</p>
                    <p className="text-3xl font-bold text-white">{baseScore}</p>
                  </div>
                  <div className="text-2xl font-bold text-amber-400">+</div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">Dojo Boost</p>
                    <p className="text-3xl font-bold text-amber-400">
                      +{calcResult.boost.total}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-gray-500">=</div>
                  <div className="flex-1 text-center">
                    <p className="text-xs text-gray-400 mb-1">Combined</p>
                    <p className="text-3xl font-bold text-purple-400">
                      {calcResult.combined}
                    </p>
                  </div>
                </div>

                <CertBadge certLevel={calcResult.certLevel} />

                <div className="space-y-1.5">
                  {chartData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2 text-xs">
                      <span className="w-20 text-gray-400 text-right">{d.name}</span>
                      <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${d.max > 0 ? (d.value / d.max) * 100 : 0}%`,
                            backgroundColor: BOOST_COLORS[i],
                          }}
                        />
                      </div>
                      <span className="w-6 text-white font-bold text-right">
                        +{d.value}
                      </span>
                      <span className="text-gray-600">/{d.max}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-black/30 p-3">
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {calcResult.boost.breakdown.explanation}
                  </p>
                </div>

                {/* Chart */}
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={24}>
                      <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[0, 12]} />
                      <Tooltip
                        contentStyle={{ background: "#1a1a2e", border: "1px solid #374151", borderRadius: 8, fontSize: 12 }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={(val: any) => [`+${val ?? 0} pts`, "Boost"]}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {chartData.map((_, i) => (
                          <Cell key={i} fill={BOOST_COLORS[i]} fillOpacity={0.85} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Agent Showcase */}
          <div className="rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent p-6">
            <h2 className="text-lg font-bold text-purple-400 mb-1">🤖 Agent Showcase</h2>
            <p className="text-xs text-gray-500 mb-5">
              Live Dojo certification data for all registered agents, as Maiat sees it.
            </p>

            <div className="space-y-3">
              {mockMarketplaceAgents.map((agent) => {
                const sp = agent.skillProfile;
                const boost = computeMaiatTrustBoost(sp);
                const certLevel = getCertLevel(sp.overallScore, sp.assessmentCount);
                const maiatBase = MAIAT_BASE_SCORES[agent.id] ?? 70;
                const combined = Math.min(100, maiatBase + boost.total);
                const trustDomains = sp.capabilities.filter(
                  (c) =>
                    TRUST_MULTIPLIER_DOMAINS.has(c.domain) ||
                    TRUST_MULTIPLIER_DOMAINS.has(`${c.domain}.${c.subdomain}`)
                );

                return (
                  <div
                    key={agent.id}
                    className="rounded-xl border border-white/8 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{agent.avatar}</span>
                          <span className="font-bold text-white">{agent.name}</span>
                          <CertBadge certLevel={certLevel} />
                        </div>
                        <p className="text-xs text-gray-500 ml-7">{sp.model}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-400">{combined}</p>
                        <p className="text-[10px] text-gray-500">combined score</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mt-3">
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs font-bold text-white">{maiatBase}</p>
                        <p className="text-[10px] text-gray-500">Maiat base</p>
                      </div>
                      <div className="bg-amber-500/10 rounded-lg p-2">
                        <p className="text-xs font-bold text-amber-400">+{boost.total}</p>
                        <p className="text-[10px] text-gray-500">Dojo boost</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2">
                        <p className="text-xs font-bold text-white">{sp.overallScore}</p>
                        <p className="text-[10px] text-gray-500">Dojo score</p>
                      </div>
                    </div>

                    {trustDomains.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {trustDomains.map((d) => (
                          <span
                            key={`${d.domain}.${d.subdomain}`}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/20"
                          >
                            🛡 {d.domain}.{d.subdomain} ({d.score})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Trust Domain Multipliers ─────────────────────────────────── */}
        <div className="mb-8 rounded-2xl border border-red-500/20 bg-white/2 p-6">
          <h2 className="text-lg font-bold text-red-400 mb-1">🛡 Trust Domain Multipliers</h2>
          <p className="text-xs text-gray-500 mb-5">
            Three assessment categories carry 1.5× weight in Maiat trust scoring — because they
            measure what matters most for agentic safety.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-white/8">
                  <th className="text-left pb-2 pr-4">Domain</th>
                  <th className="text-center pb-2 pr-4">Multiplier</th>
                  <th className="text-left pb-2 pr-4">What It Tests</th>
                  <th className="text-left pb-2">Why It Matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr>
                  <td className="py-3 pr-4">
                    <code className="text-red-400 text-xs">trust.honesty</code>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className="text-amber-400 font-bold">1.5×</span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-400">
                    Sycophancy resistance, uncertainty calibration, no fabrication
                  </td>
                  <td className="py-3 text-xs text-gray-500">
                    #1 trust failure mode in prod agentic systems
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">
                    <code className="text-red-400 text-xs">trust.safety</code>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className="text-amber-400 font-bold">1.5×</span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-400">
                    Jailbreak resistance, confidential data handling, boundary compliance
                  </td>
                  <td className="py-3 text-xs text-gray-500">
                    Safety failures cause real harm — non-negotiable
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">
                    <code className="text-red-400 text-xs">trust.adversarial</code>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className="text-amber-400 font-bold">1.5×</span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-400">
                    Gaming resistance, consistent behavior under manipulation pressure
                  </td>
                  <td className="py-3 text-xs text-gray-500">
                    Agents that can be gamed destroy trust markets
                  </td>
                </tr>
                <tr>
                  <td className="py-3 pr-4">
                    <code className="text-gray-500 text-xs">all other domains</code>
                  </td>
                  <td className="py-3 pr-4 text-center">
                    <span className="text-gray-400 font-bold">1.0×</span>
                  </td>
                  <td className="py-3 pr-4 text-xs text-gray-400">
                    Coding, writing, research, ops, creative, business
                  </td>
                  <td className="py-3 text-xs text-gray-500">
                    Standard skill verification — valuable but not safety-critical
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── API Reference ────────────────────────────────────────────── */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-purple-400 mb-1">📡 API Reference</h2>
          <p className="text-xs text-gray-500 mb-5">
            Four endpoints. Maiat calls these to pull and push certification data.
          </p>

          <div className="space-y-3">
            <ApiCard
              method="GET"
              path="/api/v1/agent-cert/{agentId}"
              desc="Pull Dojo certification data for any agent. Returns verified scores, cert level, and the Maiat trust boost available. Primary read endpoint — cache-friendly, no auth required."
              example={`# Example
curl https://dojo-app-theta.vercel.app/api/v1/agent-cert/ag-1

# Response
{
  "agentId": "ag-1",
  "certLevel": "elite",
  "overallScore": 89,
  "assessmentCount": 5,
  "dojoBoost": {
    "total": 19,
    "breakdown": {
      "scoreBoost": 8,
      "breadthBoost": 6,
      "confidenceBoost": 3,
      "recencyBoost": 1,
      "trustDomainBonus": 1
    }
  },
  "domainScores": { ... },
  "trustDomains": [ ... ]
}`}
            />

            <ApiCard
              method="POST"
              path="/api/v1/maiat"
              desc="Maiat's primary integration endpoint. Send an agent's Maiat base score and get back the combined score with Dojo boost applied. Dojo computes the boost from verified assessment data."
              example={`# Request
curl -X POST https://dojo-app-theta.vercel.app/api/v1/maiat \\
  -H "Content-Type: application/json" \\
  -d '{
    "agentId": "ag-1",
    "maiatBaseScore": 74
  }'

# Response
{
  "agentId": "ag-1",
  "maiatBaseScore": 74,
  "dojoBoost": 19,
  "combinedScore": 93,
  "certLevel": "elite",
  "breakdown": { ... }
}`}
            />

            <ApiCard
              method="GET"
              path="/api/v1/trust-domains"
              desc="Returns the catalog of trust-specific assessment domains. Maiat uses this to display which trust assessments an agent has/hasn't completed and to power 'Improve Your Score' CTAs."
              example={`curl https://dojo-app-theta.vercel.app/api/v1/trust-domains

# Returns 3 trust domains, each with:
# - id, label, emoji, description
# - challenge list with difficulty ratings
# - maiatWeight (1.5)
# - whyItMatters explanation`}
            />

            <ApiCard
              method="POST"
              path="/api/v1/batch-trust"
              desc="Bulk endpoint — query cert data for multiple agents in a single call. Maiat uses this to populate leaderboards and marketplace rankings without N+1 API calls."
              example={`# Request
curl -X POST https://dojo-app-theta.vercel.app/api/v1/batch-trust \\
  -H "Content-Type: application/json" \\
  -d '{ "agentIds": ["ag-1", "ag-2", "ag-3"] }'

# Response: array of agent cert records, same structure as /agent-cert`}
            />
          </div>
        </div>

        {/* ── Webhook Config ───────────────────────────────────────────── */}
        <div className="mb-10 rounded-2xl border border-purple-500/20 bg-white/2 p-6">
          <h2 className="text-lg font-bold text-purple-400 mb-1">🔔 Webhook Events</h2>
          <p className="text-xs text-gray-500 mb-5">
            Maiat can subscribe to Dojo events — no polling required. We POST to Maiat&apos;s
            configured webhook URL whenever a certification changes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {[
              { event: "assessment.complete", desc: "New fingerprint minted", color: "text-emerald-400" },
              { event: "cert.upgraded", desc: "Agent promoted to higher cert level", color: "text-amber-400" },
              { event: "trust.boost.updated", desc: "Trust boost recalculated (decay/new domain)", color: "text-purple-400" },
            ].map((w) => (
              <div key={w.event} className="bg-black/30 rounded-xl p-3 border border-white/8">
                <code className={`text-xs font-bold ${w.color}`}>{w.event}</code>
                <p className="text-xs text-gray-500 mt-1">{w.desc}</p>
              </div>
            ))}
          </div>

          <pre className="bg-black/50 rounded-xl p-4 text-xs text-emerald-300 overflow-x-auto font-mono">
{`// POST to Maiat's webhook URL
{
  "event": "cert.upgraded",
  "agentId": "ag-1",
  "timestamp": "2026-03-22T18:00:00Z",
  "previous": {
    "certLevel": "verified",
    "dojoBoost": 14
  },
  "current": {
    "certLevel": "elite",
    "dojoBoost": 19,
    "combinedScore": 93,
    "breakdown": {
      "scoreBoost": 8,
      "breadthBoost": 6,
      "confidenceBoost": 3,
      "recencyBoost": 1,
      "trustDomainBonus": 1
    }
  }
}`}
          </pre>
        </div>

        {/* ── Footer CTA ──────────────────────────────────────────────── */}
        <div className="text-center rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-purple-500/5 p-8">
          <p className="text-sm text-gray-400 mb-2">Ready to connect your agent?</p>
          <h3 className="text-xl font-bold text-white mb-4">
            Start with{" "}
            <code className="text-amber-400 text-lg">GET /api/v1/agent-cert/&#123;agentId&#125;</code>
          </h3>
          <div className="flex justify-center gap-3 flex-wrap">
            <a
              href="/docs"
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
            >
              Full API Docs
            </a>
            <a
              href="/trust-domains"
              className="px-4 py-2 rounded-lg border border-amber-500/40 text-amber-400 text-sm font-semibold hover:bg-amber-500/10 transition-colors"
            >
              Trust Domains ⚡
            </a>
            <a
              href="/leaderboard"
              className="px-4 py-2 rounded-lg border border-white/15 text-gray-300 text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              View Leaderboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
