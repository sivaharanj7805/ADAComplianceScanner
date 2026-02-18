import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Stripe module before importing the route
const mockConstructEvent = vi.fn();
vi.mock('stripe', () => {
  return {
    default: class Stripe {
      webhooks = {
        constructEvent: mockConstructEvent,
      };
    },
  };
});

// Mock admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
        }),
      }),
    }),
  }),
}));

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
  const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const originalStripeKey = process.env.STRIPE_SECRET_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
  });

  afterEach(() => {
    if (originalWebhookSecret !== undefined) {
      process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
    } else {
      delete process.env.STRIPE_WEBHOOK_SECRET;
    }
    if (originalStripeKey !== undefined) {
      process.env.STRIPE_SECRET_KEY = originalStripeKey;
    } else {
      delete process.env.STRIPE_SECRET_KEY;
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

  it('should return 400 when signature verification fails', async () => {
    mockConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const req = createWebhookRequest({ type: 'checkout.session.completed' });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBe('Webhook signature verification failed');
  });

  it('should return received: true for valid request with verified signature', async () => {
    mockConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          customer: 'cus_test_123',
          subscription: 'sub_test_123',
          metadata: { userId: 'user-123', planId: 'agency_starter' },
        },
      },
    });

    const req = createWebhookRequest({ type: 'checkout.session.completed' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.received).toBe(true);
  });

  describe('checkout.session.completed', () => {
    it('should acknowledge webhook receipt and process event', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            customer: 'cus_test_123',
            subscription: 'sub_test_123',
            metadata: { userId: 'user-123', planId: 'agency_starter' },
          },
        },
      });

      const req = createWebhookRequest({});
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe('customer.subscription.deleted', () => {
    it('should acknowledge webhook receipt and reset to free plan', async () => {
      mockConstructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: 'sub_test_123',
            customer: 'cus_test_123',
            status: 'canceled',
          },
        },
      });

      const req = createWebhookRequest({});
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });
});
