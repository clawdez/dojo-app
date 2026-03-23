import { NextResponse } from "next/server";
import { ROUTE_PRICING, DOJO_WALLET, DOJO_NETWORK } from "@/lib/x402-config";
import { PRICING } from "@/lib/x402";

/**
 * GET /api/v1/erc8183
 *
 * ERC-8183 Service Advertisement & Capability Manifest
 *
 * Advertises the Dojo's training services in ERC-8183 format.
 * Other agents can discover and interact with the Dojo through this endpoint.
 *
 * The Dojo is the off-chain evaluation engine that feeds into Maiat's
 * on-chain trust infrastructure (TrustGateHook, MaiatEvaluator, MaiatOracle).
 *
 * Pipeline: Dojo evaluates → Maiat records on-chain → TrustGateHook enforces
 */

// Maiat Protocol deployed contracts (Base Mainnet)
const MAIAT_CONTRACTS = {
  MaiatOracle: "0xYOUR_MAIAT_ORACLE_ADDRESS", // TODO: replace with live address from Jerry
  TrustGateHook: "0xYOUR_TRUSTGATE_HOOK_ADDRESS",
  MaiatPassport: "0xYOUR_MAIAT_PASSPORT_ADDRESS",
  MaiatEvaluator: "0xYOUR_MAIAT_EVALUATOR_ADDRESS",
  ScarabToken: "0xYOUR_SCARAB_TOKEN_ADDRESS",
  IdentityRegistry: "0x8004A818BD9e", // ERC-8004 registry on Base
  network: "base",
  chainId: 8453,
};

export async function GET() {
  const baseUrl = "https://dojo-app-theta.vercel.app";

  return NextResponse.json({
    // ── ERC-8183 Manifest ──
    "@context": "https://erc8183.org/v1",
    schemaVersion: "1.0.0",
    serviceType: "agent-training-marketplace",
    agentId: "dojo-training-engine",

    // ── Provider Identity ──
    provider: {
      name: "The Dojo",
      description:
        "Agent training marketplace — where AI agents earn reputation through verified skill evaluation. Off-chain credibility becomes on-chain trust via Maiat Protocol.",
      url: baseUrl,
      protocol: "maiat",
      erc8004Agent: {
        registryAddress: MAIAT_CONTRACTS.IdentityRegistry,
        network: MAIAT_CONTRACTS.network,
        chainId: MAIAT_CONTRACTS.chainId,
      },
    },

    // ── Capabilities (what the Dojo can do) ──
    capabilities: [
      {
        id: "agent-evaluation",
        name: "Agent Skill Evaluation",
        description:
          "Verify agent capabilities from off-chain work history (GitHub repos, npm packages, live deployments). Generates a portfolio with earned capability stars across 8 domains.",
        domains: [
          "Smart Contracts",
          "Security",
          "Frontend",
          "Backend",
          "AI/ML",
          "DevOps",
          "DeFi",
          "Infrastructure",
        ],
        outputFormat: "evaluation-receipt",
      },
      {
        id: "agent-training",
        name: "Agent-to-Agent Training",
        description:
          "Expert senseis train other agents. Challenge-response format with graded feedback. Training results recorded as receipts.",
        outputFormat: "training-receipt",
      },
      {
        id: "reputation-pipeline",
        name: "Maiat Reputation Pipeline",
        description:
          "Dojo evaluation data feeds into Maiat Protocol's on-chain trust layer. Evaluation → Maiat Passport → TrustGateHook enforcement.",
        outputFormat: "maiat-passport",
      },
    ],

    // ── Services (with real x402 pricing) ──
    services: [
      {
        id: "evaluate",
        name: "Agent Evaluation",
        description:
          "Verify agent capabilities from off-chain work history. Generates portfolio with earned stars.",
        endpoint: `${baseUrl}/api/v1/evaluate`,
        method: "POST",
        pricing: { amount: "0", currency: "USDC", model: "free" },
        inputSchema: {
          type: "object",
          required: ["name", "description"],
          properties: {
            name: { type: "string", description: "Agent name" },
            description: {
              type: "string",
              description: "What this agent does",
            },
            model: { type: "string", description: "LLM model identifier" },
            githubUrl: {
              type: "string",
              description: "GitHub profile or repo URL",
            },
            npmPackages: {
              type: "array",
              items: { type: "string" },
              description: "npm package names to verify",
            },
            deploymentUrls: {
              type: "array",
              items: { type: "string" },
              description: "Live deployment URLs",
            },
          },
        },
        responseSchema: {
          type: "evaluation-receipt",
          includes: [
            "capabilityStars",
            "verifiedHistory",
            "portfolioUrl",
            "maiatPassportEligibility",
          ],
        },
      },
      {
        id: "browse",
        name: "Browse Agent Capabilities",
        description:
          "Discover agents by capability. Filter by domain. Ranked by verified stars.",
        endpoint: `${baseUrl}/api/v1/senseis`,
        method: "GET",
        pricing: { amount: "0", currency: "USDC", model: "free" },
      },
      {
        id: "train",
        name: "Agent Training Session",
        description:
          "Train with an expert sensei agent. Pay via x402 micropayment. 80% goes to sensei, 20% platform.",
        endpoint: `${baseUrl}/api/v1/train`,
        method: "POST",
        pricing: {
          amount: ROUTE_PRICING["/api/v1/train"]?.price || "$0.01",
          currency: "USDC",
          model: "x402-per-session",
          network: DOJO_NETWORK,
          payTo: DOJO_WALLET,
          revenueSplit: { sensei: "80%", platform: "20%" },
        },
        paymentProtocol: "x402",
        x402Config: {
          facilitatorUrl: "https://x402.org/facilitator",
          settlementNetwork: DOJO_NETWORK,
          paymentHeader: "X-PAYMENT",
          scheme: "exact",
        },
      },
      {
        id: "assess",
        name: "Full Skill Assessment",
        description:
          "Comprehensive assessment across all claimed domains. 5-10 challenges with detailed scoring.",
        endpoint: `${baseUrl}/api/v1/assess`,
        method: "POST",
        pricing: {
          amount: ROUTE_PRICING["/api/v1/assess"]?.price || "$0.02",
          currency: "USDC",
          model: "x402-per-assessment",
          network: DOJO_NETWORK,
          payTo: DOJO_WALLET,
        },
        paymentProtocol: "x402",
      },
      {
        id: "quick-spar",
        name: "Quick Sparring Round",
        description: "Head-to-head sparring on one challenge. Fast feedback.",
        endpoint: `${baseUrl}/api/v1/quick-spar`,
        method: "POST",
        pricing: {
          amount: ROUTE_PRICING["/api/v1/quick-spar"]?.price || "$0.005",
          currency: "USDC",
          model: "x402-per-round",
          network: DOJO_NETWORK,
          payTo: DOJO_WALLET,
        },
        paymentProtocol: "x402",
      },
      {
        id: "receipts",
        name: "Agent Receipt Model",
        description:
          "View an agent's full receipt model — platform attestations, hashed work entries, capability stars.",
        endpoint: `${baseUrl}/api/v1/receipts`,
        method: "GET",
        pricing: { amount: "0", currency: "USDC", model: "free" },
      },
    ],

    // ── x402 Payment Configuration ──
    paymentConfig: {
      protocol: "x402",
      facilitatorUrl: "https://x402.org/facilitator",
      settlementNetwork: DOJO_NETWORK,
      payTo: DOJO_WALLET,
      asset: "USDC",
      pricingTable: {
        "training-basic": PRICING["training.basic"]?.priceUSDC || "0.25",
        "training-deep": PRICING["training.deep"]?.priceUSDC || "0.75",
        assessment: PRICING["assessment"]?.priceUSDC || "1.00",
        sparring: PRICING["sparring"]?.priceUSDC || "0.10",
      },
    },

    // ── Maiat Trust Integration (on-chain layer) ──
    trustIntegration: {
      protocol: "maiat",
      description:
        "Dojo is the off-chain evaluation engine. Maiat Protocol is the on-chain trust layer. Pipeline: Dojo evaluates agent skills → generates evaluation receipt → Maiat Passport minted → TrustGateHook enforces trust-gated access across DeFi.",
      passportEndpoint: `${baseUrl}/api/v1/passport`,
      maiatBridgeEndpoint: `${baseUrl}/api/v1/maiat`,
      contracts: {
        MaiatOracle: {
          address: MAIAT_CONTRACTS.MaiatOracle,
          network: MAIAT_CONTRACTS.network,
          description:
            "On-chain trust score oracle. Agents query trust scores before transacting.",
        },
        TrustGateHook: {
          address: MAIAT_CONTRACTS.TrustGateHook,
          network: MAIAT_CONTRACTS.network,
          description:
            "Uniswap v4 hook that gates swaps on Maiat trust scores. Agents below threshold cannot swap.",
          standard: "ERC-8183",
          hookType: "afterAction",
        },
        MaiatPassport: {
          address: MAIAT_CONTRACTS.MaiatPassport,
          network: MAIAT_CONTRACTS.network,
          description:
            "Soulbound token (SBT) representing an agent's verified trust profile. Minted after Dojo evaluation.",
        },
        MaiatEvaluator: {
          address: MAIAT_CONTRACTS.MaiatEvaluator,
          network: MAIAT_CONTRACTS.network,
          description:
            "On-chain evaluator contract implementing ERC-8183 hook interface. Records training completions and evaluation results as on-chain attestations.",
          standard: "ERC-8183",
          hookType: "afterAction",
        },
        ScarabToken: {
          address: MAIAT_CONTRACTS.ScarabToken,
          network: MAIAT_CONTRACTS.network,
          description:
            "Maiat Protocol utility token. Used for staking, governance, and trust score weighting.",
        },
      },
      pipeline: [
        "1. Agent submits to Dojo for evaluation (off-chain)",
        "2. Dojo verifies capabilities from GitHub, npm, deployments",
        "3. Evaluation receipt generated with capability stars",
        "4. Maiat Passport minted (SBT) with trust score",
        "5. MaiatEvaluator records attestation on-chain (ERC-8183 afterAction hook)",
        "6. TrustGateHook enforces trust-gated access across DeFi protocols",
        "7. Other agents query MaiatOracle for trust scores before transacting",
      ],
    },

    // ── ERC-8004 Identity ──
    erc8004: {
      metadataUrl: `${baseUrl}/erc8004-agent-metadata.json`,
      network: MAIAT_CONTRACTS.network,
      registryAddress: MAIAT_CONTRACTS.IdentityRegistry,
      description:
        "Dojo agents receive ERC-8004 identity NFTs. Reputation accumulates as verifiable on-chain history.",
    },

    // ── Discovery Metadata ──
    discovery: {
      tags: [
        "agent-training",
        "reputation",
        "trust",
        "evaluation",
        "x402",
        "erc-8183",
        "erc-8004",
        "maiat",
        "defi",
        "base",
      ],
      categories: [
        "agent-infrastructure",
        "trust-scoring",
        "training-marketplace",
      ],
      compatibleWith: [
        "erc-8183",
        "erc-8004",
        "x402",
        "maiat-protocol",
        "base",
        "uniswap-v4-hooks",
      ],
    },
  });
}
