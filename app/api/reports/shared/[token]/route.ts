import { NextRequest, NextResponse } from 'next/server';
import { getScanByShareToken } from '@/lib/supabase/queries';
import { createClient } from '@/lib/supabase/server';
import { generateComplianceReport } from '@/lib/reports/generate-pdf';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate token format
    if (!/^[A-Za-z0-9]{24}$/.test(token)) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Fetch scan data by share token (no auth required)
    const { data, error } = await getScanByShareToken(token);

    if (error || !data) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    const { scan, violations, siteName, siteUrl, agencySettings } = data;

    // Fetch the scan owner's profile for the PDF report template
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', scan.user_id)
      .single();

    // Build a minimal site object for the report generator
    const site = {
      id: scan.site_id,
      user_id: scan.user_id,
      url: siteUrl,
      name: siteName,
      is_active: true as const,
      scan_frequency: 'manual' as const,
      last_scanned_at: scan.completed_at,
      current_score: scan.score,
      total_violations: scan.total_violations,
      critical_violations: scan.critical_count,
      created_at: scan.created_at,
      updated_at: scan.created_at,
    };

    // Build a minimal profile if one wasn't found
    const reportProfile = profile ?? {
      id: scan.user_id,
      email: '',
      full_name: null,
      company_name: null,
      plan: 'free' as const,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      subscription_status: 'inactive' as const,
      sites_limit: 0,
      pages_per_site_limit: 0,
      created_at: scan.created_at,
      updated_at: scan.created_at,
    };

    // Generate PDF
    const pdfBuffer = await generateComplianceReport({
      scan,
      violations,
      site,
      profile: reportProfile,
      agencySettings,
    });

    const safeName = siteName.replace(/[^a-zA-Z0-9-_]/g, '_');
    const dateStr = new Date(scan.created_at)
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    const filename = `${safeName}-compliance-report-${dateStr}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('[GET /api/reports/shared] Unhandled error:', err);
    return NextResponse.json(
      { error: 'Failed to generate report. Please try again later.' },
      { status: 500 }
    );
  }
}
