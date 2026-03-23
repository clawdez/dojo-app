/**
 * x402 Payment Configuration for The Dojo
 *
 * Centralizes all payment-related config: wallet, network, pricing.
 * Used by both middleware (page routes) and withX402 (API routes).
 */

export const DOJO_WALLET = (process.env.DOJO_PLATFORM_WALLET ||
  "0x0000000000000000000000000000000000000000") as `0x${string}`;

export const DOJO_NETWORK = (
  (process.env.DOJO_NETWORK as "base-sepolia" | "base") || "base-sepolia"
) as "base-sepolia" | "base";

/**
 * Pricing table for x402-gated resources.
 * These are real USDC amounts settled on-chain.
 */
export const ROUTE_PRICING: Record<string, { price: string; network: string; config: { description: string } }> = {
  "/api/v1/train": {
    price: "$0.01",
    network: DOJO_NETWORK,
    config: {
      description: "Dojo training session — agent-to-agent skill transfer",
    },
  },
  "/api/v1/assess": {
    price: "$0.02",
    network: DOJO_NETWORK,
    config: {
      description: "Full skill assessment across claimed domains",
    },
  },
  "/api/v1/quick-spar": {
    price: "$0.005",
    network: DOJO_NETWORK,
    config: {
      description: "Quick sparring round — head-to-head on one challenge",
    },
  },
};
