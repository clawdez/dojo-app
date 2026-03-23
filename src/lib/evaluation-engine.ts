/**
 * evaluation-engine.ts
 * Off-chain agent evaluation: GitHub data, npm packages, deployment checks,
 * skills scoring, fraud detection → Maiat Passport eligibility.
 */

export interface EvaluationInput {
  name: string;
  description: string;
  model: string;
  walletAddress?: string;
  githubUrl?: string;
  npmPackages?: string[];
  deploymentUrls?: string[];
}

export interface GitHubSummary {
  username: string;
  repos: number;
  total_stars: number;
  total_forks: number;
  languages: string[];
  top_repos: { name: string; stars: number; language: string; description: string }[];
  account_age_days: number;
  has_readme_pattern: boolean;
  solidity_repos: number;
  doc_heavy_repos: number;
  commit_activity_signal: string; // "high" | "medium" | "low" | "unknown"
}

export interface NpmSummary {
  packages_found: number;
  total_weekly_downloads: number;
  packages: { name: string; exists: boolean; weekly_downloads: number; description: string }[];
}

export interface DeploymentSummary {
  checked: number;
  live: number;
  dead: number;
  urls: { url: string; live: boolean; status_code?: number }[];
}

export interface OffChainSummary {
  repos: number;
  total_stars: number;
  npm_packages: number;
  live_deployments: number;
}

export interface DomainScores {
  code: number;
  research: number;
  creative: number;
  operations: number;
  safety: number;
}

export interface FraudCheck {
  is_suspicious: boolean;
  flags: string[];
}

export interface EvaluationReport {
  agentId: string;
  input: EvaluationInput;
  evaluation: {
    overall_score: number;
    domains: DomainScores;
    skills_detected: string[];
    fraud_check: FraudCheck;
    off_chain_summary: OffChainSummary;
    raw: {
      github?: GitHubSummary;
      npm?: NpmSummary;
      deployments?: DeploymentSummary;
    };
  };
  passport: {
    eligible: boolean;
    recommended_belt: string;
    reason?: string;
  };
  evaluated_at: string;
}

// ─── GitHub ───────────────────────────────────────────────────────────────────

export async function fetchGitHubData(githubUrl: string): Promise<GitHubSummary | null> {
  try {
    // Extract username from URL (handle: github.com/user or github.com/user/repo)
    const match = githubUrl.replace(/\/$/, "").match(/github\.com\/([^/]+)/);
    if (!match) return null;
    const username = match[1];

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "dojo-evaluation-engine/1.0",
    };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) return null;
    const user = await userRes.json();

    // Fetch repos (up to 100, sorted by updated)
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated&type=public`,
      { headers }
    );
    if (!reposRes.ok) return null;
    const repos: any[] = await reposRes.json();
    if (!Array.isArray(repos)) return null;

    // Compute account age
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const account_age_days = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // Aggregate language info
    const langCount: Record<string, number> = {};
    let solidity_repos = 0;
    let doc_heavy_repos = 0;
    let total_stars = 0;
    let total_forks = 0;

    for (const repo of repos) {
      total_stars += repo.stargazers_count || 0;
      total_forks += repo.forks_count || 0;
      const lang = repo.language;
      if (lang) {
        langCount[lang] = (langCount[lang] || 0) + 1;
        if (lang.toLowerCase() === "solidity") solidity_repos++;
      }
      // Heuristic: repo name or description suggests docs/research
      const nameDesc = `${repo.name} ${repo.description || ""}`.toLowerCase();
      if (
        nameDesc.includes("doc") ||
        nameDesc.includes("readme") ||
        nameDesc.includes("research") ||
        nameDesc.includes("wiki") ||
        nameDesc.includes("notes")
      ) {
        doc_heavy_repos++;
      }
    }

    const languages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang)
      .slice(0, 10);

    const top_repos = repos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 5)
      .map((r) => ({
        name: r.name,
        stars: r.stargazers_count || 0,
        language: r.language || "unknown",
        description: r.description || "",
      }));

    // Commit activity signal from public events (best-effort)
    let commit_activity_signal = "unknown";
    try {
      const eventsRes = await fetch(
        `https://api.github.com/users/${username}/events/public?per_page=30`,
        { headers }
      );
      if (eventsRes.ok) {
        const events: any[] = await eventsRes.json();
        if (Array.isArray(events)) {
          const pushEvents = events.filter((e) => e.type === "PushEvent");
          if (pushEvents.length >= 10) commit_activity_signal = "high";
          else if (pushEvents.length >= 4) commit_activity_signal = "medium";
          else if (pushEvents.length >= 1) commit_activity_signal = "low";
          else commit_activity_signal = "low";
        }
      }
    } catch {
      // Non-critical, keep "unknown"
    }

    // has_readme_pattern: does the profile README repo exist?
    const has_readme_pattern = repos.some(
      (r) => r.name.toLowerCase() === username.toLowerCase()
    );

    return {
      username,
      repos: repos.length,
      total_stars,
      total_forks,
      languages,
      top_repos,
      account_age_days,
      has_readme_pattern,
      solidity_repos,
      doc_heavy_repos,
      commit_activity_signal,
    };
  } catch {
    return null;
  }
}

// ─── NPM ──────────────────────────────────────────────────────────────────────

export async function fetchNpmData(packages: string[]): Promise<NpmSummary> {
  const results = await Promise.allSettled(
    packages.map(async (pkg) => {
      try {
        const [infoRes, downloadsRes] = await Promise.all([
          fetch(`https://registry.npmjs.org/${encodeURIComponent(pkg)}/latest`),
          fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(pkg)}`),
        ]);

        if (!infoRes.ok) {
          return { name: pkg, exists: false, weekly_downloads: 0, description: "" };
        }

        const info = await infoRes.json();
        let weekly_downloads = 0;
        if (downloadsRes.ok) {
          const dlData = await downloadsRes.json();
          weekly_downloads = dlData.downloads || 0;
        }

        return {
          name: pkg,
          exists: true,
          weekly_downloads,
          description: info.description || "",
        };
      } catch {
        return { name: pkg, exists: false, weekly_downloads: 0, description: "" };
      }
    })
  );

  const packageList = results.map((r) =>
    r.status === "fulfilled" ? r.value : { name: "", exists: false, weekly_downloads: 0, description: "" }
  );

  const found = packageList.filter((p) => p.exists);
  const total_weekly_downloads = found.reduce((sum, p) => sum + p.weekly_downloads, 0);

  return {
    packages_found: found.length,
    total_weekly_downloads,
    packages: packageList,
  };
}

// ─── Deployments ──────────────────────────────────────────────────────────────

export async function checkDeployments(urls: string[]): Promise<DeploymentSummary> {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const res = await fetch(url, {
          method: "HEAD",
          signal: controller.signal,
          redirect: "follow",
        });
        clearTimeout(timeout);
        return { url, live: res.ok || res.status < 400, status_code: res.status };
      } catch {
        return { url, live: false, status_code: undefined };
      }
    })
  );

  const checked_urls = results.map((r) =>
    r.status === "fulfilled" ? r.value : { url: "", live: false, status_code: undefined }
  );

  const live = checked_urls.filter((u) => u.live).length;

  return {
    checked: checked_urls.length,
    live,
    dead: checked_urls.length - live,
    urls: checked_urls,
  };
}

// ─── Skills Scoring ───────────────────────────────────────────────────────────

export function scoreSkills(
  input: EvaluationInput,
  github?: GitHubSummary | null,
  npm?: NpmSummary | null,
  deployments?: DeploymentSummary | null
): { domains: DomainScores; skills_detected: string[] } {
  // Higher baselines — agents deserve credit for participating
  let code = 40;
  let research = 35;
  let creative = 35;
  let operations = 35;
  let safety = 45;

  const skills_detected: string[] = [];
  const descLower = (input.description || "").toLowerCase();
  const nameLower = (input.name || "").toLowerCase();

  // ── Description quality bonus (up to +10 across all domains) ──
  const descWords = descLower.split(/\s+/).filter(Boolean).length;
  if (descWords >= 30) {
    code += 5; research += 5; creative += 5; operations += 5; safety += 5;
  } else if (descWords >= 15) {
    code += 3; research += 3; creative += 3;
  }

  // ── Model quality signal ──
  const modelLower = (input.model || "").toLowerCase();
  if (modelLower.includes("claude") || modelLower.includes("gpt-4") || modelLower.includes("gemini") || modelLower.includes("opus")) {
    code += 5; safety += 5;
    skills_detected.push("frontier-model");
  }

  // ── Code domain ──
  if (github) {
    // Repo count (more generous — even a few repos shows real work)
    if (github.repos >= 30) code += 25;
    else if (github.repos >= 15) code += 18;
    else if (github.repos >= 7) code += 12;
    else if (github.repos >= 2) code += 7;
    else if (github.repos >= 1) code += 4;

    // Stars signal quality
    if (github.total_stars >= 500) code += 20;
    else if (github.total_stars >= 100) code += 15;
    else if (github.total_stars >= 20) code += 8;
    else if (github.total_stars >= 3) code += 4;

    // Commit activity — key signal
    if (github.commit_activity_signal === "high") code += 15;
    else if (github.commit_activity_signal === "medium") code += 10;
    else if (github.commit_activity_signal === "low") code += 4;

    // Account age = longevity bonus
    if (github.account_age_days > 365) code += 8;
    else if (github.account_age_days > 90) code += 4;

    // Language signals — multiple good languages = full-stack signal
    let langBonus = 0;
    for (const lang of github.languages) {
      const l = lang.toLowerCase();
      if (["typescript", "javascript", "rust", "go", "python", "java", "kotlin", "swift"].includes(l)) {
        langBonus += 4;
        if (!skills_detected.includes(l)) skills_detected.push(l);
      }
      if (l === "solidity") {
        code += 12;
        if (!skills_detected.includes("solidity")) skills_detected.push("solidity");
      }
      if (["css", "html", "svelte", "vue"].includes(l)) {
        creative += 6;
        if (!skills_detected.includes("frontend")) skills_detected.push("frontend");
      }
    }
    code += Math.min(langBonus, 16); // cap at 4 languages worth

    // Profile README = presentation signal
    if (github.has_readme_pattern) {
      creative += 8;
      code += 3;
      skills_detected.push("personal-branding");
    }

    // Forks = community adoption
    if (github.total_forks >= 50) code += 8;
    else if (github.total_forks >= 10) code += 4;
  }

  if (npm && npm.packages_found > 0) {
    code += Math.min(npm.packages_found * 10, 25);
    if (npm.total_weekly_downloads > 50000) code += 15;
    else if (npm.total_weekly_downloads > 10000) code += 10;
    else if (npm.total_weekly_downloads > 1000) code += 6;
    else if (npm.total_weekly_downloads > 100) code += 3;
    skills_detected.push("npm-publishing");
  }

  // ── Code: description signals ──
  if (descLower.includes("solana") || descLower.includes("anchor") || descLower.includes("smart contract")) {
    code += 10; skills_detected.push("blockchain");
  }
  if (descLower.includes("typescript") || descLower.includes("next.js") || descLower.includes("react")) {
    code += 6; if (!skills_detected.includes("typescript")) skills_detected.push("typescript");
  }
  if (descLower.includes("api") || descLower.includes("backend") || descLower.includes("server")) {
    code += 5; if (!skills_detected.includes("api")) skills_detected.push("api");
  }
  if (descLower.includes("ship") || descLower.includes("deploy") || descLower.includes("production")) {
    operations += 8;
  }

  // ── Research domain ──
  if (github) {
    if (github.doc_heavy_repos >= 5) research += 20;
    else if (github.doc_heavy_repos >= 2) research += 12;
    else if (github.doc_heavy_repos >= 1) research += 6;

    const docLangs = ["markdown", "rst", "latex"];
    for (const lang of github.languages) {
      if (docLangs.includes(lang.toLowerCase())) {
        research += 8;
        skills_detected.push("documentation");
        break;
      }
    }
  }

  if (descLower.includes("research") || descLower.includes("analysis") || descLower.includes("study")) {
    research += 12; skills_detected.push("research");
  }
  if (descLower.includes("rag") || descLower.includes("retrieval") || descLower.includes("knowledge base")) {
    research += 10; skills_detected.push("rag");
  }
  if (descLower.includes("orchestrat") || descLower.includes("coordinate") || descLower.includes("agent")) {
    research += 8; skills_detected.push("orchestration");
  }
  if (descLower.includes("market") || descLower.includes("competitive") || descLower.includes("intel")) {
    research += 6; skills_detected.push("market-intel");
  }

  // ── Creative domain ──
  if (descLower.includes("design") || descLower.includes("creative") || descLower.includes("visual")) {
    creative += 12; skills_detected.push("design");
  }
  if (descLower.includes("ui") || descLower.includes("frontend") || descLower.includes("interface")) {
    creative += 10; if (!skills_detected.includes("frontend")) skills_detected.push("frontend");
  }
  if (descLower.includes("copy") || descLower.includes("content") || descLower.includes("writing")) {
    creative += 8; skills_detected.push("copywriting");
  }
  if (descLower.includes("brand") || descLower.includes("marketing")) {
    creative += 6; if (!skills_detected.includes("marketing")) skills_detected.push("marketing");
  }

  // ── Operations domain ──
  if (deployments && deployments.live > 0) {
    operations += Math.min(deployments.live * 15, 40);
    skills_detected.push("deployment");
    // A live deployment is strong evidence of ops capability
    if (deployments.live >= 3) operations += 10;
  }
  if (deployments && deployments.checked > 0 && deployments.live === 0) {
    // Tried but all dead — slight negative
    operations -= 5;
  }

  if (github && github.repos >= 10) operations += 12;
  else if (github && github.repos >= 5) operations += 8;
  else if (github && github.repos >= 2) operations += 4;

  if (descLower.includes("devops") || descLower.includes("infrastructure") || descLower.includes("kubernetes") || descLower.includes("docker")) {
    operations += 15; skills_detected.push("devops");
  }
  if (descLower.includes("automation") || descLower.includes("pipeline") || descLower.includes("ci/cd")) {
    operations += 10; skills_detected.push("automation");
  }
  if (descLower.includes("monitor") || descLower.includes("observab") || descLower.includes("alerting")) {
    operations += 6; skills_detected.push("monitoring");
  }
  if (descLower.includes("vercel") || descLower.includes("railway") || descLower.includes("supabase") || descLower.includes("cloud")) {
    operations += 8; if (!skills_detected.includes("deployment")) skills_detected.push("deployment");
  }

  // ── Safety domain ──
  if (github && github.solidity_repos > 0) {
    safety += 12; // Smart contract = must know security
  }
  if (descLower.includes("safe") || descLower.includes("security") || descLower.includes("audit")) {
    safety += 15; skills_detected.push("security");
  }
  if (descLower.includes("privacy") || descLower.includes("zero-knowledge") || descLower.includes("zk")) {
    safety += 12; skills_detected.push("privacy");
  }
  if (github && github.account_age_days > 365) {
    safety += 12; // established account = trust signal
  } else if (github && github.account_age_days > 180) {
    safety += 6;
  } else if (github && github.account_age_days > 60) {
    safety += 3;
  }
  if (descLower.includes("trust") || descLower.includes("maiat") || descLower.includes("verification")) {
    safety += 10; skills_detected.push("trust-evaluation");
  }
  if (descLower.includes("refus") || descLower.includes("boundary") || descLower.includes("align")) {
    safety += 8; skills_detected.push("alignment");
  }

  // ── No verifiable data? Give reasonable baseline ──
  // If they filled out a description but have no GitHub, still respect their work
  if (!input.githubUrl && (!input.npmPackages || input.npmPackages.length === 0) &&
      (!deployments || deployments.checked === 0)) {
    // Boost from description quality
    if (descWords >= 20) {
      code += 5; research += 5; operations += 5;
    }
  }

  // Cap all domains at 100
  const clamp = (n: number) => Math.min(Math.max(Math.round(n), 0), 100);

  return {
    domains: {
      code: clamp(code),
      research: clamp(research),
      creative: clamp(creative),
      operations: clamp(operations),
      safety: clamp(safety),
    },
    skills_detected: [...new Set(skills_detected)],
  };
}

// ─── Fraud Detection ──────────────────────────────────────────────────────────

export function detectFraud(
  input: EvaluationInput,
  github?: GitHubSummary | null
): FraudCheck {
  const flags: string[] = [];

  if (github) {
    // Red flag: brand new account (< 30 days)
    if (github.account_age_days < 30) {
      flags.push("github_account_less_than_30_days_old");
    }

    // Red flag: zero repos with a GitHub URL provided
    if (github.repos === 0) {
      flags.push("github_account_has_zero_public_repos");
    }

    // Red flag: <3 repos but lots of stars (purchased stars signal)
    if (github.repos < 3 && github.total_stars > 50) {
      flags.push("suspicious_star_to_repo_ratio");
    }

    // Red flag: very low commit activity on supposedly active account
    if (
      github.repos >= 5 &&
      github.commit_activity_signal === "low" &&
      github.account_age_days > 60
    ) {
      flags.push("low_commit_activity_despite_multiple_repos");
    }

    // Red flag: account age < 7 days with many repos (mass import signal)
    if (github.account_age_days < 7 && github.repos > 10) {
      flags.push("many_repos_on_very_new_account_possible_fork_spam");
    }
  }

  // No GitHub provided at all and no npm packages = very little verifiable history
  if (!input.githubUrl && (!input.npmPackages || input.npmPackages.length === 0)) {
    flags.push("no_verifiable_off_chain_history");
  }

  // Suspiciously generic description
  const desc = (input.description || "").trim();
  if (desc.length < 20) {
    flags.push("description_too_short_or_missing");
  }

  const is_suspicious = flags.length >= 2;

  return { is_suspicious, flags };
}

// ─── Belt Assignment ──────────────────────────────────────────────────────────

export function recommendBelt(overall_score: number, fraud: FraudCheck): {
  eligible: boolean;
  recommended_belt: string;
  reason?: string;
} {
  if (fraud.is_suspicious) {
    return {
      eligible: false,
      recommended_belt: "none",
      reason: "Fraud flags prevent passport issuance. Resolve flags and re-evaluate.",
    };
  }

  if (overall_score >= 85) return { eligible: true, recommended_belt: "black" };
  if (overall_score >= 70) return { eligible: true, recommended_belt: "brown" };
  if (overall_score >= 55) return { eligible: true, recommended_belt: "green" };
  if (overall_score >= 40) return { eligible: true, recommended_belt: "blue" };
  if (overall_score >= 25) return { eligible: true, recommended_belt: "white" };

  return {
    eligible: false,
    recommended_belt: "none",
    reason: "Score too low for passport eligibility. Build more verifiable history.",
  };
}

// ─── Overall Score ────────────────────────────────────────────────────────────

export function computeOverallScore(domains: DomainScores): number {
  // Weighted average: code (30%), operations (25%), safety (20%), research (15%), creative (10%)
  const weighted =
    domains.code * 0.3 +
    domains.operations * 0.25 +
    domains.safety * 0.2 +
    domains.research * 0.15 +
    domains.creative * 0.1;
  return Math.round(weighted);
}
