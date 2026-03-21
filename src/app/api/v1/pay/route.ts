import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/v1/pay
 *
 * x402 payment gate for training sessions.
 * HTTP 402 pattern: payment required → pay → unlock.
 *
 * Body: {
 *   resource: string,   // e.g. "training.code"
 *   amount: string,     // USDC amount
 *   payer: string,      // wallet address
 *   domain?: string,    // training domain
 * }
 *
 * Returns: {
 *   success: boolean,
 *   txHash: string,
 *   payer: string,
 *   split: { sensei: string, platform: string }
 * }
 */

interface PaymentRequest {
  resource: string;
  amount: string;
  payer: string;
  domain?: string;
}

const PRICING: Record<string, string> = {
  "training.code": "0.03",
  "training.research": "0.02",
  "training.creative": "0.02",
  "training.ops": "0.05",
  "training.safety": "0.04",
  "assessment": "1.00",
};

function calculateSplit(amount: string): { sensei: string; platform: string } {
  const a = parseFloat(amount);
  return {
    sensei: (a * 0.7).toFixed(4),
    platform: (a * 0.3).toFixed(4),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as PaymentRequest;
    const { resource, amount, payer, domain } = body;

    if (!resource || !payer) {
      return NextResponse.json(
        { error: "resource and payer are required" },
        { status: 400 },
      );
    }

    const expectedAmount = PRICING[resource];
    const paymentAmount = amount || expectedAmount || "0.02";

    if (!payer.trim()) {
      // Return 402 if no payer
      return NextResponse.json(
        {
          error: "Payment Required",
          paymentRequired: {
            resource,
            amount: expectedAmount || paymentAmount,
            asset: "USDC",
            network: process.env.DOJO_NETWORK || "base-sepolia",
            payTo: process.env.DOJO_PLATFORM_WALLET || "0x0000000000000000000000000000000000000000",
            description: `Training session: ${domain || resource}`,
            split: "70% sensei / 30% platform",
          },
        },
        { status: 402 },
      );
    }

    // Production: verify real on-chain payment
    // MVP: mock verification (always succeeds with valid payer)
    const isMock =
      process.env.NODE_ENV === "development" ||
      process.env.DOJO_MOCK_PAYMENTS !== "false" ||
      !process.env.X402_FACILITATOR_URL;

    if (isMock) {
      const split = calculateSplit(paymentAmount);
      const txHash = `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

      return NextResponse.json({
        success: true,
        txHash,
        payer,
        amount: paymentAmount,
        asset: "USDC",
        network: process.env.DOJO_NETWORK || "base-sepolia",
        resource,
        split,
        mock: true,
        message: "Payment verified (mock mode). Set DOJO_MOCK_PAYMENTS=false and X402_FACILITATOR_URL for production.",
      });
    }

    // Production: call x402 facilitator
    const facilitatorUrl = process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";
    try {
      const res = await fetch(`${facilitatorUrl}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payer,
          amount: paymentAmount,
          asset: "USDC",
          network: process.env.DOJO_NETWORK || "base-sepolia",
          payTo: process.env.DOJO_PLATFORM_WALLET,
          resource,
        }),
      });

      if (!res.ok) {
        return NextResponse.json(
          { success: false, error: "Payment verification failed" },
          { status: 402 },
        );
      }

      const result = await res.json();
      if (!result.valid) {
        return NextResponse.json(
          { success: false, error: result.error || "Payment not verified" },
          { status: 402 },
        );
      }

      const split = calculateSplit(paymentAmount);
      return NextResponse.json({
        success: true,
        txHash: result.txHash,
        payer,
        amount: paymentAmount,
        asset: "USDC",
        network: process.env.DOJO_NETWORK || "base-sepolia",
        resource,
        split,
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Facilitator unreachable" },
        { status: 502 },
      );
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/v1/pay",
    description: "x402 payment gate for Dojo training sessions",
    pricing: {
      "training.code": "$0.03 USDC",
      "training.research": "$0.02 USDC",
      "training.creative": "$0.02 USDC",
      "training.ops": "$0.05 USDC",
      "training.safety": "$0.04 USDC",
      assessment: "$1.00 USDC",
    },
    split: "70% sensei / 30% platform",
    network: process.env.DOJO_NETWORK || "base-sepolia",
    mock: !process.env.X402_FACILITATOR_URL || process.env.DOJO_MOCK_PAYMENTS !== "false",
    platformWallet: process.env.DOJO_PLATFORM_WALLET || "(not configured)",
  });
}
