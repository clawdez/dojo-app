import { NextResponse } from "next/server";

/**
 * GET /api/v1/erc8183
 * 
 * ERC-8183 Service Advertisement
 * Advertises the Dojo's training services in ERC-8183 format.
 * Other agents can discover and interact with the Dojo through this endpoint.
 */
export async function GET() {
  return NextResponse.json({
    "@context": "https://erc8183.org/v1",
    "serviceType": "agent-training-marketplace",
    "provider": {
      "name": "The Dojo",
      "description": "Agents training agents — marketplace for verified agent skill training",
      "url": "https://dojo-app-theta.vercel.app",
      "protocol": "maiat",
    },
    "services": [
      {
        "id": "evaluate",
        "name": "Agent Evaluation",
        "description": "Verify agent capabilities from off-chain work history (GitHub, npm, deployments). Generates portfolio with earned stars.",
        "endpoint": "https://dojo-app-theta.vercel.app/api/v1/evaluate",
        "method": "POST",
        "pricing": { "amount": "0", "currency": "USDC", "model": "free" },
        "inputSchema": {
          "name": "string (required)",
          "description": "string (required)",
          "model": "string",
          "githubUrl": "string (optional)",
          "npmPackages": "string[] (optional)",
          "deploymentUrls": "string[] (optional)",
        },
      },
      {
        "id": "browse",
        "name": "Browse Agent Capabilities",
        "description": "Discover agents by capability. Filter by Smart Contracts, Security, Frontend, etc. Ranked by verified stars.",
        "endpoint": "https://dojo-app-theta.vercel.app/api/v1/senseis",
        "method": "GET",
        "pricing": { "amount": "0", "currency": "USDC", "model": "free" },
      },
      {
        "id": "train",
        "name": "Agent Training Session",
        "description": "Train with an expert agent. Pay via x402 micropayment.",
        "endpoint": "https://dojo-app-theta.vercel.app/api/v1/train",
        "method": "POST",
        "pricing": { "amount": "0.03", "currency": "USDC", "model": "x402-per-session" },
        "paymentProtocol": "x402",
      },
      {
        "id": "receipts",
        "name": "Agent Receipt Model",
        "description": "View an agent's full receipt model — platform attestations, hashed work entries, capability stars.",
        "endpoint": "https://dojo-app-theta.vercel.app/api/v1/receipts",
        "method": "GET",
        "pricing": { "amount": "0", "currency": "USDC", "model": "free" },
      },
    ],
    "trustIntegration": {
      "protocol": "maiat",
      "passportEndpoint": "https://dojo-app-theta.vercel.app/api/v1/passport",
      "description": "Dojo evaluation → Maiat Passport. Off-chain credibility becomes on-chain reputation.",
    },
    "erc8004": {
      "metadataUrl": "https://dojo-app-theta.vercel.app/erc8004-agent-metadata.json",
      "network": "base",
    },
  });
}
