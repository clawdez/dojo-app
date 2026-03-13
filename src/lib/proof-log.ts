export interface ProofEntry {
  agentId: string;
  domain: string;
  proofType: "commit" | "deployment" | "review" | "output";
  evidence: string;
  submittedAt: string;
  verified: boolean;
  verificationMethod: string;
}

interface SubmitProofInput {
  agentId: string;
  domain: string;
  proofType: ProofEntry["proofType"];
  evidence: string;
}

const proofEntries: ProofEntry[] = [
  {
    agentId: "ag-1",
    domain: "coding.typescript",
    proofType: "commit",
    evidence: "https://github.com/openclaw/dojo-app/commit/4f7c9a2",
    submittedAt: "2026-03-08T18:15:00.000Z",
    verified: true,
    verificationMethod: "Git commit URL pattern matched and timestamp parsed.",
  },
  {
    agentId: "ag-1",
    domain: "ops.automation",
    proofType: "deployment",
    evidence: "https://dojo-preview.vercel.app/deployments/dpl_7evo91",
    submittedAt: "2026-03-09T02:20:00.000Z",
    verified: true,
    verificationMethod: "Deployment URL pattern matched and host validated.",
  },
  {
    agentId: "ag-1",
    domain: "research.market",
    proofType: "review",
    evidence: "Reviewed 3 competing agent-payment protocols and logged differentiation notes.",
    submittedAt: "2026-03-10T12:05:00.000Z",
    verified: true,
    verificationMethod: "Manual text proof accepted for prototype review workflow.",
  },
];

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function verifyProof(input: SubmitProofInput): Pick<ProofEntry, "verified" | "verificationMethod"> {
  const evidence = input.evidence.trim();

  if (input.proofType === "commit") {
    const verified = /commit|github\.com|gitlab\.com|[a-f0-9]{7,40}/i.test(evidence);
    return {
      verified,
      verificationMethod: verified
        ? "Commit hash or repository URL matched lightweight verifier."
        : "Commit proof did not match expected hash or repository URL patterns.",
    };
  }

  if (input.proofType === "deployment") {
    const verified = isValidUrl(evidence) && /vercel|netlify|render|railway|fly\.io/i.test(evidence);
    return {
      verified,
      verificationMethod: verified
        ? "Deployment URL matched supported host patterns."
        : "Deployment proof must be a valid hosted deployment URL.",
    };
  }

  if (input.proofType === "review") {
    const verified = evidence.length >= 24;
    return {
      verified,
      verificationMethod: verified
        ? "Review note length exceeded prototype verification threshold."
        : "Review proof was too short to verify as meaningful work.",
    };
  }

  const verified = evidence.length >= 32;
  return {
    verified,
    verificationMethod: verified
      ? "Output proof length exceeded prototype verification threshold."
      : "Output proof was too short to verify as meaningful work.",
  };
}

export function listProofEntries(agentId?: string, domain?: string): ProofEntry[] {
  return proofEntries
    .filter((entry) => (agentId ? entry.agentId === agentId : true))
    .filter((entry) => (domain ? entry.domain === domain : true))
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
}

export function submitProof(input: SubmitProofInput): ProofEntry {
  const verification = verifyProof(input);
  const entry: ProofEntry = {
    ...input,
    evidence: input.evidence.trim(),
    submittedAt: new Date().toISOString(),
    verified: verification.verified,
    verificationMethod: verification.verificationMethod,
  };

  proofEntries.unshift(entry);
  return entry;
}

export function getProofBonusContext(agentId: string, domain: string): string[] {
  return listProofEntries(agentId, domain)
    .filter((entry) => entry.verified)
    .slice(0, 3)
    .map(
      (entry) =>
        `${entry.proofType.toUpperCase()}: ${entry.evidence} (verified via ${entry.verificationMethod})`,
    );
}

