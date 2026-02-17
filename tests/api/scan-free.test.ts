import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  createSuccessfulScanOutcome,
  createFailedScanOutcome,
  createTestTranslatedViolation,
} from '../setup';

// Get a reference to the mocked scanPage from the barrel import
const mockScanPage = vi.fn();
vi.mock('@/lib/scanner', () => ({
  scanPage: mockScanPage,
}));

// Must import POST after mocks are set up
const { POST } = await import('@/app/api/scan/free/route');

function createRequest(body: unknown, ip = '127.0.0.1'): NextRequest {
  const req = new NextRequest('http://localhost:3000/api/scan/free', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  });
  return req;
}

describe('POST /api/scan/free', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Use a unique IP per test to avoid rate limit interference
  });

  it('should return scan results for a valid URL', async () => {
    const outcome = createSuccessfulScanOutcome({
      score: 92,
      pageTitle: 'Test Page',
      violations: [createTestTranslatedViolation()],
    });
    mockScanPage.mockResolvedValueOnce(outcome);

    const uniqueIp = `10.0.1.${Math.floor(Math.random() * 255)}`;
    const req = createRequest({ url: 'https://example.com' }, uniqueIp);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.score).toBe(92);
    expect(data.pageTitle).toBe('Test Page');
    expect(data.totalViolations).toBe(1);
    expect(data.violations).toHaveLength(1);
    expect(data.scannedAt).toBeDefined();
  });

  it('should return 400 for an invalid URL', async () => {
    const uniqueIp = `10.0.2.${Math.floor(Math.random() * 255)}`;
    const req = createRequest({ url: 'not-a-url' }, uniqueIp);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 400 for missing URL', async () => {
    const uniqueIp = `10.0.3.${Math.floor(Math.random() * 255)}`;
    const req = createRequest({}, uniqueIp);
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('should return 400 for non-http URL', async () => {
    const uniqueIp = `10.0.4.${Math.floor(Math.random() * 255)}`;
    const req = createRequest({ url: 'ftp://example.com' }, uniqueIp);
    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('http');
  });

  it('should return 429 when rate limited (more than 10 per hour)', async () => {
    const rateLimitIp = `10.99.0.${Math.floor(Math.random() * 255)}`;
    mockScanPage.mockResolvedValue(createSuccessfulScanOutcome());

    // Make 10 requests (the limit)
    for (let i = 0; i < 10; i++) {
      const req = createRequest({ url: 'https://example.com' }, rateLimitIp);
      const res = await POST(req);
      expect(res.status).toBe(200);
    }

    // 11th request should be rate limited
    const req = createRequest({ url: 'https://example.com' }, rateLimitIp);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toContain('Rate limit');
  });

  it('should return response matching expected shape', async () => {
    mockScanPage.mockResolvedValueOnce(
      createSuccessfulScanOutcome({ score: 75, pageTitle: 'Shape Test' })
    );

    const uniqueIp = `10.0.5.${Math.floor(Math.random() * 255)}`;
    const req = createRequest({ url: 'https://example.com' }, uniqueIp);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    // Verify shape
    expect(data).toHaveProperty('score');
    expect(data).toHaveProperty('totalViolations');
    expect(data).toHaveProperty('violations');
    expect(data).toHaveProperty('pageTitle');
    expect(data).toHaveProperty('scannedAt');
    expect(typeof data.score).toBe('number');
    expect(typeof data.totalViolations).toBe('number');
    expect(Array.isArray(data.violations)).toBe(true);
    expect(typeof data.pageTitle).toBe('string');
    expect(typeof data.scannedAt).toBe('string');
  });

  it('should return at most 10 violations even if more exist', async () => {
    const manyViolations = Array.from({ length: 15 }, (_, i) =>
      createTestTranslatedViolation({
        ruleId: `rule-${i}`,
        title: `Violation ${i}`,
      })
    );
    mockScanPage.mockResolvedValueOnce(
      createSuccessfulScanOutcome({ violations: manyViolations })
    );

    const uniqueIp = `10.0.6.${Math.floor(Math.random() * 255)}`;
    const req = createRequest({ url: 'https://example.com' }, uniqueIp);
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.violations).toHaveLength(10);
    expect(data.totalViolations).toBe(15);
  });

  it('should return 422 when scan fails', async () => {
    mockScanPage.mockResolvedValueOnce(createFailedScanOutcome('https://fail.com'));

    const uniqueIp = `10.0.7.${Math.floor(Math.random() * 255)}`;
    const req = createRequest({ url: 'https://fail.com' }, uniqueIp);
    const res = await POST(req);

    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('should return 400 for invalid JSON body', async () => {
    const uniqueIp = `10.0.8.${Math.floor(Math.random() * 255)}`;
    const req = new NextRequest('http://localhost:3000/api/scan/free', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': uniqueIp,
      },
      body: 'not json',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('Invalid request body');
  });
});
