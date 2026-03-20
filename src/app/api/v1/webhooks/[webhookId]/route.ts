import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/webhooks/[webhookId]
 * Returns the status and configuration of a registered webhook.
 *
 * DELETE /api/v1/webhooks/[webhookId]
 * Unregisters a webhook.
 *
 * PATCH /api/v1/webhooks/[webhookId]
 * Update webhook status (pause/resume) or events list.
 */

// Import shared registry — in production this would be a Supabase query
// Note: In Next.js serverless, each invocation may be isolated.
// TODO: replace in-memory store with Supabase persistence.
import { webhookRegistry } from '../register/route';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> },
) {
  const { webhookId } = await params;
  const webhook = webhookRegistry.get(webhookId);

  if (!webhook) {
    return NextResponse.json(
      {
        error: 'Webhook not found',
        webhookId,
        hint: 'Use POST /api/v1/webhooks/register to create a new webhook.',
      },
      { status: 404 },
    );
  }

  return NextResponse.json({
    webhookId: webhook.webhookId,
    url: webhook.url,
    agentIds: webhook.agentIds,
    events: webhook.events,
    status: webhook.status,
    hasSecret: !!webhook.secret,
    registeredAt: webhook.registeredAt,
    deliveryCount: webhook.deliveryCount,
    failureCount: webhook.failureCount,
    lastDeliveredAt: webhook.lastDeliveredAt ?? null,
    retrievedAt: new Date().toISOString(),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> },
) {
  const { webhookId } = await params;
  const exists = webhookRegistry.has(webhookId);

  if (!exists) {
    return NextResponse.json(
      { error: 'Webhook not found', webhookId },
      { status: 404 },
    );
  }

  webhookRegistry.delete(webhookId);

  return NextResponse.json({
    message: 'Webhook unregistered successfully',
    webhookId,
    deletedAt: new Date().toISOString(),
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ webhookId: string }> },
) {
  const { webhookId } = await params;
  const webhook = webhookRegistry.get(webhookId);

  if (!webhook) {
    return NextResponse.json(
      { error: 'Webhook not found', webhookId },
      { status: 404 },
    );
  }

  try {
    const body = await req.json();
    const { status, events } = body as {
      status?: 'active' | 'paused';
      events?: string[];
    };

    if (status && status !== 'active' && status !== 'paused') {
      return NextResponse.json(
        { error: 'Invalid status. Must be "active" or "paused".' },
        { status: 400 },
      );
    }

    if (status) webhook.status = status;
    if (Array.isArray(events) && events.length > 0) {
      const validEvents = ['cert.updated', 'score.changed', 'cert.expired', 'agent.new'];
      const filtered = events.filter((e) => validEvents.includes(e)) as typeof webhook.events;
      if (filtered.length > 0) webhook.events = filtered;
    }

    webhookRegistry.set(webhookId, webhook);

    return NextResponse.json({
      message: 'Webhook updated',
      webhookId,
      status: webhook.status,
      events: webhook.events,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 },
    );
  }
}
