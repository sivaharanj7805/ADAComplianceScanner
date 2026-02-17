import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { remoteScanPage } from '@/lib/scanner/remote-scan';
import type { TranslatedViolation } from '@/lib/scanner';

// ============================================================================
// Rate limiting (in-memory — upgrade to Redis/Upstash for production)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

// Periodically clean up expired entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(ip);
    }
  }
}, 10 * 60 * 1000); // Every 10 minutes

// ============================================================================
// Request validation
// ============================================================================

const scanRequestSchema = z.object({
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch {
          return false;
        }
      },
      { message: 'URL must start with http:// or https://' }
    ),
});

// ============================================================================
// Response types
// ============================================================================

interface FreeScanResponse {
  score: number;
  totalViolations: number;
  violations: TranslatedViolation[];
  pageTitle: string;
  scannedAt: string;
}

// ============================================================================
// POST handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. You can scan up to 10 pages per hour. Please try again later.',
        },
        { status: 429 }
      );
    }

    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body. Please send a JSON object with a "url" field.' },
        { status: 400 }
      );
    }

    const validation = scanRequestSchema.safeParse(body);
    if (!validation.success) {
      const message = validation.error.issues[0]?.message || 'Invalid URL';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { url } = validation.data;

    // Run the scan via the remote worker
    const outcome = await remoteScanPage(url);

    if (!outcome.success) {
      console.warn(`[POST /api/scan/free] Scan failed for ${url}:`, {
        errorCode: outcome.error.errorCode,
        error: outcome.error.error,
      });
      return NextResponse.json(
        { error: outcome.error.error },
        { status: 422 }
      );
    }

    const { result } = outcome;

    // Return top 10 violations only (incentivize upgrade for full results)
    const topViolations = result.violations.slice(0, 10);

    const response: FreeScanResponse = {
      score: result.score,
      totalViolations: result.violations.length,
      violations: topViolations,
      pageTitle: result.pageTitle,
      scannedAt: result.timestamp,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error('[POST /api/scan/free] Unhandled error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
