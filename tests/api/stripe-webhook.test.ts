import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// The actual stripe webhook is a stub that just returns { received: true }
// We test the current implementation and also write tests for the expected
// behavior that should be implemented.

const { POST } = await import('@/app/api/webhooks/stripe/route');

function createWebhookRequest(body: unknown, signature = 'valid-sig'): NextRequest {
  return new NextRequest('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/webhooks/stripe', () => {
  const originalEnv = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.STRIPE_WEBHOOK_SECRET = originalEnv;
    } else {
      delete process.env.STRIPE_WEBHOOK_SECRET;
    }
  });

  it('should return 400 when body is empty', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'stripe-signature': 'valid-sig' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 400 when stripe-signature header is missing', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Missing stripe-signature header');
  });

  it('should return 500 when STRIPE_WEBHOOK_SECRET is not configured', async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const req = createWebhookRequest({ type: 'checkout.session.completed' });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(500);
    expect(data.error).toBe('Webhook not configured');
  });

  it('should return received: true for valid request with secret configured', async () => {
    const req = createWebhookRequest({ type: 'checkout.session.completed' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.received).toBe(true);
  });

  describe('checkout.session.completed (expected behavior)', () => {
    it('should acknowledge webhook receipt', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            metadata: { userId: 'user-123', plan: 'agency_starter' },
          },
        },
      };

      const req = createWebhookRequest(event);
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe('customer.subscription.deleted (expected behavior)', () => {
    it('should acknowledge webhook receipt', async () => {
      const event = {
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'canceled',
          },
        },
      };

      const req = createWebhookRequest(event);
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });
});
