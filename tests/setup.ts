import { vi } from 'vitest';
import type { Profile, Site, Scan, Violation } from '@/lib/types/database';
import type { PageScanOutcome, TranslatedViolation } from '@/lib/scanner/types';

// ============================================================================
// Mock Supabase client
// ============================================================================

const mockSupabaseAuth = {
  getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
  getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
};

const mockSupabaseQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  neq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockReturnThis(),
  then: vi.fn(),
};

export const mockSupabaseClient = {
  auth: mockSupabaseAuth,
  from: vi.fn().mockReturnValue(mockSupabaseQueryBuilder),
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}));

vi.mock('@/lib/supabase/client', () => ({
  createBrowserClient: vi.fn().mockReturnValue(mockSupabaseClient),
}));

// ============================================================================
// Mock Stripe
// ============================================================================

export const mockStripe = {
  webhooks: {
    constructEvent: vi.fn(),
  },
  customers: {
    create: vi.fn(),
    retrieve: vi.fn(),
  },
  subscriptions: {
    retrieve: vi.fn(),
    update: vi.fn(),
  },
  checkout: {
    sessions: {
      retrieve: vi.fn(),
    },
  },
};

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => mockStripe),
}));

// ============================================================================
// Mock Resend
// ============================================================================

export const mockResend = {
  emails: {
    send: vi.fn().mockResolvedValue({ id: 'mock-email-id' }),
  },
};

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => mockResend),
}));

vi.mock('@/lib/email/send', () => ({
  sendWelcomeEmail: vi.fn().mockResolvedValue(undefined),
  sendScanCompleteEmail: vi.fn().mockResolvedValue(undefined),
  sendNewViolationsEmail: vi.fn().mockResolvedValue(undefined),
  sendScoreImprovedEmail: vi.fn().mockResolvedValue(undefined),
  sendWeeklyDigestEmail: vi.fn().mockResolvedValue(undefined),
  sendTrialEndingEmail: vi.fn().mockResolvedValue(undefined),
}));

// ============================================================================
// Mock scanner (for API route tests — unit tests import directly)
// ============================================================================

vi.mock('@/lib/scanner/scan-page', () => ({
  scanPage: vi.fn(),
}));

vi.mock('@/lib/scanner/crawl-site', () => ({
  crawlSite: vi.fn(),
}));

// Also mock the barrel import used by free scan route
vi.mock('@/lib/scanner', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/scanner')>();
  return {
    ...actual,
    scanPage: vi.fn(),
  };
});

// ============================================================================
// Mock Supabase queries
// ============================================================================

vi.mock('@/lib/supabase/queries', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  getSites: vi.fn(),
  getSite: vi.fn(),
  createSite: vi.fn(),
  deleteSite: vi.fn(),
  updateSite: vi.fn(),
  getScans: vi.fn(),
  getLatestScan: vi.fn(),
  getScan: vi.fn(),
  getScanWithViolations: vi.fn(),
  createScan: vi.fn(),
  updateScan: vi.fn(),
  getLastScanTime: vi.fn(),
  getViolations: vi.fn(),
  insertViolations: vi.fn(),
  getDashboardStats: vi.fn(),
  getRecentScans: vi.fn(),
  insertScanPages: vi.fn(),
  getAgencySettings: vi.fn(),
  upsertAgencySettings: vi.fn(),
  getPreviousCompletedScan: vi.fn(),
  generateScanShareToken: vi.fn(),
  revokeScanShareToken: vi.fn(),
  getScanByShareToken: vi.fn(),
}));

// ============================================================================
// Helper: Create test fixtures
// ============================================================================

export function createTestUser(overrides: Partial<{ id: string; email: string }> = {}) {
  return {
    id: overrides.id ?? 'user-123',
    email: overrides.email ?? 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2025-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: {},
  };
}

export function createTestProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'user-123',
    email: 'test@example.com',
    full_name: 'Test User',
    company_name: 'Test Company',
    plan: 'free',
    stripe_customer_id: null,
    stripe_subscription_id: null,
    subscription_status: 'inactive',
    sites_limit: 1,
    pages_per_site_limit: 5,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createTestSite(overrides: Partial<Site> = {}): Site {
  return {
    id: 'site-123',
    user_id: 'user-123',
    url: 'https://example.com',
    name: 'Example Site',
    is_active: true,
    scan_frequency: 'manual',
    last_scanned_at: null,
    current_score: null,
    total_violations: 0,
    critical_violations: 0,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    ...overrides,
  };
}

export function createTestScan(overrides: Partial<Scan> = {}): Scan {
  return {
    id: 'scan-123',
    site_id: 'site-123',
    user_id: 'user-123',
    status: 'completed',
    score: 85,
    total_violations: 5,
    critical_count: 1,
    serious_count: 2,
    moderate_count: 1,
    minor_count: 1,
    pages_scanned: 3,
    pages_total: 3,
    resolved_count: 0,
    share_token: null,
    started_at: '2025-01-15T10:00:00Z',
    completed_at: '2025-01-15T10:05:00Z',
    error_message: null,
    created_at: '2025-01-15T10:00:00Z',
    ...overrides,
  };
}

export function createTestViolation(overrides: Partial<Violation> = {}): Violation {
  return {
    id: 'violation-123',
    scan_id: 'scan-123',
    site_id: 'site-123',
    page_url: 'https://example.com',
    rule_id: 'color-contrast',
    severity: 'serious',
    impact: 'People with low vision may not be able to read this text.',
    description: 'Text does not have enough contrast.',
    help_text: 'Increase the contrast ratio.',
    html_snippet: '<p style="color: #999">Low contrast text</p>',
    css_selector: 'p.low-contrast',
    wcag_criteria: ['1.4.3 Contrast (Minimum)'],
    is_new: true,
    created_at: '2025-01-15T10:05:00Z',
    ...overrides,
  };
}

export function createTestTranslatedViolation(
  overrides: Partial<TranslatedViolation> = {}
): TranslatedViolation {
  return {
    ruleId: 'color-contrast',
    title: 'Text Color Too Hard to Read',
    severity: 'serious',
    description: 'The text does not have enough contrast.',
    impact: 'People with low vision may not be able to read this text.',
    fix: 'Increase the contrast ratio between text and background.',
    wcagCriteria: ['1.4.3 Contrast (Minimum)'],
    htmlSnippets: ['<p style="color: #999">text</p>'],
    cssSelectors: ['p.low-contrast'],
    instanceCount: 1,
    ...overrides,
  };
}

export function createSuccessfulScanOutcome(
  overrides: Partial<{
    url: string;
    score: number;
    violations: TranslatedViolation[];
    pageTitle: string;
  }> = {}
): PageScanOutcome {
  return {
    success: true,
    result: {
      url: overrides.url ?? 'https://example.com',
      score: overrides.score ?? 85,
      violations: overrides.violations ?? [createTestTranslatedViolation()],
      pageTitle: overrides.pageTitle ?? 'Example Page',
      timestamp: new Date().toISOString(),
      passingRuleCount: 50,
      totalRuleCount: 55,
    },
  };
}

export function createFailedScanOutcome(url = 'https://example.com'): PageScanOutcome {
  return {
    success: false,
    error: {
      url,
      error: 'Failed to connect to the website.',
      errorCode: 'CONNECTION_REFUSED',
      timestamp: new Date().toISOString(),
    },
  };
}
