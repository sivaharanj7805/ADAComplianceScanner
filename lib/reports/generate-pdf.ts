import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import type { Scan, Violation, Site, Profile, AgencySettings } from '@/lib/types/database';
import { ComplianceReportDocument } from '@/components/reports/ComplianceReportDocument';

export interface ReportData {
  scan: Scan;
  violations: Violation[];
  site: Site;
  profile: Profile;
  agencySettings: AgencySettings | null;
}

/**
 * Generate a professional PDF compliance report.
 *
 * Produces a multi-page document with:
 * - Cover page (branded or white-label)
 * - Executive summary with score and severity breakdown
 * - Full violation listing grouped by severity
 * - Top recommendations for remediation
 * - Footer on every page
 */
export async function generateComplianceReport(
  data: ReportData
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(ComplianceReportDocument, { data }) as any;
  const buffer = await renderToBuffer(element);
  return Buffer.from(buffer);
}
