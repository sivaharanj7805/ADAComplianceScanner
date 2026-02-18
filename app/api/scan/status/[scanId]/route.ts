import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getScan } from '@/lib/supabase/queries';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { scanId } = await params;

    const { data: scan, error } = await getScan(scanId, user.id);

    if (error || !scan) {
      return NextResponse.json(
        { error: error ?? 'Scan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: scan.status,
      score: scan.score,
      totalViolations: scan.total_violations,
      pagesScanned: scan.pages_scanned,
      pagesTotal: scan.pages_total,
      errorMessage: scan.error_message,
    });
  } catch (err) {
    console.error('[GET /api/scan/status/[scanId]] Unhandled error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
