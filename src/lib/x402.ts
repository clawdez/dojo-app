/**
 * x402 Payment Layer — Agent-to-agent micropayments
 * 
 * Flow:
 * 1. Client requests a paid resource → server returns 402 with pricing
 * 2. Client signs EIP-712 payment authorization
 * 3. Client retries with X-PAYMENT header
 * 4. Server verifies via facilitator → delivers resource → facilitator settles
 * 
 * For MVP: we define types, pricing logic, and mock verification.
 * Production: swap in @x402/express-middleware + real facilitator.
 */

// ── Types ──

export interface PaymentRequirement {
  /** USDC amount as string (e.g., "0.50") */
  maxAmountRequired: string;
  /** Recipient wallet address */
  payTo: string;
  /** Token symbol */
  asset: 'USDC';
  /** Network for settlement */
  network: 'base-mainnet' | 'base-sepolia';
  /** Human-readable description */
  description: string;
  /** Resource being purchased */
  resource: string;
  /** Scheme version */
  scheme: 'exact';
  /** MIME type of the paid resource */
  mimeType?: string;
  /** Expiry timestamp (ISO 8601) */
  paymentRequiredBy?: string;
}

export interface PaymentHeader {
  /** Signed EIP-712 payment authorization */
  signature: string;
  /** Payer wallet address */
  payer: string;
  /** Amount authorized */
  amount: string;
  /** Asset */
  asset: string;
  /** Network */
  network: string;
  /** Nonce for replay protection */
  nonce: string;
}

export interface PaymentVerification {
  valid: boolean;
  payer: string;
  amount: string;
  txHash?: string;
  error?: string;
}

export interface SessionPricing {
  type: 'assessment' | 'training' | 'sparring';
  priceUSDC: string;
  description: string;
}

// ── Pricing ──

export const PRICING: Record<string, SessionPricing> = {
  assessment: {
    type: 'assessment',
    priceUSDC: '1.00',
    description: 'Full skill assessment across claimed domains (5-10 challenges)',
  },
  'training.basic': {
    type: 'training',
    priceUSDC: '0.25',
    description: 'Single training session with a sensei (1 challenge + feedback)',
  },
  'training.deep': {
    type: 'training',
    priceUSDC: '0.75',
    description: 'Deep training session (3 challenges + detailed feedback + improvement plan)',
  },
  sparring: {
    type: 'sparring',
    priceUSDC: '0.10',
    description: 'Quick sparring round — head-to-head on one challenge',
  },
};

// ── Platform wallet (from env) ──

export function getPlatformWallet(): string {
  return process.env.DOJO_PLATFORM_WALLET || '0x0000000000000000000000000000000000000000';
}

export function getNetwork(): 'base-mainnet' | 'base-sepolia' {
  return (process.env.DOJO_NETWORK as 'base-mainnet' | 'base-sepolia') || 'base-sepolia';
}

// ── 402 Response Builder ──

export function build402Response(pricingKey: string): {
  status: 402;
  body: { error: string; paymentRequired: PaymentRequirement };
} {
  const pricing = PRICING[pricingKey];
  if (!pricing) {
    return {
      status: 402,
      body: {
        error: 'Payment Required',
        paymentRequired: {
          maxAmountRequired: '0.00',
          payTo: getPlatformWallet(),
          asset: 'USDC',
          network: getNetwork(),
          description: 'Unknown resource',
          resource: pricingKey,
          scheme: 'exact',
        },
      },
    };
  }

  return {
    status: 402,
    body: {
      error: 'Payment Required',
      paymentRequired: {
        maxAmountRequired: pricing.priceUSDC,
        payTo: getPlatformWallet(),
        asset: 'USDC',
        network: getNetwork(),
        description: pricing.description,
        resource: pricingKey,
        scheme: 'exact',
      },
    },
  };
}

// ── Payment Parsing ──

export function parsePaymentHeader(headerValue: string | null): PaymentHeader | null {
  if (!headerValue) return null;
  try {
    return JSON.parse(Buffer.from(headerValue, 'base64').toString());
  } catch {
    // Try direct JSON
    try {
      return JSON.parse(headerValue);
    } catch {
      return null;
    }
  }
}

// ── Payment Verification (MVP: mock, production: facilitator) ──

export async function verifyPayment(
  payment: PaymentHeader,
  expectedAmount: string
): Promise<PaymentVerification> {
  // MVP: Accept any well-formed payment when no real facilitator is configured
  // In production with real x402: set X402_FACILITATOR_URL and remove DOJO_MOCK_PAYMENTS
  const mockPayments = process.env.NODE_ENV === 'development' 
    || process.env.DOJO_MOCK_PAYMENTS !== 'false'  // default to mock until real wallet is wired
    || !process.env.X402_FACILITATOR_URL;
  if (mockPayments) {
    return {
      valid: true,
      payer: payment.payer,
      amount: payment.amount,
      txHash: `mock-${Date.now().toString(36)}`,
    };
  }

  // Production: Call x402 facilitator to verify and settle
  // This would use @x402/express-middleware in production
  const facilitatorUrl = process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator';
  
  try {
    const res = await fetch(`${facilitatorUrl}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payment,
        expectedAmount,
        expectedAsset: 'USDC',
        expectedNetwork: getNetwork(),
        expectedPayTo: getPlatformWallet(),
      }),
    });

    if (!res.ok) {
      return { valid: false, payer: payment.payer, amount: payment.amount, error: `Facilitator returned ${res.status}` };
    }

    const result = await res.json();
    return {
      valid: result.valid === true,
      payer: payment.payer,
      amount: payment.amount,
      txHash: result.txHash,
      error: result.error,
    };
  } catch (err) {
    return {
      valid: false,
      payer: payment.payer,
      amount: payment.amount,
      error: `Facilitator unreachable: ${err instanceof Error ? err.message : 'unknown'}`,
    };
  }
}

// ── Revenue Split (sensei gets 80%, platform gets 20%) ──

export function calculateRevenueSplit(amountUSDC: string): {
  sensei: string;
  platform: string;
} {
  const amount = parseFloat(amountUSDC);
  return {
    sensei: (amount * 0.8).toFixed(2),
    platform: (amount * 0.2).toFixed(2),
  };
}

// ── Payment-gated route helper ──

export async function requirePayment(
  request: Request,
  pricingKey: string
): Promise<{ paid: true; payer: string; txHash?: string } | { paid: false; response: Response }> {
  const paymentHeader = request.headers.get('X-PAYMENT');
  const pricing = PRICING[pricingKey];

  if (!paymentHeader) {
    const { body } = build402Response(pricingKey);
    return {
      paid: false,
      response: new Response(JSON.stringify(body), {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  const payment = parsePaymentHeader(paymentHeader);
  if (!payment) {
    return {
      paid: false,
      response: new Response(JSON.stringify({ error: 'Invalid X-PAYMENT header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  const verification = await verifyPayment(payment, pricing?.priceUSDC || '0');
  if (!verification.valid) {
    return {
      paid: false,
      response: new Response(JSON.stringify({ error: 'Payment verification failed', details: verification.error }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      }),
    };
  }

  return { paid: true, payer: verification.payer, txHash: verification.txHash };
}
