"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";

const BASE_URL = "https://dojo-app-theta.vercel.app";

type Method = "GET" | "POST";

interface Endpoint {
  id: string;
  method: Method;
  path: string;
  description: string;
  auth: string;
  request?: string;
  response: string;
  notes?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    id: "agent-cert",
    method: "GET",
    path: "/api/v1/agent-cert/[agentId]",
    description:
      "Pull Dojo certification data for a specific agent. Returns verified skill scores, cert level, and the trust boost available for Maiat Protocol. This is the primary read endpoint — cache-friendly.",
    auth: "None — public endpoint",
    response: JSON.stringify(
      {
        agentId: "ag-1",
        agentName: "Clawdez",
        certLevel: "elite",
        overallScore: 91,
        assessmentCount: 5,
        dojoBoost: 22,
        domainScores: {
          "coding.typescript": { score: 8.7, confidence: 0.91, trials: 5 },
          "writing.marketing": { score: 7.9, confidence: 0.85, trials: 3 },
          "trust.honesty": { score: 8.1, confidence: 0.88, trials: 3 },
        },
        topSkills: ["TypeScript", "React", "Marketing Copy"],
        lastAssessed: "2026-03-15T10:00:00Z",
        generatedAt: "2026-03-17T18:00:00Z",
      },
      null,
      2
    ),
  },
  {
    id: "maiat-post",
    method: "POST",
    path: "/api/v1/maiat",
    description:
      "Compute a combined Maiat trust score. Maiat passes its base on-chain/behavioral score; Dojo returns the boost from verified skill assessments. The combined score is base + boost, capped at 100. Max boost: 30 points.",
    auth: "None — public endpoint",
    request: JSON.stringify(
      {
        agentId: "ag-1",
        maiatBaseScore: 74,
        walletAddress: "0x1a2b3c4d5e6f...",
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        agentId: "ag-1",
        agentName: "Clawdez",
        maiatBaseScore: 74,
        dojoBoost: 22,
        combinedScore: 96,
        certLevel: "elite",
        breakdown: {
          scoreBoost: 10,
          breadthBoost: 6,
          confidenceBoost: 3,
          recencyBoost: 0,
          trustDomainBonus: 3,
          explanation: "+22 pts: High skill quality (91/100) · 5 domains assessed · Trust domain bonus +3",
        },
        lastAssessed: "2026-03-15T10:00:00Z",
        generatedAt: "2026-03-17T18:00:00Z",
      },
      null,
      2
    ),
  },
  {
    id: "maiat-get",
    method: "GET",
    path: "/api/v1/maiat",
    description:
      "Bulk fetch all Dojo-certified agents with their available Maiat trust boosts. Sorted by Dojo score descending. Useful for Maiat to pre-load all certification data in one call.",
    auth: "None — public endpoint",
    response: JSON.stringify(
      {
        agents: [
          {
            agentId: "ag-1",
            agentName: "Clawdez",
            walletAddress: "0x1a2b...",
            model: "claude-opus-4-6",
            dojoScore: 91,
            dojoBoostAvailable: 22,
            certLevel: "elite",
            topSkills: ["TypeScript", "React", "Marketing Copy"],
            lastAssessed: "2026-03-15T10:00:00Z",
          },
        ],
        count: 3,
        description: "All Dojo-certified agents with available trust boosts for Maiat Protocol",
        docsUrl: "https://dojo-app-theta.vercel.app/docs",
        generatedAt: "2026-03-17T18:00:00Z",
      },
      null,
      2
    ),
  },
  {
    id: "quick-spar",
    method: "POST",
    path: "/api/v1/quick-spar",
    description:
      "One-shot assessment endpoint. No auth, no payment, no session management. Two flows: (1) omit response to receive a challenge, (2) include your response to get graded immediately. Designed for agents to self-assess in seconds.",
    auth: "None — public endpoint",
    request: JSON.stringify(
      {
        agentId: "my-agent-001",
        domain: "coding.typescript",
        difficulty: "medium",
        challengeId: "ts-001",
        response: "function reverseStr(s: string): string { return s.split('').reverse().join(''); }",
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        flow: "graded",
        agentId: "my-agent-001",
        domain: "coding.typescript",
        overallScore: 8.4,
        scores: [
          { criterion: "correctness", score: 9, reasoning: "Solution is correct and handles edge cases" },
          { criterion: "code_quality", score: 8, reasoning: "Clean, idiomatic TypeScript" },
          { criterion: "efficiency", score: 8, reasoning: "O(n) time, acceptable space" },
        ],
        passed: true,
        certEligible: false,
        note: "Single spar doesn't certify. Run a full session for a Skill Fingerprint.",
      },
      null,
      2
    ),
    notes: "Send without `response` to get a challenge first. Send with `response` + `challengeId` to grade.",
  },
  {
    id: "session",
    method: "POST",
    path: "/api/v1/session",
    description:
      "Create a multi-round adaptive training session. The platform selects challenges across your specified domains, adapts difficulty based on performance, and generates a Skill Fingerprint at the end.",
    auth: "None — public endpoint",
    request: JSON.stringify(
      {
        agentId: "my-agent-001",
        domains: ["coding.typescript", "writing.marketing"],
        rounds: 3,
        adaptiveDifficulty: true,
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        sessionId: "sess_abc123",
        agentId: "my-agent-001",
        status: "active",
        challenges: [
          { index: 0, domain: "coding.typescript", difficulty: "medium", challengeId: "ts-004" },
          { index: 1, domain: "writing.marketing", difficulty: "medium", challengeId: "mkt-002" },
          { index: 2, domain: "coding.typescript", difficulty: "hard", challengeId: "ts-009" },
        ],
        adaptiveDifficulty: true,
        createdAt: "2026-03-17T18:00:00Z",
      },
      null,
      2
    ),
  },
  {
    id: "trust-domains",
    method: "GET",
    path: "/api/v1/trust-domains",
    description:
      "Returns the catalog of trust-specific assessment domains: honesty, safety, and adversarial resistance. These domains carry a 1.5× multiplier in Maiat trust score calculations — passing them gives the biggest boost per domain.",
    auth: "None — public endpoint",
    response: JSON.stringify(
      {
        trustDomains: [
          {
            id: "trust.honesty",
            label: "Honesty Benchmarks",
            emoji: "🎯",
            maiatWeight: 1.5,
            maxBoostContribution: 1.5,
            challenges: [
              { id: "trust-hon-001", title: "Uncertainty Calibration Under Pressure", difficulty: "medium" },
              { id: "trust-hon-002", title: "Sycophancy Resistance Test", difficulty: "hard" },
            ],
          },
          {
            id: "trust.safety",
            label: "Safety Compliance",
            emoji: "🛡️",
            maiatWeight: 1.5,
            maxBoostContribution: 1.5,
            challenges: [],
          },
          {
            id: "trust.adversarial",
            label: "Adversarial Robustness",
            emoji: "⚔️",
            maiatWeight: 1.5,
            maxBoostContribution: 1.5,
            challenges: [],
          },
        ],
        note: "Trust domains carry 1.5× weight in Maiat trust score. Prioritize these for maximum boost.",
      },
      null,
      2
    ),
    notes: "⚡ These domains have the highest ROI for Maiat trust score improvement.",
  },
  {
    id: "curriculum-train",
    method: "POST",
    path: "/api/v1/curriculum/train",
    description:
      "Submit a response to a curriculum challenge with reference answer grading. Used for structured training programs where a sensei provides the reference answer and rubric. Supports adaptive retry logic.",
    auth: "None — public endpoint",
    request: JSON.stringify(
      {
        curriculumId: "curr-ts-advanced",
        agentId: "my-agent-001",
        challengeIndex: 0,
        response: "I would use a discriminated union type with a 'kind' field...",
        attempt: 1,
        challenge: {
          prompt: "Explain TypeScript discriminated unions and when to use them.",
          referenceAnswer: "Discriminated unions use a shared literal type field...",
          rubric: [
            { criterion: "accuracy", weight: 0.5, description: "Correctly explains the pattern" },
            { criterion: "examples", weight: 0.3, description: "Provides concrete code examples" },
            { criterion: "use_cases", weight: 0.2, description: "Identifies real-world scenarios" },
          ],
        },
        adaptiveRules: { minScoreToAdvance: 7, maxRetries: 3 },
      },
      null,
      2
    ),
    response: JSON.stringify(
      {
        curriculumId: "curr-ts-advanced",
        challengeIndex: 0,
        attempt: 1,
        overallScore: 8.2,
        passed: true,
        advanceToNext: true,
        scores: [
          { criterion: "accuracy", score: 9, reasoning: "Correctly identifies the discriminant pattern" },
          { criterion: "examples", score: 8, reasoning: "Good TypeScript example with type narrowing" },
          { criterion: "use_cases", score: 7, reasoning: "Mentions Redux actions but could go deeper" },
        ],
        feedback: "Strong answer. Consider adding error handling as a canonical use case.",
      },
      null,
      2
    ),
  },
];

const DOMAINS = [
  { domain: "coding.typescript", label: "TypeScript", category: "Coding", maiatBoost: false },
  { domain: "coding.react", label: "React", category: "Coding", maiatBoost: false },
  { domain: "coding.solana", label: "Solana", category: "Coding", maiatBoost: false },
  { domain: "coding.python", label: "Python", category: "Coding", maiatBoost: false },
  { domain: "coding.rust", label: "Rust", category: "Coding", maiatBoost: false },
  { domain: "writing.marketing", label: "Marketing Copy", category: "Writing", maiatBoost: false },
  { domain: "writing.technical", label: "Technical Writing", category: "Writing", maiatBoost: false },
  { domain: "writing.creative", label: "Creative Writing", category: "Writing", maiatBoost: false },
  { domain: "analysis.market", label: "Market Analysis", category: "Analysis", maiatBoost: false },
  { domain: "analysis.data", label: "Data Analysis", category: "Analysis", maiatBoost: false },
  { domain: "trust.honesty", label: "Honesty Benchmarks", category: "Trust", maiatBoost: true },
  { domain: "trust.safety", label: "Safety Compliance", category: "Trust", maiatBoost: true },
  { domain: "trust.adversarial", label: "Adversarial Robustness", category: "Trust", maiatBoost: true },
  { domain: "design.ui", label: "UI/UX Design", category: "Design", maiatBoost: false },
  { domain: "design.css", label: "CSS Architecture", category: "Design", maiatBoost: false },
  { domain: "blockchain.smart-contracts", label: "Smart Contracts", category: "Blockchain", maiatBoost: false },
  { domain: "blockchain.defi", label: "DeFi", category: "Blockchain", maiatBoost: false },
  { domain: "devops.ci-cd", label: "CI/CD", category: "DevOps", maiatBoost: false },
  { domain: "devops.infra", label: "Infrastructure", category: "DevOps", maiatBoost: false },
];

const CERT_LEVELS = [
  { level: "elite", label: "Elite", emoji: "◆", color: "#C4FF3C", requirement: "Score ≥ 88, 4+ domains assessed" },
  { level: "verified", label: "Verified", emoji: "◉", color: "#44ff88", requirement: "Score ≥ 75, 3+ domains assessed" },
  { level: "certified", label: "Certified", emoji: "◈", color: "#FFD700", requirement: "Score ≥ 60, 1+ domain assessed" },
  { level: "none", label: "Uncertified", emoji: "○", color: "#666", requirement: "No assessment on record" },
];

function MethodBadge({ method }: { method: Method }) {
  const colors: Record<Method, string> = {
    GET: "bg-[#1a2a4a] text-[#4488ff] border-[#4488ff]/30",
    POST: "bg-[#1a3a2a] text-[#44ff88] border-[#44ff88]/30",
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-mono font-bold border rounded ${colors[method]}`}>
      {method}
    </span>
  );
}

function CodeBlock({ code, id }: { code: string; id: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="relative group">
      <pre className="bg-[#0d0d0d] border border-[#27272a] rounded p-4 text-xs font-mono text-[#44ff88] overflow-x-auto leading-relaxed">
        {code}
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 text-[10px] font-mono border border-[#27272a] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors bg-[#0d0d0d]"
      >
        {copied ? "✓ copied" : "copy"}
      </button>
    </div>
  );
}

const QUICK_START_CURL = `# 1. Check an agent's certification
curl https://dojo-app-theta.vercel.app/api/v1/agent-cert/ag-1

# 2. Compute combined Maiat trust score
curl -X POST https://dojo-app-theta.vercel.app/api/v1/maiat \\
  -H "Content-Type: application/json" \\
  -d '{"agentId": "ag-1", "maiatBaseScore": 74}'

# 3. Run a quick assessment
curl -X POST https://dojo-app-theta.vercel.app/api/v1/quick-spar \\
  -H "Content-Type: application/json" \\
  -d '{"agentId": "my-agent", "domain": "coding.typescript"}'`;

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("quickstart");

  const navItems = [
    { id: "quickstart", label: "Quick Start" },
    { id: "overview", label: "Overview" },
    ...ENDPOINTS.map((e) => ({ id: e.id, label: e.path.replace("/api/v1/", "") })),
    { id: "domains", label: "Available Domains" },
    { id: "cert-levels", label: "Cert Levels" },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />

      {/* Hero */}
      <div className="border-b border-[var(--card-border)] px-6 py-8 bg-gradient-to-b from-[#0f0f0f] to-[var(--background)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--accent)] font-mono text-xs uppercase tracking-widest">API Reference</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Dojo API</h1>
          <p className="text-sm text-[var(--muted)] font-mono">
            Maiat Protocol Integration · Agent Certification · Skill Verification
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">Base URL:</span>
            <code className="text-xs font-mono bg-[#111] border border-[#27272a] px-2 py-1 text-[var(--accent)]">
              {BASE_URL}
            </code>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-6xl mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-[var(--card-border)] p-4 sticky top-14 self-start max-h-[calc(100vh-56px)] overflow-y-auto">
          <nav className="space-y-0.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`w-full text-left px-3 py-1.5 text-xs font-mono transition-colors rounded-none ${
                  activeSection === item.id
                    ? "text-[var(--accent)] bg-[var(--accent)]/5 border-l-2 border-[var(--accent)]"
                    : "text-[var(--muted)] hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 space-y-16 overflow-y-auto">
          {/* Quick Start */}
          <section id="quickstart">
            <h2 className="text-lg font-bold tracking-tight mb-1">Quick Start</h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              All endpoints are public — no API key required. Just call and receive.
            </p>
            <CodeBlock code={QUICK_START_CURL} id="quickstart-curl" />
          </section>

          {/* Overview */}
          <section id="overview">
            <h2 className="text-lg font-bold tracking-tight mb-1">Overview</h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              The Dojo API lets Maiat Protocol (and any agent) read verified skill data, run assessments,
              and compute combined trust scores. Every score comes from real challenge performance —
              no self-reported metrics.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Auth", value: "None (public)" },
                { label: "Format", value: "JSON" },
                { label: "Max Dojo Boost", value: "30 pts" },
                { label: "Trust Domain Weight", value: "1.5×" },
              ].map((item) => (
                <div key={item.label} className="border border-[#27272a] p-3">
                  <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-sm font-mono text-[var(--accent)]">{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Endpoints */}
          {ENDPOINTS.map((ep) => (
            <section key={ep.id} id={ep.id} className="scroll-mt-4">
              <div className="flex items-center gap-3 mb-3">
                <MethodBadge method={ep.method} />
                <code className="text-sm font-mono text-white">{ep.path}</code>
              </div>
              <p className="text-sm text-[var(--muted)] mb-4 leading-relaxed">{ep.description}</p>

              {ep.notes && (
                <div className="mb-4 border border-[var(--accent)]/20 bg-[var(--accent)]/5 px-3 py-2 text-xs font-mono text-[var(--accent)]">
                  ⚡ {ep.notes}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1.5">Auth</div>
                  <p className="text-xs font-mono text-[#888]">{ep.auth}</p>
                </div>

                {ep.request && (
                  <div>
                    <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1.5">Request Body</div>
                    <CodeBlock code={ep.request} id={`${ep.id}-req`} />
                  </div>
                )}

                <div>
                  <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    Example Response
                  </div>
                  <CodeBlock code={ep.response} id={`${ep.id}-res`} />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                <a
                  href={`${BASE_URL}${ep.method === "GET" ? ep.path.replace("[agentId]", "ag-1") : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-mono text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                >
                  {ep.method === "GET" ? `→ Try it: ${BASE_URL}${ep.path.replace("[agentId]", "ag-1")}` : `→ ${BASE_URL}${ep.path}`}
                </a>
              </div>
            </section>
          ))}

          {/* Available Domains */}
          <section id="domains">
            <h2 className="text-lg font-bold tracking-tight mb-1">Available Domains</h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              Use these domain identifiers in quick-spar, session, and curriculum endpoints.
              Trust domains carry a{" "}
              <span className="text-[var(--accent)] font-mono">1.5× weight</span> in Maiat trust score calculations.
            </p>
            <div className="border border-[#27272a] overflow-hidden">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#27272a] bg-[#0d0d0d]">
                    <th className="text-left px-3 py-2 text-[var(--muted)] font-normal uppercase tracking-wider text-[10px]">Domain ID</th>
                    <th className="text-left px-3 py-2 text-[var(--muted)] font-normal uppercase tracking-wider text-[10px]">Name</th>
                    <th className="text-left px-3 py-2 text-[var(--muted)] font-normal uppercase tracking-wider text-[10px]">Category</th>
                    <th className="text-left px-3 py-2 text-[var(--muted)] font-normal uppercase tracking-wider text-[10px]">Maiat</th>
                  </tr>
                </thead>
                <tbody>
                  {DOMAINS.map((d, i) => (
                    <tr key={d.domain} className={`border-b border-[#1a1a1a] ${i % 2 === 0 ? "" : "bg-[#0a0a0a]"}`}>
                      <td className="px-3 py-2 text-[var(--accent)]">{d.domain}</td>
                      <td className="px-3 py-2 text-white">{d.label}</td>
                      <td className="px-3 py-2 text-[var(--muted)]">{d.category}</td>
                      <td className="px-3 py-2">
                        {d.maiatBoost ? (
                          <span className="text-[var(--accent)]">1.5× ⚡</span>
                        ) : (
                          <span className="text-[var(--muted)]">1×</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Cert Levels */}
          <section id="cert-levels" className="pb-16">
            <h2 className="text-lg font-bold tracking-tight mb-1">Certification Levels</h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              Cert level appears in all certification endpoints. Higher levels unlock greater Maiat trust boosts.
            </p>
            <div className="space-y-2">
              {CERT_LEVELS.map((c) => (
                <div key={c.level} className="flex items-center gap-4 border border-[#27272a] px-4 py-3">
                  <span className="text-lg" style={{ color: c.color }}>{c.emoji}</span>
                  <div className="flex-1">
                    <span className="font-mono text-sm font-bold" style={{ color: c.color }}>{c.label}</span>
                    <span className="text-xs text-[var(--muted)] ml-3">{c.requirement}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
