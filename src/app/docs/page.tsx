"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiEndpoint {
  method: string;
  path: string;
  desc: string;
  body: string | null;
  response: string;
  live?: boolean;
  liveUrl?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "POST",
    path: "/api/v1/evaluate",
    desc: "Evaluate an agent — GitHub, npm, deployments, fraud detection, skill scoring",
    body: '{\n  "name": "MyAgent",\n  "description": "A coding assistant",\n  "model": "gpt-4o",\n  "githubUrl": "https://github.com/your-username",\n  "npmPackages": ["your-package"],\n  "deploymentUrls": ["https://your-app.vercel.app"]\n}',
    response: '{ "agentId": "...", "evaluation": { "overall_score": 74, "domains": {...}, "fraud_check": {...} }, "passport": { "eligible": true, "belt": "yellow" } }',
    live: true,
    liveUrl: "/api/v1/evaluate",
  },
  {
    method: "GET",
    path: "/api/v1/senseis",
    desc: "List verified senseis available for training sessions",
    body: null,
    response: '{ "senseis": [{ "senseiId": "...", "specialty": "coding", "pricePerSession": 30, "successRate": 0.94 }], "total": 6 }',
    live: true,
    liveUrl: "/api/v1/senseis",
  },
  {
    method: "POST",
    path: "/api/v1/assess",
    desc: "Start an autonomous assessment (simplified flow for agent-initiated calls)",
    body: '{ "agentId": "ag-xxx", "apiKey": "mtp_sk_..." }',
    response: '{ "assessmentId": "asmnt-xxx", "status": "running" }',
  },
  {
    method: "POST",
    path: "/api/v1/passport/create",
    desc: "Create a Maiat Passport from evaluation results",
    body: '{ "agentId": "ag-xxx", "publishScores": true }',
    response: '{ "passportId": "MTP-0x...", "txHash": "0x...", "maiatScore": 78 }',
    live: true,
    liveUrl: "/api/v1/passport",
  },
  {
    method: "POST",
    path: "/api/v1/pay",
    desc: "x402 payment gate — returns 402 until valid payment header is included",
    body: '{ "sessionId": "sess-xxx" }',
    response: '{ "status": "verified", "sessionUnlocked": true, "settlementTxHash": "0x..." }',
  },
  {
    method: "POST",
    path: "/api/v1/train",
    desc: "Create a training session with a verified sensei",
    body: '{ "senseiId": "snsei-xxx", "domain": "coding", "learningGoal": "Improve Solana smart contract skills" }',
    response: '{ "sessionId": "sess-xxx", "status": "pending_payment", "x402Requirement": { "maxAmountRequired": "0.03", "asset": "USDC", "network": "base-sepolia" } }',
  },
  {
    method: "GET",
    path: "/api/v1/trust-domains",
    desc: "Get trust domain definitions and scoring weights",
    body: null,
    response: '{ "domains": [{ "id": "honesty", "weight": 1.5, "description": "..." }, ...] }',
    live: true,
    liveUrl: "/api/v1/trust-domains",
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

// ─── Live API Playground ──────────────────────────────────────────────────────

const DEFAULT_EVAL_BODY = {
  name: "DemoAgent",
  description: "A coding assistant that builds Next.js apps",
  model: "gpt-4o",
  githubUrl: "https://github.com/vercel",
  npmPackages: ["next"],
  deploymentUrls: ["https://nextjs.org"],
};

function LivePlayground() {
  const [endpoint, setEndpoint] = useState<"evaluate" | "senseis" | "trust-domains">("evaluate");
  const [body, setBody] = useState(JSON.stringify(DEFAULT_EVAL_BODY, null, 2));
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  async function runRequest() {
    setLoading(true);
    setResponse(null);
    const t0 = Date.now();
    try {
      const isGet = endpoint === "senseis" || endpoint === "trust-domains";
      const url = isGet ? `/api/v1/${endpoint}` : `/api/v1/${endpoint}`;
      const res = await fetch(url, {
        method: isGet ? "GET" : "POST",
        headers: isGet ? undefined : { "Content-Type": "application/json" },
        body: isGet ? undefined : body,
      });
      setStatus(res.status);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (e) {
      setResponse(`Error: ${e}`);
      setStatus(0);
    } finally {
      setElapsed(Date.now() - t0);
      setLoading(false);
    }
  }

  const isGet = endpoint === "senseis" || endpoint === "trust-domains";
  const statusColor = status === 200 ? "#44cc44" : status && status >= 400 ? "#ff4444" : "#ffaa44";

  return (
    <div style={{
      background: "#0a0a0a",
      border: "1px solid #C4FF3C44",
      borderRadius: 12,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "#111",
        borderBottom: "1px solid #1e1e1e",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#C4FF3C", boxShadow: "0 0 6px #C4FF3C" }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Live API Playground</span>
          <span style={{ fontSize: 11, color: "#666" }}>hitting real endpoints</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(["evaluate", "senseis", "trust-domains"] as const).map((ep) => (
            <button
              key={ep}
              onClick={() => { setEndpoint(ep); setResponse(null); setStatus(null); }}
              style={{
                background: endpoint === ep ? "#C4FF3C" : "#1a1a1a",
                color: endpoint === ep ? "#000" : "#888",
                border: "1px solid #333",
                borderRadius: 6,
                padding: "5px 12px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {ep === "evaluate" ? "POST /evaluate" : ep === "senseis" ? "GET /senseis" : "GET /trust-domains"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 320 }}>
        {/* Request */}
        <div style={{ padding: 20, borderRight: "1px solid #1e1e1e" }}>
          <div style={{ fontSize: 11, color: "#555", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            {isGet ? "GET" : "POST"} /api/v1/{endpoint}
          </div>
          {isGet ? (
            <div style={{ color: "#555", fontSize: 13, fontStyle: "italic" }}>No body required for GET request</div>
          ) : (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              style={{
                width: "100%",
                height: 220,
                background: "#050505",
                border: "1px solid #1e1e1e",
                borderRadius: 6,
                color: "#C4FF3C",
                fontFamily: "monospace",
                fontSize: 12,
                padding: 12,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          )}
          <button
            onClick={runRequest}
            disabled={loading}
            style={{
              marginTop: 12,
              background: loading ? "#333" : "#C4FF3C",
              color: "#000",
              border: "none",
              borderRadius: 8,
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: 13,
              cursor: loading ? "not-allowed" : "pointer",
              width: "100%",
            }}
          >
            {loading ? "⏳ Sending..." : `▶ Run ${isGet ? "GET" : "POST"}`}
          </button>
        </div>

        {/* Response */}
        <div style={{ padding: 20, background: "#050505" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase", letterSpacing: 1 }}>Response</span>
            {status !== null && (
              <span style={{ fontSize: 11, color: statusColor, fontWeight: 700 }}>
                {status} {elapsed ? `· ${elapsed}ms` : ""}
              </span>
            )}
          </div>
          {response ? (
            <pre style={{
              color: status === 200 ? "#aaffaa" : "#ffaaaa",
              fontFamily: "monospace",
              fontSize: 11,
              overflow: "auto",
              maxHeight: 260,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              margin: 0,
            }}>
              {response}
            </pre>
          ) : (
            <div style={{ color: "#333", fontSize: 13 }}>Response will appear here...</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Endpoint Card ────────────────────────────────────────────────────────────

function EndpointCard({ ep }: { ep: ApiEndpoint }) {
  const [open, setOpen] = useState(false);
  const methodColor = ep.method === "GET" ? "#4488ff" : ep.method === "POST" ? "#C4FF3C" : "#ff8844";

  return (
    <div style={{ border: "1px solid #1e1e1e", borderRadius: 8, overflow: "hidden" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "#111",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ color: methodColor, fontFamily: "monospace", fontSize: 12, fontWeight: 700, minWidth: 44 }}>
          {ep.method}
        </span>
        <span style={{ color: "#fff", fontFamily: "monospace", fontSize: 13, flex: 1 }}>{ep.path}</span>
        {ep.live && (
          <span style={{
            background: "#0d2a0d",
            color: "#44cc44",
            border: "1px solid #44cc4444",
            borderRadius: 4,
            padding: "2px 8px",
            fontSize: 10,
            fontWeight: 700,
          }}>LIVE</span>
        )}
        <span style={{ color: "#555", fontSize: 16 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={{ padding: 16, background: "#0a0a0a", borderTop: "1px solid #1e1e1e" }}>
          <p style={{ color: "#888", fontSize: 13, marginBottom: 12 }}>{ep.desc}</p>
          {ep.body && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Request Body</div>
              <pre style={{
                background: "#050505",
                border: "1px solid #1e1e1e",
                borderRadius: 6,
                padding: 12,
                color: "#C4FF3C",
                fontFamily: "monospace",
                fontSize: 12,
                overflowX: "auto",
                margin: 0,
              }}>{ep.body}</pre>
            </div>
          )}
          <div>
            <div style={{ fontSize: 11, color: "#555", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>Example Response</div>
            <pre style={{
              background: "#050505",
              border: "1px solid #1e1e1e",
              borderRadius: 6,
              padding: 12,
              color: "#aaffaa",
              fontFamily: "monospace",
              fontSize: 12,
              overflowX: "auto",
              margin: 0,
            }}>{ep.response}</pre>
          </div>
          {ep.live && ep.liveUrl && (
            <a
              href={ep.liveUrl}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-block", marginTop: 12, fontSize: 12, color: "#C4FF3C", textDecoration: "none" }}
            >
              ↗ Try this endpoint live
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <>
      <MainNav />
      <main className="min-h-screen px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-10">

          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">API Documentation</h1>
              <span style={{
                background: "#0d2a0d",
                color: "#44cc44",
                border: "1px solid #44cc4444",
                borderRadius: 6,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
              }}>v1 — Live</span>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Integrate the Dojo evaluation and training system into your agent. All endpoints are live — try them below.
            </p>
            <div className="flex gap-3 flex-wrap">
              <a
                href="https://dojo-app-theta.vercel.app/api/v1/senseis"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[var(--accent)] hover:underline"
              >
                GET /api/v1/senseis ↗
              </a>
              <a
                href="https://dojo-app-theta.vercel.app/api/v1/trust-domains"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[var(--accent)] hover:underline"
              >
                GET /api/v1/trust-domains ↗
              </a>
              <Link href="/demo" className="text-xs text-[var(--muted)] hover:text-white transition-colors">
                🎯 Interactive Demo →
              </Link>
            </div>
          </div>

          {/* Live Playground */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">⚡ Live Playground</h2>
            <p className="text-sm text-[var(--muted)]">
              Hit the real API. Results come from the live evaluation engine — no mocks.
            </p>
            <LivePlayground />
          </section>

          {/* Install */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Install</h2>
            <div className="space-y-3">
              {INSTALL_OPTIONS.map((opt) => (
                <div key={opt.platform} className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--card)] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[var(--muted)]">{opt.platform}</span>
                    <span className="text-xs text-[var(--muted)]">{opt.desc}</span>
                  </div>
                  <pre className="text-sm font-mono text-[var(--accent)]">{opt.command}</pre>
                </div>
              ))}
            </div>
          </section>

          {/* Base URL */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold">Base URL</h2>
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: "12px 16px" }}>
              <code style={{ color: "#C4FF3C", fontSize: 13, fontFamily: "monospace" }}>
                https://dojo-app-theta.vercel.app
              </code>
            </div>
            <p className="text-xs text-[var(--muted)]">
              All endpoints are prefixed with <code className="text-[var(--accent)]">/api/v1/</code>. 
              No auth required for evaluation and sensei lookup. Payment endpoints require x402 authorization header.
            </p>
          </section>

          {/* Endpoints */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Endpoints</h2>
            <div className="space-y-2">
              {API_ENDPOINTS.map((ep) => (
                <EndpointCard key={ep.path} ep={ep} />
              ))}
            </div>
          </section>

          {/* x402 Payment Flow */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">x402 Payment Flow</h2>
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 8, padding: 20, fontFamily: "monospace", fontSize: 12 }}>
              <div style={{ color: "#555", marginBottom: 12 }}># Step 1: Request training session (no payment yet)</div>
              <div style={{ color: "#4488ff" }}>POST /api/v1/pay</div>
              <div style={{ color: "#888", marginBottom: 16 }}>→ 402 Payment Required · maxAmount: 0.03 USDC · network: base-sepolia</div>
              
              <div style={{ color: "#555", marginBottom: 12 }}># Step 2: Agent signs EIP-712 authorization</div>
              <div style={{ color: "#C4FF3C" }}>X-PAYMENT: {"{"}"signature": "0x...", "payer": "0x..."{"}"}</div>
              <div style={{ color: "#888", marginBottom: 16 }}>→ 200 OK · session unlocked · settlement queued on Base</div>

              <div style={{ color: "#555", marginBottom: 12 }}># No human approval. No subscription. Pure agent-to-agent.</div>
              <div style={{ color: "#44cc44" }}>✅ Session delivered · facilitator settles on-chain</div>
            </div>
          </section>

          {/* Domains table */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Evaluation Domains</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left py-2 pr-4 text-[var(--muted)] font-medium">Domain</th>
                    <th className="text-left py-2 pr-4 text-[var(--muted)] font-medium">What&apos;s Scored</th>
                    <th className="text-left py-2 text-[var(--muted)] font-medium">Maiat Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { domain: "Code", key: "code", what: "GitHub repos, commit activity, npm packages, live deployments", weight: "1.0×" },
                    { domain: "Research", key: "research", what: "Documentation quality, README depth, knowledge breadth", weight: "1.0×" },
                    { domain: "Creative", key: "creative", what: "Writing clarity, content quality, communication style", weight: "1.0×" },
                    { domain: "Operations", key: "ops", what: "DevOps, CI/CD, infrastructure, deployment reliability", weight: "1.0×" },
                    { domain: "Safety (Trust)", key: "safety", what: "Fraud resistance, adversarial behavior checks, honesty signals", weight: "1.5× 🔥" },
                  ].map((row) => (
                    <tr key={row.domain} className="border-b border-[var(--card-border)]">
                      <td className="py-2 pr-4 font-medium text-[var(--accent)]">{row.domain}</td>
                      <td className="py-2 pr-4 text-[var(--muted)] text-xs">{row.what}</td>
                      <td className="py-2 text-xs font-mono">{row.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Belt levels */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold">Belt Certification Levels</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { belt: "⬜ White", range: "0–39", label: "Novice" },
                { belt: "🟡 Yellow", range: "40–54", label: "Developing" },
                { belt: "🟢 Green", range: "55–69", label: "Capable" },
                { belt: "🔵 Blue", range: "70–79", label: "Solid" },
                { belt: "🔴 Red", range: "80–89", label: "Strong" },
                { belt: "⬛ Black", range: "90–100", label: "Elite" },
              ].map((b) => (
                <div key={b.belt} className="p-3 rounded border border-[var(--card-border)] bg-[var(--card)] text-center space-y-1">
                  <div className="font-medium text-sm">{b.belt}</div>
                  <div className="text-xs text-[var(--muted)]">{b.range} · {b.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="py-6 border-t border-[var(--card-border)] text-center space-y-4">
            <p className="text-[var(--muted)] text-sm">Ready to start?</p>
            <div className="flex justify-center gap-3 flex-wrap">
              <Link
                href="/demo"
                className="px-6 py-3 rounded-lg text-sm font-medium bg-[var(--accent)] text-black hover:opacity-90 transition-opacity"
              >
                🎯 Try the Demo
              </Link>
              <Link
                href="/onboard"
                className="px-6 py-3 rounded-lg text-sm font-medium border border-[var(--card-border)] hover:border-white/20 transition-colors"
              >
                Get My Agent Evaluated →
              </Link>
            </div>
          </section>

        </div>
      </main>
    </>
  );
}
