import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { getScan, getViolations, getSite } from '@/lib/supabase/queries';
import ViolationsList from './ViolationsList';
import ExportButton from '@/components/reports/ExportButton';

interface ScanDetailContentProps {
  siteId: string;
  scanId: string;
  userId: string;
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400';
  if (score >= 80) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-600';
}

export default async function ScanDetailContent({
  siteId,
  scanId,
  userId,
}: ScanDetailContentProps) {
  const [{ data: scan }, { data: violations }, { data: site }] =
    await Promise.all([
      getScan(scanId, userId),
      getViolations(scanId, userId),
      getSite(siteId, userId),
    ]);

  if (!scan || !site) {
    notFound();
  }

  const duration =
    scan.started_at && scan.completed_at
      ? Math.round(
          (new Date(scan.completed_at).getTime() -
            new Date(scan.started_at).getTime()) /
            1000
        )
      : null;

  // Extract unique page URLs and WCAG criteria for filters
  const pageUrls = [...new Set(violations.map((v) => v.page_url))];
  const wcagCriteria = [
    ...new Set(violations.flatMap((v) => v.wcag_criteria)),
  ].sort();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href={`/dashboard/sites/${siteId}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to {site.name}
      </Link>

      {/* Scan header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Scan Results — {site.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {format(new Date(scan.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
          </p>
        </div>

        <ExportButton scanId={scanId} />
      </div>

      {/* Scan metadata */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Score</p>
          <p
            className={`mt-1 text-2xl font-bold ${getScoreColor(scan.score)}`}
          >
            {scan.score ?? '—'}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Violations</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scan.total_violations}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Pages Scanned</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {scan.pages_scanned}/{scan.pages_total}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Duration</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {duration !== null ? `${duration}s` : '—'}
          </p>
        </div>
      </div>

      {/* Severity summary bar */}
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-3.5 shadow-sm">
        <SeverityBadge label="Critical" count={scan.critical_count} color="red" />
        <SeverityBadge label="Serious" count={scan.serious_count} color="orange" />
        <SeverityBadge label="Moderate" count={scan.moderate_count} color="amber" />
        <SeverityBadge label="Minor" count={scan.minor_count} color="blue" />
      </div>

      {/* Violations list with filters */}
      {violations.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-emerald-600">
            No violations found!
          </p>
          <p className="mt-1 text-sm text-gray-500">
            This scan found no WCAG 2.1 AA accessibility violations.
          </p>
        </div>
      ) : (
        <ViolationsList
          violations={violations}
          pageUrls={pageUrls}
          wcagCriteria={wcagCriteria}
        />
      )}
    </div>
  );
}

function SeverityBadge({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: 'red' | 'orange' | 'amber' | 'blue';
}) {
  const styles = {
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  };

  const dotStyles = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium ${styles[color]}`}
    >
      <div className={`h-2 w-2 rounded-full ${dotStyles[color]}`} />
      {label}: {count}
    </div>
  );
}
