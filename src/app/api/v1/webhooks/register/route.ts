import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/v1/webhooks/register
 *
 * Register a webhook URL to receive notifications when a Dojo agent's
 * certification status changes. Maiat Protocol can use this to stay
 * in sync with certification updates without polling.
 *
 * Supported events:
 *   - cert.updated   — agent's cert level changed (e.g. certified → verified)
 *   - score.changed  — overall assessment score changed by ≥5 points
 *   - cert.expired   — assessment is now >30 days old (boost decays to 0)
 *   - agent.new      — new agent passed their first Dojo assessment
 *
 * Webhook payload (delivered to your URL via POST):
 * {
 *   event: "cert.updated",
 *   agentId: "ag-1",
 *   agentName: "Clawdez",
 *   previous: { certLevel: "certified", overallScore: 80 },
 *   current: { certLevel: "verified", overallScore: 87, dojoBoost: 18 },
 *   timestamp: "2026-03-20T18:00:00Z",
 *   webhookId: "wh_abc123"
 * }
 *
 * Security: Include X-Dojo-Signature header (HMAC-SHA256 of body using your secret).
 *
 * TODO: persist registrations to Supabase
 * TODO: trigger webhook delivery on assessment completion in /api/v1/session
 */

// In-memory store for MVP — replace with Supabase in production
const webhookRegistry = new Map<string, WebhookRegistration>();

export interface WebhookRegistration {
  webhookId: string;
  url: string;
  agentIds: string[];  // ["*"] means all agents
  events: WebhookEvent[];
  secret?: string;
  status: 'active' | 'paused' | 'failed';
  registeredAt: string;
  deliveryCount: number;
  failureCount: number;
  lastDeliveredAt?: string;
}

export type WebhookEvent = 'cert.updated' | 'score.changed' | 'cert.expired' | 'agent.new';

const VALID_EVENTS: WebhookEvent[] = ['cert.updated', 'score.changed', 'cert.expired', 'agent.new'];

function generateWebhookId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let id = 'wh_';
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * POST /api/v1/webhooks/register
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, agentIds, secret, events } = body as {
      url: string;
      agentIds?: string[];
      secret?: string;
      events?: string[];
    };

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: url (string)' },
        { status: 400 },
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL. Must be a valid http:// or https:// URL.' },
        { status: 400 },
      );
    }

    // Validate agentIds
    const resolvedAgentIds: string[] = Array.isArray(agentIds) && agentIds.length > 0
      ? agentIds
      : ['*'];

    if (resolvedAgentIds.length > 100) {
      return NextResponse.json(
        { error: 'Too many agentIds. Max 100 per webhook registration (or use ["*"] for all).' },
        { status: 400 },
      );
    }

    // Validate events
    const resolvedEvents: WebhookEvent[] = Array.isArray(events) && events.length > 0
      ? events.filter((e): e is WebhookEvent => VALID_EVENTS.includes(e as WebhookEvent))
      : [...VALID_EVENTS]; // default: subscribe to all events

    if (resolvedEvents.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid events specified.',
          validEvents: VALID_EVENTS,
        },
        { status: 400 },
      );
    }

    const webhookId = generateWebhookId();
    const registration: WebhookRegistration = {
      webhookId,
      url,
      agentIds: resolvedAgentIds,
      events: resolvedEvents,
      secret: secret || undefined,
      status: 'active',
      registeredAt: new Date().toISOString(),
      deliveryCount: 0,
      failureCount: 0,
    };

    // Store in memory (TODO: persist to Supabase)
    webhookRegistry.set(webhookId, registration);

    return NextResponse.json(
      {
        webhookId,
        url,
        agentIds: resolvedAgentIds,
        events: resolvedEvents,
        status: 'active',
        hasSecret: !!secret,
        verificationNote: secret
          ? 'Webhook payloads will be signed with HMAC-SHA256 using your secret. Verify the X-Dojo-Signature header on delivery.'
          : 'No secret provided. Consider adding a secret for payload verification.',
        payloadExample: {
          event: 'cert.updated',
          agentId: 'ag-1',
          agentName: 'Clawdez',
          previous: { certLevel: 'certified', overallScore: 80 },
          current: { certLevel: 'verified', overallScore: 87, dojoBoost: 18 },
          timestamp: new Date().toISOString(),
          webhookId,
        },
        managementUrl: `https://dojo-app-theta.vercel.app/api/v1/webhooks/${webhookId}`,
        registeredAt: registration.registeredAt,
        note: 'Webhook registered (MVP: stored in-memory). Production will persist to Supabase and trigger on cert changes.',
      },
      { status: 201 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/webhooks/register
 * Returns info about webhook registration.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: 'POST /api/v1/webhooks/register',
    description: 'Register a webhook to receive real-time notifications when Dojo agent certifications change.',
    events: VALID_EVENTS.map((event) => ({
      event,
      description: {
        'cert.updated': 'Agent cert level changed (e.g. certified → verified or elite)',
        'score.changed': 'Agent overall assessment score changed by ≥5 points',
        'cert.expired': 'Agent assessment is now >30 days old — trust boost decaying to 0',
        'agent.new': 'New agent passed their first Dojo assessment and is now certified',
      }[event],
    })),
    requestSchema: {
      url: 'string (required) — HTTPS URL to receive POST payloads',
      agentIds: 'string[] (optional) — specific agent IDs, or ["*"] for all agents',
      secret: 'string (optional) — HMAC-SHA256 signing secret for payload verification',
      events: 'string[] (optional) — defaults to all events if omitted',
    },
    security: {
      signing: 'If secret provided, payloads include X-Dojo-Signature: sha256=<hmac>',
      verification: 'Compute HMAC-SHA256(rawBody, secret) and compare to header value',
    },
    activeWebhooks: webhookRegistry.size,
    generatedAt: new Date().toISOString(),
  });
}

// Export registry for use by the [webhookId] route
export { webhookRegistry };
