import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getScanWithViolations,
  getSite,
  getProfile,
  getAgencySettings,
} from '@/lib/supabase/queries';
import { generateComplianceReport } from '@/lib/reports/generate-pdf';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;

  // Authenticate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch scan + violations
  const { data: scanData, error: scanError } = await getScanWithViolations(
    scanId,
    user.id
  );

  if (scanError || !scanData) {
    return NextResponse.json(
      { error: scanError ?? 'Scan not found' },
      { status: 404 }
    );
  }

  const { scan, violations } = scanData;

  // Fetch site
  const { data: site, error: siteError } = await getSite(
    scan.site_id,
    user.id
  );

  if (siteError || !site) {
    return NextResponse.json(
      { error: siteError ?? 'Site not found' },
      { status: 404 }
    );
  }

  // Fetch profile
  const { data: profile, error: profileError } = await getProfile(user.id);

  if (profileError || !profile) {
    return NextResponse.json(
      { error: profileError ?? 'Profile not found' },
      { status: 500 }
    );
  }

  // Fetch agency settings (may be null for non-agency plans)
  const { data: agencySettings } = await getAgencySettings(user.id);

  // Generate PDF
  try {
    const pdfBuffer = await generateComplianceReport({
      scan,
      violations,
      site,
      profile,
      agencySettings,
    });

    const safeName = site.name.replace(/[^a-zA-Z0-9-_]/g, '_');
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
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (err) {
    console.error('PDF generation failed:', err);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
