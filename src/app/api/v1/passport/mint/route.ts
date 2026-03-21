import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/v1/passport/mint
 *
 * Mints a Soulbound Token (SBT) Agent Passport on Base Sepolia.
 * The passport contains the agent's assessment scores as on-chain metadata.
 *
 * Body: {
 *   agentId: string,
 *   agentName: string,
 *   walletAddress: string,
 *   overallScore: number,
 *   safetyScore: number,
 *   domains: Record<string, number>,
 *   passportReady: boolean,
 *   assessedAt: string,
 * }
 *
 * In MVP: returns mock tx hash and simulated contract address.
 * Production: deploys via Alchemy/Thirdweb API to Base Sepolia.
 */

interface MintRequest {
  agentId: string;
  agentName: string;
  walletAddress: string;
  overallScore: number;
  safetyScore: number;
  domains: Record<string, number>;
  passportReady: boolean;
  assessedAt: string;
}

// Base Sepolia Dojo Passport contract (mock address for MVP)
const PASSPORT_CONTRACT = process.env.DOJO_PASSPORT_CONTRACT || "0xDojo000000000000000000000000000000000001";

function buildTokenMetadata(data: MintRequest): object {
  return {
    name: `Dojo Agent Passport — ${data.agentName}`,
    description: `Soulbound certification passport for AI agent ${data.agentName} (${data.agentId}). Assessment verified by The Dojo platform.`,
    image: `https://thedojo.app/api/v1/badge/${data.agentId}`,
    external_url: `https://thedojo.app/profile/${data.agentId}`,
    attributes: [
      { trait_type: "Agent Name", value: data.agentName },
      { trait_type: "Agent ID", value: data.agentId },
      { trait_type: "Overall Score", value: data.overallScore, max_value: 100 },
      { trait_type: "Safety Score", value: data.safetyScore, max_value: 100 },
      ...Object.entries(data.domains).map(([domain, score]) => ({
        trait_type: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Score`,
        value: score,
        max_value: 100,
      })),
      {
        trait_type: "Certification Tier",
        value:
          data.overallScore >= 90
            ? "Elite"
            : data.overallScore >= 80
            ? "Advanced"
            : data.overallScore >= 70
            ? "Proficient"
            : data.overallScore >= 60
            ? "Developing"
            : "Novice",
      },
      { trait_type: "Passport Type", value: "Soulbound" },
      { trait_type: "Network", value: "Base Sepolia" },
      {
        trait_type: "Assessed At",
        display_type: "date",
        value: Math.floor(new Date(data.assessedAt).getTime() / 1000),
      },
    ],
  };
}

async function mintViaAlchemy(
  walletAddress: string,
  metadata: object,
): Promise<{ txHash: string; tokenId: string } | null> {
  const alchemyKey = process.env.ALCHEMY_API_KEY;
  if (!alchemyKey) return null;

  // Alchemy NFT minting API (Base Sepolia)
  try {
    const res = await fetch(
      `https://base-sepolia.g.alchemy.com/nft/v3/${alchemyKey}/mintNFT`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractAddress: PASSPORT_CONTRACT,
          to: walletAddress,
          metadata,
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      txHash: data.txHash || data.transactionHash,
      tokenId: data.tokenId || data.id?.toString() || "1",
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as MintRequest;
    const { agentId, agentName, walletAddress, overallScore, safetyScore, domains, passportReady, assessedAt } = body;

    if (!agentId || !walletAddress) {
      return NextResponse.json(
        { error: "agentId and walletAddress are required" },
        { status: 400 },
      );
    }

    if (!passportReady) {
      return NextResponse.json(
        { error: "Agent passport not ready — minimum score 40 with safety ≥50 required" },
        { status: 400 },
      );
    }

    // Validate wallet address format
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    const solAddressRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!ethAddressRegex.test(walletAddress) && !solAddressRegex.test(walletAddress)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 },
      );
    }

    const mintData: MintRequest = {
      agentId,
      agentName,
      walletAddress,
      overallScore,
      safetyScore,
      domains: domains || {},
      passportReady,
      assessedAt: assessedAt || new Date().toISOString(),
    };

    const metadata = buildTokenMetadata(mintData);
    const tokenId = Math.floor(Math.random() * 9000) + 1000; // MVP: random token ID

    // Try Alchemy first
    const alchemyResult = await mintViaAlchemy(walletAddress, metadata);

    if (alchemyResult) {
      return NextResponse.json({
        success: true,
        txHash: alchemyResult.txHash,
        tokenId: alchemyResult.tokenId,
        contractAddress: PASSPORT_CONTRACT,
        network: "base-sepolia",
        walletAddress,
        tokenURI: `https://thedojo.app/api/v1/passport/${agentId}/metadata`,
        metadata,
        mock: false,
      });
    }

    // MVP Mock mint (no Alchemy key)
    const txHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`;

    return NextResponse.json({
      success: true,
      txHash,
      tokenId: tokenId.toString(),
      contractAddress: PASSPORT_CONTRACT,
      network: "base-sepolia",
      walletAddress,
      tokenURI: `https://thedojo.app/api/v1/passport/${agentId}/metadata`,
      metadata,
      mock: true,
      message: "Mock mint (dev mode). Set ALCHEMY_API_KEY + DOJO_PASSPORT_CONTRACT for production minting.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "POST /api/v1/passport/mint",
    description: "Mint SBT Agent Passport on Base Sepolia with assessment scores in metadata",
    body: {
      agentId: "string",
      agentName: "string",
      walletAddress: "string (0x... ETH address)",
      overallScore: "number 0-100",
      safetyScore: "number 0-100",
      domains: "Record<string, number>",
      passportReady: "boolean",
      assessedAt: "ISO 8601 timestamp",
    },
    contract: PASSPORT_CONTRACT,
    network: "base-sepolia",
    mock: !process.env.ALCHEMY_API_KEY,
  });
}
