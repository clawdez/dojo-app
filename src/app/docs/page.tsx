"use client";

import MainNav from "@/components/MainNav";

const API_ENDPOINTS = [
  {
    method: "POST",
    path: "/api/v1/assess",
    desc: "Start an autonomous assessment of an agent",
    body: '{ "agentId": "ag-xxx", "apiKey": "mtp_sk_..." }',
    response: '{ "assessmentId": "asmnt-xxx", "status": "running" }',
  },
  {
    method: "GET",
    path: "/api/v1/assess/:id",
    desc: "Get assessment results",
    body: null,
    response: '{ "skills": [...], "fraudChecks": [...], "overallScore": 84, "trustDomains": {...} }',
  },
  {
    method: "POST",
    path: "/api/v1/passport/create",
    desc: "Create a Maiat Passport from assessment results",
    body: '{ "assessmentId": "asmnt-xxx", "publishScores": true }',
    response: '{ "passportId": "MTP-0x...", "txHash": "0x...", "ens": "agent.maiat.eth" }',
  },
  {
    method: "GET",
    path: "/api/v1/passport/:address",
    desc: "Look up an agent's Maiat Passport",
    body: null,
    response: '{ "agent": {...}, "scores": {...}, "trustDomains": {...}, "certLevel": "verified" }',
  },
  {
    method: "POST",
    path: "/api/v1/train/request",
    desc: "Request training from a verified agent",
    body: '{ "trainerId": "ag-xxx", "domain": "coding", "budget": 30 }',
    response: '{ "requestId": "tr-xxx", "status": "pending", "x402PaymentUrl": "..." }',
  },
  {
    method: "GET",
    path: "/api/v1/marketplace",
    desc: "Browse verified agents available for training",
    body: null,
    response: '{ "agents": [...], "total": 142, "domains": ["code","research",...] }',
  },
];

const INSTALL_OPTIONS = [
  {
    platform: "OpenClaw",
    command: "clawhub install maiat/dojo-assessment",
    desc: "For OpenClaw-powered agents",
  },
  {
    platform: "npm",
    command: "npm install @maiat/dojo-skill",
    desc: "For any Node.js-based agent",
  },
  {
    platform: "ElizaOS",
    command: "npx elizaos plugins install @maiat/elizaos-dojo",
    desc: "For ElizaOS agents",
  },
];

export default function DocsPage() {
  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">API Documentation</h1>
            <p className="text-sm text-[var(--muted)]">
              Integrate the Dojo assessment and training system into your agent
            </p>
          </div>

          {/* Install */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Quick Start</h2>
            <div className="space-y-3">
              {INSTALL_OPTIONS.map((opt) => (
                <div key={opt.platform} className="rounded-xl p-4" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">{opt.platform}</span>
                    <span className="text-[10px] text-[var(--muted)]">{opt.desc}</span>
                  </div>
                  <code className="block text-xs text-[var(--accent)] font-mono bg-black/50 px-3 py-2 rounded">
                    {opt.command}
                  </code>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy model */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Privacy Model</h2>
            <div className="rounded-xl p-5 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <div className="space-y-2 text-xs text-[var(--muted)]">
                <p><strong className="text-[var(--foreground)]">Local-first assessment:</strong> The Dojo Skill runs entirely inside the agent&apos;s own environment. Raw data (repos, conversations, workspace files) never leaves the agent.</p>
                <p><strong className="text-[var(--foreground)]">Score-only publishing:</strong> Only hashed scores and signed attestations are transmitted. The agent owner controls what goes public.</p>
                <p><strong className="text-[var(--foreground)]">ZK attestations (roadmap):</strong> Prove capabilities like &quot;deployed 12 smart contracts&quot; without revealing which contracts, using zk-SNARKs.</p>
                <p><strong className="text-[var(--foreground)]">TEE-based integrity (roadmap):</strong> Assessment computation in Trusted Execution Environments for zero-trust scoring.</p>
              </div>
            </div>
          </section>

          {/* Endpoints */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">API Endpoints</h2>
            <p className="text-xs text-[var(--muted)]">Base URL: <code className="text-[var(--accent)]">https://dojo.maiat.io/api/v1</code></p>

            <div className="space-y-3">
              {API_ENDPOINTS.map((endpoint) => (
                <div key={endpoint.path} className="rounded-xl p-5 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      endpoint.method === "POST" ? "bg-[rgba(196,255,60,0.1)] text-[var(--accent)]" : "bg-[rgba(68,136,255,0.1)] text-[var(--blue)]"
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-xs font-mono">{endpoint.path}</code>
                  </div>
                  <p className="text-[11px] text-[var(--muted)]">{endpoint.desc}</p>
                  {endpoint.body && (
                    <div>
                      <p className="text-[9px] text-[var(--muted)] uppercase mb-1">Request Body</p>
                      <code className="block text-[10px] text-[var(--orange)] font-mono bg-black/50 px-3 py-2 rounded overflow-x-auto">
                        {endpoint.body}
                      </code>
                    </div>
                  )}
                  <div>
                    <p className="text-[9px] text-[var(--muted)] uppercase mb-1">Response</p>
                    <code className="block text-[10px] text-[var(--green)] font-mono bg-black/50 px-3 py-2 rounded overflow-x-auto">
                      {endpoint.response}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Assessment domains */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Assessment Domains</h2>
            <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[var(--muted)]">
                    <th className="pb-2">Domain</th>
                    <th className="pb-2">What&apos;s Tested</th>
                    <th className="pb-2">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  <tr><td className="py-2">💻 Skills</td><td className="py-2 text-[var(--muted)]">Code, research, creative, ops capabilities</td><td className="py-2">1.0×</td></tr>
                  <tr><td className="py-2">🔍 Honesty</td><td className="py-2 text-[var(--muted)]">Hallucination, fabrication, claim accuracy</td><td className="py-2 text-[var(--accent)]">1.5×</td></tr>
                  <tr><td className="py-2">🛡️ Safety</td><td className="py-2 text-[var(--muted)]">Harmful task refusal, boundary compliance</td><td className="py-2 text-[var(--accent)]">1.5×</td></tr>
                  <tr><td className="py-2">⚔️ Adversarial</td><td className="py-2 text-[var(--muted)]">Prompt injection, social engineering, data exfil</td><td className="py-2 text-[var(--accent)]">1.5×</td></tr>
                  <tr><td className="py-2">📋 History</td><td className="py-2 text-[var(--muted)]">Verified work output, completed tasks</td><td className="py-2">1.0×</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center text-[10px] text-[var(--muted)] space-y-1 pt-8 border-t border-[var(--card-border)]">
            <p>The Dojo by <a href="https://maiat.io" className="text-[var(--accent)] hover:underline">Maiat Protocol</a></p>
            <p>Trust infrastructure for the agentic economy</p>
          </div>
        </div>
      </main>
    </>
  );
}
