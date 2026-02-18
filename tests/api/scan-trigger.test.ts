import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import {
  createTestUser,
  createTestProfile,
  createTestSite,
  createTestScan,
  createTestTranslatedViolation,
} from '../setup';

// Import mocked modules
import { createClient } from '@/lib/supabase/server';
import {
  getSite,
  getProfile,
  createScan,
  updateScan,
  updateSite,
  insertViolations,
  insertScanPages,
  getLastScanTime,
  getViolations,
} from '@/lib/supabase/queries';

// Mock remoteScanSite — this is what the trigger route actually uses
const mockRemoteScanSite = vi.fn();
vi.mock('@/lib/scanner/remote-scan', () => ({
  remoteScanSite: mockRemoteScanSite,
}));

// Mock markNewViolations from compare
vi.mock('@/lib/scanner/compare', () => ({
  markNewViolations: vi.fn(),
}));

const { POST } = await import('@/app/api/scan/trigger/route');

const mockedCreateClient = vi.mocked(createClient);
const mockedGetSite = vi.mocked(getSite);
const mockedGetProfile = vi.mocked(getProfile);
const mockedCreateScan = vi.mocked(createScan);
const mockedUpdateScan = vi.mocked(updateScan);
const mockedUpdateSite = vi.mocked(updateSite);
const mockedInsertViolations = vi.mocked(insertViolations);
const mockedInsertScanPages = vi.mocked(insertScanPages);
const mockedGetLastScanTime = vi.mocked(getLastScanTime);
const mockedGetViolations = vi.mocked(getViolations);

function createRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/scan/trigger', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function setupAuthenticatedUser(userId = 'user-123') {
  const user = createTestUser({ id: userId });
  mockedCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user }, error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
  } as unknown as Awaited<ReturnType<typeof createClient>>);
}

function setupUnauthenticatedUser() {
  mockedCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  } as unknown as Awaited<ReturnType<typeof createClient>>);
}

/** Helper to create a RemoteMultiPageScanResult matching the route's expected shape */
function createRemoteScanResult(overrides: {
  url?: string;
  score?: number;
  pagesScanned?: number;
} = {}) {
  const url = overrides.url ?? 'https://example.com';
  const score = overrides.score ?? 85;
  const pagesScanned = overrides.pagesScanned ?? 1;
  const violation = createTestTranslatedViolation();

  return {
    crawl: {
      baseUrl: url,
      totalFound: pagesScanned,
      limitApplied: 10,
      skipped: [],
    },
    pages: [
      {
        success: true as const,
        result: {
          url,
          score,
          violations: [violation],
          pageTitle: 'Test Page',
          timestamp: new Date().toISOString(),
          passingRuleCount: 50,
          totalRuleCount: 55,
        },
      },
    ],
    summary: {
      overallScore: score,
      pagesScanned,
      pagesFailed: 0,
      totalPages: pagesScanned,
    },
  };
}

describe('POST /api/scan/trigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 for unauthenticated request', async () => {
    setupUnauthenticatedUser();

    const req = createRequest({ siteId: '550e8400-e29b-41d4-a716-446655440000' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.error).toBe('Authentication required');
  });

  it('should allow authenticated user to trigger scan', async () => {
    setupAuthenticatedUser('user-123');

    const site = createTestSite({ id: '550e8400-e29b-41d4-a716-446655440000' });
    const profile = createTestProfile({ plan: 'agency_starter', pages_per_site_limit: 10 });
    const scan = createTestScan({ id: 'new-scan-id', status: 'pending' });

    mockedGetSite.mockResolvedValue({ data: site, error: null } as never);
    mockedGetProfile.mockResolvedValue({ data: profile, error: null } as never);
    mockedCreateScan.mockResolvedValue({ data: scan, error: null } as never);
    mockedUpdateScan.mockResolvedValue({ data: scan, error: null } as never);
    mockedUpdateSite.mockResolvedValue({ data: site, error: null } as never);
    mockedInsertViolations.mockResolvedValue({ data: [], error: null } as never);
    mockedInsertScanPages.mockResolvedValue({ data: [], error: null } as never);
    mockedGetViolations.mockResolvedValue({ data: [], error: null } as never);

    mockRemoteScanSite.mockResolvedValue(
      createRemoteScanResult({ url: 'https://example.com', score: 90 })
    );

    const req = createRequest({ siteId: '550e8400-e29b-41d4-a716-446655440000' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.data).toBeDefined();
    expect(data.data.scanId).toBe('new-scan-id');
    expect(data.data.score).toBeDefined();
    expect(data.data.pagesScanned).toBe(1);
  });

  it('should return 404 when user tries to scan someone else\'s site', async () => {
    setupAuthenticatedUser('user-123');

    // getSite returns null (site not found for this user due to RLS)
    mockedGetSite.mockResolvedValue({ data: null, error: 'Not found' } as never);

    const req = createRequest({ siteId: '550e8400-e29b-41d4-a716-446655440000' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('should return 429 rate limit for free plan (1 per hour per site)', async () => {
    setupAuthenticatedUser('user-123');

    const site = createTestSite({ id: '550e8400-e29b-41d4-a716-446655440000' });
    const profile = createTestProfile({ plan: 'free' });

    mockedGetSite.mockResolvedValue({ data: site, error: null } as never);
    mockedGetProfile.mockResolvedValue({ data: profile, error: null } as never);

    // Last scan was 30 minutes ago (within 1 hour window)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    mockedGetLastScanTime.mockResolvedValue({ data: thirtyMinutesAgo, error: null } as never);

    const req = createRequest({ siteId: '550e8400-e29b-41d4-a716-446655440000' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(429);
    expect(data.error).toContain('Rate limit');
    expect(data.error).toContain('free plan');
  });

  it('should return 400 for invalid siteId format', async () => {
    setupAuthenticatedUser('user-123');

    const req = createRequest({ siteId: 'not-a-uuid' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it('should return 404 when profile not found', async () => {
    setupAuthenticatedUser('user-123');

    const site = createTestSite({ id: '550e8400-e29b-41d4-a716-446655440000' });
    mockedGetSite.mockResolvedValue({ data: site, error: null } as never);
    mockedGetProfile.mockResolvedValue({ data: null, error: null } as never);

    const req = createRequest({ siteId: '550e8400-e29b-41d4-a716-446655440000' });
    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(404);
    expect(data.error).toContain('Profile not found');
  });

  it('should not rate limit paid plans', async () => {
    setupAuthenticatedUser('user-123');

    const site = createTestSite({ id: '550e8400-e29b-41d4-a716-446655440000' });
    const profile = createTestProfile({ plan: 'agency_starter', pages_per_site_limit: 10 });
    const scan = createTestScan({ id: 'paid-scan-id' });

    mockedGetSite.mockResolvedValue({ data: site, error: null } as never);
    mockedGetProfile.mockResolvedValue({ data: profile, error: null } as never);
    mockedCreateScan.mockResolvedValue({ data: scan, error: null } as never);
    mockedUpdateScan.mockResolvedValue({ data: scan, error: null } as never);
    mockedUpdateSite.mockResolvedValue({ data: site, error: null } as never);
    mockedInsertViolations.mockResolvedValue({ data: [], error: null } as never);
    mockedInsertScanPages.mockResolvedValue({ data: [], error: null } as never);
    mockedGetViolations.mockResolvedValue({ data: [], error: null } as never);

    mockRemoteScanSite.mockResolvedValue(
      createRemoteScanResult({ url: 'https://example.com' })
    );

    // getLastScanTime should NOT be called for paid plans
    const req = createRequest({ siteId: '550e8400-e29b-41d4-a716-446655440000' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(mockedGetLastScanTime).not.toHaveBeenCalled();
  });
});
